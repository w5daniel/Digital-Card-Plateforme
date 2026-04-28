<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'min:2', 'max:255', 'regex:/^[^\d]+$/u'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'      => 'Le nom est requis.',
            'name.min'           => 'Le nom doit contenir au moins 2 caractères.',
            'name.regex'         => 'Le nom ne doit pas contenir de chiffres.',
            'email.required'     => "L'email est requis.",
            'email.email'        => "Le format de l'email est invalide.",
            'email.unique'       => 'Un compte existe déjà avec cet email.',
            'password.required'  => 'Le mot de passe est requis.',
            'password.min'       => 'Le mot de passe doit contenir au moins 6 caractères.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
        ];
    }
}
