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
        Schema::table('interactive_zones', function (Blueprint $table) {
            // Add level_type to distinguish between overview/building/floor levels
            $table->enum('level_type', ['overview', 'building', 'floor'])
                  ->after('zone_type')
                  ->default('overview')
                  ->comment('Hierarchy level: overview (site plan), building (floor strips), floor (apartments)');
            
            // Add building_id for filtering zones by building
            $table->foreignId('building_id')
                  ->nullable()
                  ->after('entity_type')
                  ->constrained('buildings')
                  ->onDelete('cascade')
                  ->comment('Reference to building for floor strips and apartments');
            
            // Add floor_number for filtering zones by floor
            $table->integer('floor_number')
                  ->nullable()
                  ->after('building_id')
                  ->comment('Floor number for apartment zones');
            
            // Add indexes for performance
            $table->index(['project_id', 'zone_type', 'building_id'], 'idx_zones_building');
            $table->index(['project_id', 'building_id', 'floor_number'], 'idx_zones_floor');
            $table->index(['level_type', 'zone_type'], 'idx_zones_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('interactive_zones', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex('idx_zones_building');
            $table->dropIndex('idx_zones_floor');
            $table->dropIndex('idx_zones_level');
            
            // Drop foreign key constraint
            $table->dropForeign(['building_id']);
            
            // Drop columns
            $table->dropColumn(['level_type', 'building_id', 'floor_number']);
        });
    }
};
