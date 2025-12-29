<?php

namespace App\Services;

use Carbon\Carbon;

/**
 * Payment Schedule Calculator Service
 * Ports the frontend calculator logic to PHP for server-side payment schedule generation
 */
class PaymentScheduleCalculatorService
{
    private string $locale;

    public function __construct(?string $locale = null)
    {
        $this->locale = $locale ?? app()->getLocale();
    }

    /**
     * Main dispatcher - calculates payment schedule based on alternative
     */
    public function calculate(
        int $alternative,
        float $basePrice,
        float $area,
        array $calculatorSettings,
        ?float $downPaymentPercent = null,
        ?float $monthlyPayment = null
    ): array {
        return match ($alternative) {
            1 => $this->calculateAlternative1($basePrice, $area, $calculatorSettings, $downPaymentPercent),
            2 => $this->calculateAlternative2($basePrice, $area, $calculatorSettings, $downPaymentPercent, $monthlyPayment),
            3 => $this->calculateAlternative3($basePrice, $area, $calculatorSettings, $downPaymentPercent),
            4 => $this->calculateAlternative4($basePrice, $area, $calculatorSettings, $downPaymentPercent),
            5 => $this->calculateAlternative5($basePrice, $area, $calculatorSettings, $monthlyPayment),
            6 => $this->calculateAlternative6($basePrice, $area, $calculatorSettings, $monthlyPayment),
            default => throw new \InvalidArgumentException("Invalid alternative: {$alternative}"),
        };
    }

    /**
     * Alternative 1: Standard Price
     */
    private function calculateAlternative1(
        float $basePrice,
        float $area,
        array $settings,
        ?float $downPaymentPercent
    ): array {
        $baseTotal = $basePrice * $area;
        $downPaymentPercent = $downPaymentPercent ?? 20;
        $downPayment = $baseTotal * ($downPaymentPercent / 100);
        $remaining = $baseTotal - $downPayment;

        $deadline = Carbon::parse($settings['alternatives']['alt1']['deadline']);
        $monthsUntilDeadline = max(1, Carbon::now()->diffInMonths($deadline));
        $monthlyPayment = $monthsUntilDeadline > 0 ? $remaining / $monthsUntilDeadline : $remaining;

        return [
            'totalPrice' => $baseTotal,
            'schedule' => $this->generateStandardSchedule($downPayment, $monthlyPayment, $monthsUntilDeadline)
        ];
    }

    /**
     * Alternative 2: Internal Installment with Surcharge + Balloon
     */
    private function calculateAlternative2(
        float $basePrice,
        float $area,
        array $settings,
        ?float $downPaymentPercent,
        ?float $monthlyPayment
    ): array {
        $baseTotal = $basePrice * $area;
        $surchargePercent = $settings['alternatives']['alt2']['surcharge_percent'];
        $totalPrice = $baseTotal * (1 + $surchargePercent / 100);

        $downPaymentPercent = $downPaymentPercent ?? 20;
        $downPayment = $totalPrice * ($downPaymentPercent / 100);
        $remaining = $totalPrice - $downPayment;

        $monthlyPayment = $monthlyPayment ?? 800;
        $deadline = Carbon::parse($settings['alternatives']['alt2']['deadline']);
        $monthsUntilDeadline = max(1, Carbon::now()->diffInMonths($deadline));

        $totalMonthlyPayments = $monthlyPayment * $monthsUntilDeadline;
        $balloonPayment = max(0, $remaining - $totalMonthlyPayments);

        return [
            'totalPrice' => $totalPrice,
            'schedule' => $this->generateBalloonSchedule($downPayment, $monthlyPayment, $monthsUntilDeadline, $balloonPayment, $deadline)
        ];
    }

    /**
     * Alternative 3: Full Upfront with Discount
     */
    private function calculateAlternative3(
        float $basePrice,
        float $area,
        array $settings,
        ?float $downPaymentPercent
    ): array {
        $baseTotal = $basePrice * $area;
        $discountPercent = $settings['alternatives']['alt3']['discount_percent'];
        $totalPrice = $baseTotal * (1 - $discountPercent / 100);

        $downPaymentPercent = $downPaymentPercent ?? 100;
        $downPayment = $totalPrice * ($downPaymentPercent / 100);
        $remaining = $totalPrice - $downPayment;
        $deadline = Carbon::parse($settings['alternatives']['alt3']['deadline']);

        return [
            'totalPrice' => $totalPrice,
            'schedule' => $this->generateOneTimeSchedule($downPayment, $remaining, $deadline)
        ];
    }

    /**
     * Alternative 4: Large Upfront with Discount
     */
    private function calculateAlternative4(
        float $basePrice,
        float $area,
        array $settings,
        ?float $downPaymentPercent
    ): array {
        $baseTotal = $basePrice * $area;
        $discountPercent = $settings['alternatives']['alt4']['discount_percent'];
        $totalPrice = $baseTotal * (1 - $discountPercent / 100);

        $downPaymentPercent = $downPaymentPercent ?? 50;
        $downPayment = $totalPrice * ($downPaymentPercent / 100);
        $remaining = $totalPrice - $downPayment;
        $deadline = Carbon::parse($settings['alternatives']['alt4']['deadline']);

        return [
            'totalPrice' => $totalPrice,
            'schedule' => $this->generateNegotiatedSchedule($downPayment, $remaining, $deadline)
        ];
    }

    /**
     * Alternative 5: No Down Payment, $800/month + surcharge
     */
    private function calculateAlternative5(
        float $basePrice,
        float $area,
        array $settings,
        ?float $monthlyPayment
    ): array {
        $baseTotal = $basePrice * $area;
        $priceIncreasePerSqm = $settings['alternatives']['alt5']['price_increase_per_sqm'];
        $totalSurcharge = $priceIncreasePerSqm * $area;
        $totalPrice = $baseTotal + $totalSurcharge;

        $monthlyPayment = max(800, $monthlyPayment ?? 800);
        $deadline = Carbon::parse($settings['alternatives']['alt5']['deadline']);
        $monthsUntilDeadline = max(1, Carbon::now()->diffInMonths($deadline));

        $totalMonthlyPayments = $monthlyPayment * $monthsUntilDeadline;
        $remainingForBank = max(0, $totalPrice - $totalMonthlyPayments);

        return [
            'totalPrice' => $totalPrice,
            'schedule' => $this->generateBalloonSchedule(0, $monthlyPayment, $monthsUntilDeadline, $remainingForBank, $deadline)
        ];
    }

    /**
     * Alternative 6: No Down Payment, $1500/month + surcharge
     */
    private function calculateAlternative6(
        float $basePrice,
        float $area,
        array $settings,
        ?float $monthlyPayment
    ): array {
        $baseTotal = $basePrice * $area;
        $priceIncreasePerSqm = $settings['alternatives']['alt6']['price_increase_per_sqm'];
        $totalSurcharge = $priceIncreasePerSqm * $area;
        $totalPrice = $baseTotal + $totalSurcharge;

        $monthlyPayment = max(1500, $monthlyPayment ?? 1500);
        $deadline = Carbon::parse($settings['alternatives']['alt6']['deadline']);
        $monthsUntilDeadline = max(1, Carbon::now()->diffInMonths($deadline));

        $totalMonthlyPayments = $monthlyPayment * $monthsUntilDeadline;
        $remainingForBank = max(0, $totalPrice - $totalMonthlyPayments);

        return [
            'totalPrice' => $totalPrice,
            'schedule' => $this->generateBalloonSchedule(0, $monthlyPayment, $monthsUntilDeadline, $remainingForBank, $deadline)
        ];
    }

    // ==================== SCHEDULE GENERATORS ====================

    /**
     * Generate standard monthly payment schedule
     */
    private function generateStandardSchedule(
        float $downPayment,
        float $monthlyPayment,
        int $numberOfMonths
    ): array {
        $schedule = [];
        $startDate = Carbon::now();
        $remaining = $downPayment > 0 ? $monthlyPayment * $numberOfMonths : 0;

        if ($downPayment > 0) {
            $schedule[] = [
                'month' => 0,
                'date' => $startDate->toDateString(),
                'amount' => round($downPayment, 2),
                'remainingBalance' => round($remaining, 2),
                'description' => __('payments.down_payment', [], $this->locale),
            ];
        }

        for ($i = 1; $i <= $numberOfMonths; $i++) {
            $paymentDate = (clone $startDate)->addMonths($i);
            $payment = $i === $numberOfMonths ? $remaining : $monthlyPayment;
            $remaining -= $payment;

            $schedule[] = [
                'month' => $i,
                'date' => $paymentDate->toDateString(),
                'amount' => round($payment, 2),
                'remainingBalance' => round(max(0, $remaining), 2),
                'description' => __('payments.monthly_payment', [], $this->locale),
            ];
        }

        return $schedule;
    }

    /**
     * Generate balloon payment schedule
     */
    private function generateBalloonSchedule(
        float $downPayment,
        float $monthlyPayment,
        int $monthsUntilCompletion,
        float $balloonPayment,
        Carbon $completionDate
    ): array {
        $schedule = [];
        $startDate = Carbon::now();
        $remaining = $monthlyPayment * $monthsUntilCompletion + $balloonPayment;

        if ($downPayment > 0) {
            $schedule[] = [
                'month' => 0,
                'date' => $startDate->toDateString(),
                'amount' => round($downPayment, 2),
                'remainingBalance' => round($remaining, 2),
                'description' => __('payments.down_payment', [], $this->locale),
            ];
        }

        for ($i = 1; $i <= $monthsUntilCompletion; $i++) {
            $paymentDate = (clone $startDate)->addMonths($i);
            $remaining -= $monthlyPayment;

            $schedule[] = [
                'month' => $i,
                'date' => $paymentDate->toDateString(),
                'amount' => round($monthlyPayment, 2),
                'remainingBalance' => round(max(0, $remaining), 2),
                'description' => __('payments.monthly_payment', [], $this->locale),
            ];
        }

        if ($balloonPayment > 0) {
            $schedule[] = [
                'month' => $monthsUntilCompletion + 1,
                'date' => $completionDate->toDateString(),
                'amount' => round($balloonPayment, 2),
                'remainingBalance' => 0,
                'description' => __('payments.remaining_for_bank', [], $this->locale),
            ];
        }

        return $schedule;
    }

    /**
     * Generate one-time payment schedule (for full upfront)
     */
    private function generateOneTimeSchedule(
        float $downPayment,
        float $remaining,
        Carbon $completionDate
    ): array {
        $schedule = [];
        $startDate = Carbon::now();

        $schedule[] = [
            'month' => 0,
            'date' => $startDate->toDateString(),
            'amount' => round($downPayment, 2),
            'remainingBalance' => round($remaining, 2),
            'description' => __('payments.down_payment', [], $this->locale),
        ];

        if ($remaining > 0) {
            $schedule[] = [
                'month' => 1,
                'date' => $completionDate->toDateString(),
                'amount' => round($remaining, 2),
                'remainingBalance' => 0,
                'description' => __('payments.balance_payment_at_completion', [], $this->locale),
            ];
        }

        return $schedule;
    }

    /**
     * Generate negotiated payment schedule (for Alternative 4)
     */
    private function generateNegotiatedSchedule(
        float $downPayment,
        float $remainingPayment,
        Carbon $completionDate
    ): array {
        $schedule = [];
        $startDate = Carbon::now();

        $schedule[] = [
            'month' => 0,
            'date' => $startDate->toDateString(),
            'amount' => round($downPayment, 2),
            'remainingBalance' => round($remainingPayment, 2),
            'description' => __('payments.down_payment', [], $this->locale),
        ];

        if ($remainingPayment > 0) {
            $schedule[] = [
                'month' => 1,
                'date' => $completionDate->toDateString(),
                'amount' => round($remainingPayment, 2),
                'remainingBalance' => 0,
                'description' => __('payments.balance_payment_at_completion', [], $this->locale),
            ];
        }

        return $schedule;
    }
}
