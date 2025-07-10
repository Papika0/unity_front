<?php

namespace App\Http\Responses;

use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Contracts\Support\Responsable;

class ApiSuccessResponse implements Responsable
{
    protected $data;
    protected $message;
    protected $status;

    public function __construct($data = [], $message = 'Operation successful', $status = 200)
    {
        $this->data = $data;
        $this->message = $message;
        $this->status = $status;
    }

    public function toResponse($request) : JsonResponse
    {
        return response()->json([
            'message' => $this->message,
            'data' => $this->data,
        ], $this->status);
    }
}
