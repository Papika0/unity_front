<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

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
        'cadastral_code',
        'status',
        'price',
        'area_total',
        'area_living',
        'summer_area',
        'bedrooms',
        'bathrooms',
        'has_balcony',
        'is_parking',
        'is_active',
        'sort_order',
        'room_details',
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
        'summer_area' => 'decimal:2',
        'has_balcony' => 'boolean',
        'is_parking' => 'boolean',
        'is_active' => 'boolean',
        'room_details' => 'array',
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

    /**
     * Get all deals for this apartment.
     */
    public function deals(): HasMany
    {
        return $this->hasMany(CrmDeal::class);
    }

    /**
     * Get active deals (not closed) for this apartment.
     */
    public function activeDeals(): HasMany
    {
        return $this->deals()->whereHas('stage', function ($q) {
            $q->where('type', 'open');
        });
    }

    /**
     * Check if apartment has any active deals.
     */
    public function hasActiveDeals(): bool
    {
        return $this->activeDeals()->exists();
    }

    /**
     * Check if apartment is available for new deals.
     */
    public function isAvailableForDeals(): bool
    {
        return $this->status === 'available' && !$this->hasActiveDeals();
    }

    /**
     * Mark apartment as reserved.
     */
    public function markAsReserved(): void
    {
        $this->update(['status' => 'reserved']);
    }

    /**
     * Mark apartment as sold.
     */
    public function markAsSold(): void
    {
        $this->update(['status' => 'sold']);
    }

    /**
     * Mark apartment as available.
     */
    public function markAsAvailable(): void
    {
        $this->update(['status' => 'available']);
    }

    /**
     * Get all images for the apartment.
     */
    public function images(): MorphToMany
    {
        return $this->morphToMany(Image::class, 'imageable', 'imageables');
    }

    /**
     * Get the 2D floor plan image.
     */
    public function image2d(): MorphToMany
    {
        return $this->morphToMany(Image::class, 'imageable', 'imageables')
            ->wherePivot('type', '2d');
    }

    /**
     * Get the 3D render image.
     */
    public function image3d(): MorphToMany
    {
        return $this->morphToMany(Image::class, 'imageable', 'imageables')
            ->wherePivot('type', '3d');
    }
}
