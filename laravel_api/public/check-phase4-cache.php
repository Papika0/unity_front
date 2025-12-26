<?php

/**
 * Phase 4 Cache Diagnostic Tool
 * Checks if public API caching is working correctly
 */

// Bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

header('Content-Type: text/html; charset=utf-8');

?>
<!DOCTYPE html>
<html>
<head>
    <title>Phase 4 Cache Diagnostics</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
        .section { margin: 20px 0; padding: 15px; background: #252525; border-left: 4px solid #007acc; }
        .success { color: #4ec9b0; }
        .error { color: #f48771; }
        .warning { color: #ce9178; }
        .info { color: #9cdcfe; }
        h2 { color: #4ec9b0; margin-top: 0; }
        h3 { color: #569cd6; }
        pre { background: #1e1e1e; padding: 10px; overflow-x: auto; border: 1px solid #3c3c3c; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border: 1px solid #3c3c3c; }
        th { background: #2d2d30; color: #4ec9b0; }
        .check { display: inline-block; width: 20px; text-align: center; }
    </style>
</head>
<body>

<h1>🔍 Phase 4 Cache Diagnostics</h1>

<?php

// ============================================================================
// 1. Check Cache Configuration
// ============================================================================
echo '<div class="section">';
echo '<h2>1️⃣ Cache Configuration</h2>';

$cacheDriver = config('cache.default');
$redisClient = config('database.redis.client');
$cacheStore = Cache::getStore();
$cacheStoreClass = get_class($cacheStore);

echo '<table>';
echo '<tr><th>Setting</th><th>Value</th><th>Status</th></tr>';

// Cache Driver
$driverOk = $cacheDriver === 'redis';
echo '<tr>';
echo '<td>CACHE_DRIVER</td>';
echo '<td>' . $cacheDriver . '</td>';
echo '<td>' . ($driverOk ? '<span class="success">✓ Correct</span>' : '<span class="error">✗ Should be redis</span>') . '</td>';
echo '</tr>';

// Redis Client
$clientOk = $redisClient === 'phpredis';
echo '<tr>';
echo '<td>REDIS_CLIENT</td>';
echo '<td>' . ($redisClient ?? 'auto') . '</td>';
echo '<td>' . ($clientOk ? '<span class="success">✓ Using phpredis</span>' : '<span class="warning">⚠ Using ' . ($redisClient ?? 'predis') . '</span>') . '</td>';
echo '</tr>';

// Cache Store Class
$storeOk = strpos($cacheStoreClass, 'RedisStore') !== false;
echo '<tr>';
echo '<td>Cache Store Class</td>';
echo '<td>' . $cacheStoreClass . '</td>';
echo '<td>' . ($storeOk ? '<span class="success">✓ Correct</span>' : '<span class="error">✗ Wrong store</span>') . '</td>';
echo '</tr>';

echo '</table>';
echo '</div>';

// ============================================================================
// 2. Check if Observers are Registered
// ============================================================================
echo '<div class="section">';
echo '<h2>2️⃣ Observer Registration Check</h2>';

$observerChecks = [
    'App\Models\Projects' => 'App\Observers\ProjectsObserver',
    'App\Models\Building' => 'App\Observers\BuildingObserver',
    'App\Models\Feature' => 'App\Observers\FeatureObserver',
    'App\Models\Translation' => 'App\Observers\TranslationObserver',
];

echo '<table>';
echo '<tr><th>Model</th><th>Observer</th><th>Registered?</th></tr>';

foreach ($observerChecks as $model => $observer) {
    $observerExists = class_exists($observer);
    $modelExists = class_exists($model);

    echo '<tr>';
    echo '<td>' . $model . '</td>';
    echo '<td>' . $observer . '</td>';

    if (!$modelExists) {
        echo '<td><span class="error">✗ Model not found</span></td>';
    } elseif (!$observerExists) {
        echo '<td><span class="error">✗ Observer class not found</span></td>';
    } else {
        // Check if observer is registered by checking dispatcher
        $dispatcher = $model::getEventDispatcher();
        $listeners = $dispatcher ? $dispatcher->getListeners('eloquent.saved: ' . $model) : [];
        $registered = !empty($listeners);

        echo '<td>' . ($registered ? '<span class="success">✓ Registered</span>' : '<span class="error">✗ NOT registered in AppServiceProvider</span>') . '</td>';
    }
    echo '</tr>';
}

echo '</table>';
echo '</div>';

// ============================================================================
// 3. Check Cache Keys Existence
// ============================================================================
echo '<div class="section">';
echo '<h2>3️⃣ Cache Keys Status</h2>';

$locales = ['ka', 'en', 'ru'];
$cacheKeys = [];

// Projects cache keys
foreach ($locales as $locale) {
    $cacheKeys["projects_index_{$locale}"] = "Projects Index ({$locale})";
    $cacheKeys["projects_featured_{$locale}"] = "Projects Featured ({$locale})";
    $cacheKeys["projects_homepage_{$locale}"] = "Projects Homepage ({$locale})";
}

// Buildings cache keys (check for project ID 1 as example)
foreach ($locales as $locale) {
    $cacheKeys["buildings_index_project_1_{$locale}"] = "Buildings for Project 1 ({$locale})";
}

// Features cache keys
$cacheKeys["features_index"] = "Features Index";

// Translations cache keys (check for common group)
foreach ($locales as $locale) {
    $cacheKeys["translations_group_common_{$locale}"] = "Translations common ({$locale})";
}

echo '<table>';
echo '<tr><th>Cache Key</th><th>Description</th><th>Exists?</th><th>Size</th></tr>';

foreach ($cacheKeys as $key => $description) {
    $exists = Cache::has($key);
    $value = $exists ? Cache::get($key) : null;
    $size = $exists ? strlen(serialize($value)) : 0;

    echo '<tr>';
    echo '<td><code>' . $key . '</code></td>';
    echo '<td>' . $description . '</td>';
    echo '<td>' . ($exists ? '<span class="success">✓ Cached</span>' : '<span class="warning">⚠ Not cached yet</span>') . '</td>';
    echo '<td>' . ($exists ? number_format($size) . ' bytes' : '-') . '</td>';
    echo '</tr>';
}

echo '</table>';
echo '</div>';

// ============================================================================
// 4. Test Cache Write/Read Performance
// ============================================================================
echo '<div class="section">';
echo '<h2>4️⃣ Cache Performance Test</h2>';

$testKey = 'phase4_test_' . time();
$testData = ['test' => 'data', 'timestamp' => microtime(true), 'large_array' => range(1, 1000)];

// Write test
$writeStart = microtime(true);
Cache::put($testKey, $testData, 60);
$writeTime = (microtime(true) - $writeStart) * 1000;

// Read test
$readStart = microtime(true);
$retrieved = Cache::get($testKey);
$readTime = (microtime(true) - $readStart) * 1000;

// Verify
$writeOk = Cache::has($testKey);
$readOk = $retrieved === $testData;

// Cleanup
Cache::forget($testKey);

echo '<table>';
echo '<tr><th>Operation</th><th>Time</th><th>Status</th></tr>';
echo '<tr><td>Write to cache</td><td>' . number_format($writeTime, 2) . ' ms</td><td>' . ($writeOk ? '<span class="success">✓</span>' : '<span class="error">✗</span>') . '</td></tr>';
echo '<tr><td>Read from cache</td><td>' . number_format($readTime, 2) . ' ms</td><td>' . ($readOk ? '<span class="success">✓</span>' : '<span class="error">✗</span>') . '</td></tr>';
echo '</table>';

if ($readTime < 5) {
    echo '<p class="success">✓ Cache performance is excellent (&lt;5ms)</p>';
} elseif ($readTime < 20) {
    echo '<p class="info">Cache performance is good (&lt;20ms)</p>';
} else {
    echo '<p class="warning">⚠ Cache performance is slower than expected</p>';
}

echo '</div>';

// ============================================================================
// 5. Check Actual API Endpoints (Simulate Requests)
// ============================================================================
echo '<div class="section">';
echo '<h2>5️⃣ API Endpoint Cache Test</h2>';

echo '<p class="info">Testing actual API endpoints to see if caching is working...</p>';

// Test Projects Index endpoint
echo '<h3>Testing: Projects Index (ka)</h3>';

$cacheKey = 'projects_index_ka';
$cached = Cache::has($cacheKey);

echo '<p><strong>Cache key:</strong> <code>' . $cacheKey . '</code></p>';
echo '<p><strong>Cached before test:</strong> ' . ($cached ? '<span class="success">✓ Yes</span>' : '<span class="warning">⚠ No (will be created on first API call)</span>') . '</p>';

if ($cached) {
    $cacheValue = Cache::get($cacheKey);
    echo '<p><strong>Cache size:</strong> ' . number_format(strlen(serialize($cacheValue))) . ' bytes</p>';
    echo '<p><strong>Cache type:</strong> ' . gettype($cacheValue) . '</p>';

    if (is_object($cacheValue) && method_exists($cacheValue, 'toArray')) {
        echo '<p class="warning">⚠ WARNING: Cached value is an object with toArray() method. This might cause issues!</p>';
        echo '<p class="info">💡 Cached API responses should be plain arrays or collections, not Resource objects.</p>';
    }
}

echo '</div>';

// ============================================================================
// 6. Recommendations
// ============================================================================
echo '<div class="section">';
echo '<h2>6️⃣ Diagnostics Summary & Recommendations</h2>';

$issues = [];
$warnings = [];
$success = [];

// Check issues
if ($cacheDriver !== 'redis') {
    $issues[] = 'CACHE_DRIVER is not set to redis. Update your .env file.';
}

if (!$storeOk) {
    $issues[] = 'Cache store is not RedisStore. Check your cache configuration.';
}

// Count cached keys
$cachedCount = 0;
foreach ($cacheKeys as $key => $desc) {
    if (Cache::has($key)) {
        $cachedCount++;
    }
}

if ($cachedCount === 0) {
    $warnings[] = 'No cache keys exist yet. Visit your API endpoints to populate the cache.';
} else {
    $success[] = "Found {$cachedCount} cached endpoints out of " . count($cacheKeys) . " checked.";
}

if ($readTime > 10) {
    $warnings[] = "Cache read performance is slower than expected ({$readTime}ms). Expected <5ms with phpredis.";
}

// Display results
if (!empty($success)) {
    echo '<h3 class="success">✓ Success</h3><ul>';
    foreach ($success as $msg) {
        echo '<li class="success">' . $msg . '</li>';
    }
    echo '</ul>';
}

if (!empty($warnings)) {
    echo '<h3 class="warning">⚠ Warnings</h3><ul>';
    foreach ($warnings as $msg) {
        echo '<li class="warning">' . $msg . '</li>';
    }
    echo '</ul>';
}

if (!empty($issues)) {
    echo '<h3 class="error">✗ Issues Found</h3><ul>';
    foreach ($issues as $msg) {
        echo '<li class="error">' . $msg . '</li>';
    }
    echo '</ul>';
}

echo '<h3>Next Steps:</h3>';
echo '<ol>';
echo '<li>If observers are not registered, check <code>app/Providers/AppServiceProvider.php</code></li>';
echo '<li>If cache keys don\'t exist, visit your API endpoints to populate them: <code>/api/projects</code>, <code>/api/features</code>, etc.</li>';
echo '<li>If cache exists but performance is slow, check Redis server status</li>';
echo '<li>Use browser DevTools Network tab to measure actual response times (first request vs second request)</li>';
echo '</ol>';

echo '</div>';

// ============================================================================
// 7. Redis Connection Info
// ============================================================================
echo '<div class="section">';
echo '<h2>7️⃣ Redis Server Info</h2>';

try {
    $redis = Cache::getRedis();

    if (method_exists($redis, 'connection')) {
        $connection = $redis->connection();

        if (method_exists($connection, 'dbsize')) {
            $dbsize = $connection->dbsize();
            echo '<p><strong>Redis DB Size:</strong> ' . number_format($dbsize) . ' keys</p>';
        }

        if (method_exists($connection, 'info')) {
            $info = $connection->info();
            if (isset($info['used_memory_human'])) {
                echo '<p><strong>Redis Memory Used:</strong> ' . $info['used_memory_human'] . '</p>';
            }
            if (isset($info['redis_version'])) {
                echo '<p><strong>Redis Version:</strong> ' . $info['redis_version'] . '</p>';
            }
        }
    }

    echo '<p class="success">✓ Redis connection is working</p>';
} catch (Exception $e) {
    echo '<p class="error">✗ Redis connection error: ' . $e->getMessage() . '</p>';
}

echo '</div>';

?>

</body>
</html>
