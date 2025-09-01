<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class PageCacheService
{
    /**
     * Store data in cache
     *
     * @param string $key Cache key
     * @param mixed $data Data to cache
     * @param int|null $ttl Time to live in seconds (null for forever)
     * @return bool
     */
    public function put(string $key, $data, ?int $ttl = null): bool
    {
        if ($ttl === null) {
            return Cache::forever($key, $data);
        }
        
        return Cache::put($key, $data, $ttl);
    }

    /**
     * Get data from cache
     *
     * @param string $key Cache key
     * @param mixed $default Default value if key not found
     * @return mixed
     */
    public function get(string $key, $default = null)
    {
        return Cache::get($key, $default);
    }

    /**
     * Check if cache key exists
     *
     * @param string $key Cache key
     * @return bool
     */
    public function has(string $key): bool
    {
        return Cache::has($key);
    }

    /**
     * Remember data in cache (get or create)
     *
     * @param string $key Cache key
     * @param callable $callback Callback to generate data if not cached
     * @param int|null $ttl Time to live in seconds (null for forever)
     * @return mixed
     */
    public function remember(string $key, callable $callback, ?int $ttl = null)
    {
        if ($ttl === null) {
            return Cache::rememberForever($key, $callback);
        }
        
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Delete specific cache key
     *
     * @param string $key Cache key
     * @return bool
     */
    public function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    /**
     * Delete multiple cache keys
     *
     * @param array $keys Array of cache keys
     * @return bool
     */
    public function forgetMany(array $keys): bool
    {
        foreach ($keys as $key) {
            Cache::forget($key);
        }
        
        return true;
    }

    /**
     * Clear all cache
     *
     * @return bool
     */
    public function flush(): bool
    {
        return Cache::flush();
    }

    /**
     * Get cache with a prefix pattern and delete them
     *
     * @param string $prefix Cache key prefix
     * @return bool
     */
    public function forgetByPrefix(string $prefix): bool
    {
        // This works with Redis and Memcached drivers
        // For file driver, you might need a different approach
        $keys = $this->getKeysByPrefix($prefix);
        
        foreach ($keys as $key) {
            Cache::forget($key);
        }
        
        return true;
    }

    /**
     * Get all cache keys with specific prefix
     * Note: This method availability depends on cache driver
     *
     * @param string $prefix Cache key prefix
     * @return array
     */
    private function getKeysByPrefix(string $prefix): array
    {
        try {
            $store = Cache::getStore();
            $storeClass = get_class($store);
            
            // For Redis driver
            if (str_contains($storeClass, 'Redis') && method_exists($store, 'connection')) {
                /** @var \Illuminate\Cache\RedisStore $store */
                $redis = $store->connection();
                if (method_exists($redis, 'keys')) {
                    return $redis->keys($prefix . '*');
                }
            }
        } catch (\Exception $e) {
            // Silently fail and return empty array
        }
        
        // For other drivers, return empty array
        return [];
    }

    /**
     * Get cache statistics (if supported by driver)
     *
     * @return array
     */
    public function getStats(): array
    {
        try {
            $store = Cache::getStore();
            $storeClass = get_class($store);
            
            // For Memcached driver
            if (str_contains($storeClass, 'Memcached') && method_exists($store, 'getMemcached')) {
                /** @var \Illuminate\Cache\MemcachedStore $store */
                $memcached = $store->getMemcached();
                if (method_exists($memcached, 'getStats')) {
                    return $memcached->getStats();
                }
            }
            
            // For Redis driver
            if (str_contains($storeClass, 'Redis') && method_exists($store, 'connection')) {
                /** @var \Illuminate\Cache\RedisStore $store */
                $redis = $store->connection();
                if (method_exists($redis, 'info')) {
                    return $redis->info();
                }
            }
        } catch (\Exception $e) {
            return ['error' => 'Failed to retrieve cache statistics: ' . $e->getMessage()];
        }
        
        return ['message' => 'Cache statistics not available for this driver'];
    }
}
