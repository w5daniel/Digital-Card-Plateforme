<?php

use App\Http\Controllers\Admin\CardController as AdminCardController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\TemplateController as AdminTemplateController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrandKitController;
use App\Http\Controllers\VerifyEmailController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TemplateController;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['status' => 'ok', 'app' => config('app.name')]));

// Config publique (maintenanceMode, allowGallery, allowRegistration, limites cartes)
Route::get('/config', function () {
    $data = SystemSetting::instance()->mergedData();
    return response()->json(collect($data)->only([
        'maintenanceMode',
        'allowGallery',
        'allowRegistration',
        'maxCardsPerUser',
        'maxCardsPerPremium',
    ]));
});

Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/login',           [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout',           [AuthController::class, 'logout']);
        Route::get('/me',                [AuthController::class, 'me']);
        Route::put('/profile',           [AuthController::class, 'updateProfile']);
        Route::post('/avatar',           [AuthController::class, 'updateAvatar']);
        Route::delete('/avatar',         [AuthController::class, 'deleteAvatar']);
        Route::put('/password',          [AuthController::class, 'changePassword']);
        Route::post('/upgrade-premium',  [AuthController::class, 'upgradePremium']);
    });
});

// IMPORTANT: community avant apiResource pour éviter que Laravel matche {id}=community
Route::get('/templates/community', [TemplateController::class, 'community']);

Route::middleware(['auth:sanctum', 'maintenance'])->group(function () {
    Route::apiResource('cards', CardController::class);
    Route::post('/cards/{card}/stats', [CardController::class, 'incrementStat']);

    Route::apiResource('templates', TemplateController::class);

    Route::get('/notifications',            [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}',    [NotificationController::class, 'destroy']);

    Route::get('/brand-kit',         [BrandKitController::class, 'show']);
    Route::put('/brand-kit',         [BrandKitController::class, 'update']);
    Route::post('/brand-kit/logo',   [BrandKitController::class, 'uploadLogo']);
    Route::delete('/brand-kit/logo', [BrandKitController::class, 'deleteLogo']);

    // ── Routes Admin ──────────────────────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('users',                    [UserController::class, 'index']);
        Route::patch('users/{user}',           [UserController::class, 'update']);
        Route::delete('users/{user}',          [UserController::class, 'destroy']);

        Route::get('cards',                    [AdminCardController::class, 'index']);
        Route::delete('cards/{card}',          [AdminCardController::class, 'destroy']);

        Route::get('templates',                [AdminTemplateController::class, 'index']);
        Route::post('templates',               [AdminTemplateController::class, 'store']);
        Route::patch('templates/{template}',   [AdminTemplateController::class, 'update']);
        Route::delete('templates/{template}',  [AdminTemplateController::class, 'destroy']);

        Route::get('settings',                 [SettingsController::class, 'show']);
        Route::put('settings',                 [SettingsController::class, 'update']);
    });
});

// Vérification email — accessible sans authentification
Route::get('/email/verify/{id}/{hash}', [VerifyEmailController::class, 'verify'])
    ->name('verification.verify');
Route::post('/email/resend', [VerifyEmailController::class, 'resend'])
    ->middleware('throttle:3,1');

// Public — accessible sans authentification
Route::get('/share/{id}', [CardController::class, 'publicShow']);

// Galerie officielle
Route::get('/gallery',        [GalleryController::class, 'index']);
Route::get('/gallery/{slug}', [GalleryController::class, 'show']);
