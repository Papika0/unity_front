<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminBuildingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $translations = $this->getTranslations('name');

        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'name' => $translations['ka'] ?? null,
            'name_ka' => $translations['ka'] ?? null,
            'name_en' => $translations['en'] ?? null,
            'name_ru' => $translations['ru'] ?? null,
            'identifier' => $this->identifier,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'apartments_count' => $this->apartments_count ?? 0,
            'available_count' => $this->available_count ?? 0,
            'reserved_count' => $this->reserved_count ?? 0,
            'sold_count' => $this->sold_count ?? 0,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
