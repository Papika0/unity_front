<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\SiteSettingsService;
use App\Services\TranslationService;
use App\Models\Projects;
use App\Http\Resources\Api\ProjectResource;

class ProjectsPageController extends Controller
{
    protected $siteSettingsService;
    protected $translationService;

    public function __construct(SiteSettingsService $siteSettingsService, TranslationService $translationService)
    {
        $this->siteSettingsService = $siteSettingsService;
        $this->translationService = $translationService;
    }

    /**
     * Get projects page data with translations and pagination
     */
    public function index(Request $request)
    {
        $locale = $request->input('locale', 'ka');
        $requestGroups = $request->input('groups', []);
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 6);
        $status = $request->input('status', null); // Add status filter

        if ($requestGroups) {
            $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
        }

        // Get paginated projects data
        $projectsQuery = Projects::where('is_active', true);

        // Apply status filter if provided
        if ($status && $status !== 'all') {
            $projectsQuery->where('status', $status);
        }

        $projectsQuery->orderBy('created_at', 'desc');

        // Get paginated results
        $projects = $projectsQuery->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'translations' => $translations ?? [],
            'projects' => ProjectResource::collection($projects->items()),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
                'last_page' => $projects->lastPage(),
                'from' => $projects->firstItem(),
                'to' => $projects->lastItem(),
                'has_more_pages' => $projects->hasMorePages(),
            ],
            'meta' => [
                'locale' => $locale,
                'status_filter' => $status,
                'cached_at' => now()->toISOString(),
            ],
        ]);
    }
}
