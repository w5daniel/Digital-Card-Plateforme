<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->boolean('is_public')->default(false)->after('backgrounds');
            $table->unsignedBigInteger('views')->default(0)->after('share_slug');
            $table->unsignedBigInteger('downloads')->default(0)->after('views');
            $table->unsignedBigInteger('qr_scans')->default(0)->after('downloads');
            $table->unsignedBigInteger('shares')->default(0)->after('qr_scans');
            $table->json('meta')->nullable()->after('shares');
        });
    }

    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->dropColumn(['is_public', 'views', 'downloads', 'qr_scans', 'shares', 'meta']);
        });
    }
};
