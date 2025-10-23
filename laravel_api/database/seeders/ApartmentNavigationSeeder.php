<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Projects;
use App\Models\Building;
use App\Models\Apartment;
use App\Models\InteractiveZone;
use App\Models\ZoneImage;
use App\Models\Image;

class ApartmentNavigationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find existing project (try ID 1, or create a test project)
        $project = Projects::first();

        if (!$project) {
            $this->command->error('Project with ID 1 not found. Please create a project first.');
            return;
        }

        $this->command->info("Seeding apartment navigation data for project: {$project->title}");

        // Clean up existing data for this project
        $this->command->info('Cleaning up existing data...');
        
        // Delete zone images and their associated Image records
        $zoneImages = ZoneImage::where('project_id', $project->id)->get();
        foreach ($zoneImages as $zoneImage) {
            // Detach and delete associated images
            $imageIds = $zoneImage->images()->pluck('images.id');
            $zoneImage->images()->detach();
            Image::whereIn('id', $imageIds)->where('category', 'zone_render')->delete();
        }
        
        InteractiveZone::where('project_id', $project->id)->delete();
        ZoneImage::where('project_id', $project->id)->delete();
        Apartment::where('project_id', $project->id)->delete();
        Building::where('project_id', $project->id)->delete();
        $this->command->info('Existing data cleaned up.');

        // Create Building A
        $this->command->info('Creating Building A...');
        $buildingA = Building::create([
            'project_id' => $project->id,
            'name' => [
                'en' => 'Building A',
                'ka' => 'კორპუსი A',
            ],
            'identifier' => 'a-block',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        // Create Building B
        $this->command->info('Creating Building B...');
        $buildingB = Building::create([
            'project_id' => $project->id,
            'name' => [
                'en' => 'Building B',
                'ka' => 'კორპუსი B',
            ],
            'identifier' => 'b-block',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        // Create apartments for Building A (floors 5-15)
        $this->command->info('Creating apartments for Building A (floors 5-15)...');
        $this->createApartmentsForBuilding($buildingA, 5, 15);

        // Create apartments for Building B (floors 1-20)
        $this->command->info('Creating apartments for Building B (floors 1-20)...');
        $this->createApartmentsForBuilding($buildingB, 1, 20);

        // Create interactive zones
        $this->command->info('Creating interactive zones...');
        $this->createInteractiveZones($project, $buildingA, $buildingB);

        // Create zone images
        $this->command->info('Creating zone images...');
        $this->createZoneImages($project, $buildingA, $buildingB);

        $this->command->info('Apartment navigation data seeded successfully!');
    }

    /**
     * Create apartments for a building
     */
    private function createApartmentsForBuilding(Building $building, int $startFloor, int $endFloor): void
    {
        $statuses = ['available', 'sold', 'reserved'];
        $statusWeights = [60, 25, 15]; // 60% available, 25% sold, 15% reserved
        $bedroomOptions = [1, 2, 3];

        for ($floor = $startFloor; $floor <= $endFloor; $floor++) {
            for ($aptNum = 1; $aptNum <= 8; $aptNum++) {
                // Weighted random status selection
                $rand = rand(1, 100);
                if ($rand <= 60) {
                    $status = 'available';
                } elseif ($rand <= 85) {
                    $status = 'sold';
                } else {
                    $status = 'reserved';
                }

                $bedrooms = $bedroomOptions[array_rand($bedroomOptions)];
                $areaTotal = rand(50, 150);
                $areaLiving = round($areaTotal * 0.85, 2);
                $pricePerSqm = rand(1500, 2000);
                $price = $areaTotal * $pricePerSqm;

                Apartment::create([
                    'project_id' => $building->project_id,
                    'building_id' => $building->id,
                    'floor_number' => $floor,
                    'apartment_number' => (string) $aptNum,
                    'status' => $status,
                    'price' => $price,
                    'area_total' => $areaTotal,
                    'area_living' => $areaLiving,
                    'bedrooms' => $bedrooms,
                    'bathrooms' => $bedrooms >= 2 ? 2 : 1,
                    'has_balcony' => rand(0, 1) === 1,
                    'has_parking' => rand(0, 1) === 1,
                    'is_active' => true,
                    'sort_order' => $aptNum,
                ]);
            }
        }

        $totalApts = ($endFloor - $startFloor + 1) * 8;
        $this->command->info("  Created {$totalApts} apartments for {$building->identifier}");
    }

    /**
     * Create interactive zones
     */
    private function createInteractiveZones(Projects $project, Building $buildingA, Building $buildingB): void
    {
        // Create building block zones (overview level)
        $buildingAZone = InteractiveZone::create([
            'project_id' => $project->id,
            'zone_type' => 'building_block',
            'parent_zone_id' => null,
            'entity_id' => $buildingA->id,
            'entity_type' => Building::class,
            'svg_coordinates' => [
                [388, 849], [388, 874], [447, 874], [447, 1046],
                [717, 1046], [717, 874], [776, 874], [776, 849]
            ],
            'bounding_box' => ['min_x' => 388, 'min_y' => 849, 'max_x' => 776, 'max_y' => 1046],
            'display_config' => [
                'label' => 'Building A',
                'fill' => '#4ade80',
                'stroke' => '#22c55e',
                'hover' => '#86efac',
            ],
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $buildingBZone = InteractiveZone::create([
            'project_id' => $project->id,
            'zone_type' => 'building_block',
            'parent_zone_id' => null,
            'entity_id' => $buildingB->id,
            'entity_type' => Building::class,
            'svg_coordinates' => [
                [800, 849], [800, 874], [859, 874], [859, 1046],
                [1129, 1046], [1129, 874], [1188, 874], [1188, 849]
            ],
            'bounding_box' => ['min_x' => 800, 'min_y' => 849, 'max_x' => 1188, 'max_y' => 1046],
            'display_config' => [
                'label' => 'Building B',
                'fill' => '#60a5fa',
                'stroke' => '#3b82f6',
                'hover' => '#93c5fd',
            ],
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $this->command->info('  Created 2 building block zones');

        // Create floor strip zones for Building A (floors 5-15)
        $floorCount = 0;
        for ($floor = 5; $floor <= 15; $floor++) {
            // Get a representative apartment for this floor
            $apartment = Apartment::where('building_id', $buildingA->id)
                ->where('floor_number', $floor)
                ->first();

            if ($apartment) {
                $yPosition = 100 + (($floor - 5) * 50);
                InteractiveZone::create([
                    'project_id' => $project->id,
                    'zone_type' => 'floor_strip',
                    'parent_zone_id' => $buildingAZone->id,
                    'entity_id' => $apartment->id,
                    'entity_type' => Apartment::class,
                    'svg_coordinates' => [
                        [50, $yPosition], [750, $yPosition],
                        [750, $yPosition + 40], [50, $yPosition + 40]
                    ],
                    'bounding_box' => ['min_x' => 50, 'min_y' => $yPosition, 'max_x' => 750, 'max_y' => $yPosition + 40],
                    'display_config' => [
                        'label' => "Floor {$floor}",
                        'fill' => '#e0e7ff',
                        'stroke' => '#818cf8',
                        'hover' => '#c7d2fe',
                    ],
                    'is_active' => true,
                    'sort_order' => $floor,
                ]);
                $floorCount++;
            }
        }
        $this->command->info("  Created {$floorCount} floor strip zones for Building A");

        // Create floor strip zones for Building B (floors 1-20)
        $floorCount = 0;
        for ($floor = 1; $floor <= 20; $floor++) {
            $apartment = Apartment::where('building_id', $buildingB->id)
                ->where('floor_number', $floor)
                ->first();

            if ($apartment) {
                $yPosition = 100 + (($floor - 1) * 45);
                InteractiveZone::create([
                    'project_id' => $project->id,
                    'zone_type' => 'floor_strip',
                    'parent_zone_id' => $buildingBZone->id,
                    'entity_id' => $apartment->id,
                    'entity_type' => Apartment::class,
                    'svg_coordinates' => [
                        [50, $yPosition], [750, $yPosition],
                        [750, $yPosition + 35], [50, $yPosition + 35]
                    ],
                    'bounding_box' => ['min_x' => 50, 'min_y' => $yPosition, 'max_x' => 750, 'max_y' => $yPosition + 35],
                    'display_config' => [
                        'label' => "Floor {$floor}",
                        'fill' => '#dbeafe',
                        'stroke' => '#60a5fa',
                        'hover' => '#bfdbfe',
                    ],
                    'is_active' => true,
                    'sort_order' => $floor,
                ]);
                $floorCount++;
            }
        }
        $this->command->info("  Created {$floorCount} floor strip zones for Building B");

        // Create apartment unit zones for floor 10 of Building A (sample)
        $floor10Apartments = Apartment::where('building_id', $buildingA->id)
            ->where('floor_number', 10)
            ->orderBy('sort_order')
            ->get();

        $apartmentZoneCount = 0;
        foreach ($floor10Apartments as $index => $apartment) {
            $xPosition = 100 + ($index * 120);
            $yPosition = 200;

            // Color based on status
            $displayConfig = match($apartment->status) {
                'available' => [
                    'label' => "Apt {$apartment->apartment_number}",
                    'fill' => '#4ade80',
                    'stroke' => '#22c55e',
                    'hover' => '#86efac',
                ],
                'reserved' => [
                    'label' => "Apt {$apartment->apartment_number}",
                    'fill' => '#fbbf24',
                    'stroke' => '#f59e0b',
                    'hover' => '#fcd34d',
                ],
                'sold' => [
                    'label' => "Apt {$apartment->apartment_number}",
                    'fill' => '#94a3b8',
                    'stroke' => '#64748b',
                    'hover' => '#cbd5e1',
                ],
            };

            InteractiveZone::create([
                'project_id' => $project->id,
                'zone_type' => 'apartment_unit',
                'parent_zone_id' => null,
                'entity_id' => $apartment->id,
                'entity_type' => Apartment::class,
                'svg_coordinates' => [
                    [$xPosition, $yPosition], [$xPosition + 100, $yPosition],
                    [$xPosition + 100, $yPosition + 80], [$xPosition, $yPosition + 80]
                ],
                'bounding_box' => [
                    'min_x' => $xPosition,
                    'min_y' => $yPosition,
                    'max_x' => $xPosition + 100,
                    'max_y' => $yPosition + 80
                ],
                'display_config' => $displayConfig,
                'is_active' => true,
                'sort_order' => $apartment->sort_order,
            ]);
            $apartmentZoneCount++;
        }
        $this->command->info("  Created {$apartmentZoneCount} apartment unit zones for floor 10 of Building A");
    }

    /**
     * Create zone images with placeholders
     */
    private function createZoneImages(Projects $project, Building $buildingA, Building $buildingB): void
    {
        // Overview image (Site Plan)
        $overviewZoneImage = ZoneImage::create([
            'zone_id' => null,
            'project_id' => $project->id,
            'level_type' => 'overview',
            'building_id' => null,
            'floor_number' => null,
            'image_type' => 'background',
            'viewbox' => '0 0 1512 1046',
            'width' => 1512,
            'height' => 1046,
            'sort_order' => 1,
        ]);

        // Create Image record for overview with placeholder
        $overviewImage = Image::create([
            'filename' => 'site-plan-overview.jpg',
            'path' => null,
            'url' => 'https://placehold.co/1512x1046/4ade80/ffffff?text=Site+Plan+Overview',
            'title' => [
                'en' => 'Site Plan Overview',
                'ka' => 'საიტის გეგმა',
            ],
            'alt_text' => [
                'en' => 'Project site plan showing building locations',
                'ka' => 'პროექტის საიტის გეგმა შენობების მდებარეობით',
            ],
            'category' => 'zone_render',
            'is_active' => true,
        ]);

        // Link via imageables pivot
        $overviewZoneImage->images()->attach($overviewImage->id, [
            'type' => 'render',
            'sort_order' => 1,
        ]);
        $this->command->info('  Created overview zone image with placeholder');

        // Building A image (Elevation/Floor Stack)
        $buildingAZoneImage = ZoneImage::create([
            'zone_id' => null,
            'project_id' => $project->id,
            'level_type' => 'building',
            'building_id' => $buildingA->id,
            'floor_number' => null,
            'image_type' => 'background',
            'viewbox' => '0 0 800 1000',
            'width' => 800,
            'height' => 1000,
            'sort_order' => 1,
        ]);

        $buildingAImage = Image::create([
            'filename' => 'building-a-elevation.jpg',
            'path' => null,
            'url' => 'https://placehold.co/800x1000/60a5fa/ffffff?text=Building+A+Elevation',
            'title' => [
                'en' => 'Building A Elevation',
                'ka' => 'კორპუსი A ფასადი',
            ],
            'alt_text' => [
                'en' => 'Building A elevation showing floor stack (floors 5-15)',
                'ka' => 'კორპუსი A ფასადი სართულების განლაგებით (5-15 სართული)',
            ],
            'category' => 'zone_render',
            'is_active' => true,
        ]);

        $buildingAZoneImage->images()->attach($buildingAImage->id, [
            'type' => 'render',
            'sort_order' => 1,
        ]);
        $this->command->info('  Created Building A zone image with placeholder');

        // Building B image (Elevation/Floor Stack)
        $buildingBZoneImage = ZoneImage::create([
            'zone_id' => null,
            'project_id' => $project->id,
            'level_type' => 'building',
            'building_id' => $buildingB->id,
            'floor_number' => null,
            'image_type' => 'background',
            'viewbox' => '0 0 800 1200',
            'width' => 800,
            'height' => 1200,
            'sort_order' => 1,
        ]);

        $buildingBImage = Image::create([
            'filename' => 'building-b-elevation.jpg',
            'path' => null,
            'url' => 'https://placehold.co/800x1200/818cf8/ffffff?text=Building+B+Elevation',
            'title' => [
                'en' => 'Building B Elevation',
                'ka' => 'კორპუსი B ფასადი',
            ],
            'alt_text' => [
                'en' => 'Building B elevation showing floor stack (floors 1-20)',
                'ka' => 'კორპუსი B ფასადი სართულების განლაგებით (1-20 სართული)',
            ],
            'category' => 'zone_render',
            'is_active' => true,
        ]);

        $buildingBZoneImage->images()->attach($buildingBImage->id, [
            'type' => 'render',
            'sort_order' => 1,
        ]);
        $this->command->info('  Created Building B zone image with placeholder');

        // Floor 10 image for Building A (Floor Plan)
        $floor10ZoneImage = ZoneImage::create([
            'zone_id' => null,
            'project_id' => $project->id,
            'level_type' => 'floor',
            'building_id' => $buildingA->id,
            'floor_number' => 10,
            'image_type' => 'background',
            'viewbox' => '0 0 1000 400',
            'width' => 1000,
            'height' => 400,
            'sort_order' => 1,
        ]);

        $floor10Image = Image::create([
            'filename' => 'building-a-floor-10-plan.jpg',
            'path' => null,
            'url' => 'https://placehold.co/1000x400/c084fc/ffffff?text=Floor+10+Plan',
            'title' => [
                'en' => 'Floor 10 Plan - Building A',
                'ka' => 'მე-10 სართულის გეგმა - კორპუსი A',
            ],
            'alt_text' => [
                'en' => 'Floor plan for 10th floor showing apartment layouts',
                'ka' => 'მე-10 სართულის გეგმა ბინების განლაგებით',
            ],
            'category' => 'zone_render',
            'is_active' => true,
        ]);

        $floor10ZoneImage->images()->attach($floor10Image->id, [
            'type' => 'render',
            'sort_order' => 1,
        ]);
        $this->command->info('  Created floor 10 zone image with placeholder for Building A');
    }
}
