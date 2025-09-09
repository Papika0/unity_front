<script setup lang="ts">
import { computed } from 'vue'
import { useTranslations } from '../../composables/useTranslations'
import { RouterLink } from 'vue-router'

const { t } = useTranslations()

const companyNameParts = computed(() => {
  const companyName = t('home.company_name')
  // Only split if we have a valid translation (not the key itself)
  return companyName && companyName !== 'home.company_name' ? companyName.split(' ') : []
})
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
          {{ t('home.small_desc') }}
        </p>
        <RouterLink
          to="/about"
          class="text-[#1A1120] text-sm font-serif cursor-pointer hover:text-[#333] transition-colors tracking-[3px]"
        >
          {{ t('buttons.see_details') }}
        </RouterLink>
      </div>

      <!-- Who We Are Section -->
      <div class="mb-12">
        <h3 class="text-[#1A1120] text-3xl font-bold font-roboto uppercase mb-8">
          {{ t('home.whoarewe') }}
        </h3>
        <p class="text-[#1A1120] text-xl font-normal font-roboto leading-relaxed mb-8 max-w-2xl">
          {{ t('home.description') }}
        </p>
      </div>

      <!-- History Section -->
      <div>
        <h4 class="text-[#1A1120] text-3xl font-bold font-roboto uppercase mb-8">
          {{ t('home.history') }}
        </h4>
        <p class="text-[#1A1120] text-xl font-normal font-roboto leading-relaxed max-w-2xl">
          {{ t('home.history_text') }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
