<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProjectService;
use App\Services\SiteSettingsService;
use App\Services\PageCacheService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;

class FooterController extends Controller
{
    use ApiResponse;

    protected $projectService;
    protected $siteSettingsService;
    protected $pageCacheService;

    public function __construct(
        ProjectService $projectService,
        SiteSettingsService $siteSettingsService,
        PageCacheService $pageCacheService
    ) {
        $this->projectService = $projectService;
        $this->siteSettingsService = $siteSettingsService;
        $this->pageCacheService = $pageCacheService;
    }

    /**
     * Get footer data including projects and contact information
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $locale = App::getLocale();

            // Create cache key
            $cacheKey = "footer_index_{$locale}";

            // Check cache first
            if ($this->pageCacheService->has($cacheKey)) {
                $cachedData = $this->pageCacheService->get($cacheKey);
                return $this->success($cachedData);
            }

            // Get footer-specific projects (limited for performance)
            $projects = $this->projectService->getFooterProjects($locale, 6);

            // Get footer contact and social data
            $footerData = $this->siteSettingsService->getFooterData($locale);

            $response = [
                'projects' => $projects,
                'contact' => $footerData['contact'],
                'social_links' => $footerData['social_links'],
            ];

            // Cache the data array (not the response)
            $this->pageCacheService->put($cacheKey, $response, null);

            return $this->success($response);
        } catch (\Exception $e) {
            Log::error('FooterController: Failed to get footer data', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->error('Failed to retrieve footer data', 500);
        }
    }

    /**
     * Get only projects for footer
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function projects(Request $request)
    {
        try {
            $locale = App::getLocale();
            $limit = $request->get('limit', 6);

            $projects = $this->projectService->getFooterProjects($locale, $limit);

            return $this->success($projects, 'Footer projects retrieved successfully');
        } catch (\Exception $e) {
            Log::error('FooterController: Failed to get footer projects', [
                'error' => $e->getMessage(),
                'locale' => App::getLocale(),
                'limit' => $request->get('limit', 6)
            ]);

            return $this->error('Failed to retrieve footer projects', 500);
        }
    }

    /**
     * Get only contact information for footer
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function contact(Request $request)
    {
        try {
            $locale = App::getLocale();

            $contactInfo = $this->siteSettingsService->getFooterContactInfo($locale);

            return $this->success($contactInfo, 'Footer contact info retrieved successfully');
        } catch (\Exception $e) {
            Log::error('FooterController: Failed to get footer contact info', [
                'error' => $e->getMessage(),
                'locale' => App::getLocale()
            ]);

            return $this->error('Failed to retrieve footer contact info', 500);
        }
    }
}
