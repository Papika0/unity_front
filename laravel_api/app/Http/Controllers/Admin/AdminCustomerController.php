<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminCustomerController extends Controller
{
    use ApiResponse;

    /**
     * Get all customers with pagination and filtering
     */
    public function index(Request $request)
    {
        try {
            $query = Customer::orderBy('created_at', 'desc');

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by source
            if ($request->has('source') && $request->source !== 'all') {
                $query->where('source', $request->source);
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('phone', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('subject', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Date range filter
            if ($request->has('date_from') && !empty($request->date_from)) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && !empty($request->date_to)) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $customers = $query->paginate($perPage);

            return $this->success([
                'data' => $customers->items(),
                'meta' => [
                    'current_page' => $customers->currentPage(),
                    'from' => $customers->firstItem(),
                    'last_page' => $customers->lastPage(),
                    'per_page' => $customers->perPage(),
                    'to' => $customers->lastItem(),
                    'total' => $customers->total(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch customers: ' . $e->getMessage());
            return $this->error('კლიენტების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get customer statistics
     */
    public function statistics()
    {
        try {
            $stats = [
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

            return $this->success($stats);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch customer statistics: ' . $e->getMessage());
            return $this->error('სტატისტიკის ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get customer activity chart data for last 30 days
     */
    public function chartData()
    {
        try {
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

            return $this->success($data);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch chart data: ' . $e->getMessage());
            return $this->error('დიაგრამის მონაცემების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get a single customer
     */
    public function show($id)
    {
        try {
            $customer = Customer::findOrFail($id);
            return $this->success($customer);
        } catch (\Exception $e) {
            return $this->error('კლიენტი ვერ მოიძებნა', 404);
        }
    }

    /**
     * Update customer status and notes
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:new,contacted,in_progress,completed,cancelled',
            'notes' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors(), 422);
        }

        try {
            $customer = Customer::findOrFail($id);
            $customer->update($request->only(['status', 'notes']));

            return $this->success($customer, 'კლიენტის ინფორმაცია განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to update customer: ' . $e->getMessage());
            return $this->error('კლიენტის განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Delete a customer
     */
    public function destroy($id)
    {
        try {
            $customer = Customer::findOrFail($id);
            $customer->delete();

            return $this->success(null, 'კლიენტი წაიშალა');
        } catch (\Exception $e) {
            \Log::error('Failed to delete customer: ' . $e->getMessage());
            return $this->error('კლიენტის წაშლა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Bulk update customers status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_ids' => 'required|array',
            'customer_ids.*' => 'exists:customers,id',
            'status' => 'required|in:new,contacted,in_progress,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors(), 422);
        }

        try {
            Customer::whereIn('id', $request->customer_ids)->update([
                'status' => $request->status
            ]);

            return $this->success(null, 'კლიენტების სტატუსი განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to bulk update customers: ' . $e->getMessage());
            return $this->error('კლიენტების განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Bulk delete customers
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_ids' => 'required|array',
            'customer_ids.*' => 'exists:customers,id',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors(), 422);
        }

        try {
            Customer::whereIn('id', $request->customer_ids)->delete();

            return $this->success(null, 'კლიენტები წაიშალა');
        } catch (\Exception $e) {
            \Log::error('Failed to bulk delete customers: ' . $e->getMessage());
            return $this->error('კლიენტების წაშლა ვერ მოხერხდა', 500);
        }
    }
}
