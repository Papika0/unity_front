<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait Cacheable
{
    /**
     * Store data in cache and track the cache key.
     *
     * @param string $key The cache key.
     * @param int $ttl Cache time-to-live in seconds.
     * @param mixed $value The data to store in cache.
     * @param string|null $trackingKey Optional tracking key prefix.
     * @return mixed The cached data.
     */

    public function cacheWithTracking(string $key, int $ttl, callable $callback, string $trackingKey = 'cache_keys_list')
    {
        // Store the actual cache data
        $value = Cache::remember($key, $ttl, $callback);

        // Track cache keys
        $cacheKeys = Cache::get($trackingKey, []);
        if (!in_array($key, $cacheKeys)) {
            $cacheKeys[] = $key;
            Cache::put($trackingKey, $cacheKeys);
        }

        return $value;
    }

    /**
     * Delete cache keys that end with a specific suffix.
     *
     * @param string $suffix The string that cache keys should end with.
     * @param string|null $trackingKey Optional tracking key prefix.
     * @return array The deleted cache keys.
     */
    public function deleteCacheKeysBySuffix(string $suffix, string $trackingKey = 'cache_keys_list')
    {
        // Get all stored cache keys
        $cacheKeys = Cache::get($trackingKey, []);

        // Filter keys that end with the suffix
        $keysToDelete = array_filter($cacheKeys, function ($key) use ($suffix) {
            return substr($key, -strlen($suffix)) === $suffix;
        });

        // Delete each matching cache key
        foreach ($keysToDelete as $key) {
            Cache::forget($key);
        }

        // Update the stored cache keys
        $remainingKeys = array_diff($cacheKeys, $keysToDelete);
        Cache::put($trackingKey, $remainingKeys);

        return $keysToDelete;
    }

    /**
     * Delete cache keys that start with a specific prefix.
     *
     * @param string $prefix The string that cache keys should start with.
     * @param string|null $trackingKey Optional tracking key prefix.
     * @return array The deleted cache keys.
     */
    public function deleteCacheKeysByPrefix(string $prefix, string $trackingKey = 'cache_keys_list')
    {
        // Get all stored cache keys
        $cacheKeys = Cache::get($trackingKey, []);

        // Filter keys that start with the prefix
        $keysToDelete = array_filter($cacheKeys, function ($key) use ($prefix) {
            return strpos($key, $prefix) === 0;
        });

        // Delete each matching cache key
        foreach ($keysToDelete as $key) {
            Cache::forget($key);
        }

        // Update the stored cache keys
        $remainingKeys = array_diff($cacheKeys, $keysToDelete);
        Cache::put($trackingKey, $remainingKeys);

        return $keysToDelete;
    }
}
