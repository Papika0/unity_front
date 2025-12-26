<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'sort_order',
        'color',
        'locks_apartment',
        'days_until_stale',
        'requires_apartment',
        'requires_lost_reason',
    ];

    protected $casts = [
        'locks_apartment' => 'boolean',
        'requires_apartment' => 'boolean',
        'requires_lost_reason' => 'boolean',
        'days_until_stale' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Get all deals in this stage
     */
    public function deals(): HasMany
    {
        return $this->hasMany(CrmDeal::class, 'stage_id');
    }

    /**
     * Scope to get stages in order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }

    /**
     * Scope to get only open stages
     */
    public function scopeOpen($query)
    {
        return $query->where('type', 'open');
    }

    /**
     * Check if this is the "won" stage
     */
    public function isWon(): bool
    {
        return $this->type === 'won';
    }

    /**
     * Check if this is the "lost" stage
     */
    public function isLost(): bool
    {
        return $this->type === 'lost';
    }

    /**
     * Check if this is a closing stage (won or lost)
     */
    public function isClosing(): bool
    {
        return in_array($this->type, ['won', 'lost']);
    }

    // ==================== CACHE METHODS ====================

    /**
     * Get all stages with caching (reference data - rarely changes)
     */
    public static function getCached()
    {
        return \Cache::rememberForever('crm_stages_all', function () {
            return static::ordered()->get();
        });
    }

    /**
     * Clear stages cache (call when stages are modified)
     */
    public static function clearCache(): void
    {
        \Cache::forget('crm_stages_all');
    }
}
