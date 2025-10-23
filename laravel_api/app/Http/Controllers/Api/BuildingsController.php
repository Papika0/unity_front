<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\Projects;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $buildings = Building::where('project_id', $projectId)
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

        // Try to find by ID first, then by identifier
        $building = Building::where('project_id', $projectId)
            ->where('is_active', true)
            ->where(function ($query) use ($buildingIdOrIdentifier) {
                $query->where('id', $buildingIdOrIdentifier)
                    ->orWhere('identifier', $buildingIdOrIdentifier);
            })
            ->first();

        if (!$building) {
            return response()->json([
                'success' => false,
                'message' => 'Building not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $building->id,
                'name' => $building->name,
                'identifier' => $building->identifier,
                'sort_order' => $building->sort_order,
            ],
        ]);
    }
}
