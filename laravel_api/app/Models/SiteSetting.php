<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;
use App\Traits\InvalidatesHomepageCache;
use Illuminate\Database\Eloquent\Casts\Attribute;

class SiteSetting extends Model
{
    use HasFactory, HasTranslations, InvalidatesHomepageCache;

    protected $fillable = [
        'key',
        'value',
        'group',
        'is_translatable',
        'description',
        'active'
    ];

    public $translatable = ['value'];

    protected $casts = [
        'value' => 'array',
        'is_translatable' => 'boolean',
        'active' => 'boolean',
    ];

    /**
     * Scope to get settings by group
     */
    public function scopeByGroup($query, string $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Scope to get active settings
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Get settings as key-value pairs
     */
    public static function getSettingsForGroup(string $group, string $locale = 'ka'): array
    {
        // Since all settings are stored with empty group, we need to filter by key patterns instead
        if ($group === 'contact') {
            $contactKeys = [
                'contact_address', 'contact_address_subtitle', 'contact_phone', 'contact_phone_subtitle',
                'contact_email', 'contact_email_subtitle', 'contact_hours', 'contact_hours_subtitle',
                'contact_phone2', 'contact_phone2_subtitle', 'map_latitude', 'map_longitude', 'map_zoom',
                'form_subjects', 'office_working_days', 'office_weekend_days', 'faqs'
            ];
            $settings = self::whereIn('key', $contactKeys)->active()->get();
        } elseif ($group === 'social') {
            $socialKeys = ['facebook_url', 'instagram_url'];
            $settings = self::whereIn('key', $socialKeys)->active()->get();
        } else {
            $settings = self::byGroup($group)->active()->get();
        }
        
        $result = [];

        foreach ($settings as $setting) {
            if ($setting->is_translatable) {
                $result[$setting->key] = $setting->getTranslation('value', $locale);
            } else {
                // For non-translatable fields, extract the actual value from the translation array
                // Spatie's HasTranslations always wraps values, so we need to unwrap them
                $value = $setting->value;
                if (is_array($value) && count($value) > 0) {
                    // Get the first value from the array (regardless of locale key)
                    $result[$setting->key] = reset($value);
                } else {
                    $result[$setting->key] = $value;
                }
            }
        }

        return $result;
    }

    /**
     * Get structured contact settings
     */
    public static function getContactSettings(string $locale = 'ka'): array
    {
        $settings = self::getSettingsForGroup('contact', $locale);
        
        return [
            'contact_info' => [
                'address' => [
                    'value' => $settings['contact_address'] ?? '',
                    'subtitle' => $settings['contact_address_subtitle'] ?? '',
                ],
                'phone' => [
                    'value' => $settings['contact_phone'] ?? '',
                    'subtitle' => $settings['contact_phone_subtitle'] ?? '',
                ],
                'phone2' => [
                    'value' => $settings['contact_phone2'] ?? '',
                    'subtitle' => $settings['contact_phone2_subtitle'] ?? '',
                ],
                'email' => [
                    'value' => $settings['contact_email'] ?? '',
                    'subtitle' => $settings['contact_email_subtitle'] ?? '',
                ],
                'hours' => [
                    'value' => $settings['contact_hours'] ?? '',
                    'subtitle' => $settings['contact_hours_subtitle'] ?? '',
                ],
            ],
            'social_links' => [
                'facebook' => $settings['facebook_url'] ?? '',
                'instagram' => $settings['instagram_url'] ?? '',
                'linkedin' => $settings['linkedin_url'] ?? '',
            ],
            'map_settings' => [
                'latitude' => (float)($settings['map_latitude'] ?? 41.715115),
                'longitude' => (float)($settings['map_longitude'] ?? 44.783300),
                'zoom' => (int)($settings['map_zoom'] ?? 16),
            ],
            'form_subjects' => $settings['form_subjects'] ?? [
                ['value' => 'general', 'label' => 'General Information'],
                ['value' => 'project', 'label' => 'New Project'],
                ['value' => 'consultation', 'label' => 'Consultation'],
                ['value' => 'partnership', 'label' => 'Partnership'],
            ],
            'faqs' => $settings['faqs'] ?? [],
            'office_days' => [
                'working' => $settings['office_working_days'] ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                'weekend' => $settings['office_weekend_days'] ?? ['Sat', 'Sun'],
            ],
        ];
    }

    /**
     * Get contact settings with all translations for admin panel
     */
    public static function getContactSettingsAllLocales(): array
    {
        $settings = self::byGroup('contact')->active()->get();
        $result = [];

        foreach ($settings as $setting) {
            if ($setting->is_translatable) {
                // Special handling for office days - use only English day codes for admin
                if (in_array($setting->key, ['office_working_days', 'office_weekend_days'])) {
                    $result[$setting->key] = $setting->getTranslation('value', 'en') ?? [];
                } elseif (in_array($setting->key, ['faqs', 'form_subjects'])) {
                    // Special handling for translatable array fields - extract English array
                    $translations = $setting->getTranslations('value');
                    if (isset($translations['en']) && is_array($translations['en'])) {
                        $result[$setting->key] = $translations['en'];
                    } elseif (isset($translations['ka']) && is_array($translations['ka'])) {
                        $result[$setting->key] = $translations['ka'];
                    } elseif (isset($translations['ru']) && is_array($translations['ru'])) {
                        $result[$setting->key] = $translations['ru'];
                    } else {
                        $result[$setting->key] = [];
                    }
                } else {
                    // Get all translations, ensure empty string for missing translations
                    $translations = $setting->getTranslations('value');
                    $result[$setting->key] = [
                        'ka' => isset($translations['ka']) ? $translations['ka'] : '',
                        'en' => isset($translations['en']) ? $translations['en'] : '',
                        'ru' => isset($translations['ru']) ? $translations['ru'] : '',
                    ];
                }
            } else {
                // Special handling for array fields that contain locale-wrapped data
                if (in_array($setting->key, ['faqs', 'form_subjects'])) {
                    $rawValue = $setting->getRawOriginal('value');
                    
                    if (is_string($rawValue)) {
                        $decoded = json_decode($rawValue, true);
                        if (is_array($decoded)) {
                            // Extract the English array (or first available locale)
                            if (isset($decoded['en']) && is_array($decoded['en'])) {
                                $result[$setting->key] = $decoded['en'];
                            } elseif (isset($decoded['ka']) && is_array($decoded['ka'])) {
                                $result[$setting->key] = $decoded['ka'];
                            } elseif (isset($decoded['ru']) && is_array($decoded['ru'])) {
                                $result[$setting->key] = $decoded['ru'];
                            } else {
                                // If no locale arrays found, try to get direct array
                                $result[$setting->key] = $decoded;
                            }
                        } else {
                            $result[$setting->key] = [];
                        }
                    } else {
                        $result[$setting->key] = [];
                    }
                } else {
                    $result[$setting->key] = $setting->value;
                }
            }
        }

        return [
            'contact_info' => [
                'address' => [
                    'value' => $result['contact_address'] ?? ['ka' => '', 'en' => '', 'ru' => ''],
                    'subtitle' => $result['contact_address_subtitle'] ?? ['ka' => '', 'en' => '', 'ru' => ''],
                ],
                'phone' => [
                    'value' => (isset($result['contact_phone']['en']) ? $result['contact_phone']['en'] : ($result['contact_phone'] ?? '')),
                    'subtitle' => $result['contact_phone_subtitle'] ?? ['ka' => '', 'en' => '', 'ru' => ''],
                ],
                'phone2' => [
                    'value' => (isset($result['contact_phone2']['en']) ? $result['contact_phone2']['en'] : ($result['contact_phone2'] ?? '')),
                    'subtitle' => $result['contact_phone2_subtitle'] ?? ['ka' => '', 'en' => '', 'ru' => ''],
                ],
                'email' => [
                    'value' => (isset($result['contact_email']['en']) ? $result['contact_email']['en'] : ($result['contact_email'] ?? '')),
                    'subtitle' => $result['contact_email_subtitle'] ?? ['ka' => '', 'en' => '', 'ru' => ''],
                ],
                'hours' => [
                    'value' => $result['contact_hours'] ?? ['ka' => '', 'en' => '', 'ru' => ''],
                    'subtitle' => $result['contact_hours_subtitle'] ?? ['ka' => '', 'en' => '', 'ru' => ''],
                ],
            ],
            'social_links' => [
                'facebook' => $result['facebook_url'] ?? '',
                'instagram' => $result['instagram_url'] ?? '',
            ],
            'map_settings' => [
                'latitude' => (float)($result['map_latitude'] ?? 41.715115),
                'longitude' => (float)($result['map_longitude'] ?? 44.783300),
                'zoom' => (int)($result['map_zoom'] ?? 16),
            ],
            'form_subjects' => $result['form_subjects'] ?? [
                ['value' => 'general', 'label' => ['ka' => 'ზოგადი ინფორმაცია', 'en' => 'General Information', 'ru' => 'Общая информация']],
                ['value' => 'project', 'label' => ['ka' => 'ახალი პროექტი', 'en' => 'New Project', 'ru' => 'Новый проект']],
                ['value' => 'consultation', 'label' => ['ka' => 'კონსულტაცია', 'en' => 'Consultation', 'ru' => 'Консультация']],
                ['value' => 'partnership', 'label' => ['ka' => 'პარტნიორობა', 'en' => 'Partnership', 'ru' => 'Партнерство']],
            ],
            'faqs' => $result['faqs'] ?? [],
            'office_days' => [
                'working' => $result['office_working_days'] ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                'weekend' => $result['office_weekend_days'] ?? ['Sat', 'Sun'],
            ],
        ];
    }

    /**
     * Update or create a setting
     */
    public static function updateSetting(string $key, $value, string $group = 'general', bool $isTranslatable = false, string $description = ''): self
    {
        return self::updateOrCreate(
            ['key' => $key, 'group' => $group],
            [
                'value' => $value,
                'is_translatable' => $isTranslatable,
                'description' => $description,
                'active' => true,
            ]
        );
    }
}