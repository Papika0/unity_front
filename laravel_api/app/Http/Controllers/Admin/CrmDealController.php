<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CrmDeal;
use App\Models\CrmStage;
use App\Models\CrmActivity;
use App\Models\CrmPayment;
use App\Models\Customer;
use App\Models\Apartment;
use App\Services\PaymentScheduleCalculatorService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class CrmDealController extends Controller
{
    use ApiResponse;

    // Cache configuration
    private const PIPELINE_CACHE_PREFIX = 'crm_pipeline_';
    private const STATISTICS_CACHE_PREFIX = 'crm_statistics_';
    private const PIPELINE_VERSION_KEY = 'crm_pipeline_version';

    /**
     * Get pipeline cache version (for version-based invalidation)
     */
    private function getPipelineCacheVersion(): string
    {
        return (string) Cache::rememberForever(self::PIPELINE_VERSION_KEY, fn() => now()->timestamp);
    }

    /**
     * Clear pipeline cache (rotates version to invalidate all pipeline caches)
     */
    public static function clearPipelineCache(): void
    {
        Cache::forever(self::PIPELINE_VERSION_KEY, now()->timestamp);
    }

    /**
     * Get all deals with pagination and filtering
     */
    public function index(Request $request)
    {
        try {
            $query = CrmDeal::with(['customer', 'user', 'apartment.building', 'stage', 'lostReason'])
                ->withSum('payments as total_paid', 'amount_paid')
                ->withSum('payments as total_due', 'amount_due')
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
                $dealArray['days_in_stage'] = $deal->days_in_stage;
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
     * Cached with version-based invalidation for optimal performance
     */
    public function pipeline(Request $request)
    {
        try {
            $userId = $request->get('user_id', 'all');
            $version = $this->getPipelineCacheVersion();
            $cacheKey = self::PIPELINE_CACHE_PREFIX . "v{$version}_{$userId}";

            $pipeline = Cache::rememberForever($cacheKey, function () use ($request) {
                // Use cached stages (reference data)
                $stages = CrmStage::getCached();

                return $stages->map(function ($stage) use ($request) {
                // Eager load activities to prevent N+1 calculation of days_in_stage
                $query = CrmDeal::with(['customer', 'user', 'apartment.building', 'activities'])
                    ->withSum('payments as total_paid', 'amount_paid')
                    ->withSum('payments as total_due', 'amount_due')
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
                            'building' => $deal->apartment->building ? [
                                'id' => $deal->apartment->building->id,
                                'identifier' => $deal->apartment->building->identifier,
                                'name' => $deal->apartment->building->getTranslations('name'),
                                'project' => $deal->apartment->building->project ? [
                                    'id' => $deal->apartment->building->project->id,
                                    'title' => $deal->apartment->building->project->getTranslations('title'),
                                ] : null,
                            ] : null,
                        ] : null,
                        'budget' => $deal->budget,
                        'currency' => $deal->currency,
                        'priority' => $deal->priority,
                        'is_stale' => $deal->is_stale,
                        'days_since_activity' => $deal->days_since_activity,
                        'days_in_stage' => $deal->days_in_stage,
                        'last_activity_at' => $deal->last_activity_at,
                        'created_at' => $deal->created_at,
                    ];
                });

                // Calculate total value from already-fetched deals (avoid re-querying)
                $totalValue = $deals->sum('budget') ?? 0;

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
            });  // Close the map function
            });  // Close the Cache::rememberForever

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
            ])
            ->withSum('payments as total_paid', 'amount_paid')
            ->withSum('payments as total_due', 'amount_due')
            ->findOrFail($id);

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
            'value' => 'nullable|numeric|min:0',  // Support legacy 'value' field
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

            // Handle legacy 'value' field - map to 'budget' if provided
            $budget = $request->budget ?? $request->value;

            $deal = CrmDeal::create([
                'customer_id' => $customer->id,
                'user_id' => $request->user_id ?? auth()->id(),
                'apartment_id' => $request->apartment_id,
                'stage_id' => $stage->id,
                'title' => $title,
                'budget' => $budget,
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

            // Get the first 'open' stage (dynamic lookup instead of hardcoded slug)
            $newLeadStage = CrmStage::where('type', 'open')->where('is_active', true)->ordered()->first();

            // Fallback to any first stage if no open stage found
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
                    'content' => 'ლიდი შეიქმნა ადმინ პანელიდან',  // Fixed: use 'content' instead of 'description'
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
            'carry_forward_pricing' => 'nullable|boolean',
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
                    ->whereHas('stage', function ($q) {
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

            // Auto-carry forward pricing if requested
            if ($request->carry_forward_pricing) {
                $this->carryForwardPricing($deal, $newStage);
            }

            // Sync Apartment Status
            if ($deal->apartment_id) {
                // Default to available
                $status = 'available';

                if ($newStage->type === 'won') {
                    $status = 'sold';
                } elseif ($newStage->locks_apartment || stripos($newStage->name, 'Reserved') !== false || stripos($newStage->name, 'დაჯავშნილი') !== false) {
                    $status = 'reserved';
                }

                if ($status) {
                    // Use relation to update
                    $deal->apartment()->update(['status' => $status]);
                }
            }

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
     * Optimized: Using aggregated queries instead of multiple cloned queries
     * Cached for 5 minutes to reduce database load
     */
    public function statistics(Request $request)
    {
        try {
            $dateFrom = $request->date_from ?? '';
            $dateTo = $request->date_to ?? '';
            $cacheKey = self::STATISTICS_CACHE_PREFIX . "{$dateFrom}_{$dateTo}";

            $stats = Cache::remember($cacheKey, 300, function () use ($request, $dateFrom, $dateTo) {
                // Single query for all deal counts and values with JOIN
            $dealStats = CrmDeal::selectRaw('
                COUNT(*) as total_deals,
                SUM(CASE WHEN crm_stages.type = "open" THEN 1 ELSE 0 END) as open_deals,
                SUM(CASE WHEN crm_stages.type = "won" THEN 1 ELSE 0 END) as won_deals,
                SUM(CASE WHEN crm_stages.type = "lost" THEN 1 ELSE 0 END) as lost_deals,
                SUM(CASE
                    WHEN crm_stages.days_until_stale IS NOT NULL
                    AND DATEDIFF(NOW(), crm_deals.last_activity_at) > crm_stages.days_until_stale
                    THEN 1 ELSE 0
                END) as stale_deals,
                SUM(CASE WHEN crm_stages.type = "won" AND crm_deals.agreed_price IS NOT NULL
                    THEN crm_deals.agreed_price ELSE 0 END) as won_value,
                SUM(CASE WHEN crm_deals.agreed_price IS NOT NULL
                    THEN crm_deals.agreed_price ELSE 0 END) as total_value
            ')
            ->join('crm_stages', 'crm_deals.stage_id', '=', 'crm_stages.id')
            ->when($dateFrom, fn($q) => $q->whereDate('crm_deals.created_at', '>=', $dateFrom))
            ->when($dateTo, fn($q) => $q->whereDate('crm_deals.created_at', '<=', $dateTo))
            ->first();

            // Deals by stage (already optimized with withCount)
            $dealsByStage = CrmStage::ordered()
                ->withCount(['deals' => function ($q) use ($dateFrom, $dateTo) {
                    if ($dateFrom) {
                        $q->whereDate('created_at', '>=', $dateFrom);
                    }
                    if ($dateTo) {
                        $q->whereDate('created_at', '<=', $dateTo);
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

            // This month stats - Single query
            $thisMonthStats = CrmDeal::selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN crm_stages.type = "won" THEN 1 ELSE 0 END) as won
            ')
            ->join('crm_stages', 'crm_deals.stage_id', '=', 'crm_stages.id')
            ->whereMonth('crm_deals.created_at', now()->month)
            ->whereYear('crm_deals.created_at', now()->year)
            ->first();

            // Calculate conversion rate
            $closedDeals = $dealStats->won_deals + $dealStats->lost_deals;
            $conversionRate = $closedDeals > 0
                ? round(($dealStats->won_deals / $closedDeals) * 100, 1)
                : 0;

            $stats = [
                'total' => (int) $dealStats->total_deals,
                'open' => (int) $dealStats->open_deals,
                'won' => (int) $dealStats->won_deals,
                'lost' => (int) $dealStats->lost_deals,
                'stale' => (int) $dealStats->stale_deals,
                'total_value' => (float) $dealStats->total_value,
                'won_value' => (float) $dealStats->won_value,
                'conversion_rate' => $conversionRate,
                'this_month' => (int) $thisMonthStats->total,
                'won_this_month' => (int) $thisMonthStats->won,
                'by_stage' => $dealsByStage,
            ];

                return $stats;
            });  // Close Cache::remember

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

    /**
     * Update deal pricing
     */
    public function updatePricing(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'stage' => 'required|in:offered,reserved,final',
            'price_per_sqm' => 'required|numeric|min:0',
            'payment_alternative' => 'nullable|integer|min:1|max:6',
            'payment_params' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        // Validate payment alternative constraints - NOW DYNAMIC
        if ($request->has('payment_alternative')) {
            $alternative = $request->payment_alternative;
            $downPaymentPercent = $request->payment_params['initial_payment_percent'] ?? null;
            $monthlyPayment = $request->payment_params['monthly_payment'] ?? null;

            // Load deal to get project calculator settings
            $deal = CrmDeal::with('apartment.building.project')->findOrFail($id);
            $project = $deal->apartment->building->project ?? null;

            if (!$project || !$project->calculator_settings) {
                return $this->error('პროექტის კალკულატორის პარამეტრები ვერ მოიძებნა', 422);
            }

            $settings = $project->calculator_settings;
            $paymentTerms = $settings['payment_terms'] ?? null;

            if (!$paymentTerms) {
                return $this->error('გადახდის პირობები ვერ მოიძებნა', 422);
            }

            // Extract dynamic values with fallback defaults
            $minDown = $paymentTerms['min_down_payment_percent'] ?? 20;
            $maxDown = $paymentTerms['max_down_payment_percent'] ?? 30;
            $minMonthly = $paymentTerms['min_monthly_payment'] ?? 800;
            $minMonthlyAlt6 = $paymentTerms['min_monthly_payment_alt6'] ?? 1500;

            // Build dynamic constraints array
            $constraints = [
                1 => ['down_min' => $minDown, 'down_max' => $maxDown, 'monthly_min' => null],
                2 => ['down_min' => $minDown, 'down_max' => $maxDown, 'monthly_min' => $minMonthly],
                3 => ['down_min' => 80, 'down_max' => 100, 'monthly_min' => null], // Business rule
                4 => ['down_min' => 50, 'down_max' => 80, 'monthly_min' => null], // Business rule
                5 => ['down_min' => 0, 'down_max' => 0, 'monthly_min' => $minMonthly],
                6 => ['down_min' => 0, 'down_max' => 0, 'monthly_min' => $minMonthlyAlt6],
            ];

            $constraint = $constraints[$alternative] ?? null;

            if ($constraint) {
                if ($downPaymentPercent !== null) {
                    if ($downPaymentPercent < $constraint['down_min'] || $downPaymentPercent > $constraint['down_max']) {
                        return $this->error(
                            "ალტერნატივა {$alternative}-ისთვის შენატანი უნდა იყოს {$constraint['down_min']}-{$constraint['down_max']}% შორის",
                            422
                        );
                    }
                }

                if ($constraint['monthly_min'] && $monthlyPayment !== null) {
                    if ($monthlyPayment < $constraint['monthly_min']) {
                        return $this->error(
                            "ალტერნატივა {$alternative}-ისთვის ყოველთვიური გადახდა უნდა იყოს მინიმუმ \${$constraint['monthly_min']}",
                            422
                        );
                    }
                }
            }
        }

        try {
            DB::beginTransaction();

            $deal = CrmDeal::with('apartment')->findOrFail($id);

            if (!$deal->apartment) {
                return $this->error('გარიგებას არ აქვს მითითებული ბინა', 422);
            }

            $pricePerSqm = $request->price_per_sqm;
            $area = $deal->apartment->area_total;
            $totalPrice = $pricePerSqm * $area;

            $updateData = [];
            $prefix = $request->stage; // offered, reserved, or final

            $updateData["{$prefix}_price_per_sqm"] = $pricePerSqm;
            $updateData["{$prefix}_price_total"] = $totalPrice;
            $updateData["{$prefix}_at"] = now();

            // Also update main budget/agreed_price fields for compatibility
            if ($request->stage === 'offered') {
                $updateData['budget'] = $totalPrice;
            } elseif ($request->stage === 'final') {
                $updateData['agreed_price'] = $totalPrice;
                $updateData['budget'] = $totalPrice; // Final price overrides budget
            } elseif ($request->stage === 'reserved') {
                // For reserved, we update agreed_price if it's not set or update it to match
                $updateData['agreed_price'] = $totalPrice;
            }

            // Save calculator selection if provided
            if ($request->has('payment_alternative')) {
                $updateData['selected_payment_alternative'] = $request->payment_alternative;
                $updateData['payment_alternative_params'] = $request->payment_params;
            }

            $deal->update($updateData);

            // Log activity
            $stageLabels = [
                'offered' => 'შეთავაზებული ფასი',
                'reserved' => 'დაჯავშნის ფასი',
                'final' => 'საბოლოო ფასი'
            ];

            CrmActivity::create([
                'deal_id' => $deal->id,
                'user_id' => auth()->id(),
                'type' => 'note',
                'content' => "განახლდა {$stageLabels[$request->stage]}: {$totalPrice} ({$pricePerSqm}/მ²)",
                'metadata' => [
                    'stage' => $request->stage,
                    'price_per_sqm' => $pricePerSqm,
                    'total_price' => $totalPrice,
                    'payment_alternative' => $request->payment_alternative
                ],
            ]);

            // Generate payment schedule if payment alternative is selected
            if ($request->has('payment_alternative') && $request->payment_alternative) {
                $this->generateCalculatorPaymentSchedule($deal->fresh());
            }

            DB::commit();

            return $this->success($deal->fresh(), 'ფასი განახლდა');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to update deal pricing: ' . $e->getMessage());
            return $this->error('ფასის განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Generate calculator-based payment schedule for a deal
     */
    private function generateCalculatorPaymentSchedule(CrmDeal $deal): void
    {
        // Validate required data
        if (!$deal->selected_payment_alternative || !$deal->apartment) {
            return;
        }

        // Get project calculator settings
        $deal->load('apartment.building.project');
        $project = $deal->apartment->building->project ?? null;

        if (!$project || !$project->calculator_settings) {
            \Log::warning("Cannot generate payment schedule: project calculator settings not found for deal {$deal->id}");
            return;
        }

        try {
            // Extract payment parameters
            $params = $deal->payment_alternative_params ?? [];
            $basePrice = $deal->current_price / $deal->apartment->area_total;
            $area = $deal->apartment->area_total;
            $downPaymentPercent = $params['initial_payment_percent'] ?? null;
            $monthlyPayment = $params['monthly_payment'] ?? null;

            // Calculate payment schedule using calculator service with current locale
            $locale = app()->getLocale();
            $calculator = new PaymentScheduleCalculatorService($locale);
            $result = $calculator->calculate(
                $deal->selected_payment_alternative,
                $basePrice,
                $area,
                $project->calculator_settings,
                $downPaymentPercent,
                $monthlyPayment
            );

            // Delete existing calculator-generated pending payments for this deal
            CrmPayment::where('deal_id', $deal->id)
                ->where('calculator_generated', true)
                ->whereIn('status', ['pending', 'partially_paid'])
                ->delete();

            // Create new payment records from schedule
            foreach ($result['schedule'] as $item) {
                CrmPayment::create([
                    'deal_id' => $deal->id,
                    'calculator_generated' => true,
                    'title' => $item['description'],
                    'installment_number' => $item['month'],
                    'amount_due' => $item['amount'],
                    'currency' => $deal->currency,
                    'due_date' => $item['date'],
                    'amount_paid' => 0,
                    'status' => 'pending',
                ]);
            }

            // Log activity
            CrmActivity::create([
                'deal_id' => $deal->id,
                'user_id' => auth()->id(),
                'type' => 'system',
                'content' => 'გადახდის გრაფიკი ავტომატურად შეიქმნა (' . count($result['schedule']) . ' გადახდა)',
                'metadata' => [
                    'payment_alternative' => $deal->selected_payment_alternative,
                    'payments_count' => count($result['schedule']),
                ],
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to generate payment schedule for deal ' . $deal->id . ': ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
        }
    }

    /**
     * Mark payment as paid with enhanced tracking
     */
    public function markPaymentAsPaid(Request $request, $paymentId)
    {
        try {
            $payment = CrmPayment::findOrFail($paymentId);
            $deal = $payment->deal;

            $validator = Validator::make($request->all(), [
                'paid_date' => 'required|date',
                'amount_paid' => 'required|numeric|min:0',
                'payment_method' => 'nullable|string|max:50',
                'transaction_reference' => 'nullable|string|max:255',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return $this->error($validator->errors()->first(), 422);
            }

            $amountPaid = $request->amount_paid;
            $isFullPayment = $amountPaid >= $payment->amount_due;

            // Update payment
            $payment->update([
                'paid_date' => $request->paid_date,
                'amount_paid' => $amountPaid,
                'payment_method' => $request->payment_method,
                'transaction_reference' => $request->transaction_reference,
                'notes' => $request->notes,
                'status' => $isFullPayment ? 'paid' : 'partially_paid',
            ]);

            // Log activity
            $activityContent = $isFullPayment
                ? "გადახდა #{$payment->installment_number} მონიშნულია როგორც გადახდილი - {$payment->currency} {$amountPaid}"
                : "ნაწილობრივი გადახდა #{$payment->installment_number} - {$payment->currency} {$amountPaid} / {$payment->amount_due}";

            CrmActivity::create([
                'deal_id' => $deal->id,
                'user_id' => auth()->id(),
                'type' => 'payment',
                'content' => $activityContent,
                'metadata' => [
                    'payment_id' => $payment->id,
                    'amount_paid' => $amountPaid,
                    'amount_due' => $payment->amount_due,
                    'paid_date' => $request->paid_date,
                    'payment_method' => $request->payment_method,
                    'transaction_reference' => $request->transaction_reference,
                ],
            ]);

            // Update deal's last activity timestamp
            $deal->touch('last_activity_at');

            // Clear cache
            self::clearPipelineCache();

            return $this->success($payment->fresh(), 'გადახდა წარმატებით განახლდა');

        } catch (\Exception $e) {
            \Log::error('Failed to mark payment as paid: ' . $e->getMessage());
            return $this->error('გადახდის განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Edit payment amount with reason tracking
     */
    public function editPaymentAmount(Request $request, $paymentId)
    {
        try {
            $payment = CrmPayment::findOrFail($paymentId);
            $deal = $payment->deal;

            // Only allow editing if payment is pending or partially paid
            if (!in_array($payment->status, ['pending', 'partially_paid'])) {
                return $this->error('მხოლოდ მიმდინარე ან ნაწილობრივ გადახდილი გადახდების რედაქტირებაა შესაძლებელი', 422);
            }

            $validator = Validator::make($request->all(), [
                'new_amount' => 'required|numeric|min:0',
                'reason' => 'required|string|max:255',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return $this->error($validator->errors()->first(), 422);
            }

            $oldAmount = $payment->amount_due;
            $newAmount = $request->new_amount;

            // Update payment amount
            $payment->update([
                'amount_due' => $newAmount,
                'notes' => $request->notes,
            ]);

            // Log activity
            $difference = $newAmount - $oldAmount;
            $differenceText = $difference > 0 ? "+{$difference}" : "{$difference}";

            CrmActivity::create([
                'deal_id' => $deal->id,
                'user_id' => auth()->id(),
                'type' => 'payment',
                'content' => "გადახდის თანხა შეცვლილია #{$payment->installment_number}: {$payment->currency} {$oldAmount} → {$newAmount} ({$differenceText}). მიზეზი: {$request->reason}",
                'metadata' => [
                    'payment_id' => $payment->id,
                    'old_amount' => $oldAmount,
                    'new_amount' => $newAmount,
                    'reason' => $request->reason,
                ],
            ]);

            // Update deal's last activity timestamp
            $deal->touch('last_activity_at');

            // Clear cache
            self::clearPipelineCache();

            return $this->success($payment->fresh(), 'გადახდის თანხა წარმატებით შეიცვალა');

        } catch (\Exception $e) {
            \Log::error('Failed to edit payment amount: ' . $e->getMessage());
            return $this->error('გადახდის რედაქტირება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Regenerate payment schedule while preserving paid payments
     */
    public function regeneratePaymentSchedule(Request $request, $dealId)
    {
        try {
            // Use transaction with pessimistic locking to prevent race conditions
            return DB::transaction(function () use ($dealId) {
                // Lock the deal row to prevent concurrent modifications
                $deal = CrmDeal::with(['apartment.building.project', 'payments'])
                    ->lockForUpdate()
                    ->findOrFail($dealId);

                if (!$deal->selected_payment_alternative || !$deal->apartment) {
                    return $this->error('გადახდის ალტერნატივა არ არის არჩეული', 422);
                }

                // Count payments by status before regeneration
                $paidCount = $deal->payments()->where('status', 'paid')->count();
                $pendingCount = $deal->payments()->whereIn('status', ['pending', 'partially_paid'])->count();

                // Regenerate schedule (this will delete pending/partial payments and create new ones)
                $this->generateCalculatorPaymentSchedule($deal);

                // Log activity
                CrmActivity::create([
                    'deal_id' => $deal->id,
                    'user_id' => auth()->id(),
                    'type' => 'system',
                    'content' => "გადახდის გრაფიკი თავიდან შეიქმნა. შენარჩუნებულია: {$paidCount} გადახდილი, შეცვლილია: {$pendingCount} მიმდინარე",
                    'metadata' => [
                        'paid_preserved' => $paidCount,
                        'pending_replaced' => $pendingCount,
                    ],
                ]);

                // Clear cache
                self::clearPipelineCache();

                // Pagination parameters
                $perPage = $request->input('per_page', 10);
                $page = $request->input('page', 1);

                // Get paginated payments
                $paymentsQuery = CrmPayment::where('deal_id', $dealId)
                    ->orderBy('due_date');

                $total = $paymentsQuery->count();

                $payments = $paymentsQuery
                    ->skip(($page - 1) * $perPage)
                    ->take($perPage)
                    ->get();

                return $this->success([
                    'payments' => $payments,
                    'pagination' => [
                        'total' => $total,
                        'per_page' => $perPage,
                        'current_page' => $page,
                        'last_page' => ceil($total / $perPage),
                    ],
                ], 'გადახდის გრაფიკი წარმატებით განახლდა');
            });

        } catch (\Exception $e) {
            \Log::error('Failed to regenerate payment schedule: ' . $e->getMessage());
            return $this->error('გადახდის გრაფიკის თავიდან შექმნა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Auto-carry forward pricing from one stage to another
     */
    private function carryForwardPricing(CrmDeal $deal, CrmStage $newStage)
    {
        $stageName = strtolower($newStage->name);

        // Offered → Reserved
        if (str_contains($stageName, 'reserved') || str_contains($stageName, 'contract') ||
            str_contains($stageName, 'დაჯავშნ') || str_contains($stageName, 'კონტრაქტ')) {
            if ($deal->offered_price_per_sqm) {
                $deal->reserved_price_per_sqm = $deal->offered_price_per_sqm;
                $deal->reserved_price_total = $deal->offered_price_total;
                $deal->reserved_at = now();
                $deal->save();
            }
        }

        // Reserved → Final (Won)
        if ($newStage->type === 'won') {
            if ($deal->reserved_price_per_sqm) {
                $deal->final_price_per_sqm = $deal->reserved_price_per_sqm;
                $deal->final_price_total = $deal->reserved_price_total;
                $deal->final_at = now();
                $deal->save();
            } elseif ($deal->offered_price_per_sqm) {
                // Fallback: copy from offered if reserved not set
                $deal->final_price_per_sqm = $deal->offered_price_per_sqm;
                $deal->final_price_total = $deal->offered_price_total;
                $deal->final_at = now();
                $deal->save();
            }

            // Auto-generate payment schedule when moving to Won stage
            if ($deal->selected_payment_alternative && $deal->apartment) {
                $this->generateCalculatorPaymentSchedule($deal->fresh());
            }
        }
    }
}
