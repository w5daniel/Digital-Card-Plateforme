<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCardRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => ['sometimes', 'required', 'string', 'min:1', 'max:255'],
            'elements'    => ['sometimes', 'nullable', 'array'],
            'backgrounds' => ['sometimes', 'nullable', 'array'],
            'meta'        => ['sometimes', 'nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le titre de la carte est requis.',
            'name.max'      => 'Le titre ne peut pas dépasser 255 caractères.',
        ];
    }
}
