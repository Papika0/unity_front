<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class ZoneImage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'zone_id',
        'project_id',
        'level_type',
        'building_id',
        'floor_number',
        'image_type',
        'viewbox',
        'width',
        'height',
        'sort_order',
    ];

    /**
     * Get the project that owns the zone image.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class);
    }

    /**
     * Get the building that owns the zone image.
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    /**
     * Get the interactive zone that owns the zone image.
     */
    public function interactiveZone(): BelongsTo
    {
        return $this->belongsTo(InteractiveZone::class, 'zone_id');
    }

    /**
     * Get all images attached to this zone image.
     */
    public function images(): MorphToMany
    {
        return $this->morphToMany(Image::class, 'imageable', 'imageables');
    }

    /**
     * Scope a query to filter by level type and optional building/floor.
     */
    public function scopeForLevel(Builder $query, string $levelType, ?int $buildingId = null, ?int $floorNumber = null): Builder
    {
        $query->where('level_type', $levelType);

        if ($buildingId !== null) {
            $query->where('building_id', $buildingId);
        }

        if ($floorNumber !== null) {
            $query->where('floor_number', $floorNumber);
        }

        return $query;
    }
}
