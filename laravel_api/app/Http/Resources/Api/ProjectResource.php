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
            'main_image' => $this->whenLoaded('mainImage', function() {
                $mainImage = $this->mainImage->first();
                return $mainImage ? [
                    'id' => $mainImage->id,
                    'url' => $mainImage->full_url,
                    'alt_text' => $mainImage->getTranslation('alt_text', $this->locale),
                    'title' => $mainImage->getTranslation('title', $this->locale),
                ] : null;
            }),
            'render_image' => $this->whenLoaded('renderImage', function() {
                $renderImage = $this->renderImage->first();
                return $renderImage ? [
                    'id' => $renderImage->id,
                    'url' => $renderImage->full_url,
                    'alt_text' => $renderImage->getTranslation('alt_text', $this->locale),
                    'title' => $renderImage->getTranslation('title', $this->locale),
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
            'year' => $this->year,
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'featured_order' => $this->featured_order,
            'is_onHomepage' => (bool) $this->is_onHomepage,
            'homepage_order' => $this->homepage_order,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'features' => $this->whenLoaded('features', function () {
                return $this->features->map(function ($feature) {
                    return [
                        'id' => $feature->id,
                        'name' => $feature->name,
                        'title' => $feature->getTitleForLocale($this->locale),
                        'description' => $feature->getDescriptionForLocale($this->locale),
                        'icon' => $feature->icon,
                        'color' => $feature->color,
                        'is_auto_detected' => $feature->pivot->is_auto_detected ?? false,
                        'sort_order' => $feature->pivot->sort_order ?? 0,
                    ];
                });
            }),
            'hasApartmentNavigation' => $this->interactiveZones()
                ->where('zone_type', 'building_block')
                ->where('is_active', true)
                ->exists(),
            // 'created_at' => $this->created_at->toIso8601String(),
            // 'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
