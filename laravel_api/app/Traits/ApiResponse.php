<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Return a successful JSON response.
     *
     * @param  mixed       $data
     * @param  string|null $message
     * @param  int         $code
     * @return \Illuminate\Http\JsonResponse
     */
    protected function success($data, string $message = null, int $code = 200): JsonResponse
    {
        $payload = [
            'success' => true,
            'data'    => $data,
        ];

        if ($message !== null) {
            $payload['message'] = $message;
        }

        return response()->json($payload, $code);
    }

    /**
     * Return an error JSON response.
     *
     * @param  string $message
     * @param  int    $code
     * @return \Illuminate\Http\JsonResponse
     */
    protected function error(string $message, int $code = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $code);
    }
}
