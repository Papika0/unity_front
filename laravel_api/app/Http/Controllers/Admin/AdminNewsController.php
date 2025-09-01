<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Admin\AdminNewsResource;
use App\Http\Requests\Admin\News\StoreNewsRequest;
use App\Http\Requests\Admin\News\UpdateNewsRequest;
use Illuminate\Support\Facades\DB;

class AdminNewsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = News::latest();

            // Filter by status
            if ($request->has('status')) {
                switch ($request->status) {
                    case 'published':
                        $query->published();
                        break;
                    case 'draft':
                        $query->draft();
                        break;
                    case 'inactive':
                        $query->inactive();
                        break;
                    // 'all' - no filter needed
                }
            }

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
            $perPage = $request->get('per_page', 15);
            $news = $query->paginate($perPage);

            return $this->success([
                'data' => AdminNewsResource::collection($news->items()),
                'meta' => [
                    'current_page' => $news->currentPage(),
                    'from' => $news->firstItem(),
                    'last_page' => $news->lastPage(),
                    'per_page' => $news->perPage(),
                    'to' => $news->lastItem(),
                    'total' => $news->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch news', 500);
        }
    }

    /**
     * Get articles for featured selection modal (lightweight)
     */
    public function forFeaturedModal()
    {
        try {
            // Only select necessary fields for the modal to minimize data transfer
            $articles = News::select('id', 'title', 'main_image', 'publish_date', 'is_active', 'is_featured')
                ->latest()
                ->get();

            return $this->success([
                'articles' => AdminNewsResource::collection($articles),
                'current_featured' => AdminNewsResource::collection(
                    News::select('id', 'title', 'main_image', 'publish_date', 'is_active', 'is_featured')
                        ->where('is_featured', true)
                        ->latest()
                        ->get()
                )
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch articles for featured modal', 500);
        }
    }

    
    public function show($id)
    {
        try {
            $news = News::findOrFail($id);
            return $this->success(new AdminNewsResource($news));
        } catch (\Exception $e) {
            return $this->error('News article not found', 404);
        }
    }

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

            // Convert string boolean values to actual booleans
            $data['is_active'] = in_array($data['is_active'], ['1', 'true', true], true);

            $news = News::create($data);

            DB::commit();

            return $this->success(new AdminNewsResource($news), 'News article created successfully', 201);
        } catch (\Exception $e) {
            DB::rollback();
            return $this->error('Failed to create news article: ' . $e->getMessage(), 500);
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
            if ($request->hasFile('gallery_images') || $request->has('existing_gallery_images') || $request->has('removed_gallery_images')) {
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
                
                // Handle explicitly removed images
                $removedImages = $request->input('removed_gallery_images', []);
                foreach ($removedImages as $removedImage) {
                    $cleanPath = str_replace('storage/', '', $removedImage);
                    if (Storage::disk('public')->exists($cleanPath)) {
                        Storage::disk('public')->delete($cleanPath);
                    }
                }
                
                // Delete images that are no longer needed (additional cleanup)
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

            // Convert string boolean values to actual booleans
            if (isset($data['is_active'])) {
                $data['is_active'] = in_array($data['is_active'], ['1', 'true', true], true);
            }

            $news->update($data);
            $news->refresh();

            DB::commit();

            return $this->success(new AdminNewsResource($news), 'News article updated successfully');
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
     * Get featured news
     */
    public function featured()
    {
        try {
            $news = News::active()->published()->featured()->latest()->get();

            return $this->success(AdminNewsResource::collection($news));
        } catch (\Exception $e) {
            return $this->error('Failed to fetch featured news', 500);
        }
    }

    /**
     * Set featured news (maximum 2)
     */
    public function setFeatured(Request $request)
    {
        try {
            DB::beginTransaction();

            // Validate the request
            $request->validate([
                'news_ids' => 'required|array|max:2',
                'news_ids.*' => 'required|integer|exists:news,id'
            ]);

            $newsIds = $request->news_ids;

            // Ensure maximum 2 featured news
            if (count($newsIds) > 2) {
                return $this->error('Maximum 2 news items can be featured', 422);
            }

            // First, set all news as not featured (optimized single query)
            News::where('is_featured', true)->update(['is_featured' => false]);

            // Then set the specified news as featured (optimized batch update)
            if (!empty($newsIds)) {
                News::whereIn('id', $newsIds)->update(['is_featured' => true]);
            }

            DB::commit();

            // Return the updated featured news
            $featuredNews = News::whereIn('id', $newsIds)->get();

            return $this->success(
                AdminNewsResource::collection($featuredNews),
                'Featured news updated successfully'
            );

        } catch (\Exception $e) {
            DB::rollback();
            return $this->error('Failed to update featured news: ' . $e->getMessage(), 500);
        }
    }
    

}

