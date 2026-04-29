<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Card extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'title',
        'elements',
        'backgrounds',
        'is_public',
        'share_slug',
        'views',
        'downloads',
        'qr_scans',
        'shares',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'elements'    => 'array',
            'backgrounds' => 'array',
            'meta'        => 'array',
            'is_public'   => 'boolean',
            'views'       => 'integer',
            'downloads'   => 'integer',
            'qr_scans'    => 'integer',
            'shares'      => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
