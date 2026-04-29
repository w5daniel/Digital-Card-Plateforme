<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrandKitController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\TemplateController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['status' => 'ok', 'app' => config('app.name')]));

Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout',   [AuthController::class, 'logout']);
        Route::get('/me',        [AuthController::class, 'me']);
        Route::put('/profile',   [AuthController::class, 'updateProfile']);
        Route::post('/avatar',   [AuthController::class, 'updateAvatar']);
        Route::delete('/avatar', [AuthController::class, 'deleteAvatar']);
        Route::put('/password',  [AuthController::class, 'changePassword']);
    });
});

// IMPORTANT: community avant apiResource pour éviter que Laravel matche {id}=community
Route::get('/templates/community', [TemplateController::class, 'community']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('cards', CardController::class);
    Route::post('/cards/{card}/stats', [CardController::class, 'incrementStat']);

    Route::apiResource('templates', TemplateController::class);

    Route::get('/brand-kit',         [BrandKitController::class, 'show']);
    Route::put('/brand-kit',         [BrandKitController::class, 'update']);
    Route::post('/brand-kit/logo',   [BrandKitController::class, 'uploadLogo']);
    Route::delete('/brand-kit/logo', [BrandKitController::class, 'deleteLogo']);
});

// Public — accessible sans authentification
Route::get('/share/{id}', [CardController::class, 'publicShow']);

// Galerie officielle
Route::get('/gallery',        [GalleryController::class, 'index']);
Route::get('/gallery/{slug}', [GalleryController::class, 'show']);