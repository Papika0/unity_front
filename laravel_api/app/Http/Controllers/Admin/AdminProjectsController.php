<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Projects;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Admin\AdminProjectResource;
use App\Http\Requests\Admin\Projects\StoreProjectsRequest;
use App\Http\Requests\Admin\Projects\UpdateProjectsRequest;

class AdminProjectsController extends Controller
{
    use ApiResponse;

    public function index()
    {
        try {
            $projects = Projects::all();
            // wrap each model in our resource
            $resources = AdminProjectResource::collection($projects);
        
            return $this->success($resources);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch projects', 500);
        }
    }

    public function show($id)
    {
        try {
            $project = Projects::findOrFail($id);
            return $this->success(new AdminProjectResource($project));
        } catch (\Exception $e) {
            return $this->error('Project not found', 404);
        }
    }

    public function store(StoreProjectsRequest $request)
    {
        try {
            $data = [...$request->validated()];

            // Handle main image upload
            if ($request->hasFile('main_image')) {
                $path = $request->file('main_image')->store('projects/main', 'public');
                $data['main_image'] = 'storage/' . $path;
            }

            // Handle render image upload
            if ($request->hasFile('render_image')) {
                $path = $request->file('render_image')->store('projects/render', 'public');
                $data['render_image'] = 'storage/' . $path;
            }

            // Handle gallery images upload
            if ($request->hasFile('gallery_images')) {
                $galleryImages = [];
                foreach ($request->file('gallery_images') as $file) {
                    $path = $file->store('projects/gallery', 'public');
                    $galleryImages[] = 'storage/' . $path;
                }
                $data['gallery_images'] = $galleryImages;
            }

            $project = Projects::create($data);
            return $this->success(new AdminProjectResource($project), 'Project created', 201);
        } catch (\Exception $e) {
            return $this->error('Failed to create project: ' . $e->getMessage(), 500);
        }
    }

   public function update(UpdateProjectsRequest $request, $id) : \Illuminate\Http\JsonResponse
{
    try {
        $project = Projects::findOrFail($id);

        $data = [...$request->validated()];

        if ($request->hasFile('main_image')) {
            // Delete old main image if exists
            if ($project->main_image && Storage::disk('public')->exists(str_replace('storage/', '', $project->main_image))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $project->main_image));
            }
            
            $path = $request->file('main_image')->store('projects/main', 'public');
            $data['main_image'] = 'storage/' . $path;
        }

        if ($request->hasFile('render_image')) {
            // Delete old render image if exists
            if ($project->render_image && Storage::disk('public')->exists(str_replace('storage/', '', $project->render_image))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $project->render_image));
            }
            
            $path = $request->file('render_image')->store('projects/render', 'public');
            $data['render_image'] = 'storage/' . $path;
        }

        // Handle gallery images
        if ($request->hasFile('gallery_images') || $request->has('existing_gallery_images')) {
            $finalGalleryImages = [];
            
            // Get existing gallery images to keep
            if ($request->has('existing_gallery_images')) {
                $existingToKeep = $request->input('existing_gallery_images', []);
                $finalGalleryImages = array_merge($finalGalleryImages, $existingToKeep);
            }
            
            // Add new gallery images
            if ($request->hasFile('gallery_images')) {
                foreach ($request->file('gallery_images') as $file) {
                    $path = $file->store('projects/gallery', 'public');
                    $finalGalleryImages[] = 'storage/' . $path;
                }
            }
            
            // Delete images that are no longer needed
            $currentGallery = [];
            if ($project->gallery_images) {
                if (is_array($project->gallery_images)) {
                    $currentGallery = $project->gallery_images;
                } else {
                    $decoded = json_decode($project->gallery_images, true);
                    $currentGallery = is_array($decoded) ? $decoded : [];
                }
            }
            
            // Find images to delete (those not in finalGalleryImages)
            $imagesToDelete = array_diff($currentGallery, $finalGalleryImages);
            foreach ($imagesToDelete as $oldImage) {
                $cleanPath = str_replace('storage/', '', $oldImage);
                if (Storage::disk('public')->exists($cleanPath)) {
                    Storage::disk('public')->delete($cleanPath);
                }
            }
            
            $data['gallery_images'] = $finalGalleryImages;
        }

        $project->update($data);

        $project->refresh();

        return $this->success(new AdminProjectResource($project), 'Project updated');
    } catch (\Exception $e) {
        return $this->error('Failed to update project: ' . $e->getMessage(), 500);
    }
}

}
