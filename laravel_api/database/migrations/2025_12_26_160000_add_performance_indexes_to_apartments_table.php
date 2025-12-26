<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds composite indexes to improve apartment listing query performance.
     * These indexes support the common filter combinations used on the apartments page.
     */
    public function up(): void
    {
        Schema::table('apartments', function (Blueprint $table) {
            // Index for filter by bedrooms (commonly filtered)
            $table->index('bedrooms', 'idx_apartments_bedrooms');

            // Index for price range filtering
            $table->index('price', 'idx_apartments_price');

            // Index for area filtering
            $table->index('area_total', 'idx_apartments_area');

            // Composite index for common listing query pattern
            // (is_active + status + created_at for sorting)
            $table->index(['is_active', 'status', 'created_at'], 'idx_apartments_listing');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('apartments', function (Blueprint $table) {
            $table->dropIndex('idx_apartments_bedrooms');
            $table->dropIndex('idx_apartments_price');
            $table->dropIndex('idx_apartments_area');
            $table->dropIndex('idx_apartments_listing');
        });
    }
};
