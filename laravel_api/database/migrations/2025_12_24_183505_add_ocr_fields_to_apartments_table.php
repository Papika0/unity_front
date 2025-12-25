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
            $table->decimal('ocr_confidence', 5, 2)->nullable()->after('apartment_number')
                ->comment('OCR confidence score (0.00-1.00)');
            $table->json('ocr_text_position')->nullable()->after('ocr_confidence')
                ->comment('[x, y] position of text in floor plan (percentage)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('apartments', function (Blueprint $table) {
            $table->dropColumn(['ocr_confidence', 'ocr_text_position']);
        });
    }
};
