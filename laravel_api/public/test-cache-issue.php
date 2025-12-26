<?php

/**
 * Test if caching API Resources is causing issues
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Cache;
use App\Models\Projects;
use App\Http\Resources\Api\ProjectResource;

header('Content-Type: text/html; charset=utf-8');

?>
<!DOCTYPE html>
<html>
<head>
    <title>Cache Issue Test</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
        .section { margin: 20px 0; padding: 15px; background: #252525; border-left: 4px solid #007acc; }
        .success { color: #4ec9b0; }
        .error { color: #f48771; }
        .warning { color: #ce9178; }
        h2 { color: #4ec9b0; }
        pre { background: #1e1e1e; padding: 10px; overflow-x: auto; border: 1px solid #3c3c3c; max-height: 400px; }
    </style>
</head>
<body>

<h1>🔍 Cache Serialization Test</h1>

<?php

echo '<div class="section">';
echo '<h2>Issue: Caching API Resource Objects</h2>';
echo '<p>Testing if ProjectResource can be cached and unserialized correctly...</p>';

// Test 1: Get a project
$project = Projects::where('is_active', true)
    ->with(['mainImage', 'renderImage', 'galleryImages', 'interactiveZones', 'features'])
    ->first();

if (!$project) {
    echo '<p class="error">✗ No active projects found in database</p>';
    echo '</div></body></html>';
    exit;
}

echo '<p class="success">✓ Found project: ' . $project->title . '</p>';

// Test 2: Create a ProjectResource
$locale = 'ka';
$resource = new ProjectResource($project, $locale);

echo '<p class="success">✓ Created ProjectResource</p>';
echo '<p>Resource class: ' . get_class($resource) . '</p>';

// Test 3: Try to cache the Resource object (THIS IS THE PROBLEM)
$testKey = 'test_resource_cache_' . time();

try {
    Cache::put($testKey, $resource, 60);
    echo '<p class="warning">⚠ Cached ProjectResource object (this might cause issues)</p>';

    // Try to retrieve it
    $retrieved = Cache::get($testKey);

    if ($retrieved) {
        echo '<p class="info">Cache retrieval successful</p>';
        echo '<p>Retrieved type: ' . gettype($retrieved) . '</p>';

        if (is_object($retrieved)) {
            echo '<p>Retrieved class: ' . get_class($retrieved) . '</p>';

            // Try to use it
            try {
                $array = $retrieved->toArray(request());
                echo '<p class="success">✓ Resource->toArray() works after caching</p>';
            } catch (Exception $e) {
                echo '<p class="error">✗ Resource->toArray() failed: ' . $e->getMessage() . '</p>';
            }
        }
    } else {
        echo '<p class="error">✗ Cache retrieval failed</p>';
    }

    Cache::forget($testKey);
} catch (Exception $e) {
    echo '<p class="error">✗ Caching failed: ' . $e->getMessage() . '</p>';
}

echo '</div>';

// Test 4: Correct approach - cache the array/data instead
echo '<div class="section">';
echo '<h2>Solution: Cache the Converted Data</h2>';

$testKey2 = 'test_data_cache_' . time();

try {
    // Convert resource to array BEFORE caching
    $resourceData = $resource->toArray(request());

    Cache::put($testKey2, $resourceData, 60);
    echo '<p class="success">✓ Cached resource array (correct approach)</p>';

    $retrieved2 = Cache::get($testKey2);

    if ($retrieved2) {
        echo '<p class="success">✓ Cache retrieval successful</p>';
        echo '<p>Retrieved type: ' . gettype($retrieved2) . '</p>';
        echo '<p>Data size: ' . number_format(strlen(serialize($retrieved2))) . ' bytes</p>';

        if (is_array($retrieved2)) {
            echo '<p class="success">✓ Retrieved data is an array (ready to return as JSON)</p>';
            echo '<p>Array keys: ' . implode(', ', array_keys($retrieved2)) . '</p>';
        }
    }

    Cache::forget($testKey2);
} catch (Exception $e) {
    echo '<p class="error">✗ Error: ' . $e->getMessage() . '</p>';
}

echo '</div>';

// Test 5: Check current cache content
echo '<div class="section">';
echo '<h2>Current Projects Cache Analysis</h2>';

$cacheKey = 'projects_index_ka';
$exists = Cache::has($cacheKey);

echo '<p><strong>Cache key:</strong> <code>' . $cacheKey . '</code></p>';
echo '<p><strong>Exists:</strong> ' . ($exists ? '<span class="success">Yes</span>' : '<span class="warning">No</span>') . '</p>';

if ($exists) {
    $cachedData = Cache::get($cacheKey);
    echo '<p><strong>Type:</strong> ' . gettype($cachedData) . '</p>';

    if (is_object($cachedData)) {
        echo '<p class="error">✗ PROBLEM: Cached data is an object ('. get_class($cachedData) .')</p>';
        echo '<p class="warning">⚠ This means the cache contains Resource objects, which causes issues!</p>';
    } elseif (is_array($cachedData)) {
        echo '<p class="success">✓ Cached data is an array (correct)</p>';
        echo '<p>Number of items: ' . count($cachedData) . '</p>';
    } else {
        echo '<p>Cached data is: ' . gettype($cachedData) . '</p>';
    }

    // Show a sample
    echo '<p><strong>Sample cached data:</strong></p>';
    echo '<pre>' . htmlspecialchars(print_r($cachedData, true)) . '</pre>';
}

echo '</div>';

echo '<div class="section">';
echo '<h2>📋 Diagnosis Result</h2>';

if ($exists && is_object(Cache::get($cacheKey))) {
    echo '<h3 class="error">✗ FOUND THE PROBLEM!</h3>';
    echo '<p class="error">Your cache contains Resource objects instead of arrays/data.</p>';
    echo '<p class="warning">This causes Laravel to re-process the Resource on every request, negating the cache benefit!</p>';

    echo '<h3>Solution:</h3>';
    echo '<ol>';
    echo '<li>Clear the cache: <code>php artisan cache:clear</code></li>';
    echo '<li>Update controllers to cache the <code>toArray()</code> result, not the Resource object</li>';
    echo '<li>Re-visit API endpoints to rebuild cache with correct data</li>';
    echo '</ol>';
} else {
    echo '<p class="info">Cache structure looks correct. Performance issues might be elsewhere.</p>';
}

echo '</div>';

?>

</body>
</html>
