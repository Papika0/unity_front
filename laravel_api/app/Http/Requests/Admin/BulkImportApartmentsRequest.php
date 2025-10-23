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
            'file' => ['required', 'file', 'mimes:csv,xlsx,xls', 'max:10240'], // 10MB max
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Please upload a file',
            'file.mimes' => 'File must be CSV or Excel format',
            'file.max' => 'File size must not exceed 10MB',
        ];
    }
}
