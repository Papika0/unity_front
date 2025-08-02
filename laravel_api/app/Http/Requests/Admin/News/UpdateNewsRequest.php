<?php

namespace App\Http\Requests\Admin\News;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNewsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Multilingual fields
            'title.ka' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ru' => 'nullable|string|max:255',
            'excerpt.ka' => 'required|string|max:1000',
            'excerpt.en' => 'nullable|string|max:1000',
            'excerpt.ru' => 'nullable|string|max:1000',
            'content.ka' => 'required|string',
            'content.en' => 'nullable|string',
            'content.ru' => 'nullable|string',

            // News details
            'category' => 'required|in:company,project,industry,event',
            'publish_date' => 'nullable|date',
            'is_active' => 'required|in:0,1,false,true',
            'is_featured' => 'required|in:0,1,false,true',

            // Images
            'main_image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'file|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'existing_gallery_images' => 'nullable|array',
            'existing_gallery_images.*' => 'string|url',

            // Tags
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',

            // SEO
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.ka.required' => 'Georgian title is required.',
            'excerpt.ka.required' => 'Georgian excerpt is required.',
            'content.ka.required' => 'Georgian content is required.',
            'category.required' => 'Category is required.',
            'category.in' => 'Category must be one of: company, project, industry, event.',
            'main_image.image' => 'Main image must be an image file.',
            'main_image.mimes' => 'Main image must be jpeg, png, jpg, gif, or webp.',
            'main_image.max' => 'Main image must not exceed 10MB.',
            'gallery_images.*.image' => 'All gallery images must be image files.',
            'gallery_images.*.mimes' => 'Gallery images must be jpeg, png, jpg, gif, or webp.',
            'gallery_images.*.max' => 'Gallery images must not exceed 10MB each.',
        ];
    }
}
