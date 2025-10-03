<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\MarketingEmail;
use App\Mail\NewCustomerNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * Store a new customer inquiry
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
            // Create customer record
            $customer = Customer::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'subject' => $request->subject,
                'message' => $request->message,
                'source' => $request->source,
                'status' => 'new',
            ]);

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
            \Log::error('Customer creation failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ მოგვიანებით.'
            ], 500);
        }
    }
}
