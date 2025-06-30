<script setup lang="ts">
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()
</script>

<template>
  <!-- Featured Project - Unity Balance -->
  <section class="bg-white">
    <div class="w-full">
      <div class="relative">
        <img
          src="https://placehold.co/900x806"
          alt="Unity Balance Project"
          class="w-full h-[800px] object-cover"
        />
        <div class="absolute inset-0 bg-zinc-900/50"></div>

        <div class="absolute inset-0 flex flex-col justify-center items-center text-center px-8">
          <h3
            class="text-orange-100 text-4xl font-normal font-roboto uppercase leading-loose tracking-[3px] mb-8"
          >
            {{ t('featured.title') }}
          </h3>
          <p class="text-orange-100 text-xl font-normal font-roboto leading-loose max-w-2xl mb-12">
            {{ t('featured.description') }}
          </p>
          <button
            class="text-orange-100 text-base font-normal font-roboto uppercase leading-tight tracking-[3.36px] hover:text-amber-300 transition-colors"
          >
            {{ t('featured.cta') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
