<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '../composables/useTranslations'
import { useLocaleStore } from '@/stores/ui/locale'
import IconPhone from './icons/IconPhone.vue'

interface Props {
  transparent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  transparent: false,
})

const { t } = useTranslations()
const localeStore = useLocaleStore()
const router = useRouter()
const isMobileMenuOpen = ref(false)

const emit = defineEmits<{
  openPhoneModal: []
}>()

const openPhoneModal = () => {
  emit('openPhoneModal')
  // Close mobile menu if open
  if (isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
    document.body.style.overflow = ''
  }
}

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
          'h-10 w-auto transition-all duration-200',
          'lg:h-12 xl:h-14',
          'lg:mr-8 xl:mr-16 2xl:mr-32 lg:flex-shrink-0',
          'flex-1 flex justify-center lg:flex-none lg:justify-start items-center',
          'min-w-0', // Prevent flex-1 from expanding too much
        ]"
      >
        <img
          :src="transparent ? '/src/assets/logo.png' : '/src/assets/logo_black.png'"
          alt="Unity Development Logo"
          class="h-full w-auto object-contain"
        />
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex lg:space-x-4 xl:space-x-8 2xl:space-x-12 items-center flex-shrink lg:mx-auto xl:mx-0">
        <router-link
          v-for="item in navigation"
          :key="item.key"
          :to="item.path"
          :class="[
            'text-sm lg:text-base xl:text-lg font-medium transition-colors duration-200 whitespace-nowrap',
            transparent
              ? 'text-orange-100 hover:text-orange-200'
              : 'text-zinc-900 hover:text-zinc-600',
          ]"
          :active-class="transparent ? 'text-orange-200' : 'text-zinc-600'"
        >
          {{ t(item.key as any) }}
        </router-link>
      </nav>

      <!-- Call Us Button & Language Switcher -->
      <div class="hidden lg:flex items-center space-x-2 xl:space-x-4 ml-auto flex-shrink-0">
        <!-- Call Us Button -->
        <button
          @click="openPhoneModal"
          :class="[
            'inline-flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 text-xs xl:text-sm font-normal font-roboto uppercase tracking-widest transition-all duration-200 whitespace-nowrap',
            transparent
              ? 'border border-orange-100 text-orange-100 hover:bg-orange-100 hover:text-zinc-900'
              : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white',
          ]"
        >
          <IconPhone class="w-3.5 h-3.5 xl:w-4 xl:h-4" />
          {{ t('footer.callUS') || 'Call Us' }}
        </button>

        <!-- Language Switcher -->
        <div class="flex items-center gap-0.5 border rounded-sm p-0.5" :class="transparent ? 'border-orange-100/30' : 'border-zinc-900/20'">
          <button
            :class="[
              'px-2 py-1 xl:px-3 xl:py-1.5 text-xs font-medium transition-all duration-200 whitespace-nowrap',
              localeStore.currentLocale === 'en'
                ? transparent
                  ? 'bg-orange-100 text-zinc-900'
                  : 'bg-zinc-900 text-white'
                : transparent
                  ? 'text-orange-100 hover:text-orange-200'
                  : 'text-zinc-900 hover:text-zinc-600',
            ]"
            @click="localeStore.setLocale('en')"
          >
            EN
          </button>
          <button
            :class="[
              'px-2 py-1 xl:px-3 xl:py-1.5 text-xs font-medium transition-all duration-200 whitespace-nowrap',
              localeStore.currentLocale === 'ka'
                ? transparent
                  ? 'bg-orange-100 text-zinc-900'
                  : 'bg-zinc-900 text-white'
                : transparent
                  ? 'text-orange-100 hover:text-orange-200'
                  : 'text-zinc-900 hover:text-zinc-600',
            ]"
            @click="localeStore.setLocale('ka')"
          >
            KA
          </button>
          <button
            :class="[
              'px-2 py-1 xl:px-3 xl:py-1.5 text-xs font-medium transition-all duration-200 whitespace-nowrap',
              localeStore.currentLocale === 'ru'
                ? transparent
                  ? 'bg-orange-100 text-zinc-900'
                  : 'bg-zinc-900 text-white'
                : transparent
                  ? 'text-orange-100 hover:text-orange-200'
                  : 'text-zinc-900 hover:text-zinc-600',
            ]"
            @click="localeStore.setLocale('ru')"
          >
            RU
          </button>
        </div>
      </div>

      <!-- Spacer for mobile layout balance - matches the hamburger button width -->
      <div class="lg:hidden flex-shrink-0" style="width: 60px;"></div>
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

          <!-- Call Us Button in mobile -->
          <button
            @click="openPhoneModal"
            :style="{ transitionDelay: `${navigation.length * 50}ms` }"
            :class="[
              'w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-normal font-roboto uppercase tracking-widest transition-all duration-300 transform',
              transparent
                ? 'border border-orange-100 text-orange-100 hover:bg-orange-100 hover:text-zinc-900'
                : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white',
              isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0',
            ]"
          >
            <IconPhone class="w-4 h-4" />
            {{ t('footer.callUS') || 'Call Us' }}
          </button>

          <!-- Language switcher in mobile -->
          <div
            :class="[
              'flex justify-center pt-4 mt-4 border-t',
              transparent ? 'border-orange-100/20' : 'border-zinc-200',
            ]"
          >
            <div class="flex items-center gap-1 border rounded-sm p-0.5" :class="transparent ? 'border-orange-100/30' : 'border-zinc-900/20'">
              <button
                :class="[
                  'px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  localeStore.currentLocale === 'en'
                    ? transparent
                      ? 'bg-orange-100 text-zinc-900'
                      : 'bg-zinc-900 text-white'
                    : transparent
                      ? 'text-orange-100 hover:text-orange-200'
                      : 'text-zinc-900 hover:text-zinc-600',
                ]"
                @click="localeStore.setLocale('en')"
              >
                EN
              </button>
              <button
                :class="[
                  'px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  localeStore.currentLocale === 'ka'
                    ? transparent
                      ? 'bg-orange-100 text-zinc-900'
                      : 'bg-zinc-900 text-white'
                    : transparent
                      ? 'text-orange-100 hover:text-orange-200'
                      : 'text-zinc-900 hover:text-zinc-600',
                ]"
                @click="localeStore.setLocale('ka')"
              >
                KA
              </button>
              <button
                :class="[
                  'px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  localeStore.currentLocale === 'ru'
                    ? transparent
                      ? 'bg-orange-100 text-zinc-900'
                      : 'bg-zinc-900 text-white'
                    : transparent
                      ? 'text-orange-100 hover:text-orange-200'
                      : 'text-zinc-900 hover:text-zinc-600',
                ]"
                @click="localeStore.setLocale('ru')"
              >
                RU
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
/* Additional styles if needed */
</style>
