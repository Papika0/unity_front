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
                
                // Create a clean user array with role name instead of relationship
                $userData = $user->toArray();
                $userData['role'] = $user->role ? $user->role->name : null;
                
                return response()->json($userData, 200);
            }
        } catch (JWTException $e) {
            Log::error('JWTException occurred while authenticating user', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        
        return response()->json(['error' => 'User not found'], 404);
    }

}
