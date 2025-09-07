<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\HomePageController;

class WarmHomepageCache extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'cache:warm-homepage {--locales=ka,en : Comma-separated list of locales to warm}';

    /**
     * The console command description.
     */
    protected $description = 'Warm up the homepage cache for specified locales';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $locales = explode(',', $this->option('locales'));
        
        $this->info('Starting homepage cache warming...');
        
        foreach ($locales as $locale) {
            $locale = trim($locale);
            $this->info("Warming cache for locale: {$locale}");
            
            try {
                // Create a fake request
                $request = Request::create('/api/homepage', 'GET', ['locale' => $locale]);
                
                // Get the controller and warm the cache
                $controller = app(HomePageController::class);
                $response = $controller->index($request);
                
                $this->info("✓ Cache warmed for locale: {$locale}");
            } catch (\Exception $e) {
                $this->error("✗ Failed to warm cache for locale {$locale}: " . $e->getMessage());
                return Command::FAILURE;
            }
        }
        
        $this->info('Homepage cache warming completed successfully!');
        return Command::SUCCESS;
    }
}
