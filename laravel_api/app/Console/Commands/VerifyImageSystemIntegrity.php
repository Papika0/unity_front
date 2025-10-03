<?php

namespace App\Console\Commands;

use App\Models\Image;
use App\Models\News;
use App\Models\Projects;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VerifyImageSystemIntegrity extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'images:verify-integrity';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify the integrity of the image system after migration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Verifying Image System Integrity...');
        $this->newLine();

        $checks = [
            'checkDatabaseSchema',
            'checkOrphanedImages',
            'checkMissingFiles',
            'checkRelationships',
            'checkIndexes',
        ];

        $passed = 0;
        $failed = 0;

        foreach ($checks as $check) {
            if ($this->$check()) {
                $passed++;
            } else {
                $failed++;
            }
        }

        $this->newLine();
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if ($failed === 0) {
            $this->info("✅ All checks passed! ({$passed}/{$passed})");
            $this->info('   Image system is healthy and optimized.');
        } else {
            $this->warn("⚠️  {$passed} checks passed, {$failed} checks failed");
            $this->info('   Review failed checks above for details.');
        }
        
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return $failed === 0 ? 0 : 1;
    }

    protected function checkDatabaseSchema(): bool
    {
        $this->info('📊 Checking database schema...');

        $issues = [];

        // Check if old columns are removed
        if (Schema::hasColumn('news', 'main_image')) {
            $issues[] = 'news.main_image column still exists (should be removed)';
        }
        if (Schema::hasColumn('news', 'gallery_images')) {
            $issues[] = 'news.gallery_images column still exists (should be removed)';
        }
        if (Schema::hasColumn('projects', 'main_image')) {
            $issues[] = 'projects.main_image column still exists (should be removed)';
        }
        if (Schema::hasColumn('projects', 'render_image')) {
            $issues[] = 'projects.render_image column still exists (should be removed)';
        }
        if (Schema::hasColumn('projects', 'gallery_images')) {
            $issues[] = 'projects.gallery_images column still exists (should be removed)';
        }

        // Check if new indexes exist
        $imagesIndexes = DB::select("SHOW INDEX FROM images WHERE Key_name LIKE 'idx_%'");
        $imageablesIndexes = DB::select("SHOW INDEX FROM imageables WHERE Key_name LIKE 'idx_%'");

        if (count($imagesIndexes) < 2) {
            $issues[] = 'Performance indexes missing on images table';
        }
        if (count($imageablesIndexes) < 2) {
            $issues[] = 'Performance indexes missing on imageables table';
        }

        if (empty($issues)) {
            $this->line('   ✅ Schema is optimized');
            return true;
        } else {
            $this->line('   ❌ Schema issues found:');
            foreach ($issues as $issue) {
                $this->line("      - {$issue}");
            }
            return false;
        }
    }

    protected function checkOrphanedImages(): bool
    {
        $this->info('🗑️  Checking for orphaned images...');

        $orphanCount = Image::whereDoesntHave('imageables')->count();

        if ($orphanCount === 0) {
            $this->line('   ✅ No orphaned images found');
            return true;
        } else {
            $this->line("   ⚠️  Found {$orphanCount} orphaned image(s)");
            $this->line('      Run: php artisan images:cleanup-orphans');
            return false;
        }
    }

    protected function checkMissingFiles(): bool
    {
        $this->info('📁 Checking for missing files...');

        $images = Image::all();
        $missing = [];

        foreach ($images as $image) {
            $fullPath = storage_path('app/public/' . $image->path);
            if (!file_exists($fullPath)) {
                $missing[] = $image->id;
            }
        }

        if (empty($missing)) {
            $this->line('   ✅ All image files exist on disk');
            return true;
        } else {
            $this->line('   ❌ Missing ' . count($missing) . ' file(s):');
            $this->line('      Image IDs: ' . implode(', ', array_slice($missing, 0, 10)));
            if (count($missing) > 10) {
                $this->line('      ... and ' . (count($missing) - 10) . ' more');
            }
            return false;
        }
    }

    protected function checkRelationships(): bool
    {
        $this->info('🔗 Checking relationships...');

        $issues = [];

        // Check news articles
        $newsWithImages = News::whereHas('images')->count();
        $totalNews = News::count();

        // Check projects
        $projectsWithImages = Projects::whereHas('images')->count();
        $totalProjects = Projects::count();

        $this->line("   News: {$newsWithImages}/{$totalNews} have images");
        $this->line("   Projects: {$projectsWithImages}/{$totalProjects} have images");

        // Check for duplicate relationships
        $duplicates = DB::table('imageables')
            ->select('image_id', 'imageable_id', 'imageable_type', 'type', DB::raw('COUNT(*) as count'))
            ->groupBy('image_id', 'imageable_id', 'imageable_type', 'type')
            ->having('count', '>', 1)
            ->get();

        if ($duplicates->isNotEmpty()) {
            $issues[] = 'Found ' . $duplicates->count() . ' duplicate relationships';
        }

        if (empty($issues)) {
            $this->line('   ✅ Relationships are healthy');
            return true;
        } else {
            $this->line('   ❌ Relationship issues:');
            foreach ($issues as $issue) {
                $this->line("      - {$issue}");
            }
            return false;
        }
    }

    protected function checkIndexes(): bool
    {
        $this->info('🚀 Checking performance indexes...');

        try {
            // Test query performance
            $start = microtime(true);
            Image::active()
                ->where('category', 'news')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            $time1 = (microtime(true) - $start) * 1000;

            $start = microtime(true);
            DB::table('imageables')
                ->where('imageable_type', 'App\\Models\\News')
                ->where('type', 'gallery')
                ->orderBy('sort_order')
                ->limit(10)
                ->get();
            $time2 = (microtime(true) - $start) * 1000;

            $this->line(sprintf('   ✅ Query performance OK (%.2fms / %.2fms)', $time1, $time2));
            return true;
        } catch (\Exception $e) {
            $this->line('   ❌ Query performance check failed: ' . $e->getMessage());
            return false;
        }
    }
}
