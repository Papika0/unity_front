<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use App\Http\Resources\Admin\AdminTranslationResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

class AdminTranslationCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => AdminTranslationResource::collection($this->collection),
            'meta' => [
                'current_page' => $this->resource->currentPage(),
                'last_page' => $this->resource->lastPage(),
                'per_page' => $this->resource->perPage(),
                'total' => $this->resource->total(),
            ],
        ];
    }

    public function toResponse($request)
    {
        return response()->json($this->toArray($request));
    }
}
