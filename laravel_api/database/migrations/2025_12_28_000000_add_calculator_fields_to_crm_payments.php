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
        Schema::table('crm_payments', function (Blueprint $table) {
            // Flag to distinguish calculator-generated vs manual payments
            $table->boolean('calculator_generated')->default(false)->after('deal_id');

            // Transaction reference for payment tracking
            $table->string('transaction_reference', 255)->nullable()->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_payments', function (Blueprint $table) {
            $table->dropColumn(['calculator_generated', 'transaction_reference']);
        });
    }
};
