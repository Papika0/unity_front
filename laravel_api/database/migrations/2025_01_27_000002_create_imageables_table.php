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
        Schema::create('imageables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('image_id')->constrained()->onDelete('cascade');
            $table->morphs('imageable'); // imageable_id and imageable_type (creates its own index)
            $table->string('type')->default('gallery'); // main, gallery, render, etc.
            $table->integer('sort_order')->default(0); // For ordering within the same type
            $table->timestamps();

            // Additional indexes for better performance
            $table->index(['image_id', 'type']);
            $table->index('sort_order');

            // Prevent duplicate relationships
            $table->unique(['image_id', 'imageable_id', 'imageable_type', 'type'], 'unique_image_relationship');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imageables');
    }
};
