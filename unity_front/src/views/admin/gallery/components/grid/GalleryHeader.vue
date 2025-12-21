<template>
  <div class="mb-8 sm:mb-12">
    <h1
      class="text-3xl sm:text-4xl md:text-5xl font-light bg-gradient-to-r from-purple-500 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 sm:mb-3 tracking-tight leading-tight py-1"
    >
      {{ t('admin.gallery.title') }}
    </h1>
    <p class="text-slate-600 text-base sm:text-lg md:text-xl font-light">
      {{ t('admin.gallery.description') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()
</script>
