<?php

namespace Database\Seeders;

use App\Models\CrmDeal;
use App\Models\CrmStage;
use App\Models\CrmLostReason;
use App\Models\CrmActivity;
use App\Models\CrmPayment;
use App\Models\Customer;
use App\Models\User;
use App\Models\Apartment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use Carbon\Carbon;

class CrmTestDataSeeder extends Seeder
{
    private $faker;
    private $stages;
    private $users;
    private $apartments;
    private $lostReasons;
    private $dealCounter = 0;

    // Georgian first names
    private $georgianFirstNames = [
        'გიორგი', 'ნინო', 'დავით', 'თამარ', 'ლევან', 'ანა', 'ნიკა', 'ხათუნა',
        'გიგა', 'მარიამ', 'ზურაბ', 'ნატალია', 'ალექსანდრე', 'ეკატერინე', 'გიორგი',
        'სალომე', 'ბექა', 'ქეთევან', 'ირაკლი', 'სოფიო', 'ლაშა', 'მაკა', 'ვახტანგ',
        'ნინა', 'გრიგოლ', 'მარინა', 'თორნიკე', 'ელენე', 'რატი', 'ია'
    ];

    // Georgian last names
    private $georgianLastNames = [
        'გელაშვილი', 'ქავთარაძე', 'მამედოვი', 'ბერიძე', 'ჩხეიძე', 'კვირიკაშვილი',
        'ჯაფარიძე', 'კობახიძე', 'ნადირაძე', 'ხარაბაძე', 'მელაძე', 'წერეთელი',
        'ჩიქოვანი', 'გურგენიძე', 'ხუციშვილი', 'აბაშიძე', 'რუსთაველი', 'მესხიშვილი',
        'ვაშაკიძე', 'კიკნაძე', 'ჯიქია', 'ლობჟანიძე', 'გოგიჩაიშვილი', 'ბერიანიძე'
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->faker = Faker::create();

        // Check if test data already exists
        if (CrmDeal::where('notes', 'LIKE', '%[TEST_DATA]%')->exists()) {
            if (!$this->command->confirm('Test data already exists. Do you want to clean it up and recreate?', true)) {
                $this->command->warn('Seeder cancelled.');
                return;
            }
            $this->cleanup();
        }

        $this->command->info('Starting CRM test data generation...');

        // Load dependencies
        $this->loadDependencies();

        // Define distribution (total 200 deals)
        $distribution = [
            'new-lead' => 80,      // 40%
            'contacted' => 40,     // 20%
            'site-visit' => 25,    // 12.5%
            'negotiation' => 20,   // 10%
            'contract' => 15,      // 7.5%
            'won' => 10,           // 5%
            'lost' => 10,          // 5%
        ];

        DB::beginTransaction();

        try {
            // Create deals for each stage
            foreach ($distribution as $stageSlug => $count) {
                $stage = $this->stages->firstWhere('slug', $stageSlug);
                if (!$stage) {
                    throw new \Exception("Stage {$stageSlug} not found!");
                }

                $this->command->info("Creating {$count} deals for stage: {$stage->name}");
                $this->createDealsForStage($stage, $count);
            }

            // Clear CRM cache
            $this->clearCache();

            DB::commit();

            $this->command->info('✅ Successfully created 200 test deals with activities and payments!');
            $this->command->warn('To remove test data, run: php artisan db:seed --class=CrmTestDataSeeder --cleanup');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Failed to seed test data: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Load necessary dependencies
     */
    private function loadDependencies(): void
    {
        $this->command->info('Loading dependencies...');

        // Load stages
        $this->stages = CrmStage::all();
        if ($this->stages->isEmpty()) {
            throw new \Exception('No CRM stages found. Run CrmSeeder first!');
        }

        // Load users (any users that exist)
        $this->users = User::limit(5)->get();

        if ($this->users->isEmpty()) {
            throw new \Exception('No users found in the system!');
        }

        // Load apartments
        $this->apartments = Apartment::with('building.project')
            ->where('status', 'available')
            ->get();

        if ($this->apartments->isEmpty()) {
            $this->command->warn('No available apartments found. Deals requiring apartments will fail validation!');
        }

        // Load lost reasons
        $this->lostReasons = CrmLostReason::where('is_active', true)->get();

        $this->command->info("Loaded: {$this->stages->count()} stages, {$this->users->count()} users, {$this->apartments->count()} apartments");
    }

    /**
     * Create deals for a specific stage
     */
    private function createDealsForStage(CrmStage $stage, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $this->dealCounter++;

            // Create customer
            $customer = $this->createCustomer();

            // Determine if this deal should have an apartment
            $shouldHaveApartment = $this->shouldAssignApartment($stage);
            $apartment = $shouldHaveApartment && !$this->apartments->isEmpty()
                ? $this->apartments->random()
                : null;

            // Create deal
            $deal = $this->createDeal($customer, $stage, $apartment);

            // Create activities
            $this->createActivitiesForDeal($deal, $stage);

            // Create payments for won deals
            if ($stage->slug === 'won') {
                $this->createPaymentsForDeal($deal);
            }

            // Make some deals stale
            if ($this->shouldBeStale($stage)) {
                $this->makeStale($deal, $stage);
            }
        }
    }

    /**
     * Create a customer
     */
    private function createCustomer(): Customer
    {
        $firstName = $this->georgianFirstNames[array_rand($this->georgianFirstNames)];
        $lastName = $this->georgianLastNames[array_rand($this->georgianLastNames)];
        $name = $firstName . ' ' . $lastName;

        // 30% have email
        $hasEmail = $this->faker->boolean(30);
        $email = $hasEmail ? strtolower(str_replace(' ', '.', $this->transliterate($name))) . '@example.com' : null;

        // Georgian phone number format: +995 5XX XXX XXX
        $phone = '+995 5' . $this->faker->numberBetween(0, 9) . $this->faker->numberBetween(0, 9)
                . ' ' . $this->faker->numerify('### ###');

        return Customer::create([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'source' => 'admin_panel', // Valid enum: contact_form, call_request, admin_panel
            'status' => 'contacted',
            'subject' => 'ბინის ყიდვა',
            'message' => 'დაინტერესებული ვარ თქვენი პროექტით',
            'notes' => '[TEST_DATA] - Test customer generated by seeder',
        ]);
    }

    /**
     * Create a deal
     */
    private function createDeal(Customer $customer, CrmStage $stage, ?Apartment $apartment): CrmDeal
    {
        // Budget between $30k-$150k
        $budget = $this->faker->numberBetween(30000, 150000);

        // Currency distribution: 80% USD, 15% GEL, 5% EUR
        $rand = $this->faker->numberBetween(1, 100);
        if ($rand <= 80) {
            $currency = 'USD';
        } elseif ($rand <= 95) {
            $currency = 'GEL';
            $budget *= 2.7; // Approximate conversion
        } else {
            $currency = 'EUR';
            $budget *= 0.9;
        }

        // Priority distribution
        $priorities = ['low', 'low', 'medium', 'medium', 'medium', 'high'];
        $priority = $priorities[array_rand($priorities)];

        // Title
        $apartmentInfo = $apartment ? "{$apartment->building->project->title} - {$apartment->apartment_number}" : 'ბინის ძიება';
        $title = $customer->name . ' - ' . $apartmentInfo;

        // Create base deal data
        $dealData = [
            'customer_id' => $customer->id,
            'user_id' => $this->users->random()->id,
            'apartment_id' => $apartment?->id,
            'stage_id' => $stage->id,
            'title' => $title,
            'budget' => $budget,
            'currency' => $currency,
            'priority' => $priority,
            'expected_close_date' => $this->faker->dateTimeBetween('now', '+3 months'),
            'last_activity_at' => now()->subDays($this->faker->numberBetween(0, 5)),
            'notes' => "Test deal #{$this->dealCounter}\n\n[TEST_DATA] - Generated by CrmTestDataSeeder",
        ];

        // Add pricing for later stages
        if ($stage->sort_order >= 4) {
            // Offered price (negotiation stage onwards)
            $dealData['offered_price_per_sqm'] = $apartment ? $this->faker->numberBetween(800, 1500) : null;
            $dealData['offered_price_total'] = $budget * $this->faker->randomFloat(2, 0.9, 1.1);
            $dealData['offered_at'] = now()->subDays($this->faker->numberBetween(1, 10));
        }

        if ($stage->sort_order >= 5) {
            // Reserved price (contract stage onwards)
            $dealData['reserved_price_per_sqm'] = $dealData['offered_price_per_sqm'] ?? null;
            $dealData['reserved_price_total'] = $dealData['offered_price_total'];
            $dealData['reserved_at'] = now()->subDays($this->faker->numberBetween(1, 5));
        }

        if ($stage->slug === 'won') {
            // Final price for won deals
            $dealData['final_price_per_sqm'] = $dealData['reserved_price_per_sqm'];
            $dealData['final_price_total'] = $dealData['reserved_price_total'];
            $dealData['final_at'] = now()->subDays($this->faker->numberBetween(1, 3));
            $dealData['closed_at'] = now();
            $dealData['agreed_price'] = $dealData['final_price_total'];

            // Payment calculator alternative (1-6)
            $dealData['selected_payment_alternative'] = $this->faker->numberBetween(1, 6);
        }

        if ($stage->slug === 'lost') {
            // Lost deals need a reason
            if (!$this->lostReasons->isEmpty()) {
                $dealData['lost_reason_id'] = $this->lostReasons->random()->id;
            }
            $dealData['closed_at'] = now();
        }

        return CrmDeal::create($dealData);
    }

    /**
     * Create activities for a deal
     */
    private function createActivitiesForDeal(CrmDeal $deal, CrmStage $stage): void
    {
        $activityCount = $this->faker->numberBetween(3, 10);
        $types = ['note', 'note', 'note', 'note', 'note', 'note', 'call', 'call', 'call', 'email', 'meeting'];

        $startDate = now()->subDays(30);
        $currentDate = clone $startDate;

        for ($i = 0; $i < $activityCount; $i++) {
            $type = $types[array_rand($types)];

            $content = match($type) {
                'note' => $this->faker->randomElement([
                    'კლიენტი დაინტერესებულია 2-3 ოთახიანი ბინით',
                    'განხილული იქნა ფასები და გადახდის გრაფიკი',
                    'მოითხოვა დამატებითი ინფორმაცია პროექტის შესახებ',
                    'დაინტერესებულია სესხით',
                    'უნდა გადმოვუგზავნოთ პრეზენტაცია'
                ]),
                'call' => 'სატელეფონო საუბარი - ' . $this->faker->numberBetween(5, 45) . ' წუთი',
                'email' => 'გაგზავნილია ელ. ფოსტა დამატებითი ინფორმაციით',
                'meeting' => 'შეხვედრა ოფისში / ობიექტზე',
                default => 'აქტივობა',
            };

            CrmActivity::create([
                'deal_id' => $deal->id,
                'user_id' => $deal->user_id,
                'type' => $type,
                'content' => $content,
                'created_at' => $currentDate,
                'updated_at' => $currentDate,
            ]);

            // Increment date for next activity
            $currentDate = $currentDate->addDays($this->faker->numberBetween(1, 5));
        }

        // Add stage change activity
        CrmActivity::create([
            'deal_id' => $deal->id,
            'user_id' => $deal->user_id,
            'type' => 'status_change',
            'content' => "გადავიდა სტატუსზე: {$stage->name}",
            'created_at' => $currentDate,
            'updated_at' => $currentDate,
        ]);
    }

    /**
     * Create payments for a won deal
     */
    private function createPaymentsForDeal(CrmDeal $deal): void
    {
        $paymentCount = $this->faker->numberBetween(12, 24);
        $totalPrice = $deal->final_price_total ?? $deal->budget;
        $installmentAmount = $totalPrice / $paymentCount;

        $startDate = now();

        for ($i = 1; $i <= $paymentCount; $i++) {
            $dueDate = $startDate->copy()->addMonths($i - 1);

            // 30% of payments are marked as paid
            $isPaid = $this->faker->boolean(30);
            $paidDate = $isPaid ? $dueDate->copy()->addDays($this->faker->numberBetween(-2, 5)) : null;

            // 10% of unpaid payments are overdue
            $isOverdue = !$isPaid && $dueDate->isPast() && $this->faker->boolean(50);

            $status = $isPaid ? 'paid' : ($isOverdue ? 'overdue' : 'pending');

            CrmPayment::create([
                'deal_id' => $deal->id,
                'title' => "განვადება #{$i}",
                'installment_number' => $i,
                'amount_due' => $installmentAmount,
                'amount_paid' => $isPaid ? $installmentAmount : 0,
                'currency' => $deal->currency,
                'due_date' => $dueDate,
                'paid_date' => $paidDate,
                'status' => $status,
                'calculator_generated' => true,
            ]);
        }
    }

    /**
     * Determine if apartment should be assigned to this deal
     */
    private function shouldAssignApartment(CrmStage $stage): bool
    {
        // Stages 5-6 require 100% apartment assignment
        if ($stage->requires_apartment) {
            return true;
        }

        // Early stages (1-4): 50% have apartment
        return $this->faker->boolean(50);
    }

    /**
     * Determine if deal should be stale
     */
    private function shouldBeStale(CrmStage $stage): bool
    {
        // 15% of deals should be stale
        return $stage->days_until_stale !== null && $this->faker->boolean(15);
    }

    /**
     * Make a deal stale
     */
    private function makeStale(CrmDeal $deal, CrmStage $stage): void
    {
        if ($stage->days_until_stale === null) {
            return;
        }

        // Set last_activity_at beyond the stale threshold
        $staleDays = $stage->days_until_stale + $this->faker->numberBetween(1, 5);
        $deal->last_activity_at = now()->subDays($staleDays);
        $deal->saveQuietly(); // Don't trigger auto-update of last_activity_at
    }

    /**
     * Transliterate Georgian to Latin
     */
    private function transliterate(string $text): string
    {
        $georgianToLatin = [
            'ა' => 'a', 'ბ' => 'b', 'გ' => 'g', 'დ' => 'd', 'ე' => 'e', 'ვ' => 'v',
            'ზ' => 'z', 'თ' => 't', 'ი' => 'i', 'კ' => 'k', 'ლ' => 'l', 'მ' => 'm',
            'ნ' => 'n', 'ო' => 'o', 'პ' => 'p', 'ჟ' => 'zh', 'რ' => 'r', 'ს' => 's',
            'ტ' => 't', 'უ' => 'u', 'ფ' => 'p', 'ქ' => 'k', 'ღ' => 'gh', 'ყ' => 'q',
            'შ' => 'sh', 'ჩ' => 'ch', 'ც' => 'ts', 'ძ' => 'dz', 'წ' => 'ts', 'ჭ' => 'ch',
            'ხ' => 'kh', 'ჯ' => 'j', 'ჰ' => 'h'
        ];

        return str_replace(array_keys($georgianToLatin), array_values($georgianToLatin), $text);
    }

    /**
     * Clear CRM cache
     */
    private function clearCache(): void
    {
        $this->command->info('Clearing CRM cache...');

        // Increment pipeline version to invalidate cache
        $currentVersion = cache()->get('crm_pipeline_version', 0);
        cache()->put('crm_pipeline_version', $currentVersion + 1);

        // Clear statistics cache
        cache()->forget('crm_statistics');
    }

    /**
     * Clean up test data
     */
    public function cleanup(): void
    {
        $this->command->warn('Cleaning up test data...');

        DB::beginTransaction();

        try {
            // Find all test deals
            $testDeals = CrmDeal::where('notes', 'LIKE', '%[TEST_DATA]%')->get();
            $dealCount = $testDeals->count();

            // Delete related payments and activities (cascade should handle this, but explicit is safer)
            foreach ($testDeals as $deal) {
                $deal->payments()->delete();
                $deal->activities()->delete();
            }

            // Delete test deals
            CrmDeal::where('notes', 'LIKE', '%[TEST_DATA]%')->delete();

            // Delete test customers (by notes marker)
            $customerCount = Customer::where('notes', 'LIKE', '%[TEST_DATA]%')->count();
            Customer::where('notes', 'LIKE', '%[TEST_DATA]%')->delete();

            // Clear cache
            $this->clearCache();

            DB::commit();

            $this->command->info("✅ Deleted {$dealCount} test deals and {$customerCount} test customers.");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Failed to clean up test data: ' . $e->getMessage());
            throw $e;
        }
    }
}
