<script setup lang="ts">
import type { Project } from '@/types'

const props = defineProps<{
  project: Project
  formatDate: (dateStr: string) => string
}>()
</script>

<template>
  <div class="bg-slate-50 rounded-2xl p-6 mb-8">
    <h2 class="text-xl font-semibold text-slate-900 mb-4">პროექტის დეტალები</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-600">
      <div class="space-y-3">
        <div v-if="project.location">
          <span class="text-sm font-medium text-slate-500 uppercase tracking-wide">მდებარეობა</span>
          <p class="text-slate-900 font-medium">{{ project.location }}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-slate-500 uppercase tracking-wide">წელი</span>
          <p class="text-slate-900 font-medium">{{ project.year }}</p>
        </div>
      </div>
      <div class="space-y-3">
        <div>
          <span class="text-sm font-medium text-slate-500 uppercase tracking-wide">დაწყების თარიღი</span>
          <p class="text-slate-900 font-medium">{{ formatDate(project.start_date) }}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-slate-500 uppercase tracking-wide">დამთავრების თარიღი</span>
          <p class="text-slate-900 font-medium">{{ formatDate(project.completion_date) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
