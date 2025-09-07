<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\InvalidatesHomepageCache;

class News extends Model
{
    use HasFactory, InvalidatesHomepageCache;

    protected $fillable = [
        'is_active',
        'is_featured',
        'title',
        'excerpt',
        'content',
        'category',
        'main_image',
        'gallery_images',
        'tags',
        'publish_date',
        'views',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'title' => 'array',
        'excerpt' => 'array',
        'content' => 'array',
        'gallery_images' => 'array',
        'tags' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'publish_date' => 'datetime',
        'views' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get translation for a given field and language
     */
    public function getTranslation($field, $language = 'ka')
    {
        $translations = $this->getAttribute($field);
        
        if (!is_array($translations)) {
            return $translations;
        }
        
        return $translations[$language] ?? $translations['ka'] ?? '';
    }

    /**
     * Scope to get active news
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get featured news
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope to get by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to get published news
     */
    public function scopePublished($query)
    {
        return $query->where('publish_date', '<=', now());
    }

    /**
     * Scope to get draft news (unpublished)
     */
    public function scopeDraft($query)
    {
        return $query->where('publish_date', '>', now());
    }

    /**
     * Scope to get inactive news
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope to order by publish date
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('publish_date', 'desc');
    }
}
