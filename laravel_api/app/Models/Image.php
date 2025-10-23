<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Translatable\HasTranslations;

class Image extends Model
{
    use HasFactory, HasTranslations;

    public $translatable = [
        'title',
        'alt_text',
        'project',
    ];

    protected $fillable = [
        'filename',
        'path',
        'url',
        'title',
        'project',
        'alt_text',
        'category',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Append these accessors to JSON serialization
     */
    protected $appends = [
        'full_url',
    ];

    /**
     * Get all models that use this image
     */
    public function imageables()
    {
        return $this->hasMany(Imageable::class);
    }

    /**
     * Get projects that use this image
     */
    public function projects(): MorphToMany
    {
        return $this->morphedByMany(Projects::class, 'imageable', 'imageables');
    }

    /**
     * Get news articles that use this image
     */
    public function news(): MorphToMany
    {
        return $this->morphedByMany(News::class, 'imageable', 'imageables');
    }

    /**
     * Scope for active images
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for images by project
     */
    public function scopeByProject($query, $project)
    {
        return $query->where('project', $project);
    }

    /**
     * Scope for images by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for gallery images
     */
    public function scopeGallery($query)
    {
        return $query->whereHas('imageables', function ($q) {
            $q->where('type', 'gallery');
        });
    }

    /**
     * Scope for main images
     */
    public function scopeMain($query)
    {
        return $query->whereHas('imageables', function ($q) {
            $q->where('type', 'main');
        });
    }

    /**
     * Get the full URL for the image
     * Returns external URL if set, otherwise generates URL from path
     */
    public function getFullUrlAttribute()
    {
        // If external URL is set (e.g., placeholder images), use it
        if ($this->url) {
            return $this->url;
        }
        
        // Otherwise, generate URL from storage path
        if ($this->path) {
            return asset('storage/' . $this->path);
        }
        
        // Fallback to a default placeholder
        return asset('images/placeholder.jpg');
    }
}
