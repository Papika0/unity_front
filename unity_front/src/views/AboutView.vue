<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useTranslations } from '../composables/useTranslations'
import { useAboutInfo } from '../composables/useAboutInfo'

const { t } = useTranslations()
const { aboutInfo, stats: aboutStats, loadAboutInfo, isLoading, error } = useAboutInfo()

const scrollProgress = ref(0)

// Scroll progress tracking
const handleScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = (scrollTop / docHeight) * 100
}

onMounted(() => {
  loadAboutInfo()
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
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
    <!-- Scroll Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
      <div
        class="h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-150 ease-out"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="min-h-screen bg-black flex items-center justify-center">
      <div class="text-center">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[#FFCD4B] mb-6"
        ></div>
        <p class="text-lg text-[#FFCD4B] font-light uppercase tracking-wider">
          {{ t('about.loading') }}
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="min-h-screen bg-black flex items-center justify-center">
      <div class="text-center max-w-md mx-auto px-8">
        <div class="text-5xl mb-6">⚠️</div>
        <h2 class="text-xl font-light text-white mb-3">{{ t('about.error') }}</h2>
        <p class="text-base text-zinc-400 mb-8 font-light">{{ error }}</p>
        <button
          @click="loadAboutInfo()"
          class="px-8 py-3 bg-black text-[#FFCD4B] font-light text-sm uppercase tracking-wider transition-all duration-300 hover:bg-zinc-900 border border-[#FFCD4B]/30"
        >
          {{ t('about.retry') }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Hero Section -->
      <section class="relative h-[45vh] min-h-[350px] overflow-hidden bg-black">
        <!-- Background Image with Overlay -->
        <div
          v-if="aboutInfo?.hero_image_url"
          class="absolute inset-0"
          :style="`background-image: url(${aboutInfo.hero_image_url}); background-size: cover; background-position: center;`"
        >
          <div class="absolute inset-0 bg-black/70"></div>
        </div>

        <!-- Diagonal overlay accent -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-[#FFCD4B]/10 via-transparent to-transparent"
        ></div>

        <!-- Decorative corner elements -->
        <div class="absolute top-0 right-0 w-64 h-64 opacity-20">
          <div
            class="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#FFCD4B]"
          ></div>
        </div>
        <div class="absolute bottom-0 left-0 w-64 h-64 opacity-20">
          <div
            class="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#FFCD4B]"
          ></div>
        </div>

        <!-- Content -->
        <div class="relative z-10 h-full flex flex-col justify-center">
          <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 w-full">
            <div class="max-w-3xl fade-in-up">
              <h1
                class="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight text-white"
              >
                {{ t('about.title') }}
              </h1>
              <div class="w-20 h-1 bg-gradient-to-r from-[#FFCD4B] to-transparent mb-6"></div>
              <p class="text-lg md:text-xl text-[#FFCD4B] font-light leading-relaxed max-w-2xl">
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
            <div class="order-2 lg:order-1 fade-in-up">
              <div class="space-y-8">
                <div>
                  <h2 class="text-4xl lg:text-5xl font-light mb-8 text-zinc-900">
                    {{ t('about.philosophy.title') }}
                  </h2>
                  <div class="w-20 h-0.5 bg-[#FFCD4B] mb-6 animate-expand"></div>
                </div>

                <div class="space-y-6 text-lg text-zinc-700 leading-relaxed font-light">
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

            <div class="order-1 lg:order-2 fade-in-up" style="animation-delay: 100ms">
              <div
                class="group aspect-[4/5] bg-zinc-100 overflow-hidden hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 relative"
              >
                <img
                  v-if="aboutInfo?.philosophy_image_url"
                  :src="aboutInfo.philosophy_image_url"
                  :alt="t('about.philosophy.image_alt')"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-24 h-24 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    />
                  </svg>
                </div>

                <!-- Gradient overlay on hover -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>

                <!-- Golden accent line on hover -->
                <div
                  class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="py-20 bg-zinc-50">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
          <div class="text-center mb-16 fade-in">
            <h2 class="text-4xl lg:text-5xl font-light mb-4 text-zinc-900">
              {{ t('about.stats.title') }}
            </h2>
            <div class="w-20 h-0.5 bg-[#FFCD4B] mx-auto animate-expand"></div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div
              v-for="(stat, index) in stats"
              :key="stat.label"
              class="text-center group fade-in-up"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <div
                class="bg-white p-8 hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 relative overflow-hidden"
              >
                <!-- Subtle background accent -->
                <div
                  class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>

                <div class="relative z-10">
                  <div
                    class="text-4xl lg:text-5xl font-light mb-2 transition-all duration-500 group-hover:scale-110 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] bg-clip-text text-transparent"
                  >
                    {{ stat.number }}
                  </div>
                  <div class="text-zinc-700 font-light text-base">
                    {{ stat.label }}
                  </div>
                </div>

                <!-- Golden accent line on hover -->
                <div
                  class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section class="py-20 lg:py-32 bg-white">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
          <div class="text-center mb-20 fade-in">
            <h2 class="text-4xl lg:text-5xl font-light mb-6 text-zinc-900">
              {{ t('about.values.title') }}
            </h2>
            <div class="w-20 h-0.5 bg-[#FFCD4B] mx-auto mb-6 animate-expand"></div>
            <p class="text-xl text-zinc-700 font-light max-w-3xl mx-auto leading-relaxed">
              {{ t('about.values.subtitle') }}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div
              v-for="(value, index) in values"
              :key="value.title"
              class="group fade-in-up"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <div
                class="bg-white p-8 lg:p-10 hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 relative overflow-hidden h-full"
              >
                <!-- Subtle background accent -->
                <div
                  class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>

                <div class="relative z-10">
                  <!-- Golden accent icon -->
                  <div
                    class="w-12 h-12 rounded-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] mb-6 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center"
                  >
                    <div class="w-3 h-3 rounded-full bg-white"></div>
                  </div>

                  <h3
                    class="text-2xl lg:text-3xl font-light mb-4 text-zinc-900 group-hover:text-[#C89116] transition-colors duration-300"
                  >
                    {{ value.title }}
                  </h3>
                  <p class="text-lg text-zinc-700 font-light leading-relaxed">
                    {{ value.description }}
                  </p>
                </div>

                <!-- Golden accent line on hover -->
                <div
                  class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Mission Statement -->
      <section class="relative py-16 lg:py-20 bg-black text-white overflow-hidden">
        <!-- Diagonal overlay accent -->
        <div
          class="absolute inset-0 bg-gradient-to-tl from-[#FFCD4B]/10 via-transparent to-transparent"
        ></div>

        <!-- Decorative corner elements -->
        <div class="absolute top-0 left-0 w-64 h-64 opacity-20">
          <div
            class="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#FFCD4B]"
          ></div>
        </div>
        <div class="absolute bottom-0 right-0 w-64 h-64 opacity-20">
          <div
            class="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#FFCD4B]"
          ></div>
        </div>

        <div class="relative z-10 max-w-4xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 text-center">
          <div class="fade-in-up">
            <h2 class="text-3xl lg:text-4xl font-light mb-6 leading-tight text-white">
              {{ t('about.mission.title') }}
            </h2>
            <div class="w-20 h-1 bg-gradient-to-r from-transparent via-[#FFCD4B] to-transparent mx-auto mb-8"></div>
            <p class="text-lg lg:text-xl font-light leading-relaxed text-white/90 mb-8">
              {{ t('about.mission.description') }}
            </p>
            <router-link
              to="/projects"
              class="inline-flex items-center gap-3 px-10 py-4 bg-[#FFCD4B]/10 border border-[#FFCD4B]/30 text-[#FFCD4B] text-sm uppercase tracking-wider font-light transition-all duration-300 hover:bg-[#FFCD4B]/20 hover:border-[#FFCD4B]/50 group transform hover:-translate-y-0.5"
            >
              <span>{{ t('header.projects') }}</span>
              <svg
                class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </router-link>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="bg-zinc-50 py-20">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 text-center">
          <div class="fade-in-up">
            <h2 class="text-3xl md:text-4xl font-light mb-4 text-zinc-800">
              {{ t('about.cta.title') }}
            </h2>
            <p class="text-lg text-zinc-600 mb-8 max-w-2xl mx-auto font-light">
              {{ t('about.cta.description') }}
            </p>
            <router-link
              to="/contact"
              class="inline-flex items-center gap-3 px-10 py-4 bg-black text-[#FFCD4B] text-sm uppercase tracking-wider font-light transition-all duration-300 hover:bg-zinc-900 group transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span>{{ t('contact.title') }}</span>
              <svg
                class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Slow spin animations for geometric shapes */
@keyframes spin-slow {
  from {
    transform: rotate(45deg);
  }
  to {
    transform: rotate(405deg);
  }
}

@keyframes spin-slower {
  from {
    transform: rotate(12deg);
  }
  to {
    transform: rotate(372deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}

.animate-spin-slower {
  animation: spin-slower 30s linear infinite;
}

/* Fade in animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes expand {
  from {
    width: 0;
  }
  to {
    width: 5rem;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, -20px);
  }
}

@keyframes floatDelayed {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-20px, 20px);
  }
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

.fade-in {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

.animate-expand {
  animation: expand 1s ease-out forwards;
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-float-delayed {
  animation: floatDelayed 10s ease-in-out infinite;
}

/* Custom gradient text */
.gradient-text {
  background: linear-gradient(135deg, #ffcd4b, #ebb738);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced shadow effects */
.shadow-luxury {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Custom backdrop blur */
.backdrop-blur-luxury {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Smooth transitions for all interactive elements */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #18181b;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #ffcd4b, #ebb738, #c89116);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #ebb738, #c89116, #a37814);
}

/* Selection color */
::selection {
  background: #ffcd4b;
  color: #000;
}

::-moz-selection {
  background: #ffcd4b;
  color: #000;
}
</style>
