<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Feature extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'title',
        'description',
        'icon',
        'color',
        'keywords',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'title' => 'array',
        'description' => 'array',
        'keywords' => 'array',
        'is_active' => 'boolean',
    ];

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Projects::class, 'project_feature', 'feature_id', 'project_id')
            ->withPivot(['is_auto_detected', 'sort_order'])
            ->withTimestamps();
    }

    public function getTitleForLocale(string $locale = 'ka'): string
    {
        return $this->title[$locale] ?? $this->title['ka'] ?? $this->name;
    }

    public function getDescriptionForLocale(string $locale = 'ka'): string
    {
        return $this->description[$locale] ?? $this->description['ka'] ?? '';
    }

    public function getTitleAttribute($value)
    {
        $decoded = json_decode($value, true);
        return $decoded ?: ['ka' => '', 'en' => '', 'ru' => ''];
    }

    public function getDescriptionAttribute($value)
    {
        $decoded = json_decode($value, true);
        return $decoded ?: ['ka' => '', 'en' => '', 'ru' => ''];
    }
}
