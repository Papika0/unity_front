<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'

interface ContactInfoItem {
  title: string
  icon: string
  value?: string
  subtitle?: string
  phones?: Array<{ number: string; href: string }>
}

interface SocialLink {
  name: string
  url: string
  icon: string
  color: string
}

interface OfficeDays {
  working: string[]
  weekend: string[]
}

defineProps<{
  contactInfo: ContactInfoItem[] | null
  socialLinks: SocialLink[]
  officeDays: OfficeDays | null
  t: (key: string) => string
}>()

// Component manages its own scroll animation
const { element: contactInfoElement, isVisible: contactInfoVisible } = useScrollAnimation({ 
  once: false, 
  threshold: 0.05, 
  rootMargin: '200px' 
})
</script>

<template>
  <div ref="contactInfoElement" class="xl:col-span-2 space-y-12 transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="{
      'opacity-100 translate-y-0 scale-100 blur-0': contactInfoVisible,
      'opacity-0 translate-y-12 scale-95 blur-sm': !contactInfoVisible,
    }"
    style="transition-delay: 100ms"
  >
    <!-- Quick Contact -->
    <div>
      <h3 class="text-2xl font-extralight text-zinc-900 mb-8">
        {{ t('contact.info.title') }}
      </h3>
      <div class="space-y-6" v-if="contactInfo">
        <div v-for="info in contactInfo" :key="info.title" class="group">
          <div class="flex items-start space-x-4">
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#FFCD4B]/20 to-[#EBB738]/20 flex items-center justify-center group-hover:from-[#FFCD4B] group-hover:to-[#EBB738] transition-all duration-300"
            >
              <div
                class="text-[#C89116] group-hover:text-white transition-colors duration-300"
                v-html="info.icon"
              ></div>
            </div>
            <div class="flex-1">
              <p class="text-xs font-light text-zinc-500 uppercase tracking-wider mb-1">
                {{ info.title }}
              </p>
              <!-- Special handling for phone numbers -->
              <div v-if="info.phones" class="space-y-1">
                <a
                  v-for="phone in info.phones"
                  :key="phone.number"
                  :href="phone.href"
                  class="block text-zinc-900 font-light hover:text-[#C89116] transition-colors duration-200"
                >
                  {{ phone.number }}
                </a>
              </div>
              <!-- Default handling for other contact info -->
              <p v-else class="text-zinc-900 font-light">{{ info.value }}</p>
              <p v-if="info.subtitle" class="text-sm text-zinc-500 mt-1">
                {{ info.subtitle }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Office Hours Visual -->
    <div class="p-8 bg-gradient-to-br from-zinc-50 to-[#FFCD4B]/10 border border-[#FFCD4B]/20">
      <h4 class="text-lg font-light text-zinc-900 mb-4">
        {{ t('contact.office.status') }}
      </h4>
      <div class="grid grid-cols-5 gap-2 text-center">
        <div
          v-for="day in officeDays?.working || []"
          :key="day"
          class="py-2 bg-gradient-to-r from-[#FFCD4B] to-[#EBB738] text-white text-xs transition-transform duration-200 hover:scale-105"
        >
          {{ day }}
        </div>
      </div>
      <div class="grid grid-cols-5 gap-2 text-center mt-2">
        <div
          v-for="day in officeDays?.weekend || []"
          :key="day"
          class="py-2 bg-zinc-200 text-zinc-500 text-xs rounded"
        >
          {{ day }}
        </div>
        <div class="col-span-3"></div>
      </div>
      <p class="text-sm text-zinc-600 mt-4 font-light">{{ t('contact.office.hours') }}</p>
    </div>

    <!-- Social Links -->
    <div>
      <h4 class="text-lg font-light text-zinc-900 mb-6">{{ t('contact.social.title') }}</h4>
      <div class="flex space-x-3">
        <a
          v-for="social in socialLinks"
          :key="social.name"
          :href="social.url"
          target="_blank"
          rel="noopener noreferrer"
          class="w-12 h-12 border border-zinc-300 hover:border-[#FFCD4B]/30 text-zinc-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
          :class="social.color"
          :aria-label="social.name"
        >
          <span v-html="social.icon"></span>
        </a>
      </div>
    </div>
  </div>
</template>
