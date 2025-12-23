<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmLostReason extends Model
{
    use HasFactory;

    protected $fillable = [
        'label',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get all deals with this lost reason
     */
    public function deals(): HasMany
    {
        return $this->hasMany(CrmDeal::class, 'lost_reason_id');
    }

    /**
     * Scope to get only active reasons
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get reasons in order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }
}
