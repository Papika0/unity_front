<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
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

  // Prevent body scroll when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const navigateTo = (path: string) => {
  router.push(path)
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <header
    :class="[
      'h-24 flex items-center z-[80]',
      transparent
        ? 'bg-transparent text-orange-100 absolute top-0 left-0 right-0'
        : 'bg-white text-black border-b border-zinc-900/20 relative',
    ]"
  >
    <div class="w-full px-8 lg:px-16 xl:px-20 2xl:px-32 flex items-center">
      <!-- Mobile menu button - Left side -->
      <div class="lg:hidden">
        <button
          @click="toggleMobileMenu"
          type="button"
          :class="[
            'relative inline-flex items-center justify-center p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2',
            transparent
              ? 'text-orange-100 hover:bg-white/10 focus:ring-orange-100'
              : 'text-zinc-900 hover:bg-zinc-100 focus:ring-zinc-900',
          ]"
        >
          <span class="sr-only">Toggle menu</span>
          <!-- Animated burger menu -->
          <div class="w-6 h-5 relative flex flex-col justify-between">
            <span
              :class="[
                'block h-0.5 w-full transform transition-all duration-300',
                transparent ? 'bg-orange-100' : 'bg-zinc-900',
                isMobileMenuOpen ? 'rotate-45 translate-y-2' : '',
              ]"
            ></span>
            <span
              :class="[
                'block h-0.5 w-full transition-all duration-300',
                transparent ? 'bg-orange-100' : 'bg-zinc-900',
                isMobileMenuOpen ? 'opacity-0' : '',
              ]"
            ></span>
            <span
              :class="[
                'block h-0.5 w-full transform transition-all duration-300',
                transparent ? 'bg-orange-100' : 'bg-zinc-900',
                isMobileMenuOpen ? '-rotate-45 -translate-y-2' : '',
              ]"
            ></span>
          </div>
        </button>
      </div>

      <!-- Logo - Centered on mobile, left on desktop -->
      <div
        :class="[
          'h-12 w-auto transition-all duration-200',
          'lg:h-14',
          'lg:mr-20 xl:mr-32 2xl:mr-40 lg:flex-shrink-0',
          'flex-1 flex justify-center lg:flex-none lg:justify-start items-center',
        ]"
      >
        <img
          src="/src/assets/logo_black.png"
          alt="Unity Development Logo"
          class="h-full w-auto object-contain"
        />
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex lg:space-x-10 xl:space-x-14 2xl:space-x-16 items-center">
        <router-link
          v-for="item in navigation"
          :key="item.key"
          :to="item.path"
          :class="[
            'text-base xl:text-lg font-medium transition-colors duration-200 whitespace-nowrap',
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
      <div class="hidden lg:flex items-center space-x-4 xl:space-x-6 ml-auto">
        <button
          :class="[
            'px-3 py-2 text-sm xl:text-base font-medium transition-all duration-200 whitespace-nowrap rounded-lg',
            transparent
              ? 'text-orange-100 hover:text-orange-200 hover:bg-white/10'
              : 'text-zinc-900 hover:text-zinc-600 hover:bg-zinc-100',
          ]"
        >
          EN
        </button>
        <button
          :class="[
            'px-3 py-2 text-sm xl:text-base font-medium transition-all duration-200 whitespace-nowrap rounded-lg',
            transparent
              ? 'text-orange-100 hover:text-orange-200 hover:bg-white/10'
              : 'text-zinc-900 hover:text-zinc-600 hover:bg-zinc-100',
          ]"
        >
          KA
        </button>
        <button
          :class="[
            'px-3 py-2 text-sm xl:text-base font-medium transition-all duration-200 whitespace-nowrap rounded-lg',
            transparent
              ? 'text-orange-100 hover:text-orange-200 hover:bg-white/10'
              : 'text-zinc-900 hover:text-zinc-600 hover:bg-zinc-100',
          ]"
        >
          RU
        </button>
      </div>

      <!-- Spacer for mobile layout balance -->
      <div class="lg:hidden w-12"></div>
    </div>

    <!-- Mobile Navigation Menu -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-black/50 z-[90] lg:hidden"
        @click="toggleMobileMenu"
      ></div>
    </transition>

    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform -translate-y-4"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform -translate-y-4"
    >
      <div
        v-show="isMobileMenuOpen"
        :class="[
          'fixed top-24 left-0 right-0 lg:hidden shadow-2xl z-[100]',
          transparent
            ? 'bg-black/95 backdrop-blur-md border-b border-orange-100/20'
            : 'bg-white border-b border-zinc-900/20',
        ]"
      >
        <div class="px-8 py-6 space-y-2">
          <router-link
            v-for="(item, index) in navigation"
            :key="item.key"
            :to="item.path"
            @click="navigateTo(item.path)"
            :style="{ transitionDelay: `${index * 50}ms` }"
            :class="[
              'block text-lg font-medium py-3 px-4 rounded-lg transition-all duration-300 transform',
              transparent
                ? 'text-orange-100 hover:text-orange-200 hover:bg-white/10'
                : 'text-zinc-900 hover:text-zinc-600 hover:bg-zinc-100',
              isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0',
            ]"
            :active-class="
              transparent ? 'text-orange-200 bg-white/10' : 'text-zinc-600 bg-zinc-100'
            "
          >
            {{ t(item.key as any) }}
          </router-link>

          <!-- Language switcher in mobile -->
          <div
            :class="[
              'flex justify-center space-x-4 pt-4 mt-4 border-t',
              transparent ? 'border-orange-100/20' : 'border-zinc-200',
            ]"
          >
            <button
              :class="[
                'px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg',
                transparent
                  ? 'text-orange-100 hover:text-orange-200 hover:bg-white/10'
                  : 'text-zinc-900 hover:text-zinc-600 hover:bg-zinc-100',
              ]"
            >
              EN
            </button>
            <button
              :class="[
                'px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg',
                transparent
                  ? 'text-orange-100 hover:text-orange-200 hover:bg-white/10'
                  : 'text-zinc-900 hover:text-zinc-600 hover:bg-zinc-100',
              ]"
            >
              KA
            </button>
            <button
              :class="[
                'px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg',
                transparent
                  ? 'text-orange-100 hover:text-orange-200 hover:bg-white/10'
                  : 'text-zinc-900 hover:text-zinc-600 hover:bg-zinc-100',
              ]"
            >
              RU
            </button>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
/* Additional styles if needed */
</style>
