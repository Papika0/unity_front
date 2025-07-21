<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NewsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => [
                'ka' => $this->getTranslation('title', 'ka'),
                'en' => $this->getTranslation('title', 'en'),
                'ru' => $this->getTranslation('title', 'ru'),
            ],
            'excerpt' => [
                'ka' => $this->getTranslation('excerpt', 'ka'),
                'en' => $this->getTranslation('excerpt', 'en'),
                'ru' => $this->getTranslation('excerpt', 'ru'),
            ],
            'content' => [
                'ka' => $this->getTranslation('content', 'ka'),
                'en' => $this->getTranslation('content', 'en'),
                'ru' => $this->getTranslation('content', 'ru'),
            ],
            'category' => $this->category,
            'main_image' => $this->main_image,
            'gallery_images' => $this->gallery_images ?: [],
            'tags' => $this->tags ?: [],
            'publish_date' => $this->publish_date->toDateString(),
            'formatted_publish_date' => $this->publish_date->format('Y-m-d H:i:s'),
            'views' => $this->views,
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
