<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Translation extends Model
{
    use HasFactory;
    use HasTranslations;

    protected $fillable = ['key', 'text', 'group', 'active'];

    public $translatable = ['text'];

    protected $casts = [
        'text' => 'array', // Cast the JSON 'value' field to an array
    ];
}
