<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CrmLostReason;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CrmLostReasonController extends Controller
{
    use ApiResponse;

    /**
     * Get all lost reasons
     */
    public function index(Request $request)
    {
        try {
            $query = CrmLostReason::ordered();

            // Filter by active status
            if ($request->has('active_only') && $request->boolean('active_only')) {
                $query->active();
            }

            $reasons = $query->withCount('deals')->get();

            return $this->success($reasons);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch lost reasons: ' . $e->getMessage());
            return $this->error('მიზეზების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get a single lost reason
     */
    public function show($id)
    {
        try {
            $reason = CrmLostReason::withCount('deals')->findOrFail($id);
            return $this->success($reason);
        } catch (\Exception $e) {
            return $this->error('მიზეზი ვერ მოიძებნა', 404);
        }
    }

    /**
     * Create a new lost reason
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'label' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            // Get max sort order
            $maxOrder = CrmLostReason::max('sort_order') ?? 0;

            $reason = CrmLostReason::create([
                'label' => $request->label,
                'sort_order' => $maxOrder + 1,
                'is_active' => $request->boolean('is_active', true),
            ]);

            return $this->success($reason, 'მიზეზი შეიქმნა', 201);
        } catch (\Exception $e) {
            \Log::error('Failed to create lost reason: ' . $e->getMessage());
            return $this->error('მიზეზის შექმნა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Update a lost reason
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'label' => 'sometimes|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            $reason = CrmLostReason::findOrFail($id);
            $reason->update($request->only(['label', 'is_active']));

            return $this->success($reason, 'მიზეზი განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to update lost reason: ' . $e->getMessage());
            return $this->error('მიზეზის განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Delete a lost reason (only if no deals reference it)
     */
    public function destroy($id)
    {
        try {
            $reason = CrmLostReason::findOrFail($id);

            // Check if there are any deals with this reason
            if ($reason->deals()->exists()) {
                return $this->error('მიზეზის წაშლა შეუძლებელია - გამოყენებულია გარიგებებში', 422);
            }

            $reason->delete();

            return $this->success(null, 'მიზეზი წაიშალა');
        } catch (\Exception $e) {
            \Log::error('Failed to delete lost reason: ' . $e->getMessage());
            return $this->error('მიზეზის წაშლა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Toggle active status
     */
    public function toggleActive($id)
    {
        try {
            $reason = CrmLostReason::findOrFail($id);
            $reason->update(['is_active' => !$reason->is_active]);

            return $this->success($reason, 'სტატუსი განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to toggle lost reason status: ' . $e->getMessage());
            return $this->error('სტატუსის განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Reorder lost reasons
     */
    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reasons' => 'required|array',
            'reasons.*.id' => 'required|exists:crm_lost_reasons,id',
            'reasons.*.sort_order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            foreach ($request->reasons as $reasonData) {
                CrmLostReason::where('id', $reasonData['id'])->update([
                    'sort_order' => $reasonData['sort_order']
                ]);
            }

            $reasons = CrmLostReason::ordered()->get();
            return $this->success($reasons, 'თანმიმდევრობა განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to reorder lost reasons: ' . $e->getMessage());
            return $this->error('თანმიმდევრობის განახლება ვერ მოხერხდა', 500);
        }
    }
}
