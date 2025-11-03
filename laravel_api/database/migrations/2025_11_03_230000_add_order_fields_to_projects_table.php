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
        Schema::table('projects', function (Blueprint $table) {
            $table->integer('featured_order')->nullable()->after('is_featured');
            $table->integer('homepage_order')->nullable()->after('is_onHomepage');

            // Add indexes for better query performance
            $table->index(['is_featured', 'featured_order']);
            $table->index(['is_onHomepage', 'homepage_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['is_featured', 'featured_order']);
            $table->dropIndex(['is_onHomepage', 'homepage_order']);
            $table->dropColumn(['featured_order', 'homepage_order']);
        });
    }
};
