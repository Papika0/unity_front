<template>
  <div class="hidden md:flex md:flex-shrink-0 transition-all duration-300" :class="sidebarOpen ? 'w-72' : 'w-16'">
    <div class="flex flex-col flex-1 bg-white border-r border-slate-200 shadow-sm">
      <div class="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto overflow-x-hidden">
        <!-- Logo/Brand & Toggle -->
        <div class="flex items-center flex-shrink-0 mb-6 px-2">
          <div v-if="sidebarOpen" class="flex items-start justify-between w-full gap-2">
            <div class="flex items-start min-w-0 flex-1 gap-2">
              <div class="h-8 w-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 p-1 flex-shrink-0 mt-1">
                <img src="@/assets/logo_black.png" alt="Unity Logo" class="h-full w-full object-contain" />
              </div>
              <div class="min-w-0 flex-1">
                <h1 class="text-sm font-bold text-slate-800 leading-tight break-words">{{ t('admin.sidebar.title') }}</h1>
                <p class="text-xs text-slate-500 leading-tight break-words">{{ t('admin.sidebar.subtitle') }}</p>
              </div>
            </div>
            <button
              @click="emit('update:sidebarOpen', false)"
              class="group relative p-1.5 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 rounded-lg transition-all duration-200 hover:shadow-md flex-shrink-0 border border-slate-200 hover:border-amber-400"
              :title="t('admin.sidebar.collapse')"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-orange-400/0 group-hover:from-amber-400/10 group-hover:to-orange-400/10 rounded-lg transition-all duration-200"></div>
              <svg class="relative w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <button
            v-else
            @click="emit('update:sidebarOpen', true)"
            class="group relative p-2 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 rounded-lg transition-all duration-200 hover:shadow-md flex-shrink-0 border border-slate-200 hover:border-amber-400 mx-auto"
            :title="t('admin.sidebar.expand')"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-orange-400/0 group-hover:from-amber-400/10 group-hover:to-orange-400/10 rounded-lg transition-all duration-200"></div>
            <svg class="relative w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-2 space-y-2">
          <!-- Main Items -->
          <SidebarLink
            v-for="item in navItems"
            :key="item.id"
            :to="item.to"
            :icon="item.icon"
            :name="item.name"
            :color="item.color"
            :sidebar-open="sidebarOpen"
          />

          <!-- CRM Section -->
          <div class="pt-4 mt-4 border-t border-slate-200">
            <transition name="fade">
              <p v-if="sidebarOpen" class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {{ t('admin.sidebar.crm') }}
              </p>
            </transition>
            <SidebarLink
              v-for="item in crmItems"
              :key="item.id"
              :to="item.to"
              :icon="item.icon"
              :name="item.name"
              :color="item.color"
              :sidebar-open="sidebarOpen"
            />
          </div>

          <!-- Apartment Section -->
          <div v-if="isAdmin" class="pt-4 mt-4 border-t border-slate-200">
            <transition name="fade">
              <p v-if="sidebarOpen" class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {{ t('admin.sidebar.apartments_nav') }}
              </p>
            </transition>
            <SidebarLink
              v-for="item in apartmentItems"
              :key="item.id"
              :to="item.to"
              :icon="item.icon"
              :name="item.name"
              :color="item.color"
              :sidebar-open="sidebarOpen"
            />
          </div>

          <!-- Customer Section -->
          <div :class="isAdmin ? 'pt-4 mt-4 border-t border-slate-200' : ''">
            <transition name="fade">
              <p v-if="sidebarOpen" class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {{ t('admin.sidebar.customers') }}
              </p>
            </transition>
            <SidebarLink
              v-for="item in customerItems"
              :key="item.id"
              :to="item.to"
              :icon="item.icon"
              :name="item.name"
              :color="item.color"
              :sidebar-open="sidebarOpen"
            />
          </div>

          <!-- Calculator Section -->
          <div v-if="isAdmin || isMarketing" class="pt-4 mt-4 border-t border-slate-200">
            <transition name="fade">
              <p v-if="sidebarOpen" class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {{ t('admin.sidebar.calculator') }}
              </p>
            </transition>
            <SidebarLink
              v-for="item in calculatorItems"
              :key="item.id"
              :to="item.to"
              :icon="item.icon"
              :name="item.name"
              :color="item.color"
              :sidebar-open="sidebarOpen"
            />
          </div>
        </nav>

        <!-- User info at bottom -->
        <div class="flex-shrink-0 border-t border-slate-200 p-4">
          <div class="flex items-center" :class="sidebarOpen ? '' : 'justify-center'">
            <div
              class="bg-gradient-to-br from-amber-400 to-amber-500 rounded-full p-2 cursor-pointer"
              :title="!sidebarOpen ? (user?.name || user?.email || '') : ''"
              @click="!sidebarOpen ? emit('logout') : null"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <transition name="fade">
              <div v-if="sidebarOpen" class="ml-3 min-w-0">
                <p class="text-sm font-medium text-slate-700 truncate">{{ user?.name || user?.email }}</p>
                <button @click="emit('logout')" class="text-xs text-slate-500 hover:text-amber-600 transition-colors">
                  {{ t('admin.sidebar.logout') }}
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SidebarLink from './SidebarLink.vue'
import type { NavItem } from './navigation'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()

defineProps<{
  sidebarOpen: boolean
  isAdmin: boolean
  isMarketing: boolean
  user: { name?: string; email?: string } | null
  navItems: NavItem[]
  crmItems: NavItem[]
  apartmentItems: NavItem[]
  customerItems: NavItem[]
  calculatorItems: NavItem[]
}>()

const emit = defineEmits<{
  'update:sidebarOpen': [value: boolean]
  logout: []
}>()
</script>
