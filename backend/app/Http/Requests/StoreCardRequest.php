<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCardRequest extends FormRequest
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
            'name'        => ['required', 'string', 'min:1', 'max:255'],
            'elements'    => ['nullable', 'array'],
            'backgrounds' => ['nullable', 'array'],
            'meta'        => ['nullable', 'array'],
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
