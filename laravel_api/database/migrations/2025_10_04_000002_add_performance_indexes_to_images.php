<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Add performance indexes for optimized image queries
     */
    public function up(): void
    {
        Schema::table('images', function (Blueprint $table) {
            // Composite index for common query patterns
            $table->index(['is_active', 'category', 'created_at'], 'idx_images_active_category_created');
            
            // Index for project filtering
            $table->index('project', 'idx_images_project');
        });

        Schema::table('imageables', function (Blueprint $table) {
            // Composite index for polymorphic queries with type
            $table->index(['imageable_type', 'imageable_id', 'type'], 'idx_imageables_morph_type');
            
            // Index for sorting
            $table->index('sort_order', 'idx_imageables_sort');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->dropIndex('idx_images_active_category_created');
            $table->dropIndex('idx_images_project');
        });

        Schema::table('imageables', function (Blueprint $table) {
            $table->dropIndex('idx_imageables_morph_type');
            $table->dropIndex('idx_imageables_sort');
        });
    }
};
