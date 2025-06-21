<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '../composables/useTranslations'

const { t } = useTranslations()
const router = useRouter()
const isMobileMenuOpen = ref(false)

const navigation = [
  { key: 'header.home', path: '/' },
  { key: 'header.about', path: '/about' },
  { key: 'header.projects', path: '/projects' },
  { key: 'header.gallery', path: '/gallery' },
  { key: 'header.contact', path: '/contact' },
]

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const navigateTo = (path: string) => {
  router.push(path)
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="bg-gray-900 text-white sticky top-0 z-50">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex-shrink-0 flex items-center">
          <div class="w-8 h-8 bg-yellow-500 rounded-sm flex items-center justify-center">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-sm"></div>
          </div>
          <span class="ml-2 text-xl font-bold">Unity</span>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-8">
            <router-link
              v-for="item in navigation"
              :key="item.key"
              :to="item.path"
              class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              active-class="text-white bg-gray-700"
            >
              {{ t(item.key as any) }}
            </router-link>
          </div>
        </div>

        <!-- Language Switcher -->
        <div class="hidden md:flex items-center">
          <button class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            {{ t('header.language') }}
          </button>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="toggleMobileMenu"
            type="button"
            class="bg-gray-900 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Navigation Menu -->
    <div v-show="isMobileMenuOpen" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
        <router-link
          v-for="item in navigation"
          :key="item.key"
          :to="item.path"
          @click="navigateTo(item.path)"
          class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
          active-class="text-white bg-gray-700"
        >
          {{ t(item.key as any) }}
        </router-link>
        <button class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
          {{ t('header.language') }}
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Additional styles if needed */
</style>
