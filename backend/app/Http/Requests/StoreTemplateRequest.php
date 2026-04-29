<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'min:1', 'max:255'],
            'meta'         => ['nullable', 'array'],
            'field_config' => ['nullable', 'array'],
            'is_public'    => ['nullable', 'boolean'],
            'is_auto'      => ['nullable', 'boolean'],
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
