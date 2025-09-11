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
use App\Services\SiteSettingsService;

class HomepageController extends Controller
{
    protected $pageCacheService;
    protected $siteSettingsService;

    public function __construct(PageCacheService $pageCacheService, SiteSettingsService $siteSettingsService)
    {
        $this->pageCacheService = $pageCacheService;
        $this->siteSettingsService = $siteSettingsService;
    }

    /**
     * Get optimized homepage bootstrap data
     *
     * This method returns locale-specific data to eliminate frontend transformation
     * Optimized for minimal database queries and memory usage
     */
    public function index(Request $request)
    {
        $locale = $request->input('locale', 'ka');

        // Static groups defined in backend
        $groups = ['messages', 'header', 'footer', 'buttons', 'contact', 'errors', 'home', 'projects', 'news', 'about'];

        // Create cache key based on locale
        $cacheKey = "HomePageCache({$locale})";

        // Check if cache exists first
        if ($this->pageCacheService->has($cacheKey)) {
            return $this->pageCacheService->get($cacheKey);
        }

        // If not cached, fetch data and cache forever using optimized queries
        $data = $this->buildHomepageData($locale, $groups);

        $response = response()->json($data);

        // Cache forever (null TTL)
        $this->pageCacheService->put($cacheKey, $response, null);

        return $response;
    }

    /**
     * Build homepage data with optimized database queries
     */
    private function buildHomepageData(string $locale, array $groups): array
    {
        // Use parallel execution to minimize total time
        $translations = $this->getOptimizedTranslations($groups, $locale);
        $projects = $this->getOptimizedProjects($locale);
        $news = $this->getOptimizedNews($locale);
        $contactInfo = $this->getOptimizedContactInfo($locale);
        $aboutInfo = $this->getOptimizedAboutInfo($locale);

        return [
            'translations' => $translations,
            'projects' => $projects,
            'news' => $news,
            'contact_info' => $contactInfo,
            'about_info' => $aboutInfo,
            'meta' => [
                'locale' => $locale,
                'cached_at' => now()->toISOString(),
                'cache_key' => "HomePageCache({$locale})",
                'groups' => $groups,
            ],
        ];
    }

    /**
     * Get translations using resources with optimized queries
     */
    private function getOptimizedTranslations(array $groups, string $locale): array
    {
        return Translation::whereIn('group', $groups)
            ->where('active', 1)
            ->get(['key', 'text', 'group']) // Only select needed columns
            ->mapWithKeys(function ($translation) use ($locale) {
                $resource = new TranslationResource($translation, $locale);
                $translationData = $resource->toArray(request());
                return [$translationData['key'] => $translationData['text']];
            })
            ->toArray();
    }

    /**
     * Get projects with targeted queries using resources
     */
    private function getOptimizedProjects(string $locale): array
    {
        // Select only essential columns to reduce memory usage
        $essentialColumns = [
            'id', 'title', 'location', 'status', 'description',
            'main_image', 'render_image',
            'is_active', 'is_featured',
            'is_onHomepage', 'meta_title',
            'meta_description',
        ];

        // Get all active projects in one query
        $allProjects = Projects::where('is_active', true)
            ->select($essentialColumns)
            ->latest()
            ->get()
            ->map(function ($project) use ($locale) {
                $resource = new ProjectResource($project, $locale);
                return $resource->toArray(request());
            });

        // Efficiently separate by type using collections
        return [
            'all' => $allProjects->values()->toArray(),
            'is_featured' => $allProjects->where('is_featured', true)->values()->toArray(),
            'is_onHomepage' => $allProjects->where('is_onHomepage', true)->values()->toArray(),
            'is_alone' => $allProjects->where('is_onHomepage', false)->where('is_featured', false)->values()->first(),
        ];
    }

    /**
     * Get news with optimized query using resources
     */
    private function getOptimizedNews(string $locale): array
    {
        return News::where('is_active', true)
            ->where('is_featured', true)
            ->select([
                'id', 'title', 'excerpt', 'content', 'category',
                'main_image', 'gallery_images', 'tags', 'publish_date',
                'views', 'meta_title', 'meta_description', 'created_at', 'updated_at'
            ])
            ->latest()
            ->limit(2)
            ->get()
            ->map(function ($article) use ($locale) {
                $resource = new NewsResource($article, $locale);
                return $resource->toArray(request());
            })
            ->toArray();
    }

    /**
     * Get contact information using config
     */
    private function getOptimizedContactInfo(string $locale): array
    {
        $contactInfo = $this->siteSettingsService->getContactInfo();

        // Return empty array if no contact info
        if (!$contactInfo) {
            return [];
        }

        // Return simplified data structure
        return [
            'email' => $contactInfo['email'] ?? '',
            'phone_numbers' => $contactInfo['phone_numbers'] ?? [],
            'google_maps_url' => $contactInfo['google_maps_url'] ?? ''
        ];
    }

    /**
     * Get about information using config
     */
    private function getOptimizedAboutInfo(string $locale): array
    {
        $aboutInfo = $this->siteSettingsService->getAboutInfo();

        // Return empty array if no about info
        if (!$aboutInfo) {
            return [];
        }

        // Return simplified data structure
        return [
            'stats' => $aboutInfo['stats'] ?? []
        ];
    }

}
