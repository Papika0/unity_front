<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CrmDeal;
use App\Models\CrmStage;
use App\Models\CrmActivity;
use App\Models\Customer;
use App\Models\Apartment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CrmDealController extends Controller
{
    use ApiResponse;

    /**
     * Get all deals with pagination and filtering
     */
    public function index(Request $request)
    {
        try {
            $query = CrmDeal::with(['customer', 'user', 'apartment.building', 'stage', 'lostReason'])
                ->orderBy('last_activity_at', 'desc');

            // Filter by stage
            if ($request->has('stage_id') && $request->stage_id) {
                $query->where('stage_id', $request->stage_id);
            }

            // Filter by assigned user
            if ($request->has('user_id') && $request->user_id) {
                $query->where('user_id', $request->user_id);
            }

            // Filter by priority
            if ($request->has('priority') && $request->priority) {
                $query->where('priority', $request->priority);
            }

            // Filter by currency
            if ($request->has('currency') && $request->currency) {
                $query->where('currency', $request->currency);
            }

            // Filter by open/closed status
            if ($request->has('status')) {
                if ($request->status === 'open') {
                    $query->open();
                } elseif ($request->status === 'closed') {
                    $query->closed();
                } elseif ($request->status === 'won') {
                    $query->won();
                } elseif ($request->status === 'lost') {
                    $query->lost();
                }
            }

            // Filter by stale deals
            if ($request->boolean('stale_only')) {
                $query->stale();
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('title', 'LIKE', "%{$searchTerm}%")
                        ->orWhereHas('customer', function ($cq) use ($searchTerm) {
                            $cq->where('name', 'LIKE', "%{$searchTerm}%")
                                ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                                ->orWhere('phone', 'LIKE', "%{$searchTerm}%");
                        });
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
            $deals = $query->paginate($perPage);

            // Add is_stale flag to each deal
            $dealsData = $deals->getCollection()->map(function ($deal) {
                $dealArray = $deal->toArray();
                $dealArray['is_stale'] = $deal->is_stale;
                $dealArray['days_since_activity'] = $deal->days_since_activity;
                return $dealArray;
            });

            return $this->success([
                'data' => $dealsData,
                'meta' => [
                    'current_page' => $deals->currentPage(),
                    'from' => $deals->firstItem(),
                    'last_page' => $deals->lastPage(),
                    'per_page' => $deals->perPage(),
                    'to' => $deals->lastItem(),
                    'total' => $deals->total(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch CRM deals: ' . $e->getMessage());
            return $this->error('გარიგებების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get deals grouped by stage (for Kanban board)
     */
    public function pipeline(Request $request)
    {
        try {
            $stages = CrmStage::ordered()->get();

            $pipeline = $stages->map(function ($stage) use ($request) {
                $query = CrmDeal::with(['customer', 'user', 'apartment.building'])
                    ->where('stage_id', $stage->id)
                    ->orderBy('last_activity_at', 'desc');

                // Filter by assigned user
                if ($request->has('user_id') && $request->user_id) {
                    $query->where('user_id', $request->user_id);
                }

                $deals = $query->get()->map(function ($deal) {
                    return [
                        'id' => $deal->id,
                        'title' => $deal->title,
                        'customer' => $deal->customer ? [
                            'id' => $deal->customer->id,
                            'name' => $deal->customer->name,
                            'phone' => $deal->customer->phone,
                            'email' => $deal->customer->email,
                        ] : null,
                        'user' => $deal->user ? [
                            'id' => $deal->user->id,
                            'name' => $deal->user->name,
                        ] : null,
                        'apartment' => $deal->apartment ? [
                            'id' => $deal->apartment->id,
                            'apartment_number' => $deal->apartment->apartment_number,
                            'floor_number' => $deal->apartment->floor_number,
                            'building_name' => $deal->apartment->building?->name,
                        ] : null,
                        'budget' => $deal->budget,
                        'currency' => $deal->currency,
                        'priority' => $deal->priority,
                        'is_stale' => $deal->is_stale,
                        'days_since_activity' => $deal->days_since_activity,
                        'last_activity_at' => $deal->last_activity_at,
                        'created_at' => $deal->created_at,
                    ];
                });

                // Calculate total value from deals
                $totalValue = $query->sum('budget') ?? 0;

                return [
                    'id' => $stage->id,
                    'name' => $stage->name,
                    'slug' => $stage->slug,
                    'color' => $stage->color,
                    'type' => $stage->type,
                    'deal_count' => $deals->count(),
                    'total_value' => (float) $totalValue,
                    'deals' => $deals,
                ];
            });

            return $this->success($pipeline);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch CRM pipeline: ' . $e->getMessage());
            return $this->error('პაიპლაინის ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get a single deal with all details
     */
    public function show($id)
    {
        try {
            $deal = CrmDeal::with([
                'customer',
                'user',
                'apartment.building.project',
                'stage',
                'lostReason',
                'activities' => function ($q) {
                    $q->with('user')->orderBy('created_at', 'desc')->limit(20);
                },
                'payments' => function ($q) {
                    $q->orderBy('due_date', 'asc');
                },
            ])->findOrFail($id);

            $dealData = $deal->toArray();
            $dealData['is_stale'] = $deal->is_stale;
            $dealData['days_since_activity'] = $deal->days_since_activity;
            $dealData['total_paid'] = $deal->total_paid;
            $dealData['total_due'] = $deal->total_due;
            $dealData['payment_progress'] = $deal->payment_progress;

            return $this->success($dealData);
        } catch (\Exception $e) {
            return $this->error('გარიგება ვერ მოიძებნა', 404);
        }
    }

    /**
     * Create a new deal
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'stage_id' => 'required|exists:crm_stages,id',
            'user_id' => 'nullable|exists:users,id',
            'apartment_id' => 'nullable|exists:apartments,id',
            'title' => 'nullable|string|max:255',
            'budget' => 'nullable|numeric|min:0',
            'agreed_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|in:USD,GEL,EUR',
            'priority' => 'nullable|in:low,medium,high',
            'expected_close_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            DB::beginTransaction();

            $customer = Customer::findOrFail($request->customer_id);
            $stage = CrmStage::findOrFail($request->stage_id);
            $apartment = $request->apartment_id ? Apartment::find($request->apartment_id) : null;

            // Validate stage requirements
            if ($stage->requires_apartment && !$apartment) {
                return $this->error('ამ ეტაპისთვის საჭიროა ბინის მითითება', 422);
            }

            // Generate title if not provided
            $title = $request->title ?: CrmDeal::generateTitle($customer, $apartment);

            $deal = CrmDeal::create([
                'customer_id' => $customer->id,
                'user_id' => $request->user_id ?? auth()->id(),
                'apartment_id' => $request->apartment_id,
                'stage_id' => $stage->id,
                'title' => $title,
                'budget' => $request->budget,
                'agreed_price' => $request->agreed_price,
                'currency' => $request->currency ?? 'USD',
                'priority' => $request->priority ?? 'medium',
                'expected_close_date' => $request->expected_close_date,
                'notes' => $request->notes,
                'last_activity_at' => now(),
            ]);

            DB::commit();

            $deal->load(['customer', 'user', 'apartment', 'stage']);

            return $this->success($deal, 'გარიგება შეიქმნა', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to create CRM deal: ' . $e->getMessage());
            return $this->error('გარიგების შექმნა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Create a new lead (customer + deal) from admin panel
     * This endpoint creates a customer and deal together
     */
    public function storeLead(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'surname' => 'nullable|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'project_ids' => 'nullable|array',
            'project_ids.*' => 'integer|exists:projects,id',
            'apartment_info' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            DB::beginTransaction();

            // Build full name
            $fullName = trim($request->name . ' ' . ($request->surname ?? ''));

            // Check if customer exists by phone
            $customer = Customer::where('phone', $request->phone)->first();

            if ($customer) {
                // Update existing customer
                $customer->update([
                    'name' => $fullName,
                    'email' => $request->email ?? $customer->email,
                ]);
            } else {
                // Create new customer
                $customer = Customer::create([
                    'name' => $fullName,
                    'phone' => $request->phone,
                    'email' => $request->email,
                    'source' => 'admin_panel',
                    'status' => 'new',
                ]);
            }

            // Get the "New Lead" stage
            $newLeadStage = CrmStage::where('slug', 'new-lead')->first();
            if (!$newLeadStage) {
                $newLeadStage = CrmStage::ordered()->first();
            }

            if (!$newLeadStage) {
                return $this->error('CRM სტეიჯი ვერ მოიძებნა', 422);
            }

            // Build notes with project interests
            $notesArray = [];
            if ($request->project_ids && count($request->project_ids) > 0) {
                $projectNames = \App\Models\Projects::whereIn('id', $request->project_ids)
                    ->pluck('title')
                    ->toArray();
                $notesArray[] = 'დაინტერესებული პროექტები: ' . implode(', ', $projectNames);
            }
            if ($request->apartment_info) {
                $notesArray[] = 'ბლოკი/ბინა: ' . $request->apartment_info;
            }
            if ($request->notes) {
                $notesArray[] = $request->notes;
            }

            // Create the deal
            $deal = CrmDeal::create([
                'customer_id' => $customer->id,
                'stage_id' => $newLeadStage->id,
                'user_id' => auth()->id(),
                'title' => CrmDeal::generateTitle($customer),
                'currency' => 'USD',
                'priority' => 'medium',
                'notes' => implode("\n", $notesArray),
                'last_activity_at' => now(),
            ]);

            // Store interested projects as metadata (optional: create a pivot table later)
            if ($request->project_ids && count($request->project_ids) > 0) {
                // Store in deal notes or create activity
                CrmActivity::create([
                    'deal_id' => $deal->id,
                    'user_id' => auth()->id(),
                    'type' => 'note',
                    'description' => 'ლიდი შეიქმნა ადმინ პანელიდან',
                    'metadata' => [
                        'project_ids' => $request->project_ids,
                        'apartment_info' => $request->apartment_info,
                    ],
                ]);
            }

            DB::commit();

            $deal->load(['customer', 'user', 'stage']);

            return $this->success($deal, 'ლიდი წარმატებით შეიქმნა', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to create lead: ' . $e->getMessage());
            return $this->error('ლიდის შექმნა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Update a deal
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|exists:users,id',
            'apartment_id' => 'nullable|exists:apartments,id',
            'title' => 'nullable|string|max:255',
            'budget' => 'nullable|numeric|min:0',
            'agreed_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|in:USD,GEL,EUR',
            'priority' => 'nullable|in:low,medium,high',
            'expected_close_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            $deal = CrmDeal::findOrFail($id);

            $deal->update($request->only([
                'user_id',
                'apartment_id',
                'title',
                'budget',
                'agreed_price',
                'currency',
                'priority',
                'expected_close_date',
                'notes',
            ]));

            $deal->load(['customer', 'user', 'apartment', 'stage']);

            return $this->success($deal, 'გარიგება განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to update CRM deal: ' . $e->getMessage());
            return $this->error('გარიგების განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Update deal stage (move on Kanban board)
     */
    public function updateStage(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'stage_id' => 'required|exists:crm_stages,id',
            'lost_reason_id' => 'nullable|exists:crm_lost_reasons,id',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            DB::beginTransaction();

            $deal = CrmDeal::findOrFail($id);
            $newStage = CrmStage::findOrFail($request->stage_id);

            // Validate stage requirements
            if ($newStage->requires_apartment && !$deal->apartment_id) {
                return $this->error('ამ ეტაპზე გადასვლისთვის საჭიროა ბინის მითითება', 422);
            }

            if ($newStage->requires_lost_reason && !$request->lost_reason_id) {
                return $this->error('გთხოვთ მიუთითოთ წაგების მიზეზი', 422);
            }

            // Check for apartment double-booking
            if ($newStage->locks_apartment && $deal->apartment_id) {
                $existingDeal = CrmDeal::where('apartment_id', $deal->apartment_id)
                    ->where('id', '!=', $deal->id)
                    ->whereHas('stage', function($q) {
                        $q->where('locks_apartment', true);
                    })
                    ->first();

                if ($existingDeal) {
                    return $this->error('ეს ბინა უკვე დაჯავშნილია სხვა გარიგებაზე', 422);
                }
            }

            $updateData = ['stage_id' => $newStage->id];

            if ($request->lost_reason_id) {
                $updateData['lost_reason_id'] = $request->lost_reason_id;
            }

            $deal->update($updateData);

            DB::commit();

            $deal->load(['customer', 'user', 'apartment', 'stage', 'lostReason']);

            return $this->success($deal, 'ეტაპი განახლდა');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to update deal stage: ' . $e->getMessage());
            return $this->error('ეტაპის განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Delete a deal
     */
    public function destroy($id)
    {
        try {
            $deal = CrmDeal::findOrFail($id);
            $deal->delete();

            return $this->success(null, 'გარიგება წაიშალა');
        } catch (\Exception $e) {
            \Log::error('Failed to delete CRM deal: ' . $e->getMessage());
            return $this->error('გარიგების წაშლა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get deal statistics
     */
    public function statistics(Request $request)
    {
        try {
            $query = CrmDeal::query();

            // Filter by date range
            if ($request->has('date_from') && !empty($request->date_from)) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && !empty($request->date_to)) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $totalDeals = (clone $query)->count();
            $openDeals = (clone $query)->open()->count();
            $wonDeals = (clone $query)->won()->count();
            $lostDeals = (clone $query)->lost()->count();
            $staleDeals = (clone $query)->stale()->count();

            // Calculate values
            $totalValue = (clone $query)->whereNotNull('agreed_price')->sum('agreed_price');
            $wonValue = (clone $query)->won()->whereNotNull('agreed_price')->sum('agreed_price');

            // Deals by stage
            $dealsByStage = CrmStage::ordered()
                ->withCount(['deals' => function ($q) use ($request) {
                    if ($request->has('date_from') && !empty($request->date_from)) {
                        $q->whereDate('created_at', '>=', $request->date_from);
                    }
                    if ($request->has('date_to') && !empty($request->date_to)) {
                        $q->whereDate('created_at', '<=', $request->date_to);
                    }
                }])
                ->get()
                ->map(function ($stage) {
                    return [
                        'name' => $stage->name,
                        'color' => $stage->color,
                        'count' => $stage->deals_count,
                    ];
                });

            // Conversion rate
            $closedDeals = $wonDeals + $lostDeals;
            $conversionRate = $closedDeals > 0 ? round(($wonDeals / $closedDeals) * 100, 1) : 0;

            // This month stats
            $thisMonth = CrmDeal::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year);
            $dealsThisMonth = (clone $thisMonth)->count();
            $wonThisMonth = (clone $thisMonth)->won()->count();

            $stats = [
                'total' => $totalDeals,
                'open' => $openDeals,
                'won' => $wonDeals,
                'lost' => $lostDeals,
                'stale' => $staleDeals,
                'total_value' => $totalValue,
                'won_value' => $wonValue,
                'conversion_rate' => $conversionRate,
                'this_month' => $dealsThisMonth,
                'won_this_month' => $wonThisMonth,
                'by_stage' => $dealsByStage,
            ];

            return $this->success($stats);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch deal statistics: ' . $e->getMessage());
            return $this->error('სტატისტიკის ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Assign deal to a user
     */
    public function assign(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            $deal = CrmDeal::findOrFail($id);
            $deal->update(['user_id' => $request->user_id]);

            // Log activity
            CrmActivity::create([
                'deal_id' => $deal->id,
                'user_id' => auth()->id(),
                'type' => 'system',
                'content' => 'გარიგება გადაეცა თანამშრომელს',
                'metadata' => ['assigned_to' => $request->user_id],
            ]);

            $deal->load(['customer', 'user', 'apartment', 'stage']);

            return $this->success($deal, 'თანამშრომელი მინიჭდა');
        } catch (\Exception $e) {
            \Log::error('Failed to assign deal: ' . $e->getMessage());
            return $this->error('მინიჭება ვერ მოხერხდა', 500);
        }
    }
}
