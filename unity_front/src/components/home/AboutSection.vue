<script setup lang="ts">
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()
</script>

<template>
  <!-- About Section -->
  <section class="bg-yellow-50 py-16">
    <div class="max-w-7xl mx-auto px-4 md:px-8">
      <div class="text-center">
        <div class="h-40 mb-8"></div>
        <h2
          class="text-zinc-900 text-4xl font-normal font-roboto uppercase leading-loose tracking-[3px] mb-8"
        >
          {{ t('about.companyName') }}
        </h2>
        <p class="text-zinc-900 text-2xl font-normal font-roboto leading-loose max-w-4xl mx-auto">
          {{ t('about.description') }}
        </p>
      </div>

      <!-- Who We Are Section -->
      <div class="mt-16 text-center">
        <h3 class="text-black text-3xl font-black font-roboto uppercase leading-10 mb-8">
          {{ t('about.whoWeAre') }}
        </h3>
        <p
          class="text-zinc-900 text-xl font-normal font-roboto leading-loose max-w-3xl mx-auto mb-16"
        >
          {{ t('about.whoWeAreText') }}
        </p>

        <!-- History Section -->
        <h4
          class="text-black text-4xl font-bold font-lato uppercase leading-[60px] mb-8 text-center"
        >
          {{ t('about.history') }}
        </h4>
        <p class="text-zinc-900 text-xl font-normal font-roboto leading-loose max-w-3xl mx-auto">
          {{ t('about.historyText') }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
