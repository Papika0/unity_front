<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Resources\Api\NewsResource;
use App\Services\TranslationService;

class NewsController extends Controller
{
    use ApiResponse;

    protected $translationService;

    public function __construct(TranslationService $translationService)
    {
        $this->translationService = $translationService;
    }

    /**
     * Display a listing of published news for public API.
     */
    public function index(Request $request)
    {
        try {
            $locale = $request->input('locale', 'ka');
            $requestGroups = $request->input('groups', []);
            $perPage = $request->input('per_page', 10);
            $category = $request->input('category');
            $search = $request->input('search');

            // Get translations if groups are requested
            $translations = [];
            if ($requestGroups) {
                $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
            }

            $query = News::where('is_active', true)
                        ->where('publish_date', '<=', now())
                        ->orderBy('publish_date', 'desc')
                        ->orderBy('created_at', 'desc');

            if ($category) {
                $query->where('category', $category);
            }

            if ($search) {
                $query->where(function($q) use ($search, $locale) {
                    $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(title, '$.\"{$locale}\"')) LIKE ?", ["%{$search}%"])
                      ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(excerpt, '$.\"{$locale}\"')) LIKE ?", ["%{$search}%"])
                      ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(content, '$.\"{$locale}\"')) LIKE ?", ["%{$search}%"]);
                });
            }

            $news = $query->paginate($perPage);
            
            // Transform news items with locale
            $newsCollection = $news->getCollection()->map(function ($item) use ($locale) {
                return new NewsResource($item, $locale);
            });
            $news->setCollection($newsCollection);

            $response = $news->toArray();
            $response['translations'] = $translations;
            $response['meta']['locale'] = $locale;
            $response['meta']['cached_at'] = now()->toISOString();

            return $this->success($response);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch news', 500);
        }
    }

    /**
     * Display the specified news article for public API.
     */
    public function show(Request $request, $id)
    {
        try {
            $locale = $request->input('locale', 'ka');
            $requestGroups = $request->input('groups', []);

            // Get translations if groups are requested
            $translations = [];
            if ($requestGroups) {
                $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
            }

            $news = News::where('is_active', true)
                       ->where('publish_date', '<=', now())
                       ->findOrFail($id);

            // Increment view count
            $news->increment('views');

            return $this->success([
                'data' => new NewsResource($news, $locale),
                'translations' => $translations,
                'meta' => [
                    'locale' => $locale,
                    'cached_at' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return $this->error('News article not found', 404);
        }
    }

    /**
     * Get featured news for public API.
     */
    public function featured(Request $request)
    {
        try {
            $locale = $request->input('locale', 'ka');
            $requestGroups = $request->input('groups', []);

            // Get translations if groups are requested
            $translations = [];
            if ($requestGroups) {
                $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
            }

            $news = News::where('is_active', true)
                       ->where('is_featured', true)
                       ->where('publish_date', '<=', now())
                       ->orderBy('publish_date', 'desc')
                       ->limit(5)
                       ->get();

            $newsCollection = $news->map(function ($item) use ($locale) {
                return new NewsResource($item, $locale);
            });

            return $this->success([
                'data' => $newsCollection,
                'translations' => $translations,
                'meta' => [
                    'locale' => $locale,
                    'cached_at' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch featured news', 500);
        }
    }

    /**
     * Get latest news for public API.
     */
    public function latest(Request $request)
    {
        try {
            $locale = $request->input('locale', 'ka');
            $requestGroups = $request->input('groups', []);
            $limit = $request->input('limit', 10);

            // Get translations if groups are requested
            $translations = [];
            if ($requestGroups) {
                $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
            }
            
            $news = News::where('is_active', true)
                       ->where('publish_date', '<=', now())
                       ->orderBy('publish_date', 'desc')
                       ->limit($limit)
                       ->get();

            $newsCollection = $news->map(function ($item) use ($locale) {
                return new NewsResource($item, $locale);
            });

            return $this->success([
                'data' => $newsCollection,
                'translations' => $translations,
                'meta' => [
                    'locale' => $locale,
                    'cached_at' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch latest news', 500);
        }
    }
}
