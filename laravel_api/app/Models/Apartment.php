<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Apartment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'building_id',
        'floor_number',
        'apartment_number',
        'status',
        'price',
        'area_total',
        'area_living',
        'bedrooms',
        'bathrooms',
        'has_balcony',
        'has_parking',
        'is_active',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'area_total' => 'decimal:2',
        'area_living' => 'decimal:2',
        'has_balcony' => 'boolean',
        'has_parking' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the project that owns the apartment.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class);
    }

    /**
     * Get the building that owns the apartment.
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    /**
     * Get the interactive zone for the apartment.
     */
    public function interactiveZone(): HasOne
    {
        return $this->hasOne(InteractiveZone::class, 'entity_id')
            ->where('entity_type', 'apartment');
    }

    /**
     * Scope a query to only include available apartments.
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope a query to filter apartments by floor number.
     */
    public function scopeByFloor(Builder $query, int $floorNumber): Builder
    {
        return $query->where('floor_number', $floorNumber);
    }
}
