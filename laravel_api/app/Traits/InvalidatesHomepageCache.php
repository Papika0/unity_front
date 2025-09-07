<?php

namespace App\Traits;

use App\Services\PageCacheService;
use Illuminate\Support\Facades\Log;

trait InvalidatesHomepageCache
{
    /**
     * Boot the trait
     */
    protected static function bootInvalidatesHomepageCache()
    {
        // Listen for model events that should invalidate cache
        static::saved(function ($model) {
            $model->invalidateHomepageCache();
        });

        static::deleted(function ($model) {
            $model->invalidateHomepageCache();
        });
    }

    /**
     * Invalidate homepage cache for all locales
     */
    public function invalidateHomepageCache()
    {
        $cacheService = app(PageCacheService::class);
        
        // Common locales to invalidate
        $locales = ['ka', 'en'];
        
        foreach ($locales as $locale) {
            $cacheKey = "HomePageCache({$locale})";
            
            if ($cacheService->has($cacheKey)) {
                $cacheService->forget($cacheKey);
                Log::info("Homepage cache invalidated for locale: {$locale}");
            }
        }
    }
}
