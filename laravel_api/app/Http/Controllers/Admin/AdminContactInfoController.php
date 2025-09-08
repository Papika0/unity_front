<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SiteSettingsService;
use Illuminate\Http\Request;

class AdminContactInfoController extends Controller
{
    protected $settingsService;

    public function __construct(SiteSettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    /**
     * Get the single contact info record.
     */
    public function index()
    {
        $contactInfo = $this->settingsService->getContactInfo();
        
        return response()->json([
            'data' => $contactInfo
        ]);
    }

    /**
     * Get form structure for creating/editing contact info.
     */
    public function create()
    {
        return response()->json([
            'form_structure' => $this->getFormStructure()
        ]);
    }

    /**
     * Update the contact information.
     */
    public function update(Request $request)
    {
        // Validate the request data
        $validated = $request->validate($this->getValidationRules());
        
        // Additional validation using service
        $validationErrors = $this->settingsService->validateContactInfo($validated);
        if (!empty($validationErrors)) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validationErrors
            ], 422);
        }
        
        // Update the contact info
        $success = $this->settingsService->updateContactInfo($validated);
        
        if (!$success) {
            return response()->json([
                'message' => 'Failed to update contact information'
            ], 500);
        }
        
        // Return the updated data
        $updatedContactInfo = $this->settingsService->getContactInfo();
        
        return response()->json([
            'message' => 'Contact information updated successfully',
            'data' => $updatedContactInfo
        ]);
    }

    /**
     * Get validation rules for contact info
     */
    private function getValidationRules(): array
    {
        return [
            'email' => 'required|email',
            'phone_numbers' => 'required|array',
            'phone_numbers.*.number' => 'required|string|max:20',
            'phone_numbers.*.display' => 'required|string|max:30',
            'google_maps_url' => 'nullable|url|max:1000'
        ];
    }

    /**
     * Get form structure for frontend
     */
    private function getFormStructure(): array
    {
        return [
            'email' => [
                'type' => 'email',
                'label' => 'Email',
                'required' => true
            ],
            'phone_numbers' => [
                'type' => 'phone_array',
                'label' => 'Phone Numbers',
                'required' => true,
                'fields' => [
                    'number' => ['type' => 'text', 'label' => 'Number'],
                    'display' => ['type' => 'text', 'label' => 'Display Format'],
                    'href' => ['type' => 'text', 'label' => 'Tel Link']
                ]
            ],
            'google_maps_url' => [
                'type' => 'url',
                'label' => 'Google Maps URL',
                'required' => false
            ]
        ];
    }
}
