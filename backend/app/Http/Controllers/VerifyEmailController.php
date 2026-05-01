<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerifyEmailController extends Controller
{
    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.']);
        }

        if (now()->timestamp > (int) $request->expires) {
            return response()->json(['message' => 'Lien expiré.'], 410);
        }

        if (!hash_equals(sha1($user->email), $hash)) {
            return response()->json(['message' => 'Lien invalide.'], 400);
        }

        $expected = hash_hmac('sha256', "{$id}|{$hash}|{$request->expires}", config('app.key'));
        if (!hash_equals($expected, $request->signature ?? '')) {
            return response()->json(['message' => 'Signature invalide.'], 400);
        }

        $user->markEmailAsVerified();

        return response()->json(['message' => 'Email confirmé avec succès.']);
    }

    public function resend(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Si ce compte existe, un email a été envoyé.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email de vérification renvoyé.']);
    }
}
