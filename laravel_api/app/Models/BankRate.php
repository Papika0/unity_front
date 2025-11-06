<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class BankRate extends Model
{
    use HasFactory, HasTranslations;

    public $translatable = ['bank_name'];

    protected $fillable = [
        'bank_name',
        'interest_rate',
        'min_loan_term_years',
        'max_loan_term_years',
        'min_down_payment_percent',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'bank_name' => 'array',
        'interest_rate' => 'decimal:2',
        'is_active' => 'boolean',
        'min_loan_term_years' => 'integer',
        'max_loan_term_years' => 'integer',
        'min_down_payment_percent' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Scope to only get active bank rates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
