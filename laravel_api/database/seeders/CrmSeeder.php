<?php

namespace Database\Seeders;

use App\Models\CrmStage;
use App\Models\CrmLostReason;
use Illuminate\Database\Seeder;

class CrmSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedStages();
        $this->seedLostReasons();
    }

    /**
     * Seed CRM pipeline stages
     */
    private function seedStages(): void
    {
        $stages = [
            [
                'name' => 'ახალი ლიდი',
                'slug' => 'new-lead',
                'type' => 'open',
                'sort_order' => 1,
                'color' => '#3B82F6', // Blue
                'locks_apartment' => false,
                'days_until_stale' => 1, // 24 hours
                'requires_apartment' => false,
                'requires_lost_reason' => false,
            ],
            [
                'name' => 'კვალიფიკაცია',
                'slug' => 'qualification',
                'type' => 'open',
                'sort_order' => 2,
                'color' => '#EAB308', // Yellow
                'locks_apartment' => false,
                'days_until_stale' => 3,
                'requires_apartment' => false,
                'requires_lost_reason' => false,
            ],
            [
                'name' => 'ობიექტის დათვალიერება',
                'slug' => 'site-visit',
                'type' => 'open',
                'sort_order' => 3,
                'color' => '#8B5CF6', // Purple
                'locks_apartment' => false,
                'days_until_stale' => 2,
                'requires_apartment' => false,
                'requires_lost_reason' => false,
            ],
            [
                'name' => 'მოლაპარაკება',
                'slug' => 'negotiation',
                'type' => 'open',
                'sort_order' => 4,
                'color' => '#F97316', // Orange
                'locks_apartment' => false,
                'days_until_stale' => 7,
                'requires_apartment' => false,
                'requires_lost_reason' => false,
            ],
            [
                'name' => 'კონტრაქტი / დაჯავშნა',
                'slug' => 'contract',
                'type' => 'open',
                'sort_order' => 5,
                'color' => '#EF4444', // Red
                'locks_apartment' => true, // Locks apartment as 'reserved'
                'days_until_stale' => 10,
                'requires_apartment' => true, // Must have apartment to enter this stage
                'requires_lost_reason' => false,
            ],
            [
                'name' => 'გაყიდული',
                'slug' => 'won',
                'type' => 'won',
                'sort_order' => 6,
                'color' => '#22C55E', // Green
                'locks_apartment' => true, // Keeps apartment as 'sold'
                'days_until_stale' => null,
                'requires_apartment' => true,
                'requires_lost_reason' => false,
            ],
            [
                'name' => 'დაკარგული',
                'slug' => 'lost',
                'type' => 'lost',
                'sort_order' => 7,
                'color' => '#6B7280', // Gray
                'locks_apartment' => false, // Releases apartment back to 'available'
                'days_until_stale' => null,
                'requires_apartment' => false,
                'requires_lost_reason' => true, // Must select a reason
            ],
        ];

        foreach ($stages as $stage) {
            CrmStage::updateOrCreate(
                ['slug' => $stage['slug']],
                $stage
            );
        }

        $this->command->info('CRM stages seeded successfully!');
    }

    /**
     * Seed lost reasons
     */
    private function seedLostReasons(): void
    {
        $reasons = [
            ['label' => 'ფასი მაღალია', 'sort_order' => 1],
            ['label' => 'ლოკაცია / რაიონი', 'sort_order' => 2],
            ['label' => 'პლანირება არ მოეწონა', 'sort_order' => 3],
            ['label' => 'კონკურენტს შეიძინა', 'sort_order' => 4],
            ['label' => 'დაფინანსება უარყოფილია', 'sort_order' => 5],
            ['label' => 'გადაიფიქრა', 'sort_order' => 6],
            ['label' => 'არ პასუხობს (გაუჩინარდა)', 'sort_order' => 7],
            ['label' => 'სპამი / არასწორი ლიდი', 'sort_order' => 8],
            ['label' => 'დუბლიკატი', 'sort_order' => 9],
            ['label' => 'სხვა', 'sort_order' => 10],
        ];

        foreach ($reasons as $reason) {
            CrmLostReason::updateOrCreate(
                ['label' => $reason['label']],
                array_merge($reason, ['is_active' => true])
            );
        }

        $this->command->info('CRM lost reasons seeded successfully!');
    }
}
