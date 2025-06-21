<script setup lang="ts">
import { ref } from 'vue'
import { useTranslations } from '../composables/useTranslations'

const { t } = useTranslations()

const teamMembers = ref([
  {
    name: 'ნინო გელოვანი',
    position: 'არქიტექტორი, დირექტორი',
    experience: '15+ წლის გამოცდილება',
    education: 'საქართველოს ტექნიკური უნივერსიტეტი',
    image: '/api/placeholder/300/300'
  },
  {
    name: 'გიორგი ვაშაძე',
    position: 'მთავარი ინჟინერი',
    experience: '12+ წლის გამოცდილება',
    education: 'საქართველოს ტექნიკური უნივერსიტეტი',
    image: '/api/placeholder/300/300'
  },
  {
    name: 'მარიამ ხუციშვილი',
    position: 'ინტერიერის დიზაინერი',
    experience: '8+ წლის გამოცდილება',
    education: 'ხელოვნების უნივერსიტეტი',
    image: '/api/placeholder/300/300'
  },
  {
    name: 'დავით ქართველიშვილი',
    position: 'პროექტის მენეჯერი',
    experience: '10+ წლის გამოცდილება',
    education: 'საქართველოს ტექნიკური უნივერსიტეტი',
    image: '/api/placeholder/300/300'
  }
])

const stats = ref([
  { number: '150+', label: 'წარმატებული პროექტი' },
  { number: '15+', label: 'წლის გამოცდილება' },
  { number: '50+', label: 'კმაყოფილი კლიენტი' },
  { number: '25', label: 'პროფესიონალი' }
])

const values = ref([
  {
    title: 'ინოვაცია',
    description: 'ვიყენებთ ყველაზე თანამედროვე ტექნოლოგიებს და მიდგომებს',
    icon: '🚀'
  },
  {
    title: 'ხარისხი',
    description: 'ყოველი პროექტი შესრულებულია უმაღლესი ხარისხის სტანდარტებით',
    icon: '⭐'
  },
  {
    title: 'მდგრადობა',
    description: 'ყველა პროექტი ითვალისწინებს ეკოლოგიურ და ენერგოეფექტურ მიდგომებს',
    icon: '🌱'
  },
  {
    title: 'კლიენტზე ორიენტაცია',
    description: 'ყოველი კლიენტის საჭიროებები არის ჩვენი პრიორიტეტი',
    icon: '🤝'
  }
])
</script>

<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="relative h-96 bg-gradient-to-r from-gray-900 to-gray-700">
      <div class="absolute inset-0 bg-black opacity-50"></div>
      <div class="relative z-10 h-full flex items-center">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            {{ t('about.title') }}
          </h1>
          <p class="text-xl text-gray-300 max-w-3xl">
            ვართ არქიტექტურის და დიზაინის სფეროში მოღვაწე კომპანია, რომელიც 15 წელზე მეტია ქმნის განსაკუთრებულ სივრცეებს
          </p>
        </div>
      </div>
    </section>

    <!-- About Content -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold mb-6">ჩვენი ისტორია</h2>
            <div class="space-y-4 text-gray-600">
              <p>
                Unity Architecture დაარსდა 2008 წელს იმ ხედვით, რომ შეექმნა სივრცეები, რომლებიც არა მხოლოდ ლამაზია, 
                არამედ ფუნქციონალური და მდგრადიც. ჩვენი გუნდი შედგება მაღალკვალიფიციური არქიტექტორებისა და 
                დიზაინერებისგან, რომლებსაც აქვთ უმაღლესი განათლება და მდიდარი პრაქტიკული გამოცდილება.
              </p>
              <p>
                წლების განმავლობაში, ჩვენ განვახორციელეთ 150-ზე მეტი პროექტი, დაწყებული საცხოვრებელი კომპლექსებით 
                და დამთავრებული მსხვილი კომერციული ობიექტებით. ჩვენი ყოველი პროექტი ასახავს ჩვენს ძირითად ღირებულებებს: 
                ინოვაციას, ხარისხს და მდგრადობას.
              </p>
              <p>
                დღეს Unity Architecture არის ერთ-ერთი წამყვანი არქიტექტურული კომპანია საქართველოში, რომელიც 
                განუწყვეტლივ ავითარებს ახალ მიდგომებს და ტექნოლოგიებს.
              </p>
            </div>
          </div>
          <div class="space-y-6">
            <!-- Image placeholder -->
            <div class="aspect-video bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl flex items-center justify-center">
              <svg class="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="text-center"
          >
            <div class="text-4xl md:text-5xl font-bold text-yellow-500 mb-2">
              {{ stat.number }}
            </div>
            <div class="text-gray-600 font-medium">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">ჩვენი ღირებულებები</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            ეს ღირებულებები მიგვაჩნია ყოველი წარმატებული პროექტის საფუძვლად
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="value in values"
            :key="value.title"
            class="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
          >
            <div class="text-4xl mb-4">{{ value.icon }}</div>
            <h3 class="text-xl font-bold mb-3">{{ value.title }}</h3>
            <p class="text-gray-600">{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">ჩვენი გუნდი</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            გაიცანით ჩვენი მაღალკვალიფიციური სპეციალისტების გუნდი
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="member in teamMembers"
            :key="member.name"
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <!-- Team member photo placeholder -->
            <div class="aspect-square bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <svg class="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
            
            <div class="p-6">
              <h3 class="text-xl font-bold mb-2">{{ member.name }}</h3>
              <p class="text-yellow-500 font-medium mb-3">{{ member.position }}</p>
              <div class="space-y-1 text-sm text-gray-600">
                <p>{{ member.experience }}</p>
                <p>{{ member.education }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gray-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-4">მზად ხართ თქვენს პროექტზე მუშაობისთვის?</h2>
        <p class="text-xl text-gray-300 mb-8">დაგვიკავშირდით უფასო კონსულტაციისთვის</p>
        <router-link
          to="/contact"
          class="inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
        >
          {{ t('contact.title') }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
