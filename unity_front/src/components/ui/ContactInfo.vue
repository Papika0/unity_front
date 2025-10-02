<script setup lang="ts">
import IconLocation from '../icons/IconLocation.vue'
import IconEmail from '../icons/IconEmail.vue'
import IconPhone from '../icons/IconPhone.vue'

interface Props {
  title: string
  addressLabel?: string
  addressValue?: string
  locationLabel?: string
  locationHref?: string
  email: string
  phoneLabel: string
  phones: Array<{
    number: string
    href: string
    display: string
  }>
}

defineProps<Props>()
</script>

<template>
  <div>
    <h3
      class="text-base font-semibold font-roboto leading-normal mb-6 text-zinc-900 uppercase tracking-wide"
    >
      {{ title }}
    </h3>
    <div class="space-y-5">
      <!-- Address -->
      <div v-if="addressLabel && addressValue">
        <div class="flex items-start gap-3 group">
          <div
            class="flex-shrink-0 text-zinc-700 group-hover:text-[#C89116] transition-colors duration-300 mt-1"
          >
            <IconLocation />
          </div>
          <div class="flex-1">
            <h4 class="text-base font-medium font-roboto leading-relaxed text-zinc-700 mb-1">
              {{ addressLabel }}
            </h4>
            <p class="text-base font-normal font-roboto leading-relaxed text-zinc-900 mb-2">
              {{ addressValue }}
            </p>
            <a
              v-if="locationHref && locationLabel"
              :href="locationHref"
              target="_blank"
              class="inline-flex items-center gap-1 text-sm font-normal font-roboto leading-relaxed text-zinc-700 hover:text-[#C89116] transition-colors duration-300 group/link"
            >
              <span>{{ locationLabel }}</span>
              <svg
                class="w-3 h-3 transform group-hover/link:translate-x-0.5 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Email -->
      <div>
        <a
          :href="`mailto:${email}`"
          class="flex items-start gap-3 group hover:translate-x-1 transition-all duration-300"
        >
          <div
            class="flex-shrink-0 text-zinc-700 group-hover:text-[#C89116] transition-colors duration-300 mt-1"
          >
            <IconEmail />
          </div>
          <div class="flex-1">
            <span class="block text-base font-medium font-roboto leading-relaxed text-zinc-700 mb-1"
              >Email</span
            >
            <span
              class="block text-base font-normal font-roboto leading-relaxed text-zinc-900 group-hover:text-[#C89116] transition-colors duration-300"
            >
              {{ email }}
            </span>
          </div>
        </a>
      </div>

      <!-- Phone -->
      <div>
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 text-zinc-700 mt-1">
            <IconPhone />
          </div>
          <div class="flex-1">
            <span class="block text-base font-medium font-roboto leading-relaxed text-zinc-700 mb-2">
              {{ phoneLabel }}
            </span>
            <div class="space-y-1.5">
              <template v-for="phone in phones" :key="phone.number">
                <a
                  :href="phone.href"
                  class="block text-base font-normal font-roboto leading-relaxed text-zinc-900 hover:text-[#C89116] transition-all duration-300 hover:translate-x-1"
                >
                  {{ phone.display }}
                </a>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
