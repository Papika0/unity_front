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
        // Add about page images to site_settings config
        // This will be handled in the SiteSettingsService
        // No database changes needed as about info is stored in config
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No rollback needed for config changes
    }
};
