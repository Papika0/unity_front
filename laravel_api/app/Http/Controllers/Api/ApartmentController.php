<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Apartment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ApartmentController extends Controller
{
    /**
     * Get list of apartments with filtering
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $locale = app()->getLocale();

        // Cache key based on query parameters to cache search results efficiently
        // We sort the request keys to ensure consistent cache keys for same parameters
        $queryParams = request()->all();
        ksort($queryParams);
        $queryString = http_build_query($queryParams);
        $cacheKey = "apartments_search_{$locale}_{$queryString}";

        // Cache for 5 minutes as inventory changes frequently
        $apartments = Cache::remember($cacheKey, 300, function () {
            $query = Apartment::with(['project', 'building', 'image2d', 'image3d', 'interactiveZone.images'])
                ->where('is_active', true)
                ->where('status', 'available');

            // Filter by Project
            if (request()->has('project_id')) {
                $query->where('project_id', request('project_id'));
            }

            // Filter by Building
            if (request()->has('building_id')) {
                $query->where('building_id', request('building_id'));
            }

            // Filter by Floor
            if (request()->has('floor_number')) {
                $query->where('floor_number', request('floor_number'));
            }

            // Filter by Bedrooms (support array or single value)
            if (request()->has('bedrooms')) {
                $bedrooms = request('bedrooms');
                if (is_array($bedrooms)) {
                    $query->whereIn('bedrooms', $bedrooms);
                } else {
                    $query->where('bedrooms', $bedrooms);
                }
            }

            // Filter by Area Range
            if (request()->has('min_area')) {
                $query->where('area_total', '>=', request('min_area'));
            }
            if (request()->has('max_area')) {
                $query->where('area_total', '<=', request('max_area'));
            }

            // Filter by Price Range (Back-end support only for now)
            if (request()->has('min_price')) {
                $query->where('price', '>=', request('min_price'));
            }
            if (request()->has('max_price')) {
                $query->where('price', '<=', request('max_price'));
            }

            // Sort logic
            $sortBy = request('sort_by', 'created_at');
            $sortDir = request('sort_dir', 'desc');

            // Allow list of sortable columns
            if (in_array($sortBy, ['price', 'area_total', 'floor_number', 'bedrooms', 'created_at'])) {
                $query->orderBy($sortBy, $sortDir);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
            $perPage = (int) request('per_page', 12);
            // Cap at 500 to prevent abuse
            $perPage = min($perPage, 500);
            $paginator = $query->paginate($perPage);
            $paginator->through(function ($apt) {
                // Determine main image logic
                $image2d = $apt->image2d->first();
                $image3d = $apt->image3d->first();
                $floorPlan = $apt->interactiveZone?->images()->first();

                return [
                    'id' => $apt->id,
                    'project_id' => $apt->project_id,
                    'building_id' => $apt->building_id,
                    'building_identifier' => $apt->building->identifier, // Added identifier
                    'project_title' => $apt->project->title,
                    'building_name' => $apt->building->name,
                    'apartment_number' => $apt->apartment_number,
                    'floor_number' => $apt->floor_number,
                    'rooms' => $apt->rooms,
                    'bedrooms' => $apt->bedrooms,
                    'bathrooms' => $apt->bathrooms,
                    'area_total' => $apt->area_total,
                    'area_living' => $apt->area_living,
                    'has_balcony' => $apt->has_balcony,
                    'price' => $apt->price,
                    'status' => $apt->status,
                    'image' => $image3d ? $image3d->full_url : ($image2d ? $image2d->full_url : ($floorPlan ? $floorPlan->url : null)),
                    'image_2d' => $image2d ? $image2d->full_url : null,
                    'image_3d' => $image3d ? $image3d->full_url : null,
                ];
            });

            return $paginator;
        });

        return response()->json($apartments);
    }

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
                ->with(['image2d', 'image3d', 'interactiveZone.images', 'building'])
                ->limit(5)
                ->get()
                ->map(function ($apt) {
                    $image2d = $apt->image2d->first();
                    $image3d = $apt->image3d->first();
                    $floorPlan = $apt->interactiveZone?->images()->first();

                    return [
                        'id' => $apt->id,
                        'project' => [
                            'id' => $apt->project->id,
                            'title' => $apt->project->title,
                        ],
                        'apartment_number' => $apt->apartment_number,
                        'building' => [
                            'id' => $apt->building->id,
                            'name' => $apt->building->name,
                        ],
                        'floor_number' => $apt->floor_number,
                        'status' => $apt->status,
                        'price' => $apt->price,
                        'area_total' => $apt->area_total,
                        'area_living' => $apt->area_living,
                        'bedrooms' => $apt->bedrooms,
                        'bathrooms' => $apt->bathrooms,
                        'has_balcony' => $apt->has_balcony,
                        'has_parking' => $apt->has_parking,
                        'image' => $image3d ? $image3d->full_url : ($image2d ? $image2d->full_url : ($floorPlan ? $floorPlan->url : null)),
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

    /**
     * Get filter options (max bedrooms, price range, area range)
     *
     * @return JsonResponse
     */
    public function filters(): JsonResponse
    {
        // Cache filter options for 1 hour since they don't change often
        $stats = Cache::remember('apartment_filters_stats', 3600, function () {
            return Apartment::query()
                ->where('is_active', true)
                ->where('status', 'available')
                ->selectRaw('MAX(bedrooms) as max_bedrooms')
                ->selectRaw('MIN(area_total) as min_area')
                ->selectRaw('MAX(area_total) as max_area')
                ->selectRaw('MIN(price) as min_price')
                ->selectRaw('MAX(price) as max_price')
                ->first();
        });

        return response()->json([
            'max_bedrooms' => (int) $stats->max_bedrooms,
            'area' => [
                'min' => (float) $stats->min_area,
                'max' => (float) $stats->max_area,
            ],
            'price' => [
                'min' => (float) $stats->min_price,
                'max' => (float) $stats->max_price,
            ]
        ]);
    }
}
