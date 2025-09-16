<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Image;
use App\Models\Imageable;
use App\Models\Projects;
use App\Models\News;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // This migration will migrate existing images from projects and news tables
        // to the new centralized image management system

        $this->migrateProjectImages();
        $this->migrateNewsImages();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove migrated images and relationships
        Imageable::whereIn('imageable_type', [Projects::class, News::class])->delete();

        // Note: We don't delete the Image records as they might be referenced elsewhere
        // If you want to clean up, you can do it manually after verifying
    }

    /**
     * Migrate project images
     */
    private function migrateProjectImages(): void
    {
        $projects = Projects::all();

        foreach ($projects as $project) {
            // Get project title for image records
            $projectTitle = $project->getTranslation('title', 'en') ?: $project->getTranslation('title', 'ka') ?: 'Project ' . $project->id;

            // Migrate main image
            if (!empty($project->main_image)) {
                $imageId = $this->createImageRecord($project->main_image, 'projects', $projectTitle);
                if ($imageId) {
                    $this->createImageableRecord($imageId, $project, 'main');
                }
            }

            // Migrate render image
            if (!empty($project->render_image)) {
                $imageId = $this->createImageRecord($project->render_image, 'projects', $projectTitle);
                if ($imageId) {
                    $this->createImageableRecord($imageId, $project, 'render');
                }
            }

            // Migrate gallery images
            if (!empty($project->gallery_images)) {
                $galleryImages = is_string($project->gallery_images)
                    ? json_decode($project->gallery_images, true)
                    : $project->gallery_images;

                if (is_array($galleryImages)) {
                    foreach ($galleryImages as $index => $imagePath) {
                        $imageId = $this->createImageRecord($imagePath, 'projects', $projectTitle);
                        if ($imageId) {
                            $this->createImageableRecord($imageId, $project, 'gallery', $index);
                        }
                    }
                }
            }
        }
    }

    /**
     * Migrate news images
     */
    private function migrateNewsImages(): void
    {
        $news = News::all();

        foreach ($news as $article) {
            // Migrate main image
            if (!empty($article->main_image)) {
                $imageId = $this->createImageRecord($article->main_image, 'news');
                if ($imageId) {
                    $this->createImageableRecord($imageId, $article, 'main');
                }
            }

            // Migrate gallery images
            if (!empty($article->gallery_images)) {
                $galleryImages = is_string($article->gallery_images)
                    ? json_decode($article->gallery_images, true)
                    : $article->gallery_images;

                if (is_array($galleryImages)) {
                    foreach ($galleryImages as $index => $imagePath) {
                        $imageId = $this->createImageRecord($imagePath, 'news');
                        if ($imageId) {
                            $this->createImageableRecord($imageId, $article, 'gallery', $index);
                        }
                    }
                }
            }
        }
    }

    /**
     * Create image record from existing path
     */
    private function createImageRecord(string $imagePath, string $category, string $projectTitle = null): ?int
    {
        try {
            // Clean the path to get the actual file path
            $cleanPath = str_replace('storage/', '', $imagePath);
            $fullPath = storage_path('app/public/' . $cleanPath);

            // Check if file exists
            if (!file_exists($fullPath)) {
                \Log::warning("Image file not found: {$fullPath}");
                return null;
            }

            // Get file info
            $fileInfo = pathinfo($fullPath);

            // Create image record
            $image = Image::create([
                'filename' => $fileInfo['basename'],
                'path' => $cleanPath,
                'title' => $fileInfo['filename'], // Use filename as title
                'project' => $projectTitle,
                'alt_text' => null,
                'category' => $category,
            ]);

            return $image->id;
        } catch (\Exception $e) {
            \Log::error("Failed to create image record for {$imagePath}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create imageable relationship record
     */
    private function createImageableRecord(int $imageId, $model, string $type, int $sortOrder = 0): void
    {
        try {
            Imageable::create([
                'image_id' => $imageId,
                'imageable_id' => $model->id,
                'imageable_type' => get_class($model),
                'type' => $type,
                'sort_order' => $sortOrder,
            ]);
        } catch (\Exception $e) {
            \Log::error("Failed to create imageable record: " . $e->getMessage());
        }
    }
};
