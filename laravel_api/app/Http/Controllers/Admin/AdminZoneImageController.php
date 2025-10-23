<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ZoneImage;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminZoneImageController extends Controller
{
    public function __construct(
        private ImageService $imageService
    ) {}
    
    /**
     * ==========================================
     * GLOBAL ROUTES (project_id in body/query)
     * ==========================================
     */
    
    /**
     * Get zone images with filters (global endpoint)
     * Expects project_id in query parameter
     */
    public function indexGlobal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|integer|exists:projects,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $projectId = $request->input('project_id');
        
        return $this->index($request, $projectId);
    }
    
    /**
     * Create a new zone image (global endpoint)
     * Expects project_id in request body
     */
    public function storeGlobal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|integer|exists:projects,id',
            'level_type' => 'required|in:overview,building,floor',
            'image_type' => 'required|string|in:background,overlay,annotation',
            'building_id' => 'nullable|integer|exists:buildings,id',
            'floor_number' => 'nullable|integer',
            'viewbox' => 'required|string', // e.g., "0 0 1000 800"
            'width' => 'nullable|integer',
            'height' => 'nullable|integer',
            'image' => 'required|image|mimes:jpeg,jpg,png,webp,svg|max:10240', // Max 10MB
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $validated = $validator->validated();
        $projectId = $validated['project_id'];
        $levelType = $validated['level_type'];
        $imageType = $validated['image_type'];
        
        // Parse viewbox to extract width and height if not provided
        $viewboxParts = explode(' ', $validated['viewbox']);
        $width = $validated['width'] ?? (isset($viewboxParts[2]) ? (int)$viewboxParts[2] : 1920);
        $height = $validated['height'] ?? (isset($viewboxParts[3]) ? (int)$viewboxParts[3] : 1080);
        
        DB::beginTransaction();
        
        try {
            // Delete existing zone images with same project_id, level_type, and image_type
            // to prevent duplicates
            $existingImages = ZoneImage::where('project_id', $projectId)
                ->where('level_type', $levelType)
                ->where('image_type', $imageType)
                ->when($validated['building_id'] ?? null, function ($q, $buildingId) {
                    $q->where('building_id', $buildingId);
                })
                ->when($validated['floor_number'] ?? null, function ($q, $floorNum) {
                    $q->where('floor_number', $floorNum);
                })
                ->get();
                
            foreach ($existingImages as $existingImage) {
                // Delete associated images from storage
                foreach ($existingImage->images as $image) {
                    $this->imageService->deleteImage($image);
                }
                $existingImage->delete();
            }
            
            // Upload and process image using ImageService
            $imageRecord = $this->imageService->storeImage(
                $request->file('image'),
                'zone-images',
                $projectId
            );
            
            // Create zone image record
            $zoneImage = ZoneImage::create([
                'project_id' => $projectId,
                'level_type' => $levelType,
                'building_id' => $validated['building_id'] ?? null,
                'floor_number' => $validated['floor_number'] ?? null,
                'image_type' => $imageType,
                'viewbox' => $validated['viewbox'],
                'width' => $width,
                'height' => $height,
                'sort_order' => 0,
            ]);
            
            // Attach image to zone image
            $zoneImage->images()->attach($imageRecord->id);
            
            DB::commit();
            
            // Return with image URL
            $zoneImage->load('images');
            $imageUrl = $zoneImage->images->first()?->url ?? null;
            
            return response()->json([
                'success' => true,
                'message' => 'Zone image created successfully',
                'data' => $zoneImage,
                'image_url' => $imageUrl, // For backward compatibility
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create zone image: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Get a single zone image (global endpoint)
     */
    public function showGlobal(int $zoneImageId)
    {
        $zoneImage = ZoneImage::where('id', $zoneImageId)
            ->with(['images'])
            ->firstOrFail();
        
        return response()->json([
            'success' => true,
            'data' => $zoneImage,
        ]);
    }
    
    /**
     * Update an existing zone image (global endpoint)
     */
    public function updateGlobal(Request $request, int $zoneImageId)
    {
        $zoneImage = ZoneImage::where('id', $zoneImageId)
            ->firstOrFail();
        
        return $this->update($request, $zoneImage->project_id, $zoneImageId);
    }
    
    /**
     * Delete a zone image (global endpoint)
     */
    public function destroyGlobal(int $zoneImageId)
    {
        $zoneImage = ZoneImage::where('id', $zoneImageId)
            ->firstOrFail();
        
        return $this->destroy($zoneImage->project_id, $zoneImageId);
    }
    
    /**
     * ==========================================
     * PROJECT-SPECIFIC ROUTES (project_id in URL)
     * ==========================================
     */
    
    /**
     * Get zone images for a project with optional filters
     */
    public function index(Request $request, int $projectId)
    {
        $query = ZoneImage::where('project_id', $projectId);
        
        // Filter by level type
        if ($request->has('level_type')) {
            $query->where('level_type', $request->input('level_type'));
        }
        
        // Filter by building
        if ($request->has('building_id')) {
            $query->where('building_id', $request->input('building_id'));
        }
        
        // Filter by floor
        if ($request->has('floor_number')) {
            $query->where('floor_number', $request->input('floor_number'));
        }
        
        // Filter by image type
        if ($request->has('image_type')) {
            $query->where('image_type', $request->input('image_type'));
        }
        
        $zoneImages = $query->with(['images'])->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $zoneImages,
        ]);
    }
    
    /**
     * Get a single zone image
     */
    public function show(int $projectId, int $zoneImageId)
    {
        $zoneImage = ZoneImage::where('project_id', $projectId)
            ->where('id', $zoneImageId)
            ->with(['images'])
            ->firstOrFail();
        
        return response()->json([
            'success' => true,
            'data' => $zoneImage,
        ]);
    }
    
    /**
     * Create a new zone image
     */
    public function store(Request $request, int $projectId)
    {
        $validator = Validator::make($request->all(), [
            'level_type' => 'required|in:overview,building,floor',
            'building_id' => 'nullable|integer|exists:buildings,id',
            'floor_number' => 'nullable|integer',
            'image_type' => 'required|string|in:background,overlay,annotation',
            'viewbox' => 'required|string', // e.g., "0 0 1000 800"
            'width' => 'required|integer|min:100|max:10000',
            'height' => 'required|integer|min:100|max:10000',
            'image' => 'required|image|mimes:jpeg,jpg,png,webp,svg|max:10240', // Max 10MB
            'display_order' => 'nullable|integer',
            'opacity' => 'nullable|numeric|min:0|max:1',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $validated = $validator->validated();
        
        DB::beginTransaction();
        
        try {
            // Upload and process image using ImageService
            $imageRecord = $this->imageService->storeImage(
                $request->file('image'),
                'zone-images',
                $projectId
            );
            
            // Create zone image record
            $zoneImage = ZoneImage::create([
                'project_id' => $projectId,
                'level_type' => $validated['level_type'],
                'building_id' => $validated['building_id'] ?? null,
                'floor_number' => $validated['floor_number'] ?? null,
                'image_type' => $validated['image_type'],
                'viewbox' => $validated['viewbox'],
                'width' => $validated['width'],
                'height' => $validated['height'],
                'display_order' => $validated['display_order'] ?? 0,
                'opacity' => $validated['opacity'] ?? 1.0,
            ]);
            
            // Attach image to zone image
            $zoneImage->images()->attach($imageRecord->id);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Zone image created successfully',
                'data' => $zoneImage->load('images'),
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create zone image: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Update an existing zone image
     */
    public function update(Request $request, int $projectId, int $zoneImageId)
    {
        $zoneImage = ZoneImage::where('project_id', $projectId)
            ->where('id', $zoneImageId)
            ->firstOrFail();
        
        $validator = Validator::make($request->all(), [
            'level_type' => 'sometimes|in:overview,building,floor',
            'building_id' => 'nullable|integer|exists:buildings,id',
            'floor_number' => 'nullable|integer',
            'image_type' => 'sometimes|string|in:background,overlay,annotation',
            'viewbox' => 'sometimes|string',
            'width' => 'sometimes|integer|min:100|max:10000',
            'height' => 'sometimes|integer|min:100|max:10000',
            'display_order' => 'nullable|integer',
            'opacity' => 'nullable|numeric|min:0|max:1',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp,svg|max:10240',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $validated = $validator->validated();
        
        DB::beginTransaction();
        
        try {
            // If new image uploaded, replace the old one
            if ($request->hasFile('image')) {
                // Detach old image
                $oldImageIds = $zoneImage->images->pluck('id')->toArray();
                $zoneImage->images()->detach();
                
                // Delete old images from storage
                foreach ($oldImageIds as $imageId) {
                    $this->imageService->deleteImage($imageId);
                }
                
                // Upload new image
                $imageRecord = $this->imageService->storeImage(
                    $request->file('image'),
                    'zone-images',
                    $projectId
                );
                
                // Attach new image
                $zoneImage->images()->attach($imageRecord->id);
            }
            
            // Update zone image metadata
            unset($validated['image']); // Don't try to save file to database
            $zoneImage->update($validated);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Zone image updated successfully',
                'data' => $zoneImage->fresh(['images']),
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update zone image: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Delete a zone image
     */
    public function destroy(int $projectId, int $zoneImageId)
    {
        $zoneImage = ZoneImage::where('project_id', $projectId)
            ->where('id', $zoneImageId)
            ->firstOrFail();
        
        DB::beginTransaction();
        
        try {
            // Get image IDs before detaching
            $imageIds = $zoneImage->images->pluck('id')->toArray();
            
            // Detach images
            $zoneImage->images()->detach();
            
            // Delete images from storage
            foreach ($imageIds as $imageId) {
                $this->imageService->deleteImage($imageId);
            }
            
            // Delete zone image record
            $zoneImage->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Zone image deleted successfully',
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete zone image: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Bulk upload multiple zone images
     */
    public function bulkUpload(Request $request, int $projectId)
    {
        $validator = Validator::make($request->all(), [
            'level_type' => 'required|in:overview,building,floor',
            'building_id' => 'nullable|integer|exists:buildings,id',
            'image_type' => 'required|string|in:background,overlay,annotation',
            'viewbox' => 'required|string',
            'width' => 'required|integer|min:100|max:10000',
            'height' => 'required|integer|min:100|max:10000',
            'images' => 'required|array',
            'images.*' => 'required|image|mimes:jpeg,jpg,png,webp,svg|max:10240',
            'floor_numbers' => 'required|array',
            'floor_numbers.*' => 'required|integer',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $validated = $validator->validated();
        
        // Check that images count matches floor numbers count
        if (count($validated['images']) !== count($validated['floor_numbers'])) {
            return response()->json([
                'success' => false,
                'message' => 'Number of images must match number of floor numbers',
            ], 422);
        }
        
        DB::beginTransaction();
        
        try {
            $createdZoneImages = [];
            
            foreach ($validated['images'] as $index => $imageFile) {
                // Upload image
                $imageRecord = $this->imageService->storeImage(
                    $imageFile,
                    'zone-images',
                    $projectId
                );
                
                // Create zone image
                $zoneImage = ZoneImage::create([
                    'project_id' => $projectId,
                    'level_type' => $validated['level_type'],
                    'building_id' => $validated['building_id'] ?? null,
                    'floor_number' => $validated['floor_numbers'][$index],
                    'image_type' => $validated['image_type'],
                    'viewbox' => $validated['viewbox'],
                    'width' => $validated['width'],
                    'height' => $validated['height'],
                    'display_order' => 0,
                    'opacity' => 1.0,
                ]);
                
                // Attach image
                $zoneImage->images()->attach($imageRecord->id);
                
                $createdZoneImages[] = $zoneImage->load('images');
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Uploaded ' . count($createdZoneImages) . ' zone images successfully',
                'data' => $createdZoneImages,
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk upload zone images: ' . $e->getMessage(),
            ], 500);
        }
    }
}
