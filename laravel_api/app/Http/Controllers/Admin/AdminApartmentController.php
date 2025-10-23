<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreApartmentRequest;
use App\Http\Requests\Admin\UpdateApartmentRequest;
use App\Http\Requests\Admin\BulkImportApartmentsRequest;
use App\Http\Requests\Admin\UpdateApartmentStatusRequest;
use App\Http\Resources\Admin\AdminApartmentResource;
use App\Models\Apartment;
use App\Models\Building;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class AdminApartmentController extends Controller
{
    /**
     * List apartments with filters
     */
    public function index(Request $request, int $projectId, int $buildingId): AnonymousResourceCollection
    {
        $building = Building::where('project_id', $projectId)
            ->where('id', $buildingId)
            ->firstOrFail();

        $query = Apartment::where('building_id', $buildingId);

        // Filter by floor
        if ($request->has('floor_number')) {
            $query->where('floor_number', $request->input('floor_number'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Sort
        $query->orderBy('floor_number', 'desc')
            ->orderBy('apartment_number');

        $apartments = $query->paginate($request->input('per_page', 50));

        return AdminApartmentResource::collection($apartments);
    }

    /**
     * Bulk import apartments from CSV/Excel
     */
    public function bulkImport(BulkImportApartmentsRequest $request, int $projectId, int $buildingId): JsonResponse
    {
        $building = Building::where('project_id', $projectId)
            ->where('id', $buildingId)
            ->firstOrFail();

        $file = $request->file('file');
        $imported = 0;
        $errors = [];

        try {
            DB::beginTransaction();

            // Load spreadsheet
            $spreadsheet = IOFactory::load($file->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Skip header row
            $headers = array_shift($rows);

            foreach ($rows as $index => $row) {
                $rowNumber = $index + 2; // +2 because we skipped header and arrays are 0-indexed

                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                try {
                    // Map columns
                    $data = $this->mapRowToData($row, $headers);

                    // Validate required fields
                    if (empty($data['floor_number']) || empty($data['apartment_number'])) {
                        $errors[] = "Row {$rowNumber}: Missing floor number or apartment number";
                        continue;
                    }

                    // Create or update apartment
                    Apartment::updateOrCreate(
                        [
                            'building_id' => $buildingId,
                            'floor_number' => $data['floor_number'],
                            'apartment_number' => $data['apartment_number'],
                        ],
                        [
                            'project_id' => $projectId,
                            'status' => $data['status'] ?? 'available',
                            'price' => $data['price'] ?? null,
                            'area_total' => $data['area_total'] ?? null,
                            'area_living' => $data['area_living'] ?? null,
                            'bedrooms' => $data['bedrooms'] ?? null,
                            'bathrooms' => $data['bathrooms'] ?? null,
                            'has_balcony' => $data['has_balcony'] ?? false,
                            'has_parking' => $data['has_parking'] ?? false,
                        ]
                    );

                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Row {$rowNumber}: " . $e->getMessage();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully imported {$imported} apartments",
                'data' => [
                    'imported_count' => $imported,
                    'error_count' => count($errors),
                    'errors' => $errors,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Map spreadsheet row to apartment data
     */
    private function mapRowToData(array $row, array $headers): array
    {
        $data = [];
        $mapping = [
            'floor_number' => ['floor_number', 'floor', 'სართული'],
            'apartment_number' => ['apartment_number', 'apartment', 'number', 'ბინის ნომერი', 'ნომერი'],
            'area_total' => ['area_total', 'total_area', 'area', 'ფართობი'],
            'area_living' => ['area_living', 'living_area', 'საცხოვრებელი ფართი'],
            'bedrooms' => ['bedrooms', 'rooms', 'საძინებელი'],
            'bathrooms' => ['bathrooms', 'bath', 'სააბაზანო'],
            'price' => ['price', 'ფასი'],
            'status' => ['status', 'სტატუსი'],
            'has_balcony' => ['has_balcony', 'balcony', 'აივანი'],
            'has_parking' => ['has_parking', 'parking', 'პარკინგი'],
        ];

        foreach ($headers as $index => $header) {
            $header = strtolower(trim($header));
            $value = $row[$index] ?? null;

            foreach ($mapping as $field => $possibleNames) {
                if (in_array($header, array_map('strtolower', $possibleNames))) {
                    // Convert boolean fields
                    if (in_array($field, ['has_balcony', 'has_parking'])) {
                        $data[$field] = in_array(strtolower($value), ['yes', '1', 'true', 'კი', 'ხო']);
                    } else {
                        $data[$field] = $value;
                    }
                    break;
                }
            }
        }

        return $data;
    }

    /**
     * Create single apartment
     */
    public function store(StoreApartmentRequest $request, int $projectId, int $buildingId): JsonResponse
    {
        $building = Building::where('project_id', $projectId)
            ->where('id', $buildingId)
            ->firstOrFail();

        $apartment = Apartment::create([
            'project_id' => $projectId,
            'building_id' => $buildingId,
            'floor_number' => $request->input('floor_number'),
            'apartment_number' => $request->input('apartment_number'),
            'status' => $request->input('status', 'available'),
            'price' => $request->input('price'),
            'area_total' => $request->input('area_total'),
            'area_living' => $request->input('area_living'),
            'bedrooms' => $request->input('bedrooms'),
            'bathrooms' => $request->input('bathrooms'),
            'has_balcony' => $request->input('has_balcony', false),
            'has_parking' => $request->input('has_parking', false),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Apartment created successfully',
            'data' => new AdminApartmentResource($apartment),
        ], 201);
    }

    /**
     * Update apartment
     */
    public function update(UpdateApartmentRequest $request, int $apartmentId): JsonResponse
    {
        $apartment = Apartment::findOrFail($apartmentId);

        $apartment->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Apartment updated successfully',
            'data' => new AdminApartmentResource($apartment),
        ]);
    }

    /**
     * Quick status update
     */
    public function updateStatus(UpdateApartmentStatusRequest $request, int $apartmentId): JsonResponse
    {
        $apartment = Apartment::findOrFail($apartmentId);

        $apartment->update([
            'status' => $request->input('status'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => new AdminApartmentResource($apartment),
        ]);
    }

    /**
     * Delete apartment
     */
    public function destroy(int $apartmentId): JsonResponse
    {
        $apartment = Apartment::findOrFail($apartmentId);
        
        $apartment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Apartment deleted successfully',
        ]);
    }

    /**
     * Download CSV template
     */
    public function downloadTemplate(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $headers = [
            'floor_number',
            'apartment_number',
            'area_total',
            'area_living',
            'bedrooms',
            'bathrooms',
            'price',
            'status',
            'has_balcony',
            'has_parking',
        ];

        $filename = 'apartment_import_template.csv';
        $handle = fopen('php://temp', 'w');
        fputcsv($handle, $headers);

        // Add example row
        fputcsv($handle, [
            '5',
            '501',
            '85.5',
            '75.2',
            '2',
            '1',
            '150000',
            'available',
            'yes',
            'no',
        ]);

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response()->streamDownload(function () use ($csv) {
            echo $csv;
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
