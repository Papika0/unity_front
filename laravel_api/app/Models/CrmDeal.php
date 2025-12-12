<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class CrmDeal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'user_id',
        'apartment_id',
        'stage_id',
        'lost_reason_id',
        'title',
        'budget',
        'agreed_price',
        'currency',
        'priority',
        'expected_close_date',
        'last_activity_at',
        'closed_at',
        'notes',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'agreed_price' => 'decimal:2',
        'expected_close_date' => 'date',
        'last_activity_at' => 'datetime',
        'closed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $with = ['stage'];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-update last_activity_at on any change
        static::updating(function ($deal) {
            if (!$deal->isDirty('last_activity_at')) {
                $deal->last_activity_at = now();
            }
        });
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the customer for this deal
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the assigned agent (marketing user)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the linked apartment
     */
    public function apartment(): BelongsTo
    {
        return $this->belongsTo(Apartment::class);
    }

    /**
     * Get the current stage
     */
    public function stage(): BelongsTo
    {
        return $this->belongsTo(CrmStage::class);
    }

    /**
     * Get the lost reason (if lost)
     */
    public function lostReason(): BelongsTo
    {
        return $this->belongsTo(CrmLostReason::class);
    }

    /**
     * Get all activities for this deal
     */
    public function activities(): HasMany
    {
        return $this->hasMany(CrmActivity::class, 'deal_id')->orderBy('created_at', 'desc');
    }

    /**
     * Get all payments for this deal
     */
    public function payments(): HasMany
    {
        return $this->hasMany(CrmPayment::class, 'deal_id')->orderBy('due_date', 'asc');
    }

    // ==================== SCOPES ====================

    /**
     * Scope to filter by stage
     */
    public function scopeInStage($query, $stageId)
    {
        return $query->where('stage_id', $stageId);
    }

    /**
     * Scope to get open deals (not won or lost)
     */
    public function scopeOpen($query)
    {
        return $query->whereHas('stage', function ($q) {
            $q->where('type', 'open');
        });
    }

    /**
     * Scope to get closed deals (won or lost)
     */
    public function scopeClosed($query)
    {
        return $query->whereHas('stage', function ($q) {
            $q->whereIn('type', ['won', 'lost']);
        });
    }

    /**
     * Scope to get won deals
     */
    public function scopeWon($query)
    {
        return $query->whereHas('stage', function ($q) {
            $q->where('type', 'won');
        });
    }

    /**
     * Scope to get lost deals
     */
    public function scopeLost($query)
    {
        return $query->whereHas('stage', function ($q) {
            $q->where('type', 'lost');
        });
    }

    /**
     * Scope to get deals assigned to a specific user
     */
    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get stale deals
     */
    public function scopeStale($query)
    {
        return $query->whereHas('stage', function ($q) {
            $q->whereNotNull('days_until_stale');
        })->where(function ($q) {
            $q->whereRaw('DATEDIFF(NOW(), last_activity_at) > (SELECT days_until_stale FROM crm_stages WHERE crm_stages.id = crm_deals.stage_id)');
        });
    }

    // ==================== ACCESSORS ====================

    /**
     * Check if deal is stale (needs attention)
     */
    public function getIsStaleAttribute(): bool
    {
        if (!$this->stage || !$this->stage->days_until_stale) {
            return false;
        }

        $daysSinceActivity = $this->last_activity_at
            ? Carbon::parse($this->last_activity_at)->diffInDays(now())
            : Carbon::parse($this->created_at)->diffInDays(now());

        return $daysSinceActivity > $this->stage->days_until_stale;
    }

    /**
     * Get days since last activity
     */
    public function getDaysSinceActivityAttribute(): int
    {
        $lastActivity = $this->last_activity_at ?? $this->created_at;
        return Carbon::parse($lastActivity)->diffInDays(now());
    }

    /**
     * Get total paid amount from payments
     */
    public function getTotalPaidAttribute(): float
    {
        return $this->payments()->sum('amount_paid');
    }

    /**
     * Get total due amount from payments
     */
    public function getTotalDueAttribute(): float
    {
        return $this->payments()->sum('amount_due');
    }

    /**
     * Get payment progress percentage
     */
    public function getPaymentProgressAttribute(): float
    {
        $totalDue = $this->total_due;
        if ($totalDue <= 0) {
            return 0;
        }
        return round(($this->total_paid / $totalDue) * 100, 2);
    }

    /**
     * Check if deal is closed (won or lost)
     */
    public function getIsClosedAttribute(): bool
    {
        return $this->stage && $this->stage->isClosing();
    }

    // ==================== METHODS ====================

    /**
     * Update last activity timestamp
     */
    public function touchActivity(): void
    {
        $this->update(['last_activity_at' => now()]);
    }

    /**
     * Generate deal title based on customer and apartment
     */
    public static function generateTitle(Customer $customer, ?Apartment $apartment = null): string
    {
        $baseName = $customer->name;

        if ($apartment) {
            return "{$baseName} - ბინა {$apartment->apartment_number}";
        }

        return "{$baseName} - ახალი ლიდი";
    }

    /**
     * Update title when apartment is linked
     */
    public function updateTitleWithApartment(): void
    {
        if ($this->apartment_id && $this->apartment) {
            $this->update([
                'title' => self::generateTitle($this->customer, $this->apartment)
            ]);
        }
    }
}
