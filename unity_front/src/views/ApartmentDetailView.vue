<template>
  <div class="apartment-detail-view min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
    <!-- Page Header -->
    <div class="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white py-16 border-b-2 border-[#FFCD4B]/20">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <button
          @click="goBack"
          class="mb-6 flex items-center gap-2 text-zinc-400 hover:text-[#FFCD4B] transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>{{ t('common.back') }}</span>
        </button>
        <h1 class="text-5xl lg:text-6xl font-light tracking-tight">
          <span class="text-zinc-300">{{ t('apartments.apartment') }}</span>
          <span class="text-[#FFCD4B] ml-4">{{ apartmentId }}</span>
        </h1>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 py-16">
      <div class="bg-zinc-900/30 rounded-xl border border-zinc-800 p-12">
        <p class="text-zinc-400 text-center text-lg">
          {{ t('apartments.detail_coming_soon') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTranslations } from '@/composables/useTranslations'

interface Props {
  projectId: number
  buildingIdentifier: string
  floorNumber: number
  apartmentId: number
}

const props = defineProps<Props>()

const router = useRouter()
const { t } = useTranslations()

function goBack() {
  router.push({
    name: 'apartment-selection',
    params: {
      id: props.projectId,
      buildingIdentifier: props.buildingIdentifier,
      floorNumber: props.floorNumber,
    },
  })
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
