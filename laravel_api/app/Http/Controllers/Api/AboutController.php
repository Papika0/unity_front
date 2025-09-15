<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\SiteSettingsService;
use App\Services\TranslationService;

class AboutController extends Controller
{
    protected $siteSettingsService;
    protected $translationService;

    public function __construct(SiteSettingsService $siteSettingsService, TranslationService $translationService)
    {
        $this->siteSettingsService = $siteSettingsService;
        $this->translationService = $translationService;
    }

    /**
     * Get about page data with translations
     */
    public function index(Request $request)
    {
        $locale = $request->input('locale', 'ka');
        $requestGroups = $request->input('groups', []);

        if ($requestGroups) {
            $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
        }
        // Get about info
        $aboutInfo = $this->siteSettingsService->getAboutInfo();

        return response()->json([
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
    }
}
