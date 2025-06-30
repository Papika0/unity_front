<script setup lang="ts">
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()
</script>

<template>
  <!-- Newsletter Section -->
  <section class="bg-white py-16">
    <div class="max-w-7xl mx-auto px-4 md:px-8">
      <div class="border-t border-zinc-900/20 pt-16">
        <div class="flex justify-between items-center border-b border-zinc-900/20 pb-4 mb-8">
          <h4 class="text-zinc-900 text-xl font-normal font-roboto leading-loose">
            {{ t('newsletter.title') }}
          </h4>
          <button
            class="text-zinc-900 text-base font-normal font-roboto uppercase leading-relaxed tracking-[3.36px] hover:text-zinc-600 transition-colors"
          >
            {{ t('newsletter.subscribe') }}
          </button>
        </div>
        <div class="border-b border-zinc-900/20 mb-16"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
