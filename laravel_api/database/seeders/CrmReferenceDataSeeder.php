<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CrmLostReason;
use App\Models\CrmStage;

class CrmReferenceDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // CrmLostReason Records
        $reasons = [
            [
                'id' => 1,
                'label' => 'ფასი მაღალია',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 2,
                'label' => 'ლოკაცია / რაიონი',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 3,
                'label' => 'პლანირება არ მოეწონა',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 4,
                'label' => 'კონკურენტს შეიძინა',
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 5,
                'label' => 'დაფინანსება უარყოფილია',
                'sort_order' => 5,
                'is_active' => true,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 6,
                'label' => 'გადაიფიქრა',
                'sort_order' => 6,
                'is_active' => true,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 7,
                'label' => 'არ პასუხობს (გაუჩინარდა)',
                'sort_order' => 7,
                'is_active' => true,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 8,
                'label' => 'სპამი / არასწორი ლიდი',
                'sort_order' => 8,
                'is_active' => true,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 9,
                'label' => 'დუბლიკატი',
                'sort_order' => 9,
                'is_active' => true,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 10,
                'label' => 'სხვა',
                'sort_order' => 10,
                'is_active' => true,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
        ];

        foreach ($reasons as $reason) {
            CrmLostReason::updateOrCreate(['id' => $reason['id']], $reason);
        }

        // CrmStage Records
        $stages = [
            [
                'id' => 1,
                'name' => 'ახალი ლიდი',
                'slug' => 'new-lead',
                'type' => 'open',
                'sort_order' => 1,
                'color' => '#3B82F6',
                'is_active' => true,
                'locks_apartment' => false,
                'days_until_stale' => 1,
                'requires_apartment' => false,
                'requires_lost_reason' => false,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 2,
                'name' => 'დაკავშირებული',
                'slug' => 'qualification',
                'type' => 'open',
                'sort_order' => 2,
                'color' => '#EAB308',
                'is_active' => true,
                'locks_apartment' => false,
                'days_until_stale' => 3,
                'requires_apartment' => false,
                'requires_lost_reason' => false,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:26:36',
            ],
            [
                'id' => 3,
                'name' => 'ობიექტის ნახვა',
                'slug' => 'site-visit',
                'type' => 'open',
                'sort_order' => 3,
                'color' => '#8B5CF6',
                'is_active' => true,
                'locks_apartment' => false,
                'days_until_stale' => 2,
                'requires_apartment' => false,
                'requires_lost_reason' => false,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:26:36',
            ],
            [
                'id' => 4,
                'name' => 'მოლაპარაკება',
                'slug' => 'negotiation',
                'type' => 'open',
                'sort_order' => 4,
                'color' => '#F97316',
                'is_active' => true,
                'locks_apartment' => false,
                'days_until_stale' => 7,
                'requires_apartment' => false,
                'requires_lost_reason' => false,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:26:36',
            ],
            [
                'id' => 5,
                'name' => 'კონტრაქტი / დაჯავშნა',
                'slug' => 'contract',
                'type' => 'open',
                'sort_order' => 5,
                'color' => '#EF4444',
                'is_active' => true,
                'locks_apartment' => true,
                'days_until_stale' => 10,
                'requires_apartment' => true,
                'requires_lost_reason' => false,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 6,
                'name' => 'გაყიდული',
                'slug' => 'won',
                'type' => 'won',
                'sort_order' => 6,
                'color' => '#22C55E',
                'is_active' => true,
                'locks_apartment' => true,
                'days_until_stale' => null,
                'requires_apartment' => true,
                'requires_lost_reason' => false,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 7,
                'name' => 'დაკარგული',
                'slug' => 'lost',
                'type' => 'lost',
                'sort_order' => 7,
                'color' => '#6B7280',
                'is_active' => true,
                'locks_apartment' => false,
                'days_until_stale' => null,
                'requires_apartment' => false,
                'requires_lost_reason' => true,
                'created_at' => '2025-12-13 19:19:08',
                'updated_at' => '2025-12-13 19:19:08',
            ],
            [
                'id' => 8,
                'name' => 'დაკავშირებული',
                'slug' => 'contacted',
                'type' => 'open',
                'sort_order' => 2,
                'color' => '#EAB308',
                'is_active' => true,
                'locks_apartment' => false,
                'days_until_stale' => 3,
                'requires_apartment' => false,
                'requires_lost_reason' => false,
                'created_at' => '2025-12-30 08:42:46',
                'updated_at' => '2025-12-30 08:42:46',
            ],
        ];

        foreach ($stages as $stage) {
            CrmStage::updateOrCreate(['id' => $stage['id']], $stage);
        }
    }
}
