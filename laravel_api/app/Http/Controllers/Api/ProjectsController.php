<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Projects;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Resources\Api\ProjectResource;
use App\Services\PageCacheService;

class ProjectsController extends Controller
{
    use ApiResponse;

    protected $pageCacheService;

    public function __construct(PageCacheService $pageCacheService)
    {
        $this->pageCacheService = $pageCacheService;
    }

    /**
     * Display a listing of published projects for public API.
     */
    public function index(Request $request)
    {
        try {
            $projects = Projects::where('is_active', true)
                               ->with(['mainImage', 'renderImage', 'galleryImages'])
                               ->orderBy('created_at', 'desc')
                               ->get();

            $resources = ProjectResource::collection($projects);
            return $this->success($resources);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch projects', 500);
        }
    }

    /**
     * Display a listing of featured projects for public API.
     */
    public function featured(Request $request)
    {
        try {
            $projects = Projects::where('is_active', true)
                               ->where('is_featured', true)
                               ->with(['mainImage', 'renderImage', 'galleryImages'])
                               ->orderBy('created_at', 'desc')
                               ->get();

            $resources = ProjectResource::collection($projects);
            return $this->success($resources);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch featured projects', 500);
        }
    }

    /**
     * Display a listing of homepage projects for public API.
     */
    public function homepage(Request $request)
    {
        try {
            $projects = Projects::where('is_active', true)
                               ->where('is_onHomepage', true)
                               ->with(['mainImage', 'renderImage', 'galleryImages'])
                               ->orderBy('created_at', 'desc')
                               ->get();

            $resources = ProjectResource::collection($projects);
            return $this->success($resources);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch homepage projects', 500);
        }
    }

    /**
     * Display the specified project for public API.
     */
    public function show(Request $request, $id)
    {
        try {
            $locale = $request->get('locale', 'ka');

            // Create cache key
            $cacheKey = "project_show_{$id}_{$locale}";

            // Check cache first
            if ($this->pageCacheService->has($cacheKey)) {
                return $this->pageCacheService->get($cacheKey);
            }

            $project = Projects::where('is_active', true)
                              ->with(['features', 'mainImage', 'renderImage', 'galleryImages'])
                              ->findOrFail($id);
            
            // Get related projects (same status, excluding current)
            $relatedProjects = Projects::where('is_active', true)
                ->where('id', '!=', $id)
                ->where('status', $project->status)
                ->with('mainImage')
                ->orderBy('created_at', 'desc')
                ->take(3)
                ->get(['id', 'title', 'status']);
            
            // If less than 3 same-status projects, fill with other projects
            if ($relatedProjects->count() < 3) {
                $remainingCount = 3 - $relatedProjects->count();
                $relatedIds = $relatedProjects->pluck('id')->toArray();
                $relatedIds[] = $id; // Exclude current project
                
                $additionalProjects = Projects::where('is_active', true)
                    ->whereNotIn('id', $relatedIds)
                    ->with('mainImage')
                    ->orderBy('created_at', 'desc')
                    ->take($remainingCount)
                    ->get(['id', 'title', 'status']);
                
                $relatedProjects = $relatedProjects->concat($additionalProjects);
            }
            
            $resource = new ProjectResource($project, $locale);
            
            // Add related projects to the resource
            $resourceData = $resource->toArray($request);
            $resourceData['related_projects'] = $relatedProjects->map(function($related) use ($locale) {
                $mainImage = $related->mainImage->first();
                return [
                    'id' => $related->id,
                    'title' => $related->getTranslation('title', $locale),
                    'main_image' => $mainImage ? [
                        'id' => $mainImage->id,
                        'url' => $mainImage->full_url,
                        'alt_text' => $mainImage->getTranslation('alt_text', $locale),
                        'title' => $mainImage->getTranslation('title', $locale),
                    ] : null,
                    'status' => $related->status,
                ];
            })->values()->all();
            
            $result = $this->success($resourceData);

            // Cache forever
            $this->pageCacheService->put($cacheKey, $result, null);
            
            return $result;
        } catch (\Exception $e) {
            return $this->error('Project not found', 404);
        }
    }
}
