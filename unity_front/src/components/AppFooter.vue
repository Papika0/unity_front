<script setup lang="ts">
import { useTranslations } from '../composables/useTranslations'
import { useNavigationLinks } from '../composables/useNavigationLinks'
import BaseButton from './ui/BaseButton.vue'
import LinkSection from './ui/LinkSection.vue'
import ContactInfo from './ui/ContactInfo.vue'

const { t } = useTranslations()
const { mainNavigation, projectLinks, socialLinks } = useNavigationLinks()
</script>

<template>
  <footer class="bg-white text-zinc-900 py-16 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Contact Call-to-Action Section -->
      <div class="mb-16">
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-900/20 pb-6 mb-8"
        >
          <div class="mb-4 md:mb-0">
            <h2 class="text-2xl font-normal font-roboto leading-loose mb-2">
              {{ t('footer.ctaTitle') }}
            </h2>
            <p class="text-base font-normal font-roboto leading-relaxed text-zinc-600">
              {{ t('footer.ctaSubtitle') }}
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <BaseButton to="/contact" variant="primary">
              {{ t('contact.title') }}
            </BaseButton>
            <BaseButton href="tel:995577300333" variant="outline">
              {{ t('footer.requestCall') }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <!-- Business Section -->
        <LinkSection :title="t('footer.business')" :links="mainNavigation" />

        <!-- Projects Section -->
        <LinkSection :title="t('projects.title')" :links="projectLinks" />

        <!-- Social Section -->
        <LinkSection :title="t('footer.more')" :links="socialLinks" variant="social" />

        <!-- Contact Section -->
        <ContactInfo
          :title="t('contact.title')"
          :address-label="t('footer.address')"
          :address-value="t('footer.addressValue')"
          :location-label="t('footer.location')"
          location-href="#"
          email="info@unitydev.ge"
          :phone-label="t('footer.phone')"
          :phones="[
            { number: '032300333', href: 'tel:032300333', display: '032 2 300 333' },
            { number: '995577300333', href: 'tel:995577300333', display: '995 577 300 333' },
          ]"
        />
      </div>

      <!-- Bottom Section -->
      <div class="border-t border-black h-5 mb-8"></div>
      <div
        class="flex flex-col md:flex-row justify-between items-center text-base font-normal font-roboto leading-loose"
      >
        <span>{{ t('footer.company') }}</span>
        <span>© {{ t('footer.rights') }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Additional styles if needed */
</style>
