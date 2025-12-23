<template>
  <Modal :show="show" title="კონტაქტის ინფორმაციის რედაქტირება" @close="closeModal">
    <ContactInfoForm
      :loading="false"
      :initial-data="contactInfo"
      @submit="handleSubmit"
      @cancel="closeModal"
    />
  </Modal>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'
import Modal from '@/components/admin/ui/Modal.vue'
import ContactInfoForm from './ContactInfoForm.vue'
import type { ContactInfo } from '@/composables/pages/useContactInfo'
import type { ContactInfoFormData } from '@/stores/admin/contactInfo'

interface Props {
  show: boolean
  contactInfo: ContactInfo | null
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [formData: ContactInfoFormData]
}>()

const closeModal = () => {
  emit('close')
}

const handleSubmit = (formData: ContactInfoFormData) => {
  emit('submit', formData)
}
</script>
