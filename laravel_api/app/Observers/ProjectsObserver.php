<?php

namespace App\Observers;

use App\Models\Projects;
use App\Services\ImageService;
use Illuminate\Support\Facades\Log;

class ProjectsObserver
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Handle the Projects "deleting" event.
     * This runs before the model is deleted from the database.
     */
    public function deleting(Projects $project)
    {
        Log::info('ProjectsObserver: Cleaning up images for project', [
            'project_id' => $project->id,
            'title' => $project->title
        ]);

        // Detach all images (will auto-cleanup orphans via detachImage)
        foreach ($project->images as $image) {
            $this->imageService->detachImage($image, $project);
        }
    }
}
