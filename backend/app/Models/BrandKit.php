<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BrandKit extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'colors', 'fonts', 'logo_url'];

    protected function casts(): array
    {
        return [
            'colors' => 'array',
            'fonts'  => 'json',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function logoUrl(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? url('storage/' . $value) : null,
        );
    }
}
