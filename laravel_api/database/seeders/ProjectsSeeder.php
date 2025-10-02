<?php

namespace Database\Seeders;

use App\Models\Projects;
use Illuminate\Database\Seeder;

class ProjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create featured projects
        Projects::factory()
            ->count(3)
            ->create([
                'is_featured' => true,
                'is_active' => true,
            ]);

        // Create completed projects
        Projects::factory()
            ->count(5)
            ->create([
                'status' => 'completed',
                'is_active' => true,
            ]);

        // Create ongoing projects
        Projects::factory()
            ->count(4)
            ->create([
                'status' => 'ongoing',
                'is_active' => true,
            ]);

        // Create planning projects
        Projects::factory()
            ->count(3)
            ->create([
                'status' => 'planning',
                'is_active' => true,
            ]);

        // Create some inactive projects for testing
        Projects::factory()
            ->count(2)
            ->create([
                'is_active' => false,
            ]);
    }
}
