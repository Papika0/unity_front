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
        Schema::create('bank_rates', function (Blueprint $table) {
            $table->id();
            $table->json('bank_name'); // Translatable: {ka: '', en: '', ru: ''}
            $table->decimal('interest_rate', 5, 2); // Example: 12.50%
            $table->unsignedTinyInteger('min_loan_term_years')->default(1); // Minimum loan term in years
            $table->unsignedTinyInteger('max_loan_term_years')->default(30); // Maximum loan term in years
            $table->unsignedTinyInteger('min_down_payment_percent')->default(20); // Minimum down payment percent
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_rates');
    }
};
