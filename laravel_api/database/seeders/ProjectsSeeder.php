<?php

namespace Database\Seeders;

use App\Models\Projects;
use App\Models\Image;
use App\Services\ImageService;
use Illuminate\Database\Seeder;

class ProjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $imageService = app(ImageService::class);

        // Helper function to create placeholder images
        $createImages = function ($project, $seed) use ($imageService) {
            $projectTitleEn = $project->getTranslation('title', 'en') ?? 'Project';
            $projectTitleKa = $project->getTranslation('title', 'ka') ?? 'პროექტი';
            $projectTitleRu = $project->getTranslation('title', 'ru') ?? 'Проект';

            // Create main image
            $mainImage = Image::create([
                'url' => "https://picsum.photos/seed/project-main-{$seed}/1920/1080",
                'title' => [
                    'en' => $projectTitleEn . ' - Main Image',
                    'ka' => $projectTitleKa . ' - მთავარი სურათი',
                    'ru' => $projectTitleRu . ' - Главное изображение',
                ],
                'alt_text' => [
                    'en' => $projectTitleEn,
                    'ka' => $projectTitleKa,
                    'ru' => $projectTitleRu,
                ],
                'project' => [
                    'en' => $projectTitleEn,
                    'ka' => $projectTitleKa,
                    'ru' => $projectTitleRu,
                ],
                'category' => 'projects',
                'is_active' => true,
            ]);
            $imageService->attachImage($mainImage, $project, 'main');

            // Create render image
            $renderImage = Image::create([
                'url' => "https://picsum.photos/seed/project-render-{$seed}/1920/1080",
                'title' => [
                    'en' => $projectTitleEn . ' - Render',
                    'ka' => $projectTitleKa . ' - რენდერი',
                    'ru' => $projectTitleRu . ' - Рендер',
                ],
                'alt_text' => [
                    'en' => $projectTitleEn . ' Render',
                    'ka' => $projectTitleKa . ' რენდერი',
                    'ru' => $projectTitleRu . ' Рендер',
                ],
                'project' => [
                    'en' => $projectTitleEn,
                    'ka' => $projectTitleKa,
                    'ru' => $projectTitleRu,
                ],
                'category' => 'projects',
                'is_active' => true,
            ]);
            $imageService->attachImage($renderImage, $project, 'render');

            // Create gallery images
            for ($i = 1; $i <= 9; $i++) {
                $galleryImage = Image::create([
                    'url' => "https://picsum.photos/seed/project-gallery-{$seed}-{$i}/1200/800",
                    'title' => [
                        'en' => $projectTitleEn . " - Gallery {$i}",
                        'ka' => $projectTitleKa . " - გალერეა {$i}",
                        'ru' => $projectTitleRu . " - Галерея {$i}",
                    ],
                    'alt_text' => [
                        'en' => $projectTitleEn,
                        'ka' => $projectTitleKa,
                        'ru' => $projectTitleRu,
                    ],
                    'project' => [
                        'en' => $projectTitleEn,
                        'ka' => $projectTitleKa,
                        'ru' => $projectTitleRu,
                    ],
                    'category' => 'projects',
                    'is_active' => true,
                ]);
                $imageService->attachImage($galleryImage, $project, 'gallery', $i - 1);
            }
        };

        // Create featured projects
        $seed = 1;
        Projects::factory()
            ->count(3)
            ->create([
                'is_featured' => true,
                'is_active' => true,
            ])
            ->each(function ($project) use ($createImages, &$seed) {
                $createImages($project, $seed++);
            });

        // Create completed projects
        Projects::factory()
            ->count(5)
            ->create([
                'status' => 'completed',
                'is_active' => true,
            ])
            ->each(function ($project) use ($createImages, &$seed) {
                $createImages($project, $seed++);
            });

        // Create ongoing projects
        Projects::factory()
            ->count(4)
            ->create([
                'status' => 'ongoing',
                'is_active' => true,
            ])
            ->each(function ($project) use ($createImages, &$seed) {
                $createImages($project, $seed++);
            });

        // Create planning projects
        Projects::factory()
            ->count(3)
            ->create([
                'status' => 'planning',
                'is_active' => true,
            ])
            ->each(function ($project) use ($createImages, &$seed) {
                $createImages($project, $seed++);
            });

        // Create some inactive projects for testing (without images)
        Projects::factory()
            ->count(2)
            ->create([
                'is_active' => false,
            ]);
    }
}
