<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProjectService;
use App\Services\SiteSettingsService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FooterController extends Controller
{
    use ApiResponse;

    protected $projectService;
    protected $siteSettingsService;

    public function __construct(ProjectService $projectService, SiteSettingsService $siteSettingsService)
    {
        $this->projectService = $projectService;
        $this->siteSettingsService = $siteSettingsService;
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
            $locale = $request->get('locale', 'ka');
            
            // Get footer-specific projects (limited for performance)
            $projects = $this->projectService->getFooterProjects($locale, 6);
            
            // Get footer contact and social data
            $footerData = $this->siteSettingsService->getFooterData($locale);
            
            $response = [
                'projects' => $projects,
                'contact' => $footerData['contact'],
                'social_links' => $footerData['social_links'],
            ];

            return $this->success($response, 'Footer data retrieved successfully');
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
            $locale = $request->get('locale', 'ka');
            $limit = $request->get('limit', 6);
            
            $projects = $this->projectService->getFooterProjects($locale, $limit);
            
            return $this->success($projects, 'Footer projects retrieved successfully');
        } catch (\Exception $e) {
            Log::error('FooterController: Failed to get footer projects', [
                'error' => $e->getMessage(),
                'locale' => $request->get('locale', 'ka'),
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
            $locale = $request->get('locale', 'ka');
            
            $contactInfo = $this->siteSettingsService->getFooterContactInfo($locale);
            
            return $this->success($contactInfo, 'Footer contact info retrieved successfully');
        } catch (\Exception $e) {
            Log::error('FooterController: Failed to get footer contact info', [
                'error' => $e->getMessage(),
                'locale' => $request->get('locale', 'ka')
            ]);
            
            return $this->error('Failed to retrieve footer contact info', 500);
        }
    }
}