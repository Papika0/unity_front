<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Translation;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class TranslationsController extends Controller
{
    use ApiResponse;

    /**
     * Get translations for a specific group and locale
     * Returns a flat key-value object for easy frontend consumption
     */
    public function getByGroup(Request $request, string $group)
    {
        try {
            $locale = $request->get('locale', 'ka');

            // Validate locale
            if (!in_array($locale, ['ka', 'en', 'ru'])) {
                return $this->error('Invalid locale', 400);
            }

            // Get all active translations for this group
            $translations = Translation::where('group', $group)
                ->where('active', true)
                ->get();

            // Transform to flat key-value object for current locale
            $result = [];
            foreach ($translations as $translation) {
                $key = $translation->key;
                $text = $translation->getTranslation('text', $locale);
                $result[$key] = $text;
            }

            return $this->success($result);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch translations', 500);
        }
    }

    /**
     * Get translations for multiple groups at once
     * Useful for loading page translations in one request
     */
    public function getByGroups(Request $request)
    {
        try {
            $locale = $request->get('locale', 'ka');
            $groups = $request->get('groups', []);

            // Validate locale
            if (!in_array($locale, ['ka', 'en', 'ru'])) {
                return $this->error('Invalid locale', 400);
            }

            // Validate groups is an array
            if (!is_array($groups) || empty($groups)) {
                return $this->error('Groups must be a non-empty array', 400);
            }

            // Get all active translations for these groups
            $translations = Translation::whereIn('group', $groups)
                ->where('active', true)
                ->get();

            // Transform to flat key-value object for current locale
            $result = [];
            foreach ($translations as $translation) {
                $key = $translation->key;
                $text = $translation->getTranslation('text', $locale);
                $result[$key] = $text;
            }

            return $this->success($result);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch translations', 500);
        }
    }
}
