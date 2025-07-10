<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->json('title');
            $table->json('description');
            $table->json('location');                          // ← was string, now JSON
            $table->enum('status', ['planning','ongoing','completed'])->default('ongoing');
            $table->date('start_date')->nullable();
            $table->date('completion_date')->nullable();
            $table->string('main_image');
            $table->string('render_image');
            $table->json('gallery_images')->nullable();
            $table->year('year');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
