<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($this->user()->id)],
            'title' => ['nullable', 'string', 'min:2', 'max:255'],
            'bio'   => ['nullable', 'string', 'max:200'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'Le nom est requis.',
            'name.min'       => 'Le nom doit contenir au moins 2 caractères.',
            'email.required' => "L'email est requis.",
            'email.email'    => "Le format de l'email est invalide.",
            'email.unique'   => 'Cet email est déjà utilisé par un autre compte.',
            'title.min'      => 'Le titre doit contenir au moins 2 caractères.',
            'bio.max'        => 'La bio ne peut pas dépasser 200 caractères.',
        ];
    }
}
