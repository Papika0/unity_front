<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Tymon\JWTAuth\Exceptions\JWTException;

class UserController extends Controller
{
    public function getUser(Request $request): JsonResponse
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            if ($user) {
                // Load the role relationship
                $user->load('role');
                
                // Add role name to the user object for frontend compatibility
                $user->role = $user->role ? $user->role->name : null;
            }
        } catch (JWTException $e) {
            Log::error('JWTException occurred while authenticating user', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        
        return response()->json($user, 200);
    }

}
