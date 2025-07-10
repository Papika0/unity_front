<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Translation>
 */
class TranslationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => $this->faker->unique()->word,
            'text' => [
                'en' => $this->faker->sentence,
                'ka' => $this->faker->sentence,
                'ru' => $this->faker->sentence
            ],
            'group' => $this->faker->randomElement(['landing', 'about', 'contact', 'footer', 'header', 'home', 'services', 'team', 'testimonials', 'work']),
            'active' => $this->faker->boolean,
        ];
    }
}
