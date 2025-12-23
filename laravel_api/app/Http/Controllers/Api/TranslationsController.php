<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Translation;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

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
            // Locale is now set by middleware from Accept-Language header
            $locale = App::getLocale();

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
            // Locale is now set by middleware from Accept-Language header
            $locale = App::getLocale();
            $groups = $request->get('groups', []);

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
