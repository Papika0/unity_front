<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Image;
use App\Models\Imageable;
use App\Models\Projects;
use App\Models\News;

class MigrateImagesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'images:migrate {--dry-run : Show what would be migrated without actually doing it}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate existing images from projects and news tables to the new image management system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('DRY RUN MODE - No changes will be made');
            $this->newLine();
        }

        $this->info('Starting image migration...');

        // Count existing images
        $projectCount = Projects::whereNotNull('main_image')
            ->orWhereNotNull('render_image')
            ->orWhereNotNull('gallery_images')
            ->count();

        $newsCount = News::whereNotNull('main_image')
            ->orWhereNotNull('gallery_images')
            ->count();

        $this->info("Found {$projectCount} projects with images");
        $this->info("Found {$newsCount} news articles with images");

        if (!$dryRun) {
            $this->migrateProjectImages();
            $this->migrateNewsImages();
            $this->info('Image migration completed successfully!');
        } else {
            $this->info('Dry run completed. Use without --dry-run to perform actual migration.');
        }
    }

    /**
     * Migrate project images
     */
    private function migrateProjectImages(): void
    {
        $this->info('Migrating project images...');

        $projects = Projects::all();
        $migrated = 0;
        $errors = 0;

        foreach ($projects as $project) {
            try {
                // Get project title for image records
                $projectTitle = $project->getTranslation('title', 'en') ?: $project->getTranslation('title', 'ka') ?: 'Project ' . $project->id;

                // Migrate main image
                if (!empty($project->main_image)) {
                    $imageId = $this->createImageRecord($project->main_image, 'projects', $projectTitle);
                    if ($imageId) {
                        $this->createImageableRecord($imageId, $project, 'main');
                        $migrated++;
                    }
                }

                // Migrate render image
                if (!empty($project->render_image)) {
                    $imageId = $this->createImageRecord($project->render_image, 'projects', $projectTitle);
                    if ($imageId) {
                        $this->createImageableRecord($imageId, $project, 'render');
                        $migrated++;
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
                                $migrated++;
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                $this->error("Failed to migrate project {$project->id}: " . $e->getMessage());
                $errors++;
            }
        }

        $this->info("Migrated {$migrated} project images with {$errors} errors");
    }

    /**
     * Migrate news images
     */
    private function migrateNewsImages(): void
    {
        $this->info('Migrating news images...');

        $news = News::all();
        $migrated = 0;
        $errors = 0;

        foreach ($news as $article) {
            try {
                // Migrate main image
                if (!empty($article->main_image)) {
                    $imageId = $this->createImageRecord($article->main_image, 'news');
                    if ($imageId) {
                        $this->createImageableRecord($imageId, $article, 'main');
                        $migrated++;
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
                                $migrated++;
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                $this->error("Failed to migrate news article {$article->id}: " . $e->getMessage());
                $errors++;
            }
        }

        $this->info("Migrated {$migrated} news images with {$errors} errors");
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
                $this->warn("Image file not found: {$fullPath}");
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
            $this->error("Failed to create image record for {$imagePath}: " . $e->getMessage());
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
            $this->error("Failed to create imageable record: " . $e->getMessage());
        }
    }
}
