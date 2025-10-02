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

        $newsTitles = [
            ['en' => 'New Sustainable Building Project Launched', 'ka' => 'ახალი მდგრადი შენობის პროექტი გაიხსნა', 'ru' => 'Запущен новый проект устойчивого строительства'],
            ['en' => 'Award-Winning Architecture Design Revealed', 'ka' => 'ჯილდოს მფლობელი არქიტექტურული დიზაინი გამოვლინდა', 'ru' => 'Представлен архитектурный дизайн, удостоенный награды'],
            ['en' => 'Unity Architecture Expands to New Markets', 'ka' => 'Unity Architecture ახალ ბაზრებზე ფართოვდება', 'ru' => 'Unity Architecture расширяется на новые рынки'],
            ['en' => 'Modern Office Complex Completed Ahead of Schedule', 'ka' => 'თანამედროვე ოფისის კომპლექსი ვადაზე ადრე დასრულდა', 'ru' => 'Современный офисный комплекс завершен раньше срока'],
            ['en' => 'Green Building Initiative Wins Industry Recognition', 'ka' => 'მწვანე შენობის ინიციატივამ მიიღო ინდუსტრიის აღიარება', 'ru' => 'Инициатива зеленого строительства получила отраслевое признание'],
            ['en' => 'Smart City Development Project Announced', 'ka' => 'გამოცხადდა ჭკვიანი ქალაქის განვითარების პროექტი', 'ru' => 'Объявлен проект развития умного города'],
        ];

        $randomTitle = $this->faker->randomElement($newsTitles);
        $randomSeed = $this->faker->numberBetween(1, 1000);

        return [
            'is_active' => true,
            'is_featured' => $this->faker->boolean(20), // 20% chance of being featured
            'title' => $randomTitle,
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
            'main_image' => "https://picsum.photos/seed/news-{$randomSeed}/1200/630",
            'gallery_images' => $this->faker->boolean(70) ? [
                "https://picsum.photos/seed/news-{$randomSeed}-1/1200/800",
                "https://picsum.photos/seed/news-{$randomSeed}-2/1200/800",
                "https://picsum.photos/seed/news-{$randomSeed}-3/1200/800",
            ] : [],
            'tags' => $this->faker->randomElements($tags, $this->faker->numberBetween(1, 4)),
            'publish_date' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'views' => $this->faker->numberBetween(100, 5000),
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
