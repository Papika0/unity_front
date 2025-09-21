<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Traits\InvalidatesHomepageCache;

class Projects extends Model
{
    use HasFactory, HasTranslations, InvalidatesHomepageCache;

    public $translatable = [
        'title',
        'description',
        'location',
    ];

    protected $fillable = [
        'title','description','location', 'status','start_date','completion_date',
        'main_image','gallery_images','render_image',
       'year','is_active','is_featured','is_onHomepage',
        'latitude','longitude','meta_title','meta_description',
    ];

    protected $casts = [
        'gallery_images'  => 'array',
        'start_date'      => 'date',
        'completion_date' => 'date',
        'latitude'        => 'decimal:7',
        'longitude'       => 'decimal:7',
    ];

    /**
     * Get all images for this project
     */
    public function images(): MorphToMany
    {
        return $this->morphToMany(Image::class, 'imageable', 'imageables');
    }

    /**
     * Get main image for this project
     */
    public function mainImage(): MorphToMany
    {
        return $this->morphToMany(Image::class, 'imageable', 'imageables')
            ->wherePivot('type', 'main');
    }

    /**
     * Get render image for this project
     */
    public function renderImage(): MorphToMany
    {
        return $this->morphToMany(Image::class, 'imageable', 'imageables')
            ->wherePivot('type', 'render');
    }

    /**
     * Get gallery images for this project
     */
    public function galleryImages(): MorphToMany
    {
        return $this->morphToMany(Image::class, 'imageable', 'imageables')
            ->wherePivot('type', 'gallery')
            ->orderByPivot('sort_order');
    }

    /**
     * Get the main image URL (for backward compatibility)
     */
    public function getMainImageUrlAttribute()
    {
        $mainImage = $this->mainImage()->first();
        return $mainImage ? $mainImage->full_url : $this->main_image;
    }

    /**
     * Get the render image URL (for backward compatibility)
     */
    public function getRenderImageUrlAttribute()
    {
        $renderImage = $this->renderImage()->first();
        return $renderImage ? $renderImage->full_url : $this->render_image;
    }

    /**
     * Get gallery images URLs (for backward compatibility)
     */
    public function getGalleryImagesUrlsAttribute()
    {
        $galleryImages = $this->galleryImages()->get();
        if ($galleryImages->isNotEmpty()) {
            return $galleryImages->pluck('full_url')->toArray();
        }
        return $this->gallery_images ?? [];
    }

    /**
     * Get features for this project
     */
    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'project_feature', 'project_id', 'feature_id')
            ->withPivot(['is_auto_detected', 'sort_order'])
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    /**
     * Auto-detect features based on description
     */
    public function autoDetectFeatures(): void
    {
        $description = strtolower($this->description);
        $features = Feature::where('is_active', true)->get();

        foreach ($features as $feature) {
            $hasKeyword = collect($feature->keywords)->some(function ($keyword) use ($description) {
                return str_contains($description, strtolower($keyword));
            });

            if ($hasKeyword) {
                $this->features()->syncWithoutDetaching([
                    $feature->id => [
                        'is_auto_detected' => true,
                        'sort_order' => $feature->sort_order,
                    ]
                ]);
            }
        }
    }
}
