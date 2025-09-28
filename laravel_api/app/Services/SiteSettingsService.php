<?php

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class SiteSettingsService
{
    /**
     * Get contact settings from database
     */
    public function getContactSettings(string $locale = 'ka'): array
    {
        $cacheKey = "contact_settings_{$locale}";
        
        return Cache::remember($cacheKey, 3600, function () use ($locale) {
            return SiteSetting::getContactSettings($locale);
        });
    }

    /**
     * Get contact settings with all translations for admin panel
     */
    public function getContactSettingsAllLocales(): array
    {
        $cacheKey = "contact_settings_all_locales";
        
        return Cache::remember($cacheKey, 3600, function () {
            return SiteSetting::getContactSettingsAllLocales();
        });
    }

    /**
     * Get contact info from database (legacy support)
     */
    public function getContactInfo(): array
    {
        // Get basic contact info for legacy compatibility
        $settings = SiteSetting::getSettingsForGroup('contact');
        
        return [
            'email' => $settings['contact_email'] ?? '',
            'phone_numbers' => $this->formatPhoneNumbers($settings),
            'google_maps_url' => $this->formatGoogleMapsUrl($settings),
        ];
    }

    /**
     * Get about info from database
     */
    public function getAboutInfo(): array
    {
        $aboutSettings = SiteSetting::getSettingsForGroup('about');

        // Get stats from database
        $aboutInfo = [
            'stats' => [
                'successful_projects' => $aboutSettings['successful_projects'] ?? '5+',
                'years_experience' => $aboutSettings['years_experience'] ?? '15+',
                'satisfied_clients' => $aboutSettings['satisfied_clients'] ?? '50+',
                'client_satisfaction' => $aboutSettings['client_satisfaction'] ?? '98%',
            ]
        ];

        // Add image URLs if they exist
        if (isset($aboutSettings['hero_image_id'])) {
            $heroImage = \App\Models\Image::find($aboutSettings['hero_image_id']);
            $aboutInfo['hero_image_url'] = $heroImage ? $heroImage->full_url : null;
        }

        if (isset($aboutSettings['philosophy_image_id'])) {
            $philosophyImage = \App\Models\Image::find($aboutSettings['philosophy_image_id']);
            $aboutInfo['philosophy_image_url'] = $philosophyImage ? $philosophyImage->full_url : null;
        }

        return $aboutInfo;
    }

    /**
     * Format phone numbers for legacy compatibility
     */
    protected function formatPhoneNumbers(array $settings): array
    {
        $phoneNumbers = [];
        
        if (!empty($settings['contact_phone'])) {
            $phoneNumbers[] = [
                'number' => $settings['contact_phone'],
                'display' => $settings['contact_phone'],
                'href' => 'tel:' . $settings['contact_phone'],
            ];
        }

        // Add additional phone numbers if they exist
        if (!empty($settings['contact_phone_2'])) {
            $phoneNumbers[] = [
                'number' => $settings['contact_phone_2'],
                'display' => $settings['contact_phone_2'],
                'href' => 'tel:' . $settings['contact_phone_2'],
            ];
        }

        return $phoneNumbers;
    }

    /**
     * Format Google Maps URL
     */
    protected function formatGoogleMapsUrl(array $settings): string
    {
        if (!empty($settings['map_latitude']) && !empty($settings['map_longitude'])) {
            return "https://maps.google.com/maps?q={$settings['map_latitude']},{$settings['map_longitude']}";
        }
        
        return $settings['google_maps_url'] ?? '';
    }

    /**
     * Update contact settings in database
     */
    public function updateContactSettings(array $data): bool
    {
        try {
            // Validate the data first
            $validationErrors = $this->validateContactSettings($data);
            if (!empty($validationErrors)) {
                throw new \InvalidArgumentException('Validation failed: ' . json_encode($validationErrors));
            }

            // Clear cache for all locales
            $locales = ['ka', 'en', 'ru'];
            foreach ($locales as $locale) {
                Cache::forget("contact_settings_{$locale}");
            }
            Cache::forget("contact_settings_all_locales");

            // Update contact info fields
            if (isset($data['contact_info'])) {
                $this->updateContactInfoSettings($data['contact_info']);
            }

            // Update social links
            if (isset($data['social_links'])) {
                $this->updateSocialLinks($data['social_links']);
            }

            // Update map settings
            if (isset($data['map_settings'])) {
                $this->updateMapSettings($data['map_settings']);
            }

            // Update form subjects
            if (isset($data['form_subjects'])) {
                SiteSetting::updateSetting('form_subjects', $data['form_subjects'], 'contact', true);
            }

            // Update FAQs
            if (isset($data['faqs'])) {
                SiteSetting::updateSetting('faqs', $data['faqs'], 'contact', true);
            }

            // Update office days
            if (isset($data['office_days'])) {
                SiteSetting::updateSetting('office_working_days', $data['office_days']['working'] ?? [], 'contact');
                SiteSetting::updateSetting('office_weekend_days', $data['office_days']['weekend'] ?? [], 'contact');
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to update contact settings: ' . $e->getMessage(), [
                'data' => $data,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Update contact info in database (legacy support)
     */
    public function updateContactInfo(array $data): bool
    {
        try {
            // Update email
            if (isset($data['email'])) {
                SiteSetting::updateSetting('contact_email', $data['email'], 'contact');
            }

            // Update phone numbers
            if (isset($data['phone_numbers']) && is_array($data['phone_numbers'])) {
                foreach ($data['phone_numbers'] as $index => $phone) {
                    $key = $index === 0 ? 'contact_phone' : "contact_phone_" . ($index + 1);
                    SiteSetting::updateSetting($key, $phone['number'], 'contact');
                }
            }

            // Update Google Maps URL
            if (isset($data['google_maps_url'])) {
                SiteSetting::updateSetting('google_maps_url', $data['google_maps_url'], 'contact');
            }

            // Clear cache
            Cache::forget('contact_settings_ka');
            Cache::forget('contact_settings_en');

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to update contact info: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update about info in database
     */
    public function updateAboutInfo(array $data): bool
    {
        try {
            // Update stats
            if (isset($data['stats']) && is_array($data['stats'])) {
                foreach ($data['stats'] as $key => $value) {
                    SiteSetting::updateSetting($key, $value, 'about');
                }
            }

            // Update image IDs
            if (isset($data['hero_image_id'])) {
                SiteSetting::updateSetting('hero_image_id', $data['hero_image_id'], 'about');
            }

            if (isset($data['philosophy_image_id'])) {
                SiteSetting::updateSetting('philosophy_image_id', $data['philosophy_image_id'], 'about');
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to update about info: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update contact info settings
     */
    protected function updateContactInfoSettings(array $contactInfo): void
    {
        $fields = ['address', 'phone', 'phone2', 'email', 'hours'];
        
        foreach ($fields as $field) {
            if (isset($contactInfo[$field])) {
                if (isset($contactInfo[$field]['value'])) {
                    SiteSetting::updateSetting("contact_{$field}", $contactInfo[$field]['value'], 'contact', true);
                }
                if (isset($contactInfo[$field]['subtitle'])) {
                    SiteSetting::updateSetting("contact_{$field}_subtitle", $contactInfo[$field]['subtitle'], 'contact', true);
                }
            }
        }
    }

    /**
     * Update social links
     */
    protected function updateSocialLinks(array $socialLinks): void
    {
        foreach ($socialLinks as $platform => $url) {
            SiteSetting::updateSetting("{$platform}_url", $url, 'contact');
        }
    }

    /**
     * Update map settings
     */
    protected function updateMapSettings(array $mapSettings): void
    {
        foreach ($mapSettings as $key => $value) {
            SiteSetting::updateSetting("map_{$key}", $value, 'contact');
        }
    }

    /**
     * Validate contact info data
     */
    public function validateContactInfo(array $data): array
    {
        $errors = [];

        // Validate email
        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Valid email is required';
        }

        // Validate phone numbers
        if (empty($data['phone_numbers']) || !is_array($data['phone_numbers'])) {
            $errors['phone_numbers'] = 'At least one phone number is required';
        } else {
            foreach ($data['phone_numbers'] as $index => $phone) {
                if (empty($phone['number'])) {
                    $errors["phone_numbers.{$index}.number"] = 'Phone number is required';
                }
                if (empty($phone['display'])) {
                    $errors["phone_numbers.{$index}.display"] = 'Phone display format is required';
                }
                // href is auto-generated, no need to validate
            }
        }

        // Validate optional fields
        if (!empty($data['google_maps_url']) && !filter_var($data['google_maps_url'], FILTER_VALIDATE_URL)) {
            $errors['google_maps_url'] = 'Valid URL is required';
        }

        return $errors;
    }

    /**
     * Validate about info data
     */
    public function validateAboutInfo(array $data): array
    {
        $errors = [];

        // Validate stats
        if (empty($data['stats']) || !is_array($data['stats'])) {
            $errors['stats'] = 'Stats data is required';
        } else {
            $requiredStats = ['successful_projects', 'years_experience', 'satisfied_clients', 'client_satisfaction'];
            foreach ($requiredStats as $stat) {
                if (empty($data['stats'][$stat])) {
                    $errors["stats.{$stat}"] = ucfirst(str_replace('_', ' ', $stat)) . ' is required';
                }
            }
        }

        // Validate image IDs if provided
        if (isset($data['hero_image_id']) && !empty($data['hero_image_id'])) {
            if (!\App\Models\Image::where('id', $data['hero_image_id'])->exists()) {
                $errors['hero_image_id'] = 'Hero image not found';
            }
        }

        if (isset($data['philosophy_image_id']) && !empty($data['philosophy_image_id'])) {
            if (!\App\Models\Image::where('id', $data['philosophy_image_id'])->exists()) {
                $errors['philosophy_image_id'] = 'Philosophy image not found';
            }
        }

        return $errors;
    }

    /**
     * Validate contact settings data
     */
    public function validateContactSettings(array $data): array
    {
        $errors = [];

        // Validate contact info
        if (isset($data['contact_info'])) {
            $contactInfo = $data['contact_info'];
            
            // Validate required fields
            $requiredFields = ['address', 'phone', 'email'];
            foreach ($requiredFields as $field) {
                if (empty($contactInfo[$field]['value'])) {
                    $errors["contact_info.{$field}.value"] = ucfirst($field) . ' is required';
                }
            }

            // Validate email format
            if (!empty($contactInfo['email']['value']) && !filter_var($contactInfo['email']['value'], FILTER_VALIDATE_EMAIL)) {
                $errors['contact_info.email.value'] = 'Valid email is required';
            }

            // Validate phone2 if provided
            if (isset($contactInfo['phone2']) && !empty($contactInfo['phone2']['value'])) {
                // Phone2 is optional, but if provided should be valid
                if (strlen($contactInfo['phone2']['value']) < 7) {
                    $errors['contact_info.phone2.value'] = 'Phone2 must be at least 7 characters';
                }
            }
        }

        // Validate social links if provided
        if (isset($data['social_links'])) {
            foreach ($data['social_links'] as $platform => $url) {
                if (!empty($url) && !filter_var($url, FILTER_VALIDATE_URL)) {
                    $errors["social_links.{$platform}"] = "Valid {$platform} URL is required";
                }
            }
        }

        // Validate map settings
        if (isset($data['map_settings'])) {
            $mapSettings = $data['map_settings'];
            
            if (isset($mapSettings['latitude']) && ($mapSettings['latitude'] < -90 || $mapSettings['latitude'] > 90)) {
                $errors['map_settings.latitude'] = 'Latitude must be between -90 and 90';
            }
            
            if (isset($mapSettings['longitude']) && ($mapSettings['longitude'] < -180 || $mapSettings['longitude'] > 180)) {
                $errors['map_settings.longitude'] = 'Longitude must be between -180 and 180';
            }
            
            if (isset($mapSettings['zoom']) && ($mapSettings['zoom'] < 1 || $mapSettings['zoom'] > 20)) {
                $errors['map_settings.zoom'] = 'Zoom must be between 1 and 20';
            }
        }

        // Validate office days
        if (isset($data['office_days'])) {
            $validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            
            if (isset($data['office_days']['working'])) {
                foreach ($data['office_days']['working'] as $day) {
                    if (!in_array($day, $validDays)) {
                        $errors['office_days.working'] = 'Invalid working day: ' . $day;
                    }
                }
            }
            
            if (isset($data['office_days']['weekend'])) {
                foreach ($data['office_days']['weekend'] as $day) {
                    if (!in_array($day, $validDays)) {
                        $errors['office_days.weekend'] = 'Invalid weekend day: ' . $day;
                    }
                }
            }
        }

        return $errors;
    }
}
