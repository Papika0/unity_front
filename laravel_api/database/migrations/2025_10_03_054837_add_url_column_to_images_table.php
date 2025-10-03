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
        Schema::table('images', function (Blueprint $table) {
            // Add url column for external/placeholder images
            $table->text('url')->nullable()->after('path');
            
            // Make filename and path nullable since we can now use url instead
            $table->string('filename')->nullable()->change();
            $table->string('path')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            // Remove url column
            $table->dropColumn('url');
            
            // Make filename and path required again
            $table->string('filename')->nullable(false)->change();
            $table->string('path')->nullable(false)->change();
        });
    }
};
