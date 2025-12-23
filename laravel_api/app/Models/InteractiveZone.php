<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class InteractiveZone extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'zone_type',
        'level_type',
        'parent_zone_id',
        'entity_id',
        'entity_type',
        'building_id',
        'floor_number',
        'svg_coordinates',
        'bounding_box',
        'display_config',
        'is_active',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'svg_coordinates' => 'array',
        'bounding_box' => 'array',
        'display_config' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'polygon_coordinates',
        'linked_entity_id',
        'label',
        'fill_color',
        'stroke_color',
    ];

    /**
     * Get polygon_coordinates (alias for svg_coordinates for frontend compatibility).
     */
    public function getPolygonCoordinatesAttribute(): ?array
    {
        return $this->svg_coordinates;
    }

    /**
     * Get linked_entity_id (alias for entity_id for frontend compatibility).
     */
    public function getLinkedEntityIdAttribute(): ?int
    {
        return $this->entity_id;
    }

    /**
     * Get label from display_config.
     */
    public function getLabelAttribute(): ?string
    {
        return $this->display_config['label'] ?? null;
    }

    /**
     * Get fill_color from display_config.
     */
    public function getFillColorAttribute(): ?string
    {
        return $this->display_config['fill'] ?? null;
    }

    /**
     * Get stroke_color from display_config.
     */
    public function getStrokeColorAttribute(): ?string
    {
        return $this->display_config['stroke'] ?? null;
    }

    /**
     * Get the project that owns the zone.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class);
    }

    /**
     * Get the building that the zone belongs to.
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    /**
     * Get the parent zone.
     */
    public function parentZone(): BelongsTo
    {
        return $this->belongsTo(InteractiveZone::class, 'parent_zone_id');
    }

    /**
     * Get the child zones.
     */
    public function childZones(): HasMany
    {
        return $this->hasMany(InteractiveZone::class, 'parent_zone_id');
    }

    /**
     * Get the owning entity (Building or Apartment).
     * Note: For entity types like 'floor' that don't have a model, this will return null
     */
    public function entity(): MorphTo
    {
        return $this->morphTo('entity', 'entity_type', 'entity_id');
    }

    /**
     * Get the zone's images.
     */
    public function images(): \Illuminate\Database\Eloquent\Relations\MorphToMany
    {
        return $this->morphToMany(Image::class, 'imageable');
    }

    /**
     * Calculate and return the bounding box from svg_coordinates.
     */
    public function calculateBoundingBox(): array
    {
        if (empty($this->svg_coordinates)) {
            return ['min_x' => 0, 'min_y' => 0, 'max_x' => 0, 'max_y' => 0];
        }

        $xCoords = array_column($this->svg_coordinates, 0);
        $yCoords = array_column($this->svg_coordinates, 1);

        return [
            'min_x' => min($xCoords),
            'min_y' => min($yCoords),
            'max_x' => max($xCoords),
            'max_y' => max($yCoords),
        ];
    }

    /**
     * Generate SVG path string from coordinates.
     */
    public function generateSvgPath(): string
    {
        if (empty($this->svg_coordinates)) {
            return '';
        }

        $pathParts = [];
        foreach ($this->svg_coordinates as $index => $coord) {
            $command = $index === 0 ? 'M' : 'L';
            $pathParts[] = "{$command}{$coord[0]},{$coord[1]}";
        }
        $pathParts[] = 'Z'; // Close the path

        return implode(' ', $pathParts);
    }
}
