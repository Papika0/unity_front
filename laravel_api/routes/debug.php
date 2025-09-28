<?php

use Illuminate\Support\Facades\Route;
use App\Models\SiteSetting;

// Temporary debug route to check FAQs data
Route::get('/debug/faqs', function () {
    $faqSetting = SiteSetting::where('key', 'faqs')->where('group', 'contact')->first();
    
    if (!$faqSetting) {
        return response()->json(['error' => 'FAQ setting not found']);
    }
    
    return response()->json([
        'raw_original' => $faqSetting->getRawOriginal('value'),
        'processed_value' => $faqSetting->value,
        'is_translatable' => $faqSetting->is_translatable,
        'json_decoded' => json_decode($faqSetting->getRawOriginal('value'), true),
    ]);
});