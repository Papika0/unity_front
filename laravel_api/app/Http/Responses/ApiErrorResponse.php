<?php
namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Contracts\Support\Responsable;

class ApiErrorResponse implements Responsable
{
    protected $error;
    protected $message;
    protected $status;

    public function __construct($error = [], $message = 'An error occurred', $status = 400)
    {
        $this->error = $error;
        $this->message = $message;
        $this->status = $status;
    }

    public function toResponse($request) : JsonResponse
    {
        return response()->json([
            'message' => $this->message,
            'error' => $this->error,
        ], $this->status);
    }
}
