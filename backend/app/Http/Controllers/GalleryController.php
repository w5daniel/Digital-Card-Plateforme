<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\JsonResponse;

class GalleryController extends Controller
{
    public function index(): JsonResponse
    {
        $templates = Template::where('is_gallery', true)->latest()->get();

        return response()->json(['templates' => $templates]);
    }

    public function show(string $slug): JsonResponse
    {
        $template = Template::where('slug', $slug)
            ->where('is_gallery', true)
            ->first();

        if (! $template) {
            return response()->json(['message' => 'Template introuvable.'], 404);
        }

        return response()->json(['template' => $template]);
    }
}
