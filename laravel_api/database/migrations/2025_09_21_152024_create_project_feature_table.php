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
        Schema::create('project_feature', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('feature_id')->constrained()->onDelete('cascade');
            $table->boolean('is_auto_detected')->default(false); // Whether feature was auto-detected
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->unique(['project_id', 'feature_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_feature');
    }
};
