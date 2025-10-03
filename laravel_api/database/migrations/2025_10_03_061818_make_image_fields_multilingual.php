<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop any existing indexes on these columns
        Schema::table('images', function (Blueprint $table) {
            $table->dropIndex('images_project_index');
            $table->dropIndex('idx_images_project');
        });
        
        // Use raw SQL to convert columns to JSON
        DB::statement('ALTER TABLE images MODIFY title JSON NULL');
        DB::statement('ALTER TABLE images MODIFY alt_text JSON NULL');
        DB::statement('ALTER TABLE images MODIFY project JSON NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to TEXT fields (more flexible than VARCHAR for potentially long content)
        DB::statement('ALTER TABLE images MODIFY title TEXT NULL');
        DB::statement('ALTER TABLE images MODIFY alt_text TEXT NULL');
        DB::statement('ALTER TABLE images MODIFY project TEXT NULL');
    }
};
