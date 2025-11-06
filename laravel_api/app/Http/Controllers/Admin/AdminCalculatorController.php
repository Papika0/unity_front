<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Projects;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminCalculatorController extends Controller
{
    use ApiResponse;

    /**
     * Get all active projects for calculator
     */
    public function getActiveProjects()
    {
        try {
            $projects = Projects::where('is_active', true)
                ->where('status', 'ongoing') // Only ongoing projects
                ->orderBy('title->ka')
                ->get(['id', 'title', 'status', 'base_price_per_sqm', 'calculator_settings', 'completion_date'])
                ->map(function ($project) {
                    return [
                        'id' => $project->id,
                        'title' => $project->getTranslation('title', 'en'), // Default title
                        'title_ka' => $project->getTranslation('title', 'ka'),
                        'title_en' => $project->getTranslation('title', 'en'),
                        'title_ru' => $project->getTranslation('title', 'ru'),
                        'status' => $project->status,
                        'base_price_per_sqm' => $project->base_price_per_sqm,
                        'calculator_settings' => $project->calculator_settings,
                        'construction_completion_date' => $project->completion_date ? $project->completion_date->format('Y-m-d') : null,
                    ];
                });

            return $this->success($projects);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch active projects for calculator: ' . $e->getMessage());
            return $this->error('პროექტების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get calculator settings for a specific project
     */
    public function getProjectCalculatorSettings($id)
    {
        try {
            $project = Projects::findOrFail($id);

            // Ensure title is properly decoded from JSON
            $title = $project->title;
            if (is_string($title)) {
                $title = json_decode($title, true);
            }

            return $this->success([
                'id' => $project->id,
                'title' => $title,
                'base_price_per_sqm' => $project->base_price_per_sqm,
                'calculator_settings' => $project->calculator_settings,
                'construction_completion_date' => $project->completion_date ? $project->completion_date->format('Y-m-d') : null,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch project calculator settings: ' . $e->getMessage());
            return $this->error('პროექტის კალკულატორის პარამეტრების ჩატვირთვა ვერ მოხერხდა', 404);
        }
    }

    /**
     * Update calculator settings for a specific project
     */
    public function updateProjectCalculatorSettings(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'base_price_per_sqm' => 'nullable|numeric|min:0',
            'calculator_settings' => 'required|array',
            'calculator_settings.alternatives' => 'required|array',
            'calculator_settings.alternatives.alt1' => 'required|array',
            'calculator_settings.alternatives.alt1.enabled' => 'required|boolean',
            'calculator_settings.alternatives.alt1.deadline' => 'required|date',
            'calculator_settings.alternatives.alt2' => 'required|array',
            'calculator_settings.alternatives.alt2.enabled' => 'required|boolean',
            'calculator_settings.alternatives.alt2.deadline' => 'required|date',
            'calculator_settings.alternatives.alt2.surcharge_percent' => 'required|numeric|min:0|max:100',
            'calculator_settings.alternatives.alt3' => 'required|array',
            'calculator_settings.alternatives.alt3.enabled' => 'required|boolean',
            'calculator_settings.alternatives.alt3.deadline' => 'required|date',
            'calculator_settings.alternatives.alt3.discount_percent' => 'required|numeric|min:0|max:100',
            'calculator_settings.alternatives.alt4' => 'required|array',
            'calculator_settings.alternatives.alt4.enabled' => 'required|boolean',
            'calculator_settings.alternatives.alt4.deadline' => 'required|date',
            'calculator_settings.alternatives.alt4.discount_percent' => 'required|numeric|min:0|max:100',
            'calculator_settings.alternatives.alt5' => 'required|array',
            'calculator_settings.alternatives.alt5.enabled' => 'required|boolean',
            'calculator_settings.alternatives.alt5.deadline' => 'required|date',
            'calculator_settings.alternatives.alt5.price_increase_per_sqm' => 'required|numeric|min:0',
            'calculator_settings.alternatives.alt6' => 'required|array',
            'calculator_settings.alternatives.alt6.enabled' => 'required|boolean',
            'calculator_settings.alternatives.alt6.deadline' => 'required|date',
            'calculator_settings.alternatives.alt6.price_increase_per_sqm' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors(), 422);
        }

        try {
            $project = Projects::findOrFail($id);
            
            // Update calculator settings
            $project->calculator_settings = $request->calculator_settings;
            
            // Update base price if provided
            if ($request->has('base_price_per_sqm')) {
                $project->base_price_per_sqm = $request->base_price_per_sqm;
            }
            
            $project->save();

            // Ensure title is properly decoded from JSON
            $title = $project->title;
            if (is_string($title)) {
                $title = json_decode($title, true);
            }

            return $this->success([
                'id' => $project->id,
                'title' => $title,
                'base_price_per_sqm' => $project->base_price_per_sqm,
                'calculator_settings' => $project->calculator_settings,
                'construction_completion_date' => $project->completion_date ? $project->completion_date->format('Y-m-d') : null,
            ], 'კალკულატორის პარამეტრები განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to update project calculator settings: ' . $e->getMessage());
            return $this->error('კალკულატორის პარამეტრების განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Update base price for a specific project
     */
    public function updateBasePrice(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'base_price_per_sqm' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors(), 422);
        }

        try {
            $project = Projects::findOrFail($id);
            $project->base_price_per_sqm = $request->base_price_per_sqm;
            $project->save();

            // Ensure title is properly decoded from JSON
            $title = $project->title;
            if (is_string($title)) {
                $title = json_decode($title, true);
            }

            return $this->success([
                'id' => $project->id,
                'title' => $title,
                'base_price_per_sqm' => $project->base_price_per_sqm,
            ], 'საბაზო ფასი განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to update project base price: ' . $e->getMessage());
            return $this->error('საბაზო ფასის განახლება ვერ მოხერხდა', 500);
        }
    }
}
