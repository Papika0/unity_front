<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TranslationResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'text_en' => $this->getTranslation('text', 'en'),
            'text_ka' => $this->getTranslation('text', 'ka'),
            'text_ru' => $this->getTranslation('text', 'ru'),
            'group' => $this->group,
            'active' => $this->active,
        ];
    }
}
