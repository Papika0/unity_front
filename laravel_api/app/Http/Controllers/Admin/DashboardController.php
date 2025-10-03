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
     */
    public function statistics()
    {
        try {
            // Customer statistics
            $customerStats = [
                'total' => Customer::count(),
                'new' => Customer::where('status', 'new')->count(),
                'in_progress' => Customer::where('status', 'in_progress')->count(),
                'completed' => Customer::where('status', 'completed')->count(),
                'contact_form' => Customer::where('source', 'contact_form')->count(),
                'call_request' => Customer::where('source', 'call_request')->count(),
                'today' => Customer::whereDate('created_at', today())->count(),
                'this_week' => Customer::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'this_month' => Customer::whereMonth('created_at', now()->month)->count(),
            ];

            // Project count
            $projectsCount = Projects::count();

            // Translation count
            $translationsCount = Translation::count();

            // Chart data for last 30 days
            $chartData = $this->getChartData();

            return $this->success([
                'customer_stats' => $customerStats,
                'projects_count' => $projectsCount,
                'translations_count' => $translationsCount,
                'chart_data' => $chartData,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch dashboard statistics: ' . $e->getMessage());
            return $this->error('დაფის სტატისტიკის ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get customer activity chart data for last 30 days
     */
    private function getChartData()
    {
        $days = 30;
        $data = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $count = Customer::whereDate('created_at', $date)->count();

            $data[] = [
                'date' => $date,
                'count' => $count,
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
            return $this->error('კეშის გასუფთავება ვერ მოხერხდა', 500);
        }
    }
}
