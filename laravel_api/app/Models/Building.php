<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class Building extends Model
{
    use HasFactory, HasTranslations;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'identifier',
        'project_id',
        'is_active',
        'sort_order',
    ];

    /**
     * The attributes that should be translated.
     *
     * @var array<int, string>
     */
    public $translatable = ['name'];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the project that owns the building.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class);
    }

    /**
     * Get the apartments for the building.
     */
    public function apartments(): HasMany
    {
        return $this->hasMany(Apartment::class);
    }

    /**
     * Get the interactive zones for the building.
     */
    public function interactiveZones(): HasMany
    {
        return $this->hasMany(InteractiveZone::class, 'entity_id')
            ->where('entity_type', 'building');
    }

    /**
     * Get the route slug for the building.
     */
    public function getRouteSlug(): string
    {
        return $this->identifier;
    }
}
