<template>
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">{{ t('admin.sidebar.customers') }}</h1>
      <p class="text-sm text-slate-600 mt-1">{{ t('admin.sidebar.customers') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'
const { t } = useTranslations()
</script>
