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
        Schema::create('images', function (Blueprint $table) {
            $table->id();
            $table->string('filename'); // Original filename
            $table->string('path'); // Storage path
            $table->string('title'); // Image title
            $table->string('project')->nullable(); // Project name
            $table->string('alt_text')->nullable(); // Alt text for accessibility
            $table->string('category')->nullable(); // For gallery categorization
            $table->boolean('is_active')->default(true); // Soft delete alternative
            $table->timestamps();

            // Indexes for better performance
            $table->index(['category', 'is_active']);
            $table->index('project');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('images');
    }
};
