<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class NewsResource extends JsonResource
{
    protected $locale;

    public function __construct($resource, $locale = 'ka')
    {
        parent::__construct($resource);
        $this->locale = $locale;
    }

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
            'title' => $this->getTranslation('title', $this->locale),
            'excerpt' => $this->getTranslation('excerpt', $this->locale),
            'content' => $this->getTranslation('content', $this->locale),
            'category' => $this->category,
            'main_image' => $this->whenLoaded('mainImage', function() {
                $mainImage = $this->mainImage->first();
                return $mainImage ? [
                    'id' => $mainImage->id,
                    'url' => $mainImage->full_url,
                    'alt_text' => $mainImage->getTranslation('alt_text', $this->locale),
                    'title' => $mainImage->getTranslation('title', $this->locale),
                ] : null;
            }),
            'gallery_images' => $this->whenLoaded('galleryImages', function() {
                return $this->galleryImages->map(function($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->full_url,
                        'alt_text' => $image->getTranslation('alt_text', $this->locale),
                        'title' => $image->getTranslation('title', $this->locale),
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
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
