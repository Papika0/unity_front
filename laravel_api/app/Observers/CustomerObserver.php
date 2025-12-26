<?php

namespace App\Observers;

use App\Models\Customer;
use Illuminate\Support\Facades\Cache;

class CustomerObserver
{
    /**
     * Handle the Customer "created" event.
     */
    public function created(Customer $customer): void
    {
        // Clear dashboard statistics cache when new customer is created
        Cache::forget('dashboard_statistics');
    }

    /**
     * Handle the Customer "updated" event.
     */
    public function updated(Customer $customer): void
    {
        // Clear cache only if status or source changed (affects statistics)
        if ($customer->wasChanged(['status', 'source'])) {
            Cache::forget('dashboard_statistics');
        }
    }

    /**
     * Handle the Customer "deleted" event.
     */
    public function deleted(Customer $customer): void
    {
        // Clear dashboard statistics cache when customer is deleted
        Cache::forget('dashboard_statistics');
    }
}
