<?php

namespace App\Http\Controllers\Api;

use App\Models\News;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\NewsResource;
use App\Services\PageCacheService;
use App\Services\ProjectService;
use App\Services\SiteSettingsService;
use App\Services\TranslationService;
use Illuminate\Support\Facades\App;

class HomepageController extends Controller
{
    protected $pageCacheService;
    protected $siteSettingsService;
    protected $translationService;
    protected $projectService;

    public function __construct(
        PageCacheService $pageCacheService,
        SiteSettingsService $siteSettingsService,
        TranslationService $translationService,
        ProjectService $projectService
    ) {
        $this->pageCacheService = $pageCacheService;
        $this->siteSettingsService = $siteSettingsService;
        $this->translationService = $translationService;
        $this->projectService = $projectService;
    }

    /**
     * Get optimized homepage bootstrap data
     *
     * This method returns locale-specific data to eliminate frontend transformation
     * Optimized for minimal database queries and memory usage
     */
    public function index(Request $request)
    {
        $locale = App::getLocale();

        // Static groups defined in backend
        $groups = ['messages', 'header', 'footer', 'buttons', 'contact', 'errors', 'home', 'projects', 'news'];

        // Create cache key based on locale
        $cacheKey = "HomePageCache({$locale})";

        // Check if cache exists first
        // Check if cache exists first
        if ($this->pageCacheService->has($cacheKey)) {
            $data = $this->pageCacheService->get($cacheKey);
            return response()->json($data);
        }

        // If not cached, fetch data and cache forever using optimized queries
        $data = $this->buildHomepageData($locale, $groups);

        // Cache the raw data array forever (null TTL)
        $this->pageCacheService->put($cacheKey, $data, null);

        return response()->json($data);
    }

    /**
     * Build homepage data with optimized database queries
     */
    private function buildHomepageData(string $locale, array $groups): array
    {
        // Use parallel execution to minimize total time
        $translations = $this->translationService->getOptimizedTranslations($groups, $locale);
        $projects = $this->projectService->getOptimizedProjects($locale);
        $news = $this->getOptimizedNews($locale);
        $footerData = $this->getFooterData($locale);

        return [
            'translations' => $translations,
            'projects' => $projects,
            'news' => $news,
            'contact' => $footerData['contact'],
            'social_links' => $footerData['social_links'],
            'meta' => [
                'locale' => $locale,
                'cached_at' => now()->toISOString(),
                'cache_key' => "HomePageCache({$locale})",
                'groups' => $groups,
            ],
        ];
    }




    /**
     * Get news with optimized query using resources
     */
    private function getOptimizedNews(string $locale): array
    {
        return News::where('is_active', true)
            ->where('is_featured', true)
            ->with(['mainImage', 'galleryImages'])
            ->select([
                'id',
                'title',
                'excerpt',
                'content',
                'category',
                'tags',
                'publish_date',
                'views',
                'meta_title',
                'meta_description',
                'created_at',
                'updated_at'
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
     * Get footer data (contact and social links) for homepage
     */
    private function getFooterData(string $locale): array
    {
        $footerData = $this->siteSettingsService->getFooterData($locale);

        return [
            'contact' => $footerData['contact'],
            'social_links' => $footerData['social_links'],
        ];
    }
}
