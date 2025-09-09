<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
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
            'description' => $this->getTranslation('description', $this->locale),
            'location' => $this->getTranslation('location', $this->locale),
            'status_name' => trans('projects.statuses.' . $this->status, [], $this->locale),
            'status' => $this->status,
            'start_date' => $this->start_date ? $this->start_date->toDateString() : null,
            'completion_date' => $this->completion_date ? $this->completion_date->toDateString() : null,
            'main_image' => $this->main_image,
            'render_image' => $this->render_image,
            'gallery_images' => $this->gallery_images ?? [],
            'year' => $this->year,
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'is_onHomepage' => (bool) $this->is_onHomepage,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            // 'created_at' => $this->created_at->toIso8601String(),
            // 'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
