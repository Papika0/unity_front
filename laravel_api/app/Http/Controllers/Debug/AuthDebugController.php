<?php

namespace App\Http\Controllers\Debug;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthDebugController extends Controller
{
    public function checkHeaders(Request $request)
    {
        $headers = [];
        $serverVars = [];
        
        // Check all possible authorization header sources
        $headers['Authorization'] = $request->header('Authorization');
        $headers['HTTP_AUTHORIZATION'] = $request->header('HTTP-AUTHORIZATION');
        
        // Check server variables
        $serverVars['HTTP_AUTHORIZATION'] = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        $serverVars['REDIRECT_HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        $serverVars['PHP_AUTH_USER'] = $_SERVER['PHP_AUTH_USER'] ?? null;
        $serverVars['PHP_AUTH_PW'] = $_SERVER['PHP_AUTH_PW'] ?? null;
        
        // Check environment variables
        $envVars = [];
        $envVars['HTTP_AUTHORIZATION'] = getenv('HTTP_AUTHORIZATION') ?: null;
        
        // Get all request headers
        $allHeaders = $request->headers->all();
        
        return response()->json([
            'message' => 'Authorization header debug information',
            'request_headers' => $headers,
            'server_variables' => $serverVars,
            'environment_variables' => $envVars,
            'all_headers' => $allHeaders,
            'request_method' => $request->method(),
            'request_uri' => $request->getRequestUri(),
        ]);
    }
}