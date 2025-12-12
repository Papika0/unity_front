<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CrmActivity;
use App\Models\CrmDeal;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CrmActivityController extends Controller
{
    use ApiResponse;

    /**
     * Get activities for a deal
     */
    public function index(Request $request, $dealId)
    {
        try {
            $deal = CrmDeal::findOrFail($dealId);

            $query = $deal->activities()->with('user')->recent();

            // Filter by type
            if ($request->has('type') && $request->type) {
                $query->ofType($request->type);
            }

            // Pagination
            $perPage = $request->get('per_page', 20);
            $activities = $query->paginate($perPage);

            // Add type label to each activity
            $activitiesData = $activities->getCollection()->map(function ($activity) {
                $activityArray = $activity->toArray();
                $activityArray['type_label'] = $activity->type_label;
                $activityArray['is_task'] = $activity->is_task;
                $activityArray['is_overdue'] = $activity->is_overdue;
                return $activityArray;
            });

            return $this->success([
                'data' => $activitiesData,
                'meta' => [
                    'current_page' => $activities->currentPage(),
                    'from' => $activities->firstItem(),
                    'last_page' => $activities->lastPage(),
                    'per_page' => $activities->perPage(),
                    'to' => $activities->lastItem(),
                    'total' => $activities->total(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch activities: ' . $e->getMessage());
            return $this->error('აქტივობების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Create a new activity (note, call, email, meeting)
     */
    public function store(Request $request, $dealId)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:note,call,email,meeting',
            'content' => 'required|string',
            'scheduled_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            $deal = CrmDeal::findOrFail($dealId);

            $activity = CrmActivity::create([
                'deal_id' => $deal->id,
                'user_id' => auth()->id(),
                'type' => $request->type,
                'content' => $request->content,
                'scheduled_at' => $request->scheduled_at,
                'completed_at' => $request->scheduled_at ? null : now(), // If no schedule, mark as done
            ]);

            $activity->load('user');

            $activityData = $activity->toArray();
            $activityData['type_label'] = $activity->type_label;

            return $this->success($activityData, 'აქტივობა დაემატა', 201);
        } catch (\Exception $e) {
            \Log::error('Failed to create activity: ' . $e->getMessage());
            return $this->error('აქტივობის დამატება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Update an activity
     */
    public function update(Request $request, $dealId, $activityId)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'sometimes|string',
            'scheduled_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            $activity = CrmActivity::where('deal_id', $dealId)
                ->where('id', $activityId)
                ->firstOrFail();

            $activity->update($request->only(['content', 'scheduled_at']));

            $activity->load('user');

            return $this->success($activity, 'აქტივობა განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to update activity: ' . $e->getMessage());
            return $this->error('აქტივობის განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Delete an activity
     */
    public function destroy($dealId, $activityId)
    {
        try {
            $activity = CrmActivity::where('deal_id', $dealId)
                ->where('id', $activityId)
                ->firstOrFail();

            // Don't allow deleting system activities
            if (in_array($activity->type, ['status_change', 'payment', 'system'])) {
                return $this->error('სისტემური აქტივობების წაშლა შეუძლებელია', 422);
            }

            $activity->delete();

            return $this->success(null, 'აქტივობა წაიშალა');
        } catch (\Exception $e) {
            \Log::error('Failed to delete activity: ' . $e->getMessage());
            return $this->error('აქტივობის წაშლა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Mark a scheduled activity as completed
     */
    public function complete($dealId, $activityId)
    {
        try {
            $activity = CrmActivity::where('deal_id', $dealId)
                ->where('id', $activityId)
                ->whereNotNull('scheduled_at')
                ->whereNull('completed_at')
                ->firstOrFail();

            $activity->update(['completed_at' => now()]);

            return $this->success($activity, 'დავალება დასრულდა');
        } catch (\Exception $e) {
            \Log::error('Failed to complete activity: ' . $e->getMessage());
            return $this->error('დავალების დასრულება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get scheduled tasks across all deals
     */
    public function tasks(Request $request)
    {
        try {
            $query = CrmActivity::with(['deal.customer', 'user'])
                ->scheduled()
                ->orderBy('scheduled_at', 'asc');

            // Filter by user
            if ($request->has('user_id') && $request->user_id) {
                $query->whereHas('deal', function ($q) use ($request) {
                    $q->where('user_id', $request->user_id);
                });
            }

            // Filter overdue only
            if ($request->boolean('overdue_only')) {
                $query->overdue();
            }

            $perPage = $request->get('per_page', 20);
            $tasks = $query->paginate($perPage);

            // Add computed fields
            $tasksData = $tasks->getCollection()->map(function ($task) {
                $taskArray = $task->toArray();
                $taskArray['type_label'] = $task->type_label;
                $taskArray['is_overdue'] = $task->is_overdue;
                return $taskArray;
            });

            return $this->success([
                'data' => $tasksData,
                'meta' => [
                    'current_page' => $tasks->currentPage(),
                    'from' => $tasks->firstItem(),
                    'last_page' => $tasks->lastPage(),
                    'per_page' => $tasks->perPage(),
                    'to' => $tasks->lastItem(),
                    'total' => $tasks->total(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch tasks: ' . $e->getMessage());
            return $this->error('დავალებების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get activity types with labels
     */
    public function types()
    {
        return $this->success(CrmActivity::TYPE_LABELS);
    }
}
