<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MarketingEmail;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminMarketingEmailController extends Controller
{
    use ApiResponse;

    /**
     * Get all marketing emails
     */
    public function index(Request $request)
    {
        try {
            $query = MarketingEmail::orderBy('created_at', 'desc');

            // Filter by active status
            if ($request->has('active')) {
                if ($request->active === 'true' || $request->active === '1') {
                    $query->where('is_active', true);
                } elseif ($request->active === 'false' || $request->active === '0') {
                    $query->where('is_active', false);
                }
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('email', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('description', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $emails = $query->paginate($perPage);

            return $this->success([
                'data' => $emails->items(),
                'meta' => [
                    'current_page' => $emails->currentPage(),
                    'from' => $emails->firstItem(),
                    'last_page' => $emails->lastPage(),
                    'per_page' => $emails->perPage(),
                    'to' => $emails->lastItem(),
                    'total' => $emails->total(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch marketing emails: ' . $e->getMessage());
            return $this->error('მარკეტინგ ელ. ფოსტების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get a single marketing email
     */
    public function show($id)
    {
        try {
            $email = MarketingEmail::findOrFail($id);
            return $this->success($email);
        } catch (\Exception $e) {
            return $this->error('ელ. ფოსტა ვერ მოიძებნა', 404);
        }
    }

    /**
     * Store a new marketing email
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:marketing_emails,email|max:255',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors(), 422);
        }

        try {
            $email = MarketingEmail::create([
                'email' => $request->email,
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->is_active ?? true,
            ]);

            return $this->success($email, 'ელ. ფოსტა დაემატა', 201);
        } catch (\Exception $e) {
            \Log::error('Failed to create marketing email: ' . $e->getMessage());
            return $this->error('ელ. ფოსტის დამატება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Update a marketing email
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'sometimes|email|unique:marketing_emails,email,' . $id . '|max:255',
            'name' => 'sometimes|nullable|string|max:255',
            'description' => 'sometimes|nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors(), 422);
        }

        try {
            $email = MarketingEmail::findOrFail($id);
            $email->update($request->only(['email', 'name', 'description', 'is_active']));

            return $this->success($email, 'ელ. ფოსტა განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to update marketing email: ' . $e->getMessage());
            return $this->error('ელ. ფოსტის განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Delete a marketing email
     */
    public function destroy($id)
    {
        try {
            $email = MarketingEmail::findOrFail($id);
            $email->delete();

            return $this->success(null, 'ელ. ფოსტა წაიშალა');
        } catch (\Exception $e) {
            \Log::error('Failed to delete marketing email: ' . $e->getMessage());
            return $this->error('ელ. ფოსტის წაშლა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Toggle active status
     */
    public function toggleActive($id)
    {
        try {
            $email = MarketingEmail::findOrFail($id);
            $email->is_active = !$email->is_active;
            $email->save();

            return $this->success($email, 'სტატუსი შეიცვალა');
        } catch (\Exception $e) {
            \Log::error('Failed to toggle marketing email status: ' . $e->getMessage());
            return $this->error('სტატუსის შეცვლა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Bulk delete marketing emails
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email_ids' => 'required|array',
            'email_ids.*' => 'exists:marketing_emails,id',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors(), 422);
        }

        try {
            MarketingEmail::whereIn('id', $request->email_ids)->delete();

            return $this->success(null, 'ელ. ფოსტები წაიშალა');
        } catch (\Exception $e) {
            \Log::error('Failed to bulk delete marketing emails: ' . $e->getMessage());
            return $this->error('ელ. ფოსტების წაშლა ვერ მოხერხდა', 500);
        }
    }
}
