<?php

namespace App\Services;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class SiteSettingsService
{
    protected $configPath;

    public function __construct()
    {
        $this->configPath = config_path('site_settings.php');
    }

    /**
     * Get contact info from config
     */
    public function getContactInfo(): array
    {
        return config('site_settings.contact_info', []);
    }

    /**
     * Get about info from config
     */
    public function getAboutInfo(): array
    {
        $aboutInfo = config('site_settings.about_info', []);

        // Add image URLs if they exist
        if (isset($aboutInfo['hero_image_id'])) {
            $heroImage = \App\Models\Image::find($aboutInfo['hero_image_id']);
            $aboutInfo['hero_image_url'] = $heroImage ? $heroImage->full_url : null;
        }

        if (isset($aboutInfo['philosophy_image_id'])) {
            $philosophyImage = \App\Models\Image::find($aboutInfo['philosophy_image_id']);
            $aboutInfo['philosophy_image_url'] = $philosophyImage ? $philosophyImage->full_url : null;
        }

        return $aboutInfo;
    }

    /**
     * Update contact info in config file
     */
    public function updateContactInfo(array $data): bool
    {
        try {
            // Auto-generate href for phone numbers
            if (isset($data['phone_numbers']) && is_array($data['phone_numbers'])) {
                foreach ($data['phone_numbers'] as &$phone) {
                    if (!empty($phone['number'])) {
                        $phone['href'] = 'tel:' . $phone['number'];
                    }
                }
            }

            // Get current config
            $config = config('site_settings');

            // Update contact info
            $config['contact_info'] = $data;

            // Write back to config file
            return $this->writeConfigFile($config);
        } catch (\Exception $e) {
            Log::error('Failed to update contact info: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update about info in config file
     */
    public function updateAboutInfo(array $data): bool
    {
        try {
            // Get current config
            $config = config('site_settings');

            // Update about info
            $config['about_info'] = $data;

            // Write back to config file
            return $this->writeConfigFile($config);
        } catch (\Exception $e) {
            Log::error('Failed to update about info: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Write config array to file
     */
    protected function writeConfigFile(array $config): bool
    {
        $configContent = "<?php\n\nreturn " . var_export($config, true) . ";\n";

        // Format the content to be more readable
        $configContent = $this->formatConfigContent($configContent);

        return File::put($this->configPath, $configContent) !== false;
    }

    /**
     * Format config content for better readability
     */
    protected function formatConfigContent(string $content): string
    {
        // Basic formatting - you can enhance this as needed
        $content = str_replace('array (', '[', $content);
        $content = str_replace(')', ']', $content);
        $content = str_replace('  ', '    ', $content); // 4-space indentation

        return $content;
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
}
