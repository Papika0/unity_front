<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * IMPORTANT: Before running this migration:
     * 1. Verify all images are properly linked in the imageables table
     * 2. Run: php artisan images:cleanup-orphans --dry-run
     * 3. Create a database backup
     * 4. Test on staging environment first
     */
    public function up(): void
    {
        // Remove redundant URL columns from news table
        Schema::table('news', function (Blueprint $table) {
            $table->dropColumn(['main_image', 'gallery_images']);
        });

        // Remove redundant URL columns from projects table
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['main_image', 'render_image', 'gallery_images']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore columns in news table
        Schema::table('news', function (Blueprint $table) {
            $table->string('main_image')->nullable()->after('category');
            $table->json('gallery_images')->nullable()->after('main_image');
        });

        // Restore columns in projects table
        Schema::table('projects', function (Blueprint $table) {
            $table->string('main_image')->after('completion_date');
            $table->string('render_image')->after('main_image');
            $table->json('gallery_images')->nullable()->after('render_image');
        });
    }
};
