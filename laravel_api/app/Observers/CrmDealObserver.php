<?php

namespace App\Observers;

use App\Models\CrmDeal;
use App\Models\CrmStage;
use App\Models\CrmActivity;
use Illuminate\Support\Facades\Log;

class CrmDealObserver
{
    /**
     * Handle the CrmDeal "creating" event.
     */
    public function creating(CrmDeal $deal): void
    {
        // Ensure last_activity_at is set
        if (!$deal->last_activity_at) {
            $deal->last_activity_at = now();
        }
    }

    /**
     * Handle the CrmDeal "created" event.
     */
    public function created(CrmDeal $deal): void
    {
        // Log system activity for deal creation
        CrmActivity::create([
            'deal_id' => $deal->id,
            'user_id' => auth()->id(),
            'type' => 'system',
            'content' => 'გარიგება შეიქმნა',
            'metadata' => [
                'stage_id' => $deal->stage_id,
                'stage_name' => $deal->stage?->name,
            ],
        ]);

        Log::info('CRM Deal created', [
            'deal_id' => $deal->id,
            'customer_id' => $deal->customer_id,
            'stage' => $deal->stage?->name,
        ]);
    }

    /**
     * Handle the CrmDeal "updating" event.
     */
    public function updating(CrmDeal $deal): void
    {
        // Check if stage is changing
        if ($deal->isDirty('stage_id')) {
            $oldStageId = $deal->getOriginal('stage_id');
            $newStageId = $deal->stage_id;

            $oldStage = CrmStage::find($oldStageId);
            $newStage = CrmStage::find($newStageId);

            if ($oldStage && $newStage) {
                // Handle apartment status changes based on stage transitions
                $this->handleApartmentStatusChange($deal, $oldStage, $newStage);

                // Set closed_at timestamp if moving to won/lost
                if ($newStage->isClosing() && !$deal->closed_at) {
                    $deal->closed_at = now();
                }

                // Clear closed_at if moving back to open stage
                if (!$newStage->isClosing() && $deal->closed_at) {
                    $deal->closed_at = null;
                }
            }
        }

        // Update title if apartment is being linked
        if ($deal->isDirty('apartment_id') && $deal->apartment_id) {
            $deal->load('customer', 'apartment');
            if ($deal->customer && $deal->apartment) {
                $deal->title = CrmDeal::generateTitle($deal->customer, $deal->apartment);
            }
        }
    }

    /**
     * Handle the CrmDeal "updated" event.
     */
    public function updated(CrmDeal $deal): void
    {
        // Log stage change activity
        if ($deal->wasChanged('stage_id')) {
            $oldStageId = $deal->getOriginal('stage_id');
            $newStageId = $deal->stage_id;

            $oldStage = CrmStage::find($oldStageId);
            $newStage = CrmStage::find($newStageId);

            if ($oldStage && $newStage) {
                CrmActivity::logStatusChange($deal, $oldStage, $newStage, auth()->id());

                Log::info('CRM Deal stage changed', [
                    'deal_id' => $deal->id,
                    'from_stage' => $oldStage->name,
                    'to_stage' => $newStage->name,
                ]);
            }
        }

        // Log apartment link activity
        if ($deal->wasChanged('apartment_id')) {
            $oldApartmentId = $deal->getOriginal('apartment_id');
            $newApartmentId = $deal->apartment_id;

            if ($newApartmentId && !$oldApartmentId) {
                CrmActivity::create([
                    'deal_id' => $deal->id,
                    'user_id' => auth()->id(),
                    'type' => 'system',
                    'content' => "ბინა დაკავშირდა: ბინა #{$deal->apartment?->apartment_number}",
                    'metadata' => [
                        'apartment_id' => $newApartmentId,
                        'apartment_number' => $deal->apartment?->apartment_number,
                    ],
                ]);
            } elseif (!$newApartmentId && $oldApartmentId) {
                CrmActivity::create([
                    'deal_id' => $deal->id,
                    'user_id' => auth()->id(),
                    'type' => 'system',
                    'content' => 'ბინის კავშირი გაუქმდა',
                    'metadata' => [
                        'old_apartment_id' => $oldApartmentId,
                    ],
                ]);
            }
        }
    }

    /**
     * Handle the CrmDeal "deleting" event.
     */
    public function deleting(CrmDeal $deal): void
    {
        // Release apartment if it was locked by this deal
        if ($deal->apartment_id && $deal->stage && $deal->stage->locks_apartment) {
            $apartment = $deal->apartment;
            if ($apartment && $apartment->status !== 'sold') {
                // Only release if no other deals are locking this apartment
                $otherLockingDeals = CrmDeal::where('apartment_id', $apartment->id)
                    ->where('id', '!=', $deal->id)
                    ->whereHas('stage', function ($q) {
                        $q->where('locks_apartment', true);
                    })
                    ->exists();

                if (!$otherLockingDeals) {
                    $apartment->markAsAvailable();
                    Log::info('Apartment released on deal deletion', [
                        'deal_id' => $deal->id,
                        'apartment_id' => $apartment->id,
                    ]);
                }
            }
        }
    }

    /**
     * Handle apartment status changes based on stage transitions
     */
    private function handleApartmentStatusChange(CrmDeal $deal, CrmStage $oldStage, CrmStage $newStage): void
    {
        $apartment = $deal->apartment;

        if (!$apartment) {
            return;
        }

        // Moving TO a stage that locks apartment
        if ($newStage->locks_apartment && !$oldStage->locks_apartment) {
            if ($newStage->isWon()) {
                $apartment->markAsSold();
                Log::info('Apartment marked as sold', [
                    'deal_id' => $deal->id,
                    'apartment_id' => $apartment->id,
                ]);
            } else {
                $apartment->markAsReserved();
                Log::info('Apartment marked as reserved', [
                    'deal_id' => $deal->id,
                    'apartment_id' => $apartment->id,
                ]);
            }
        }

        // Moving FROM a locking stage TO a non-locking stage (e.g., Lost)
        if (!$newStage->locks_apartment && $oldStage->locks_apartment) {
            // Check if any other deal is still locking this apartment
            $otherLockingDeals = CrmDeal::where('apartment_id', $apartment->id)
                ->where('id', '!=', $deal->id)
                ->whereHas('stage', function ($q) {
                    $q->where('locks_apartment', true);
                })
                ->exists();

            if (!$otherLockingDeals) {
                $apartment->markAsAvailable();
                Log::info('Apartment released back to available', [
                    'deal_id' => $deal->id,
                    'apartment_id' => $apartment->id,
                ]);
            }
        }

        // Moving from Contract (reserved) to Won (sold)
        if ($newStage->isWon() && $oldStage->locks_apartment && !$oldStage->isWon()) {
            $apartment->markAsSold();
            Log::info('Apartment status changed from reserved to sold', [
                'deal_id' => $deal->id,
                'apartment_id' => $apartment->id,
            ]);
        }
    }
}
