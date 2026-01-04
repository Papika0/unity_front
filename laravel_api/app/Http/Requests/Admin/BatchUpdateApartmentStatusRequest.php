<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BatchUpdateApartmentStatusRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'apartment_ids' => ['required', 'array', 'min:1'],
            'apartment_ids.*' => ['required', 'integer', 'exists:apartments,id'],
            'status' => ['required', Rule::in(['available', 'reserved', 'sold'])],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'apartment_ids.required' => 'Apartment IDs are required',
            'apartment_ids.array' => 'Apartment IDs must be an array',
            'apartment_ids.min' => 'At least one apartment must be selected',
            'apartment_ids.*.integer' => 'Each apartment ID must be an integer',
            'apartment_ids.*.exists' => 'One or more apartments do not exist',
            'status.required' => 'Status is required',
            'status.in' => 'Status must be: available, reserved, or sold',
        ];
    }
}
