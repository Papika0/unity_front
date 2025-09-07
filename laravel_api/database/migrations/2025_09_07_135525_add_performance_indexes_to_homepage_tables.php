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
            // Composite index for homepage queries
            $table->index(['is_active', 'created_at'], 'projects_active_created_idx');
            
            // Index for featured projects
            $table->index(['is_active', 'is_featured', 'created_at'], 'projects_active_featured_idx');
            
            // Index for homepage projects
            $table->index(['is_active', 'is_onHomepage', 'created_at'], 'projects_active_homepage_idx');
        });

        Schema::table('news', function (Blueprint $table) {
            // Composite index for news queries
            $table->index(['is_active', 'is_featured', 'created_at'], 'news_active_featured_idx');
        });

        Schema::table('translations', function (Blueprint $table) {
            // Composite index for translation queries
            $table->index(['group', 'active'], 'translations_group_active_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex('projects_active_created_idx');
            $table->dropIndex('projects_active_featured_idx');
            $table->dropIndex('projects_active_homepage_idx');
        });

        Schema::table('news', function (Blueprint $table) {
            $table->dropIndex('news_active_featured_idx');
        });

        Schema::table('translations', function (Blueprint $table) {
            $table->dropIndex('translations_group_active_idx');
        });
    }
};
