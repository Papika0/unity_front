<?php

namespace App\Console\Commands;

use App\Models\Image;
use App\Services\ImageService;
use Illuminate\Console\Command;

class CleanupOrphanedImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'images:cleanup-orphans 
                            {--dry-run : Show what would be deleted without actually deleting}
                            {--days=1 : Only delete images older than this many days}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove orphaned images that have no relationships to any models';

    /**
     * Execute the console command.
     */
    public function handle(ImageService $imageService)
    {
        $this->info('🔍 Scanning for orphaned images...');
        $this->newLine();
        
        $days = (int) $this->option('days');
        
        // Find images with no relationships
        $orphans = Image::whereDoesntHave('imageables')
            ->where('created_at', '<', now()->subDays($days))
            ->orderBy('created_at', 'desc')
            ->get();
        
        if ($orphans->isEmpty()) {
            $this->info('✅ No orphaned images found!');
            $this->info('   All images are properly linked to content.');
            return 0;
        }
        
        $this->warn("Found {$orphans->count()} orphaned image(s)");
        $this->newLine();
        
        if ($this->option('dry-run')) {
            $this->warn('🔍 DRY RUN MODE - No files will be deleted');
            $this->newLine();
            
            $this->table(
                ['ID', 'Filename', 'Category', 'Path', 'Size (KB)', 'Created'],
                $orphans->map(function($img) {
                    $filePath = storage_path('app/public/' . $img->path);
                    $size = file_exists($filePath) ? round(filesize($filePath) / 1024, 2) : 'N/A';
                    
                    return [
                        $img->id,
                        \Illuminate\Support\Str::limit($img->filename, 30),
                        $img->category ?? 'N/A',
                        \Illuminate\Support\Str::limit($img->path, 40),
                        $size,
                        $img->created_at->diffForHumans()
                    ];
                })
            );
            
            $totalSize = $orphans->reduce(function($carry, $img) {
                $filePath = storage_path('app/public/' . $img->path);
                return $carry + (file_exists($filePath) ? filesize($filePath) : 0);
            }, 0);
            
            $this->newLine();
            $this->info('💾 Total storage that would be freed: ' . $this->formatBytes($totalSize));
            $this->info('💡 Run without --dry-run to actually delete these images');
            
            return 0;
        }
        
        // Confirm deletion
        if (!$this->confirm('Do you want to delete these orphaned images?', false)) {
            $this->info('Cancelled. No images were deleted.');
            return 0;
        }
        
        $this->newLine();
        $bar = $this->output->createProgressBar($orphans->count());
        $bar->setFormat('verbose');
        
        $deleted = 0;
        $failed = 0;
        $freedSpace = 0;
        
        foreach ($orphans as $orphan) {
            try {
                $filePath = storage_path('app/public/' . $orphan->path);
                $fileSize = file_exists($filePath) ? filesize($filePath) : 0;
                
                $imageService->deleteImage($orphan);
                
                $deleted++;
                $freedSpace += $fileSize;
            } catch (\Exception $e) {
                $failed++;
                $this->newLine();
                $this->error("❌ Failed to delete image {$orphan->id}: {$e->getMessage()}");
            }
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        
        // Summary
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('📊 Cleanup Summary:');
        $this->info("   ✅ Successfully deleted: {$deleted} image(s)");
        
        if ($failed > 0) {
            $this->warn("   ⚠️  Failed to delete: {$failed} image(s)");
        }
        
        $this->info("   💾 Storage freed: " . $this->formatBytes($freedSpace));
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        return 0;
    }
    
    /**
     * Format bytes into human-readable format
     */
    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
