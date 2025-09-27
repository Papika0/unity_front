<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Api\ProjectsController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\HomePageController;
use App\Http\Controllers\Api\AboutController;
use App\Http\Controllers\Api\ProjectsPageController;
use App\Http\Controllers\Api\FeaturesController;
use App\Http\Controllers\Admin\AdminNewsController;
use App\Http\Controllers\Admin\AdminProjectsController;
use App\Http\Controllers\Admin\AdminTranslationController;
use App\Http\Controllers\Admin\AdminContactInfoController;
use App\Http\Controllers\Admin\AdminAboutController;
use App\Http\Controllers\Admin\AdminImageController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Admin\AdminController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('auth')->group(function () {
    Route::post('login', LoginController::class);
    Route::post('logout', LogoutController::class)->middleware('auth:api');
});

// Public news routes
Route::prefix('news')->controller(NewsController::class)->group(function () {
    Route::get('/', 'index');
    Route::get('/featured', 'featured');
    Route::get('/latest', 'latest');
    Route::get('/recent', 'latest'); // Alias for latest
    Route::get('/{id}', 'show');
});

// Public projects routes
Route::prefix('projects')->controller(ProjectsController::class)->group(function () {
    Route::get('/', 'index');
    Route::get('/featured', 'featured');
    Route::get('/homepage', 'homepage');
    Route::get('/{id}', 'show');
});

// Features routes (public)
Route::prefix('features')->controller(FeaturesController::class)->group(function () {
    Route::get('/', 'index');
    Route::get('/{id}', 'show');
    Route::get('/project/{projectId}', 'getProjectFeatures');
});

// Homepage routes
Route::prefix('homepage')->controller(HomePageController::class)->group(function () {
    Route::get('/', 'index');
    Route::get('/bootstrap', 'index'); // Alias for backward compatibility
});

// About page routes
Route::prefix('about')->controller(AboutController::class)->group(function () {
    Route::get('/', 'index');
});

// Projects page routes
Route::prefix('projects-page')->controller(ProjectsPageController::class)->group(function () {
    Route::get('/', 'index');
});

// Gallery page routes
Route::prefix('gallery-page')->controller(App\Http\Controllers\Api\GalleryPageController::class)->group(function () {
    Route::get('/', 'index');
});

// Contact info routes (public)
Route::get('/contact-info', [App\Http\Controllers\Api\ContactInfoController::class, 'index']);

// Gallery routes (public)
Route::prefix('gallery')->controller(GalleryController::class)->group(function () {
    Route::get('/', 'index');
    Route::get('/categories', 'categories');
    Route::get('/{id}', 'show');
});

// Test cache endpoint (no auth required for testing)
Route::get('/test-cache', [AdminController::class, 'getCacheStats']);

Route::middleware(['auth:api', 'jwt.auth'])->group(function () {
    Route::get('/user', [UserController::class, 'getUser']);

    Route::prefix('translations')->controller(AdminTranslationController::class)->group(function () {
        Route::post('/', 'getTranslations');
        Route::post('/create', 'createTranslation');
        Route::post('/{id}', 'updateTranslation');
        Route::get('/{id}', 'getTranslation');
        Route::get('/group/{group}', 'getTranslationsByGroup');
    });

    Route::prefix('admin/projects')->controller(AdminProjectsController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/set-featured', 'setFeaturedProjects'); // Set featured projects
        Route::post('/set-homepage', 'setHomepageProjects'); // Set homepage projects
        Route::get('/{id}', 'show');
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
    });

    // Admin features routes
    Route::prefix('admin/features')->controller(FeaturesController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::get('/{id}', 'show');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::post('/project/{projectId}/assign', 'assignToProject');
    });

    // Admin cache management routes
    Route::prefix('admin/cache')->controller(AdminController::class)->group(function () {
        Route::post('/clear', 'clearCache'); // Clear all cache
        Route::post('/clear-specific', 'clearSpecificCache'); // Clear specific cache types
        Route::get('/stats', 'getCacheStats'); // Get cache statistics
    });

    // Admin test routes
    Route::get('/admin/test-auth', [AdminController::class, 'testAuth']);

    // Protected news routes (admin only)
    Route::prefix('admin/news')->controller(AdminNewsController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/for-featured-modal', 'forFeaturedModal'); // Get articles for featured modal
        Route::post('/set-featured', 'setFeatured'); // Set featured news - MUST be before /{id} routes
        Route::get('/{id}', 'show');
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::post('/{id}', 'update'); // Allow POST for multipart updates
        Route::delete('/{id}', 'destroy');
    });

    // Protected contact info routes (admin only) - Single record
    Route::prefix('admin/contact-info')->controller(AdminContactInfoController::class)->group(function () {
        Route::get('/', 'index');           // Get the single contact info record
        Route::put('/', 'update');          // Update the contact info record
        Route::post('/', 'update');         // Allow POST for form compatibility
    });

    // Protected about info routes (admin only) - Single record
    Route::prefix('admin/about-info')->controller(AdminAboutController::class)->group(function () {
        Route::get('/', 'index');           // Get the single about info record
        Route::put('/', 'update');          // Update the about info record
        Route::post('/', 'update');         // Allow POST for form compatibility
    });

    // Protected image management routes (admin only)
    Route::prefix('admin/images')->controller(AdminImageController::class)->group(function () {
        Route::get('/', 'index');           // Get all images with pagination and filtering
        Route::post('/', 'store');          // Upload new image
        Route::get('/gallery', 'gallery');  // Get gallery images by category
        Route::get('/categories', 'categories'); // Get available categories
        Route::get('/projects', 'projects'); // Get available projects
        Route::get('/{id}', 'show');        // Get single image
        Route::put('/{id}', 'update');      // Update image metadata
        Route::delete('/{id}', 'destroy');  // Delete image
        Route::post('/attach', 'attach');   // Attach image to model
        Route::post('/detach', 'detach');   // Detach image from model
    });
});

// Debug route for checking authorization headers (remove in production)
Route::get('debug/auth-headers', [\App\Http\Controllers\Debug\AuthDebugController::class, 'checkHeaders']);
