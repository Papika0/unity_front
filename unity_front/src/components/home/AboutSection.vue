<script setup lang="ts">
import { useTranslations } from '../../composables/useTranslations'
import { RouterLink } from 'vue-router'

const { t } = useTranslations()

const companyNameParts = t('about.companyName').split(' ')
</script>

<template>
  <!-- About Section -->
  <section class="bg-yellow-50 py-16">
    <div class="max-w-3xl mx-auto px-8">
      <!-- Company Name -->
      <div class="mb-12">
        <h1 class="text-[#1A1120] text-4xl md:text-5xl font-bold font-serif leading-tight mb-1">
          {{ companyNameParts[0] }}
        </h1>
        <h2 class="text-[#1A1120] text-3xl md:text-4xl font-bold font-serif mb-6">
          {{ companyNameParts[1] }}
        </h2>
        <p
          class="text-[#1A1120] text-base md:text-lg font-normal font-serif leading-relaxed max-w-2xl mb-4"
        >
          {{ t('about.description') }}
        </p>
        <RouterLink
          to="/about"
          class="text-[#1A1120] text-sm font-serif cursor-pointer hover:text-[#333] transition-colors tracking-[3px]"
        >
          {{ t('news.readMore') }}
        </RouterLink>
      </div>

      <!-- Who We Are Section -->
      <div class="mb-12">
        <h3 class="text-[#1A1120] text-3xl font-bold font-roboto uppercase mb-8">
          {{ t('about.whoWeAre') }}
        </h3>
        <p class="text-[#1A1120] text-xl font-normal font-roboto leading-relaxed mb-8 max-w-2xl">
          {{ t('about.whoWeAreText') }}
        </p>
      </div>

      <!-- History Section -->
      <div>
        <h4 class="text-[#1A1120] text-3xl font-bold font-roboto uppercase mb-8">
          {{ t('about.history') }}
        </h4>
        <p class="text-[#1A1120] text-xl font-normal font-roboto leading-relaxed max-w-2xl">
          {{ t('about.historyText') }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
