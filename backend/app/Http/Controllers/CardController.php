<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCardRequest;
use App\Http\Requests\UpdateCardRequest;
use App\Models\Card;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cards = $request->user()->cards()->get();

        return response()->json(['cards' => $cards]);
    }

    public function store(StoreCardRequest $request): JsonResponse
    {
        $user = $request->user();

        $limit = $this->cardLimit($user);
        if ($limit !== null && $user->cards()->count() >= $limit) {
            return response()->json([
                'message' => "Limite atteinte ({$limit} cartes). Passez au plan Premium pour en créer davantage.",
            ], 403);
        }

        $meta = $request->meta ?? [];
        if ($request->has('templateModelId')) {
            $meta['templateModelId'] = $request->templateModelId;
        }

        $card = $user->cards()->create([
            'title'       => $request->name,
            'elements'    => $request->elements   ?? ['recto' => [], 'verso' => []],
            'backgrounds' => $request->backgrounds ?? ['recto' => '#FFFFFF', 'verso' => '#1E293B'],
            'is_public'   => false,
            'meta'        => $meta,
        ]);

        return response()->json(['card' => $card], 201);
    }

    public function show(Request $request, Card $card): JsonResponse
    {
        if ($card->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json(['card' => $card]);
    }

    public function update(UpdateCardRequest $request, Card $card): JsonResponse
    {
        if ($card->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $data = [];
        if ($request->has('name'))        $data['title']       = $request->name;
        if ($request->has('elements'))    $data['elements']    = $request->elements;
        if ($request->has('backgrounds')) $data['backgrounds'] = $request->backgrounds;
        if ($request->has('meta'))        $data['meta']        = $request->meta;

        $card->update($data);

        return response()->json(['card' => $card->fresh()]);
    }

    public function destroy(Request $request, Card $card): JsonResponse
    {
        if ($card->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $card->delete();

        return response()->json(['message' => 'Carte supprimée.']);
    }

    public function publicShow(string $id): JsonResponse
    {
        $card = Card::find($id);

        if (! $card) {
            return response()->json(['message' => 'Carte introuvable.'], 404);
        }

        $card->increment('views');

        return response()->json(['card' => $card]);
    }

    public function incrementStat(Request $request, Card $card): JsonResponse
    {
        $request->validate([
            'stat' => ['required', 'in:downloads,qr_scans,shares'],
        ]);

        if ($card->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $card->increment($request->stat);

        return response()->json(['message' => 'Compteur mis à jour.']);
    }

    public function incrementPublicStat(Request $request, Card $card): JsonResponse
    {
        $request->validate([
            'stat' => ['required', 'in:downloads,qr_scans,shares'],
        ]);

        $card->increment($request->stat);

        return response()->json(['message' => 'Compteur mis à jour.']);
    }

    private function cardLimit(User $user): ?int
    {
        if ($user->role === 'admin') return null;

        $key     = $user->is_premium ? 'maxCardsPerPremium' : 'maxCardsPerUser';
        $default = $user->is_premium ? 50 : 3;

        return (int) \App\Models\SystemSetting::get($key, $default);
    }
}
