<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class AdminProjectResource extends JsonResource
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
            'id'               => $this->id,
            'title'            => $this->getTranslation('title', 'ka'),
            'title_en'         => $this->getTranslation('title', 'en'),
            'title_ru'         => $this->getTranslation('title', 'ru'),
            'title_ka'         => $this->getTranslation('title', 'ka'),
            'description'      => $this->getTranslation('description', 'ka'),
            'description_en'   => $this->getTranslation('description', 'en'),
            'description_ru'   => $this->getTranslation('description', 'ru'),
            'description_ka'   => $this->getTranslation('description', 'ka'),
            'location_en'      => $this->getTranslation('location', 'en'),
            'location_ru'      => $this->getTranslation('location', 'ru'),
            'location_ka'      => $this->getTranslation('location', 'ka'),
            'location'         => $this->getTranslation('location', 'ka'),
           'status_name'           => trans(
                                     'projects.statuses.' . $this->status,
                                     [], 
                                     'ka'
                                  ),
            'status'            => $this->status,
            'start_date'       => $this->start_date->toDateString(),
            'completion_date'  => $this->completion_date->toDateString(),
            'main_image' => $this->whenLoaded('mainImage', function() {
                $mainImage = $this->mainImage->first();
                return $mainImage ? [
                    'id' => $mainImage->id,
                    'url' => $mainImage->full_url,
                    'alt_text' => $mainImage->alt_text,
                    'title' => $mainImage->title,
                ] : null;
            }),
            'render_image' => $this->whenLoaded('renderImage', function() {
                $renderImage = $this->renderImage->first();
                return $renderImage ? [
                    'id' => $renderImage->id,
                    'url' => $renderImage->full_url,
                    'alt_text' => $renderImage->alt_text,
                    'title' => $renderImage->title,
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
            'year'             => $this->year,
            'is_active'        => (bool) $this->is_active,
            'is_featured'      => (bool) $this->is_featured,
            'is_onHomepage'    => (bool) $this->is_onHomepage,
            'latitude'         => $this->latitude,
            'longitude'        => $this->longitude,
            'meta_title'       => $this->meta_title,
            'meta_description' => $this->meta_description,
            'created_at'       => $this->created_at->toIso8601String(),
            'updated_at'       => $this->updated_at->toIso8601String(),
        ];
    }
}
