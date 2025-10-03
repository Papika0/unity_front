<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SiteSettingsService;
use App\Services\TranslationService;
use App\Services\PageCacheService;
use Illuminate\Http\Request;

class ContactInfoController extends Controller
{
    protected $settingsService;
    protected $translationService;
    protected $pageCacheService;

    public function __construct(
        SiteSettingsService $settingsService, 
        TranslationService $translationService,
        PageCacheService $pageCacheService
    ) {
        $this->settingsService = $settingsService;
        $this->translationService = $translationService;
        $this->pageCacheService = $pageCacheService;
    }

    /**
     * Get the contact information for public display (legacy).
     */
    public function index()
    {
        $contactInfo = $this->settingsService->getContactInfo();
        
        // Return contact info if it exists
        if (!$contactInfo) {
            return response()->json([
                'data' => null
            ]);
        }
        
        return response()->json([
            'data' => $contactInfo
        ]);
    }

    /**
     * Get complete contact settings for the frontend with translations.
     */
    public function settings(Request $request)
    {
        $locale = $request->get('locale', 'ka');
        $requestGroups = $request->input('groups', []);

        // Create cache key
        $groupsKey = $requestGroups ? md5(json_encode($requestGroups)) : 'nogroups';
        $cacheKey = "contact_settings_{$locale}_{$groupsKey}";

        // Check cache first
        if ($this->pageCacheService->has($cacheKey)) {
            return $this->pageCacheService->get($cacheKey);
        }
        
        try {
            // Get contact settings using new comprehensive method
            $contactSettings = $this->settingsService->getContactSettingsAllLocales();
            
            // Get translations if groups are requested (following AboutController pattern)
            $translations = [];
            if (!empty($requestGroups)) {
                $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
            }
            
            $result = response()->json([
                'contact_settings' => $contactSettings,
                'translations' => $translations,
                'meta' => [
                    'locale' => $locale,
                    'cached_at' => now()->toISOString(),
                ]
            ]);

            // Cache forever
            $this->pageCacheService->put($cacheKey, $result, null);

            return $result;
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch contact settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
