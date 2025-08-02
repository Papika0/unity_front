<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Translation;
use App\Http\Resources\Api\TranslationResource;
use App\Http\Resources\Api\TranslationCollection;

class TranslationController extends Controller
{
    /**
     * Get translations for public API.
     */
    public function getTranslations(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $group = $request->input('group');

        $query = Translation::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                  ->orWhere('value', 'like', "%{$search}%");
            });
        }

        if ($group) {
            $query->where('group', $group);
        }

        $data = $query->paginate($perPage);
        return new TranslationCollection($data);
    }

    /**
     * Get translations by group for public API.
     */
    public function getByGroup($group, Request $request)
    {
        $perPage = $request->input('per_page', 50);
        return new TranslationCollection(Translation::where('group', $group)->paginate($perPage));
    }
}
