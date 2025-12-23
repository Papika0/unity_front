<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader v-if="!route.meta.hideHeader" :transparent="isTransparentHeader" @open-phone-modal="openPhoneModal" />
    <main :class="isTransparentHeader ? '' : 'flex-1'">
      <RouterView />
    </main>
    <AppFooter />

    <!-- Phone Modal -->
    <PhoneModal :is-open="isPhoneModalOpen" @close="closePhoneModal" @submit="handlePhoneSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import PhoneModal from '../components/ui/PhoneModal.vue'
import { useToastStore } from '../stores/ui/toast'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { customerApi, type CustomerData } from '../services/customerApi'

const route = useRoute()
const toastStore = useToastStore()
const { t } = useTranslations()

// Use transparent header only on home page and pages with hero images
const isTransparentHeader = computed(() => {
  const transparentRoutes = ['home'] // Add other routes that should have transparent header
  return transparentRoutes.includes(route.name as string)
})

const isPhoneModalOpen = ref(false)

const openPhoneModal = () => {
  isPhoneModalOpen.value = true
}

const closePhoneModal = () => {
  isPhoneModalOpen.value = false
}

interface FormData {
  name: string
  email: string
  phone: string
  message: string
}

const handlePhoneSubmit = async (formData: FormData) => {
  try {
    const customerData: CustomerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      source: 'call_request',
    }

    const response = await customerApi.submit(customerData)

    if (response.success) {
      toastStore.success(
        t('messages.phone_success_title') || 'მოთხოვნა გაგზავნილია',
        response.message || t('messages.phone_success_message') || 'ჩვენ მალე დაგიკავშირდებით',
      )
    } else {
      throw new Error(response.message || 'დაფიქსირდა შეცდომა')
    }
  } catch (err: unknown) {
    const error = err as { message?: string }
    toastStore.error(
      t('messages.error_title') || 'შეცდომა',
      error.message || t('messages.error_message') || 'გთხოვთ სცადოთ მოგვიანებით',
    )
  }
}
</script>
