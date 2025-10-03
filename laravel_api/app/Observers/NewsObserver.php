<?php

namespace App\Observers;

use App\Models\News;
use App\Services\ImageService;
use Illuminate\Support\Facades\Log;

class NewsObserver
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Handle the News "deleting" event.
     * This runs before the model is deleted from the database.
     */
    public function deleting(News $news)
    {
        Log::info('NewsObserver: Cleaning up images for news article', [
            'news_id' => $news->id,
            'title' => $news->title
        ]);

        // Detach all images (will auto-cleanup orphans via detachImage)
        foreach ($news->images as $image) {
            $this->imageService->detachImage($image, $news);
        }
    }
}
