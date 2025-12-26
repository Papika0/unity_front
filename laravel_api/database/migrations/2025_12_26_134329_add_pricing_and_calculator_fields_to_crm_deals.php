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
        Schema::table('crm_deals', function (Blueprint $table) {
            // Offered Price (Negotiation)
            $table->decimal('offered_price_per_sqm', 15, 2)->nullable();
            $table->decimal('offered_price_total', 15, 2)->nullable();
            $table->timestamp('offered_at')->nullable();

            // Reserved Price (Contract/Reserved)
            $table->decimal('reserved_price_per_sqm', 15, 2)->nullable();
            $table->decimal('reserved_price_total', 15, 2)->nullable();
            $table->timestamp('reserved_at')->nullable();

            // Final Price (Sold/Won)
            $table->decimal('final_price_per_sqm', 15, 2)->nullable();
            $table->decimal('final_price_total', 15, 2)->nullable();
            $table->timestamp('final_at')->nullable();

            // Calculator Integration
            $table->tinyInteger('selected_payment_alternative')->nullable()->comment('1-6');
            $table->json('payment_alternative_params')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_deals', function (Blueprint $table) {
            $table->dropColumn([
                'offered_price_per_sqm',
                'offered_price_total',
                'offered_at',
                'reserved_price_per_sqm',
                'reserved_price_total',
                'reserved_at',
                'final_price_per_sqm',
                'final_price_total',
                'final_at',
                'selected_payment_alternative',
                'payment_alternative_params'
            ]);
        });
    }
};
