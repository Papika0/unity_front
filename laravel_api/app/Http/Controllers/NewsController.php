<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\NewsResource;
use App\Http\Requests\StoreNewsRequest;
use App\Http\Requests\UpdateNewsRequest;
use Illuminate\Support\Facades\DB;

class NewsController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = News::active()->published()->latest();

            // Filter by category
            if ($request->has('category') && $request->category !== 'all') {
                $query->byCategory($request->category);
            }

            // Filter by featured
            if ($request->boolean('featured')) {
                $query->featured();
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(title, '$.ka')) LIKE ?", ["%{$searchTerm}%"])
                      ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(title, '$.en')) LIKE ?", ["%{$searchTerm}%"])
                      ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(excerpt, '$.ka')) LIKE ?", ["%{$searchTerm}%"])
                      ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(excerpt, '$.en')) LIKE ?", ["%{$searchTerm}%"])
                      ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(content, '$.ka')) LIKE ?", ["%{$searchTerm}%"])
                      ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(content, '$.en')) LIKE ?", ["%{$searchTerm}%"]);
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 12);
            $news = $query->paginate($perPage);

            return $this->success(NewsResource::collection($news)->response()->getData(true));
        } catch (\Exception $e) {
            return $this->error('Failed to fetch news', 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreNewsRequest $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();

            // Handle main image upload
            if ($request->hasFile('main_image')) {
                $path = $request->file('main_image')->store('news/main', 'public');
                $data['main_image'] = 'storage/' . $path;
            }

            // Handle gallery images upload
            if ($request->hasFile('gallery_images')) {
                $galleryImages = [];
                foreach ($request->file('gallery_images') as $file) {
                    $path = $file->store('news/gallery', 'public');
                    $galleryImages[] = 'storage/' . $path;
                }
                $data['gallery_images'] = $galleryImages;
            }

            // Set publish_date if not provided
            if (!isset($data['publish_date'])) {
                $data['publish_date'] = now();
            }

            $news = News::create($data);

            DB::commit();

            return $this->success(new NewsResource($news), 'News article created successfully', 201);
        } catch (\Exception $e) {
            DB::rollback();
            return $this->error('Failed to create news article: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $news = News::active()->findOrFail($id);
            
            // Increment views count
            $news->increment('views');

            return $this->success(new NewsResource($news));
        } catch (\Exception $e) {
            return $this->error('News article not found', 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateNewsRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $news = News::findOrFail($id);
            $data = $request->validated();

            // Handle main image upload
            if ($request->hasFile('main_image')) {
                // Delete old main image if exists
                if ($news->main_image && Storage::disk('public')->exists(str_replace('storage/', '', $news->main_image))) {
                    Storage::disk('public')->delete(str_replace('storage/', '', $news->main_image));
                }
                
                $path = $request->file('main_image')->store('news/main', 'public');
                $data['main_image'] = 'storage/' . $path;
            }

            // Handle gallery images
            if ($request->hasFile('gallery_images') || $request->has('existing_gallery_images')) {
                $finalGalleryImages = [];
                
                // Get existing gallery images to keep
                if ($request->has('existing_gallery_images')) {
                    $existingToKeep = $request->input('existing_gallery_images', []);
                    $finalGalleryImages = array_merge($finalGalleryImages, $existingToKeep);
                }
                
                // Add new gallery images
                if ($request->hasFile('gallery_images')) {
                    foreach ($request->file('gallery_images') as $file) {
                        $path = $file->store('news/gallery', 'public');
                        $finalGalleryImages[] = 'storage/' . $path;
                    }
                }
                
                // Delete images that are no longer needed
                $currentGallery = [];
                if ($news->gallery_images) {
                    $currentGallery = is_array($news->gallery_images) ? $news->gallery_images : [];
                }
                
                // Find images to delete (those not in finalGalleryImages)
                $imagesToDelete = array_diff($currentGallery, $finalGalleryImages);
                foreach ($imagesToDelete as $oldImage) {
                    $cleanPath = str_replace('storage/', '', $oldImage);
                    if (Storage::disk('public')->exists($cleanPath)) {
                        Storage::disk('public')->delete($cleanPath);
                    }
                }
                
                $data['gallery_images'] = $finalGalleryImages;
            }

            $news->update($data);
            $news->refresh();

            DB::commit();

            return $this->success(new NewsResource($news), 'News article updated successfully');
        } catch (\Exception $e) {
            DB::rollback();
            return $this->error('Failed to update news article: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $news = News::findOrFail($id);

            // Delete main image if exists
            if ($news->main_image && Storage::disk('public')->exists(str_replace('storage/', '', $news->main_image))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $news->main_image));
            }

            // Delete gallery images if exist
            if ($news->gallery_images && is_array($news->gallery_images)) {
                foreach ($news->gallery_images as $image) {
                    $cleanPath = str_replace('storage/', '', $image);
                    if (Storage::disk('public')->exists($cleanPath)) {
                        Storage::disk('public')->delete($cleanPath);
                    }
                }
            }

            $news->delete();

            DB::commit();

            return $this->success(null, 'News article deleted successfully');
        } catch (\Exception $e) {
            DB::rollback();
            return $this->error('Failed to delete news article: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get recent news for homepage
     */
    public function recent(Request $request)
    {
        try {
            $limit = $request->get('limit', 6);
            $news = News::active()->published()->latest()->take($limit)->get();

            return $this->success(NewsResource::collection($news));
        } catch (\Exception $e) {
            return $this->error('Failed to fetch recent news', 500);
        }
    }

    /**
     * Get featured news
     */
    public function featured()
    {
        try {
            $news = News::active()->published()->featured()->latest()->get();

            return $this->success(NewsResource::collection($news));
        } catch (\Exception $e) {
            return $this->error('Failed to fetch featured news', 500);
        }
    }

    /**
     * Get news by category
     */
    public function byCategory($category)
    {
        try {
            $news = News::active()->published()->byCategory($category)->latest()->get();

            return $this->success(NewsResource::collection($news));
        } catch (\Exception $e) {
            return $this->error('Failed to fetch news by category', 500);
        }
    }
}
