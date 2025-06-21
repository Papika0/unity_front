<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '../composables/useTranslations'

const { t } = useTranslations()
const router = useRouter()

const apartmentDetails = ref({
  id: 'AP-191',
  area: '105.5m²',
  price: '190,700m',
  floor: 'Floor 17',
  rooms: [
    { name: 'Hall', area: '21.5m²' },
    { name: 'Living room', area: '29.2m²' },
    { name: 'Bathroom 1', area: '7.8m²' },
    { name: 'Bathroom 2', area: '7.8m²' },
    { name: 'BR.1', area: '16.8m²' },
    { name: 'BR.2', area: '8.2m²' },
    { name: 'Terrace', area: '5.9m²' },
    { name: 'Terrace', area: '6.7m²' },
  ],
})

const navigateToProjects = () => {
  router.push('/projects')
}
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="relative h-screen bg-gradient-to-r from-gray-900 to-gray-700 flex items-center">
      <div class="absolute inset-0 bg-black opacity-50"></div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div class="max-w-3xl">
          <h1 class="text-5xl md:text-6xl font-bold mb-6">
            {{ t('hero.title') }}
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-gray-300">
            {{ t('hero.subtitle') }}
          </p>
          <button
            @click="navigateToProjects"
            class="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
          >
            {{ t('hero.cta') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Featured Apartment Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">ბინის არჩევის გვერდი</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <!-- Apartment Details -->
          <div class="space-y-6">
            <!-- Header Info -->
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-2xl font-bold">{{ apartmentDetails.id }}</h3>
                <p class="text-gray-600">{{ apartmentDetails.floor }}</p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold">{{ apartmentDetails.area }}</div>
                <div class="text-yellow-500 font-semibold text-lg">
                  {{ apartmentDetails.price }}
                </div>
              </div>
            </div>

            <!-- Room List -->
            <div class="space-y-3">
              <div
                v-for="(room, index) in apartmentDetails.rooms"
                :key="index"
                class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <div
                    class="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold mr-3"
                  >
                    {{ index + 1 }}
                  </div>
                  <span class="font-medium">{{ room.name }}</span>
                </div>
                <span class="text-gray-600">{{ room.area }}</span>
              </div>
            </div>

            <!-- Download PDF Button -->
            <div class="mt-8">
              <button
                class="flex items-center bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  />
                </svg>
                Download PDF
              </button>
            </div>

            <!-- Additional Info -->
            <div class="grid grid-cols-2 gap-4 mt-8 pt-6 border-t">
              <div>
                <p class="text-sm text-gray-600">ალ ბიტრო აღწერილ</p>
                <p class="text-sm text-gray-600">Investment</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">{{ apartmentDetails.area }}</p>
                <div class="flex items-center mt-2">
                  <span class="text-lg">$ </span>
                  <span class="text-lg font-semibold ml-1">₾</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3D Apartment View -->
          <div class="relative">
            <div class="bg-gray-100 rounded-xl p-6 min-h-[500px] flex items-center justify-center">
              <!-- Placeholder for 3D apartment view -->
              <div class="text-center">
                <div
                  class="w-64 h-64 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg mx-auto mb-4 flex items-center justify-center"
                >
                  <svg class="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                    />
                  </svg>
                </div>
                <p class="text-gray-600">3D Apartment View</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gray-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">გამოუყენეთ ჩვენი გამოცდილება</h2>
        <p class="text-xl text-gray-300 mb-8">ვსანაცვლოდ გაუზმელით თქვენს პროექტებს</p>
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
