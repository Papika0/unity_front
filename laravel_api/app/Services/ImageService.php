<?php

namespace App\Services;

use App\Models\Image;
use App\Models\Imageable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image as InterventionImage;

class ImageService
{
    /**
     * Upload and create image record
     */
    public function uploadImage(UploadedFile $file, string $title, string $category = null, string $project = null, string $altText = null): Image
    {
        // Generate unique filename
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Create directory structure
        $directory = 'images/' . ($category ?: 'general') . '/' . date('Y/m');
        $path = $file->storeAs($directory, $filename, 'public');

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

        return $query->delete() > 0;
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
    public function getGalleryImages(string $category = null, int $limit = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Image::active()
            ->whereHas('imageables', function ($q) {
                $q->where('type', 'gallery');
            })
            ->orderBy('sort_order');

        if ($category) {
            $query->where('category', $category);
        }

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
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
}
