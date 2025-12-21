<script setup lang="ts">
import type { Project } from '@/types'
import { useTranslations } from '@/composables/i18n/useTranslations'

defineProps<{
  project: Project
}>()

const { t } = useTranslations()
</script>

<template>
  <div class="mb-8">
    <h2 class="text-2xl font-semibold text-slate-900 mb-4">{{ t('admin.projects.render') }}</h2>
    <div class="rounded-2xl overflow-hidden shadow-lg">
      <img
        :src="typeof project.render_image === 'string' ? project.render_image : project.render_image?.url"
        :alt="typeof project.render_image === 'string' ? project.title + ' render' : project.render_image?.alt_text || project.title + ' render'"
        class="w-full h-80 object-cover"
      />
    </div>
  </div>
</template>
