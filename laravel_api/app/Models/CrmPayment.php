<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class CrmPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'deal_id',
        'title',
        'installment_number',
        'amount_due',
        'currency',
        'due_date',
        'amount_paid',
        'paid_date',
        'status',
        'payment_method',
        'notes',
    ];

    protected $casts = [
        'amount_due' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'due_date' => 'date',
        'paid_date' => 'date',
        'installment_number' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Status labels in Georgian
     */
    public const STATUS_LABELS = [
        'pending' => 'მოლოდინში',
        'paid' => 'გადახდილი',
        'overdue' => 'ვადაგადაცილებული',
        'partially_paid' => 'ნაწილობრივ გადახდილი',
        'cancelled' => 'გაუქმებული',
    ];

    /**
     * Payment method labels in Georgian
     */
    public const METHOD_LABELS = [
        'bank_transfer' => 'საბანკო გადარიცხვა',
        'cash' => 'ნაღდი',
        'card' => 'ბარათი',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-update status based on payment and due date
        static::saving(function ($payment) {
            $payment->updateStatus();
        });
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the deal for this payment
     */
    public function deal(): BelongsTo
    {
        return $this->belongsTo(CrmDeal::class, 'deal_id');
    }

    // ==================== SCOPES ====================

    /**
     * Scope to get pending payments
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get paid payments
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope to get overdue payments
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue')
            ->orWhere(function ($q) {
                $q->where('status', 'pending')
                    ->where('due_date', '<', now()->startOfDay());
            });
    }

    /**
     * Scope to get payments due this month
     */
    public function scopeDueThisMonth($query)
    {
        return $query->whereBetween('due_date', [
            now()->startOfMonth(),
            now()->endOfMonth(),
        ]);
    }

    /**
     * Scope to get payments due in a date range
     */
    public function scopeDueBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('due_date', [$startDate, $endDate]);
    }

    /**
     * Scope to order by due date
     */
    public function scopeOrderByDueDate($query, $direction = 'asc')
    {
        return $query->orderBy('due_date', $direction);
    }

    // ==================== ACCESSORS ====================

    /**
     * Get status label in Georgian
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? $this->status;
    }

    /**
     * Get payment method label in Georgian
     */
    public function getMethodLabelAttribute(): ?string
    {
        if (!$this->payment_method) {
            return null;
        }
        return self::METHOD_LABELS[$this->payment_method] ?? $this->payment_method;
    }

    /**
     * Get remaining amount to pay
     */
    public function getRemainingAmountAttribute(): float
    {
        return max(0, $this->amount_due - $this->amount_paid);
    }

    /**
     * Check if payment is fully paid
     */
    public function getIsPaidAttribute(): bool
    {
        return $this->amount_paid >= $this->amount_due;
    }

    /**
     * Check if payment is overdue
     */
    public function getIsOverdueAttribute(): bool
    {
        if ($this->status === 'paid' || $this->status === 'cancelled') {
            return false;
        }
        return Carbon::parse($this->due_date)->isPast();
    }

    /**
     * Get days until due (negative if overdue)
     */
    public function getDaysUntilDueAttribute(): int
    {
        return now()->startOfDay()->diffInDays($this->due_date, false);
    }

    // ==================== METHODS ====================

    /**
     * Update status based on payment and due date
     */
    public function updateStatus(): void
    {
        if ($this->status === 'cancelled') {
            return;
        }

        if ($this->amount_paid >= $this->amount_due) {
            $this->status = 'paid';
            $this->paid_date = $this->paid_date ?? now();
        } elseif ($this->amount_paid > 0) {
            $this->status = 'partially_paid';
        } elseif (Carbon::parse($this->due_date)->isPast()) {
            $this->status = 'overdue';
        } else {
            $this->status = 'pending';
        }
    }

    /**
     * Mark as paid
     */
    public function markAsPaid(float $amount = null, string $method = null): void
    {
        $this->update([
            'amount_paid' => $amount ?? $this->amount_due,
            'paid_date' => now(),
            'payment_method' => $method,
            'status' => 'paid',
        ]);

        // Log activity on the deal
        if ($this->deal) {
            CrmActivity::logPayment($this->deal, $this, auth()->id());
        }
    }

    /**
     * Add partial payment
     */
    public function addPayment(float $amount, string $method = null): void
    {
        $newTotal = $this->amount_paid + $amount;

        $this->update([
            'amount_paid' => $newTotal,
            'payment_method' => $method ?? $this->payment_method,
            'paid_date' => $newTotal >= $this->amount_due ? now() : $this->paid_date,
        ]);

        // Log activity on the deal
        if ($this->deal) {
            CrmActivity::logPayment($this->deal, $this, auth()->id());
        }
    }

    // ==================== STATIC METHODS ====================

    /**
     * Generate payment schedule for a deal
     */
    public static function generateSchedule(
        CrmDeal $deal,
        float $totalPrice,
        float $downPaymentPercent,
        int $installmentCount,
        Carbon $startDate = null
    ): array {
        $startDate = $startDate ?? now();
        $currency = $deal->currency;
        $payments = [];

        // Calculate amounts
        $downPaymentAmount = $totalPrice * ($downPaymentPercent / 100);
        $remainingAmount = $totalPrice - $downPaymentAmount;
        $installmentAmount = $installmentCount > 0 ? round($remainingAmount / $installmentCount, 2) : 0;

        // Create down payment
        $payments[] = self::create([
            'deal_id' => $deal->id,
            'title' => 'საწყისი შენატანი',
            'installment_number' => 0,
            'amount_due' => $downPaymentAmount,
            'currency' => $currency,
            'due_date' => $startDate,
            'status' => 'pending',
        ]);

        // Create installments
        for ($i = 1; $i <= $installmentCount; $i++) {
            $dueDate = $startDate->copy()->addMonths($i);

            // Adjust last payment to account for rounding
            $amount = $installmentAmount;
            if ($i === $installmentCount) {
                $paidSoFar = $downPaymentAmount + ($installmentAmount * ($installmentCount - 1));
                $amount = $totalPrice - $paidSoFar;
            }

            $payments[] = self::create([
                'deal_id' => $deal->id,
                'title' => "განვადება #{$i}",
                'installment_number' => $i,
                'amount_due' => $amount,
                'currency' => $currency,
                'due_date' => $dueDate,
                'status' => 'pending',
            ]);
        }

        // Log system activity
        CrmActivity::logSystem(
            $deal,
            "გადახდის გრაფიკი შეიქმნა: {$totalPrice} {$currency}, {$downPaymentPercent}% საწყისი, {$installmentCount} განვადება",
            [
                'total_price' => $totalPrice,
                'down_payment_percent' => $downPaymentPercent,
                'installment_count' => $installmentCount,
            ]
        );

        return $payments;
    }
}
