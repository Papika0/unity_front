<?php

namespace Database\Factories;

use App\Models\Projects;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Projects>
 */
class ProjectsFactory extends Factory
{
    protected $model = Projects::class;

    private function generatePlaceholderImage($width, $height, $folder, $seed)
    {
        // Use picsum.photos for reliable placeholder images
        // Generate a deterministic ID based on seed
        $imageId = abs(crc32($seed . $folder)) % 1000;

        return "https://picsum.photos/seed/{$seed}-{$folder}/{$width}/{$height}";
    }

    public function definition()
    {
        $start       = $this->faker->dateTimeBetween('-2 years', 'now');
        $end         = $this->faker->dateTimeBetween($start, '+1 year');
        $mainSeed    = $this->faker->unique()->uuid;
        $renderSeed  = $this->faker->unique()->uuid;
        $gallerySeeds= [$this->faker->unique()->uuid, $this->faker->unique()->uuid, $this->faker->unique()->uuid,$this->faker->unique()->uuid,$this->faker->unique()->uuid,$this->faker->unique()->uuid,$this->faker->unique()->uuid,$this->faker->unique()->uuid,$this->faker->unique()->uuid,];

        $projectTitles = [
            ['en' => 'Modern Residential Complex', 'ka' => 'თანამედროვე საცხოვრებელი კომპლექსი', 'ru' => 'Современный жилой комплекс'],
            ['en' => 'Luxury Hotel & Spa', 'ka' => 'ლუქს სასტუმრო და სპა', 'ru' => 'Роскошный отель и спа'],
            ['en' => 'Commercial Business Center', 'ka' => 'კომერციული ბიზნეს ცენტრი', 'ru' => 'Коммерческий бизнес-центр'],
            ['en' => 'Urban Shopping Mall', 'ka' => 'ურბანული სავაჭრო ცენტრი', 'ru' => 'Городской торговый центр'],
            ['en' => 'Waterfront Development', 'ka' => 'წყალპირა განვითარება', 'ru' => 'Развитие набережной'],
            ['en' => 'Green Office Tower', 'ka' => 'მწვანე ოფისის კოშკი', 'ru' => 'Зеленая офисная башня'],
            ['en' => 'Mixed-Use Development', 'ka' => 'შერეული დანიშნულების განვითარება', 'ru' => 'Многофункциональная застройка'],
        ];

        $randomTitle = $this->faker->randomElement($projectTitles);

        return [
            'title'           => $randomTitle,
            'description'     => [
                'en' => $this->faker->paragraph(4),
                'ka' => $this->faker->paragraph(3, true),
                'ru' => $this->faker->paragraph(3, true),
            ],
            'location'        => [
                'en' => $this->faker->city . ', Georgia',
                'ka' => $this->faker->city . ', საქართველო',
                'ru' => $this->faker->city . ', Грузия',
            ],
            'status'          => Arr::random(['planning','ongoing','completed']),
            'start_date'      => $start->format('Y-m-d'),
            'completion_date' => $end->format('Y-m-d'),

            'main_image'      => $this->generatePlaceholderImage(1920, 1080, 'main', $mainSeed),
            'render_image'    => $this->generatePlaceholderImage(1920, 1080, 'render', $renderSeed),
            'gallery_images'  => [
                $this->generatePlaceholderImage(1200, 800, 'gallery', $gallerySeeds[0]),
                $this->generatePlaceholderImage(1200, 800, 'gallery', $gallerySeeds[1]),
                $this->generatePlaceholderImage(1200, 800, 'gallery', $gallerySeeds[2]),
                $this->generatePlaceholderImage(1200, 800, 'gallery', $gallerySeeds[3]),
                $this->generatePlaceholderImage(1200, 800, 'gallery', $gallerySeeds[4]),
                $this->generatePlaceholderImage(1200, 800, 'gallery', $gallerySeeds[5]),
                $this->generatePlaceholderImage(1200, 800, 'gallery', $gallerySeeds[6]),
                $this->generatePlaceholderImage(1200, 800, 'gallery', $gallerySeeds[7]),
                $this->generatePlaceholderImage(1200, 800, 'gallery', $gallerySeeds[8]),
            ],

            'year'            => $this->faker->year,
            'is_active'       => $this->faker->boolean(80),
            'is_featured'     => $this->faker->boolean(30),
            'latitude'        => $this->faker->latitude(41.6, 42.3),
            'longitude'       => $this->faker->longitude(43.5, 44.0),
            'meta_title'      => $this->faker->sentence(6),
            'meta_description'=> $this->faker->sentence(12),
        ];
    }
}
