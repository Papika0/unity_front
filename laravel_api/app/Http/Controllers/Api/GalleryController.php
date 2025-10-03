<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImageService;
use App\Services\PageCacheService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GalleryController extends Controller
{
    protected $imageService;
    protected $pageCacheService;

    public function __construct(ImageService $imageService, PageCacheService $pageCacheService)
    {
        $this->imageService = $imageService;
        $this->pageCacheService = $pageCacheService;
    }

    /**
     * Get gallery images with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $category = $request->get('category', 'all');
        $limit = $request->get('limit', 20);
        $featured = $request->boolean('featured', false);
        $locale = $request->get('locale', 'ka');

        // Create cache key
        $cacheKey = "gallery_index_{$locale}_" . 
                    ($category) . '_' .
                    "limit{$limit}_" .
                    ($featured ? 'featured' : 'normal');

        // Check cache first
        if ($this->pageCacheService->has($cacheKey)) {
            return $this->pageCacheService->get($cacheKey);
        }

        if ($featured) {
            $images = $this->imageService->getFeaturedImages($limit);
        } else {
            $images = $this->imageService->getGalleryImages(
                $category === 'all' ? null : $category,
                $limit
            );
        }

        $result = response()->json([
            'success' => true,
            'data' => $images->map(function ($image) use ($locale) {
                return [
                    'id' => $image->id,
                    'url' => $image->full_url,
                    'title' => $image->getTranslation('title', $locale),
                    'project' => $image->project ? $image->getTranslation('project', $locale) : null,
                    'alt_text' => $image->getTranslation('alt_text', $locale),
                    'category' => $image->category,
                    'created_at' => $image->created_at,
                ];
            }),
            'meta' => [
                'category' => $category,
                'limit' => $limit,
                'featured' => $featured,
                'total' => $images->count(),
            ],
        ]);

        // Cache forever
        $this->pageCacheService->put($cacheKey, $result, null);

        return $result;
    }

    /**
     * Get available categories
     */
    public function categories(): JsonResponse
    {
        // Create cache key
        $cacheKey = "gallery_categories";

        // Check cache first
        if ($this->pageCacheService->has($cacheKey)) {
            return $this->pageCacheService->get($cacheKey);
        }

        $categories = $this->imageService->getGalleryImages()
            ->pluck('category')
            ->filter()
            ->unique()
            ->values();

        $result = response()->json([
            'success' => true,
            'data' => $categories,
        ]);

        // Cache forever
        $this->pageCacheService->put($cacheKey, $result, null);

        return $result;
    }

    /**
     * Get single image details
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $locale = $request->get('locale', 'ka');
            $image = \App\Models\Image::active()->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $image->id,
                    'url' => $image->full_url,
                    'title' => $image->getTranslation('title', $locale),
                    'project' => $image->project ? $image->getTranslation('project', $locale) : null,
                    'alt_text' => $image->getTranslation('alt_text', $locale),
                    'category' => $image->category,
                    'created_at' => $image->created_at,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Image not found',
            ], 404);
        }
    }
}
