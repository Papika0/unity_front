<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Feature;

class FeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $features = [
            [
                'name' => 'location',
                'title' => [
                    'ka' => 'მდებარეობა',
                    'en' => 'Location',
                    'ru' => 'Расположение'
                ],
                'description' => [
                    'ka' => 'ცენტრალური მდებარეობა მთავარ ქუჩაზე',
                    'en' => 'Central location on main street',
                    'ru' => 'Центральное расположение на главной улице'
                ],
                'icon' => '📍',
                'color' => 'from-blue-500 to-cyan-500',
                'keywords' => ['მდებარეობა', 'ცენტრალური', 'ქუჩა', 'მთავარი', 'შუაგულში', 'მდებარეობის'],
                'is_active' => true,
                'sort_order' => 1
            ],
            [
                'name' => 'infrastructure',
                'title' => [
                    'ka' => 'ინფრასტრუქტურა',
                    'en' => 'Infrastructure',
                    'ru' => 'Инфраструктура'
                ],
                'description' => [
                    'ka' => 'სრული ინფრასტრუქტურა და მომსახურება',
                    'en' => 'Complete infrastructure and services',
                    'ru' => 'Полная инфраструктура и услуги'
                ],
                'icon' => '🏢',
                'color' => 'from-green-500 to-emerald-500',
                'keywords' => ['ინფრასტრუქტურა', 'სუპერმარკეტი', 'სკოლა', 'ბაღი', 'ბანკი', 'მაღაზია', 'ცენტრი'],
                'is_active' => true,
                'sort_order' => 2
            ],
            [
                'name' => 'quality',
                'title' => [
                    'ka' => 'ხარისხი',
                    'en' => 'Quality',
                    'ru' => 'Качество'
                ],
                'description' => [
                    'ka' => 'ყველაზე კარგი მასალები და ხარისხი',
                    'en' => 'Best materials and quality',
                    'ru' => 'Лучшие материалы и качество'
                ],
                'icon' => '⭐',
                'color' => 'from-amber-500 to-orange-500',
                'keywords' => ['ხარისხი', 'მასალა', 'ეკოლოგიური', 'ყველაზე კარგი', 'პრემიუმ', 'მაღალი ხარისხი'],
                'is_active' => true,
                'sort_order' => 3
            ],
            [
                'name' => 'apartments',
                'title' => [
                    'ka' => 'ბინები',
                    'en' => 'Apartments',
                    'ru' => 'Квартиры'
                ],
                'description' => [
                    'ka' => 'ოპტიმალური დაგეგმვა და პროპორციები',
                    'en' => 'Optimal layout and proportions',
                    'ru' => 'Оптимальная планировка и пропорции'
                ],
                'icon' => '🏠',
                'color' => 'from-purple-500 to-pink-500',
                'keywords' => ['ბინა', 'დაგეგმვა', 'ოპტიმალური', 'პროპორცია', 'საზაფხულო', 'საცხოვრებელი'],
                'is_active' => true,
                'sort_order' => 4
            ],
            [
                'name' => 'security',
                'title' => [
                    'ka' => 'უსაფრთხოება',
                    'en' => 'Security',
                    'ru' => 'Безопасность'
                ],
                'description' => [
                    'ka' => 'ძლიერი კონსტრუქცია და უსაფრთხოების სისტემები',
                    'en' => 'Strong construction and security systems',
                    'ru' => 'Прочная конструкция и системы безопасности'
                ],
                'icon' => '🔒',
                'color' => 'from-red-500 to-rose-500',
                'keywords' => ['უსაფრთხოება', 'შენობა', 'ძლიერი', 'შენობის', 'უსაფრთხოების', 'პროტექცია'],
                'is_active' => true,
                'sort_order' => 5
            ],
            [
                'name' => 'elevator',
                'title' => [
                    'ka' => 'ლიფტები',
                    'en' => 'Elevators',
                    'ru' => 'Лифты'
                ],
                'description' => [
                    'ka' => 'თანამედროვე ლიფტები',
                    'en' => 'Modern elevators',
                    'ru' => 'Современные лифты'
                ],
                'icon' => '🛗',
                'color' => 'from-indigo-500 to-blue-500',
                'keywords' => ['ლიფტი', 'თანამედროვე', 'სწრაფი', 'უსაფრთხო'],
                'is_active' => true,
                'sort_order' => 6
            ],
            [
                'name' => 'parking',
                'title' => [
                    'ka' => 'პარკინგი',
                    'en' => 'Parking',
                    'ru' => 'Парковка'
                ],
                'description' => [
                    'ka' => 'შიდა პარკინგი',
                    'en' => 'Indoor parking',
                    'ru' => 'Крытая парковка'
                ],
                'icon' => '🅿️',
                'color' => 'from-gray-500 to-slate-500',
                'keywords' => ['პარკინგი', 'შიდა', 'მანქანა', 'ავტომობილი'],
                'is_active' => true,
                'sort_order' => 7
            ],
            [
                'name' => 'commercial',
                'title' => [
                    'ka' => 'კომერციული ფართი',
                    'en' => 'Commercial Space',
                    'ru' => 'Коммерческая площадь'
                ],
                'description' => [
                    'ka' => 'კომერციული ფართები',
                    'en' => 'Commercial spaces',
                    'ru' => 'Коммерческие площади'
                ],
                'icon' => '🏪',
                'color' => 'from-teal-500 to-cyan-500',
                'keywords' => ['კომერციული', 'ფართი', 'მაღაზია', 'ოფისი'],
                'is_active' => true,
                'sort_order' => 8
            ]
        ];

        foreach ($features as $featureData) {
            Feature::create($featureData);
        }
    }
}