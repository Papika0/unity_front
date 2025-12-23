<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'deal_id',
        'user_id',
        'type',
        'content',
        'metadata',
        'scheduled_at',
        'completed_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Activity type labels in Georgian
     */
    public const TYPE_LABELS = [
        'note' => 'შენიშვნა',
        'call' => 'ზარი',
        'email' => 'ელ-ფოსტა',
        'meeting' => 'შეხვედრა',
        'status_change' => 'სტატუსის ცვლილება',
        'payment' => 'გადახდა',
        'system' => 'სისტემური',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Update deal's last_activity_at when activity is created
        static::created(function ($activity) {
            if ($activity->deal) {
                $activity->deal->touchActivity();
            }
        });
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the deal for this activity
     */
    public function deal(): BelongsTo
    {
        return $this->belongsTo(CrmDeal::class, 'deal_id');
    }

    /**
     * Get the user who created this activity
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope to filter by type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get only notes
     */
    public function scopeNotes($query)
    {
        return $query->where('type', 'note');
    }

    /**
     * Scope to get scheduled tasks
     */
    public function scopeScheduled($query)
    {
        return $query->whereNotNull('scheduled_at')
            ->whereNull('completed_at');
    }

    /**
     * Scope to get overdue tasks
     */
    public function scopeOverdue($query)
    {
        return $query->whereNotNull('scheduled_at')
            ->whereNull('completed_at')
            ->where('scheduled_at', '<', now());
    }

    /**
     * Scope to order by most recent
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    // ==================== ACCESSORS ====================

    /**
     * Get the type label in Georgian
     */
    public function getTypeLabelAttribute(): string
    {
        return self::TYPE_LABELS[$this->type] ?? $this->type;
    }

    /**
     * Check if activity is a scheduled task
     */
    public function getIsTaskAttribute(): bool
    {
        return $this->scheduled_at !== null;
    }

    /**
     * Check if task is overdue
     */
    public function getIsOverdueAttribute(): bool
    {
        if (!$this->scheduled_at || $this->completed_at) {
            return false;
        }
        return $this->scheduled_at->isPast();
    }

    // ==================== STATIC METHODS ====================

    /**
     * Log a status change activity
     */
    public static function logStatusChange(
        CrmDeal $deal,
        CrmStage $oldStage,
        CrmStage $newStage,
        ?int $userId = null
    ): self {
        return self::create([
            'deal_id' => $deal->id,
            'user_id' => $userId,
            'type' => 'status_change',
            'content' => "სტატუსი შეიცვალა: {$oldStage->name} → {$newStage->name}",
            'metadata' => [
                'old_stage_id' => $oldStage->id,
                'old_stage_name' => $oldStage->name,
                'new_stage_id' => $newStage->id,
                'new_stage_name' => $newStage->name,
            ],
        ]);
    }

    /**
     * Log a payment activity
     */
    public static function logPayment(
        CrmDeal $deal,
        CrmPayment $payment,
        ?int $userId = null
    ): self {
        return self::create([
            'deal_id' => $deal->id,
            'user_id' => $userId,
            'type' => 'payment',
            'content' => "გადახდა მიღებულია: {$payment->title} - {$payment->amount_paid} {$payment->currency}",
            'metadata' => [
                'payment_id' => $payment->id,
                'amount' => $payment->amount_paid,
                'currency' => $payment->currency,
            ],
        ]);
    }

    /**
     * Log a system message
     */
    public static function logSystem(CrmDeal $deal, string $message, array $metadata = []): self
    {
        return self::create([
            'deal_id' => $deal->id,
            'user_id' => null,
            'type' => 'system',
            'content' => $message,
            'metadata' => $metadata,
        ]);
    }
}
