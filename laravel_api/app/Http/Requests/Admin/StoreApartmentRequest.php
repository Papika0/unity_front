<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreApartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $buildingId = $this->route('buildingId');

        return [
            'floor_number' => ['required', 'integer', 'min:1'],
            'apartment_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('apartments')
                    ->where('building_id', $buildingId)
                    ->where('floor_number', $this->input('floor_number')),
            ],
            'status' => ['required', Rule::in(['available', 'reserved', 'sold'])],
            'price' => ['nullable', 'numeric', 'min:0'],
            'area_total' => ['nullable', 'numeric', 'min:0'],
            'area_living' => ['nullable', 'numeric', 'min:0'],
            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'has_balcony' => ['boolean'],
            'has_parking' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'floor_number.required' => 'Floor number is required',
            'apartment_number.required' => 'Apartment number is required',
            'apartment_number.unique' => 'This apartment number already exists on this floor',
            'status.in' => 'Status must be: available, reserved, or sold',
        ];
    }
}
