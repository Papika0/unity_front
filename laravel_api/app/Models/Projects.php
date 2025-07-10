<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Projects extends Model
{
    use HasFactory, HasTranslations;

    public $translatable = [
        'title',
        'description',
        'location',      
    ];

    protected $fillable = [
        'title','description','location', 'status','start_date','completion_date',
        'main_image','gallery_images','render_image',
       'year','is_active','is_featured',
        'latitude','longitude','meta_title','meta_description',
    ];

    protected $casts = [
        'gallery_images'  => 'array',
        'start_date'      => 'date',
        'completion_date' => 'date',
        'latitude'        => 'decimal:7',
        'longitude'       => 'decimal:7',
    ];
}
