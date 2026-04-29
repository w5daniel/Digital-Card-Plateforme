<?php

namespace App\Http\Controllers;

use App\Models\BrandKit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BrandKitController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $kit = BrandKit::firstOrCreate(['user_id' => $request->user()->id]);

        return response()->json($kit);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'colors'   => ['nullable', 'array', 'max:10'],
            'colors.*' => ['string', 'max:20'],
            'fonts'    => ['nullable', 'string', 'max:100'],
        ]);

        $kit = BrandKit::updateOrCreate(
            ['user_id' => $request->user()->id],
            array_filter($data, fn ($v) => $v !== null),
        );

        return response()->json($kit);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate(['logo' => ['required', 'image', 'max:2048']]);

        $kit = BrandKit::firstOrCreate(['user_id' => $request->user()->id]);

        if ($kit->getRawOriginal('logo_url')) {
            Storage::disk('public')->delete($kit->getRawOriginal('logo_url'));
        }

        $path = $request->file('logo')->store('logos', 'public');
        $kit->update(['logo_url' => $path]);

        return response()->json(['logo_url' => Storage::disk('public')->url($path)]);
    }

    public function deleteLogo(Request $request): JsonResponse
    {
        $kit = BrandKit::firstOrCreate(['user_id' => $request->user()->id]);

        if ($kit->getRawOriginal('logo_url')) {
            Storage::disk('public')->delete($kit->getRawOriginal('logo_url'));
            $kit->update(['logo_url' => null]);
        }

        return response()->json(['logo_url' => null]);
    }
}
