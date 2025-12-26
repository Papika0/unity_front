<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;
use App\Services\SiteSettingsService;
use App\Models\News;
use App\Models\Projects;
use App\Models\Building;
use App\Models\Apartment;
use App\Models\CrmDeal;
use App\Models\CrmStage;
use App\Models\Customer;
use App\Models\Translation;
use App\Models\Feature;
use App\Observers\NewsObserver;
use App\Observers\ProjectsObserver;
use App\Observers\CrmDealObserver;
use App\Observers\CrmStageObserver;
use App\Observers\CustomerObserver;
use App\Observers\TranslationObserver;
use App\Observers\BuildingObserver;
use App\Observers\FeatureObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(SiteSettingsService::class, function ($app) {
            return new SiteSettingsService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers for automatic image cleanup
        News::observe(NewsObserver::class);
        Projects::observe(ProjectsObserver::class);

        // Register CRM observers for apartment status automation and cache invalidation
        CrmDeal::observe(CrmDealObserver::class);
        CrmStage::observe(CrmStageObserver::class);
        Customer::observe(CustomerObserver::class);

        // Register public API observers for cache invalidation
        Translation::observe(TranslationObserver::class);
        Building::observe(BuildingObserver::class);
        Feature::observe(FeatureObserver::class);
        
        // Register morph map for polymorphic relationships (for InteractiveZone only)
        // Using morphMap instead of enforceMorphMap to avoid breaking other polymorphic relations
        Relation::morphMap([
            'building' => Building::class,
            'apartment' => Apartment::class,
        ]);
    }
}
