<?php

namespace App\Observers;

use App\Models\Building;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BuildingObserver
{
    /**
     * Clear building caches when building changes
     */
    private function clearBuildingCache(Building $building): void
    {
        $locales = ['ka', 'en', 'ru'];

        foreach ($locales as $locale) {
            // Clear buildings index for this project
            if ($building->project_id) {
                Cache::forget("buildings_index_project_{$building->project_id}_{$locale}");
            }

            // Clear building show cache by ID
            Cache::forget("building_show_{$building->project_id}_{$building->id}_{$locale}");

            // Clear building show cache by identifier (if set)
            if ($building->identifier) {
                Cache::forget("building_show_{$building->project_id}_{$building->identifier}_{$locale}");
            }
        }

        // Also clear parent project cache (since projects include buildings relation)
        if ($building->project_id) {
            $this->clearProjectCache();
        }

        Log::info('BuildingObserver: Cleared building cache', [
            'building_id' => $building->id,
            'project_id' => $building->project_id,
        ]);
    }

    /**
     * Clear all project caches (affects buildings relation)
     */
    private function clearProjectCache(): void
    {
        $locales = ['ka', 'en', 'ru'];

        foreach ($locales as $locale) {
            Cache::forget("projects_index_{$locale}");
            Cache::forget("projects_featured_{$locale}");
            Cache::forget("projects_homepage_{$locale}");
        }
    }

    /**
     * Handle the Building "saved" event (fires after create or update).
     */
    public function saved(Building $building): void
    {
        $this->clearBuildingCache($building);
    }

    /**
     * Handle the Building "deleted" event.
     */
    public function deleted(Building $building): void
    {
        $this->clearBuildingCache($building);
    }
}
