<script setup lang="ts">
import { useTranslations } from '../composables/useTranslations'

const { t } = useTranslations()

const companyInfo = [
  { label: t('footer.company'), value: 'Unity Architecture' },
  { label: t('footer.address'), value: 'თბილისი, საქართველო' },
  { label: t('footer.phone'), value: '+995 577 300 333' },
  { label: t('footer.email'), value: 'info@unitydev.ge' },
]

const projects = [
  'პროექტი 1',
  'პროექტი 2', 
  'პროექტი 3',
  'პროექტი 4',
  'პროექტი 5',
  'პროექტი 6'
]

const socialLinks = [
  { name: 'Facebook', url: '#', icon: 'facebook' },
  { name: 'Instagram', url: '#', icon: 'instagram' },
  { name: 'LinkedIn', url: '#', icon: 'linkedin' },
  { name: 'Youtube', url: '#', icon: 'youtube' },
]
</script>

<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div class="col-span-1 md:col-span-1">
          <h3 class="text-lg font-semibold mb-4">{{ t('footer.company') }}</h3>
          <div class="space-y-2 text-gray-300">
            <div v-for="info in companyInfo" :key="info.label" class="text-sm">
              <span class="font-medium">{{ info.label }}:</span>
              <span class="ml-2">{{ info.value }}</span>
            </div>
          </div>
        </div>

        <!-- Projects -->
        <div class="col-span-1 md:col-span-1">
          <h3 class="text-lg font-semibold mb-4">{{ t('projects.title') }}</h3>
          <ul class="space-y-2 text-gray-300">
            <li v-for="project in projects" :key="project" class="text-sm hover:text-white cursor-pointer">
              {{ project }}
            </li>
          </ul>
        </div>

        <!-- Social Links -->
        <div class="col-span-1 md:col-span-1">
          <h3 class="text-lg font-semibold mb-4">{{ t('footer.social') }}</h3>
          <div class="space-y-2">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              class="block text-gray-300 hover:text-white text-sm transition-colors duration-200"
            >
              {{ social.name }}
            </a>
          </div>
        </div>

        <!-- Subscribe Section -->
        <div class="col-span-1 md:col-span-1">
          <h3 class="text-lg font-semibold mb-4">SUBSCRIBE</h3>
          <p class="text-gray-300 text-sm mb-4">
            გამოიწერეთ ჩვენი სიახლები
          </p>
          <div class="flex flex-col space-y-2">
            <input
              type="email"
              placeholder="ელ. ფოსტა"
              class="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <button class="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md font-medium transition-colors duration-200">
              {{ t('contact.send') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Border with Dots -->
      <div class="mt-12 pt-8 border-t border-gray-700">
        <div class="flex justify-center items-center space-x-2 mb-4">
          <div v-for="n in 30" :key="n" class="w-2 h-2 bg-gray-600 rounded-full"></div>
        </div>
        
        <div class="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div>{{ t('footer.rights') }}</div>
          <div>© {{ new Date().getFullYear() }} Unity Architecture</div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Additional styles if needed */
</style>
