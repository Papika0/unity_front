<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GalleryController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Get gallery images with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $category = $request->get('category', 'all');
        $limit = $request->get('limit', 20);
        $featured = $request->boolean('featured', false);

        if ($featured) {
            $images = $this->imageService->getFeaturedImages($limit);
        } else {
            $images = $this->imageService->getGalleryImages(
                $category === 'all' ? null : $category,
                $limit
            );
        }

        return response()->json([
            'success' => true,
            'data' => $images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => $image->full_url,
                    'title' => $image->title,
                    'project' => $image->project,
                    'alt_text' => $image->alt_text,
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
    }

    /**
     * Get available categories
     */
    public function categories(): JsonResponse
    {
        $categories = $this->imageService->getGalleryImages()
            ->pluck('category')
            ->filter()
            ->unique()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Get single image details
     */
    public function show($id): JsonResponse
    {
        try {
            $image = \App\Models\Image::active()->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $image->id,
                    'url' => $image->full_url,
                    'title' => $image->title,
                    'project' => $image->project,
                    'alt_text' => $image->alt_text,
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
