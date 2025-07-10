<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Requests\LoginRequest;
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

            if (!$token = JWTAuth::attempt($request->validated())) {
                return response()->json([
                    'message' => 'მომხმარებელის პაროლი არასწორია.',
                ], 401);
            }

            return new ApiSuccessResponse([
                'token' => $token,
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return new ApiErrorResponse([], $e->getMessage(), 500);
        }
    }
}
