<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds unique constraint to prevent duplicate calculator-generated payments
     * for the same deal and installment number.
     */
    public function up(): void
    {
        // First, remove any existing duplicates before adding the constraint
        // Keep the oldest record (MIN id) for each duplicate group
        DB::statement("
            DELETE FROM crm_payments
            WHERE id NOT IN (
                SELECT * FROM (
                    SELECT MIN(id)
                    FROM crm_payments
                    GROUP BY deal_id, calculator_generated, installment_number
                ) AS keeper_ids
            )
        ");

        Schema::table('crm_payments', function (Blueprint $table) {
            // Add unique index to prevent duplicate calculator-generated payments
            // Only applies to calculator-generated payments with the same installment number
            $table->unique(
                ['deal_id', 'calculator_generated', 'installment_number'],
                'unique_calculator_payment_per_installment'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_payments', function (Blueprint $table) {
            $table->dropUnique('unique_calculator_payment_per_installment');
        });
    }
};
