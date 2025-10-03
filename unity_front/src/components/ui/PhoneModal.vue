<script setup lang="ts">
import { ref, reactive } from 'vue'
import { VueTelInput } from 'vue-tel-input'
import { useTranslations } from '../../composables/useTranslations'
import 'vue-tel-input/vue-tel-input.css'

interface Props {
  isOpen: boolean
}

interface PhoneInputObject {
  valid: boolean
  number: string
  formatInternational: string
  country?: {
    iso2: string
    name: string
  }
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
  submit: [data: FormData]
}>()

const { t } = useTranslations()

interface FormData {
  name: string
  email: string
  phone: string
  message: string
}

const form = reactive<FormData>({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const isValidPhone = ref(false)

const handleInput = (number: string, phoneObject?: PhoneInputObject) => {
  form.phone = number
  if (phoneObject) {
    isValidPhone.value = phoneObject.valid || false
  } else {
    isValidPhone.value = false
  }
}

const isValidForm = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return !!(
    form.name.trim() &&
    emailRegex.test(form.email) &&
    isValidPhone.value &&
    form.phone
  )
}

const handleSubmit = () => {
  if (isValidForm()) {
    emit('submit', { ...form })
    closeModal()
  }
}

const closeModal = () => {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.message = ''
  isValidPhone.value = false
  emit('close')
}

const handleBackdropClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const handleBackdropDirectClick = () => {
  closeModal()
}

// Vue Tel Input options
const vueTelInputProps = {
  mode: 'international',
  defaultCountry: 'GE',
  validCharactersOnly: true,
  autoFormat: true,
  preferredCountries: ['GE', 'IL', 'RU', 'AZ', 'TR'],
  dropdownOptions: {
    showDialCodeInSelection: true,
    showFlags: true,
    showSearchBox: true,
  },
  inputOptions: {
    placeholder: '555 123 456',
    maxlength: 25,
    showDialCode: false,
  },
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="handleBackdropDirectClick"></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-zinc-900">
              {{ t('contact.modal_title') || 'გთხოვთ შეავსოთ ფორმა' }}
            </h3>
            <button @click="closeModal" class="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Name Input -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">
                {{ t('contact.form.fields.name.label') || 'სახელი *' }}
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-zinc-900"
                :placeholder="t('contact.form.fields.name.placeholder') || 'თქვენი სახელი'"
              />
            </div>

            <!-- Email Input -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">
                {{ t('contact.form.fields.email.label') || 'ელ. ფოსტა *' }}
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-zinc-900"
                :placeholder="t('contact.form.fields.email.placeholder') || 'your@email.com'"
              />
            </div>

            <!-- Phone Number Input -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">
                {{ t('contact.form.fields.phone.label') || 'ტელეფონი *' }}
              </label>
              <VueTelInput
                v-bind="vueTelInputProps"
                v-model="form.phone"
                @on-input="handleInput"
                class="w-full vue-tel-input-wrapper"
              />
              <p v-if="form.phone && !isValidPhone" class="mt-1 text-sm text-red-600">
                {{ t('errors.invalidPhone') || 'გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი' }}
              </p>
            </div>

            <!-- Message Input (Optional) -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">
                {{ t('contact.form.fields.message.label') || 'შეტყობინება' }}
              </label>
              <textarea
                v-model="form.message"
                rows="3"
                class="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none text-zinc-900"
                :placeholder="t('contact.form.fields.message.placeholder') || 'თქვენი შეტყობინება...'"
              ></textarea>
            </div>

            <!-- Actions -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 border border-zinc-300 rounded-md hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
              >
                {{ t('buttons.cancel') || 'Cancel' }}
              </button>
              <button
                type="submit"
                :disabled="!isValidForm()"
                class="flex-1 px-4 py-2 text-sm font-medium text-white bg-zinc-900 border border-transparent rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ t('contact.button') || 'გაგზავნა' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.25s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}

/* Override vue-tel-input styles to match design */
:deep(.vue-tel-input) {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;
}

:deep(.vue-tel-input:focus-within) {
  outline: none;
  border-color: #18181b;
  box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.1);
}

:deep(.vue-tel-input:hover) {
  border-color: #9ca3af;
}

:deep(.vti__dropdown) {
  background: white;
  border-right: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem 0 0 0.375rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

:deep(.vti__dropdown:hover) {
  background: #f9fafb;
}

/* Hide the default arrow and use built-in one */
:deep(.vti__dropdown .vti__dropdown-arrow) {
  color: #6b7280;
  transition: transform 0.2s ease;
}

:deep(.vti__dropdown[aria-expanded='true'] .vti__dropdown-arrow) {
  transform: rotate(180deg);
}

:deep(.vti__input) {
  padding: 0.5rem 0.75rem;
  border: none;
  outline: none;
  color: #111827;
  background: white;
  border-radius: 0 0.375rem 0.375rem 0;
  font-size: 0.875rem;
}

:deep(.vti__input::placeholder) {
  color: #9ca3af;
}

:deep(.vti__dropdown-list) {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background: white;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

/* Search input styling */
:deep(.vti__search_box) {
  padding: 0.75rem !important;
  margin: 0 !important;
  border: none !important;
  border-bottom: 2px solid #e5e7eb !important;
  background: #f9fafb !important;
  font-size: 0.875rem !important;
  color: #111827 !important;
  border-radius: 0.375rem 0.375rem 0 0 !important;
  outline: none !important;
  transition: all 0.2s ease !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 20 !important;
}

:deep(.vti__search_box:focus) {
  background: white !important;
  border-bottom-color: #18181b !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

:deep(.vti__search_box::placeholder) {
  color: #6b7280 !important;
  font-style: italic !important;
}

/* Add search label */
:deep(.vti__dropdown-list::before) {
  content: 'Search countries...';
  position: sticky;
  top: 0;
  display: block;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  z-index: 21;
}

/* Add search icon */
:deep(.vti__search_box) {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'/%3e%3c/svg%3e") !important;
  background-repeat: no-repeat !important;
  background-position: right 0.75rem center !important;
  background-size: 1rem !important;
  padding-right: 2.5rem !important;
}

:deep(.vti__dropdown-item) {
  padding: 0.75rem !important;
  color: #374151 !important;
  font-size: 0.875rem !important;
  border-bottom: 1px solid #f3f4f6 !important;
  transition: all 0.15s ease !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

:deep(.vti__dropdown-item:last-child) {
  border-bottom: none !important;
  border-radius: 0 0 0.375rem 0.375rem !important;
}

:deep(.vti__dropdown-item:hover),
:deep(.vti__dropdown-item.highlighted) {
  background-color: #f3f4f6 !important;
  color: #111827 !important;
  transform: translateX(2px) !important;
}

:deep(.vti__dropdown-item:active) {
  background-color: #e5e7eb !important;
}

/* :deep(.vti__flag) {
  margin-right: 0.75rem !important;
  width: 1.5rem !important;
  height: 1rem !important;
  border-radius: 0.125rem !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
} */

:deep(.vti__selection) {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Country names in dropdown */
:deep(.vti__dropdown-item .vti__flag + span) {
  font-weight: 500 !important;
  color: #111827 !important;
}

:deep(.vti__dropdown-item:hover .vti__flag + span),
:deep(.vti__dropdown-item.highlighted .vti__flag + span) {
  color: #18181b !important;
}

.vue-tel-input-wrapper :deep(.vue-tel-input) {
  width: 100%;
}
</style>
