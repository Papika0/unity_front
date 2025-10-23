<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBuildingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Should check admin permission in middleware
    }

    public function rules(): array
    {
        $projectId = $this->route('projectId');

        return [
            'name' => ['required', 'array'],
            'name.ka' => ['required', 'string', 'max:255'],
            'name.en' => ['nullable', 'string', 'max:255'],
            'name.ru' => ['nullable', 'string', 'max:255'],
            'identifier' => [
                'required',
                'string',
                'max:50',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('buildings', 'identifier')
                    ->where('project_id', $projectId),
            ],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Building name is required',
            'name.ka.required' => 'Georgian name is required',
            'identifier.required' => 'Building identifier is required',
            'identifier.unique' => 'This identifier already exists for this project',
            'identifier.regex' => 'Identifier can only contain lowercase letters, numbers, and hyphens',
        ];
    }
}
