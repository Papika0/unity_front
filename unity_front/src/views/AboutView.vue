<script setup lang="ts">
import { ref } from 'vue'
import { useTranslations } from '../composables/useTranslations'

const { t } = useTranslations()

const stats = ref([
  { number: '150+', label: 'წარმატებული პროექტი' },
  { number: '15+', label: 'წლის გამოცდილება' },
  { number: '50+', label: 'კმაყოფილი კლიენტი' },
  { number: '98%', label: 'კლიენტის კმაყოფილება' },
])

const values = ref([
  {
    title: 'ინოვაცია',
    description: 'ვიყენებთ ყველაზე თანამედროვე ტექნოლოგიებს და მიდგომებს დიზაინსა და არქიტექტურაში',
  },
  {
    title: 'ხარისხი',
    description:
      'ყოველი პროექტი შესრულებულია უმაღლესი ხარისხის სტანდარტებით და ყურადღებით დეტალებისადმი',
  },
  {
    title: 'მდგრადობა',
    description:
      'ყველა პროექტი ითვალისწინებს ეკოლოგიურ და ენერგოეფექტურ მიდგომებს მომავალი თაობებისთვის',
  },
  {
    title: 'ექსკლუზივურობა',
    description: 'ყოველი პროექტი უნიკალურია და ასახავს კლიენტის ინდივიდუალურ ხედვას',
  },
])
</script>

<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section
      class="relative h-[60vh] min-h-[500px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-orange-900"
    >
      <div class="absolute inset-0 bg-black/30"></div>
      <div class="relative z-10 h-full flex items-center">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 text-white">
          <div class="max-w-4xl">
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-light mb-8 leading-tight">
              {{ t('about.title') }}
            </h1>
            <p class="text-xl md:text-2xl text-orange-100 font-light leading-relaxed max-w-3xl">
              ვქმნით სივრცეებს, რომლებიც აერთიანებენ ხელოვნებას, ფუნქციონალურობას და მდგრადობას
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Philosophy Section -->
    <section class="py-20 lg:py-32 bg-white">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div class="order-2 lg:order-1">
            <div class="space-y-8">
              <div>
                <h2 class="text-4xl lg:text-5xl font-light mb-8 text-zinc-900">ჩვენი ფილოსოფია</h2>
                <div class="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mb-8"></div>
              </div>

              <div class="space-y-6 text-lg text-zinc-600 leading-relaxed font-light">
                <p>
                  Unity Architecture დაარსდა 2008 წელს იმ ხედვით, რომ შეექმნა სივრცეები, რომლებიც
                  არა მხოლოდ ესთეტიკურად სრულყოფილია, არამედ ძირითადად ფუნქციონალური და ეკოლოგიურად
                  მდგრადი.
                </p>
                <p>
                  ჩვენი მიდგომა ემყარება სიღრმისეულ გაგებას თითოეული კლიენტის უნიკალური
                  საჭიროებებისა და ხედვისა. ვქმნით არა უბრალოდ შენობებს, არამედ ემოციურ
                  გამოცდილებებს.
                </p>
                <p>
                  თითოეული პროექტი არის ხელოვნების ნაწარმოები, რომელიც აერთიანებს ტრადიციულ
                  ღირებულებებს თანამედროვე ინოვაციებთან.
                </p>
              </div>
            </div>
          </div>

          <div class="order-1 lg:order-2">
            <div
              class="aspect-[4/5] bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div class="w-full h-full flex items-center justify-center">
                <div class="text-6xl text-zinc-400">
                  <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 bg-gradient-to-r from-zinc-50 to-orange-50">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <div class="text-center mb-16">
          <h2 class="text-4xl lg:text-5xl font-light mb-4 text-zinc-900">რიცხვები ჩვენს შესახებ</h2>
          <div class="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto"></div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div v-for="stat in stats" :key="stat.label" class="text-center group">
            <div class="mb-4">
              <div
                class="text-4xl lg:text-6xl font-light text-orange-600 mb-2 transition-all duration-500 group-hover:scale-110"
              >
                {{ stat.number }}
              </div>
              <div class="text-zinc-600 font-light text-lg">
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-20 lg:py-32 bg-white">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <div class="text-center mb-20">
          <h2 class="text-4xl lg:text-5xl font-light mb-8 text-zinc-900">ღირებულებები</h2>
          <div class="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-6"></div>
          <p class="text-xl text-zinc-600 font-light max-w-3xl mx-auto leading-relaxed">
            ეს ღირებულებები წარმართავს ჩვენს ყოველდღიურ მუშაობას და განსაზღვრავს ყოველი პროექტის
            წარმატების საფუძველს
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          <div v-for="value in values" :key="value.title" class="group">
            <div
              class="p-8 lg:p-12 rounded-2xl transition-all duration-500 hover:bg-gradient-to-br hover:from-zinc-50 hover:to-orange-50 hover:shadow-xl"
            >
              <div class="flex items-start space-x-6">
                <div class="flex-shrink-0">
                  <div
                    class="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mt-2"
                  ></div>
                </div>
                <div class="flex-1">
                  <h3
                    class="text-2xl lg:text-3xl font-light mb-6 text-zinc-900 group-hover:text-orange-600 transition-colors duration-300"
                  >
                    {{ value.title }}
                  </h3>
                  <p class="text-lg text-zinc-600 font-light leading-relaxed">
                    {{ value.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Statement -->
    <section
      class="py-20 lg:py-32 bg-gradient-to-br from-zinc-900 via-zinc-800 to-orange-900 text-white"
    >
      <div class="max-w-5xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 text-center">
        <h2 class="text-4xl lg:text-5xl font-light mb-12 leading-tight">ჩვენი მისია</h2>
        <div class="w-24 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 mx-auto mb-12"></div>
        <p class="text-xl lg:text-2xl font-light leading-relaxed text-orange-100 mb-12">
          ვქმნით არქიტექტურულ ღირსშესანიშნაობებს, რომლებიც გამოირჩევიან ესთეტიკური სრულყოფილებით,
          ფუნქციონალური ეფექტურობით და ეკოლოგიური პასუხისმგებლობით
        </p>
        <div
          class="inline-block px-8 py-1 rounded-full border border-orange-400/30 bg-orange-400/10"
        >
          <span class="text-orange-200 font-light">Unity Architecture</span>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-white py-20">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 text-center">
        <h2 class="text-4xl lg:text-5xl font-light mb-8 text-zinc-900">თქვენი ხედვის რეალიზება</h2>
        <div class="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-8"></div>
        <p class="text-xl text-zinc-600 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
          მზად ხართ გადააქციოთ თქვენი ხედვა არქიტექტურულ რეალობად? დაგვიკავშირდით უფასო
          კონსულტაციისთვის
        </p>
        <router-link
          to="/contact"
          class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 hover:from-orange-600 hover:to-orange-700"
        >
          {{ t('contact.title') }}
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            ></path>
          </svg>
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Custom animations for luxury feel */
.group:hover .transition-all {
  transform: translateY(-2px);
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}
</style>
