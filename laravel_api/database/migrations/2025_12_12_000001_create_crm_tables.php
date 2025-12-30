<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. CRM Stages (Kanban Columns)
        Schema::create('crm_stages', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Georgian name for UI
            $table->string('slug')->unique(); // Internal identifier
            $table->enum('type', ['open', 'won', 'lost'])->default('open');
            $table->integer('sort_order')->default(0);
            $table->string('color', 7)->default('#cbd5e1'); // Hex code for UI

            // Automation Flags
            $table->boolean('locks_apartment')->default(false); // If true, apartment becomes 'reserved'
            $table->integer('days_until_stale')->nullable(); // If set, card turns RED after X days of inactivity
            $table->boolean('requires_apartment')->default(false); // Must have apartment_id to enter this stage
            $table->boolean('requires_lost_reason')->default(false); // Must have lost_reason to enter this stage
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });

        // 2. Lost Reasons (Why did we lose the deal?)
        Schema::create('crm_lost_reasons', function (Blueprint $table) {
            $table->id();
            $table->string('label'); // Georgian label for UI
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. CRM Deals (The Main Transaction Ticket)
        Schema::create('crm_deals', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Assigned Marketing Agent
            $table->foreignId('apartment_id')->nullable()->constrained('apartments')->nullOnDelete();
            $table->foreignId('stage_id')->constrained('crm_stages');
            $table->foreignId('lost_reason_id')->nullable()->constrained('crm_lost_reasons')->nullOnDelete();

            // Deal Info
            $table->string('title'); // e.g., "გიორგი ბერიძე - ახალი ლიდი"
            $table->decimal('budget', 15, 2)->nullable(); // Client's stated budget
            $table->decimal('agreed_price', 15, 2)->nullable(); // Final negotiated price
            $table->string('currency', 3)->default('USD'); // USD, GEL, EUR
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');

            // Tracking Dates
            $table->date('expected_close_date')->nullable();
            $table->timestamp('last_activity_at')->useCurrent(); // Updates on every activity
            $table->timestamp('closed_at')->nullable(); // When won or lost

            // Notes
            $table->text('notes')->nullable(); // Quick notes field

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['stage_id', 'user_id']);
            $table->index(['customer_id']);
            $table->index(['apartment_id']);
            $table->index(['last_activity_at']);
            $table->index(['closed_at']);
        });

        // 4. CRM Activities (Timeline: Notes, Calls, Status Changes)
        Schema::create('crm_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deal_id')->constrained('crm_deals')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Who performed it

            $table->enum('type', [
                'note',           // Manual note
                'call',           // Phone call log
                'email',          // Email sent
                'meeting',        // Site visit / in-person meeting
                'status_change',  // Auto-logged when stage changes
                'payment',        // Auto-logged when payment received
                'system'          // System-generated messages
            ])->default('note');

            $table->text('content'); // The note or description
            $table->json('metadata')->nullable(); // Extra data (e.g., old_stage, new_stage for status_change)

            // Scheduling (for future tasks/reminders)
            $table->timestamp('scheduled_at')->nullable(); // When this task should be done
            $table->timestamp('completed_at')->nullable(); // When it was completed

            $table->timestamps();

            // Indexes
            $table->index(['deal_id', 'created_at']);
            $table->index(['type']);
        });

        // 5. CRM Payments (Financial Schedule & Tracking)
        Schema::create('crm_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deal_id')->constrained('crm_deals')->onDelete('cascade');

            $table->string('title'); // "საწყისი შენატანი", "განვადება #1"
            $table->integer('installment_number')->nullable(); // 1, 2, 3... for ordering
            $table->decimal('amount_due', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->date('due_date');

            // Payment Status
            $table->decimal('amount_paid', 15, 2)->default(0); // Allows partial payments
            $table->date('paid_date')->nullable();
            $table->enum('status', [
                'pending',
                'paid',
                'overdue',
                'partially_paid',
                'cancelled'
            ])->default('pending');

            $table->string('payment_method')->nullable(); // Bank Transfer, Cash, Card
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['deal_id', 'due_date']);
            $table->index(['status']);
            $table->index(['due_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_payments');
        Schema::dropIfExists('crm_activities');
        Schema::dropIfExists('crm_deals');
        Schema::dropIfExists('crm_lost_reasons');
        Schema::dropIfExists('crm_stages');
    }
};
