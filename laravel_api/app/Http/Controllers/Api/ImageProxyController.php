<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Image Proxy Controller
 * 
 * Serves images from storage with proper CORS headers.
 * This is needed because static files bypass Laravel's CORS middleware.
 */
class ImageProxyController extends Controller
{
    /**
     * Serve an image from storage with CORS headers
     */
    public function show(Request $request, string $path): BinaryFileResponse
    {
        // Decode the path (in case it's URL encoded)
        $path = urldecode($path);

        // Security: prevent directory traversal
        if (str_contains($path, '..')) {
            abort(403, 'Invalid path');
        }

        // Prepend 'public/' if not present (storage paths are relative to storage/app)
        if (!str_starts_with($path, 'public/')) {
            $storagePath = 'public/' . ltrim($path, '/');
        } else {
            $storagePath = $path;
        }

        // Check if file exists in storage
        if (!Storage::exists($storagePath)) {
            // Try with 'images/' prefix
            $storagePath = 'public/images/' . ltrim($path, '/');
            if (!Storage::exists($storagePath)) {
                abort(404, 'Image not found');
            }
        }

        $fullPath = Storage::path($storagePath);

        // Get mime type
        $mimeType = mime_content_type($fullPath) ?: 'application/octet-stream';

        // Return file with CORS headers
        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => '*',
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }
}
