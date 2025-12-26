<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Apartment;
use App\Models\Projects;
use App\Services\TranslationService;
use App\Services\SiteSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\App;

class ApartmentsPageController extends Controller
{
    /**
     * Cache key prefix for apartments bootstrap
     */
    private const CACHE_PREFIX = 'apartments_bootstrap_';

    /**
     * Translation groups needed for apartments page
     */
    private const TRANSLATION_GROUPS = [
        'messages',
        'header',
        'footer',
        'buttons',
        'contact',
        'errors',
        'apartments',
        'projects'
    ];

    protected TranslationService $translationService;
    protected SiteSettingsService $siteSettingsService;

    public function __construct(
        TranslationService $translationService,
        SiteSettingsService $siteSettingsService
    ) {
        $this->translationService = $translationService;
        $this->siteSettingsService = $siteSettingsService;
    }

    /**
     * Get bootstrap data for apartments page
     * 
     * Combines translations, apartments, filters, projects, contact in one cached request
     * Cache is stored forever and invalidated by clearCache() when apartments change
     * 
     * @return JsonResponse
     */
    public function bootstrap(Request $request): JsonResponse
    {
        $locale = App::getLocale();

        // Get current cache version (rotates when data changes)
        $version = $this->getCacheVersion();

        // Build cache key from query parameters
        $queryParams = $request->all();
        ksort($queryParams);
        $queryString = http_build_query($queryParams);

        // Include version in key to ensure invalidation works across all filter combinations
        $cacheKey = self::CACHE_PREFIX . "v{$version}_{$locale}_{$queryString}";

        // Cache forever - invalidated by rotating the version in clearCache()
        $data = Cache::rememberForever($cacheKey, function () use ($request, $locale, $cacheKey) {
            $footerData = $this->siteSettingsService->getFooterData($locale);

            return [
                'translations' => $this->translationService->getOptimizedTranslations(self::TRANSLATION_GROUPS, $locale),
                'apartments' => $this->getApartments($request),
                'filters' => $this->getFilterStats(),
                'projects' => $this->getProjectsForFilter($locale),
                'contact' => $footerData['contact'],
                'social_links' => $footerData['social_links'],
                'meta' => [
                    'locale' => $locale,
                    'cached_at' => now()->toISOString(),
                    'cache_key' => $cacheKey,
                    'groups' => self::TRANSLATION_GROUPS,
                ],
            ];
        });

        return response()->json($data);
    }

    /**
     * Clear all apartments bootstrap cache
     * Should be called when apartment status, price, or is_active changes
     */
    public static function clearCache(): void
    {
        // Rotate the cache version timestamp
        // This effectively invalidates ALL bootstrap cache keys instantly
        Cache::forever('apartments_data_version', now()->timestamp);

        // Also clear apartment filter stats cache
        Cache::forget('apartment_filters_stats');
    }

    /**
     * Get the current data version for caching
     */
    private function getCacheVersion(): string
    {
        return (string) Cache::rememberForever('apartments_data_version', fn() => now()->timestamp);
    }

    /**
     * Get paginated apartments list
     */
    private function getApartments(Request $request): array
    {
        $query = Apartment::with([
            'project:id,title',
            'building:id,name,identifier',
            'image3d',
        ])
            ->where('is_active', true)
            ->where('status', 'available');

        // Filter by Project
        if ($request->has('project_id')) {
            $query->where('project_id', $request->input('project_id'));
        }

        // Filter by Building
        if ($request->has('building_id')) {
            $query->where('building_id', $request->input('building_id'));
        }

        // Filter by Floor
        if ($request->has('floor_number')) {
            $query->where('floor_number', $request->input('floor_number'));
        }

        // Filter by Bedrooms
        if ($request->has('bedrooms')) {
            $bedrooms = $request->input('bedrooms');
            if (is_array($bedrooms)) {
                $query->whereIn('bedrooms', $bedrooms);
            } else {
                $query->where('bedrooms', $bedrooms);
            }
        }

        // Filter by Area Range
        if ($request->has('min_area')) {
            $query->where('area_total', '>=', $request->input('min_area'));
        }
        if ($request->has('max_area')) {
            $query->where('area_total', '<=', $request->input('max_area'));
        }

        // Filter by Price Range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // Sort logic
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        if (in_array($sortBy, ['price', 'area_total', 'floor_number', 'bedrooms', 'created_at'])) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = min((int) $request->input('per_page', 12), 500);
        $paginator = $query->paginate($perPage);

        $paginator->through(function ($apt) {
            $image3d = $apt->image3d->first();

            return [
                'id' => $apt->id,
                'project_id' => $apt->project_id,
                'building_id' => $apt->building_id,
                'building_identifier' => $apt->building?->identifier,
                'project_title' => $apt->project?->title,
                'building_name' => $apt->building?->name,
                'apartment_number' => $apt->apartment_number,
                'floor_number' => $apt->floor_number,
                'rooms' => $apt->rooms,
                'bedrooms' => $apt->bedrooms,
                'bathrooms' => $apt->bathrooms,
                'area_total' => $apt->area_total,
                'area_living' => $apt->area_living,
                'has_balcony' => $apt->has_balcony,
                'price' => $apt->price,
                'status' => $apt->status,
                'image' => $image3d?->full_url,
            ];
        });

        return $paginator->toArray();
    }

    /**
     * Get filter statistics (max bedrooms, price/area ranges)
     */
    private function getFilterStats(): array
    {
        // This is already cached separately in ApartmentController::filters()
        // But we include it here for the combined response
        $stats = Apartment::query()
            ->where('is_active', true)
            ->where('status', 'available')
            ->selectRaw('MAX(bedrooms) as max_bedrooms')
            ->selectRaw('MIN(area_total) as min_area')
            ->selectRaw('MAX(area_total) as max_area')
            ->selectRaw('MIN(price) as min_price')
            ->selectRaw('MAX(price) as max_price')
            ->first();

        return [
            'max_bedrooms' => (int) $stats->max_bedrooms,
            'area' => [
                'min' => (float) $stats->min_area,
                'max' => (float) $stats->max_area,
            ],
            'price' => [
                'min' => (float) $stats->min_price,
                'max' => (float) $stats->max_price,
            ],
        ];
    }

    /**
     * Get projects list for filter dropdown
     */
    private function getProjectsForFilter(string $locale): array
    {
        return Projects::where('is_active', true)
            ->select(['id', 'title', 'status'])
            ->orderByRaw("CASE WHEN status = 'ongoing' THEN 0 ELSE 1 END")
            ->orderBy('title')
            ->get()
            ->map(function ($project) use ($locale) {
                $title = $project->title;

                // Handle JSON translations
                if (is_string($title)) {
                    $decoded = json_decode($title, true);
                    if (is_array($decoded)) {
                        $title = $decoded[$locale] ?? $decoded['ka'] ?? $decoded['en'] ?? $title;
                    }
                } elseif (is_array($title)) {
                    $title = $title[$locale] ?? $title['ka'] ?? $title['en'] ?? '';
                }

                return [
                    'id' => $project->id,
                    'title' => $title,
                    'status' => $project->status,
                ];
            })
            ->toArray();
    }
}
