<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(SystemSetting::instance()->mergedData());
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'maxCardsPerUser'    => 'sometimes|integer|min:1|max:1000',
            'maxCardsPerPremium' => 'sometimes|integer|min:1|max:10000',
            'allowRegistration'  => 'sometimes|boolean',
            'allowGallery'       => 'sometimes|boolean',
            'maintenanceMode'    => 'sometimes|boolean',
            'appName'            => 'sometimes|string|max:100',
            'supportEmail'       => 'sometimes|email|max:191',
        ]);

        $setting = SystemSetting::instance();
        $setting->data = array_merge($setting->mergedData(), $validated);
        $setting->save();

        return response()->json($setting->mergedData());
    }
}
