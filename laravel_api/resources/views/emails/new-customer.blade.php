<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #FFCD4B 0%, #EBB738 100%);
            color: #000;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .logo {
            max-width: 120px;
            height: auto;
            margin-bottom: 15px;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
        }
        .info-row {
            margin-bottom: 15px;
            padding: 10px;
            background: white;
            border-radius: 4px;
        }
        .label {
            font-weight: bold;
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .value {
            margin-top: 5px;
            color: #111827;
            font-size: 14px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 5px;
        }
        .badge-contact {
            background: #dbeafe;
            color: #1e40af;
        }
        .badge-call {
            background: #dcfce7;
            color: #166534;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ asset('images/logo_black.png') }}" alt="Unity Logo" class="logo">
            <h1 style="margin: 0; font-size: 24px; font-weight: 300;">ახალი კლიენტის მოთხოვნა</h1>
        </div>

        <div class="content">
            <p style="font-size: 16px; margin-bottom: 20px;">მოგესალმებით,</p>
            <p style="margin-bottom: 20px;">თქვენ მიიღეთ ახალი მომხმარებლის განაცხადი.</p>

            <div class="info-row">
                <div class="label">სახელი</div>
                <div class="value">{{ $customer->name }}</div>
            </div>

            <div class="info-row">
                <div class="label">ელ. ფოსტა</div>
                <div class="value">
                    <a href="mailto:{{ $customer->email }}" style="color: #2563eb; text-decoration: none;">
                        {{ $customer->email }}
                    </a>
                </div>
            </div>

            <div class="info-row">
                <div class="label">ტელეფონი</div>
                <div class="value">
                    <a href="tel:{{ $customer->phone }}" style="color: #2563eb; text-decoration: none;">
                        {{ $customer->phone }}
                    </a>
                </div>
            </div>

            @if($customer->subject)
            <div class="info-row">
                <div class="label">თემა</div>
                <div class="value">{{ $customer->subject }}</div>
            </div>
            @endif

            @if($customer->message)
            <div class="info-row">
                <div class="label">შეტყობინება</div>
                <div class="value" style="white-space: pre-wrap;">{{ $customer->message }}</div>
            </div>
            @endif

            <div class="info-row">
                <div class="label">წყარო</div>
                <div class="value">
                    @if($customer->source === 'contact_form')
                        <span class="badge badge-contact">კონტაქტის ფორმა</span>
                    @else
                        <span class="badge badge-call">ზარის მოთხოვნა</span>
                    @endif
                </div>
            </div>

            <div class="info-row">
                <div class="label">თარიღი</div>
                <div class="value">{{ $customer->created_at->format('d.m.Y H:i') }}</div>
            </div>
        </div>

        <div class="footer">
            <p>ეს შეტყობინება გაგზავნილია ავტომატურად Unity-ს ვებსაიტიდან.</p>
            <p>&copy; {{ date('Y') }} Unity. ყველა უფლება დაცულია.</p>
        </div>
    </div>
</body>
</html>
