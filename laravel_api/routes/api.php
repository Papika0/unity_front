<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\ProjectsController;
use App\Http\Controllers\TranslationController;


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

Route::middleware('auth:api')->group(function () {
    Route::get('/user', [UserController::class, 'getUser']);


    Route::prefix('translations')->controller(TranslationController::class)->group(function () {
        Route::post('/', 'getTranslations');
        Route::post('/create', 'createTranslation');
        Route::post('/{id}', 'updateTranslation');
        Route::get('/{id}', 'getTranslation');
        Route::get('/group/{group}', 'getTranslationsByGroup');
    });

    Route::prefix('projects')->controller(ProjectsController::class)->group(function () {
        Route::get('/',   'index');
        Route::get('/{id}','show');
        Route::post('/',  'store');
        Route::put('/{id}','update');
    });
});
