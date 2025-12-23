<script setup lang="ts">
interface Props {
  currentSlide: number
  totalSlides: number
  hasInitiallyLoaded: boolean
  scrollProgress: number
  isAnimating: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  next: []
  prev: []
}>()
</script>

<template>
  <!-- Navigation with Golden Accent -->
  <div
    class="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 lg:left-12 xl:left-16 2xl:left-24 flex items-center space-x-4 sm:space-x-6 md:space-x-8 z-30 transition-all duration-1000 ease-out delay-1000"
    :class="hasInitiallyLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    :style="`opacity: ${hasInitiallyLoaded ? 1 - (scrollProgress * 1.5) : 0}`"
  >
    <!-- Slide Counter with smooth transition -->
    <div class="text-white/60 font-thin tracking-[0.2em] relative">
      <transition name="slide-counter" mode="out-in">
        <span :key="currentSlide" class="inline-block">
          <span class="text-xl sm:text-2xl text-[#FFCD4B] drop-shadow-[0_2px_10px_rgba(255,205,75,0.4)]">
            {{ String(currentSlide + 1).padStart(2, '0') }}
          </span>
          <span class="text-xs sm:text-sm mx-1 sm:mx-2">/</span>
          <span class="text-xs sm:text-sm">{{ String(totalSlides).padStart(2, '0') }}</span>
        </span>
      </transition>
    </div>

    <!-- Progress Line with Golden Gradient and animation -->
    <div class="relative w-16 sm:w-24 md:w-32 h-[1px] bg-white/20 overflow-hidden rounded-full">
      <div
        class="absolute left-0 top-0 h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-[1800ms] ease-[cubic-bezier(0.65,0,0.35,1)] shadow-[0_0_15px_rgba(255,205,75,0.6)]"
        :style="`width: ${((currentSlide + 1) / totalSlides) * 100}%`"
      ></div>
    </div>
  </div>

  <!-- Minimal Navigation Arrows with enhanced effects -->
  <div
    class="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 pointer-events-none z-30 transition-opacity duration-1000 delay-1200"
    :class="hasInitiallyLoaded ? 'opacity-100' : 'opacity-0'"
    :style="`opacity: ${hasInitiallyLoaded ? 1 - (scrollProgress * 1.5) : 0}`"
  >
    <button
      @click="emit('prev')"
      class="group pointer-events-auto p-2 sm:p-3 md:p-4 transition-all duration-500 hover:scale-110 active:scale-95 relative"
      :disabled="isAnimating"
      aria-label="Previous slide"
    >
      <!-- Glow effect on hover -->
      <div class="absolute inset-0 rounded-full bg-[#FFCD4B]/0 group-hover:bg-[#FFCD4B]/10 transition-all duration-500 blur-xl scale-150"></div>
      <svg
        class="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/40 group-hover:text-[#FFCD4B] transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(255,205,75,0.6)]"
        fill="none"
        stroke="currentColor"
        stroke-width="0.5"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <button
      @click="emit('next')"
      class="group pointer-events-auto p-2 sm:p-3 md:p-4 transition-all duration-500 hover:scale-110 active:scale-95 relative"
      :disabled="isAnimating"
      aria-label="Next slide"
    >
      <!-- Glow effect on hover -->
      <div class="absolute inset-0 rounded-full bg-[#FFCD4B]/0 group-hover:bg-[#FFCD4B]/10 transition-all duration-500 blur-xl scale-150"></div>
      <svg
        class="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/40 group-hover:text-[#FFCD4B] transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(255,205,75,0.6)]"
        fill="none"
        stroke="currentColor"
        stroke-width="0.5"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>

  <!-- Scroll Down Indicator -->
  <div
    class="hidden sm:flex absolute bottom-16 sm:bottom-20 md:bottom-24 right-4 sm:right-6 md:right-8 lg:right-12 xl:right-16 2xl:right-24 flex-col items-center space-y-3 z-30 transition-all duration-1000 delay-1400"
    :class="hasInitiallyLoaded ? 'opacity-100' : 'opacity-0'"
    :style="`opacity: ${hasInitiallyLoaded ? 1 - (scrollProgress * 2) : 0}`"
  >
    <span class="text-white/40 text-xs tracking-[0.3em] uppercase font-light rotate-90 origin-center mb-8">
      Scroll
    </span>
    <div class="relative w-[1px] h-12 sm:h-14 md:h-16 bg-white/20 overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-6 sm:h-7 md:h-8 bg-gradient-to-b from-[#FFCD4B] to-transparent animate-scroll-indicator"></div>
    </div>
  </div>
</template>

<style scoped>
/* Scroll indicator animation */
@keyframes scroll-indicator {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(200%);
    opacity: 0;
  }
}

.animate-scroll-indicator {
  animation: scroll-indicator 2s ease-in-out infinite;
}

/* Luxury button hover effect */
button {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

button:hover {
  transform: translateZ(10px);
}

/* Disable text selection for UI elements */
button,
.text-white\/60 {
  user-select: none;
}

/* Smooth counter transition */
.slide-counter-enter-active,
.slide-counter-leave-active {
  transition: all 0.4s cubic-bezier(0.65, 0, 0.35, 1);
}

.slide-counter-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-counter-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Prevent layout shift during counter animation */
.slide-counter-enter-active,
.slide-counter-leave-active {
  display: inline-block;
  min-width: 2ch;
}
</style>
