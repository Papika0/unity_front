<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Api\ProjectsController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\TranslationController;
use App\Http\Controllers\Admin\NewsController as AdminNewsController;
use App\Http\Controllers\Admin\ProjectsController as AdminProjectsController;
use App\Http\Controllers\Admin\TranslationController as AdminTranslationController;


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
    Route::get('/{id}', 'show');
});

Route::middleware('auth:api')->group(function () {
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
        Route::get('/{id}', 'show');
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
    });

    // Protected news routes (admin only)
    Route::prefix('admin/news')->controller(AdminNewsController::class)->group(function () {
        Route::get('/', 'adminIndex');
        Route::get('/{id}', 'adminShow');
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::post('/{id}', 'update'); // Allow POST for multipart updates
        Route::delete('/{id}', 'destroy');
    });
});
