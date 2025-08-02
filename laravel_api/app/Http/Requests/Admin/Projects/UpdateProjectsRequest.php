<?php

namespace App\Http\Requests\Admin\Projects;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectsRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            // Multilingual fields
            'title.ka' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ru' => 'nullable|string|max:255',
            'description.ka' => 'required|string',
            'description.en' => 'nullable|string',
            'description.ru' => 'nullable|string',
            'location.ka' => 'required|string|max:255',
            'location.en' => 'nullable|string|max:255',
            'location.ru' => 'nullable|string|max:255',
            
            // Project details
            'status' => 'required|in:planning,ongoing,completed',
            'year' => 'required|integer|min:1900|max:2100',
            'start_date' => 'required|date',
            'completion_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            
            // Images (all optional for updates)
            'main_image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'render_image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'file|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'existing_gallery_images' => 'nullable|array',
            'existing_gallery_images.*' => 'string',
        ];
    }

    public function messages()
    {
        return [
            'title.ka.required' => 'Georgian title is required.',
            'description.ka.required' => 'Georgian description is required.',
            'location.ka.required' => 'Georgian location is required.',
            'completion_date.after_or_equal' => 'Completion date must be after or equal to start date.',
        ];
    }
}
