<?php

namespace App\Services;

use App\Models\Translation;
use App\Http\Resources\Api\TranslationResource;

class TranslationService
{
    /**
     * Get translations using resources with optimized queries
     */
    public function getOptimizedTranslations(array $groups, string $locale): array
    {
        return Translation::whereIn('group', $groups)
            ->where('active', 1)
            ->get(['key', 'text', 'group']) // Only select needed columns
            ->mapWithKeys(function ($translation) use ($locale) {
                $resource = new TranslationResource($translation, $locale);
                $translationData = $resource->toArray(request());
                return [$translationData['key'] => $translationData['text']];
            })
            ->toArray();
    }
}
