<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Projects;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\User::factory(3)->create();

        \App\Models\User::factory()->create([
            'name' => 'Test User',
            'email' => '1@gmail.com',
        ]);

        $this->call(RoleSeeder::class);
        $this->call(TranslationSeeder::class);
        $this->call(NewsSeeder::class);
        Projects::factory()->count(6)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
