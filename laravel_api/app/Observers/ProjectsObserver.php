<?php

namespace App\Observers;

use App\Models\Projects;
use App\Services\ImageService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ProjectsObserver
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Clear projects cache for all locales
     */
    private function clearProjectsCache(): void
    {
        $locales = ['ka', 'en', 'ru'];

        foreach ($locales as $locale) {
            Cache::forget("projects_index_{$locale}");
            Cache::forget("projects_featured_{$locale}");
            Cache::forget("projects_homepage_{$locale}");
        }

        Log::info('ProjectsObserver: Cleared projects cache for all locales');
    }

    /**
     * Handle the Projects "saved" event (fires after create or update).
     */
    public function saved(Projects $project): void
    {
        $this->clearProjectsCache();
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

        // Clear cache when project is deleted
        $this->clearProjectsCache();
    }
}
