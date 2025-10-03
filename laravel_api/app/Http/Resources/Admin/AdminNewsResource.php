<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class AdminNewsResource extends JsonResource
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
            'main_image' => $this->whenLoaded('mainImage', function() {
                $mainImage = $this->mainImage->first();
                return $mainImage ? [
                    'id' => $mainImage->id,
                    'url' => $mainImage->full_url,
                    'alt_text' => $mainImage->alt_text,
                    'title' => $mainImage->title,
                ] : null;
            }),
            'gallery_images' => $this->whenLoaded('galleryImages', function() {
                return $this->galleryImages->map(function($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->full_url,
                        'alt_text' => $image->alt_text,
                        'title' => $image->title,
                        'sort_order' => $image->pivot->sort_order,
                    ];
                });
            }, []),
            'tags' => $this->tags ?: [],
            'publish_date' => $this->publish_date ? $this->publish_date->toDateString() : null,
            'formatted_publish_date' => $this->publish_date ? $this->publish_date->format('Y-m-d H:i:s') : null,
            'views' => $this->views,
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toIso8601String() : null,
        ];
    }
}
