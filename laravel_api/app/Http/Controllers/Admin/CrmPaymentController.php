<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CrmPayment;
use App\Models\CrmDeal;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CrmPaymentController extends Controller
{
    use ApiResponse;

    /**
     * Get payments for a deal
     */
    public function index(Request $request, $dealId)
    {
        try {
            $deal = CrmDeal::findOrFail($dealId);

            // Pagination parameters
            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);

            // Get paginated payments
            $paymentsQuery = $deal->payments()
                ->orderBy('due_date', 'asc');

            $total = $paymentsQuery->count();

            $payments = $paymentsQuery
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get()
                ->map(function ($payment) {
                    $paymentArray = $payment->toArray();
                    $paymentArray['status_label'] = $payment->status_label;
                    $paymentArray['method_label'] = $payment->method_label;
                    $paymentArray['remaining_amount'] = $payment->remaining_amount;
                    $paymentArray['is_overdue'] = $payment->is_overdue;
                    $paymentArray['days_until_due'] = $payment->days_until_due;
                    return $paymentArray;
                });

            $summary = [
                'total_due' => $deal->total_due,
                'total_paid' => $deal->total_paid,
                'payment_progress' => $deal->payment_progress,
                'remaining' => $deal->total_due - $deal->total_paid,
            ];

            return $this->success([
                'payments' => $payments,
                'summary' => $summary,
                'pagination' => [
                    'total' => $total,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => ceil($total / $perPage),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch payments: ' . $e->getMessage());
            return $this->error('გადახდების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Create a single payment
     */
    public function store(Request $request, $dealId)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'amount_due' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            $deal = CrmDeal::findOrFail($dealId);

            // Get next installment number
            $maxInstallment = $deal->payments()->max('installment_number') ?? 0;

            $payment = CrmPayment::create([
                'deal_id' => $deal->id,
                'title' => $request->title,
                'installment_number' => $maxInstallment + 1,
                'amount_due' => $request->amount_due,
                'currency' => $deal->currency,
                'due_date' => $request->due_date,
                'status' => 'pending',
                'notes' => $request->notes,
            ]);

            return $this->success($payment, 'გადახდა დაემატა', 201);
        } catch (\Exception $e) {
            \Log::error('Failed to create payment: ' . $e->getMessage());
            return $this->error('გადახდის დამატება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Generate payment schedule
     */
    public function generateSchedule(Request $request, $dealId)
    {
        $validator = Validator::make($request->all(), [
            'total_price' => 'required|numeric|min:1',
            'down_payment_percent' => 'required|numeric|min:0|max:100',
            'installment_count' => 'required|integer|min:0|max:120',
            'start_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            DB::beginTransaction();

            $deal = CrmDeal::findOrFail($dealId);

            // Delete existing payments
            $deal->payments()->delete();

            // Update deal's agreed price
            $deal->update(['agreed_price' => $request->total_price]);

            // Generate new schedule
            $startDate = $request->start_date ? Carbon::parse($request->start_date) : now();

            $payments = CrmPayment::generateSchedule(
                $deal,
                $request->total_price,
                $request->down_payment_percent,
                $request->installment_count,
                $startDate
            );

            DB::commit();

            // Reload payments
            $paymentsData = $deal->fresh()->payments->map(function ($payment) {
                $paymentArray = $payment->toArray();
                $paymentArray['status_label'] = $payment->status_label;
                $paymentArray['remaining_amount'] = $payment->remaining_amount;
                return $paymentArray;
            });

            return $this->success([
                'payments' => $paymentsData,
                'summary' => [
                    'total_due' => $deal->total_due,
                    'total_paid' => $deal->total_paid,
                    'payment_progress' => $deal->payment_progress,
                ],
            ], 'გადახდის გრაფიკი შეიქმნა');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to generate payment schedule: ' . $e->getMessage());
            return $this->error('გრაფიკის შექმნა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Update a payment
     */
    public function update(Request $request, $paymentId)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'amount_due' => 'sometimes|numeric|min:0.01',
            'due_date' => 'sometimes|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            $payment = CrmPayment::findOrFail($paymentId);
            $payment->update($request->only(['title', 'amount_due', 'due_date', 'notes']));

            $paymentData = $payment->toArray();
            $paymentData['status_label'] = $payment->status_label;
            $paymentData['remaining_amount'] = $payment->remaining_amount;

            return $this->success($paymentData, 'გადახდა განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to update payment: ' . $e->getMessage());
            return $this->error('გადახდის განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Mark payment as paid
     */
    public function markPaid(Request $request, $paymentId)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'nullable|numeric|min:0.01',
            'payment_method' => 'nullable|string|in:bank_transfer,cash,card',
            'paid_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        try {
            $payment = CrmPayment::findOrFail($paymentId);

            $amount = $request->amount ?? $payment->amount_due;

            $payment->update([
                'amount_paid' => $amount,
                'paid_date' => $request->paid_date ?? now(),
                'payment_method' => $request->payment_method,
                'status' => $amount >= $payment->amount_due ? 'paid' : 'partially_paid',
            ]);

            // Log activity on the deal
            if ($payment->deal) {
                \App\Models\CrmActivity::logPayment($payment->deal, $payment, auth()->id());
            }

            $paymentData = $payment->fresh()->toArray();
            $paymentData['status_label'] = $payment->status_label;
            $paymentData['remaining_amount'] = $payment->remaining_amount;

            return $this->success($paymentData, 'გადახდა დადასტურდა');
        } catch (\Exception $e) {
            \Log::error('Failed to mark payment as paid: ' . $e->getMessage());
            return $this->error('გადახდის დადასტურება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Cancel a payment
     */
    public function cancel($paymentId)
    {
        try {
            $payment = CrmPayment::findOrFail($paymentId);
            $payment->update(['status' => 'cancelled']);

            return $this->success($payment, 'გადახდა გაუქმდა');
        } catch (\Exception $e) {
            \Log::error('Failed to cancel payment: ' . $e->getMessage());
            return $this->error('გადახდის გაუქმება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Delete a payment
     */
    public function destroy($paymentId)
    {
        try {
            $payment = CrmPayment::findOrFail($paymentId);

            // Don't allow deleting paid payments
            if ($payment->status === 'paid') {
                return $this->error('გადახდილი თანხის წაშლა შეუძლებელია', 422);
            }

            $payment->delete();

            return $this->success(null, 'გადახდა წაიშალა');
        } catch (\Exception $e) {
            \Log::error('Failed to delete payment: ' . $e->getMessage());
            return $this->error('გადახდის წაშლა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get payment dashboard statistics
     */
    public function dashboard(Request $request)
    {
        try {
            $now = Carbon::now();
            $startOfMonth = $now->copy()->startOfMonth();
            $endOfMonth = $now->copy()->endOfMonth();

            // Expected this month
            $expectedThisMonth = CrmPayment::pending()
                ->dueBetween($startOfMonth, $endOfMonth)
                ->sum('amount_due');

            // Received this month
            $receivedThisMonth = CrmPayment::paid()
                ->whereMonth('paid_date', $now->month)
                ->whereYear('paid_date', $now->year)
                ->sum('amount_paid');

            // Overdue payments
            $overdue = CrmPayment::overdue()->get();
            $overdueAmount = $overdue->sum(function ($p) {
                return $p->amount_due - $p->amount_paid;
            });
            $overdueCount = $overdue->count();

            // Upcoming payments (next 7 days)
            $upcoming = CrmPayment::pending()
                ->dueBetween($now, $now->copy()->addDays(7))
                ->sum('amount_due');

            // Cash flow projection (next 6 months)
            $cashFlow = [];
            for ($i = 0; $i < 6; $i++) {
                $monthStart = $now->copy()->addMonths($i)->startOfMonth();
                $monthEnd = $now->copy()->addMonths($i)->endOfMonth();

                $expected = CrmPayment::whereIn('status', ['pending', 'overdue'])
                    ->dueBetween($monthStart, $monthEnd)
                    ->sum('amount_due');

                $cashFlow[] = [
                    'month' => $monthStart->format('Y-m'),
                    'month_name' => $monthStart->translatedFormat('F Y'),
                    'expected' => $expected,
                ];
            }

            return $this->success([
                'expected_this_month' => $expectedThisMonth,
                'received_this_month' => $receivedThisMonth,
                'overdue_amount' => $overdueAmount,
                'overdue_count' => $overdueCount,
                'upcoming_7_days' => $upcoming,
                'cash_flow' => $cashFlow,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch payment dashboard: ' . $e->getMessage());
            return $this->error('დაშბორდის ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get overdue payments list
     */
    public function overdue(Request $request)
    {
        try {
            $query = CrmPayment::with(['deal.customer', 'deal.user'])
                ->overdue()
                ->orderBy('due_date', 'asc');

            $perPage = $request->get('per_page', 20);
            $payments = $query->paginate($perPage);

            $paymentsData = $payments->getCollection()->map(function ($payment) {
                $paymentArray = $payment->toArray();
                $paymentArray['status_label'] = $payment->status_label;
                $paymentArray['remaining_amount'] = $payment->remaining_amount;
                $paymentArray['days_overdue'] = abs($payment->days_until_due);
                return $paymentArray;
            });

            return $this->success([
                'data' => $paymentsData,
                'meta' => [
                    'current_page' => $payments->currentPage(),
                    'from' => $payments->firstItem(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'to' => $payments->lastItem(),
                    'total' => $payments->total(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch overdue payments: ' . $e->getMessage());
            return $this->error('ვადაგადაცილებული გადახდების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get payment methods with labels
     */
    public function methods()
    {
        return $this->success(CrmPayment::METHOD_LABELS);
    }
}
