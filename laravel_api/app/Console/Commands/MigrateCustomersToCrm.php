<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Customer;
use App\Models\CrmDeal;
use App\Models\CrmStage;
use Illuminate\Support\Facades\DB;

class MigrateCustomersToCrm extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crm:migrate-customers 
                            {--dry-run : Show what would be migrated without actually doing it}
                            {--status=new : Only migrate customers with this status (new, contacted, in_progress, completed, cancelled, all)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate existing customers to CRM deals';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        $statusFilter = $this->option('status');

        if ($dryRun) {
            $this->info('DRY RUN MODE - No changes will be made');
            $this->newLine();
        }

        // Get the "New Lead" stage
        $newLeadStage = CrmStage::where('slug', 'new-lead')->first();
        if (!$newLeadStage) {
            $this->error('New Lead stage not found! Please run the CRM seeder first.');
            return 1;
        }

        // Map customer status to CRM stage
        $stageMapping = [
            'new' => CrmStage::where('slug', 'new-lead')->first(),
            'contacted' => CrmStage::where('slug', 'contacted')->orWhere('slug', 'qualification')->first(),
            'in_progress' => CrmStage::where('slug', 'negotiation')->first(),
            'completed' => CrmStage::where('slug', 'won')->first(),
            'cancelled' => CrmStage::where('slug', 'lost')->first(),
        ];

        // Build query
        $query = Customer::query();
        
        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        // Get customers that don't already have a deal
        $customersWithDeals = CrmDeal::pluck('customer_id')->toArray();
        $query->whereNotIn('id', $customersWithDeals);

        $customers = $query->get();

        if ($customers->isEmpty()) {
            $this->info('No customers to migrate.');
            return 0;
        }

        $this->info("Found {$customers->count()} customers to migrate.");
        $this->newLine();

        $migrated = 0;
        $errors = 0;

        $this->withProgressBar($customers, function ($customer) use ($stageMapping, $newLeadStage, $dryRun, &$migrated, &$errors) {
            try {
                // Determine the stage based on customer status
                $stage = $stageMapping[$customer->status] ?? $newLeadStage;

                if ($dryRun) {
                    $migrated++;
                    return;
                }

                DB::beginTransaction();

                // Create the CRM deal
                CrmDeal::create([
                    'customer_id' => $customer->id,
                    'stage_id' => $stage->id,
                    'title' => CrmDeal::generateTitle($customer),
                    'currency' => 'USD',
                    'priority' => 'medium',
                    'notes' => $this->buildNotes($customer),
                    'last_activity_at' => $customer->updated_at ?? $customer->created_at,
                    'created_at' => $customer->created_at,
                ]);

                DB::commit();
                $migrated++;
            } catch (\Exception $e) {
                DB::rollBack();
                $errors++;
                $this->newLine();
                $this->error("Failed to migrate customer {$customer->id}: {$e->getMessage()}");
            }
        });

        $this->newLine(2);
        $this->info("Migration complete!");
        $this->table(
            ['Metric', 'Count'],
            [
                ['Customers processed', $customers->count()],
                ['Successfully migrated', $migrated],
                ['Errors', $errors],
            ]
        );

        if ($dryRun) {
            $this->newLine();
            $this->warn('This was a dry run. Run without --dry-run to actually migrate.');
        }

        return 0;
    }

    /**
     * Build notes from customer data
     */
    private function buildNotes(Customer $customer): string
    {
        $notes = [];

        if ($customer->subject) {
            $notes[] = "თემა: {$customer->subject}";
        }

        if ($customer->message) {
            $notes[] = "შეტყობინება: {$customer->message}";
        }

        if ($customer->source) {
            $sourceLabel = $customer->source === 'contact_form' ? 'საკონტაქტო ფორმა' : 'ზარის მოთხოვნა';
            $notes[] = "წყარო: {$sourceLabel}";
        }

        if ($customer->notes) {
            $notes[] = "შენიშვნა: {$customer->notes}";
        }

        return implode("\n", $notes);
    }
}
