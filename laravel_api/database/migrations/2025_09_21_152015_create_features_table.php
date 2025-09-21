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
        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Feature name (e.g., 'location', 'quality')
            $table->json('title'); // Multilingual title
            $table->json('description'); // Multilingual description
            $table->string('icon'); // Icon (emoji or icon class)
            $table->string('color'); // Tailwind color classes
            $table->json('keywords'); // Keywords for auto-detection
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('features');
    }
};
