<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Template extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'elements',
        'backgrounds',
        'is_gallery',
        'is_public',
        'is_premium',
        'is_auto',
        'category',
        'slug',
        'meta',
        'field_config',
    ];

    protected function casts(): array
    {
        return [
            'elements'     => 'array',
            'backgrounds'  => 'array',
            'meta'         => 'array',
            'field_config' => 'array',
            'is_gallery'   => 'boolean',
            'is_public'    => 'boolean',
            'is_premium'   => 'boolean',
            'is_auto'      => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
