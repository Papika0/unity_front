<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SiteSetting;

class SiteSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Contact Information Settings
        $this->seedContactSettings();
        
        // About Information Settings  
        $this->seedAboutSettings();
        
        // Additional default settings
        $this->seedDefaultSettings();
    }

    /**
     * Seed contact settings
     */
    protected function seedContactSettings(): void
    {
        $contactSettings = [
            // Contact Info - Translatable
            [
                'key' => 'contact_address',
                'value' => [
                    'ka' => 'ვაშლიჯვარი ქუჩა 47',
                    'en' => 'Vashlijvari Street 47'
                ],
                'group' => 'contact',
                'is_translatable' => true,
                'description' => 'Company address'
            ],
            [
                'key' => 'contact_address_subtitle',
                'value' => [
                    'ka' => 'თბილისი, საქართველო',
                    'en' => 'Tbilisi, Georgia'
                ],
                'group' => 'contact',
                'is_translatable' => true,
                'description' => 'Address subtitle/city'
            ],
            [
                'key' => 'contact_phone',
                'value' => '+995 577 300 333',
                'group' => 'contact',
                'is_translatable' => false,
                'description' => 'Primary phone number'
            ],
            [
                'key' => 'contact_phone_subtitle',
                'value' => [
                    'ka' => 'ყოველდღიური მხარდაჭერა',
                    'en' => 'Daily support'
                ],
                'group' => 'contact',
                'is_translatable' => true,
                'description' => 'Phone subtitle'
            ],
            [
                'key' => 'contact_email',
                'value' => 'info@unitydev.ge',
                'group' => 'contact',
                'is_translatable' => false,
                'description' => 'Contact email address'
            ],
            [
                'key' => 'contact_email_subtitle',
                'value' => [
                    'ka' => 'სწრაფი პასუხი',
                    'en' => 'Quick response'
                ],
                'group' => 'contact',
                'is_translatable' => true,
                'description' => 'Email subtitle'
            ],
            [
                'key' => 'contact_hours',
                'value' => [
                    'ka' => 'ორშ-პარ: 09:00–18:00',
                    'en' => 'Mon-Fri: 09:00–18:00'
                ],
                'group' => 'contact',
                'is_translatable' => true,
                'description' => 'Working hours'
            ],
            [
                'key' => 'contact_hours_subtitle',
                'value' => [
                    'ka' => 'თბილისის დროით',
                    'en' => 'Tbilisi time'
                ],
                'group' => 'contact',
                'is_translatable' => true,
                'description' => 'Hours subtitle/timezone'
            ],

            // Social Media Links
            [
                'key' => 'facebook_url',
                'value' => 'https://facebook.com/unitydev',
                'group' => 'contact',
                'is_translatable' => false,
                'description' => 'Facebook page URL'
            ],
            [
                'key' => 'instagram_url', 
                'value' => 'https://instagram.com/unitydev',
                'group' => 'contact',
                'is_translatable' => false,
                'description' => 'Instagram page URL'
            ],
            [
                'key' => 'linkedin_url',
                'value' => 'https://linkedin.com/company/unitydev',
                'group' => 'contact',
                'is_translatable' => false,
                'description' => 'LinkedIn page URL'
            ],

            // Map Settings
            [
                'key' => 'map_latitude',
                'value' => 41.715115,
                'group' => 'contact',
                'is_translatable' => false,
                'description' => 'Map latitude coordinate'
            ],
            [
                'key' => 'map_longitude',
                'value' => 44.783300,
                'group' => 'contact',
                'is_translatable' => false,
                'description' => 'Map longitude coordinate'
            ],
            [
                'key' => 'map_zoom',
                'value' => 16,
                'group' => 'contact',
                'is_translatable' => false,
                'description' => 'Default map zoom level'
            ],

            // Form Subjects - Translatable
            [
                'key' => 'form_subjects',
                'value' => [
                    'ka' => [
                        ['value' => 'general', 'label' => 'ზოგადი ინფორმაცია'],
                        ['value' => 'project', 'label' => 'ახალი პროექტი'],
                        ['value' => 'consultation', 'label' => 'კონსულტაცია'],
                        ['value' => 'partnership', 'label' => 'პარტნიორობა'],
                    ],
                    'en' => [
                        ['value' => 'general', 'label' => 'General Information'],
                        ['value' => 'project', 'label' => 'New Project'],
                        ['value' => 'consultation', 'label' => 'Consultation'],
                        ['value' => 'partnership', 'label' => 'Partnership'],
                    ]
                ],
                'group' => 'contact',
                'is_translatable' => true,
                'description' => 'Contact form subject options'
            ],

            // Office Days
            [
                'key' => 'office_working_days',
                'value' => [
                    'ka' => ['ორ', 'სა', 'ოთ', 'ხუ', 'პა'],
                    'en' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                ],
                'group' => 'contact',
                'is_translatable' => true,
                'description' => 'Working days abbreviations'
            ],
            [
                'key' => 'office_weekend_days',
                'value' => [
                    'ka' => ['შა', 'კვ'],
                    'en' => ['Sat', 'Sun']
                ],
                'group' => 'contact',
                'is_translatable' => true,
                'description' => 'Weekend days abbreviations'
            ],

            // FAQs - Translatable
            [
                'key' => 'faqs',
                'value' => [
                    'ka' => [
                        [
                            'question' => 'რამდენ ხანში ხდება პროექტის განხორციელება?',
                            'answer' => 'პროექტის ხანგრძლივობა დამოკიდებულია მისი სირთულესა და მასშტაბზე. საცხოვრებელი პროექტები საშუალოდ 12-18 თვეში სრულდება, კომერციული პროექტები კი 18-24 თვეში.'
                        ],
                        [
                            'question' => 'შეიძლება ონლაინ კონსულტაცია?',
                            'answer' => 'რა თქმა უნდა. ჩვენ ვთავაზობთ პროფესიონალურ ონლაინ კონსულტაციებს ვიდეო კავშირის საშუალებით, რაც განსაკუთრებით კომფორტულია საწყისი შეხვედრებისთვის.'
                        ],
                        [
                            'question' => 'რა ღირებულება აქვს თქვენს სერვისს?',
                            'answer' => 'ღირებულება ინდივიდუალურია და დამოკიდებულია პროექტის სირთულეზე. პირველი კონსულტაცია უფასოა, რის შემდეგაც მიიღებთ დეტალურ შეფასებას.'
                        ],
                        [
                            'question' => 'რა გარანტიებს იძლევით?',
                            'answer' => 'ჩვენ ვთავაზობთ 5 წლიან გარანტიას ყველა შესრულებულ სამუშაოზე და უფასო კონსულტაციებს პროექტის დასრულებიდან 1 წლის განმავლობაში.'
                        ]
                    ],
                    'en' => [
                        [
                            'question' => 'How long does project implementation take?',
                            'answer' => 'Project duration depends on its complexity and scale. Residential projects are completed on average in 12-18 months, while commercial projects take 18-24 months.'
                        ],
                        [
                            'question' => 'Is online consultation possible?',
                            'answer' => 'Absolutely. We offer professional online consultations via video conferencing, which is particularly convenient for initial meetings.'
                        ],
                        [
                            'question' => 'What is the cost of your service?',
                            'answer' => 'The cost is individual and depends on the complexity of the project. The first consultation is free, after which you will receive a detailed assessment.'
                        ],
                        [
                            'question' => 'What guarantees do you provide?',
                            'answer' => 'We offer a 5-year warranty on all completed work and free consultations for 1 year after project completion.'
                        ]
                    ]
                ],
                'group' => 'contact',
                'is_translatable' => true,
                'description' => 'Frequently Asked Questions'
            ],
        ];

        foreach ($contactSettings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key'], 'group' => $setting['group']],
                $setting
            );
        }
    }

    /**
     * Seed about settings
     */
    protected function seedAboutSettings(): void
    {
        $aboutSettings = [
            [
                'key' => 'successful_projects',
                'value' => '5+',
                'group' => 'about',
                'is_translatable' => false,
                'description' => 'Number of successful projects'
            ],
            [
                'key' => 'years_experience',
                'value' => '15+',
                'group' => 'about',
                'is_translatable' => false,
                'description' => 'Years of experience'
            ],
            [
                'key' => 'satisfied_clients',
                'value' => '50+',
                'group' => 'about',
                'is_translatable' => false,
                'description' => 'Number of satisfied clients'
            ],
            [
                'key' => 'client_satisfaction',
                'value' => '98%',
                'group' => 'about',
                'is_translatable' => false,
                'description' => 'Client satisfaction percentage'
            ],
        ];

        foreach ($aboutSettings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key'], 'group' => $setting['group']],
                $setting
            );
        }
    }

    /**
     * Seed default settings
     */
    protected function seedDefaultSettings(): void
    {
        // Add any additional default settings here
    }
}