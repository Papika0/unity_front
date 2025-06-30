<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '../composables/useTranslations'

interface Props {
  transparent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  transparent: false,
})

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
  <header
    :class="[
      'h-20 flex items-center z-50',
      transparent
        ? 'bg-transparent text-orange-100 absolute top-0 left-0 right-0'
        : 'bg-white text-black border-b border-zinc-900/20',
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
      <!-- Logo -->
      <div class="h-8 w-8">
        <svg viewBox="0 0 100 100" class="h-full w-full">
          <!-- Outer triangle -->
          <polygon points="50,10 90,80 10,80" fill="none" stroke="#D4AF37" stroke-width="3" />
          <!-- Middle triangle -->
          <polygon points="50,25 75,65 25,65" fill="none" stroke="#D4AF37" stroke-width="3" />
          <!-- Inner triangle -->
          <polygon points="50,40 60,50 40,50" fill="none" stroke="#D4AF37" stroke-width="3" />
        </svg>
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex space-x-8">
        <router-link
          v-for="item in navigation"
          :key="item.key"
          :to="item.path"
          :class="[
            'text-xl font-normal font-roboto leading-relaxed transition-colors duration-200',
            transparent
              ? 'text-orange-100 hover:text-orange-200'
              : 'text-zinc-900 hover:text-zinc-600',
          ]"
          :active-class="transparent ? 'text-orange-200' : 'text-zinc-600'"
        >
          {{ t(item.key as any) }}
        </router-link>
      </nav>

      <!-- Language Switcher -->
      <div class="hidden md:flex space-x-4">
        <button
          :class="[
            'text-xl font-normal font-roboto leading-relaxed',
            transparent
              ? 'text-orange-100 hover:text-orange-200'
              : 'text-zinc-900 hover:text-zinc-600',
          ]"
        >
          EN
        </button>
        <button
          :class="[
            'text-xl font-normal font-roboto leading-relaxed',
            transparent
              ? 'text-orange-100 hover:text-orange-200'
              : 'text-zinc-900 hover:text-zinc-600',
          ]"
        >
          KA
        </button>
      </div>

      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button
          @click="toggleMobileMenu"
          type="button"
          :class="[
            'inline-flex items-center justify-center p-2 focus:outline-none focus:ring-2',
            transparent
              ? 'text-orange-100 hover:bg-black/20 focus:ring-orange-100'
              : 'text-zinc-900 hover:bg-gray-100 focus:ring-zinc-900',
          ]"
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

    <!-- Mobile Navigation Menu -->
    <div
      v-show="isMobileMenuOpen"
      :class="[
        'absolute top-full left-0 right-0 md:hidden',
        transparent
          ? 'bg-black/90 border-b border-orange-100/20'
          : 'bg-white border-b border-zinc-900/20',
      ]"
    >
      <div class="px-4 py-3 space-y-3">
        <router-link
          v-for="item in navigation"
          :key="item.key"
          :to="item.path"
          @click="navigateTo(item.path)"
          :class="[
            'block text-xl font-normal font-roboto leading-relaxed',
            transparent
              ? 'text-orange-100 hover:text-orange-200'
              : 'text-zinc-900 hover:text-zinc-600',
          ]"
          :active-class="transparent ? 'text-orange-200' : 'text-zinc-600'"
        >
          {{ t(item.key as any) }}
        </router-link>
        <div
          :class="[
            'flex space-x-4 pt-2 border-t',
            transparent ? 'border-orange-100/20' : 'border-zinc-900/20',
          ]"
        >
          <button
            :class="[
              'text-xl font-normal font-roboto leading-relaxed',
              transparent
                ? 'text-orange-100 hover:text-orange-200'
                : 'text-zinc-900 hover:text-zinc-600',
            ]"
          >
            EN
          </button>
          <button
            :class="[
              'text-xl font-normal font-roboto leading-relaxed',
              transparent
                ? 'text-orange-100 hover:text-orange-200'
                : 'text-zinc-900 hover:text-zinc-600',
            ]"
          >
            KA
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Additional styles if needed */
</style>
