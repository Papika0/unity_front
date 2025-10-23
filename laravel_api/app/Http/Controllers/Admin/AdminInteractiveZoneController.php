<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InteractiveZone;
use App\Models\ZoneImage;
use App\Models\Building;
use App\Models\Apartment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminInteractiveZoneController extends Controller
{
    /**
     * Get zones for a specific building (for frontend ListView compatibility)
     * Returns simplified zone format expected by frontend
     * 
     * Note: This returns zones based on context:
     * - Building blocks (overview level) have building_id = null and are returned for any building
     * - Floor strips and apartment units have specific building_id
     */
    public function indexByBuilding(Request $request, int $projectId, int $buildingId)
    {
        $query = InteractiveZone::where('project_id', $projectId);
        
        // Filter zones based on zone_type or return appropriate zones for the building
        // If zone_type is specified in query, filter by it
        if ($request->has('zone_type')) {
            $zoneType = $request->input('zone_type');
            $query->where('zone_type', $zoneType);
            
            // Building blocks are at overview level (building_id = null)
            if ($zoneType === 'building_block') {
                $query->whereNull('building_id');
            } else {
                // Floor strips and apartment units are building-specific
                $query->where('building_id', $buildingId);
            }
        } else {
            // If no zone_type specified, return all zones for this building
            // Including building blocks (which have building_id = null)
            $query->where(function($q) use ($buildingId) {
                $q->where('building_id', $buildingId)
                  ->orWhere(function($subQ) {
                      $subQ->where('zone_type', 'building_block')
                           ->whereNull('building_id');
                  });
            });
        }
        
        $zones = $query->orderBy('created_at', 'desc')->get();
        
        // Transform zones to frontend-expected format
        $transformedZones = $zones->map(function ($zone) {
            return [
                'id' => $zone->id,
                'entity_id' => $zone->entity_id,
                'label' => $zone->display_config['label'] ?? '',
                'polygon' => $zone->svg_coordinates,
                'type' => $zone->zone_type,
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $transformedZones,
        ]);
    }
    
    /**
     * Create a new zone for a specific building (for frontend ListView compatibility)
     * 
     * Note: Building blocks are at overview level and have building_id = null
     * Floor strips and apartment units have specific building_id
     */
    public function storeByBuilding(Request $request, int $projectId, int $buildingId)
    {
        $validator = Validator::make($request->all(), [
            'entity_id' => 'required|integer',
            'label' => 'required|string',
            'polygon' => 'required|array',
            'type' => 'required|in:building_block,floor_strip,apartment_unit',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $validated = $validator->validated();
        
        // Normalize coordinates
        $coords = $this->normalizeCoordinates($validated['polygon']);
        
        // Determine level_type and entity_type based on zone type
        $levelType = match($validated['type']) {
            'building_block' => 'overview',
            'floor_strip' => 'building',
            'apartment_unit' => 'floor',
            default => 'overview',
        };
        
        $entityType = match($validated['type']) {
            'building_block' => Building::class,
            'floor_strip' => Building::class,
            'apartment_unit' => Apartment::class,
            default => Building::class,
        };
        
        // Building blocks are at overview level (building_id = null)
        // Other zone types are building-specific
        $zoneBuildingId = ($validated['type'] === 'building_block') ? null : $buildingId;
        
        // Create zone
        $zone = InteractiveZone::create([
            'project_id' => $projectId,
            'building_id' => $zoneBuildingId,
            'zone_type' => $validated['type'],
            'level_type' => $levelType,
            'entity_id' => $validated['entity_id'],
            'entity_type' => $entityType,
            'svg_coordinates' => $coords,
            'bounding_box' => $this->calculateBoundingBox($coords),
            'display_config' => [
                'label' => $validated['label'],
                'fill' => '#e5e7eb',
                'stroke' => '#9ca3af',
                'hover' => '#dbeafe',
            ],
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Zone created successfully',
            'data' => [
                'id' => $zone->id,
                'entity_id' => $zone->entity_id,
                'label' => $zone->display_config['label'],
                'polygon' => $zone->svg_coordinates,
                'type' => $zone->zone_type,
            ],
        ], 201);
    }
    
    /**
     * Update a zone for a specific building (for frontend ListView compatibility)
     * 
     * Note: Building blocks have building_id = null, other types are building-specific
     */
    public function updateByBuilding(Request $request, int $projectId, int $buildingId, int $zoneId)
    {
        // Find zone - building blocks have building_id = null, others have specific building_id
        $zone = InteractiveZone::where('project_id', $projectId)
            ->where('id', $zoneId)
            ->where(function($q) use ($buildingId) {
                $q->where('building_id', $buildingId)
                  ->orWhere(function($subQ) {
                      $subQ->where('zone_type', 'building_block')
                           ->whereNull('building_id');
                  });
            })
            ->firstOrFail();
        
        $validator = Validator::make($request->all(), [
            'entity_id' => 'sometimes|integer',
            'label' => 'sometimes|string',
            'polygon' => 'sometimes|array',
            'type' => 'sometimes|in:building_block,floor_strip,apartment_unit',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $validated = $validator->validated();
        
        // Update entity_id if provided
        if (isset($validated['entity_id'])) {
            $zone->entity_id = $validated['entity_id'];
        }
        
        // Update label in display_config if provided
        if (isset($validated['label'])) {
            $displayConfig = $zone->display_config;
            $displayConfig['label'] = $validated['label'];
            $zone->display_config = $displayConfig;
        }
        
        // Update polygon and recalculate bounding box if provided
        if (isset($validated['polygon'])) {
            $coords = $this->normalizeCoordinates($validated['polygon']);
            $zone->svg_coordinates = $coords;
            $zone->bounding_box = $this->calculateBoundingBox($coords);
        }
        
        // Update zone type if provided
        if (isset($validated['type'])) {
            $zone->zone_type = $validated['type'];
            
            // Update level_type and entity_type accordingly
            $zone->level_type = match($validated['type']) {
                'building_block' => 'overview',
                'floor_strip' => 'building',
                'apartment_unit' => 'floor',
                default => $zone->level_type,
            };
            
            $zone->entity_type = match($validated['type']) {
                'building_block' => Building::class,
                'floor_strip' => Building::class,
                'apartment_unit' => Apartment::class,
                default => $zone->entity_type,
            };
            
            // Update building_id based on new type
            $zone->building_id = ($validated['type'] === 'building_block') ? null : $buildingId;
        }
        
        $zone->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Zone updated successfully',
            'data' => [
                'id' => $zone->id,
                'entity_id' => $zone->entity_id,
                'label' => $zone->display_config['label'],
                'polygon' => $zone->svg_coordinates,
                'type' => $zone->zone_type,
            ],
        ]);
    }
    
    /**
     * Delete a zone for a specific building (for frontend ListView compatibility)
     * 
     * Note: Building blocks have building_id = null, other types are building-specific
     */
    public function destroyByBuilding(int $projectId, int $buildingId, int $zoneId)
    {
        // Find zone - building blocks have building_id = null, others have specific building_id
        $zone = InteractiveZone::where('project_id', $projectId)
            ->where('id', $zoneId)
            ->where(function($q) use ($buildingId) {
                $q->where('building_id', $buildingId)
                  ->orWhere(function($subQ) {
                      $subQ->where('zone_type', 'building_block')
                           ->whereNull('building_id');
                  });
            })
            ->firstOrFail();
        
        $zone->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Zone deleted successfully',
        ]);
    }
    
    /**
     * Get zones for a project with optional filters
     */
    public function index(Request $request, int $projectId)
    {
        $query = InteractiveZone::where('project_id', $projectId);
        
        // Filter by level type (overview/building/floor)
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
        
        // Filter by zone type
        $zoneType = $request->input('zone_type');
        if ($zoneType) {
            $query->where('zone_type', $zoneType);
        }
        
        $zones = $query->orderBy('created_at', 'desc')->get();
        
        // Attach zone image based on zone type
        if ($zoneType && $zones->isNotEmpty()) {
            // Determine level_type from zone_type
            $levelType = match($zoneType) {
                'building_block' => 'overview',
                'floor_strip' => 'building',
                'apartment_unit' => 'floor',
                default => null,
            };
            
            if ($levelType) {
                // Get the appropriate zone image
                $zoneImageQuery = ZoneImage::where('project_id', $projectId)
                    ->where('level_type', $levelType)
                    ->with('images');
                
                // For building or floor level, filter by building_id
                if ($levelType === 'building' && $request->has('building_id')) {
                    $zoneImageQuery->where('building_id', $request->input('building_id'));
                } elseif ($levelType === 'floor' && $request->has('building_id') && $request->has('floor_number')) {
                    $zoneImageQuery->where('building_id', $request->input('building_id'))
                                   ->where('floor_number', $request->input('floor_number'));
                }
                
                $zoneImage = $zoneImageQuery->first();
                
                // If zone image exists with associated images, attach it to the response
                if ($zoneImage && $zoneImage->images->isNotEmpty()) {
                    $image = $zoneImage->images->first();
                    $zoneImageData = [
                        'id' => $zoneImage->id,
                        'viewbox' => $zoneImage->viewbox,
                        'width' => $zoneImage->width,
                        'height' => $zoneImage->height,
                        'image_url' => $image->full_url ?? $image->url ?? asset('images/placeholder.jpg'),
                    ];
                    
                    // Attach zone_image to each zone in the collection
                    $zones->transform(function ($zone) use ($zoneImageData) {
                        $zone->zone_image = $zoneImageData;
                        return $zone;
                    });
                }
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => $zones,
        ]);
    }
    
    /**
     * Create a new interactive zone
     */
    public function store(Request $request, int $projectId)
    {
        $validator = Validator::make($request->all(), [
            'zone_type' => 'required|in:building_block,floor_strip,apartment_unit',
            'level_type' => 'required|in:overview,building,floor',
            'entity_id' => 'required|integer',
            'entity_type' => 'required|string',
            'building_id' => 'nullable|integer|exists:buildings,id',
            'floor_number' => 'nullable|integer',
            'svg_coordinates' => 'required|array',
            'display_config' => 'required|array',
            'display_config.label' => 'nullable|string',
            'display_config.fill' => 'nullable|string',
            'display_config.stroke' => 'nullable|string',
            'display_config.hover' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $validated = $validator->validated();
        
        // Normalize coordinates from {x, y} format to [x, y] format
        $coords = $this->normalizeCoordinates($validated['svg_coordinates']);
        
        // Calculate bounding box from SVG coordinates
        $bbox = $this->calculateBoundingBox($coords);
        
        // Create zone
        $zone = InteractiveZone::create([
            'project_id' => $projectId,
            'zone_type' => $validated['zone_type'],
            'level_type' => $validated['level_type'],
            'entity_id' => $validated['entity_id'],
            'entity_type' => $validated['entity_type'],
            'building_id' => $validated['building_id'] ?? null,
            'floor_number' => $validated['floor_number'] ?? null,
            'svg_coordinates' => $coords,
            'bounding_box' => $bbox,
            'display_config' => $validated['display_config'],
        ]);
        
        // Only load entity relationship if entity_type is a valid model class
        if (class_exists($validated['entity_type'])) {
            $zone->load('entity');
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Zone created successfully',
            'data' => $zone,
        ], 201);
    }
    
    /**
     * Update an existing zone
     */
    public function update(Request $request, int $projectId, int $zoneId)
    {
        $zone = InteractiveZone::where('project_id', $projectId)
            ->where('id', $zoneId)
            ->firstOrFail();
        
        $validator = Validator::make($request->all(), [
            'zone_type' => 'sometimes|in:building_block,floor_strip,apartment_unit',
            'level_type' => 'sometimes|in:overview,building,floor',
            'entity_id' => 'sometimes|integer',
            'entity_type' => 'sometimes|string',
            'building_id' => 'nullable|integer|exists:buildings,id',
            'floor_number' => 'nullable|integer',
            'svg_coordinates' => 'sometimes|array',
            'display_config' => 'sometimes|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $validated = $validator->validated();
        
        // Normalize and recalculate bounding box if coordinates changed
        if (isset($validated['svg_coordinates'])) {
            $coords = $this->normalizeCoordinates($validated['svg_coordinates']);
            $validated['svg_coordinates'] = $coords;
            $validated['bounding_box'] = $this->calculateBoundingBox($coords);
        }
        
        $zone->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Zone updated successfully',
            'data' => $zone->fresh(['entity']),
        ]);
    }
    
    /**
     * Delete a zone
     */
    public function destroy(int $projectId, int $zoneId)
    {
        $zone = InteractiveZone::where('project_id', $projectId)
            ->where('id', $zoneId)
            ->firstOrFail();
        
        $zone->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Zone deleted successfully',
        ]);
    }
    
    /**
     * Bulk delete zones with filters
     * Used by polygon editor to clear all zones before saving new ones
     */
    public function bulkDelete(Request $request, int $projectId)
    {
        $query = InteractiveZone::where('project_id', $projectId);
        
        // Filter by zone type (required for polygon editor)
        if ($request->has('zone_type')) {
            $query->where('zone_type', $request->input('zone_type'));
        }
        
        // Filter by building (for floor strips)
        if ($request->has('building_id')) {
            $query->where('building_id', $request->input('building_id'));
        }
        
        // Get count before deleting
        $count = $query->count();
        
        // Delete all matching zones
        $query->delete();
        
        return response()->json([
            'success' => true,
            'message' => "Deleted {$count} zone(s) successfully",
            'deleted_count' => $count,
        ]);
    }
    
    /**
     * Bulk create zones with template and offset
     * Useful for creating floor strips or apartment grids
     */
    public function bulkCreate(Request $request, int $projectId)
    {
        $validator = Validator::make($request->all(), [
            'zone_type' => 'required|in:building_block,floor_strip,apartment_unit',
            'level_type' => 'required|in:overview,building,floor',
            'building_id' => 'required|integer|exists:buildings,id',
            'entity_type' => 'required|string',
            'floors' => 'required|array',
            'floors.*' => 'required|integer',
            'template_coords' => 'required|array',
            'template_coords.*' => 'required|array|size:2',
            'x_offset_per_floor' => 'nullable|numeric',
            'y_offset_per_floor' => 'required|numeric',
            'display_config_template' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $validated = $validator->validated();
        
        $zones = [];
        $xOffset = $validated['x_offset_per_floor'] ?? 0;
        $yOffset = $validated['y_offset_per_floor'];
        
        DB::beginTransaction();
        
        try {
            foreach ($validated['floors'] as $index => $floorNumber) {
                // Calculate coordinates with offset
                $coords = $this->offsetCoordinates(
                    $validated['template_coords'],
                    $xOffset * $index,
                    $yOffset * $index
                );
                
                $displayConfig = $validated['display_config_template'] ?? [
                    'label' => "Floor {$floorNumber}",
                    'fill' => '#e5e7eb',
                    'stroke' => '#9ca3af',
                    'hover' => '#dbeafe',
                ];
                
                // Override label if template provided
                if (isset($displayConfig['label'])) {
                    $displayConfig['label'] = str_replace('{floor}', $floorNumber, $displayConfig['label']);
                }
                
                $zoneData = [
                    'project_id' => $projectId,
                    'zone_type' => $validated['zone_type'],
                    'level_type' => $validated['level_type'],
                    'entity_type' => $validated['entity_type'],
                    'building_id' => $validated['building_id'],
                    'floor_number' => $floorNumber,
                    'entity_id' => $floorNumber, // For floor strips, floor number is entity
                    'svg_coordinates' => $coords,
                    'bounding_box' => $this->calculateBoundingBox($coords),
                    'display_config' => $displayConfig,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                
                $zones[] = $zoneData;
            }
            
            // Bulk insert
            InteractiveZone::insert($zones);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Created ' . count($zones) . ' zones successfully',
                'count' => count($zones),
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create zones: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Normalize coordinates from various formats to [[x, y], [x, y]] format
     * Supports both [{x: 1, y: 2}] and [[1, 2]] formats
     */
    private function normalizeCoordinates(array $coordinates): array
    {
        return array_map(function($point) {
            // If point is already an array [x, y], return as-is
            if (is_array($point) && isset($point[0]) && isset($point[1])) {
                return [(float) $point[0], (float) $point[1]];
            }
            
            // If point is an object/associative array {x: 1, y: 2}, convert it
            if (is_array($point) && isset($point['x']) && isset($point['y'])) {
                return [(float) $point['x'], (float) $point['y']];
            }
            
            // Fallback: invalid format
            throw new \InvalidArgumentException('Invalid coordinate format. Expected [x, y] or {x, y}');
        }, $coordinates);
    }
    
    /**
     * Calculate bounding box from SVG polygon coordinates
     */
    private function calculateBoundingBox(array $coordinates): array
    {
        $minX = $minY = PHP_FLOAT_MAX;
        $maxX = $maxY = PHP_FLOAT_MIN;
        
        foreach ($coordinates as $point) {
            if (!is_array($point) || count($point) < 2) {
                continue;
            }
            
            $x = (float) $point[0];
            $y = (float) $point[1];
            
            $minX = min($minX, $x);
            $maxX = max($maxX, $x);
            $minY = min($minY, $y);
            $maxY = max($maxY, $y);
        }
        
        return [
            'min_x' => $minX,
            'min_y' => $minY,
            'max_x' => $maxX,
            'max_y' => $maxY,
            'width' => $maxX - $minX,
            'height' => $maxY - $minY,
        ];
    }
    
    /**
     * Apply X and Y offset to all coordinates
     */
    private function offsetCoordinates(array $coords, float $xOffset, float $yOffset): array
    {
        return array_map(function($point) use ($xOffset, $yOffset) {
            return [
                $point[0] + $xOffset,
                $point[1] + $yOffset,
            ];
        }, $coords);
    }
}
