<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::withCount('cards')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($u) => $this->format($u));

        return response()->json($users);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'is_banned'  => 'sometimes|boolean',
            'is_premium' => 'sometimes|boolean',
            'role'       => 'sometimes|in:user,admin',
        ]);

        if (isset($validated['is_premium'])) {
            $validated['premium_expires_at'] = null;
        }

        $user->update($validated);

        return response()->json(['user' => $this->format($user->fresh()->loadCount('cards'))]);
    }

    public function destroy(User $user): JsonResponse
    {
        // Empêche la suppression de soi-même
        if ($user->id === request()->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 403);
        }

        $user->delete();

        return response()->json(null, 204);
    }

    private function format(User $u): array
    {
        return [
            'id'                 => $u->id,
            'name'               => $u->name,
            'email'              => $u->email,
            'role'               => $u->role,
            'is_banned'          => (bool) $u->is_banned,
            'is_premium'         => (bool) $u->is_premium,
            'premium_expires_at' => $u->premium_expires_at,
            'cards_count'        => $u->cards_count ?? 0,
            'created_at'         => $u->created_at,
        ];
    }
}
