<script setup lang="ts">
import type { Project } from '@/types'

const props = defineProps<{
  project: Project
}>()
</script>

<template>
  <div class="border-t border-slate-200 pt-8">
    <h2 class="text-2xl font-semibold text-slate-900 mb-6">გალერია</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(img, idx) in project.gallery_images"
        :key="idx"
        class="relative overflow-hidden rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105"
      >
        <img
          :src="typeof img === 'string' ? img : img.url"
          :alt="typeof img === 'string' ? `${project.title} gallery ${idx + 1}` : img.alt_text || `${project.title} gallery ${idx + 1}`"
          class="object-cover w-full h-64 hover:brightness-110 transition-all duration-300"
        />
      </div>
    </div>
  </div>
</template>
