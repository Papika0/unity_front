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
                $project->update(['main_image' => $image->full_url]);
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
                $project->update(['render_image' => $image->full_url]);
            }

            // Handle gallery images upload
            if ($request->hasFile('gallery_images')) {
                $galleryImages = [];
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
                        $galleryImages[] = $image->full_url;
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

                $project->update(['gallery_images' => $galleryImages]);
            }

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
            // Detach old main image
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
            $data['main_image'] = $image->full_url;
        }

        if ($request->hasFile('render_image')) {
            // Detach old render image
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
            $data['render_image'] = $image->full_url;
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
                        $finalGalleryImages[] = $image->full_url;
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

            // Handle removed images
            if ($request->has('removed_gallery_images')) {
                $removedImages = $request->input('removed_gallery_images', []);
                foreach ($removedImages as $removedImageUrl) {
                    $image = \App\Models\Image::where('url', $removedImageUrl)->first();
                    if ($image) {
                        $this->imageService->detachImage($image, $project, 'gallery');
                    }
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

            // Reset all projects' featured status
            Projects::query()->update(['is_featured' => false]);

            // Set selected projects as featured
            if (!empty($request->project_ids)) {
                Projects::whereIn('id', $request->project_ids)->update(['is_featured' => true]);
            }

            $updatedProjects = Projects::whereIn('id', $request->project_ids)->get();

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

            // Reset all projects' homepage status
            Projects::query()->update(['is_onHomepage' => false]);

            // Set selected projects as homepage
            if (!empty($request->project_ids)) {
                Projects::whereIn('id', $request->project_ids)->update(['is_onHomepage' => true]);
            }

            $updatedProjects = Projects::whereIn('id', $request->project_ids)->get();

            return $this->success(
                AdminProjectResource::collection($updatedProjects),
                'Homepage projects updated successfully'
            );
        } catch (\Exception $e) {
            return $this->error('Failed to update homepage projects: ' . $e->getMessage(), 500);
        }
    }

}
