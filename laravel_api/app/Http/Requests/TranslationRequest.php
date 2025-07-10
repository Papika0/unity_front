<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class TranslationRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $translationId = $this->route('id');

        return [
            'key' => [
                'required',
                'string',
                Rule::unique('translations', 'key')->ignore($translationId),
            ],
            'text' => 'required|array',
            'text.en' => 'required|string',
            'text.ka' => 'required|string',
            'text.ru' => 'required|string',
            'group' => 'required|string',
            'active' => 'boolean',
        ];
    }
}
