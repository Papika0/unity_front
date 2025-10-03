<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\SiteSettingsService;
use App\Services\TranslationService;
use App\Services\PageCacheService;

class AboutController extends Controller
{
    protected $siteSettingsService;
    protected $translationService;
    protected $pageCacheService;

    public function __construct(
        SiteSettingsService $siteSettingsService, 
        TranslationService $translationService,
        PageCacheService $pageCacheService
    ) {
        $this->siteSettingsService = $siteSettingsService;
        $this->translationService = $translationService;
        $this->pageCacheService = $pageCacheService;
    }

    /**
     * Get about page data with translations
     */
    public function index(Request $request)
    {
        $locale = $request->input('locale', 'ka');
        $requestGroups = $request->input('groups', []);

        // Create cache key
        $groupsKey = $requestGroups ? md5(json_encode($requestGroups)) : 'nogroups';
        $cacheKey = "about_index_{$locale}_{$groupsKey}";

        // Check cache first
        if ($this->pageCacheService->has($cacheKey)) {
            return $this->pageCacheService->get($cacheKey);
        }

        if ($requestGroups) {
            $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
        }
        // Get about info
        $aboutInfo = $this->siteSettingsService->getAboutInfo();

        $result = response()->json([
            'translations' => $translations ?? [],
            'about_info' => $aboutInfo ?: [
                'stats' => [
                    'successful_projects' => '150+',
                    'years_experience' => '15+',
                    'satisfied_clients' => '50+',
                    'client_satisfaction' => '98%',
                ]
            ],
            'meta' => [
                'locale' => $locale,
                'cached_at' => now()->toISOString(),
            ],
        ]);

        // Cache forever
        $this->pageCacheService->put($cacheKey, $result, null);

        return $result;
    }
}
