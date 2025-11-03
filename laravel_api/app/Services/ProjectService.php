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
                    'is_active', 'is_featured', 'featured_order',
                    'is_onHomepage', 'homepage_order', 'meta_title',
                    'meta_description', 'created_at'
                ];

                // Get all active projects in one query, prioritizing ongoing projects
                $allProjects = Projects::where('is_active', true)
                    ->with(['mainImage', 'renderImage', 'galleryImages'])
                    ->select($essentialColumns)
                    ->orderByRaw("CASE WHEN status = 'ongoing' THEN 0 WHEN status = 'planning' THEN 1 ELSE 2 END")
                    ->latest()
                    ->get()
                    ->map(function ($project) use ($locale) {
                        $resource = new ProjectResource($project, $locale);
                        return $resource->toArray(request());
                    });

                // Efficiently separate by type using collections
                // For is_alone, prioritize ongoing projects
                $aloneProject = $allProjects
                    ->where('is_onHomepage', false)
                    ->where('is_featured', false)
                    ->where('status', 'ongoing')
                    ->values()
                    ->first();

                // If no ongoing project found, fallback to any project that's not on homepage or featured
                if (!$aloneProject) {
                    $aloneProject = $allProjects
                        ->where('is_onHomepage', false)
                        ->where('is_featured', false)
                        ->values()
                        ->first();
                }

                return [
                    'all' => $allProjects->values()->toArray(),
                    'is_featured' => $allProjects
                        ->where('is_featured', true)
                        ->sortBy('featured_order')
                        ->values()
                        ->toArray(),
                    'is_onHomepage' => $allProjects
                        ->where('is_onHomepage', true)
                        ->sortBy('homepage_order')
                        ->values()
                        ->toArray(),
                    'is_alone' => $aloneProject,
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
     * Prioritizes ongoing projects
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
                // First, get ongoing projects
                $ongoingProjects = Projects::where('is_active', true)
                    ->where('status', 'ongoing')
                    ->with('mainImage')
                    ->select(['id', 'title', 'status'])
                    ->latest()
                    ->limit($limit)
                    ->get();

                // If we have enough ongoing projects, use them
                if ($ongoingProjects->count() >= $limit) {
                    $projects = $ongoingProjects;
                } else {
                    // Otherwise, fill the rest with other active projects
                    $remainingLimit = $limit - $ongoingProjects->count();

                    $otherProjects = Projects::where('is_active', true)
                        ->where('status', '!=', 'ongoing')
                        ->with('mainImage')
                        ->select(['id', 'title', 'status'])
                        ->latest()
                        ->limit($remainingLimit)
                        ->get();

                    $projects = $ongoingProjects->merge($otherProjects);
                }

                $projects = $projects
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