<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTemplateRequest;
use App\Http\Requests\UpdateTemplateRequest;
use App\Models\Template;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $templates = $request->user()->templates()->where('is_gallery', false)->latest()->get();

        return response()->json(['templates' => $templates]);
    }

    public function store(StoreTemplateRequest $request): JsonResponse
    {
        $user = $request->user();

        $limit = $this->templateLimit($user);
        if ($limit !== null && $user->templates()->where('is_gallery', false)->count() >= $limit) {
            return response()->json([
                'message' => "Limite atteinte ({$limit} templates). Passez au plan Premium pour en créer davantage.",
            ], 403);
        }

        $template = $user->templates()->create([
            'name'         => $request->name,
            'is_gallery'   => false,
            'is_public'    => $request->boolean('is_public', false),
            'is_auto'      => $request->boolean('is_auto', false),
            'meta'         => $request->meta,
            'field_config' => $request->field_config,
        ]);

        return response()->json(['template' => $template], 201);
    }

    public function show(Request $request, Template $template): JsonResponse
    {
        $user = $request->user();

        if ($template->user_id !== $user->id && ! $template->is_public) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json(['template' => $template]);
    }

    public function update(UpdateTemplateRequest $request, Template $template): JsonResponse
    {
        if ($template->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $data = [];
        if ($request->has('name'))         $data['name']         = $request->name;
        if ($request->has('meta'))         $data['meta']         = $request->meta;
        if ($request->has('field_config')) $data['field_config'] = $request->field_config;
        if ($request->has('is_public'))    $data['is_public']    = $request->boolean('is_public');
        if ($request->has('is_auto'))      $data['is_auto']      = $request->boolean('is_auto');

        $template->update($data);

        return response()->json(['template' => $template->fresh()]);
    }

    public function destroy(Request $request, Template $template): JsonResponse
    {
        if ($template->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $template->delete();

        return response()->json(['message' => 'Template supprimé.']);
    }

    public function community(): JsonResponse
    {
        $templates = Template::where('is_public', true)
            ->where('is_gallery', false)
            ->with('user:id,name,email')
            ->latest()
            ->get();

        return response()->json(['templates' => $templates]);
    }

    private function templateLimit(User $user): ?int
    {
        if ($user->role === 'admin') return null;

        return $user->is_premium ? 50 : 2;
    }
}
