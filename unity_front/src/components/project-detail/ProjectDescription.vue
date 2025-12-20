<template>
  <div
    ref="element"
    class="bg-white p-10 hover:shadow-2xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100 hover:border-[#FFCD4B]/30 relative overflow-hidden"
    :class="{
      'opacity-100 translate-y-0 scale-100 blur-0': isVisible,
      'opacity-0 translate-y-12 scale-95 blur-sm': !isVisible,
    }"
    style="transition-delay: 200ms"
  >
    <!-- Subtle background glow on hover -->
    <div
      class="absolute top-0 right-0 w-64 h-64 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 hover:opacity-100 transition-opacity duration-500"
    ></div>

    <div class="mb-8 relative z-10">
      <h2 class="text-4xl font-light text-zinc-900 mb-4">
        {{ t('projects.about.title') }}
      </h2>
      <div class="w-20 h-0.5 bg-[#FFCD4B] animate-expand"></div>
    </div>

    <!-- Enhanced Description with Better Typography -->
    <div class="prose prose-lg max-w-none relative z-10">
      <div
        class="space-y-6 text-zinc-700 leading-relaxed"
        v-html="formatDescription(description)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScrollAnimation } from '@/composables/useScrollAnimation'
import { useTranslations } from '@/composables/useTranslations'
import { formatDescription } from '@/utils/formatters'

const { t } = useTranslations()

defineProps<{
  description: string
}>()

const { element, isVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
</script>

<style scoped>
@keyframes expand {
  from { width: 0; }
  to { width: 5rem; }
}

.animate-expand {
  animation: expand 1s ease-out forwards;
}

/* Responsive Typography already handled by Tailwind prose or parent, 
   but added here for completeness if extracted strictly */
@media (max-width: 768px) {
  .prose p {
    font-size: 1rem;
    line-height: 1.75;
  }
}
</style>
