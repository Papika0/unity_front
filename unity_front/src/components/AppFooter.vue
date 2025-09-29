<script setup lang="ts">
import { ref } from 'vue'
import { useTranslations } from '../composables/useTranslations'
import { useNavigationLinks } from '../composables/useNavigationLinks'
import { useContactInfo } from '../composables/useContactInfo'
import { useToastStore } from '../stores/ui/toast'
import BaseButton from './ui/BaseButton.vue'
import LinkSection from './ui/LinkSection.vue'
import ContactInfo from './ui/ContactInfo.vue'
import PhoneModal from './ui/PhoneModal.vue'
import IconPhone from './icons/IconPhone.vue'

const { t } = useTranslations()
const { mainNavigation, projectLinks, socialLinks } = useNavigationLinks()
const { email, phoneNumbers, googleMapsUrl, address } = useContactInfo()
const toastStore = useToastStore()

const isPhoneModalOpen = ref(false)

const openPhoneModal = () => {
  isPhoneModalOpen.value = true
}

const closePhoneModal = () => {
  isPhoneModalOpen.value = false
}

const handlePhoneSubmit = (phoneNumber: string) => {
  // Here you can handle the phone number submission
  // For example, initiate a call or send to an API
  console.log('Phone number submitted:', phoneNumber)

  // Show success toast
  toastStore.success(
    t('messages.phone_success_title') || 'Call Request Successful',
    t('messages.phone_success_message') + ' ' + phoneNumber ||
      `We'll call you shortly at ${phoneNumber}`,
  )

  // You could redirect to a tel: link or handle it differently
  // window.location.href = `tel:${phoneNumber}`
}
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
              {{ t('footer.call') }}
            </h2>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <BaseButton to="/contact" variant="primary">
              {{ t('header.contact') }}
            </BaseButton>
            <BaseButton @click="openPhoneModal" variant="outline" class="flex items-center gap-2">
              <IconPhone class="w-4 h-4" />
              {{ t('footer.callUS') || 'Call Us' }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <!-- Business Section -->
        <LinkSection :title="t('footer.map')" :links="mainNavigation" />

        <!-- Projects Section -->
        <LinkSection :title="t('footer.projects')" :links="projectLinks" />

        <!-- Social Section -->
        <LinkSection :title="t('footer.social')" :links="socialLinks" variant="social" />

        <!-- Contact Section -->
        <ContactInfo
          :title="t('footer.contact')"
          :address-label="t('footer.address')"
          :address-value="address"
          :location-label="t('footer.location')"
          :location-href="googleMapsUrl"
          :email="email"
          :phone-label="t('footer.number')"
          :phones="phoneNumbers"
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

    <!-- Phone Modal -->
    <PhoneModal :is-open="isPhoneModalOpen" @close="closePhoneModal" @submit="handlePhoneSubmit" />
  </footer>
</template>

<style scoped>
/* Additional styles if needed */
</style>
