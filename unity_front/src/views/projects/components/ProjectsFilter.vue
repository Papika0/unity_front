<script setup lang="ts">
interface Category {
  value: string
  label: string
}

defineProps<{
  categories: Category[]
  selectedCategory: string
  isVisible: boolean
}>()

const emit = defineEmits<{
  'update:selectedCategory': [value: string]
}>()
</script>

<template>
  <section class="py-16 bg-zinc-50 border-b border-zinc-100">
    <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
      <div class="flex flex-wrap gap-3 justify-center">
        <button
          v-for="(category, index) in categories"
          :key="category.value"
          @click="emit('update:selectedCategory', category.value)"
          class="px-6 py-2.5 text-sm uppercase tracking-wider font-light transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform hover:scale-105"
          :class="[
            selectedCategory === category.value
              ? 'bg-black text-[#FFCD4B] shadow-lg'
              : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300',
            isVisible
              ? 'opacity-100 translate-y-0 scale-100 blur-0'
              : 'opacity-0 translate-y-8 scale-95 blur-sm',
          ]"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          {{ category.label }}
        </button>
      </div>
    </div>
  </section>
</template>
