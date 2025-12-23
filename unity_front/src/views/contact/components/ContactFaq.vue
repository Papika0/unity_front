<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'

interface FaqItem {
  question: string
  answer: string
}

defineProps<{
  faqs: FaqItem[]
  openFaq: number | null
  t: (key: string) => string
}>()

const emit = defineEmits<{
  toggleFaq: [index: number]
}>()

// Component manages its own scroll animation
const { element: faqElement, isVisible: faqVisible } = useScrollAnimation({ 
  once: false, 
  threshold: 0.05, 
  rootMargin: '200px' 
})
</script>

<template>
  <section class="py-24 lg:py-32 bg-gradient-to-br from-white to-zinc-50">
    <div ref="faqElement" class="container mx-auto px-6 lg:px-12 xl:px-20">
      <div class="max-w-4xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="{
            'opacity-100 translate-y-0': faqVisible,
            'opacity-0 translate-y-8': !faqVisible,
          }"
        >
          <h2 class="text-3xl lg:text-4xl font-extralight text-zinc-900 mb-4">
            {{ t('contact.faq.title') }}
          </h2>
          <div class="w-20 h-0.5 bg-gradient-to-r from-[#FFCD4B] to-[#EBB738] mx-auto transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 origin-center"
            :class="{
              'scale-x-100': faqVisible,
              'scale-x-0': !faqVisible,
            }"
          ></div>
        </div>

        <!-- FAQ Items -->
        <div class="space-y-1">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="bg-white border-l-2 border-transparent hover:border-[#FFCD4B] transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="{
              'opacity-100 translate-y-0 scale-100 blur-0': faqVisible,
              'opacity-0 translate-y-8 scale-95 blur-sm': !faqVisible,
            }"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <button
              @click="emit('toggleFaq', index)"
              class="w-full py-6 px-8 flex items-center justify-between text-left hover:bg-[#FFCD4B]/5 transition-colors duration-300"
            >
              <span class="text-lg font-light text-zinc-900 pr-4">{{ faq.question }}</span>
              <svg
                class="w-5 h-5 text-[#FFCD4B] transition-transform duration-300 flex-shrink-0"
                :class="{ 'rotate-45': openFaq === index }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 6v12m6-6H6"
                />
              </svg>
            </button>
            <div
              class="grid transition-all duration-300 ease-in-out"
              :class="openFaq === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
            >
              <div class="overflow-hidden">
                <div class="px-8 pb-6">
                  <p class="text-zinc-600 font-light leading-relaxed">
                    {{ faq.answer }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
