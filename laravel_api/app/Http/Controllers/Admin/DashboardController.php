<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Projects;
use App\Models\Translation;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Get all dashboard statistics in one call
     * Cached for 10 minutes to reduce database load
     */
    public function statistics()
    {
        try {
            $cacheKey = 'dashboard_statistics';

            $data = Cache::remember($cacheKey, 600, function () {
                // Customer statistics - Single optimized query instead of 9 separate queries
            $customerCounts = Customer::selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "new" THEN 1 ELSE 0 END) as new,
                SUM(CASE WHEN status = "in_progress" THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN source = "contact_form" THEN 1 ELSE 0 END) as contact_form,
                SUM(CASE WHEN source = "call_request" THEN 1 ELSE 0 END) as call_request,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today,
                SUM(CASE WHEN created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) as this_week,
                SUM(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? THEN 1 ELSE 0 END) as this_month
            ', [
                now()->startOfWeek(),
                now()->endOfWeek(),
                now()->month,
                now()->year
            ])->first();

            $customerStats = [
                'total' => (int) $customerCounts->total,
                'new' => (int) $customerCounts->new,
                'in_progress' => (int) $customerCounts->in_progress,
                'completed' => (int) $customerCounts->completed,
                'contact_form' => (int) $customerCounts->contact_form,
                'call_request' => (int) $customerCounts->call_request,
                'today' => (int) $customerCounts->today,
                'this_week' => (int) $customerCounts->this_week,
                'this_month' => (int) $customerCounts->this_month,
            ];

            // Project count
            $projectsCount = Projects::count();

            // Translation count
            $translationsCount = Translation::count();

            // Chart data for last 30 days
            $chartData = $this->getChartData();

                return [
                    'customer_stats' => $customerStats,
                    'projects_count' => $projectsCount,
                    'translations_count' => $translationsCount,
                    'chart_data' => $chartData,
                ];
            });  // Close Cache::remember

            return $this->success($data);
        } catch (\Exception $e) {
            Log::error('Failed to fetch dashboard statistics: ' . $e->getMessage());
            return $this->error('დაფის სტატისტიკის ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get customer activity chart data for last 30 days
     * Optimized: Single query with GROUP BY instead of 30 separate queries
     */
    private function getChartData()
    {
        $days = 30;
        $startDate = now()->subDays($days - 1)->startOfDay();

        // Single query to get all counts grouped by date
        $counts = Customer::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->pluck('count', 'date');

        // Fill in missing dates with 0
        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $data[] = [
                'date' => $date,
                'count' => $counts[$date] ?? 0,
            ];
        }

        return $data;
    }

    /**
     * Clear application cache
     */
    public function clearCache()
    {
        try {
            // Clear various caches
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');

            // Clear facade cache if exists
            if (function_exists('opcache_reset')) {
                opcache_reset();
            }

            return $this->success(null, 'კეში წარმატებით გასუფთავდა');
        } catch (\Exception $e) {
            Log::error('Failed to clear cache: ' . $e->getMessage());
            return $this->error('მონაცემების განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Warm application cache (pre-populate all API caches)
     */
    public function warmCache()
    {
        try {
            Log::info('🔥 Starting manual cache warming from dashboard...');
            
            // Run cache warming command and capture output
            Artisan::call('cache:warm');
            $output = Artisan::output();
            
            // Parse the output to get statistics (optional)
            // For now, just return success message
            
            Log::info('✅ Manual cache warming completed from dashboard');
            
            return $this->success(null, 'კეში წარმატებით გაცხელდა - ყველა API cache-ი განახლებულია');
        } catch (\Exception $e) {
            Log::error('Failed to warm cache: ' . $e->getMessage());
            return $this->error('მონაცემების შევსება ვერ მოხერხდა', 500);
        }
    }
}
