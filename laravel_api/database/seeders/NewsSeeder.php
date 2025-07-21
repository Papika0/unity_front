<?php

namespace Database\Seeders;

use App\Models\News;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create featured news articles
        News::factory()
            ->featured()
            ->count(3)
            ->create();

        // Create company news
        News::factory()
            ->category('company')
            ->count(5)
            ->create();

        // Create project news
        News::factory()
            ->category('project')
            ->count(5)
            ->create();

        // Create industry news
        News::factory()
            ->category('industry')
            ->count(4)
            ->create();

        // Create event news
        News::factory()
            ->category('event')
            ->count(3)
            ->create();

        // Create some inactive news for testing
        News::factory()
            ->inactive()
            ->count(2)
            ->create();
    }
}
