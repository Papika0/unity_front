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
        Schema::table('apartments', function (Blueprint $table) {
            $table->string('cadastral_code')->unique()->nullable()->after('apartment_number')
                ->comment('Government real estate cadastral identifier');
            $table->decimal('summer_area', 8, 2)->nullable()->after('area_living')
                ->comment('Summer/auxiliary area (balcony, terrace) in square meters');
            $table->json('room_details')->nullable()->after('bathrooms')
                ->comment('Detailed room breakdown (bedrooms, bathrooms, etc.)');

            // Add index for cadastral code lookups
            $table->index('cadastral_code', 'idx_cadastral_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('apartments', function (Blueprint $table) {
            $table->dropIndex('idx_cadastral_code');
            $table->dropColumn(['cadastral_code', 'summer_area', 'room_details']);
        });
    }
};
