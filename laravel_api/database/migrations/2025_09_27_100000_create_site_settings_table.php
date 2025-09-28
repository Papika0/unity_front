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
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->index();
            $table->json('value');
            $table->string('group')->default('general')->index();
            $table->boolean('is_translatable')->default(false);
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();

            // Ensure unique key per group
            $table->unique(['key', 'group']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};