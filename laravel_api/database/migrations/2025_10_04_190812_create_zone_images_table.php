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
        Schema::create('zone_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->nullable()->constrained('interactive_zones')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->enum('level_type', ['overview', 'building', 'floor']);
            $table->foreignId('building_id')->nullable()->constrained('buildings')->onDelete('cascade');
            $table->integer('floor_number')->nullable();
            $table->enum('image_type', ['background', 'overlay', 'thumbnail']);
            $table->string('viewbox')->comment('SVG viewBox attribute e.g., "0 0 1512 1046"');
            $table->integer('width');
            $table->integer('height');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index(['project_id', 'level_type', 'building_id', 'floor_number'], 'idx_zone_images_level');
            $table->index(['zone_id', 'image_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zone_images');
    }
};
