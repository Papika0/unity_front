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
     * Get the single contact info record (legacy).
     */
    public function index()
    {
        $contactInfo = $this->settingsService->getContactInfo();
        
        return response()->json([
            'data' => $contactInfo
        ]);
    }

    /**
     * Get complete contact settings for admin panel.
     */
    public function settings(Request $request)
    {
        // For admin panel, we need all translations
        $contactSettings = $this->settingsService->getContactSettingsAllLocales();
        
        return response()->json([
            'data' => $contactSettings,
            'form_structure' => $this->getContactSettingsFormStructure()
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
     * Update the contact information (legacy).
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
     * Update complete contact settings.
     */
    public function updateSettings(Request $request)
    {
        // Validate the request data
        $validated = $request->validate($this->getContactSettingsValidationRules());
        
        // Update the contact settings
        $success = $this->settingsService->updateContactSettings($validated);
        
        if (!$success) {
            return response()->json([
                'message' => 'Failed to update contact settings'
            ], 500);
        }
        
        // Return the updated data
        $locale = $request->get('locale', 'ka');
        $updatedSettings = $this->settingsService->getContactSettings($locale);
        
        return response()->json([
            'message' => 'Contact settings updated successfully',
            'data' => $updatedSettings
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
     * Get validation rules for contact settings
     */
    private function getContactSettingsValidationRules(): array
    {
        return [
            'contact_info' => 'sometimes|array',
            'contact_info.address.value' => 'sometimes|array',
            'contact_info.address.subtitle' => 'sometimes|array',
            'contact_info.phone.value' => 'sometimes|string|max:50',
            'contact_info.phone.subtitle' => 'sometimes|array',
            'contact_info.phone2.value' => 'sometimes|nullable|string|max:50',
            'contact_info.phone2.subtitle' => 'sometimes|array',
            'contact_info.email.value' => 'sometimes|email',
            'contact_info.email.subtitle' => 'sometimes|array',
            'contact_info.hours.value' => 'sometimes|array',
            'contact_info.hours.subtitle' => 'sometimes|array',
            'social_links' => 'sometimes|array',
            'social_links.facebook' => 'sometimes|nullable|url',
            'social_links.instagram' => 'sometimes|nullable|url',
            'social_links.linkedin' => 'sometimes|nullable|url',
            'map_settings' => 'sometimes|array',
            'map_settings.latitude' => 'sometimes|numeric|between:-90,90',
            'map_settings.longitude' => 'sometimes|numeric|between:-180,180',
            'map_settings.zoom' => 'sometimes|integer|between:1,20',
            'form_subjects' => 'sometimes|array',
            'faqs' => 'sometimes|array',
            'office_days' => 'sometimes|array',
            'office_days.working' => 'sometimes|array',
            'office_days.weekend' => 'sometimes|array',
        ];
    }

    /**
     * Get form structure for contact settings admin panel
     */
    private function getContactSettingsFormStructure(): array
    {
        return [
            'contact_info' => [
                'type' => 'group',
                'label' => 'Contact Information',
                'fields' => [
                    'address' => [
                        'type' => 'translatable_text',
                        'label' => 'Address',
                        'required' => true,
                        'fields' => [
                            'value' => ['label' => 'Address', 'type' => 'text'],
                            'subtitle' => ['label' => 'City/Subtitle', 'type' => 'text']
                        ]
                    ],
                    'phone' => [
                        'type' => 'group',
                        'label' => 'Phone',
                        'fields' => [
                            'value' => ['label' => 'Phone Number', 'type' => 'tel', 'required' => true],
                            'subtitle' => ['label' => 'Phone Subtitle', 'type' => 'translatable_text']
                        ]
                    ],
                    'phone2' => [
                        'type' => 'group',
                        'label' => 'Phone 2 (Optional)',
                        'fields' => [
                            'value' => ['label' => 'Second Phone Number', 'type' => 'tel', 'required' => false],
                            'subtitle' => ['label' => 'Phone2 Subtitle', 'type' => 'translatable_text']
                        ]
                    ],
                    'email' => [
                        'type' => 'group',
                        'label' => 'Email',
                        'fields' => [
                            'value' => ['label' => 'Email Address', 'type' => 'email', 'required' => true],
                            'subtitle' => ['label' => 'Email Subtitle', 'type' => 'translatable_text']
                        ]
                    ],
                    'hours' => [
                        'type' => 'translatable_text',
                        'label' => 'Working Hours',
                        'fields' => [
                            'value' => ['label' => 'Hours', 'type' => 'text'],
                            'subtitle' => ['label' => 'Timezone', 'type' => 'text']
                        ]
                    ]
                ]
            ],
            'social_links' => [
                'type' => 'group',
                'label' => 'Social Media Links',
                'fields' => [
                    'facebook' => ['type' => 'url', 'label' => 'Facebook URL'],
                    'instagram' => ['type' => 'url', 'label' => 'Instagram URL'],
                    'linkedin' => ['type' => 'url', 'label' => 'LinkedIn URL']
                ]
            ],
            'map_settings' => [
                'type' => 'group',
                'label' => 'Map Settings',
                'fields' => [
                    'latitude' => ['type' => 'number', 'label' => 'Latitude', 'step' => 'any'],
                    'longitude' => ['type' => 'number', 'label' => 'Longitude', 'step' => 'any'],
                    'zoom' => ['type' => 'number', 'label' => 'Zoom Level', 'min' => 1, 'max' => 20]
                ]
            ],
            'form_subjects' => [
                'type' => 'translatable_array',
                'label' => 'Contact Form Subjects',
                'description' => 'Add/edit contact form subject options'
            ],
            'faqs' => [
                'type' => 'translatable_array',
                'label' => 'Frequently Asked Questions',
                'description' => 'Add/edit FAQ items'
            ],
            'office_days' => [
                'type' => 'group',
                'label' => 'Office Days',
                'fields' => [
                    'working' => ['type' => 'translatable_array', 'label' => 'Working Days'],
                    'weekend' => ['type' => 'translatable_array', 'label' => 'Weekend Days']
                ]
            ]
        ];
    }

    /**
     * Get form structure for legacy contact info
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
