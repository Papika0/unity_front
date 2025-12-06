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
     * Bulk import apartments from CSV/Excel or JSON
     */
    public function bulkImport(BulkImportApartmentsRequest $request, int $projectId, int $buildingId): JsonResponse
    {
        $building = Building::where('project_id', $projectId)
            ->where('id', $buildingId)
            ->firstOrFail();

        $imported = 0;
        $errors = [];

        try {
            DB::beginTransaction();

            // Check if this is a file upload or JSON request
            if ($request->hasFile('file')) {
                // Process Excel/CSV file
                $result = $this->processExcelImport($request->file('file'), $projectId, $buildingId);
            } else {
                // Process JSON data
                $result = $this->processJsonImport($request->input('apartments', []), $projectId, $buildingId);
            }

            $imported = $result['imported'];
            $errors = $result['errors'];

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
     * Process Excel/CSV file import
     */
    private function processExcelImport($file, int $projectId, int $buildingId): array
    {
        $imported = 0;
        $errors = [];

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
                $data = $this->mapExcelRowToData($row, $headers, $projectId, $buildingId);

                // Validate required fields
                if (empty($data['floor_number']) || empty($data['apartment_number'])) {
                    $errors[] = "Row {$rowNumber}: Missing floor number or apartment number";
                    continue;
                }

                // Create or update apartment
                $this->upsertApartment($data);

                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row {$rowNumber}: " . $e->getMessage();
            }
        }

        return ['imported' => $imported, 'errors' => $errors];
    }

    /**
     * Process JSON data import
     */
    private function processJsonImport(array $apartments, int $projectId, int $buildingId): array
    {
        $imported = 0;
        $errors = [];

        foreach ($apartments as $index => $apartmentData) {
            $rowNumber = $index + 1;

            try {
                // Map JSON fields
                $data = $this->mapJsonRowToData($apartmentData, $projectId, $buildingId);

                // Validate required fields
                if (empty($data['floor_number'])) {
                    $errors[] = "Row {$rowNumber}: Missing floor number";
                    continue;
                }

                // Create or update apartment
                $this->upsertApartment($data);

                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row {$rowNumber}: " . $e->getMessage();
            }
        }

        return ['imported' => $imported, 'errors' => $errors];
    }

    /**
     * Upsert apartment using cadastral code or building+floor+number
     */
    private function upsertApartment(array $data): void
    {
        // Use cadastral code if available, otherwise use building+floor+apartment_number
        if (!empty($data['cadastral_code'])) {
            Apartment::updateOrCreate(
                ['cadastral_code' => $data['cadastral_code']],
                $data
            );
        } else {
            Apartment::updateOrCreate(
                [
                    'building_id' => $data['building_id'],
                    'floor_number' => $data['floor_number'],
                    'apartment_number' => $data['apartment_number'],
                ],
                $data
            );
        }
    }

    /**
     * Map spreadsheet row to apartment data (Excel/CSV)
     */
    private function mapExcelRowToData(array $row, array $headers, int $projectId, int $buildingId): array
    {
        $data = [];
        $mapping = [
            'floor_number' => ['floor_number', 'floor', 'სართული'],
            'apartment_number' => ['apartment_number', 'apartment', 'number', 'ბინის ნომერი', 'ნომერი'],
            'cadastral_code' => ['cadastral_code', 'cadastral'],
            'area_total' => ['area_total', 'total_area', 'area', 'ფართობი'],
            'area_living' => ['area_living', 'living_area', 'საცხოვრებელი ფართი'],
            'summer_area' => ['summer_area', 'summer/auxiliary area', 'balcony_area'],
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

        // Add project and building IDs
        $data['project_id'] = $projectId;
        $data['building_id'] = $buildingId;
        $data['status'] = $data['status'] ?? 'available';

        return $data;
    }

    /**
     * Map JSON data to apartment data
     */
    private function mapJsonRowToData(array $row, int $projectId, int $buildingId): array
    {
        // Extract apartment number from "Area status" field
        $apartmentNumber = $this->extractApartmentNumber($row['Area status'] ?? '');

        // Calculate bathrooms count from individual bathroom fields
        $bathroomsCount = $this->countBathrooms($row);

        // Determine has_balcony from summer area
        $summerArea = !empty($row['Summer/auxiliary area']) ? (float) $row['Summer/auxiliary area'] : 0;
        $hasBalcony = $summerArea > 0;

        // Build room details JSON
        $roomDetails = $this->buildRoomDetails($row);

        return [
            'project_id' => $projectId,
            'building_id' => $buildingId,
            'cadastral_code' => $row['Individual cadastral code of real estate (if any)'] ?? null,
            'floor_number' => (int) ($row['Floor'] ?? 0),
            'apartment_number' => $apartmentNumber,
            'area_total' => !empty($row['Total area']) ? (float) $row['Total area'] : null,
            'area_living' => !empty($row['Living space']) ? (float) $row['Living space'] : null,
            'summer_area' => $summerArea > 0 ? $summerArea : null,
            'bedrooms' => !empty($row['Number of bedrooms']) ? (int) $row['Number of bedrooms'] : 0,
            'bathrooms' => $bathroomsCount,
            'has_balcony' => $hasBalcony,
            'has_parking' => false, // Parking sold separately
            'room_details' => $roomDetails,
            'status' => 'available', // Default status
            'is_active' => true,
        ];
    }

    /**
     * Extract apartment number from "Apartment No. X" format
     */
    private function extractApartmentNumber(string $areaStatus): string
    {
        // Try to extract number from "Apartment No. 1" or similar formats
        if (preg_match('/No\.\s*(\d+)/i', $areaStatus, $matches)) {
            return $matches[1];
        }

        // Try to extract just numbers
        if (preg_match('/(\d+)/', $areaStatus, $matches)) {
            return $matches[1];
        }

        // Return full string if no number found
        return $areaStatus ?: 'N/A';
    }

    /**
     * Count non-empty bathroom fields
     */
    private function countBathrooms(array $row): int
    {
        $count = 0;
        for ($i = 1; $i <= 4; $i++) {
            $key = "Bathroom {$i}";
            if (isset($row[$key]) && !empty(trim((string) $row[$key]))) {
                $count++;
            }
        }
        return $count;
    }

    /**
     * Build room details JSON from individual room fields
     */
    private function buildRoomDetails(array $row): array
    {
        $details = [];

        // Map basic room fields
        $roomFields = [
            'Studio/Living Room' => 'studio_living',
            'Guest room' => 'guest_room',
            'Kitchen' => 'kitchen',
            'Dressing room' => 'dressing_room',
            'Entrance' => 'entrance',
            'Auxiliary room' => 'auxiliary_room',
        ];

        foreach ($roomFields as $jsonKey => $mappedKey) {
            if (isset($row[$jsonKey]) && !empty(trim((string) $row[$jsonKey]))) {
                $details[$mappedKey] = (float) $row[$jsonKey];
            }
        }

        // Handle bedrooms 1-6
        for ($i = 1; $i <= 6; $i++) {
            $key = "Bedroom {$i}";
            if (isset($row[$key]) && !empty(trim((string) $row[$key]))) {
                $details["bedroom_{$i}"] = (float) $row[$key];
            }
        }

        // Handle bathrooms 1-4 with their areas
        for ($i = 1; $i <= 4; $i++) {
            $key = "Bathroom {$i}";
            if (isset($row[$key]) && !empty(trim((string) $row[$key]))) {
                $details["bathroom_{$i}"] = (float) $row[$key];
            }
        }

        // Entrance hall
        if (isset($row['Entrance hall']) && !empty(trim((string) $row['Entrance hall']))) {
            $details['entrance_hall'] = (float) $row['Entrance hall'];
        }

        return $details;
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
