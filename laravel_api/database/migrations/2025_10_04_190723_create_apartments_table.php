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
        Schema::create('apartments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('building_id')->constrained('buildings')->onDelete('cascade');
            $table->integer('floor_number');
            $table->string('apartment_number');
            $table->enum('status', ['available', 'reserved', 'sold'])->default('available');
            $table->decimal('price', 12, 2)->nullable();
            $table->decimal('area_total', 8, 2)->nullable()->comment('Total area in square meters');
            $table->decimal('area_living', 8, 2)->nullable()->comment('Living area in square meters');
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->boolean('has_balcony')->default(false);
            $table->boolean('has_parking')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index(['project_id', 'building_id', 'floor_number', 'status'], 'idx_apartments_lookup');
            $table->index(['status', 'is_active'], 'idx_apartments_status');
            $table->unique(['building_id', 'floor_number', 'apartment_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apartments');
    }
};
