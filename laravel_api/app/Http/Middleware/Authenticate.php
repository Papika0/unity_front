<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // For API requests, return null so a JSON error response is sent
        if ($request->is('api/*') || $request->expectsJson()) {
            return null;
        }

        // For web requests, redirect to login if it exists
        return route('login', absolute: false);
    }
}
