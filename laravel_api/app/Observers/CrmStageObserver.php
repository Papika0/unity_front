<?php

namespace App\Observers;

use App\Models\CrmStage;

class CrmStageObserver
{
    /**
     * Handle the CrmStage "saved" event (covers both created and updated).
     */
    public function saved(CrmStage $stage): void
    {
        CrmStage::clearCache();
    }

    /**
     * Handle the CrmStage "deleted" event.
     */
    public function deleted(CrmStage $stage): void
    {
        CrmStage::clearCache();
    }
}
