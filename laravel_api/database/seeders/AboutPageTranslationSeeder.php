<?php

namespace Database\Seeders;

use App\Models\Translation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AboutPageTranslationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $translations = [
            // Hero section
            [
                'key' => 'about.hero.subtitle',
                'text' => [
                    'ka' => 'ვქმნით სივრცეებს, რომლებიც აერთიანებენ ხელოვნებას, ფუნქციონალურობას და მდგრადობას',
                    'en' => 'We create spaces that combine art, functionality and sustainability',
                    'ru' => 'Мы создаем пространства, которые сочетают искусство, функциональность и устойчивость'
                ],
                'group' => 'about',
                'active' => true
            ],

            // Philosophy section
            [
                'key' => 'about.philosophy.title',
                'text' => [
                    'ka' => 'ჩვენი ფილოსოფია',
                    'en' => 'Our Philosophy',
                    'ru' => 'Наша философия'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.philosophy.paragraph1',
                'text' => [
                    'ka' => 'Unity Architecture დაარსდა 2008 წელს იმ ხედვით, რომ შეექმნა სივრცეები, რომლებიც არა მხოლოდ ესთეტიკურად სრულყოფილია, არამედ ძირითადად ფუნქციონალური და ეკოლოგიურად მდგრადი.',
                    'en' => 'Unity Architecture was founded in 2008 with the vision to create spaces that are not only aesthetically perfect, but primarily functional and ecologically sustainable.',
                    'ru' => 'Unity Architecture была основана в 2008 году с видением создания пространств, которые не только эстетически совершенны, но в первую очередь функциональны и экологически устойчивы.'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.philosophy.paragraph2',
                'text' => [
                    'ka' => 'ჩვენი მიდგომა ემყარება სიღრმისეულ გაგებას თითოეული კლიენტის უნიკალური საჭიროებებისა და ხედვისა. ვქმნით არა უბრალოდ შენობებს, არამედ ემოციურ გამოცდილებებს.',
                    'en' => 'Our approach is based on a deep understanding of each client\'s unique needs and vision. We create not just buildings, but emotional experiences.',
                    'ru' => 'Наш подход основан на глубоком понимании уникальных потребностей и видения каждого клиента. Мы создаем не просто здания, а эмоциональные переживания.'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.philosophy.paragraph3',
                'text' => [
                    'ka' => 'თითოეული პროექტი არის ხელოვნების ნაწარმოები, რომელიც აერთიანებს ტრადიციულ ღირებულებებს თანამედროვე ინოვაციებთან.',
                    'en' => 'Each project is a work of art that combines traditional values with modern innovations.',
                    'ru' => 'Каждый проект - это произведение искусства, которое сочетает традиционные ценности с современными инновациями.'
                ],
                'group' => 'about',
                'active' => true
            ],

            // Stats section
            [
                'key' => 'about.stats.title',
                'text' => [
                    'ka' => 'რიცხვები ჩვენს შესახებ',
                    'en' => 'Numbers About Us',
                    'ru' => 'Цифры о нас'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.stats.successful_projects',
                'text' => [
                    'ka' => 'წარმატებული პროექტი',
                    'en' => 'Successful Projects',
                    'ru' => 'Успешные проекты'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.stats.years_experience',
                'text' => [
                    'ka' => 'წლის გამოცდილება',
                    'en' => 'Years of Experience',
                    'ru' => 'Лет опыта'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.stats.satisfied_clients',
                'text' => [
                    'ka' => 'კმაყოფილი კლიენტი',
                    'en' => 'Satisfied Clients',
                    'ru' => 'Довольные клиенты'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.stats.client_satisfaction',
                'text' => [
                    'ka' => 'კლიენტის კმაყოფილება',
                    'en' => 'Client Satisfaction',
                    'ru' => 'Удовлетворенность клиентов'
                ],
                'group' => 'about',
                'active' => true
            ],

            // Values section
            [
                'key' => 'about.values.title',
                'text' => [
                    'ka' => 'ღირებულებები',
                    'en' => 'Values',
                    'ru' => 'Ценности'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.values.subtitle',
                'text' => [
                    'ka' => 'ეს ღირებულებები წარმართავს ჩვენს ყოველდღიურ მუშაობას და განსაზღვრავს ყოველი პროექტის წარმატების საფუძველს',
                    'en' => 'These values guide our daily work and define the foundation of every project\'s success',
                    'ru' => 'Эти ценности направляют нашу повседневную работу и определяют основу успеха каждого проекта'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.values.innovation.title',
                'text' => [
                    'ka' => 'ინოვაცია',
                    'en' => 'Innovation',
                    'ru' => 'Инновации'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.values.innovation.description',
                'text' => [
                    'ka' => 'ვიყენებთ ყველაზე თანამედროვე ტექნოლოგიებს და მიდგომებს დიზაინსა და არქიტექტურაში',
                    'en' => 'We use the most modern technologies and approaches in design and architecture',
                    'ru' => 'Мы используем самые современные технологии и подходы в дизайне и архитектуре'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.values.quality.title',
                'text' => [
                    'ka' => 'ხარისხი',
                    'en' => 'Quality',
                    'ru' => 'Качество'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.values.quality.description',
                'text' => [
                    'ka' => 'ყოველი პროექტი შესრულებულია უმაღლესი ხარისხის სტანდარტებით და ყურადღებით დეტალებისადმი',
                    'en' => 'Every project is executed with the highest quality standards and attention to detail',
                    'ru' => 'Каждый проект выполняется с высочайшими стандартами качества и вниманием к деталям'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.values.sustainability.title',
                'text' => [
                    'ka' => 'მდგრადობა',
                    'en' => 'Sustainability',
                    'ru' => 'Устойчивость'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.values.sustainability.description',
                'text' => [
                    'ka' => 'ყველა პროექტი ითვალისწინებს ეკოლოგიურ და ენერგოეფექტურ მიდგომებს მომავალი თაობებისთვის',
                    'en' => 'All projects consider ecological and energy-efficient approaches for future generations',
                    'ru' => 'Все проекты учитывают экологические и энергоэффективные подходы для будущих поколений'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.values.exclusivity.title',
                'text' => [
                    'ka' => 'ექსკლუზივურობა',
                    'en' => 'Exclusivity',
                    'ru' => 'Эксклюзивность'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.values.exclusivity.description',
                'text' => [
                    'ka' => 'ყოველი პროექტი უნიკალურია და ასახავს კლიენტის ინდივიდუალურ ხედვას',
                    'en' => 'Every project is unique and reflects the client\'s individual vision',
                    'ru' => 'Каждый проект уникален и отражает индивидуальное видение клиента'
                ],
                'group' => 'about',
                'active' => true
            ],

            // Mission section
            [
                'key' => 'about.mission.title',
                'text' => [
                    'ka' => 'ჩვენი მისია',
                    'en' => 'Our Mission',
                    'ru' => 'Наша миссия'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.mission.description',
                'text' => [
                    'ka' => 'ვქმნით არქიტექტურულ ღირსშესანიშნაობებს, რომლებიც გამოირჩევიან ესთეტიკური სრულყოფილებით, ფუნქციონალური ეფექტურობით და ეკოლოგიური პასუხისმგებლობით',
                    'en' => 'We create architectural masterpieces that stand out for their aesthetic perfection, functional efficiency and ecological responsibility',
                    'ru' => 'Мы создаем архитектурные шедевры, которые выделяются своей эстетической совершенностью, функциональной эффективностью и экологической ответственностью'
                ],
                'group' => 'about',
                'active' => true
            ],

            // CTA section
            [
                'key' => 'about.cta.title',
                'text' => [
                    'ka' => 'თქვენი ხედვის რეალიზება',
                    'en' => 'Realize Your Vision',
                    'ru' => 'Реализуйте свое видение'
                ],
                'group' => 'about',
                'active' => true
            ],
            [
                'key' => 'about.cta.description',
                'text' => [
                    'ka' => 'მზად ხართ გადააქციოთ თქვენი ხედვა არქიტექტურულ რეალობად? დაგვიკავშირდით უფასო კონსულტაციისთვის',
                    'en' => 'Ready to turn your vision into architectural reality? Contact us for a free consultation',
                    'ru' => 'Готовы воплотить свое видение в архитектурную реальность? Свяжитесь с нами для бесплатной консультации'
                ],
                'group' => 'about',
                'active' => true
            ]
        ];

        foreach ($translations as $translation) {
            Translation::updateOrCreate(
                ['key' => $translation['key']],
                $translation
            );
        }
    }
}
