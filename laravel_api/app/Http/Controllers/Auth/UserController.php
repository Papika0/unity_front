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
        } catch (JWTException $e) {
            Log::error('JWTException occurred while authenticating user', ['error' => $e->getMessage()]);
            //throw $th;
        }
        return response()->json($user, 200);
    }

}
