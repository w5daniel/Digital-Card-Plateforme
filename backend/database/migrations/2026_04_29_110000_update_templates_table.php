<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->json('elements')->nullable()->change();
            $table->json('backgrounds')->nullable()->change();
            $table->json('meta')->nullable()->after('backgrounds');
            $table->json('field_config')->nullable()->after('meta');
            $table->boolean('is_auto')->default(false)->after('field_config');
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn(['meta', 'field_config', 'is_auto']);
            $table->json('elements')->nullable(false)->change();
            $table->json('backgrounds')->nullable(false)->change();
        });
    }
};
