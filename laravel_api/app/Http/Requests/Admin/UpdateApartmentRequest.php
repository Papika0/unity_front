<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateApartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'floor_number' => ['sometimes', 'integer', 'min:1'],
            'apartment_number' => ['sometimes', 'string', 'max:50'],
            'status' => ['sometimes', Rule::in(['available', 'reserved', 'sold'])],
            'price' => ['nullable', 'numeric', 'min:0'],
            'area_total' => ['nullable', 'numeric', 'min:0'],
            'area_living' => ['nullable', 'numeric', 'min:0'],
            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'has_balcony' => ['sometimes', 'boolean'],
            'has_parking' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Status must be: available, reserved, or sold',
        ];
    }
}
