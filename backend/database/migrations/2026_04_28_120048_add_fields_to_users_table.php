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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->after('email');
            $table->boolean('is_banned')->default(false)->after('role');
            $table->boolean('is_premium')->default(false)->after('is_banned');
            $table->timestamp('premium_expires_at')->nullable()->after('is_premium');
            $table->string('avatar_url')->nullable()->after('premium_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_banned', 'is_premium', 'premium_expires_at', 'avatar_url']);
        });
    }
};
