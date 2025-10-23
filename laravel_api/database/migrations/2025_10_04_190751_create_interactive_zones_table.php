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
        Schema::create('interactive_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->enum('zone_type', ['building_block', 'floor_strip', 'apartment_unit']);
            $table->foreignId('parent_zone_id')->nullable()->constrained('interactive_zones')->onDelete('cascade');
            $table->unsignedBigInteger('entity_id')->comment('ID of the building or apartment');
            $table->string('entity_type')->comment('building or apartment');
            $table->json('svg_coordinates')->comment('Array of [x,y] coordinate pairs');
            $table->json('bounding_box')->comment('{min_x, min_y, max_x, max_y}');
            $table->json('display_config')->comment('{label, fill_color, stroke_color, hover_color}');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index(['zone_type', 'entity_type', 'entity_id'], 'idx_zones_lookup');
            $table->index('parent_zone_id', 'idx_zones_parent');
            $table->index(['project_id', 'zone_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interactive_zones');
    }
};
