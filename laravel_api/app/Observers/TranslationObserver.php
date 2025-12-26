<?php

namespace App\Observers;

use App\Models\Translation;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TranslationObserver
{
    /**
     * Clear translation caches when translation changes
     */
    private function clearTranslationCache(Translation $translation): void
    {
        $locales = ['ka', 'en', 'ru'];

        foreach ($locales as $locale) {
            // Clear specific group cache
            if ($translation->group) {
                Cache::forget("translations_group_{$translation->group}_{$locale}");
            }
        }

        // Note: Multi-group caches use hash, so individual translation changes won't auto-clear all combinations
        // They can be cleared manually via dashboard cache:clear or cache:warm commands

        Log::info('TranslationObserver: Cleared translation cache', [
            'group' => $translation->group,
            'key' => $translation->key,
        ]);
    }

    /**
     * Handle the Translation "saved" event (fires after create or update).
     */
    public function saved(Translation $translation): void
    {
        $this->clearTranslationCache($translation);
    }

    /**
     * Handle the Translation "deleted" event.
     */
    public function deleted(Translation $translation): void
    {
        $this->clearTranslationCache($translation);
    }
}
