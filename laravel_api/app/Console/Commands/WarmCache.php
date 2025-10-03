<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DirectCacheWarmingService;

class WarmCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:warm 
                            {--summary : Show summary of what will be cached}
                            {--silent : Suppress output}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Warm up all public API caches for all locales, filters, and pagination';

    protected $cacheWarmingService;

    /**
     * Create a new command instance.
     */
    public function __construct(DirectCacheWarmingService $cacheWarmingService)
    {
        parent::__construct();
        $this->cacheWarmingService = $cacheWarmingService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('summary')) {
            $this->showSummary();
            return 0;
        }

        if (!$this->option('silent')) {
            $this->info('🔥 Starting cache warming for all public APIs...');
            $this->newLine();
        }

        $startTime = microtime(true);

        // Warm all caches
        $results = $this->cacheWarmingService->warmAllCaches();

        $endTime = microtime(true);
        $duration = round($endTime - $startTime, 2);

        if (!$this->option('silent')) {
            $this->newLine();
            $this->info('✅ Cache warming completed!');
            $this->newLine();
            
            // Display results table
            $this->table(
                ['API', 'Success', 'Failed'],
                collect($results)->map(function ($stats, $api) {
                    return [
                        ucfirst($api),
                        $stats['success'] ?? 0,
                        $stats['failed'] ?? 0,
                    ];
                })->toArray()
            );

            $totalSuccess = collect($results)->sum('success');
            $totalFailed = collect($results)->sum('failed');

            $this->newLine();
            $this->info("Total: {$totalSuccess} successful, {$totalFailed} failed");
            $this->info("Duration: {$duration} seconds");
        }

        return 0;
    }

    /**
     * Show cache warming summary
     */
    protected function showSummary()
    {
        $summary = $this->cacheWarmingService->getCacheSummary();

        $this->info('📊 Cache Warming Summary');
        $this->newLine();

        $this->line('<fg=yellow>Locales:</> ' . implode(', ', $summary['locales']));
        $this->line('<fg=yellow>News Categories:</> ' . implode(', ', $summary['news_categories']));
        $this->line('<fg=yellow>Project Statuses:</> ' . implode(', ', $summary['project_statuses']));
        $this->line('<fg=yellow>Gallery Categories:</> ' . (empty($summary['gallery_categories']) ? 'none' : implode(', ', $summary['gallery_categories'])));
        $this->newLine();
        $this->line('<fg=yellow>Estimated Requests:</> ~' . $summary['estimated_requests']);
        $this->newLine();

        $this->info('APIs that will be warmed:');
        $this->line('  • Homepage (/api/homepage/bootstrap)');
        $this->line('  • News index, featured, recent, and articles');
        $this->line('  • Projects page and individual projects');
        $this->line('  • Project features');
        $this->line('  • Gallery page and categories');
        $this->line('  • About page');
        $this->line('  • Contact settings');
        $this->line('  • Footer data');
    }
}
