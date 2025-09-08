<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SiteSettingsService;

class ContactInfoController extends Controller
{
    protected $settingsService;

    public function __construct(SiteSettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    /**
     * Get the contact information for public display.
     */
    public function index()
    {
        $contactInfo = $this->settingsService->getContactInfo();
        
        // Return contact info if it exists
        if (!$contactInfo) {
            return response()->json([
                'data' => null
            ]);
        }
        
        return response()->json([
            'data' => $contactInfo
        ]);
    }
}
