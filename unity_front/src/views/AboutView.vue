<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTranslations } from '../composables/useTranslations'
import { useAboutInfo } from '../composables/useAboutInfo'

const { t } = useTranslations()
const { stats: aboutStats, loadAboutInfo, isLoading, error } = useAboutInfo()

// Load about info and translations on mount
onMounted(() => {
  loadAboutInfo()
})

const stats = computed(() => [
  { number: aboutStats.value.successful_projects, label: t('about.stats.successful_projects') },
  { number: aboutStats.value.years_experience, label: t('about.stats.years_experience') },
  { number: aboutStats.value.satisfied_clients, label: t('about.stats.satisfied_clients') },
  { number: aboutStats.value.client_satisfaction, label: t('about.stats.client_satisfaction') },
])

const values = computed(() => [
  {
    title: t('about.values.innovation.title'),
    description: t('about.values.innovation.description'),
  },
  {
    title: t('about.values.quality.title'),
    description: t('about.values.quality.description'),
  },
  {
    title: t('about.values.sustainability.title'),
    description: t('about.values.sustainability.description'),
  },
  {
    title: t('about.values.exclusivity.title'),
    description: t('about.values.exclusivity.description'),
  },
])
</script>

<template>
  <div class="about-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">{{ t('common.loading') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">{{ t('common.error') }}</h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="loadAboutInfo()"
          class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          {{ t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Hero Section -->
      <section
        class="relative h-[60vh] min-h-[500px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-orange-900"
      >
        <div class="absolute inset-0 bg-black/30"></div>
        <div class="relative z-10 h-full flex items-center">
          <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 text-white">
            <div class="max-w-4xl">
              <h1 class="text-5xl md:text-6xl lg:text-7xl font-light mb-8 leading-tight">
                {{ t('about.title') }}
              </h1>
              <p class="text-xl md:text-2xl text-orange-100 font-light leading-relaxed max-w-3xl">
                {{ t('about.hero.subtitle') }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Philosophy Section -->
      <section class="py-20 lg:py-32 bg-white">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div class="order-2 lg:order-1">
              <div class="space-y-8">
                <div>
                  <h2 class="text-4xl lg:text-5xl font-light mb-8 text-zinc-900">
                    {{ t('about.philosophy.title') }}
                  </h2>
                  <div class="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mb-8"></div>
                </div>

                <div class="space-y-6 text-lg text-zinc-600 leading-relaxed font-light">
                  <p>
                    {{ t('about.philosophy.paragraph1') }}
                  </p>
                  <p>
                    {{ t('about.philosophy.paragraph2') }}
                  </p>
                  <p>
                    {{ t('about.philosophy.paragraph3') }}
                  </p>
                </div>
              </div>
            </div>

            <div class="order-1 lg:order-2">
              <div
                class="aspect-[4/5] bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-2xl overflow-hidden shadow-2xl"
              >
                <div class="w-full h-full flex items-center justify-center">
                  <div class="text-6xl text-zinc-400">
                    <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="py-20 bg-gradient-to-r from-zinc-50 to-orange-50">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
          <div class="text-center mb-16">
            <h2 class="text-4xl lg:text-5xl font-light mb-4 text-zinc-900">
              {{ t('about.stats.title') }}
            </h2>
            <div class="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto"></div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div v-for="stat in stats" :key="stat.label" class="text-center group">
              <div class="mb-4">
                <div
                  class="text-4xl lg:text-6xl font-light text-orange-600 mb-2 transition-all duration-500 group-hover:scale-110"
                >
                  {{ stat.number }}
                </div>
                <div class="text-zinc-600 font-light text-lg">
                  {{ stat.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section class="py-20 lg:py-32 bg-white">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
          <div class="text-center mb-20">
            <h2 class="text-4xl lg:text-5xl font-light mb-8 text-zinc-900">
              {{ t('about.values.title') }}
            </h2>
            <div
              class="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-6"
            ></div>
            <p class="text-xl text-zinc-600 font-light max-w-3xl mx-auto leading-relaxed">
              {{ t('about.values.subtitle') }}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            <div v-for="value in values" :key="value.title" class="group">
              <div
                class="p-8 lg:p-12 rounded-2xl transition-all duration-500 hover:bg-gradient-to-br hover:from-zinc-50 hover:to-orange-50 hover:shadow-xl"
              >
                <div class="flex items-start space-x-6">
                  <div class="flex-shrink-0">
                    <div
                      class="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mt-2"
                    ></div>
                  </div>
                  <div class="flex-1">
                    <h3
                      class="text-2xl lg:text-3xl font-light mb-6 text-zinc-900 group-hover:text-orange-600 transition-colors duration-300"
                    >
                      {{ value.title }}
                    </h3>
                    <p class="text-lg text-zinc-600 font-light leading-relaxed">
                      {{ value.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Mission Statement -->
      <section
        class="py-20 lg:py-32 bg-gradient-to-br from-zinc-900 via-zinc-800 to-orange-900 text-white"
      >
        <div class="max-w-5xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 text-center">
          <h2 class="text-4xl lg:text-5xl font-light mb-12 leading-tight">
            {{ t('about.mission.title') }}
          </h2>
          <div
            class="w-24 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 mx-auto mb-12"
          ></div>
          <p class="text-xl lg:text-2xl font-light leading-relaxed text-orange-100 mb-12">
            {{ t('about.mission.description') }}
          </p>
          <div
            class="inline-block px-8 py-1 rounded-full border border-orange-400/30 bg-orange-400/10"
          >
            <span class="text-orange-200 font-light">Unity Architecture</span>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="bg-white py-20">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 text-center">
          <h2 class="text-4xl lg:text-5xl font-light mb-8 text-zinc-900">
            {{ t('about.cta.title') }}
          </h2>
          <div class="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-8"></div>
          <p class="text-xl text-zinc-600 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
            {{ t('about.cta.description') }}
          </p>
          <router-link
            to="/contact"
            class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 hover:from-orange-600 hover:to-orange-700"
          >
            {{ t('contact.title') }}
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              ></path>
            </svg>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations for luxury feel */
.group:hover .transition-all {
  transform: translateY(-2px);
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}
</style>
