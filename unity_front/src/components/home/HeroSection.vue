<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()
</script>

<template>
  <!-- Hero Section -->
  <section
    class="relative h-[800px] bg-cover bg-center"
    style="background-image: url('https://placehold.co/1596x756')"
  >
    <!-- Overlays -->
    <div class="absolute inset-0 bg-zinc-900/80"></div>
    <div class="absolute inset-0 bg-sky-950"></div>

    <!-- Hero Content -->
    <div class="absolute inset-0 flex flex-col justify-center px-4 md:px-20">
      <div class="max-w-7xl mx-auto w-full">
        <p class="text-green-400 text-xl font-normal font-roboto leading-loose mb-4">
          {{ t('hero.address') }}
        </p>
        <h1
          class="text-orange-100 text-6xl font-normal font-roboto uppercase leading-[55px] mb-8 max-w-3xl"
        >
          {{ t('hero.title') }}
        </h1>
        <p
          class="text-orange-100 text-base font-normal font-roboto uppercase leading-tight tracking-[3.36px]"
        >
          {{ t('hero.cta') }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
