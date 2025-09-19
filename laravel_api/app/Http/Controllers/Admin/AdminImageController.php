<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Image;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class AdminImageController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Get all images with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Image::query();

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by filename or alt text
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('filename', 'like', "%{$search}%")
                  ->orWhere('alt_text', 'like', "%{$search}%");
            });
        }

        // Order by
        $orderBy = $request->get('order_by', 'created_at');
        $orderDirection = $request->get('order_direction', 'desc');
        $query->orderBy($orderBy, $orderDirection);

        // Pagination
        $perPage = $request->get('per_page', 20);
        $images = $query->paginate($perPage);

        // Transform images to include url field
        $transformedImages = $images->items();
        foreach ($transformedImages as $image) {
            $image->url = $image->full_url;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'data' => $transformedImages,
                'current_page' => $images->currentPage(),
                'last_page' => $images->lastPage(),
                'per_page' => $images->perPage(),
                'total' => $images->total(),
            ],
        ]);
    }

    /**
     * Upload new image
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|file|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'title' => 'required|string|max:255',
            'project' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:50',
            'alt_text' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $image = $this->imageService->uploadImage(
                $request->file('image'),
                $request->title,
                $request->category,
                $request->project,
                $request->alt_text
            );

            $image->url = $image->full_url;

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => $image,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single image
     */
    public function show(Image $image): JsonResponse
    {
        $image->url = $image->full_url;

        return response()->json([
            'success' => true,
            'data' => $image,
        ]);
    }

    /**
     * Update image metadata
     */
    public function update(Request $request, Image $image): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'project' => 'nullable|string|max:255',
            'alt_text' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $image->update($request->only([
                'title', 'project', 'alt_text', 'category', 'is_active'
            ]));

            $updatedImage = $image->fresh();
            $updatedImage->url = $updatedImage->full_url;

            return response()->json([
                'success' => true,
                'message' => 'Image updated successfully',
                'data' => $updatedImage,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete image
     */
    public function destroy(Image $image): JsonResponse
    {
        try {
            $this->imageService->deleteImage($image);

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get gallery images by category
     */
    public function gallery(Request $request): JsonResponse
    {
        $category = $request->get('category');
        $limit = $request->get('limit', 20);

        $images = $this->imageService->getGalleryImages($category, $limit);

        return response()->json([
            'success' => true,
            'data' => $images,
        ]);
    }

    /**
     * Get image categories
     */
    public function categories(): JsonResponse
    {
        $categories = Image::select('category')
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Get projects that have images
     */
    public function projects(): JsonResponse
    {
        $projects = Image::select('project')
            ->whereNotNull('project')
            ->distinct()
            ->pluck('project')
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    /**
     * Attach image to model
     */
    public function attach(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image_id' => 'required|exists:images,id',
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
            'type' => 'required|string|in:main,gallery,render',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $image = Image::findOrFail($request->image_id);
            $model = $request->model_type::findOrFail($request->model_id);

            $imageable = $this->imageService->attachImage(
                $image,
                $model,
                $request->type,
                $request->get('sort_order', 0)
            );

            return response()->json([
                'success' => true,
                'message' => 'Image attached successfully',
                'data' => $imageable,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to attach image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Detach image from model
     */
    public function detach(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image_id' => 'required|exists:images,id',
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
            'type' => 'nullable|string|in:main,gallery,render',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $image = Image::findOrFail($request->image_id);
            $model = $request->model_type::findOrFail($request->model_id);

            $detached = $this->imageService->detachImage(
                $image,
                $model,
                $request->type
            );

            return response()->json([
                'success' => true,
                'message' => $detached ? 'Image detached successfully' : 'No relationship found',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to detach image: ' . $e->getMessage(),
            ], 500);
        }
    }
}
