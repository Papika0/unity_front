<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\PageCacheService;
use App\Traits\ApiResponse;

class AboutController extends Controller
{
    use ApiResponse;
    
    protected $pageCacheService;

    public function __construct(PageCacheService $pageCacheService)
    {
        $this->pageCacheService = $pageCacheService;
    }

    /**
     * Get about page data with locale support
     */
    public function index(Request $request)
    {
        try {
            $locale = $request->input('locale', 'ka');
            
            $data = $this->pageCacheService->getPageData('about', $locale);
            
            return $this->success($data);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch about page data', 500);
        }
    }

    /**
     * Clear about page cache
     */
    public function clearCache(Request $request)
    {
        $locale = $request->input('locale');
        
        $this->pageCacheService->clearPageCache('about', $locale);
        
        return $this->success([
            'message' => 'About page cache cleared successfully',
            'locale' => $locale ?? 'all locales'
        ]);
    }

    /**
     * Refresh about page cache (clear and regenerate)
     */
    public function refreshCache(Request $request)
    {
        $locale = $request->input('locale', 'ka');
        
        $data = $this->pageCacheService->refreshPageCache('about', $locale);
        
        return $this->success([
            'message' => 'About page cache refreshed successfully',
            'data' => $data
        ]);
    }
}
