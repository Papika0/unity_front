<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
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
            'main_image'       => $this->main_image,
            'render_image'     => $this->render_image,
            'gallery_images'   => $this->gallery_images,
            'year'             => $this->year,
            'is_active'        => (bool) $this->is_active,
            'is_featured'      => (bool) $this->is_featured,
            'latitude'         => $this->latitude,
            'longitude'        => $this->longitude,
            'meta_title'       => $this->meta_title,
            'meta_description' => $this->meta_description,
            'created_at'       => $this->created_at->toIso8601String(),
            'updated_at'       => $this->updated_at->toIso8601String(),
        ];
    }
}
