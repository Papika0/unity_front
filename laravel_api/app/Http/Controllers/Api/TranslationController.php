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
     * Get translations by group for public API.
     */
    public function getByGroup($group, Request $request)
    {
        $perPage = $request->input('per_page', 50);
        return new TranslationCollection(Translation::where('group', $group)->paginate($perPage));
    }
}
