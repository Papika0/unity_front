<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Projects;
use App\Models\Building;
use App\Models\Apartment;
use App\Models\InteractiveZone;
use App\Models\ZoneImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ApartmentNavigationController extends Controller
{
    /**
     * Progressive apartment navigation endpoint
     *
     * @param Request $request
     * @param int $projectId
     * @return JsonResponse
     */
    public function index(Request $request, int $projectId): JsonResponse
    {
        $validated = $request->validate([
            'level' => ['required', Rule::in(['overview', 'building', 'floor'])],
            'building_id' => ['nullable', 'integer', 'exists:buildings,id'],
            'floor_number' => ['nullable', 'integer'],
            'include' => ['nullable', 'string'],
        ]);

        $level = $validated['level'];
        $buildingId = $validated['building_id'] ?? null;
        $floorNumber = $validated['floor_number'] ?? null;

        // Validate required parameters
        if (in_array($level, ['building', 'floor']) && !$buildingId) {
            return response()->json(['error' => 'building_id is required for building and floor levels'], 422);
        }

        if ($level === 'floor' && !$floorNumber) {
            return response()->json(['error' => 'floor_number is required for floor level'], 422);
        }

        // Build cache key
        $cacheKey = "apartment_nav:{$projectId}:{$level}:" . ($buildingId ?? 'null') . ':' . ($floorNumber ?? 'null');

        // Return cached response if available
        $response = Cache::remember($cacheKey, 1800, function () use ($projectId, $level, $buildingId, $floorNumber) {
            switch ($level) {
                case 'overview':
                    return $this->getOverviewLevel($projectId);
                case 'building':
                    return $this->getBuildingLevel($projectId, $buildingId);
                case 'floor':
                    return $this->getFloorLevel($projectId, $buildingId, $floorNumber);
                default:
                    return ['error' => 'Invalid level'];
            }
        });

        return response()->json($response);
    }

    /**
     * Get overview level (building selection)
     */
    private function getOverviewLevel(int $projectId): array
    {
        $project = Projects::findOrFail($projectId);

        // Get background image for overview
        $image = ZoneImage::where('project_id', $projectId)
            ->where('level_type', 'overview')
            ->where('image_type', 'background')
            ->with('images')
            ->first();

        $imageData = null;
        if ($image && $image->images->isNotEmpty()) {
            $imageData = [
                'url' => $image->images->first()->full_url,
                'viewbox' => $image->viewbox,
                'width' => $image->width,
                'height' => $image->height,
            ];
        }

        // Get building zones with stats
        $zones = InteractiveZone::where('project_id', $projectId)
            ->where('zone_type', 'building_block')
            ->where('is_active', true)
            ->with('entity')
            ->orderBy('sort_order')
            ->get()
            ->map(function ($zone) {
                $building = Building::find($zone->entity_id);

                // Calculate stats for this building
                $stats = $this->calculateBuildingStats($zone->entity_id);

                // Get the label from display_config or fallback to building name
                $label = $zone->display_config['label'] ?? $building?->name;

                return [
                    'id' => $zone->id,
                    'type' => $zone->zone_type,
                    'entity_id' => $zone->entity_id,
                    'building_identifier' => $building?->identifier,
                    'label' => $label,
                    'coords' => $zone->svg_coordinates, // Frontend expects 'coords'
                    'bbox' => $zone->bounding_box,
                    'display' => $zone->display_config,
                    'stats' => $stats,
                ];
            });

        return [
            'level' => 'overview',
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'location' => $project->location,
            ],
            'has_multiple_buildings' => $project->hasMultipleBuildings(),
            'image' => $imageData,
            'zones' => $zones,
        ];
    }

    /**
     * Get building level (floor selection)
     */
    private function getBuildingLevel(int $projectId, int $buildingId): array
    {
        $project = Projects::findOrFail($projectId);
        $building = Building::findOrFail($buildingId);

        // Get background image for this building
        $image = ZoneImage::where('project_id', $projectId)
            ->where('level_type', 'building')
            ->where('building_id', $buildingId)
            ->where('image_type', 'background')
            ->with('images')
            ->first();

        $imageData = null;
        if ($image && $image->images->isNotEmpty()) {
            $imageData = [
                'url' => $image->images->first()->full_url,
                'viewbox' => $image->viewbox,
                'width' => $image->width,
                'height' => $image->height,
            ];
        }

        // Get floor zones with stats
        $zones = InteractiveZone::where('project_id', $projectId)
            ->where('building_id', $buildingId)
            ->where('zone_type', 'floor_strip')
            ->where('is_active', true)
            ->where('entity_type', 'floor')
            ->orderBy('sort_order')
            ->get()
            ->map(function ($zone) use ($buildingId) {
                // The entity_id contains the floor number for floor_strip zones
                $floorNumber = $zone->entity_id;

                // Calculate stats for this floor
                $stats = $this->calculateFloorStats($buildingId, $floorNumber);

                // Get the label from display_config or fallback to "Floor X"
                $label = $zone->display_config['label'] ?? "Floor {$floorNumber}";

                return [
                    'id' => $zone->id,
                    'type' => $zone->zone_type,
                    'floor_number' => $floorNumber,
                    'coords' => $zone->svg_coordinates, // Frontend expects 'coords'
                    'bbox' => $zone->bounding_box,
                    'display' => $zone->display_config,
                    'stats' => $stats,
                ];
            });

        // Get unique floor numbers for prefetch
        $allFloors = Apartment::where('building_id', $buildingId)
            ->distinct()
            ->pluck('floor_number')
            ->sort()
            ->values();

        return [
            'level' => 'building',
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'location' => $project->location,
            ],
            'building' => [
                'id' => $building->id,
                'name' => $building->name,
                'identifier' => $building->identifier,
            ],
            'image' => $imageData,
            'zones' => $zones,
            'prefetch_floors' => $allFloors->slice(0, 5)->values(),
        ];
    }

    /**
     * Get floor level (apartment grid)
     */
    private function getFloorLevel(int $projectId, int $buildingId, int $floorNumber): array
    {
        $project = Projects::findOrFail($projectId);
        $building = Building::findOrFail($buildingId);

        // Get background image for this floor
        $image = ZoneImage::where('project_id', $projectId)
            ->where('level_type', 'floor')
            ->where('building_id', $buildingId)
            ->where('floor_number', $floorNumber)
            ->where('image_type', 'background')
            ->with('images')
            ->first();

        $imageData = null;
        if ($image && $image->images->isNotEmpty()) {
            $imageData = [
                'url' => $image->images->first()->full_url,
                'viewbox' => $image->viewbox,
                'width' => $image->width,
                'height' => $image->height,
            ];
        }

        // Get apartments with their zones
        $apartments = Apartment::where('building_id', $buildingId)
            ->where('floor_number', $floorNumber)
            ->where('is_active', true)
            ->with('interactiveZone')
            ->orderBy('sort_order')
            ->get()
            ->map(function ($apartment) {
                $zone = $apartment->interactiveZone;

                // Determine display colors based on status
                $display = $this->getApartmentDisplayConfig($apartment->status);

                return [
                    'id' => $apartment->id,
                    'apartment_number' => $apartment->apartment_number,
                    'status' => $apartment->status,
                    'price' => $apartment->price,
                    'area_total' => $apartment->area_total,
                    'area_living' => $apartment->area_living,
                    'bedrooms' => $apartment->bedrooms,
                    'bathrooms' => $apartment->bathrooms,
                    'has_balcony' => $apartment->has_balcony,
                    'has_parking' => $apartment->has_parking,
                    'coords' => $zone?->svg_coordinates ?? [], // Frontend expects 'coords'
                    'bbox' => $zone?->bounding_box ?? [],
                    'display' => $display,
                ];
            });

        return [
            'level' => 'floor',
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'location' => $project->location,
            ],
            'building' => [
                'id' => $building->id,
                'name' => $building->name,
                'identifier' => $building->identifier,
            ],
            'floor_number' => $floorNumber,
            'image' => $imageData,
            'apartments' => $apartments,
        ];
    }

    /**
     * Calculate building statistics
     */
    private function calculateBuildingStats(int $buildingId): array
    {
        $stats = Apartment::where('building_id', $buildingId)
            ->where('is_active', true)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $floors = Apartment::where('building_id', $buildingId)
            ->where('is_active', true)
            ->selectRaw('MIN(floor_number) as min_floor, MAX(floor_number) as max_floor')
            ->first();

        return [
            'total_units' => array_sum($stats),
            'available' => $stats['available'] ?? 0,
            'reserved' => $stats['reserved'] ?? 0,
            'sold' => $stats['sold'] ?? 0,
            'floor_range' => $floors ? "{$floors->min_floor}-{$floors->max_floor}" : '',
        ];
    }

    /**
     * Calculate floor statistics
     */
    private function calculateFloorStats(int $buildingId, ?int $floorNumber): array
    {
        if (!$floorNumber) {
            return ['available' => 0, 'reserved' => 0, 'sold' => 0, 'total' => 0];
        }

        $stats = Apartment::where('building_id', $buildingId)
            ->where('floor_number', $floorNumber)
            ->where('is_active', true)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'available' => $stats['available'] ?? 0,
            'reserved' => $stats['reserved'] ?? 0,
            'sold' => $stats['sold'] ?? 0,
            'total' => array_sum($stats),
        ];
    }

    /**
     * Get display config based on apartment status
     */
    private function getApartmentDisplayConfig(string $status): array
    {
        return match ($status) {
            'available' => [
                'fill' => '#4ade80',
                'stroke' => '#22c55e',
                'hover' => '#86efac',
            ],
            'reserved' => [
                'fill' => '#fbbf24',
                'stroke' => '#f59e0b',
                'hover' => '#fcd34d',
            ],
            'sold' => [
                'fill' => '#94a3b8',
                'stroke' => '#64748b',
                'hover' => '#cbd5e1',
            ],
            default => [
                'fill' => '#e5e7eb',
                'stroke' => '#9ca3af',
                'hover' => '#f3f4f6',
            ],
        };
    }
}
