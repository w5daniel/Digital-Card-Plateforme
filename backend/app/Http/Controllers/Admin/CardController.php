<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Notifications\CardDeletedByAdmin;
use Illuminate\Http\JsonResponse;

class CardController extends Controller
{
    public function index(): JsonResponse
    {
        $cards = Card::select('id', 'user_id', 'title', 'is_public', 'views', 'created_at')
            ->with('user:id,name,email')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($c) => [
                'id'         => $c->id,
                'title'      => $c->title,
                'is_public'  => (bool) $c->is_public,
                'views'      => $c->views ?? 0,
                'created_at' => $c->created_at,
                'user'       => $c->user ? [
                    'id'    => $c->user->id,
                    'name'  => $c->user->name,
                    'email' => $c->user->email,
                ] : null,
            ]);

        return response()->json($cards);
    }

    public function destroy(Card $card): JsonResponse
    {
        $card->load('user');
        /** @var \App\Models\User|null $owner */
        $owner = $card->user;
        $title = (string) $card->title;
        $card->delete();
        if ($owner) $owner->notify(new CardDeletedByAdmin($title));

        return response()->json(null, 204);
    }
}
