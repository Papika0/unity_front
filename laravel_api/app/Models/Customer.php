<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'source',
        'status',
        'notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scope to get new customers
     */
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    /**
     * Scope to get by source
     */
    public function scopeBySource($query, $source)
    {
        return $query->where('source', $source);
    }

    /**
     * Scope to get by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get recent customers
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Get all deals for this customer
     */
    public function deals(): HasMany
    {
        return $this->hasMany(CrmDeal::class);
    }

    /**
     * Get active deals (not closed)
     */
    public function activeDeals(): HasMany
    {
        return $this->deals()->whereHas('stage', function ($q) {
            $q->where('type', 'open');
        });
    }

    /**
     * Check if customer has any active deals
     */
    public function hasActiveDeals(): bool
    {
        return $this->activeDeals()->exists();
    }

    /**
     * Find existing customer by phone or email
     */
    public static function findByContact(?string $phone = null, ?string $email = null): ?self
    {
        if (!$phone && !$email) {
            return null;
        }

        return self::where(function ($query) use ($phone, $email) {
            if ($phone) {
                $query->orWhere('phone', $phone);
            }
            if ($email) {
                $query->orWhere('email', $email);
            }
        })->first();
    }
}
