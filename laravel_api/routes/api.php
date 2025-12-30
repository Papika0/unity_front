<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Api\ProjectsController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\HomePageController;
use App\Http\Controllers\Api\FooterController;
use App\Http\Controllers\Api\DebugController;
use App\Http\Controllers\Api\AboutController;
use App\Http\Controllers\Api\ProjectsPageController;
use App\Http\Controllers\Api\FeaturesController;
use App\Http\Controllers\Api\TranslationsController;
use App\Http\Controllers\Admin\AdminNewsController;
use App\Http\Controllers\Admin\AdminProjectsController;
use App\Http\Controllers\Admin\AdminTranslationController;
use App\Http\Controllers\Admin\AdminContactInfoController;
use App\Http\Controllers\Admin\AdminAboutController;
use App\Http\Controllers\Admin\AdminImageController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Admin\AdminCustomerController;
use App\Http\Controllers\Admin\AdminMarketingEmailController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Api\ApartmentNavigationController;
use App\Http\Controllers\Api\ApartmentController;
use App\Http\Controllers\Api\ApartmentsPageController;
use App\Http\Controllers\Admin\AdminBuildingController;
use App\Http\Controllers\Admin\AdminApartmentController;
use App\Http\Controllers\Admin\AdminInteractiveZoneController;
use App\Http\Controllers\Admin\AdminZoneImageController;
use App\Http\Controllers\Admin\AdminBankRateController;
use App\Http\Controllers\Admin\AdminCalculatorController;
use App\Http\Controllers\Admin\CrmStageController;
use App\Http\Controllers\Admin\CrmLostReasonController;
use App\Http\Controllers\Admin\CrmDealController;
use App\Http\Controllers\Admin\CrmActivityController;
use App\Http\Controllers\Admin\CrmPaymentController;
use App\Http\Controllers\Admin\AdminApartmentDetectionController;
use App\Http\Controllers\Api\ImageProxyController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Image proxy route for CORS-enabled image access (must be before other routes)
Route::get('images/{path}', [ImageProxyController::class, 'show'])->where('path', '.*');

// Auth routes with standard rate limiting
Route::prefix('auth')->middleware('throttle:public')->group(function () {
    Route::post('login', LoginController::class);
    Route::post('logout', LogoutController::class)->middleware('auth:api');
});

// Cached public content routes - very permissive rate limiting
Route::middleware('throttle:public-cached')->group(function () {
    // Public news routes
    Route::prefix('news')->controller(NewsController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/featured', 'featured');
        Route::get('/latest', 'latest');
        Route::get('/recent', 'latest'); // Alias for latest
        Route::get('/{id}', 'show');
    });

    // Public projects routes
    Route::prefix('projects')->controller(ProjectsController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/featured', 'featured');
        Route::get('/homepage', 'homepage');
        Route::get('/{id}', 'show');
    });

    // Features routes (public)
    Route::prefix('features')->controller(FeaturesController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/{id}', 'show');
        Route::get('/project/{projectId}', 'getProjectFeatures');
    });

    // Public translations routes (for frontend)
    Route::prefix('public/translations')->controller(TranslationsController::class)->group(function () {
        Route::get('/group/{group}', 'getByGroup');
        Route::post('/groups', 'getByGroups'); // POST to support array of groups in body
    });

    // Homepage routes
    Route::prefix('homepage')->controller(HomePageController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/bootstrap', 'index'); // Alias for backward compatibility
    });

    // Footer routes
    Route::prefix('footer')->controller(FooterController::class)->group(function () {
        Route::get('/', 'index'); // Get all footer data (projects + contact)
        Route::get('/projects', 'projects'); // Get only footer projects
        Route::get('/contact', 'contact'); // Get only footer contact info
    });

    // About page routes
    Route::prefix('about')->controller(AboutController::class)->group(function () {
        Route::get('/', 'index');
    });

    // Projects page routes
    Route::prefix('projects-page')->controller(ProjectsPageController::class)->group(function () {
        Route::get('/', 'index');
    });

    // Gallery page routes
    Route::prefix('gallery-page')->controller(App\Http\Controllers\Api\GalleryPageController::class)->group(function () {
        Route::get('/', 'index');
    });

    // Contact info routes (public)
    Route::get('/contact-info', [App\Http\Controllers\Api\ContactInfoController::class, 'index']);
    Route::get('/contact-info/settings', [App\Http\Controllers\Api\ContactInfoController::class, 'settings']);
    Route::get('/contact/settings', [App\Http\Controllers\Api\ContactInfoController::class, 'settings']);

    // Gallery routes (public)
    Route::prefix('gallery')->controller(GalleryController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/categories', 'categories');
        Route::get('/{id}', 'show');
    });

    // Apartment navigation routes (public)
    Route::get('/projects/{projectId}/apartment-navigation', [ApartmentNavigationController::class, 'index']);

    // Buildings routes (public)
    Route::get('/projects/{projectId}/buildings', [App\Http\Controllers\Api\BuildingsController::class, 'index']);
    Route::get('/projects/{projectId}/buildings/{buildingIdOrIdentifier}', [App\Http\Controllers\Api\BuildingsController::class, 'show']);

    // Apartment routes (public)
    Route::get('/apartments/bootstrap', [ApartmentsPageController::class, 'bootstrap']); // Combined data endpoint
    Route::get('/apartments/filters', [ApartmentController::class, 'filters']);
    Route::get('/apartments', [ApartmentController::class, 'index']);
    Route::get('/apartments/{id}', [ApartmentController::class, 'show']);

    // Test cache endpoint (no auth required for testing)
    Route::get('/test-cache', [AdminController::class, 'getCacheStats']);
});

// Customer inquiry routes with moderate rate limiting
Route::middleware('throttle:public')->group(function () {
    Route::post('/customers', [CustomerController::class, 'store']);
});

// Authenticated routes with standard API rate limiting
Route::middleware(['auth:api', 'jwt.auth', 'throttle:api'])->group(function () {
    Route::get('/user', [UserController::class, 'getUser']);

    Route::prefix('translations')->controller(AdminTranslationController::class)->group(function () {
        Route::get('/', 'getTranslations');    // Support GET for listing
        Route::post('/', 'getTranslations');   // Keep POST for backwards compatibility
        Route::post('/create', 'createTranslation');
        Route::post('/{id}', 'updateTranslation');
        Route::get('/{id}', 'getTranslation');
        Route::get('/group/{group}', 'getTranslationsByGroup');
    });

    Route::prefix('admin/projects')->controller(AdminProjectsController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/set-featured', 'setFeaturedProjects'); // Set featured projects
        Route::post('/set-homepage', 'setHomepageProjects'); // Set homepage projects
        Route::get('/{id}', 'show');
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
    });

    // Admin features routes
    Route::prefix('admin/features')->controller(FeaturesController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::get('/{id}', 'show');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::post('/project/{projectId}/assign', 'assignToProject');
    });

    // Admin cache management routes
    Route::prefix('admin/cache')->controller(AdminController::class)->group(function () {
        Route::post('/clear', 'clearCache'); // Clear all cache
        Route::post('/clear-specific', 'clearSpecificCache'); // Clear specific cache types
        Route::get('/stats', 'getCacheStats'); // Get cache statistics
    });

    // Admin test routes
    Route::get('/admin/test-auth', [AdminController::class, 'testAuth']);

    // Protected news routes (admin only)
    Route::prefix('admin/news')->controller(AdminNewsController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/for-featured-modal', 'forFeaturedModal'); // Get articles for featured modal
        Route::post('/set-featured', 'setFeatured'); // Set featured news - MUST be before /{id} routes
        Route::get('/{id}', 'show');
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::post('/{id}', 'update'); // Allow POST for multipart updates
        Route::delete('/{id}', 'destroy');
    });

    // Protected contact info routes (admin only) - Single record
    Route::prefix('admin/contact-info')->controller(AdminContactInfoController::class)->group(function () {
        Route::get('/', 'index');           // Get the single contact info record (legacy)
        Route::put('/', 'update');          // Update the contact info record (legacy)
        Route::post('/', 'update');         // Allow POST for form compatibility (legacy)

        // New contact settings endpoints
        Route::get('/settings', 'settings');        // Get complete contact settings
        Route::put('/settings', 'updateSettings');  // Update complete contact settings
        Route::post('/settings', 'updateSettings'); // Allow POST for form compatibility
    });

    // Protected about info routes (admin only) - Single record
    Route::prefix('admin/about-info')->controller(AdminAboutController::class)->group(function () {
        Route::get('/', 'index');           // Get the single about info record
        Route::put('/', 'update');          // Update the about info record
        Route::post('/', 'update');         // Allow POST for form compatibility
    });

    // Protected image management routes (admin only)
    Route::prefix('admin/images')->controller(AdminImageController::class)->group(function () {
        Route::get('/', 'index');           // Get all images with pagination and filtering
        Route::post('/', 'store');          // Upload new image
        Route::get('/gallery', 'gallery');  // Get gallery images by category
        Route::get('/categories', 'categories'); // Get available categories
        Route::get('/projects', 'projects'); // Get available projects
        Route::get('/{id}', 'show');        // Get single image
        Route::put('/{id}', 'update');      // Update image metadata
        Route::delete('/{id}', 'destroy');  // Delete image
        Route::post('/attach', 'attach');   // Attach image to model
        Route::post('/detach', 'detach');   // Detach image from model
    });

    // Dashboard statistics endpoint
    Route::prefix('admin/dashboard')->controller(DashboardController::class)->group(function () {
        Route::get('/statistics', 'statistics');        // Get all dashboard statistics
        Route::post('/clear-cache', 'clearCache');      // Clear application cache
        Route::post('/warm-cache', 'warmCache');        // Warm application cache
    });

    // Protected customer management routes - shared between admin and marketing
    Route::prefix('admin/customers')->group(function () {
        // Routes accessible by both admin and marketing
        Route::middleware('role:admin,marketing')->group(function () {
            Route::get('/', [AdminCustomerController::class, 'index']);                       // Get all customers with filters
            Route::get('/statistics', [AdminCustomerController::class, 'statistics']);        // Get customer statistics
            Route::get('/chart-data', [AdminCustomerController::class, 'chartData']);         // Get chart data for last 30 days
            Route::get('/{id}', [AdminCustomerController::class, 'show']);                   // Get single customer
            Route::put('/{id}/status', [AdminCustomerController::class, 'updateStatus']);     // Update customer status only
        });

        // Routes accessible by admin only
        Route::middleware('role:admin')->group(function () {
            Route::put('/{id}', [AdminCustomerController::class, 'update']);                 // Update customer (status, notes)
            Route::delete('/{id}', [AdminCustomerController::class, 'destroy']);             // Delete customer
            Route::post('/bulk-update-status', [AdminCustomerController::class, 'bulkUpdateStatus']); // Bulk update status
            Route::post('/bulk-delete', [AdminCustomerController::class, 'bulkDelete']);     // Bulk delete
        });
    });

    // Protected marketing email management routes (admin only)
    Route::prefix('admin/marketing-emails')->controller(AdminMarketingEmailController::class)->group(function () {
        Route::get('/', 'index');                      // Get all marketing emails
        Route::get('/{id}', 'show');                  // Get single email
        Route::post('/', 'store');                    // Create new email
        Route::put('/{id}', 'update');                // Update email
        Route::delete('/{id}', 'destroy');            // Delete email
        Route::post('/{id}/toggle-active', 'toggleActive'); // Toggle active status
        Route::post('/bulk-delete', 'bulkDelete');    // Bulk delete
    });

    // ============================================================
    // CRM ROUTES (Construction CRM System)
    // ============================================================

    // CRM Stages - Read access for admin and marketing, write access for admin only
    Route::prefix('admin/crm/stages')->controller(CrmStageController::class)->group(function () {
        // Read routes - accessible by admin and marketing
        Route::middleware('role:admin,marketing')->group(function () {
            Route::get('/', 'index');                      // Get all stages
            Route::get('/{id}', 'show');                   // Get single stage
        });
        // Write routes - admin only
        Route::middleware('role:admin')->group(function () {
            Route::post('/', 'store');                     // Create new stage
            Route::put('/{id}', 'update');                 // Update stage
            Route::delete('/{id}', 'destroy');             // Delete stage
            Route::post('/reorder', 'reorder');            // Reorder stages
        });
    });

    // CRM Lost Reasons - Read access for admin and marketing, write access for admin only
    Route::prefix('admin/crm/lost-reasons')->controller(CrmLostReasonController::class)->group(function () {
        // Read routes - accessible by admin and marketing
        Route::middleware('role:admin,marketing')->group(function () {
            Route::get('/', 'index');                      // Get all lost reasons
            Route::get('/{id}', 'show');                   // Get single reason
        });
        // Write routes - admin only
        Route::middleware('role:admin')->group(function () {
            Route::post('/', 'store');                     // Create new reason
            Route::put('/{id}', 'update');                 // Update reason
            Route::delete('/{id}', 'destroy');             // Delete reason
            Route::post('/{id}/toggle-active', 'toggleActive'); // Toggle active status
            Route::post('/reorder', 'reorder');            // Reorder reasons
        });
    });

    // CRM Deals - shared between admin and marketing
    Route::prefix('admin/crm/deals')->group(function () {
        // Routes accessible by both admin and marketing
        Route::middleware('role:admin,marketing')->group(function () {
            Route::get('/', [CrmDealController::class, 'index']);              // Get all deals with filters
            Route::get('/pipeline', [CrmDealController::class, 'pipeline']);   // Get Kanban pipeline view
            Route::get('/statistics', [CrmDealController::class, 'statistics']); // Get deal statistics
            Route::get('/financial-dashboard', [CrmDealController::class, 'financialDashboard']); // Get financial dashboard
            Route::get('/{id}', [CrmDealController::class, 'show']);          // Get single deal
            Route::post('/', [CrmDealController::class, 'store']);            // Create new deal
            Route::post('/lead', [CrmDealController::class, 'storeLead']);    // Create lead (customer + deal)
            Route::post('/lead/bulk', [CrmDealController::class, 'bulkStoreLead']); // Bulk create leads
            Route::post('/sold', [CrmDealController::class, 'createSoldDeal']);  // Register sold deal with payments
            Route::put('/{id}', [CrmDealController::class, 'update']);        // Update deal
            Route::put('/{id}/stage', [CrmDealController::class, 'updateStage']); // Move deal on Kanban
            Route::put('/{id}/pricing', [CrmDealController::class, 'updatePricing']); // Update deal pricing
            Route::put('/{id}/assign', [CrmDealController::class, 'assign']); // Assign deal to user
            Route::post('/{id}/payments/regenerate', [CrmDealController::class, 'regeneratePaymentSchedule']); // Regenerate payment schedule
            Route::put('/payments/{paymentId}/mark-paid', [CrmDealController::class, 'markPaymentAsPaid']); // Mark payment as paid
            Route::put('/payments/{paymentId}/edit-amount', [CrmDealController::class, 'editPaymentAmount']); // Edit payment amount
        });

        // Routes accessible by admin only
        Route::middleware('role:admin')->group(function () {
            Route::delete('/{id}', [CrmDealController::class, 'destroy']);    // Delete deal
        });
    });

    // CRM Activities (Notes, Calls, Tasks) - shared between admin and marketing
    Route::prefix('admin/crm')->middleware('role:admin,marketing')->group(function () {
        Route::get('/tasks', [CrmActivityController::class, 'tasks']);        // Get all scheduled tasks
        Route::get('/activity-types', [CrmActivityController::class, 'types']); // Get activity types

        Route::prefix('deals/{dealId}/activities')->controller(CrmActivityController::class)->group(function () {
            Route::get('/', 'index');                  // Get activities for deal
            Route::post('/', 'store');                 // Create activity (note, call, etc.)
            Route::put('/{activityId}', 'update');    // Update activity
            Route::delete('/{activityId}', 'destroy'); // Delete activity
            Route::post('/{activityId}/complete', 'complete'); // Complete scheduled task
        });
    });

    // CRM Payments - shared between admin and marketing
    Route::prefix('admin/crm')->middleware('role:admin,marketing')->group(function () {
        Route::get('/payments/dashboard', [CrmPaymentController::class, 'dashboard']); // Payment dashboard stats
        Route::get('/payments/overdue', [CrmPaymentController::class, 'overdue']); // Overdue payments list
        Route::get('/payment-methods', [CrmPaymentController::class, 'methods']); // Get payment methods

        Route::prefix('deals/{dealId}/payments')->controller(CrmPaymentController::class)->group(function () {
            Route::get('/', 'index');                  // Get payments for deal
            Route::post('/', 'store');                 // Create single payment
            Route::post('/generate-schedule', 'generateSchedule'); // Generate payment schedule
        });

        // Payment management (without deal context)
        Route::prefix('payments')->controller(CrmPaymentController::class)->group(function () {
            Route::put('/{paymentId}', 'update');     // Update payment
            Route::post('/{paymentId}/mark-paid', 'markPaid'); // Mark payment as paid
            Route::post('/{paymentId}/cancel', 'cancel'); // Cancel payment
            Route::delete('/{paymentId}', 'destroy'); // Delete payment
        });
    });

    // CRM Stages list for frontend dropdowns (admin + marketing read access)
    Route::get('admin/crm/stages-list', [CrmStageController::class, 'index'])->middleware('role:admin,marketing');
    Route::get('admin/crm/lost-reasons-list', [CrmLostReasonController::class, 'index'])->middleware('role:admin,marketing');

    // Protected user management routes (admin only)
    Route::prefix('admin/users')->middleware('role:admin')->controller(AdminUserController::class)->group(function () {
        Route::get('/', 'index');                      // Get all users
        Route::get('/roles', 'roles');                 // Get all roles
        Route::get('/{id}', 'show');                   // Get single user
        Route::post('/', 'store');                     // Create new user
        Route::put('/{id}', 'update');                 // Update user
        Route::delete('/{id}', 'destroy');             // Delete user
    });

    // Protected bank rates management routes (admin and marketing)
    Route::prefix('admin/bank-rates')->middleware('role:admin,marketing')->controller(AdminBankRateController::class)->group(function () {
        Route::get('/', 'index');                      // Get all bank rates
        Route::get('/active', 'active');               // Get active bank rates only
        Route::post('/', 'store');                     // Create new bank rate
        Route::put('/{id}', 'update');                 // Update bank rate
        Route::delete('/{id}', 'destroy');             // Delete bank rate
        Route::post('/{id}/toggle-active', 'toggleActive'); // Toggle active status
        Route::post('/reorder', 'reorder');            // Reorder bank rates
    });

    // Protected calculator management routes (admin and marketing)
    Route::prefix('admin/calculator')->middleware('role:admin,marketing')->controller(AdminCalculatorController::class)->group(function () {
        Route::get('/active-projects', 'getActiveProjects');  // Get all active projects with calculator settings
    });

    // Calculator settings routes under projects (admin and marketing)
    Route::prefix('admin/projects')->middleware('role:admin,marketing')->controller(AdminCalculatorController::class)->group(function () {
        Route::get('/{id}/calculator-settings', 'getProjectCalculatorSettings'); // Get calculator settings for specific project
        Route::put('/{id}/calculator-settings', 'updateProjectCalculatorSettings'); // Update calculator settings
        Route::put('/{id}/base-price', 'updateBasePrice'); // Update base price
    });

    // Global Zone Image Management Routes (for polygon editors that don't know project ID in advance)
    Route::prefix('admin/zone-images')->middleware('role:admin')->controller(AdminZoneImageController::class)->group(function () {
        Route::post('/', 'storeGlobal');               // Upload zone image (project_id in body)
        Route::get('/', 'indexGlobal');                // Get zone images with filters (project_id in query)
        Route::get('/{zoneImageId}', 'showGlobal');   // Get single zone image
        Route::put('/{zoneImageId}', 'updateGlobal'); // Update zone image
        Route::delete('/{zoneImageId}', 'destroyGlobal'); // Delete zone image
    });

    // Global Interactive Zone Management Routes (for polygon editors)
    Route::prefix('admin/projects/{projectId}/interactive-zones')->middleware('role:admin')->controller(AdminInteractiveZoneController::class)->group(function () {
        Route::get('/', 'index');                      // Get zones with filters
        Route::post('/', 'store');                     // Create single zone
        Route::delete('/', 'bulkDelete');              // Delete all zones (with filters)
        Route::put('/{zoneId}', 'update');            // Update zone
        Route::delete('/{zoneId}', 'destroy');        // Delete zone
    });

    // Apartment Detection from PDF (AI-powered polygon detection)
    Route::prefix('admin/detect-apartments')->middleware('role:admin')->controller(AdminApartmentDetectionController::class)->group(function () {
        Route::post('/', 'detect');  // Upload PDF with red lines, get detected polygons
    });

    // Admin Apartment Navigation Management Routes
    Route::prefix('admin/projects/{projectId}')->middleware('role:admin')->group(function () {

        // Building Management
        Route::prefix('buildings')->controller(AdminBuildingController::class)->group(function () {
            Route::get('/', 'index');                  // Get all buildings for project
            Route::post('/', 'store');                 // Create new building
            Route::get('/{buildingId}', 'show');      // Get single building
            Route::put('/{buildingId}', 'update');    // Update building
            Route::delete('/{buildingId}', 'destroy'); // Delete building (soft delete with validation)
        });

        // Building-specific Zone Management (for frontend ListView compatibility)
        Route::prefix('buildings/{buildingId}/zones')->controller(AdminInteractiveZoneController::class)->group(function () {
            Route::get('/', 'indexByBuilding');       // Get zones for specific building
            Route::post('/', 'storeByBuilding');      // Create zone for specific building
            Route::put('/{zoneId}', 'updateByBuilding'); // Update zone
            Route::delete('/{zoneId}', 'destroyByBuilding'); // Delete zone
        });

        // Apartment Management (within building context)
        Route::prefix('buildings/{buildingId}/apartments')->controller(AdminApartmentController::class)->group(function () {
            Route::get('/', 'index');                  // Get all apartments for building
            Route::post('/', 'store');                 // Create new apartment
            Route::post('/bulk-import', 'bulkImport'); // Bulk import apartments from CSV/Excel
            Route::get('/template', 'downloadTemplate'); // Download CSV template
        });

        // Interactive Zone Management
        Route::prefix('zones')->controller(AdminInteractiveZoneController::class)->group(function () {
            Route::get('/', 'index');                  // Get zones with filters
            Route::post('/', 'store');                 // Create single zone
            Route::post('/bulk', 'bulkCreate');        // Bulk create zones with template
            Route::put('/{zoneId}', 'update');        // Update zone
            Route::delete('/{zoneId}', 'destroy');    // Delete zone
        });

        // Zone Image Management (project-specific endpoints)
        Route::prefix('zone-images')->controller(AdminZoneImageController::class)->group(function () {
            Route::get('/', 'index');                  // Get zone images with filters
            Route::post('/', 'store');                 // Upload single zone image
            Route::post('/bulk', 'bulkUpload');        // Bulk upload zone images
            Route::get('/{zoneImageId}', 'show');     // Get single zone image
            Route::put('/{zoneImageId}', 'update');   // Update zone image
            Route::delete('/{zoneImageId}', 'destroy'); // Delete zone image
        });
    });

    // Apartment Management (non-building context for updates/deletes)
    Route::prefix('admin/apartments')->controller(AdminApartmentController::class)->group(function () {
        Route::put('/{apartmentId}', 'update');       // Update apartment
        Route::patch('/{apartmentId}/status', 'updateStatus'); // Quick status update
        Route::delete('/{apartmentId}', 'destroy');   // Delete apartment
        Route::post('/{apartmentId}/images', 'uploadImages'); // Upload 2D/3D images
        Route::delete('/{apartmentId}/images/{imageId}', 'deleteImage'); // Delete image
    });

    // Batch apartment image upload (requires project/building context)
    Route::post(
        'admin/projects/{projectId}/buildings/{buildingId}/apartments/batch-images',
        [AdminApartmentController::class, 'batchUploadImages']
    )
        ->middleware('role:admin');

    // Building Management (standalone routes without project context)
    Route::prefix('admin/buildings')->middleware('role:admin')->controller(AdminBuildingController::class)->group(function () {
        Route::get('/{buildingId}', 'showStandalone');      // Get single building
        Route::get('/{buildingId}/floors', 'getFloors');    // Get available floors
        Route::get('/{buildingId}/apartments', 'getApartments'); // Get apartments for building
    });
});

// Storage proxy route with CORS headers for image processing (crossOrigin)
Route::get('storage-proxy/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);

    if (!file_exists($filePath)) {
        abort(404);
    }

    return response()->file($filePath, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET',
        'Access-Control-Allow-Headers' => '*',
    ]);
})->where('path', '.*');

// Debug route for checking authorization headers (remove in production)
Route::get('debug/auth-headers', [\App\Http\Controllers\Debug\AuthDebugController::class, 'checkHeaders']);

// Temporary debug route to check form_subjects data
Route::get('/debug/form-subjects', function () {
    $setting = \App\Models\SiteSetting::where('key', 'form_subjects')->where('group', 'contact')->first();

    if (!$setting) {
        return response()->json(['error' => 'form_subjects setting not found']);
    }

    return response()->json([
        'raw_original' => $setting->getRawOriginal('value'),
        'processed_value' => $setting->value,
        'json_decoded' => json_decode($setting->getRawOriginal('value'), true),
    ]);
});
