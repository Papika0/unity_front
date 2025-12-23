<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Apartment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ApartmentController extends Controller
{
    /**
     * Get detailed apartment information
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = "apartment_{$locale}_{$id}";

        $apartmentData = Cache::remember($cacheKey, 1800, function () use ($id) {
            $apartment = Apartment::with(['project', 'building', 'interactiveZone', 'image2d', 'image3d'])
                ->findOrFail($id);

            // Get floor plan image if exists (assuming it's attached via morphToMany)
            $floorPlanImage = $apartment->interactiveZone?->images()->first();

            // Get 2D and 3D images
            $image2d = $apartment->image2d->first();
            $image3d = $apartment->image3d->first();

            // Find similar apartments (same bedrooms, similar area ±10%)
            $similar = Apartment::where('building_id', $apartment->building_id)
                ->where('id', '!=', $apartment->id)
                ->where('bedrooms', $apartment->bedrooms)
                ->where('status', 'available')
                ->where('is_active', true)
                ->when($apartment->area_total, function ($query) use ($apartment) {
                    $minArea = $apartment->area_total * 0.9;
                    $maxArea = $apartment->area_total * 1.1;
                    return $query->whereBetween('area_total', [$minArea, $maxArea]);
                })
                ->limit(5)
                ->get()
                ->map(function ($apt) {
                    return [
                        'id' => $apt->id,
                        'apartment_number' => $apt->apartment_number,
                        'floor_number' => $apt->floor_number,
                        'status' => $apt->status,
                        'price' => $apt->price,
                        'area_total' => $apt->area_total,
                        'area_living' => $apt->area_living,
                        'bedrooms' => $apt->bedrooms,
                        'bathrooms' => $apt->bathrooms,
                        'has_balcony' => $apt->has_balcony,
                        'has_parking' => $apt->has_parking,
                    ];
                });

            return [
                'id' => $apartment->id,
                'project' => [
                    'id' => $apartment->project->id,
                    'title' => $apartment->project->title,
                    'location' => $apartment->project->location,
                ],
                'building' => [
                    'id' => $apartment->building->id,
                    'name' => $apartment->building->name,
                    'identifier' => $apartment->building->identifier,
                ],
                'floor_number' => $apartment->floor_number,
                'apartment_number' => $apartment->apartment_number,
                'status' => $apartment->status,
                'price' => $apartment->price,
                'area_total' => $apartment->area_total,
                'area_living' => $apartment->area_living,
                'bedrooms' => $apartment->bedrooms,
                'bathrooms' => $apartment->bathrooms,
                'has_balcony' => $apartment->has_balcony,
                'has_parking' => $apartment->has_parking,
                'room_details' => is_string($apartment->room_details) ? json_decode($apartment->room_details, true) : $apartment->room_details,
                'floor_plan_image' => $floorPlanImage?->url,
                'image_2d' => $image2d ? [
                    'id' => $image2d->id,
                    'url' => $image2d->full_url,
                ] : null,
                'image_3d' => $image3d ? [
                    'id' => $image3d->id,
                    'url' => $image3d->full_url,
                ] : null,
                'similar_apartments' => $similar,
            ];
        });

        return response()->json($apartmentData);
    }
}
