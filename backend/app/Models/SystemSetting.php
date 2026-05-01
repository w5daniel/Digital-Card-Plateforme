<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = ['data'];

    protected $casts = ['data' => 'array'];

    private static array $defaults = [
        'maxCardsPerUser'    => 3,
        'maxCardsPerPremium' => 50,
        'allowRegistration'  => true,
        'allowGallery'       => true,
        'maintenanceMode'    => false,
        'appName'            => 'ECODEV Cartes Digitales',
        'supportEmail'       => 'internship@ecodev.dev',
    ];

    public static function instance(): self
    {
        $setting = static::first();

        if (!$setting) {
            $setting = static::create(['data' => static::$defaults]);
        }

        return $setting;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $data = static::instance()->data;
        return $data[$key] ?? $default;
    }

    public function mergedData(): array
    {
        return array_merge(static::$defaults, $this->data ?? []);
    }
}
