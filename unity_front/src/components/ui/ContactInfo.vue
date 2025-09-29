<script setup lang="ts">
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
      class="text-lg font-semibold font-roboto leading-normal mb-6 text-zinc-900 uppercase tracking-wide"
    >
      {{ title }}
    </h3>
    <div class="space-y-5">
      <!-- Address -->
      <div v-if="addressLabel && addressValue" class="space-y-2">
        <h4 class="text-base font-medium font-roboto leading-relaxed text-zinc-700">
          {{ addressLabel }}
        </h4>
        <p class="text-base font-normal font-roboto leading-relaxed text-zinc-900 pl-1">
          {{ addressValue }}
        </p>
        <a
          v-if="locationHref && locationLabel"
          :href="locationHref"
          target="_blank"
          class="inline-block text-sm font-normal font-roboto leading-relaxed text-red-600 hover:text-red-700 transition-colors duration-200 pl-1"
        >
          {{ locationLabel }}
        </a>
      </div>

      <!-- Email -->
      <div class="space-y-1">
        <span class="block text-base font-medium font-roboto leading-relaxed text-zinc-700"
          >Email</span
        >
        <a
          :href="`mailto:${email}`"
          class="block text-base font-normal font-roboto leading-relaxed text-zinc-900 hover:text-red-600 transition-colors duration-200 pl-1"
        >
          {{ email }}
        </a>
      </div>

      <!-- Phone -->
      <div class="space-y-2">
        <span class="block text-base font-medium font-roboto leading-relaxed text-zinc-700">{{
          phoneLabel
        }}</span>
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pl-1">
          <template v-for="(phone, index) in phones" :key="phone.number">
            <div class="flex items-center gap-4">
              <a
                :href="phone.href"
                class="text-base font-normal font-roboto leading-relaxed text-zinc-900 hover:text-red-600 transition-colors duration-200"
              >
                {{ phone.display }}
              </a>
              <span
                v-if="index < phones.length - 1"
                class="hidden sm:block w-px h-4 bg-zinc-300"
              ></span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
