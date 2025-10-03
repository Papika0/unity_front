<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Models\Projects;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use App\Services\PageCacheService;

class FeaturesController extends Controller
{
    use ApiResponse;

    protected $pageCacheService;

    public function __construct(PageCacheService $pageCacheService)
    {
        $this->pageCacheService = $pageCacheService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $features = Feature::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return $this->success($features);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:features,name',
            'title' => 'required|array',
            'title.ka' => 'required|string',
            'title.en' => 'nullable|string',
            'title.ru' => 'nullable|string',
            'description' => 'required|array',
            'description.ka' => 'required|string',
            'description.en' => 'nullable|string',
            'description.ru' => 'nullable|string',
            'icon' => 'required|string|max:255',
            'color' => 'required|string|max:255',
            'keywords' => 'required|array',
            'keywords.*' => 'string',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $feature = Feature::create($validated);

        return $this->success($feature, 'Feature created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $feature = Feature::findOrFail($id);
        return $this->success($feature);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $feature = Feature::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('features', 'name')->ignore($feature->id)],
            'title' => 'required|array',
            'title.ka' => 'required|string',
            'title.en' => 'nullable|string',
            'title.ru' => 'nullable|string',
            'description' => 'required|array',
            'description.ka' => 'required|string',
            'description.en' => 'nullable|string',
            'description.ru' => 'nullable|string',
            'icon' => 'required|string|max:255',
            'color' => 'required|string|max:255',
            'keywords' => 'required|array',
            'keywords.*' => 'string',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $feature->update($validated);

        return $this->success($feature, 'Feature updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $feature = Feature::findOrFail($id);
        $feature->delete();

        return $this->success(null, 'Feature deleted successfully');
    }

    /**
     * Get features for a specific project
     */
    public function getProjectFeatures(string $projectId): JsonResponse
    {
        // Create cache key
        $cacheKey = "project_features_{$projectId}";

        // Check cache first
        if ($this->pageCacheService->has($cacheKey)) {
            return $this->pageCacheService->get($cacheKey);
        }

        $project = Projects::findOrFail($projectId);
        $features = $project->features()->get();

        $result = $this->success($features);

        // Cache forever
        $this->pageCacheService->put($cacheKey, $result, null);

        return $result;
    }

    /**
     * Assign features to a project
     */
    public function assignToProject(Request $request, string $projectId): JsonResponse
    {
        $project = Projects::findOrFail($projectId);

        $validated = $request->validate([
            'feature_ids' => 'array',
            'feature_ids.*' => 'exists:features,id',
            'auto_detect' => 'boolean',
        ]);

        if ($validated['auto_detect'] ?? false) {
            $project->autoDetectFeatures();
        } else {
            if (empty($validated['feature_ids'])) {
                return $this->error('No features selected', 400);
            }
            $project->features()->sync($validated['feature_ids']);
        }

        $features = $project->features()->get();

        return $this->success($features, 'Features assigned successfully');
    }
}
