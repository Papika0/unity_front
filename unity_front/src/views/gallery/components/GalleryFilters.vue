<script setup lang="ts">
import { useScrollAnimation } from '@/composables/useScrollAnimation'

interface Category {
  value: string
  label: string
}

defineProps<{
  categories: Category[]
  selectedCategory: string
  isLoading: boolean
}>()

const emit = defineEmits<{
  selectCategory: [category: string]
}>()

// Component manages its own scroll animation
const { element: filtersElement, isVisible: filtersVisible } = useScrollAnimation({ 
  once: false, 
  threshold: 0.05, 
  rootMargin: '200px' 
})
</script>

<template>
  <section ref="filtersElement" class="py-16 bg-zinc-50 border-b border-zinc-100">
    <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
      <div class="flex flex-wrap gap-3 justify-center">
        <button
          v-for="(category, index) in categories"
          :key="category.value"
          @click="emit('selectCategory', category.value)"
          class="px-6 py-2.5 text-sm uppercase tracking-wider font-light transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform hover:scale-105"
          :class="[
            selectedCategory === category.value
              ? 'bg-black text-[#FFCD4B] shadow-lg'
              : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300',
            {
              'opacity-100 translate-y-0 scale-100 blur-0': filtersVisible,
              'opacity-0 translate-y-8 scale-95 blur-sm': !filtersVisible,
            }
          ]"
          :style="{ transitionDelay: `${index * 100}ms` }"
          :disabled="isLoading"
        >
          <span
            v-if="isLoading && selectedCategory === category.value"
            class="flex items-center gap-2"
          >
            <div
              class="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-[#FFCD4B]"
            ></div>
            {{ category.label }}
          </span>
          <span v-else>{{ category.label }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
