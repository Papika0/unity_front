<?php

namespace App\Services;

use App\Models\Projects;
use App\Http\Resources\Api\ProjectResource;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProjectService
{
    /**
     * Get optimized projects data for various uses (homepage, footer, etc.)
     * 
     * @param string $locale
     * @param int $cacheTtl Cache time in seconds (default: 1 hour)
     * @return array
     */
    public function getOptimizedProjects(string $locale = 'ka', int $cacheTtl = 3600): array
    {
        $cacheKey = "optimized_projects_{$locale}";
        
        return Cache::remember($cacheKey, $cacheTtl, function () use ($locale) {
            try {
                // Select only essential columns to reduce memory usage
                $essentialColumns = [
                    'id', 'title', 'location', 'status', 'description',
                    'main_image', 
                    'is_active', 'is_featured',
                    'is_onHomepage', 'meta_title',
                    'meta_description', 'created_at'
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
            } catch (\Exception $e) {
                Log::error('ProjectService: Failed to get optimized projects', [
                    'error' => $e->getMessage(),
                    'locale' => $locale
                ]);
                
                // Return empty structure on error
                return [
                    'all' => [],
                    'is_featured' => [],
                    'is_onHomepage' => [],
                    'is_alone' => null,
                ];
            }
        });
    }

    /**
     * Get projects specifically for footer (limited number for performance)
     * 
     * @param string $locale
     * @param int $limit
     * @return array
     */
    public function getFooterProjects(string $locale = 'ka', int $limit = 6): array
    {
        $cacheKey = "footer_projects_{$locale}_{$limit}";
        
        return Cache::remember($cacheKey, 3600, function () use ($locale, $limit) {
            try {
                $projects = Projects::where('is_active', true)
                    ->select(['id', 'title', 'main_image'])
                    ->latest()
                    ->limit($limit)
                    ->get()
                    ->map(function ($project) use ($locale) {
                        $resource = new ProjectResource($project, $locale);
                        return $resource->toArray(request());
                    });

                return $projects->toArray();
            } catch (\Exception $e) {
                Log::error('ProjectService: Failed to get footer projects', [
                    'error' => $e->getMessage(),
                    'locale' => $locale,
                    'limit' => $limit
                ]);
                
                return [];
            }
        });
    }

    /**
     * Clear projects cache
     * 
     * @param string|null $locale If null, clears all locales
     */
    public function clearCache(?string $locale = null): void
    {
        if ($locale) {
            Cache::forget("optimized_projects_{$locale}");
            Cache::forget("footer_projects_{$locale}_6"); // Default limit
        } else {
            // Clear all project caches
            $locales = ['ka', 'en']; // Add more locales as needed
            foreach ($locales as $loc) {
                Cache::forget("optimized_projects_{$loc}");
                Cache::forget("footer_projects_{$loc}_6");
            }
        }
    }
}