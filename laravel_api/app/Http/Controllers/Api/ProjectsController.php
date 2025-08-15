<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Projects;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Resources\Api\ProjectResource;

class ProjectsController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of published projects for public API.
     */
    public function index(Request $request)
    {
        try {
            $projects = Projects::where('is_active', true)
                               ->orderBy('created_at', 'desc')
                               ->get();

            $resources = ProjectResource::collection($projects);
            return $this->success($resources);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch projects', 500);
        }
    }

    /**
     * Display a listing of featured projects for public API.
     */
    public function featured(Request $request)
    {
        try {
            $projects = Projects::where('is_active', true)
                               ->where('is_featured', true)
                               ->orderBy('created_at', 'desc')
                               ->get();

            $resources = ProjectResource::collection($projects);
            return $this->success($resources);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch featured projects', 500);
        }
    }

    /**
     * Display the specified project for public API.
     */
    public function show($id)
    {
        try {
            $project = Projects::where('is_active', true)->findOrFail($id);
            return $this->success(new ProjectResource($project));
        } catch (\Exception $e) {
            return $this->error('Project not found', 404);
        }
    }
}
