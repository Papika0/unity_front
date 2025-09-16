<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Imageable extends Model
{
    protected $fillable = [
        'image_id',
        'imageable_id',
        'imageable_type',
        'type',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * Get the image that owns this relationship
     */
    public function image(): BelongsTo
    {
        return $this->belongsTo(Image::class);
    }

    /**
     * Get the parent imageable model
     */
    public function imageable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope for specific image type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for main images
     */
    public function scopeMain($query)
    {
        return $query->where('type', 'main');
    }

    /**
     * Scope for gallery images
     */
    public function scopeGallery($query)
    {
        return $query->where('type', 'gallery');
    }

    /**
     * Scope for render images
     */
    public function scopeRender($query)
    {
        return $query->where('type', 'render');
    }
}
