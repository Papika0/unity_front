<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Translation;
use App\Http\Requests\Admin\Translations\TranslationRequest;
use App\Http\Resources\Api\TranslationResource;
use App\Http\Resources\Api\TranslationCollection;

class TranslationController extends Controller
{
    public function getTranslations(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search', '');

        $query = Translation::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('text->en', 'LIKE', "%$search%")
                    ->orWhere('text->ka', 'LIKE', "%$search%")
                    ->orWhere('text->ru', 'LIKE', "%$search%")
                    ->orWhere('key', 'LIKE', "%$search%");
            });
        }

        $data = $query->paginate($perPage);
        return new TranslationCollection($data);
    }

    public function createTranslation(TranslationRequest $request)
    {
        $translation = Translation::create($request->validated());
        return new TranslationResource($translation);
    }

    public function updateTranslation(TranslationRequest $request, $id)
    {
        $translation = Translation::findOrFail($id);
        $translation->update($request->validated());
        return new TranslationResource($translation);
    }

    // public function deleteTranslation($id)
    // {
    //     Translation::findOrFail($id)->delete();
    //     return response()->json(null, 204);
    // }

    public function getTranslation($id)
    {
        return new TranslationResource(Translation::findOrFail($id));
    }

    public function getTranslationsByGroup(Request $request, $group)
    {
        $perPage = $request->input('per_page', 15);
        return new TranslationCollection(Translation::where('group', $group)->paginate($perPage));
    }
}
