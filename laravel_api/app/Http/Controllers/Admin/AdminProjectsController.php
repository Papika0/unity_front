<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Projects;
use App\Traits\ApiResponse;
use App\Services\ImageService;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Admin\AdminProjectResource;
use App\Http\Requests\Admin\Projects\StoreProjectsRequest;
use App\Http\Requests\Admin\Projects\UpdateProjectsRequest;
use Illuminate\Http\Request;

class AdminProjectsController extends Controller
{
    use ApiResponse;

    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index()
    {
        try {
            $projects = Projects::with(['mainImage', 'renderImage', 'galleryImages'])->get();
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
            $project = Projects::with(['mainImage', 'renderImage', 'galleryImages'])->findOrFail($id);
            return $this->success(new AdminProjectResource($project));
        } catch (\Exception $e) {
            return $this->error('Project not found', 404);
        }
    }

    public function store(StoreProjectsRequest $request)
    {
        try {
            $data = [...$request->validated()];

            // Get project title for image records
            $projectTitle = $data['title']['en'] ?? $data['title']['ka'] ?? 'Project';

            // Create project first
            $project = Projects::create($data);

            // Handle main image upload
            if ($request->hasFile('main_image')) {
                $image = $this->imageService->uploadImage(
                    $request->file('main_image'),
                    $projectTitle . ' - Main Image',
                    'projects',
                    $projectTitle
                );
                $this->imageService->attachImage($image, $project, 'main');
            }

            // Handle render image upload
            if ($request->hasFile('render_image')) {
                $image = $this->imageService->uploadImage(
                    $request->file('render_image'),
                    $projectTitle . ' - Render',
                    'projects',
                    $projectTitle
                );
                $this->imageService->attachImage($image, $project, 'render');
            }

            // Handle gallery images upload
            if ($request->hasFile('gallery_images')) {
                $uploadErrors = [];

                foreach ($request->file('gallery_images') as $index => $file) {
                    try {
                        // Validate individual file
                        if (!$file->isValid()) {
                            $uploadErrors["gallery_images.{$index}"] = ["The gallery_images.{$index} file is invalid."];
                            continue;
                        }

                        $image = $this->imageService->uploadImage(
                            $file,
                            $projectTitle . ' - Gallery ' . ($index + 1),
                            'projects',
                            $projectTitle
                        );
                        $this->imageService->attachImage($image, $project, 'gallery', $index);
                    } catch (\Exception $e) {
                        $uploadErrors["gallery_images.{$index}"] = ["The gallery_images.{$index} failed to upload: " . $e->getMessage()];
                    }
                }

                // If there were upload errors, return them
                if (!empty($uploadErrors)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Some gallery images failed to upload',
                        'errors' => $uploadErrors
                    ], 422);
                }
            }

            $project->load(['mainImage', 'renderImage', 'galleryImages']);

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

        // Get project title for image records
        $projectTitle = $data['title']['en'] ?? $data['title']['ka'] ?? $project->getTranslation('title', 'en') ?? 'Project';

        if ($request->hasFile('main_image')) {
            // Detach old main image (auto-cleanup will delete if orphaned)
            $oldMainImages = $project->mainImage()->get();
            foreach ($oldMainImages as $oldImage) {
                $this->imageService->detachImage($oldImage, $project, 'main');
            }

            $image = $this->imageService->uploadImage(
                $request->file('main_image'),
                $projectTitle . ' - Main Image',
                'projects',
                $projectTitle
            );
            $this->imageService->attachImage($image, $project, 'main');
        }

        if ($request->hasFile('render_image')) {
            // Detach old render image (auto-cleanup will delete if orphaned)
            $oldRenderImages = $project->renderImage()->get();
            foreach ($oldRenderImages as $oldImage) {
                $this->imageService->detachImage($oldImage, $project, 'render');
            }

            $image = $this->imageService->uploadImage(
                $request->file('render_image'),
                $projectTitle . ' - Render',
                'projects',
                $projectTitle
            );
            $this->imageService->attachImage($image, $project, 'render');
        }

        // Handle gallery images
        if ($request->hasFile('gallery_images') || $request->has('existing_gallery_images')) {
            // Handle removed images
            if ($request->has('removed_gallery_images')) {
                $removedImages = $request->input('removed_gallery_images', []);
                foreach ($removedImages as $removedImageId) {
                    $image = \App\Models\Image::find($removedImageId);
                    if ($image) {
                        $this->imageService->detachImage($image, $project, 'gallery');
                    }
                }
            }

            // Add new gallery images
            if ($request->hasFile('gallery_images')) {
                $galleryCount = $project->galleryImages()->count();
                $uploadErrors = [];

                foreach ($request->file('gallery_images') as $index => $file) {
                    try {
                        // Validate individual file
                        if (!$file->isValid()) {
                            $uploadErrors["gallery_images.{$index}"] = ["The gallery_images.{$index} file is invalid."];
                            continue;
                        }

                        $image = $this->imageService->uploadImage(
                            $file,
                            $projectTitle . ' - Gallery ' . ($galleryCount + $index + 1),
                            'projects',
                            $projectTitle
                        );
                        $this->imageService->attachImage($image, $project, 'gallery', $galleryCount + $index);
                    } catch (\Exception $e) {
                        $uploadErrors["gallery_images.{$index}"] = ["The gallery_images.{$index} failed to upload: " . $e->getMessage()];
                    }
                }

                // If there were upload errors, return them
                if (!empty($uploadErrors)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Some gallery images failed to upload',
                        'errors' => $uploadErrors
                    ], 422);
                }
            }
        }

        $project->update($data);

        $project->load(['mainImage', 'renderImage', 'galleryImages']);

        return $this->success(new AdminProjectResource($project), 'Project updated');
    } catch (\Exception $e) {
        return $this->error('Failed to update project: ' . $e->getMessage(), 500);
    }
}

/**
     * Set featured projects (up to 3)
     */
    public function setFeaturedProjects(Request $request)
    {
        try {
            $request->validate([
                'project_ids' => 'required|array|max:3',
                'project_ids.*' => 'required|integer|exists:projects,id',
            ]);

            // Reset all projects' featured status and order
            Projects::query()->update([
                'is_featured' => false,
                'featured_order' => null
            ]);

            // Set selected projects as featured with order preserved
            if (!empty($request->project_ids)) {
                foreach ($request->project_ids as $index => $projectId) {
                    Projects::where('id', $projectId)->update([
                        'is_featured' => true,
                        'featured_order' => $index + 1 // Order starts from 1
                    ]);
                }
            }

            // Return projects in the order they were submitted
            $updatedProjects = collect($request->project_ids)
                ->map(function ($id) {
                    return Projects::with(['mainImage', 'renderImage', 'galleryImages'])->find($id);
                })
                ->filter(); // Remove any null values

            return $this->success(
                AdminProjectResource::collection($updatedProjects),
                'Featured projects updated successfully'
            );
        } catch (\Exception $e) {
            return $this->error('Failed to update featured projects: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Set homepage projects (up to 3)
     */
    public function setHomepageProjects(Request $request)
    {
        try {
            $request->validate([
                'project_ids' => 'required|array|max:3',
                'project_ids.*' => 'required|integer|exists:projects,id',
            ]);

            // Reset all projects' homepage status and order
            Projects::query()->update([
                'is_onHomepage' => false,
                'homepage_order' => null
            ]);

            // Set selected projects as homepage with order preserved
            if (!empty($request->project_ids)) {
                foreach ($request->project_ids as $index => $projectId) {
                    Projects::where('id', $projectId)->update([
                        'is_onHomepage' => true,
                        'homepage_order' => $index + 1 // Order starts from 1
                    ]);
                }
            }

            // Return projects in the order they were submitted
            $updatedProjects = collect($request->project_ids)
                ->map(function ($id) {
                    return Projects::with(['mainImage', 'renderImage', 'galleryImages'])->find($id);
                })
                ->filter(); // Remove any null values

            return $this->success(
                AdminProjectResource::collection($updatedProjects),
                'Homepage projects updated successfully'
            );
        } catch (\Exception $e) {
            return $this->error('Failed to update homepage projects: ' . $e->getMessage(), 500);
        }
    }

}
