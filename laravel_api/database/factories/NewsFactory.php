<?php

namespace Database\Factories;

use App\Models\News;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\News>
 */
class NewsFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = News::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['company', 'project', 'industry', 'event'];
        $tags = ['innovation', 'technology', 'construction', 'architecture', 'development', 'news', 'update'];

        return [
            'is_active' => true,
            'is_featured' => $this->faker->boolean(20), // 20% chance of being featured
            'title' => [
                'ka' => $this->faker->sentence(6),
                'en' => $this->faker->sentence(6),
                'ru' => $this->faker->sentence(6),
            ],
            'excerpt' => [
                'ka' => $this->faker->paragraph(2),
                'en' => $this->faker->paragraph(2),
                'ru' => $this->faker->paragraph(2),
            ],
            'content' => [
                'ka' => $this->faker->paragraphs(5, true),
                'en' => $this->faker->paragraphs(5, true),
                'ru' => $this->faker->paragraphs(5, true),
            ],
            'category' => $this->faker->randomElement($categories),
            'main_image' => 'https://placehold.co/800x400',
            'gallery_images' => $this->faker->boolean(70) ? [
                'https://placehold.co/600x400',
                'https://placehold.co/600x400',
                'https://placehold.co/600x400',
            ] : [],
            'tags' => $this->faker->randomElements($tags, $this->faker->numberBetween(1, 4)),
            'publish_date' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'views' => $this->faker->numberBetween(0, 1000),
            'meta_title' => $this->faker->sentence(8),
            'meta_description' => $this->faker->paragraph(1),
        ];
    }

    /**
     * Indicate that the news article is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    /**
     * Indicate that the news article is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Set a specific category for the news article.
     */
    public function category(string $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => $category,
        ]);
    }
}
