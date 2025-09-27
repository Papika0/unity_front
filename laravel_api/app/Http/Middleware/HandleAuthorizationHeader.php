<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class HandleAuthorizationHeader
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check for Authorization header in various ways
        $token = null;
        
        // Method 1: Standard Authorization header
        if ($request->hasHeader('Authorization')) {
            $token = $request->header('Authorization');
        }
        // Method 2: X-Authorization fallback header
        elseif ($request->hasHeader('X-Authorization')) {
            $token = $request->header('X-Authorization');
        }
        // Method 3: HTTP_AUTHORIZATION server variable
        elseif (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $token = $_SERVER['HTTP_AUTHORIZATION'];
        }
        // Method 4: REDIRECT_HTTP_AUTHORIZATION (common in shared hosting)
        elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $token = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        // Method 5: Check for custom header that might be set by .htaccess
        elseif (!empty(getenv('HTTP_AUTHORIZATION'))) {
            $token = getenv('HTTP_AUTHORIZATION');
        }
        // Method 6: Check for Bearer token in query parameter (fallback)
        elseif ($request->has('token')) {
            $token = 'Bearer ' . $request->get('token');
        }

        // If we found a token, set it in the request headers
        if ($token) {
            $request->headers->set('Authorization', $token);
        }

        return $next($request);
    }
}