<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankRate;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminBankRateController extends Controller
{
    use ApiResponse;

    /**
     * Get all bank rates
     */
    public function index(Request $request)
    {
        try {
            $query = BankRate::query();

            // Filter by active status
            if ($request->has('active')) {
                if ($request->active === 'true' || $request->active === '1') {
                    $query->where('is_active', true);
                } elseif ($request->active === 'false' || $request->active === '0') {
                    $query->where('is_active', false);
                }
            }

            // Order by sort_order, then by created_at
            $bankRates = $query->orderBy('sort_order')->orderBy('created_at', 'desc')->get();

            return $this->success($bankRates);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch bank rates: ' . $e->getMessage());
            return $this->error('ბანკების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Get active bank rates only
     */
    public function active()
    {
        try {
            $bankRates = BankRate::active()->ordered()->get();
            return $this->success($bankRates);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch active bank rates: ' . $e->getMessage());
            return $this->error('აქტიური ბანკების ჩატვირთვა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Store a new bank rate
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bank_name' => 'required|array',
            'bank_name.ka' => 'required|string|max:255',
            'bank_name.en' => 'required|string|max:255',
            'bank_name.ru' => 'required|string|max:255',
            'interest_rate' => 'required|numeric|min:0|max:100',
            'min_loan_term_years' => 'required|integer|min:1|max:50',
            'max_loan_term_years' => 'required|integer|min:1|max:50',
            'min_down_payment_percent' => 'required|integer|min:0|max:100',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors(), 422);
        }

        // Validate min < max for loan terms
        if ($request->min_loan_term_years >= $request->max_loan_term_years) {
            return $this->error('მინიმალური ვადა უნდა იყოს მაქსიმალურზე ნაკლები', 422);
        }

        try {
            // Get the current max sort_order
            $maxSortOrder = BankRate::max('sort_order') ?? 0;

            $bankRate = BankRate::create([
                'bank_name' => $request->bank_name,
                'interest_rate' => $request->interest_rate,
                'min_loan_term_years' => $request->min_loan_term_years,
                'max_loan_term_years' => $request->max_loan_term_years,
                'min_down_payment_percent' => $request->min_down_payment_percent,
                'is_active' => $request->is_active ?? true,
                'sort_order' => $maxSortOrder + 1,
            ]);

            return $this->success($bankRate, 'ბანკი დაემატა', 201);
        } catch (\Exception $e) {
            \Log::error('Failed to create bank rate: ' . $e->getMessage());
            return $this->error('ბანკის დამატება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Update a bank rate
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'bank_name' => 'sometimes|array',
            'bank_name.ka' => 'sometimes|string|max:255',
            'bank_name.en' => 'sometimes|string|max:255',
            'bank_name.ru' => 'sometimes|string|max:255',
            'interest_rate' => 'sometimes|numeric|min:0|max:100',
            'min_loan_term_years' => 'sometimes|integer|min:1|max:50',
            'max_loan_term_years' => 'sometimes|integer|min:1|max:50',
            'min_down_payment_percent' => 'sometimes|integer|min:0|max:100',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors(), 422);
        }

        try {
            $bankRate = BankRate::findOrFail($id);

            // Validate min < max for loan terms if both are provided
            $minTerm = $request->min_loan_term_years ?? $bankRate->min_loan_term_years;
            $maxTerm = $request->max_loan_term_years ?? $bankRate->max_loan_term_years;

            if ($minTerm >= $maxTerm) {
                return $this->error('მინიმალური ვადა უნდა იყოს მაქსიმალურზე ნაკლები', 422);
            }

            $bankRate->update($request->only([
                'bank_name',
                'interest_rate',
                'min_loan_term_years',
                'max_loan_term_years',
                'min_down_payment_percent',
                'is_active',
            ]));

            return $this->success($bankRate, 'ბანკი განახლდა');
        } catch (\Exception $e) {
            \Log::error('Failed to update bank rate: ' . $e->getMessage());
            return $this->error('ბანკის განახლება ვერ მოხერხდა', 500);
        }
    }

    /**
     * Delete a bank rate
     */
    public function destroy($id)
    {
        try {
            $bankRate = BankRate::findOrFail($id);
            $bankRate->delete();

            return $this->success(null, 'ბანკი წაიშალა');
        } catch (\Exception $e) {
            \Log::error('Failed to delete bank rate: ' . $e->getMessage());
            return $this->error('ბანკის წაშლა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Toggle active status
     */
    public function toggleActive($id)
    {
        try {
            $bankRate = BankRate::findOrFail($id);
            $bankRate->is_active = !$bankRate->is_active;
            $bankRate->save();

            return $this->success($bankRate, 'სტატუსი შეიცვალა');
        } catch (\Exception $e) {
            \Log::error('Failed to toggle bank rate status: ' . $e->getMessage());
            return $this->error('სტატუსის შეცვლა ვერ მოხერხდა', 500);
        }
    }

    /**
     * Reorder bank rates
     */
    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bank_rates' => 'required|array',
            'bank_rates.*.id' => 'required|exists:bank_rates,id',
            'bank_rates.*.sort_order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors(), 422);
        }

        try {
            DB::beginTransaction();

            foreach ($request->bank_rates as $item) {
                BankRate::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
            }

            DB::commit();

            $bankRates = BankRate::ordered()->get();
            return $this->success($bankRates, 'თანმიმდევრობა შეიცვალა');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to reorder bank rates: ' . $e->getMessage());
            return $this->error('თანმიმდევრობის შეცვლა ვერ მოხერხდა', 500);
        }
    }
}
