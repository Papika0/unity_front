<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SiteSettingsService;
use Illuminate\Http\Request;

class AdminAboutController extends Controller
{
    protected $settingsService;

    public function __construct(SiteSettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    /**
     * Get the single about info record.
     */
    public function index()
    {
        $aboutInfo = $this->settingsService->getAboutInfo();

        return response()->json([
            'data' => $aboutInfo
        ]);
    }

    /**
     * Get form structure for creating/editing about info.
     */
    public function create()
    {
        return response()->json([
            'form_structure' => $this->getFormStructure()
        ]);
    }

    /**
     * Update the about information.
     */
    public function update(Request $request)
    {
        // Validate the request data
        $validated = $request->validate($this->getValidationRules());

        // Additional validation using service
        $validationErrors = $this->settingsService->validateAboutInfo($validated);
        if (!empty($validationErrors)) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validationErrors
            ], 422);
        }

        // Update the about info
        $success = $this->settingsService->updateAboutInfo($validated);

        if (!$success) {
            return response()->json([
                'message' => 'Failed to update about information'
            ], 500);
        }

        // Return the updated data
        $updatedAboutInfo = $this->settingsService->getAboutInfo();

        return response()->json([
            'message' => 'About information updated successfully',
            'data' => $updatedAboutInfo
        ]);
    }

    /**
     * Get validation rules for about info
     */
    private function getValidationRules(): array
    {
        return [
            'stats.successful_projects' => 'required|string|max:50',
            'stats.years_experience' => 'required|string|max:50',
            'stats.satisfied_clients' => 'required|string|max:50',
            'stats.client_satisfaction' => 'required|string|max:50',
        ];
    }

    /**
     * Get form structure for about info
     */
    private function getFormStructure(): array
    {
        return [
            'fields' => [
                [
                    'name' => 'stats.successful_projects',
                    'label' => 'Successful Projects',
                    'type' => 'text',
                    'required' => true,
                    'placeholder' => 'e.g., 150+',
                    'help' => 'Number of successful projects completed'
                ],
                [
                    'name' => 'stats.years_experience',
                    'label' => 'Years of Experience',
                    'type' => 'text',
                    'required' => true,
                    'placeholder' => 'e.g., 15+',
                    'help' => 'Years of experience in the field'
                ],
                [
                    'name' => 'stats.satisfied_clients',
                    'label' => 'Satisfied Clients',
                    'type' => 'text',
                    'required' => true,
                    'placeholder' => 'e.g., 50+',
                    'help' => 'Number of satisfied clients'
                ],
                [
                    'name' => 'stats.client_satisfaction',
                    'label' => 'Client Satisfaction Rate',
                    'type' => 'text',
                    'required' => true,
                    'placeholder' => 'e.g., 98%',
                    'help' => 'Client satisfaction percentage'
                ],
            ],
            'sections' => [
                [
                    'title' => 'Statistics',
                    'description' => 'Manage the statistics displayed on the about page',
                    'fields' => [
                        'stats.successful_projects',
                        'stats.years_experience',
                        'stats.satisfied_clients',
                        'stats.client_satisfaction',
                    ]
                ]
            ]
        ];
    }
}
