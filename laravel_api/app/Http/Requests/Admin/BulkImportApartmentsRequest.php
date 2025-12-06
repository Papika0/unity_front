<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BulkImportApartmentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['nullable', 'file', 'mimes:csv,xlsx,xls', 'max:10240'], // 10MB max
            'apartments' => ['nullable', 'array', 'min:1'],
            'apartments.*.Individual cadastral code of real estate (if any)' => ['nullable', 'string'],
            'apartments.*.Area status' => ['nullable', 'string'],
            'apartments.*.Living space' => ['required_with:apartments', 'numeric', 'min:0'],
            'apartments.*.Summer/auxiliary area' => ['nullable', 'numeric', 'min:0'],
            'apartments.*.Total area' => ['required_with:apartments', 'numeric', 'min:0'],
            'apartments.*.Floor' => ['required_with:apartments', 'integer', 'min:1'],
            'apartments.*.Number of bedrooms' => ['required_with:apartments', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimes' => 'File must be CSV or Excel format',
            'file.max' => 'File size must not exceed 10MB',
            'apartments.required_without' => 'Please provide either a file upload or JSON data',
            'apartments.*.Living space.required_with' => 'Living space is required for each apartment',
            'apartments.*.Total area.required_with' => 'Total area is required for each apartment',
            'apartments.*.Floor.required_with' => 'Floor number is required for each apartment',
            'apartments.*.Number of bedrooms.required_with' => 'Number of bedrooms is required for each apartment',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Ensure at least one input method is provided
        if (!$this->hasFile('file') && !$this->has('apartments')) {
            $this->merge(['_validation_error' => true]);
        }
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$this->hasFile('file') && !$this->has('apartments')) {
                $validator->errors()->add('file', 'Please provide either a file upload or JSON data');
            }
        });
    }
}
