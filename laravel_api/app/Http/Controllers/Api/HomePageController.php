<?php

namespace App\Http\Controllers\Api;

use App\Models\News;
use App\Models\Projects;
use App\Models\Translation;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\NewsResource;
use App\Http\Resources\Api\ProjectResource;
use App\Http\Resources\Api\TranslationResource;
use App\Services\PageCacheService;

class HomepageController extends Controller
{
    protected $pageCacheService;

    public function __construct(PageCacheService $pageCacheService)
    {
        $this->pageCacheService = $pageCacheService;
    }

    /**
     * Get optimized homepage bootstrap data
     * 
     * This method returns locale-specific data to eliminate frontend transformation
     */
    public function index(Request $request)
    {
        $locale = $request->input('locale', 'ka');
        
        // Static groups defined in backend
        $groups = ['home', 'header', 'footer',];
        
        // Create cache key based on locale
        $cacheKey = "HomePageCache({$locale})";
        
        // Check if cache exists first
        if ($this->pageCacheService->has($cacheKey)) {
            return $this->pageCacheService->get($cacheKey);
        }
        
        // If not cached, fetch data and cache forever
        $data = [];
        
        // Get translations for current locale only
        $translations = Translation::whereIn('group', $groups)
            ->where('active', 1)
            ->get()
            ->mapWithKeys(function ($translation) use ($locale) {
                $resource = new TranslationResource($translation, $locale);
                $translationData = $resource->toArray(request());
                return [$translationData['key'] => $translationData['text']];
            });
        
        $data['translations'] = $translations->toArray();

        // Get all active projects with localized data
        $allProjects = Projects::where('is_active', true)
            ->latest()
            ->get()
            ->map(function ($project) use ($locale) {
                $resource = new ProjectResource($project, $locale);
                return $resource->toArray(request());
            });

        // Separate projects by type
        $data['projects'] = [
            'is_featured' => $allProjects->where('is_featured', true)->values()->toArray(),
            'is_onHomepage' => $allProjects->where('is_onHomepage', true)->values()->toArray(),
        ];

        // Get all active news with localized data
        $news = News::where('is_active', true)
            ->where('is_featured', true)
            ->latest()
            ->limit(2)
            ->get()
            ->map(function ($article) use ($locale) {
                $resource = new NewsResource($article, $locale);
                return $resource->toArray(request());
            });

        $data['news'] = $news->toArray();

        // Add metadata
        $data['meta'] = [
            'locale' => $locale,
            'cached_at' => now()->toISOString(),
            'cache_key' => $cacheKey,
            'groups' => $groups,
        ];

        $response = response()->json($data);
        
        // Cache forever (null TTL)
        $this->pageCacheService->put($cacheKey, $response, null);
        
        return $response;
    }

}