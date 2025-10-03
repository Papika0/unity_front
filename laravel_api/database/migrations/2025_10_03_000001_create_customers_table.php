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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('subject')->nullable();
            $table->text('message')->nullable();
            $table->enum('source', ['contact_form', 'call_request'])->default('contact_form');
            $table->enum('status', ['new', 'contacted', 'in_progress', 'completed', 'cancelled'])->default('new');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes for better performance
            $table->index('email');
            $table->index('phone');
            $table->index('status');
            $table->index('source');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
