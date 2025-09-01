<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class TranslationResource extends JsonResource
{
    protected $locale;

    public function __construct($resource, $locale = 'ka')
    {
        parent::__construct($resource);
        $this->locale = $locale;
    }

    public function toArray($request)
    {
        return [
            'key' => $this->key,
            'text' => $this->getTranslation('text', $this->locale),
            'group' => $this->group,
        ];
    }
}
