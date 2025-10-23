<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBuildingRequest;
use App\Http\Requests\Admin\UpdateBuildingRequest;
use App\Http\Resources\Admin\AdminBuildingResource;
use App\Http\Resources\Admin\AdminApartmentResource;
use App\Models\Building;
use App\Models\Projects;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminBuildingController extends Controller
{
    /**
     * List all buildings for a project
     */
    public function index(int $projectId): AnonymousResourceCollection
    {
        $project = Projects::findOrFail($projectId);
        
        $buildings = Building::where('project_id', $projectId)
            ->withCount(['apartments', 'apartments as available_count' => function ($query) {
                $query->where('status', 'available');
            }])
            ->orderBy('sort_order')
            ->get();

        return AdminBuildingResource::collection($buildings);
    }

    /**
     * Store a new building
     */
    public function store(StoreBuildingRequest $request, int $projectId): JsonResponse
    {
        $project = Projects::findOrFail($projectId);

        $building = Building::create([
            'project_id' => $projectId,
            'name' => $request->input('name'),
            'identifier' => $request->input('identifier'),
            'is_active' => $request->input('is_active', true),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Building created successfully',
            'data' => new AdminBuildingResource($building->loadCount('apartments')),
        ], 201);
    }

    /**
     * Get building details
     */
    public function show(int $projectId, int $buildingId): JsonResponse
    {
        $building = Building::where('project_id', $projectId)
            ->where('id', $buildingId)
            ->withCount([
                'apartments',
                'apartments as available_count' => fn($q) => $q->where('status', 'available'),
                'apartments as reserved_count' => fn($q) => $q->where('status', 'reserved'),
                'apartments as sold_count' => fn($q) => $q->where('status', 'sold'),
            ])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new AdminBuildingResource($building),
        ]);
    }

    /**
     * Update building
     */
    public function update(UpdateBuildingRequest $request, int $projectId, int $buildingId): JsonResponse
    {
        $building = Building::where('project_id', $projectId)
            ->where('id', $buildingId)
            ->firstOrFail();

        $building->update([
            'name' => $request->input('name', $building->name),
            'identifier' => $request->input('identifier', $building->identifier),
            'is_active' => $request->input('is_active', $building->is_active),
            'sort_order' => $request->input('sort_order', $building->sort_order),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Building updated successfully',
            'data' => new AdminBuildingResource($building->loadCount('apartments')),
        ]);
    }

    /**
     * Delete building (soft delete, check for apartments first)
     */
    public function destroy(int $projectId, int $buildingId): JsonResponse
    {
        $building = Building::where('project_id', $projectId)
            ->where('id', $buildingId)
            ->withCount('apartments')
            ->firstOrFail();

        if ($building->apartments_count > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete building. It has {$building->apartments_count} apartment(s). Please delete or reassign apartments first.",
            ], 422);
        }

        $building->delete();

        return response()->json([
            'success' => true,
            'message' => 'Building deleted successfully',
        ]);
    }

    /**
     * Get building details without project context (standalone)
     */
    public function showStandalone(int $buildingId): JsonResponse
    {
        $building = Building::where('id', $buildingId)
            ->withCount([
                'apartments',
                'apartments as available_count' => fn($q) => $q->where('status', 'available'),
                'apartments as reserved_count' => fn($q) => $q->where('status', 'reserved'),
                'apartments as sold_count' => fn($q) => $q->where('status', 'sold'),
            ])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new AdminBuildingResource($building),
        ]);
    }

    /**
     * Get apartments for a building (with optional floor filter)
     */
    public function getApartments(Request $request, int $buildingId): AnonymousResourceCollection
    {
        $building = Building::findOrFail($buildingId);

        $query = $building->apartments();

        // Filter by floor if provided
        if ($request->has('floor')) {
            $query->where('floor_number', $request->input('floor'));
        }

        $apartments = $query->orderBy('apartment_number')->get();

        return AdminApartmentResource::collection($apartments);
    }
}
