<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
