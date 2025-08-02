<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Resources\Api\NewsResource;

class NewsController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of published news for public API.
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $category = $request->input('category');

            $query = News::where('is_active', true)
                        ->where('publish_date', '<=', now())
                        ->orderBy('publish_date', 'desc')
                        ->orderBy('created_at', 'desc');

            if ($category) {
                $query->where('category', $category);
            }

            $news = $query->paginate($perPage);

            return $this->success(NewsResource::collection($news)->response()->getData(true));
        } catch (\Exception $e) {
            return $this->error('Failed to fetch news', 500);
        }
    }

    /**
     * Display the specified news article for public API.
     */
    public function show($id)
    {
        try {
            $news = News::where('is_active', true)
                       ->where('publish_date', '<=', now())
                       ->findOrFail($id);

            return $this->success(new NewsResource($news));
        } catch (\Exception $e) {
            return $this->error('News article not found', 404);
        }
    }

    /**
     * Get featured news for public API.
     */
    public function featured()
    {
        try {
            $news = News::where('is_active', true)
                       ->where('is_featured', true)
                       ->where('publish_date', '<=', now())
                       ->orderBy('publish_date', 'desc')
                       ->limit(5)
                       ->get();

            return $this->success(NewsResource::collection($news));
        } catch (\Exception $e) {
            return $this->error('Failed to fetch featured news', 500);
        }
    }

    /**
     * Get latest news for public API.
     */
    public function latest()
    {
        try {
            $news = News::where('is_active', true)
                       ->where('publish_date', '<=', now())
                       ->orderBy('publish_date', 'desc')
                       ->limit(10)
                       ->get();

            return $this->success(NewsResource::collection($news));
        } catch (\Exception $e) {
            return $this->error('Failed to fetch latest news', 500);
        }
    }
}
