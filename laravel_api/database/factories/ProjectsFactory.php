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
        // Create directories if they don't exist
        Storage::disk('public')->makeDirectory("projects/{$folder}");
        
        $filename = "{$seed}.jpg";
        $path = "projects/{$folder}/{$filename}";
        $fullPath = storage_path("app/public/{$path}");
        
        // Create image
        $image = imagecreate($width, $height);
        
        // Generate colors based on seed for consistency
        srand(crc32($seed));
        $bgColor = imagecolorallocate($image, rand(100, 255), rand(100, 255), rand(100, 255));
        $textColor = imagecolorallocate($image, rand(0, 100), rand(0, 100), rand(0, 100));
        
        // Fill background
        imagefill($image, 0, 0, $bgColor);
        
        // Add text
        $text = "{$width}x{$height}";
        imagestring($image, 5, ($width - strlen($text) * 10) / 2, ($height - 15) / 2, $text, $textColor);
        
        // Save image
        imagejpeg($image, $fullPath, 80);
        imagedestroy($image);
        
        return "storage/{$path}";
    }

    public function definition()
    {
        $start       = $this->faker->dateTimeBetween('-2 years', 'now');
        $end         = $this->faker->dateTimeBetween($start, '+1 year');
        $mainSeed    = $this->faker->unique()->uuid;
        $renderSeed  = $this->faker->unique()->uuid;
        $gallerySeeds= [$this->faker->unique()->uuid, $this->faker->unique()->uuid, $this->faker->unique()->uuid,$this->faker->unique()->uuid,$this->faker->unique()->uuid,$this->faker->unique()->uuid,$this->faker->unique()->uuid,$this->faker->unique()->uuid,$this->faker->unique()->uuid,];

        return [
            'title'           => [
                'en' => $this->faker->sentence(3),
                'ka' => $this->faker->sentence(3, true),
                'ru' => $this->faker->sentence(3, true),
            ],
            'description'     => [
                'en' => $this->faker->paragraph(),
                'ka' => $this->faker->paragraph(2, true),
                'ru' => $this->faker->paragraph(2, true),
            ],
            'location'        => [                              // ← new
                'en' => $this->faker->city,
                'ka' => $this->faker->city,    // you can swap to more Georgian-specific if you like
                'ru' => $this->faker->city,
            ],
            'status'          => Arr::random(['planning','ongoing','completed']),
            'start_date'      => $start->format('Y-m-d'),
            'completion_date' => $end->format('Y-m-d'),

            'main_image'      => $this->generatePlaceholderImage(800, 600, 'main', $mainSeed),
            'render_image'    => $this->generatePlaceholderImage(800, 600, 'render', $renderSeed),
            'gallery_images'  => [
                $this->generatePlaceholderImage(400, 300, 'gallery', $gallerySeeds[0]),
                $this->generatePlaceholderImage(400, 300, 'gallery', $gallerySeeds[1]),
                $this->generatePlaceholderImage(400, 300, 'gallery', $gallerySeeds[2]),
                $this->generatePlaceholderImage(400, 300, 'gallery', $gallerySeeds[3]),
                $this->generatePlaceholderImage(400, 300, 'gallery', $gallerySeeds[4]),
                $this->generatePlaceholderImage(400, 300, 'gallery', $gallerySeeds[5]),
                $this->generatePlaceholderImage(400, 300, 'gallery', $gallerySeeds[6]),
                $this->generatePlaceholderImage(400, 300, 'gallery', $gallerySeeds[7]),
                $this->generatePlaceholderImage(400, 300, 'gallery', $gallerySeeds[8]),
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
