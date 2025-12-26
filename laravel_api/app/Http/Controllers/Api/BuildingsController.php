<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\Projects;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;

class BuildingsController extends Controller
{
    /**
     * Get all buildings for a project (public endpoint)
     *
     * @param int $projectId
     * @return JsonResponse
     */
    public function index(int $projectId): JsonResponse
    {
        $project = Projects::findOrFail($projectId);
        $locale = App::getLocale();
        $cacheKey = "buildings_index_project_{$projectId}_{$locale}";

        $buildings = Cache::rememberForever($cacheKey, function () use ($projectId) {
            return Building::where('project_id', $projectId)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(function ($building) {
                    return [
                        'id' => $building->id,
                        'name' => $building->name,
                        'identifier' => $building->identifier,
                        'sort_order' => $building->sort_order,
                    ];
                })
                ->toArray();  // Convert collection to array before caching
        });

        return response()->json([
            'success' => true,
            'data' => $buildings,
        ]);
    }

    /**
     * Get a single building by ID or identifier (public endpoint)
     *
     * @param int $projectId
     * @param string $buildingIdOrIdentifier
     * @return JsonResponse
     */
    public function show(int $projectId, string $buildingIdOrIdentifier): JsonResponse
    {
        $project = Projects::findOrFail($projectId);
        $locale = App::getLocale();

        // Cache key includes the input parameter (ID or identifier)
        $cacheKey = "building_show_{$projectId}_{$buildingIdOrIdentifier}_{$locale}";

        $data = Cache::rememberForever($cacheKey, function () use ($projectId, $buildingIdOrIdentifier) {
            // Try to find by ID first, then by identifier
            $building = Building::where('project_id', $projectId)
                ->where('is_active', true)
                ->where(function ($query) use ($buildingIdOrIdentifier) {
                    $query->where('id', $buildingIdOrIdentifier)
                        ->orWhere('identifier', $buildingIdOrIdentifier);
                })
                ->first();

            if (!$building) {
                return null;
            }

            return [
                'id' => $building->id,
                'name' => $building->name,
                'identifier' => $building->identifier,
                'sort_order' => $building->sort_order,
            ];
        });

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Building not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
