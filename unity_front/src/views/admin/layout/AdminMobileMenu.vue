<template>
  <div class="md:hidden">
    <div class="fixed inset-0 flex z-40">
      <div class="fixed inset-0 bg-slate-900 bg-opacity-50" @click="emit('close')"></div>
      <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div class="absolute top-0 right-0 -mr-12 pt-2">
          <button
            @click="emit('close')"
            class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
          >
            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div class="flex-shrink-0 flex items-center px-4">
            <div class="h-8 w-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
              <img src="@/assets/logo_black.png" alt="Unity Logo" class="h-full w-full object-contain" />
            </div>
            <h1 class="ml-3 text-lg font-bold text-slate-800">{{ t('admin.sidebar.title') }}</h1>
          </div>
          <nav class="mt-5 px-4 space-y-2">
            <MobileNavLink
              v-for="item in navItems"
              :key="item.id"
              :to="item.to"
              :name="item.name"
              :color="item.color"
              @click="emit('close')"
            />

            <!-- Customers Section -->
            <div class="pt-4 mt-4 border-t border-slate-200">
              <MobileNavLink
                v-for="item in customerItems"
                :key="item.id"
                :to="item.to"
                :name="item.name"
                :color="item.color"
                @click="emit('close')"
              />
            </div>

            <!-- Calculator Section -->
            <div v-if="isAdmin || isMarketing" class="pt-4 mt-4 border-t border-slate-200">
              <p class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{{ t('admin.sidebar.calculator') }}</p>
              <MobileNavLink
                v-for="item in calculatorItems"
                :key="item.id"
                :to="item.to"
                :name="item.name"
                :color="item.color"
                @click="emit('close')"
              />
            </div>

            <!-- Language Switcher (Mobile) -->
            <div class="pt-4 mt-4 border-t border-slate-200 px-4 pb-4">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Language</p>
              <div class="flex items-center space-x-2">
                <button
                  v-for="locale in (['en', 'ka', 'ru'] as const)"
                  :key="locale"
                  @click="localeStore.setLocale(locale)"
                  :class="[
                    'px-3 py-2 text-sm font-medium rounded-md w-full transition-all duration-200 border',
                    localeStore.currentLocale === locale
                      ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
                      : 'text-slate-600 bg-white border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  ]"
                >
                  {{ locale.toUpperCase() }}
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleStore } from '@/stores/ui/locale'
import MobileNavLink from './MobileNavLink.vue'
import type { NavItem } from './navigation'

const { t } = useTranslations()
const localeStore = useLocaleStore()

defineProps<{
  isAdmin: boolean
  isMarketing: boolean
  navItems: NavItem[]
  customerItems: NavItem[]
  calculatorItems: NavItem[]
}>()

const emit = defineEmits<{
  close: []
}>()
</script>
