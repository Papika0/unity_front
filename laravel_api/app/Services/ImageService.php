<?php

namespace App\Services;

use App\Models\Image;
use App\Models\Imageable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image as InterventionImage;

class ImageService
{
    /**
     * Upload and create image record
     * 
     * @param UploadedFile $file
     * @param string|array $title Can be string or array ['ka' => '...', 'en' => '...', 'ru' => '...']
     * @param string|null $category
     * @param string|array|null $project Can be string or array ['ka' => '...', 'en' => '...', 'ru' => '...']
     * @param string|array|null $altText Can be string or array ['ka' => '...', 'en' => '...', 'ru' => '...']
     * @return Image
     */
    public function uploadImage(UploadedFile $file, string|array $title, string $category = null, string|array $project = null, string|array $altText = null): Image
    {
        try {
            // Validate file
            if (!$file->isValid()) {
                throw new \Exception('Invalid file: ' . $file->getErrorMessage());
            }

            // Check file size (20MB limit)
            if ($file->getSize() > 20 * 1024 * 1024) {
                throw new \Exception('File too large. Maximum size is 20MB.');
            }

            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

            // Create directory structure
            $directory = 'images/' . ($category ?: 'general') . '/' . date('Y/m');
            $path = $file->storeAs($directory, $filename, 'public');

            if (!$path) {
                throw new \Exception('Failed to store file.');
            }

            // Create image record
            $imageRecord = Image::create([
                'filename' => $file->getClientOriginalName(),
                'path' => $path,
                'title' => $title,
                'project' => $project,
                'alt_text' => $altText,
                'category' => $category,
            ]);

            return $imageRecord;
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Image upload failed', [
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Attach image to a model
     */
    public function attachImage(Image $image, $model, string $type = 'gallery', int $sortOrder = 0): Imageable
    {
        return Imageable::create([
            'image_id' => $image->id,
            'imageable_id' => $model->id,
            'imageable_type' => get_class($model),
            'type' => $type,
            'sort_order' => $sortOrder,
        ]);
    }

    /**
     * Detach image from a model
     */
    public function detachImage(Image $image, $model, string $type = null): bool
    {
        $query = Imageable::where('image_id', $image->id)
            ->where('imageable_id', $model->id)
            ->where('imageable_type', get_class($model));

        if ($type) {
            $query->where('type', $type);
        }

        $deleted = $query->delete() > 0;

        // Auto-cleanup orphaned images
        if ($deleted) {
            $this->cleanupOrphanedImage($image);
        }

        return $deleted;
    }

    /**
     * Delete image if it has no remaining relationships
     */
    protected function cleanupOrphanedImage(Image $image): void
    {
        // Refresh to get latest relationship count
        $image->refresh();

        if ($image->imageables()->count() === 0) {
            Log::info('Auto-deleting orphaned image', [
                'image_id' => $image->id,
                'filename' => $image->filename,
                'path' => $image->path
            ]);
            $this->deleteImage($image);
        }
    }

    /**
     * Get images for a model by type
     */
    public function getImagesForModel($model, string $type = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = $model->images();

        if ($type) {
            $query->wherePivot('type', $type);
        }

        return $query->get();
    }

    /**
     * Update image sort order
     */
    public function updateImageSortOrder(Image $image, $model, int $sortOrder): bool
    {
        return Imageable::where('image_id', $image->id)
            ->where('imageable_id', $model->id)
            ->where('imageable_type', get_class($model))
            ->update(['sort_order' => $sortOrder]) > 0;
    }

    /**
     * Delete image and its relationships
     */
    public function deleteImage(Image $image): bool
    {
        // Delete physical file
        if (Storage::disk('public')->exists($image->path)) {
            Storage::disk('public')->delete($image->path);
        }

        // Delete all relationships
        Imageable::where('image_id', $image->id)->delete();

        // Delete image record
        return $image->delete();
    }

    /**
     * Get gallery images by category
     */
    public function getGalleryImages(string $category = null, int $limit = null, int $page = 1): \Illuminate\Database\Eloquent\Collection
    {
        $query = Image::active()
            ->join('imageables', 'images.id', '=', 'imageables.image_id')
            ->where('imageables.type', 'gallery')
            ->whereNotIn('images.category', ['news', 'about']) // Exclude news and about categories
            ->orderBy('imageables.sort_order');

        if ($category) {
            $query->where('images.category', $category);
        }

        if ($limit) {
            $offset = ($page - 1) * $limit;
            $query->limit($limit)->offset($offset);
        }

        return $query->select('images.*')->get();
    }

    /**
     * Get featured images
     */
    public function getFeaturedImages(int $limit = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Image::active()
            ->join('imageables', 'images.id', '=', 'imageables.image_id')
            ->where('imageables.type', 'gallery')
            ->where('images.category', 'featured')
            ->orderBy('imageables.sort_order');

        if ($limit) {
            $query->limit($limit);
        }

        return $query->select('images.*')->get();
    }

    /**
     * Get images by project
     */
    public function getImagesByProject(string $project, int $limit = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Image::active()->byProject($project);

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }

    /**
     * Get gallery categories
     */
    public function getGalleryCategories(): array
    {
        return Image::active()
            ->join('imageables', 'images.id', '=', 'imageables.image_id')
            ->where('imageables.type', 'gallery')
            ->select('images.category')
            ->distinct()
            ->pluck('images.category')
            ->filter()
            ->values()
            ->toArray();
    }
}
