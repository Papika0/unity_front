<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBuildingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Should check admin permission in middleware
    }

    public function rules(): array
    {
        $projectId = $this->route('projectId');
        $buildingId = $this->route('buildingId');

        return [
            'name' => ['sometimes', 'array'],
            'name.ka' => ['required_with:name', 'string', 'max:255'],
            'name.en' => ['nullable', 'string', 'max:255'],
            'name.ru' => ['nullable', 'string', 'max:255'],
            'identifier' => [
                'sometimes',
                'string',
                'max:50',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('buildings', 'identifier')
                    ->where('project_id', $projectId)
                    ->ignore($buildingId),
            ],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.ka.required_with' => 'Georgian name is required when updating name',
            'identifier.unique' => 'This identifier already exists for this project',
            'identifier.regex' => 'Identifier can only contain lowercase letters, numbers, and hyphens',
        ];
    }
}
