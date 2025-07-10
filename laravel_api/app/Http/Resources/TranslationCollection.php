<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class TranslationCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => TranslationResource::collection($this->collection),
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
