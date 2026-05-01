<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TemplateController extends Controller
{
    public function index(): JsonResponse
    {
        $templates = Template::where('is_gallery', true)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($templates);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'slug'       => 'nullable|string|max:255',
            'category'   => 'nullable|string|max:100',
            'meta'       => 'nullable|array',
            'is_premium' => 'nullable|boolean',
        ]);

        $base = $validated['slug'] ?? Str::slug($validated['name']) ?: 'modele';
        $slug = $base;
        $i = 2;
        while (Template::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        $template = $request->user()->templates()->create([
            'name'       => $validated['name'],
            'slug'       => $slug,
            'category'   => $validated['category'] ?? 'Personnalisé',
            'is_gallery' => true,
            'is_public'  => true,
            'is_premium' => $validated['is_premium'] ?? false,
            'meta'       => $validated['meta'] ?? null,
        ]);

        return response()->json(['template' => $template], 201);
    }

    public function update(Request $request, Template $template): JsonResponse
    {
        $validated = $request->validate([
            'is_premium' => 'sometimes|boolean',
            'is_public'  => 'sometimes|boolean',
            'name'       => 'sometimes|string|max:255',
            'category'   => 'sometimes|string|max:100',
            'slug'       => 'sometimes|string|max:255',
            'meta'       => 'sometimes|array',
        ]);

        $template->update($validated);

        return response()->json($template->fresh());
    }

    public function destroy(Template $template): JsonResponse
    {
        $template->delete();

        return response()->json(null, 204);
    }
}
