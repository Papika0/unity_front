<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiErrorResponse;
use App\Http\Responses\ApiSuccessResponse;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request)
    {
        try {
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return response()->json([
                    'message' => 'მომხმარებელი ვერ მოიძებნა.',
                ], 401);
            }

            $credentials = [
                'email' => $request->email,
                'password' => $request->password,
            ];
            $remember = $request->boolean('rememberMe');

            // Set TTL based on remember me option
            // Default: 60 minutes, Remember me: 20160 minutes (2 weeks)
            if ($remember) {
                JWTAuth::factory()->setTTL(20160); // 2 weeks in minutes
            }

            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'message' => 'მომხმარებელის პაროლი არასწორია.',
                ], 401);
            }

            // Load the role relationship
            $user->load('role');
            
            // Add role name to the user object for frontend compatibility
            $user->role = $user->role ? $user->role->name : null;

            return new ApiSuccessResponse([
                'token' => $token,
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return new ApiErrorResponse([], $e->getMessage(), 500);
        }
    }
}
