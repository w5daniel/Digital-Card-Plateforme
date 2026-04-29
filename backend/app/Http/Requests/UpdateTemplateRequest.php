<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => ['sometimes', 'required', 'string', 'min:1', 'max:255'],
            'meta'         => ['sometimes', 'nullable', 'array'],
            'field_config' => ['sometimes', 'nullable', 'array'],
            'is_public'    => ['sometimes', 'nullable', 'boolean'],
            'is_auto'      => ['sometimes', 'nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le titre du template est requis.',
            'name.max'      => 'Le titre ne peut pas dépasser 255 caractères.',
        ];
    }
}
