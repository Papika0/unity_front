<?php

namespace App\Observers;

use App\Models\Feature;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FeatureObserver
{
    /**
     * Clear features cache when feature changes
     */
    private function clearFeaturesCache(Feature $feature): void
    {
        // Clear index cache
        Cache::forget("features_index");

        // Clear specific feature show cache
        Cache::forget("feature_show_{$feature->id}");

        Log::info('FeatureObserver: Cleared features cache', [
            'feature_id' => $feature->id,
            'name' => $feature->name,
        ]);
    }

    /**
     * Handle the Feature "saved" event (fires after create or update).
     */
    public function saved(Feature $feature): void
    {
        $this->clearFeaturesCache($feature);
    }

    /**
     * Handle the Feature "deleted" event.
     */
    public function deleted(Feature $feature): void
    {
        $this->clearFeaturesCache($feature);
    }
}
