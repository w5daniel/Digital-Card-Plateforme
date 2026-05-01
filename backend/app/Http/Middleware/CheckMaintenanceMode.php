<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->is_banned) {
            return response()->json(['message' => 'Compte suspendu.', 'suspended' => true], 403);
        }

        if (SystemSetting::get('maintenanceMode', false) && $user?->role !== 'admin') {
            return response()->json(['message' => 'Service en maintenance.'], 503);
        }

        return $next($request);
    }
}
