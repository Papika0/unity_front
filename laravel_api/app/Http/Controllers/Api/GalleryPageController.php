<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\TranslationService;
use App\Services\ImageService;

class GalleryPageController extends Controller
{
    protected $translationService;
    protected $imageService;

    public function __construct(TranslationService $translationService, ImageService $imageService)
    {
        $this->translationService = $translationService;
        $this->imageService = $imageService;
    }

    /**
     * Get gallery page data with translations
     */
    public function index(Request $request)
    {
        $locale = $request->input('locale', 'ka');
        $requestGroups = $request->input('groups', []);
        $category = $request->input('category');
        $page = (int) $request->input('page', 1);
        $limit = (int) $request->input('limit', 12);

        if ($requestGroups) {
            $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
        }

        // Get gallery images with pagination
        $galleryImages = $this->imageService->getGalleryImages($category, $limit, $page);

        // Transform images to include url field with locale support
        $transformedImages = $galleryImages->map(function ($image) use ($locale) {
            return [
                'id' => $image->id,
                'filename' => $image->filename,
                'path' => $image->path,
                'url' => $image->full_url,
                'title' => $image->getTranslation('title', $locale),
                'project' => $image->project ? $image->getTranslation('project', $locale) : null,
                'alt_text' => $image->getTranslation('alt_text', $locale),
                'category' => $image->category,
                'is_active' => $image->is_active,
                'created_at' => $image->created_at,
                'updated_at' => $image->updated_at,
            ];
        });

        // Get only categories that actually have images
        $categories = $this->imageService->getGalleryCategories();

        // Check if there are more pages by checking if next page has any images
        $hasMorePages = false;
        if ($galleryImages->count() === $limit) {
            $nextPageImages = $this->imageService->getGalleryImages($category, $limit, $page + 1);
            $hasMorePages = $nextPageImages->count() > 0;
        }

        return response()->json([
            'translations' => $translations ?? [],
            'gallery_images' => $transformedImages,
            'categories' => $categories,
            'meta' => [
                'locale' => $locale,
                'cached_at' => now()->toISOString(),
                'current_page' => $page,
                'per_page' => $limit,
                'has_more_pages' => $hasMorePages,
            ],
        ]);
    }
}
