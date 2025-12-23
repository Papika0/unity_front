<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminApartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'building_id' => $this->building_id,
            'floor_number' => $this->floor_number,
            'apartment_number' => $this->apartment_number,
            'cadastral_code' => $this->cadastral_code,
            'status' => $this->status,
            'price' => $this->price,
            'area_total' => $this->area_total,
            'area_living' => $this->area_living,
            'summer_area' => $this->summer_area,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'has_balcony' => (bool) $this->has_balcony,
            'is_parking' => (bool) $this->is_parking,
            'room_details' => $this->room_details ? json_decode($this->room_details, true) : null,
            'image_2d' => $this->whenLoaded('image2d', function () {
                $image = $this->image2d->first();
                return $image ? [
                    'id' => $image->id,
                    'url' => $image->full_url,
                    'title' => $image->title,
                ] : null;
            }),
            'image_3d' => $this->whenLoaded('image3d', function () {
                $image = $this->image3d->first();
                return $image ? [
                    'id' => $image->id,
                    'url' => $image->full_url,
                    'title' => $image->title,
                ] : null;
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
