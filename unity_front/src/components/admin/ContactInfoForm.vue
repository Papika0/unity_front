<template>
  <form @submit.prevent="handleSubmit" class="space-y-8">
    <!-- Email Section -->
    <div class="bg-slate-50 rounded-2xl p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">ელ. ფოსტა</h3>
      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
        <input
          v-model="formData.email"
          type="email"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white font-medium placeholder-gray-400"
          placeholder="info@example.com"
        />
      </div>
    </div>

    <!-- Phone Numbers Section -->
    <div class="bg-slate-50 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">ტელეფონები</h3>
        <button
          type="button"
          @click="addPhoneNumber"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          ტელეფონის დამატება
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="(phone, index) in formData.phone_numbers"
          :key="index"
          class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-gray-200"
        >
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">ნომერი</label>
            <input
              v-model="phone.number"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white font-medium placeholder-gray-400"
              placeholder="032300333"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">ჩვენება</label>
            <input
              v-model="phone.display"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white font-medium placeholder-gray-400"
              placeholder="032 2 300 333"
            />
          </div>
          <div class="flex items-end">
            <button
              type="button"
              @click="removePhoneNumber(index)"
              class="w-full px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors font-medium"
            >
              წაშლა
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Google Maps Section -->
    <div class="bg-slate-50 rounded-2xl p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Google Maps</h3>
      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">Google Maps URL</label>
        <input
          v-model="formData.google_maps_url"
          type="url"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white font-medium placeholder-gray-400"
          placeholder="https://maps.google.com/..."
        />
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
      >
        გაუქმება
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <span v-if="loading" class="inline-flex items-center">
          <svg
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          შენახვა...
        </span>
        <span v-else>შენახვა</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { ContactInfo } from '@/composables/useContactInfo'
import type { ContactInfoFormData } from '@/stores/admin/contactInfo'

interface Props {
  loading?: boolean
  initialData?: ContactInfo | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [formData: ContactInfoFormData]
  cancel: []
}>()

const formData = ref<ContactInfoFormData>({
  email: '',
  phone_numbers: [
    {
      number: '',
      display: '',
    },
  ],
  google_maps_url: '',
})

const loadInitialData = () => {
  if (props.initialData) {
    const data = props.initialData
    formData.value = {
      email: data.email || '',
      phone_numbers: data.phone_numbers?.map((phone) => ({
        number: phone.number || '',
        display: phone.display || '',
      })) || [
        {
          number: '',
          display: '',
        },
      ],
      google_maps_url: data.google_maps_url || '',
    }
  }
}

onMounted(() => {
  loadInitialData()
})

watch(
  () => props.initialData,
  () => {
    loadInitialData()
  },
)

const addPhoneNumber = () => {
  formData.value.phone_numbers.push({
    number: '',
    display: '',
  })
}

const removePhoneNumber = (index: number) => {
  if (formData.value.phone_numbers.length > 1) {
    formData.value.phone_numbers.splice(index, 1)
  }
}

const handleSubmit = () => {
  emit('submit', formData.value)
}
</script>
