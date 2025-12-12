<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CrmStage;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CrmStageController extends Controller
{
    use ApiResponse;

    /**
     * Get all stages ordered by sort_order
     */
    public function index()
    {
        try {
            $stages = CrmStage::ordered()
                ->withCount('deals')
                ->get();

            return $this->success($stages);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch CRM stages: ' . $e->getMessage());
            return $this->error('ეტაპების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get a single stage
     */
    public function show($id)
    {
        try {
            $stage = CrmStage::withCount('deals')->findOrFail($id);
            return $this->success($stage);
        } catch (\Exception $e) {
            return $this->error('ეტაპი ვერ მოიძებნა', 404);
        }
    }

    /**
     * Create a new stage
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:open,won,lost',
            'color' => 'required|string|max:7',
            'locks_apartment' => 'boolean',
            'days_until_stale' => 'nullable|integer|min:1',
            'requires_apartment' => 'boolean',
            'requires_lost_reason' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            // Generate slug from name
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 1;

            while (CrmStage::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            // Get max sort order
            $maxOrder = CrmStage::max('sort_order') ?? 0;

            $stage = CrmStage::create([
                'name' => $request->name,
                'slug' => $slug,
                'type' => $request->type,
                'sort_order' => $maxOrder + 1,
                'color' => $request->color,
                'locks_apartment' => $request->boolean('locks_apartment'),
                'days_until_stale' => $request->days_until_stale,
                'requires_apartment' => $request->boolean('requires_apartment'),
                'requires_lost_reason' => $request->boolean('requires_lost_reason'),
            ]);

            return $this->success($stage, 'ეტაპი შეიქმნა', 201);
        } catch (\Exception $e) {
            \Log::error('Failed to create CRM stage: ' . $e->getMessage());
            return $this->error('ეტაპის შექმნა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Update a stage
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:open,won,lost',
            'color' => 'sometimes|string|max:7',
            'locks_apartment' => 'sometimes|boolean',
            'days_until_stale' => 'nullable|integer|min:1',
            'requires_apartment' => 'sometimes|boolean',
            'requires_lost_reason' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            $stage = CrmStage::findOrFail($id);
            $stage->update($request->only([
                'name',
                'type',
                'color',
                'locks_apartment',
                'days_until_stale',
                'requires_apartment',
                'requires_lost_reason',
            ]));

            return $this->success($stage, 'ეტაპი განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to update CRM stage: ' . $e->getMessage());
            return $this->error('ეტაპის განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Delete a stage (only if no deals are attached)
     */
    public function destroy($id)
    {
        try {
            $stage = CrmStage::findOrFail($id);

            // Check if there are any deals in this stage
            if ($stage->deals()->exists()) {
                return $this->error('ეტაპის წაშლა შეუძლებელია - არსებობს გარიგებები ამ ეტაპზე', 422);
            }

            $stage->delete();

            return $this->success(null, 'ეტაპი წაიშალა');
        } catch (\Exception $e) {
            \Log::error('Failed to delete CRM stage: ' . $e->getMessage());
            return $this->error('ეტაპის წაშლა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Reorder stages
     */
    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'stages' => 'required|array',
            'stages.*.id' => 'required|exists:crm_stages,id',
            'stages.*.sort_order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            foreach ($request->stages as $stageData) {
                CrmStage::where('id', $stageData['id'])->update([
                    'sort_order' => $stageData['sort_order']
                ]);
            }

            $stages = CrmStage::ordered()->get();
            return $this->success($stages, 'ეტაპების თანმიმდევრობა განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to reorder CRM stages: ' . $e->getMessage());
            return $this->error('თანმიმდევრობის განახლება ვერ მოხერხდა', 500);
        }
    }
}
