<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\Image;
use App\Services\ImageService;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $imageService = app(ImageService::class);

        // Helper function to create placeholder images
        $createImages = function ($news, $seed) use ($imageService) {
            $newsTitleEn = $news->getTranslation('title', 'en') ?? 'News Article';
            $newsTitleKa = $news->getTranslation('title', 'ka') ?? 'სიახლე';
            $newsTitleRu = $news->getTranslation('title', 'ru') ?? 'Новость';

            // Create main image
            $mainImage = Image::create([
                'url' => "https://picsum.photos/seed/news-{$seed}/1200/630",
                'title' => [
                    'en' => $newsTitleEn . ' - Main Image',
                    'ka' => $newsTitleKa . ' - მთავარი სურათი',
                    'ru' => $newsTitleRu . ' - Главное изображение',
                ],
                'alt_text' => [
                    'en' => $newsTitleEn,
                    'ka' => $newsTitleKa,
                    'ru' => $newsTitleRu,
                ],
                'category' => 'news',
                'is_active' => true,
            ]);
            $imageService->attachImage($mainImage, $news, 'main');

            // Create gallery images (70% chance)
            if (rand(1, 100) <= 70) {
                for ($i = 1; $i <= 3; $i++) {
                    $galleryImage = Image::create([
                        'url' => "https://picsum.photos/seed/news-{$seed}-{$i}/1200/800",
                        'title' => [
                            'en' => $newsTitleEn . " - Gallery {$i}",
                            'ka' => $newsTitleKa . " - გალერეა {$i}",
                            'ru' => $newsTitleRu . " - Галерея {$i}",
                        ],
                        'alt_text' => [
                            'en' => $newsTitleEn,
                            'ka' => $newsTitleKa,
                            'ru' => $newsTitleRu,
                        ],
                        'category' => 'news',
                        'is_active' => true,
                    ]);
                    $imageService->attachImage($galleryImage, $news, 'gallery', $i - 1);
                }
            }
        };

        // Create featured news articles
        $seed = 1;
        News::factory()
            ->featured()
            ->count(3)
            ->create()
            ->each(function ($news) use ($createImages, &$seed) {
                $createImages($news, $seed++);
            });

        // Create company news
        News::factory()
            ->category('company')
            ->count(5)
            ->create()
            ->each(function ($news) use ($createImages, &$seed) {
                $createImages($news, $seed++);
            });

        // Create project news
        News::factory()
            ->category('project')
            ->count(5)
            ->create()
            ->each(function ($news) use ($createImages, &$seed) {
                $createImages($news, $seed++);
            });

        // Create industry news
        News::factory()
            ->category('industry')
            ->count(4)
            ->create()
            ->each(function ($news) use ($createImages, &$seed) {
                $createImages($news, $seed++);
            });

        // Create event news
        News::factory()
            ->category('event')
            ->count(3)
            ->create()
            ->each(function ($news) use ($createImages, &$seed) {
                $createImages($news, $seed++);
            });

        // Create some inactive news for testing (without images)
        News::factory()
            ->inactive()
            ->count(2)
            ->create();
    }
}
