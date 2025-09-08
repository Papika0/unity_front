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
    <h3 class="text-lg font-normal font-roboto leading-normal mb-6">
      {{ title }}
    </h3>
    <div class="space-y-6">
      <!-- Address -->
      <div v-if="addressLabel && addressValue">
        <h4 class="text-xl font-normal font-roboto leading-loose mb-2">
          {{ addressLabel }}
        </h4>
        <p class="text-base font-normal font-roboto leading-loose">
          {{ addressValue }}
        </p>
        <a
          v-if="locationHref && locationLabel"
          :href="locationHref"
          target="_blank"
          class="text-xs font-normal font-roboto leading-3 text-red-700 hover:text-red-800"
        >
          {{ locationLabel }}
        </a>
      </div>

      <!-- Email -->
      <div>
        <span class="text-xl font-normal font-roboto leading-loose">Email: </span>
        <a
          :href="`mailto:${email}`"
          class="text-xl font-normal font-roboto leading-loose text-zinc-900 hover:text-zinc-600"
        >
          {{ email }}
        </a>
      </div>

      <!-- Phone -->
      <div>
        <span class="text-xl font-normal font-roboto leading-loose">{{ phoneLabel }}: </span>
        <div class="flex items-center space-x-4">
          <template v-for="(phone, index) in phones" :key="phone.number">
            <a
              :href="phone.href"
              class="text-lg font-normal font-roboto leading-loose text-zinc-900 hover:text-zinc-600"
            >
              {{ phone.display }}
            </a>
            <span v-if="index < phones.length - 1" class="w-px h-5 bg-zinc-900"></span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
