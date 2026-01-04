<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Resources\Api\NewsResource;
use App\Services\TranslationService;
use App\Services\PageCacheService;
use Illuminate\Support\Facades\App;

class NewsController extends Controller
{
    use ApiResponse;

    protected $translationService;
    protected $pageCacheService;

    public function __construct(TranslationService $translationService, PageCacheService $pageCacheService)
    {
        $this->translationService = $translationService;
        $this->pageCacheService = $pageCacheService;
    }

    /**
     * Display a listing of published news for public API.
     */
    public function index(Request $request)
    {
        try {
            $locale = App::getLocale();
            $requestGroups = $request->input('groups', []);
            $perPage = $request->input('per_page', 10);
            $category = $request->input('category');
            $search = $request->input('search');
            $page = $request->input('page', 1);

            // Create cache key based on all parameters including groups
            $groupsKey = !empty($requestGroups) ? md5(json_encode($requestGroups)) : 'nogroups';
            $cacheKey = "news_index_{$locale}_" .
                ($category ?: 'all') . '_' .
                ($search ? md5($search) : 'nosearch') . '_' .
                "page{$page}_per{$perPage}_" .
                $groupsKey;

            // Check cache first
            if ($this->pageCacheService->has($cacheKey)) {
                $cachedData = $this->pageCacheService->get($cacheKey);
                return $this->success($cachedData);
            }

            // Get translations if groups are requested
            $translations = [];
            if (is_array($requestGroups) && count($requestGroups) > 0) {
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
                $query->where(function ($q) use ($search, $locale) {
                    $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(title, '$.\"{$locale}\"')) LIKE ?", ["%{$search}%"])
                        ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(excerpt, '$.\"{$locale}\"')) LIKE ?", ["%{$search}%"])
                        ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(content, '$.\"{$locale}\"')) LIKE ?", ["%{$search}%"]);
                });
            }

            $news = $query->paginate($perPage);

            // Load images for the paginated collection
            $news->load(['mainImage', 'galleryImages']);

            // Transform news items with locale
            $newsCollection = $news->getCollection()->map(function ($item) use ($locale) {
                return new NewsResource($item, $locale);
            });
            $news->setCollection($newsCollection);

            $response = $news->toArray();
            $response['translations'] = $translations;
            $response['meta']['locale'] = $locale;
            $response['meta']['cached_at'] = now()->toISOString();

            // Cache the data array (not the JsonResponse)
            $this->pageCacheService->put($cacheKey, $response, null);

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
            $locale = App::getLocale();
            $requestGroups = $request->input('groups', []);

            // Create cache key including groups
            $groupsKey = !empty($requestGroups) ? md5(json_encode($requestGroups)) : 'nogroups';
            $cacheKey = "news_show_{$id}_{$locale}_{$groupsKey}";

            // Check cache first (but note: view count will not increment for cached responses)
            // We'll skip cache check to ensure view count increments
            // Instead, we cache after incrementing views

            // Get translations if groups are requested
            $translations = [];
            if (is_array($requestGroups) && count($requestGroups) > 0) {
                $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
            }

            $news = News::where('is_active', true)
                ->where('publish_date', '<=', now())
                ->with(['mainImage', 'galleryImages'])
                ->findOrFail($id);

            // Increment view count
            $news->increment('views');

            // Get related articles (same category, excluding current)
            $relatedArticles = News::where('is_active', true)
                ->where('publish_date', '<=', now())
                ->where('id', '!=', $id)
                ->where('category', $news->category)
                ->with('mainImage')
                ->orderBy('publish_date', 'desc')
                ->take(3)
                ->get(['id', 'title', 'excerpt', 'category', 'publish_date', 'views']);

            // Transform related articles with locale
            $relatedData = $relatedArticles->map(function ($article) use ($locale) {
                $mainImage = $article->mainImage->first();
                return [
                    'id' => $article->id,
                    'title' => $article->getTranslation('title', $locale),
                    'excerpt' => $article->getTranslation('excerpt', $locale),
                    'main_image' => $mainImage ? [
                        'id' => $mainImage->id,
                        'url' => $mainImage->full_url,
                        'alt_text' => $mainImage->getTranslation('alt_text', $locale),
                        'title' => $mainImage->getTranslation('title', $locale),
                    ] : null,
                    'category' => $article->category,
                    'publish_date' => $article->publish_date,
                    'views' => $article->views,
                ];
            })->values()->all();

            $resource = new NewsResource($news, $locale);
            $resourceData = $resource->toArray($request);
            $resourceData['related_articles'] = $relatedData;

            return $this->success([
                'data' => $resourceData,
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
            $locale = App::getLocale();
            $requestGroups = $request->input('groups', []);

            // Create cache key including groups
            $groupsKey = !empty($requestGroups) ? md5(json_encode($requestGroups)) : 'nogroups';
            $cacheKey = "news_featured_{$locale}_{$groupsKey}";

            // Check cache first
            if ($this->pageCacheService->has($cacheKey)) {
                $cachedData = $this->pageCacheService->get($cacheKey);
                return $this->success($cachedData);
            }

            // Get translations if groups are requested
            $translations = [];
            if (is_array($requestGroups) && count($requestGroups) > 0) {
                $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
            }

            $news = News::where('is_active', true)
                ->where('is_featured', true)
                ->where('publish_date', '<=', now())
                ->with(['mainImage', 'galleryImages'])
                ->orderBy('publish_date', 'desc')
                ->limit(5)
                ->get();

            $newsCollection = $news->map(function ($item) use ($locale) {
                return new NewsResource($item, $locale);
            });

            $response = [
                'data' => $newsCollection,
                'translations' => $translations,
                'meta' => [
                    'locale' => $locale,
                    'cached_at' => now()->toISOString(),
                ]
            ];

            // Cache the data array (not the JsonResponse)
            $this->pageCacheService->put($cacheKey, $response, null);

            return $this->success($response);
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
            $locale = App::getLocale();
            $requestGroups = $request->input('groups', []);
            $limit = $request->input('limit', 10);

            // Create cache key including groups
            $groupsKey = !empty($requestGroups) ? md5(json_encode($requestGroups)) : 'nogroups';
            $cacheKey = "news_latest_{$locale}_limit{$limit}_{$groupsKey}";

            // Check cache first
            if ($this->pageCacheService->has($cacheKey)) {
                $cachedData = $this->pageCacheService->get($cacheKey);
                return $this->success($cachedData);
            }

            // Get translations if groups are requested
            $translations = [];
            if (is_array($requestGroups) && count($requestGroups) > 0) {
                $translations = $this->translationService->getOptimizedTranslations($requestGroups, $locale);
            }

            $news = News::where('is_active', true)
                ->where('publish_date', '<=', now())
                ->with(['mainImage', 'galleryImages'])
                ->orderBy('publish_date', 'desc')
                ->limit($limit)
                ->get();

            $newsCollection = $news->map(function ($item) use ($locale) {
                return new NewsResource($item, $locale);
            });

            $response = [
                'data' => $newsCollection,
                'translations' => $translations,
                'meta' => [
                    'locale' => $locale,
                    'cached_at' => now()->toISOString(),
                ]
            ];

            // Cache the data array (not the JsonResponse)
            $this->pageCacheService->put($cacheKey, $response, null);

            return $this->success($response);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch latest news', 500);
        }
    }
}
