<?php

namespace App\Services;

use App\Models\News;
use App\Models\Projects;
use App\Models\Image;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class CacheWarmingService
{
    protected $baseUrl;
    protected $locales = ['ka', 'en', 'ru'];
    protected $newsCategories = ['company', 'project', 'industry', 'event'];
    protected $projectStatuses = ['planning', 'ongoing', 'completed'];
    protected $galleryCategories = [];

    public function __construct()
    {
        $this->baseUrl = config('app.url') . '/api';
        
        // Get actual gallery categories from database
        $this->galleryCategories = Image::active()
            ->whereNotIn('category', ['news', 'about'])
            ->distinct()
            ->pluck('category')
            ->filter()
            ->toArray();
    }

    /**
     * Warm all public API caches
     */
    public function warmAllCaches(): array
    {
        Log::info('🔥 Starting cache warming for all public APIs...');
        
        $results = [
            'homepage' => $this->warmHomepageCache(),
            'news' => $this->warmNewsCache(),
            'projects' => $this->warmProjectsCache(),
            'gallery' => $this->warmGalleryCache(),
            'about' => $this->warmAboutCache(),
            'contact' => $this->warmContactCache(),
            'footer' => $this->warmFooterCache(),
        ];

        Log::info('✅ Cache warming completed!', $results);
        
        return $results;
    }

    /**
     * Warm homepage cache
     */
    protected function warmHomepageCache(): array
    {
        $results = ['success' => 0, 'failed' => 0];
        
        foreach ($this->locales as $locale) {
            try {
                Http::timeout(30)->get("{$this->baseUrl}/homepage/bootstrap", [
                    'locale' => $locale,
                ]);
                $results['success']++;
                Log::info("✓ Homepage cache warmed for locale: {$locale}");
            } catch (\Exception $e) {
                $results['failed']++;
                Log::error("✗ Failed to warm homepage cache for locale: {$locale}", [
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        return $results;
    }

    /**
     * Warm news cache
     */
    protected function warmNewsCache(): array
    {
        $results = ['success' => 0, 'failed' => 0];
        
        // Get actual news IDs from database
        $newsIds = News::where('is_active', true)
            ->where('publish_date', '<=', now())
            ->pluck('id')
            ->toArray();

        foreach ($this->locales as $locale) {
            // Warm news index (all categories + each category)
            $categories = array_merge(['all'], $this->newsCategories);
            
            foreach ($categories as $category) {
                // Calculate total pages for this category
                $query = News::where('is_active', true)->where('publish_date', '<=', now());
                
                if ($category !== 'all') {
                    $query->where('category', $category);
                }
                
                $total = $query->count();
                $perPage = 9;
                $totalPages = max(1, ceil($total / $perPage));
                
                // Warm first 3 pages (most commonly accessed)
                $pagesToWarm = min(3, $totalPages);
                
                for ($page = 1; $page <= $pagesToWarm; $page++) {
                    try {
                        $params = [
                            'locale' => $locale,
                            'per_page' => $perPage,
                            'page' => $page,
                        ];
                        
                        if ($category !== 'all') {
                            $params['category'] = $category;
                        }
                        
                        Http::timeout(30)->get("{$this->baseUrl}/news", $params);
                        $results['success']++;
                        Log::info("✓ News index warmed: locale={$locale}, category={$category}, page={$page}");
                    } catch (\Exception $e) {
                        $results['failed']++;
                        Log::error("✗ Failed to warm news index", [
                            'locale' => $locale,
                            'category' => $category,
                            'page' => $page,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
            
            // Warm featured news
            try {
                Http::timeout(30)->get("{$this->baseUrl}/news/featured", ['locale' => $locale]);
                $results['success']++;
                Log::info("✓ Featured news warmed for locale: {$locale}");
            } catch (\Exception $e) {
                $results['failed']++;
                Log::error("✗ Failed to warm featured news for locale: {$locale}");
            }
            
            // Warm recent news
            try {
                Http::timeout(30)->get("{$this->baseUrl}/news/recent", [
                    'locale' => $locale,
                    'limit' => 10,
                ]);
                $results['success']++;
                Log::info("✓ Recent news warmed for locale: {$locale}");
            } catch (\Exception $e) {
                $results['failed']++;
                Log::error("✗ Failed to warm recent news for locale: {$locale}");
            }
            
            // Warm individual news articles (limit to most recent 20 for performance)
            $recentNewsIds = array_slice($newsIds, 0, 20);
            foreach ($recentNewsIds as $newsId) {
                try {
                    Http::timeout(30)->get("{$this->baseUrl}/news/{$newsId}", [
                        'locale' => $locale,
                    ]);
                    $results['success']++;
                } catch (\Exception $e) {
                    $results['failed']++;
                    Log::error("✗ Failed to warm news article {$newsId} for locale: {$locale}");
                }
            }
            
            Log::info("✓ News cache warmed for locale: {$locale} ({$results['success']} requests)");
        }
        
        return $results;
    }

    /**
     * Warm projects cache
     */
    protected function warmProjectsCache(): array
    {
        $results = ['success' => 0, 'failed' => 0];
        
        // Get actual project IDs from database
        $projectIds = Projects::where('is_active', true)->pluck('id')->toArray();

        foreach ($this->locales as $locale) {
            // Warm projects-page (all statuses + each status)
            $statuses = array_merge(['all'], $this->projectStatuses);
            
            foreach ($statuses as $status) {
                // Calculate total pages for this status
                $query = Projects::where('is_active', true);
                
                if ($status !== 'all') {
                    $query->where('status', $status);
                }
                
                $total = $query->count();
                $perPage = 6;
                $totalPages = max(1, ceil($total / $perPage));
                
                // Warm first 3 pages
                $pagesToWarm = min(3, $totalPages);
                
                for ($page = 1; $page <= $pagesToWarm; $page++) {
                    try {
                        $params = [
                            'locale' => $locale,
                            'per_page' => $perPage,
                            'page' => $page,
                        ];
                        
                        if ($status !== 'all') {
                            $params['status'] = $status;
                        }
                        
                        Http::timeout(30)->get("{$this->baseUrl}/projects-page", $params);
                        $results['success']++;
                        Log::info("✓ Projects-page warmed: locale={$locale}, status={$status}, page={$page}");
                    } catch (\Exception $e) {
                        $results['failed']++;
                        Log::error("✗ Failed to warm projects-page", [
                            'locale' => $locale,
                            'status' => $status,
                            'page' => $page,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
            
            // Warm individual project pages (all projects)
            foreach ($projectIds as $projectId) {
                try {
                    Http::timeout(30)->get("{$this->baseUrl}/projects/{$projectId}", [
                        'locale' => $locale,
                    ]);
                    $results['success']++;
                } catch (\Exception $e) {
                    $results['failed']++;
                    Log::error("✗ Failed to warm project {$projectId} for locale: {$locale}");
                }
            }
            
            // Warm project features for each project
            foreach ($projectIds as $projectId) {
                try {
                    Http::timeout(30)->get("{$this->baseUrl}/features/project/{$projectId}");
                    $results['success']++;
                } catch (\Exception $e) {
                    $results['failed']++;
                    Log::error("✗ Failed to warm features for project {$projectId}");
                }
            }
            
            Log::info("✓ Projects cache warmed for locale: {$locale}");
        }
        
        return $results;
    }

    /**
     * Warm gallery cache
     */
    protected function warmGalleryCache(): array
    {
        $results = ['success' => 0, 'failed' => 0];

        foreach ($this->locales as $locale) {
            // Warm gallery-page (all categories + each category)
            $categories = array_merge(['all'], $this->galleryCategories);
            
            foreach ($categories as $category) {
                // Calculate total pages for this category
                $query = Image::active()
                    ->join('imageables', 'images.id', '=', 'imageables.image_id')
                    ->where('imageables.type', 'gallery')
                    ->whereNotIn('images.category', ['news', 'about']);
                
                if ($category !== 'all') {
                    $query->where('images.category', $category);
                }
                
                $total = $query->count();
                $perPage = 12;
                $totalPages = max(1, ceil($total / $perPage));
                
                // Warm first 3 pages
                $pagesToWarm = min(3, $totalPages);
                
                for ($page = 1; $page <= $pagesToWarm; $page++) {
                    try {
                        $params = [
                            'locale' => $locale,
                            'limit' => $perPage,
                            'page' => $page,
                        ];
                        
                        if ($category !== 'all') {
                            $params['category'] = $category;
                        }
                        
                        Http::timeout(30)->get("{$this->baseUrl}/gallery-page", $params);
                        $results['success']++;
                        Log::info("✓ Gallery-page warmed: locale={$locale}, category={$category}, page={$page}");
                    } catch (\Exception $e) {
                        $results['failed']++;
                        Log::error("✗ Failed to warm gallery-page", [
                            'locale' => $locale,
                            'category' => $category,
                            'page' => $page,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
            
            // Warm gallery categories endpoint
            try {
                Http::timeout(30)->get("{$this->baseUrl}/gallery/categories");
                $results['success']++;
                Log::info("✓ Gallery categories warmed");
            } catch (\Exception $e) {
                $results['failed']++;
                Log::error("✗ Failed to warm gallery categories");
            }
            
            Log::info("✓ Gallery cache warmed for locale: {$locale}");
        }
        
        return $results;
    }

    /**
     * Warm about cache
     */
    protected function warmAboutCache(): array
    {
        $results = ['success' => 0, 'failed' => 0];

        foreach ($this->locales as $locale) {
            try {
                Http::timeout(30)->get("{$this->baseUrl}/about", [
                    'locale' => $locale,
                    'groups' => ['messages', 'about', 'buttons'],
                ]);
                $results['success']++;
                Log::info("✓ About cache warmed for locale: {$locale}");
            } catch (\Exception $e) {
                $results['failed']++;
                Log::error("✗ Failed to warm about cache for locale: {$locale}");
            }
        }
        
        return $results;
    }

    /**
     * Warm contact cache
     */
    protected function warmContactCache(): array
    {
        $results = ['success' => 0, 'failed' => 0];

        foreach ($this->locales as $locale) {
            try {
                Http::timeout(30)->get("{$this->baseUrl}/contact-info/settings", [
                    'locale' => $locale,
                    'groups' => ['messages', 'contact', 'buttons'],
                ]);
                $results['success']++;
                Log::info("✓ Contact cache warmed for locale: {$locale}");
            } catch (\Exception $e) {
                $results['failed']++;
                Log::error("✗ Failed to warm contact cache for locale: {$locale}");
            }
        }
        
        return $results;
    }

    /**
     * Warm footer cache
     */
    protected function warmFooterCache(): array
    {
        $results = ['success' => 0, 'failed' => 0];

        foreach ($this->locales as $locale) {
            try {
                Http::timeout(30)->get("{$this->baseUrl}/footer", [
                    'locale' => $locale,
                ]);
                $results['success']++;
                Log::info("✓ Footer cache warmed for locale: {$locale}");
            } catch (\Exception $e) {
                $results['failed']++;
                Log::error("✗ Failed to warm footer cache for locale: {$locale}");
            }
        }
        
        return $results;
    }

    /**
     * Get cache warming progress summary
     */
    public function getCacheSummary(): array
    {
        return [
            'locales' => $this->locales,
            'news_categories' => $this->newsCategories,
            'project_statuses' => $this->projectStatuses,
            'gallery_categories' => $this->galleryCategories,
            'estimated_requests' => $this->estimateTotalRequests(),
        ];
    }

    /**
     * Estimate total number of cache warming requests
     */
    protected function estimateTotalRequests(): int
    {
        $localeCount = count($this->locales);
        $newsCount = News::where('is_active', true)->where('publish_date', '<=', now())->count();
        $projectsCount = Projects::where('is_active', true)->count();
        
        // Rough estimation
        $homepage = $localeCount; // 3
        $newsIndex = $localeCount * (count($this->newsCategories) + 1) * 3; // ~45 (3 pages per category)
        $newsFeatured = $localeCount; // 3
        $newsRecent = $localeCount; // 3
        $newsArticles = $localeCount * min(20, $newsCount); // ~60
        $projectsPage = $localeCount * (count($this->projectStatuses) + 1) * 3; // ~36
        $projectsDetails = $localeCount * $projectsCount; // ~variable
        $projectFeatures = $projectsCount; // ~variable
        $gallery = $localeCount * (count($this->galleryCategories) + 1) * 3; // ~variable
        $about = $localeCount; // 3
        $contact = $localeCount; // 3
        $footer = $localeCount; // 3
        
        return $homepage + $newsIndex + $newsFeatured + $newsRecent + $newsArticles + 
               $projectsPage + $projectsDetails + $projectFeatures + 
               $gallery + $about + $contact + $footer;
    }
}
