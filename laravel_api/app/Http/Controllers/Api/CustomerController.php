<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CrmDeal;
use App\Models\CrmStage;
use App\Models\MarketingEmail;
use App\Mail\NewCustomerNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    /**
     * Store a new customer inquiry
     *
     * Flow:
     * 1. Check if customer exists by phone OR email
     * 2. Create customer if not exists, otherwise use existing
     * 3. Auto-create a CRM Deal in "New Lead" stage
     * 4. Send email notification to marketing team
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'subject' => 'nullable|string|max:255',
            'message' => 'nullable|string',
            'source' => 'required|in:contact_form,call_request',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Check if customer already exists by phone OR email
            $existingCustomer = Customer::findByContact($request->phone, $request->email);

            if ($existingCustomer) {
                // Use existing customer, update info if needed
                $customer = $existingCustomer;
                $customer->update([
                    'name' => $request->name,
                    'subject' => $request->subject,
                    'message' => $request->message,
                ]);
                $isNewCustomer = false;
            } else {
                // Create new customer record
                $customer = Customer::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'subject' => $request->subject,
                    'message' => $request->message,
                    'source' => $request->source,
                    'status' => 'new',
                ]);
                $isNewCustomer = true;
            }

            // Get the "New Lead" stage for CRM
            $newLeadStage = CrmStage::where('slug', 'new-lead')->first();

            $deal = null;
            if ($newLeadStage) {
                // Create a new CRM Deal
                $deal = CrmDeal::create([
                    'customer_id' => $customer->id,
                    'stage_id' => $newLeadStage->id,
                    'title' => CrmDeal::generateTitle($customer),
                    'currency' => 'USD',
                    'priority' => 'medium',
                    'notes' => $this->buildDealNotes($request),
                    'last_activity_at' => now(),
                ]);

                Log::info('CRM Deal auto-created from web form', [
                    'deal_id' => $deal->id,
                    'customer_id' => $customer->id,
                    'is_new_customer' => $isNewCustomer,
                    'source' => $request->source,
                ]);
            }

            DB::commit();

            // Get active marketing emails
            $marketingEmails = MarketingEmail::active()->pluck('email')->toArray();

            // Send email notification to all active marketing emails
            if (!empty($marketingEmails)) {
                foreach ($marketingEmails as $email) {
                    Mail::to($email)->send(new NewCustomerNotification($customer));
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'თქვენი მოთხოვნა წარმატებით გაიგზავნა',
                'data' => [
                    'id' => $customer->id,
                    'created_at' => $customer->created_at,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer creation failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ მოგვიანებით.'
            ], 500);
        }
    }

    /**
     * Build initial deal notes from the web form submission
     */
    private function buildDealNotes(Request $request): string
    {
        $notes = [];

        if ($request->source === 'contact_form') {
            $notes[] = "წყარო: კონტაქტის ფორმა";
        } else {
            $notes[] = "წყარო: დარეკვის მოთხოვნა";
        }

        if ($request->subject) {
            $notes[] = "თემა: {$request->subject}";
        }

        if ($request->message) {
            $notes[] = "შეტყობინება: {$request->message}";
        }

        return implode("\n", $notes);
    }
}
