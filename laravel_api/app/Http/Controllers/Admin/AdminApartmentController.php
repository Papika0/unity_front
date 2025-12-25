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
use App\Models\Image;
use App\Models\Project;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class AdminApartmentController extends Controller
{
    public function __construct(
        protected ImageService $imageService
    ) {}

    /**
     * List apartments with filters
     */
    public function index(Request $request, int $projectId, int $buildingId): AnonymousResourceCollection
    {
        $building = Building::where('project_id', $projectId)
            ->where('id', $buildingId)
            ->firstOrFail();

        $query = Apartment::where('building_id', $buildingId)
            ->with(['image2d', 'image3d']);

        // Filter by floor
        if ($request->has('floor_number')) {
            $query->where('floor_number', $request->input('floor_number'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Sort by floor (ascending) and apartment number (ascending)
        // Use CAST to sort apartment_number numerically instead of alphabetically
        $query->orderBy('floor_number', 'asc')
            ->orderByRaw('CAST(apartment_number AS UNSIGNED) asc');

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

        // Find the actual header row (smart detection for non-standard Excel files)
        $headerRowIndex = 0;
        foreach ($rows as $index => $row) {
            $rowLower = array_map(function ($v) {
                return strtolower(trim($v ?? ''));
            }, $row);
            // Check if row contains typical header keywords
            if (in_array('area status', $rowLower) || in_array('floor', $rowLower) || in_array('apartment', $rowLower)) {
                $headerRowIndex = $index;
                break;
            }
        }

        // Extract headers and remove all rows before and including header
        $headers = $rows[$headerRowIndex];
        $rows = array_slice($rows, $headerRowIndex + 1);

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
            'apartment_number' => ['apartment_number', 'apartment', 'number', 'area status', 'ბინის ნომერი', 'ნომერი'],
            'cadastral_code' => ['cadastral_code', 'cadastral', 'individual cadastral code of real estate (if any)', 'individual cadastral code'],
            'area_total' => ['area_total', 'total_area', 'area', 'total area', 'ფართობი'],
            'area_living' => ['area_living', 'living_area', 'living space', 'საცხოვრებელი ფართი'],
            'summer_area' => ['summer_area', 'summer/auxiliary area', 'balcony_area'],
            'bedrooms' => ['bedrooms', 'rooms', 'number of bedrooms', 'საძინებელი'],
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
                    if (in_array($field, ['has_balcony', 'is_parking'])) {
                        $data[$field] = in_array(strtolower($value), ['yes', '1', 'true', 'კი', 'ხო']);
                    } elseif ($field === 'apartment_number' && !empty($value)) {
                        // Check if this is a parking lot entry (e.g., "Parking lot #1")
                        if (preg_match('/parking\s+lot\s+#?(\d+)/i', $value, $matches)) {
                            $data[$field] = 'P' . $matches[1]; // Store as P1, P2, etc.
                            $data['is_parking'] = true; // Mark as parking lot
                        }
                        // Extract number from "Apartment No. X" format
                        elseif (preg_match('/No\.\s*(\d+)/i', $value, $matches)) {
                            $data[$field] = $matches[1];
                            $data['is_parking'] = false;
                        } elseif (preg_match('/(\d+)/', $value, $matches)) {
                            $data[$field] = $matches[1];
                            $data['is_parking'] = false;
                        } else {
                            $data[$field] = $value;
                        }
                    } else {
                        $data[$field] = $value;
                    }
                    break;
                }
            }
        }

        // Count bedrooms and bathrooms from individual room columns
        $bedroomsCount = 0;
        $bathroomsCount = 0;
        $roomDetails = [
            'bedrooms' => [],
            'bathrooms' => [],
            'other_rooms' => []
        ];

        foreach ($headers as $index => $header) {
            $headerLower = strtolower(trim($header));
            $value = $row[$index] ?? null;

            // Skip empty values
            if (empty($value)) {
                continue;
            }

            // Count and store bedroom areas
            if (preg_match('/bedroom\s+(\d+)/i', $headerLower, $matches)) {
                $bedroomsCount++;
                $roomDetails['bedrooms']['bedroom_' . $matches[1]] = (float) $value;
            }
            // Count and store bathroom areas
            elseif (preg_match('/bathroom\s+(\d+)/i', $headerLower, $matches)) {
                $bathroomsCount++;
                $roomDetails['bathrooms']['bathroom_' . $matches[1]] = (float) $value;
            }
            // Store other room areas
            elseif (preg_match('/(studio|living room|guest room|entrance|dressing room|kitchen|auxiliary room|entrance hall)/i', $headerLower)) {
                $key = str_replace([' ', '/', '-'], '_', strtolower(trim($headerLower)));
                $roomDetails['other_rooms'][$key] = (float) $value;
            }
        }

        // Set bedroom and bathroom counts
        $data['bedrooms'] = $bedroomsCount > 0 ? $bedroomsCount : null;
        $data['bathrooms'] = $bathroomsCount > 0 ? $bathroomsCount : null;

        // Set room details JSON
        if (!empty($roomDetails['bedrooms']) || !empty($roomDetails['bathrooms']) || !empty($roomDetails['other_rooms'])) {
            $data['room_details'] = json_encode($roomDetails);
        }

        // Set has_balcony based on summer_area
        if (isset($data['summer_area']) && $data['summer_area'] > 0) {
            $data['has_balcony'] = true;
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

        $data = [
            'project_id' => $projectId,
            'building_id' => $buildingId,
            'floor_number' => $request->input('floor_number'),
            'apartment_number' => $request->input('apartment_number'),
            'cadastral_code' => $request->input('cadastral_code'),
            'status' => $request->input('status', 'available'),
            'price' => $request->input('price'),
            'area_total' => $request->input('area_total'),
            'area_living' => $request->input('area_living'),
            'summer_area' => $request->input('summer_area'),
            'bedrooms' => $request->input('bedrooms'),
            'bathrooms' => $request->input('bathrooms'),
            'has_balcony' => $request->input('has_balcony', false),
            'is_parking' => $request->input('is_parking', false),
            'ocr_confidence' => $request->input('ocr_confidence'),
            'ocr_text_position' => $request->input('ocr_text_position'),
        ];

        // Handle room_details as JSON
        if ($request->has('room_details') && $request->input('room_details')) {
            $data['room_details'] = is_array($request->input('room_details'))
                ? json_encode($request->input('room_details'))
                : $request->input('room_details');
        }

        $apartment = Apartment::create($data);

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

        $data = $request->validated();

        // Handle room_details as JSON
        if (isset($data['room_details']) && $data['room_details']) {
            $data['room_details'] = is_array($data['room_details'])
                ? json_encode($data['room_details'])
                : $data['room_details'];
        }

        $apartment->update($data);

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

    /**
     * Upload 2D/3D images for an apartment
     */
    public function uploadImages(Request $request, int $apartmentId): JsonResponse
    {
        $request->validate([
            'image_2d' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:20480',
            'image_3d' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:20480',
        ]);

        $apartment = Apartment::with(['image2d', 'image3d'])->findOrFail($apartmentId);

        try {
            DB::beginTransaction();

            // Handle 2D image upload
            if ($request->hasFile('image_2d')) {
                // Remove existing 2D image if exists
                if ($apartment->image2d->first()) {
                    $this->imageService->detachImage(
                        $apartment->image2d->first(),
                        $apartment,
                        '2d'
                    );
                }

                // Upload new 2D image
                $image = $this->imageService->uploadImage(
                    $request->file('image_2d'),
                    'Apartment ' . $apartment->apartment_number . ' - 2D',
                    'apartments'
                );
                $this->imageService->attachImage($image, $apartment, '2d');
            }

            // Handle 3D image upload
            if ($request->hasFile('image_3d')) {
                // Remove existing 3D image if exists
                if ($apartment->image3d->first()) {
                    $this->imageService->detachImage(
                        $apartment->image3d->first(),
                        $apartment,
                        '3d'
                    );
                }

                // Upload new 3D image
                $image = $this->imageService->uploadImage(
                    $request->file('image_3d'),
                    'Apartment ' . $apartment->apartment_number . ' - 3D',
                    'apartments'
                );
                $this->imageService->attachImage($image, $apartment, '3d');
            }

            DB::commit();

            // Reload apartment with images
            $apartment->load(['image2d', 'image3d']);

            return response()->json([
                'success' => true,
                'message' => 'Images uploaded successfully',
                'data' => new AdminApartmentResource($apartment),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Image upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an image from an apartment
     */
    public function deleteImage(int $apartmentId, int $imageId): JsonResponse
    {
        $apartment = Apartment::findOrFail($apartmentId);
        $image = Image::findOrFail($imageId);

        try {
            $this->imageService->detachImage($image, $apartment);

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Image deletion failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Batch upload images from folder structure
     * Expected structure: /Floor X/Apartment Y/2d.jpg or 3d.jpg
     */
    public function batchUploadImages(Request $request, int $projectId, int $buildingId): JsonResponse
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'image|mimes:jpeg,png,jpg,webp|max:20480',
            'paths' => 'nullable|array', // Allow explicit paths
            'paths.*' => 'nullable|string',
        ]);

        $building = Building::where('project_id', $projectId)
            ->where('id', $buildingId)
            ->with(['project']) // Eager load project for folder definition
            ->firstOrFail();

        $uploaded = 0;
        $failed = 0;
        $errors = [];

        try {
            DB::beginTransaction();

            $files = $request->file('files', []);
            $paths = $request->input('paths', []);

            foreach ($files as $index => $file) {
                // Use explicit path if provided (preferred), otherwise fallback to filename
                // This fixes the issue where browsers/servers strip directory paths from filenames
                $path = $paths[$index] ?? $file->getClientOriginalName();

                // Try to parse the path for floor/apartment/type
                $parsed = $this->parseBatchImagePath($path);

                if (!$parsed) {
                    $errors[] = "Could not parse path information (Type/Floor/Apt) from: {$path}";
                    $failed++;
                    continue;
                }

                // Find the apartment
                $apartment = Apartment::where('building_id', $buildingId)
                    ->where('floor_number', $parsed['floor'])
                    ->where('apartment_number', $parsed['apartment'])
                    ->first();

                if (!$apartment) {
                    $errors[] = "Apartment not found: Floor {$parsed['floor']}, Apt {$parsed['apartment']} (Path: {$path})";
                    $failed++;
                    continue;
                }

                // Construct organized storage path
                // Structure: apartments/project_name/building_name/floor_X/apt_Y/type
                $projectName = str_replace(['/', '\\', ' '], '_', $building->project->name ?? 'project_' . $projectId);
                $buildingName = str_replace(['/', '\\', ' '], '_', $building->name ?? 'building_' . $buildingId);

                $storagePath = "apartments/{$projectName}/{$buildingName}/floor_{$parsed['floor']}/apt_{$apartment->apartment_number}";

                // Upload the image
                $image = $this->imageService->uploadImage(
                    $file,
                    "Apartment {$apartment->apartment_number} - " . strtoupper($parsed['type']),
                    $storagePath
                );

                // Remove existing image of the same type
                $existingRelation = $parsed['type'] === '2d' ? 'image2d' : 'image3d';
                if ($apartment->$existingRelation->first()) {
                    $this->imageService->detachImage(
                        $apartment->$existingRelation->first(),
                        $apartment,
                        $parsed['type']
                    );
                }

                // Attach new image
                $this->imageService->attachImage($image, $apartment, $parsed['type']);
                $uploaded++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Batch upload complete: {$uploaded} uploaded, {$failed} failed",
                'data' => [
                    'uploaded' => $uploaded,
                    'failed' => $failed,
                    'errors' => $errors,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Batch upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Parse batch image path to extract floor, apartment, and type
     */
    private function parseBatchImagePath(string $path): ?array
    {
        // Type detection from path - look for 2D or 3D in folder names
        $type = null;
        if (preg_match('/2D|2d/', $path)) {
            $type = '2d';
        } elseif (preg_match('/3D|3d/', $path)) {
            $type = '3d';
        }

        if (!$type) {
            return null;
        }

        // Floor extraction - matches patterns like "7 სართული", "Floor 7", "სართული 7"
        $floor = null;
        if (preg_match('/(\d+)\s*(?:სართული|სათული|floor)/i', $path, $matches)) {
            $floor = (int) $matches[1];
        } elseif (preg_match('/(?:სართული|სათული|floor)\s*(\d+)/i', $path, $matches)) {
            $floor = (int) $matches[1];
        }

        // Apartment extraction - matches patterns like "ბინა 70", "bina 70", "70.png"
        $apartment = null;

        // First try to extract from filename (e.g., "7. bina 70 sul 58.05.png")
        $filename = basename($path);

        // Priority 1: Explicit "bina/apartment" keyword followed by number (handles "5. bina 54 ...")
        if (preg_match('/(?:ბინა|bina|apartment)\s*(\d+)/i', $filename, $matches)) {
            $apartment = $matches[1];
        }
        // Priority 2: "Number. Number" format (e.g. "5. 54.png" -> 54)
        elseif (preg_match('/^\d+\.\s*(\d+)/i', $filename, $matches)) {
            $apartment = $matches[1];
        }
        // Priority 3: Simple number (e.g. "54.png")
        elseif (preg_match('/^(\d+)\.(?:png|jpg|jpeg|webp)$/i', $filename, $matches)) {
            $apartment = $matches[1];
        }

        if (!$floor || !$apartment) {
            return null;
        }

        return [
            'type' => $type,
            'floor' => $floor,
            'apartment' => $apartment,
        ];
    }
}
