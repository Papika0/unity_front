<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PageCacheService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    protected PageCacheService $cacheService;

    public function __construct(PageCacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Clear all cache types
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function clearCache(Request $request): JsonResponse
    {
        try {
            $clearedCaches = [];
            $errors = [];

            // Clear application cache
            try {
                Artisan::call('cache:clear');
                $clearedCaches[] = 'Application cache';
            } catch (\Exception $e) {
                $errors[] = 'Application cache: ' . $e->getMessage();
                Log::error('Failed to clear application cache', ['error' => $e->getMessage()]);
            }

            // Clear route cache
            try {
                Artisan::call('route:clear');
                $clearedCaches[] = 'Route cache';
            } catch (\Exception $e) {
                $errors[] = 'Route cache: ' . $e->getMessage();
                Log::error('Failed to clear route cache', ['error' => $e->getMessage()]);
            }

            // Clear view cache
            try {
                Artisan::call('view:clear');
                $clearedCaches[] = 'View cache';
            } catch (\Exception $e) {
                $errors[] = 'View cache: ' . $e->getMessage();
                Log::error('Failed to clear view cache', ['error' => $e->getMessage()]);
            }

            // Clear config cache
            try {
                Artisan::call('config:clear');
                $clearedCaches[] = 'Configuration cache';
            } catch (\Exception $e) {
                $errors[] = 'Configuration cache: ' . $e->getMessage();
                Log::error('Failed to clear config cache', ['error' => $e->getMessage()]);
            }

            // Clear compiled views
            try {
                Artisan::call('view:clear');
                if (!in_array('View cache', $clearedCaches)) {
                    $clearedCaches[] = 'Compiled views';
                }
            } catch (\Exception $e) {
                if (!in_array('View cache: ' . $e->getMessage(), $errors)) {
                    $errors[] = 'Compiled views: ' . $e->getMessage();
                }
                Log::error('Failed to clear compiled views', ['error' => $e->getMessage()]);
            }

            // Clear page cache using our custom service
            try {
                $this->cacheService->flush();
                $clearedCaches[] = 'Page cache (custom)';
            } catch (\Exception $e) {
                $errors[] = 'Page cache: ' . $e->getMessage();
                Log::error('Failed to clear page cache', ['error' => $e->getMessage()]);
            }

            // Determine response based on results
            if (empty($errors)) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'message' => 'All caches cleared successfully!',
                        'cleared' => $clearedCaches
                    ]
                ]);
            } else {
                $message = count($clearedCaches) > 0 
                    ? 'Some caches cleared successfully, but some failed.'
                    : 'Failed to clear caches.';

                return response()->json([
                    'success' => count($clearedCaches) > 0,
                    'data' => [
                        'message' => $message,
                        'cleared' => $clearedCaches,
                        'errors' => $errors
                    ]
                ], count($clearedCaches) > 0 ? 200 : 500);
            }

        } catch (\Exception $e) {
            Log::error('Critical error while clearing cache', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Critical error occurred while clearing cache: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear specific cache types
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function clearSpecificCache(Request $request): JsonResponse
    {
        $request->validate([
            'types' => 'required|array',
            'types.*' => 'string|in:application,route,view,config,page'
        ]);

        try {
            $types = $request->input('types');
            $clearedCaches = [];
            $errors = [];

            foreach ($types as $type) {
                try {
                    switch ($type) {
                        case 'application':
                            Artisan::call('cache:clear');
                            $clearedCaches[] = 'Application cache';
                            break;
                        case 'route':
                            Artisan::call('route:clear');
                            $clearedCaches[] = 'Route cache';
                            break;
                        case 'view':
                            Artisan::call('view:clear');
                            $clearedCaches[] = 'View cache';
                            break;
                        case 'config':
                            Artisan::call('config:clear');
                            $clearedCaches[] = 'Configuration cache';
                            break;
                        case 'page':
                            $this->cacheService->flush();
                            $clearedCaches[] = 'Page cache';
                            break;
                    }
                } catch (\Exception $e) {
                    $errors[] = ucfirst($type) . ' cache: ' . $e->getMessage();
                    Log::error("Failed to clear {$type} cache", ['error' => $e->getMessage()]);
                }
            }

            return response()->json([
                'success' => count($clearedCaches) > 0,
                'data' => [
                    'message' => count($errors) > 0 ? 'Some caches cleared with errors.' : 'Selected caches cleared successfully!',
                    'cleared' => $clearedCaches,
                    'errors' => $errors
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error while clearing specific caches', [
                'error' => $e->getMessage(),
                'types' => $request->input('types')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error occurred while clearing selected caches: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cache statistics
     *
     * @return JsonResponse
     */
    public function getCacheStats(): JsonResponse
    {
        try {
            $stats = $this->cacheService->getStats();
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting cache statistics', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cache statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test authentication endpoint
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function testAuth(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'authenticated' => $user !== null,
                'user_id' => $user ? $user->id : null,
                'user_email' => $user ? $user->email : null,
                'message' => $user ? 'User is authenticated' : 'User is not authenticated'
            ]
        ]);
    }
}
