<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Projects;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Resources\Api\ProjectResource;
use App\Services\PageCacheService;
use App\Services\TranslationService;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;

class ProjectsController extends Controller
{
    use ApiResponse;

    protected $pageCacheService;
    protected $translationService;

    public function __construct(PageCacheService $pageCacheService, TranslationService $translationService)
    {
        $this->pageCacheService = $pageCacheService;
        $this->translationService = $translationService;
    }

    /**
     * Display a listing of published projects for public API.
     */
    public function index(Request $request)
    {
        try {
            $locale = App::getLocale();
            $cacheKey = "projects_index_{$locale}";

            $data = Cache::rememberForever($cacheKey, function () use ($locale, $request) {
                $projects = Projects::where('is_active', true)
                    ->where(function ($query) {
                        $query->whereHas('interactiveZones')
                            ->orWhereHas('apartments');
                    })
                    ->with([
                        'mainImage',
                        'renderImage',
                        'galleryImages',
                        'interactiveZones',  // Fix N+1: eager load for hasApartmentNavigation check
                        'features',          // Eager load features for consistency
                    ])
                    ->orderBy('created_at', 'desc')
                    ->get();

                // Convert resources to arrays BEFORE caching
                return $projects->map(function ($project) use ($locale, $request) {
                    $resource = new ProjectResource($project, $locale);
                    return $resource->toArray($request);
                })->toArray();
            });

            return $this->success($data);
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
            $locale = App::getLocale();
            $cacheKey = "projects_featured_{$locale}";

            $data = Cache::rememberForever($cacheKey, function () use ($locale, $request) {
                $projects = Projects::where('is_active', true)
                    ->where('is_featured', true)
                    ->with([
                        'mainImage',
                        'renderImage',
                        'galleryImages',
                        'interactiveZones',  // Fix N+1: eager load for hasApartmentNavigation check
                        'features',          // Eager load features for consistency
                    ])
                    ->orderBy('created_at', 'desc')
                    ->get();

                // Convert resources to arrays BEFORE caching
                return $projects->map(function ($project) use ($locale, $request) {
                    $resource = new ProjectResource($project, $locale);
                    return $resource->toArray($request);
                })->toArray();
            });

            return $this->success($data);
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
            $locale = App::getLocale();
            $cacheKey = "projects_homepage_{$locale}";

            $data = Cache::rememberForever($cacheKey, function () use ($locale, $request) {
                $projects = Projects::where('is_active', true)
                    ->where('is_onHomepage', true)
                    ->with([
                        'mainImage',
                        'renderImage',
                        'galleryImages',
                        'interactiveZones',  // Fix N+1: eager load for hasApartmentNavigation check
                        'features',          // Eager load features for consistency
                    ])
                    ->orderBy('created_at', 'desc')
                    ->get();

                // Convert resources to arrays BEFORE caching
                return $projects->map(function ($project) use ($locale, $request) {
                    $resource = new ProjectResource($project, $locale);
                    return $resource->toArray($request);
                })->toArray();
            });

            return $this->success($data);
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
            $locale = App::getLocale();
            $requestGroups = $request->input('groups', []);

            // Create cache key including groups
            $groupsKey = !empty($requestGroups) ? md5(json_encode($requestGroups)) : 'nogroups';
            $cacheKey = "project_show_{$id}_{$locale}_{$groupsKey}";

            // Check cache first
            if ($this->pageCacheService->has($cacheKey)) {
                return response()->json($this->pageCacheService->get($cacheKey));
            }

            // Get translations if groups are requested
            $translations = [];
            if (is_array($requestGroups) && count($requestGroups) > 0) {
                $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
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
            $resourceData['related_projects'] = $relatedProjects->map(function ($related) use ($locale) {
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

            $response = [
                'data' => $resourceData,
                'translations' => $translations,
                'meta' => [
                    'locale' => $locale,
                    'cached_at' => now()->toISOString(),
                ]
            ];

            // Cache the data array (not the JsonResponse)
            $this->pageCacheService->put($cacheKey, $response, null);

            return response()->json($response);
        } catch (\Exception $e) {
            return $this->error('Project not found', 404);
        }
    }
}
