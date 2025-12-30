<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class AdminApartmentDetectionController extends Controller
{
    /**
     * Detect apartments from a PDF with red lines.
     * 
     * Two-image workflow:
     * - source_pdf: PDF file with red lines marking apartment boundaries
     * - target_image: Clean PNG/JPG image for polygon alignment (optional)
     * 
     * If target_image is provided, polygons are transformed to match target coordinates.
     * 
     * Returns:
     * - JSON with detected apartment polygons (coordinates as percentages)
     */
    public function detect(Request $request)
    {
        // Increase PHP execution time for this long-running process
        set_time_limit(180); // 3 minutes

        $request->validate([
            'source_pdf' => 'required|file|mimes:pdf|max:20480', // max 20MB
            'target_image' => 'nullable|file|mimes:png,jpg,jpeg|max:20480', // optional clean image
        ]);

        $tempPaths = [];

        try {
            // Store source PDF temporarily
            $sourcePdf = $request->file('source_pdf');
            $tempPaths['source'] = $sourcePdf->store('temp/apartment-detection');
            $sourcePath = Storage::path($tempPaths['source']);

            // Store target image if provided
            $targetPath = null;
            if ($request->hasFile('target_image')) {
                $targetImage = $request->file('target_image');
                $tempPaths['target'] = $targetImage->store('temp/apartment-detection');
                $targetPath = Storage::path($tempPaths['target']);
            }

            // Run Python detection script
            $scriptPath = base_path('scripts/detect_apartments.py');

            // Try virtual environment first, then system Python
            $venvPython = base_path('scripts/venv/bin/python3');
            // Get Python path from environment (for cPanel or custom setups)
            $envPython = env('PYTHON_PATH');

            // Debug logging for path resolution
            if ($envPython) {
                Log::info('Checking configured PYTHON_PATH', [
                    'path' => $envPython,
                    'exists' => file_exists($envPython),
                    'is_file' => is_file($envPython),
                    'is_executable' => is_executable($envPython),
                    'cwd' => getcwd(),
                    'user' => get_current_user()
                ]);
            }

            $pythonPaths = array_filter([
                $envPython, // From .env (production cPanel, etc.)
                $venvPython, // Local virtual environment
                '/usr/bin/python3',
                '/usr/local/bin/python3',
                '/opt/homebrew/bin/python3',
                'python3',
                'python',
            ]);

            $pythonPath = null;
            foreach ($pythonPaths as $path) {
                if (file_exists($path) || $this->commandExists($path)) {
                    $pythonPath = $path;
                    break;
                }
            }

            if (!$pythonPath) {
                $this->cleanupTempFiles($tempPaths);
                return response()->json([
                    'success' => false,
                    'error' => 'Python is not installed on the server'
                ], 500);
            }

            // Build command with arguments
            $command = [$pythonPath, $scriptPath, '--source', $sourcePath];
            if ($targetPath) {
                $command[] = '--target';
                $command[] = $targetPath;
            }

            Log::info('Running apartment detection', [
                'command' => implode(' ', $command),
                'pythonPath' => $pythonPath
            ]);

            $process = new Process($command);
            $process->setTimeout(120); // 2 minutes timeout
            $process->run();

            // Clean up temp files
            $this->cleanupTempFiles($tempPaths);

            if (!$process->isSuccessful()) {
                $errorOutput = $process->getErrorOutput();
                $stdOutput = $process->getOutput();

                Log::error('Apartment detection failed', [
                    'error' => $errorOutput,
                    'output' => $stdOutput,
                    'exitCode' => $process->getExitCode()
                ]);

                // Try to get error from stdout if stderr is empty
                $errorMessage = $errorOutput ?: $stdOutput ?: 'Unknown error occurred';

                return response()->json([
                    'success' => false,
                    'error' => 'Detection failed: ' . $errorMessage
                ], 500);
            }

            $output = $process->getOutput();

            // Attempt clean decode first
            $result = json_decode($output, true);

            // If failed, try to extract JSON from mixed output (e.g. system warnings + JSON)
            if (json_last_error() !== JSON_ERROR_NONE) {
                // Find first '{' and last '}'
                $start = strpos($output, '{');
                $end = strrpos($output, '}');

                if ($start !== false && $end !== false && $end > $start) {
                    $cleanJson = substr($output, $start, $end - $start + 1);
                    $result = json_decode($cleanJson, true);
                }
            }

            if (json_last_error() !== JSON_ERROR_NONE || $result === null) {
                Log::error('Invalid JSON from detection script', [
                    'error' => json_last_error_msg(),
                    'output' => $output
                ]);

                return response()->json([
                    'success' => false,
                    'error' => 'Invalid response from detection script: ' . substr($output, 0, 100)
                ], 500);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            $this->cleanupTempFiles($tempPaths);

            Log::error('Apartment detection exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Detection failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clean up temporary files
     */
    private function cleanupTempFiles(array $tempPaths): void
    {
        foreach ($tempPaths as $path) {
            if ($path) {
                Storage::delete($path);
            }
        }
    }

    /**
     * Check if a command exists
     */
    private function commandExists(string $command): bool
    {
        $return = shell_exec(sprintf("which %s 2>/dev/null", escapeshellarg($command)));
        return !empty($return);
    }
}
