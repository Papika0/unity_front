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
        Schema::table('features', function (Blueprint $table) {
            // Update title and description to include Russian
            $table->json('title')->change();
            $table->json('description')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('features', function (Blueprint $table) {
            // Revert back to original structure if needed
            $table->json('title')->change();
            $table->json('description')->change();
        });
    }
};