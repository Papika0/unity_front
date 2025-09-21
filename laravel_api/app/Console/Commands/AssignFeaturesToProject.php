<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Projects;
use App\Models\Feature;

class AssignFeaturesToProject extends Command
{
    protected $signature = 'features:assign {project_id} {--features=}';
    protected $description = 'Assign features to a project';

    public function handle()
    {
        $projectId = $this->argument('project_id');
        $featuresInput = $this->option('features');

        $project = Projects::find($projectId);
        if (!$project) {
            $this->error("Project with ID {$projectId} not found.");
            return 1;
        }

        if ($featuresInput) {
            // Assign specific features
            $featureIds = explode(',', $featuresInput);
            $features = Feature::whereIn('id', $featureIds)->get();
            
            $syncData = [];
            foreach ($features as $index => $feature) {
                $syncData[$feature->id] = [
                    'is_auto_detected' => false,
                    'sort_order' => $index + 1
                ];
            }
            
            $project->features()->sync($syncData);
            $this->info("Assigned " . count($features) . " features to project {$projectId}");
        } else {
            // Auto-detect features
            $project->autoDetectFeatures();
            $this->info("Auto-detected features for project {$projectId}");
        }

        $featureCount = $project->features()->count();
        $this->info("Project now has {$featureCount} features assigned.");

        return 0;
    }
}