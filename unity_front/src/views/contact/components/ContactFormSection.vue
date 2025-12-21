<script setup lang="ts">
import { VueTelInput } from 'vue-tel-input'
import 'vue-tel-input/vue-tel-input.css'
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'

interface FormSubject {
  value: string
  label: string
}

interface FormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
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

defineProps<{
  form: FormData
  formSubjects: FormSubject[]
  selectedSubject: FormSubject | undefined
  isDropdownOpen: boolean
  isValidPhone: boolean
  isSubmitting: boolean
  isSubmitted: boolean
  validateForm: boolean
  vueTelInputProps: Record<string, unknown>
  t: (key: string) => string
}>()

const emit = defineEmits<{
  toggleDropdown: []
  closeDropdown: []
  selectSubject: [value: string]
  handlePhoneInput: [phone: string, phoneObject?: PhoneInputObject]
  submitForm: []
  'update:form': [value: FormData]
}>()

// Component manages its own scroll animation
const { element: formElement, isVisible: formVisible } = useScrollAnimation({ 
  once: false, 
  threshold: 0.05, 
  rootMargin: '200px' 
})
</script>

<template>
  <div ref="formElement" class="xl:col-span-3 transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="{
      'opacity-100 translate-y-0 scale-100 blur-0': formVisible,
      'opacity-0 translate-y-12 scale-95 blur-sm': !formVisible,
    }"
  >
    <!-- Form Header -->
    <div class="mb-12">
      <h2 class="text-3xl lg:text-4xl font-extralight text-zinc-900 mb-3">
        {{ t('contact.form.title') }}
      </h2>
      <p class="text-zinc-500 font-light">{{ t('contact.form.subtitle') }}</p>
    </div>

    <!-- Success Alert -->
    <transition name="fade-slide">
      <div
        v-if="isSubmitted"
        class="mb-8 p-6 bg-gradient-to-r from-[#FFCD4B]/10 to-[#EBB738]/10 border border-[#FFCD4B]/30"
      >
        <div class="flex items-start">
          <svg
            class="w-5 h-5 text-[#C89116] mt-0.5 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <p class="text-[#C89116] font-light">{{ t('contact.form.success.title') }}</p>
            <p class="text-[#A37814] text-sm mt-1 font-light">
              {{ t('contact.form.success.message') }}
            </p>
          </div>
        </div>
      </div>
    </transition>

    <!-- Form Fields -->
    <form @submit.prevent="emit('submitForm')" class="space-y-8">
      <!-- Name & Email Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            for="name"
            class="block text-sm font-light text-zinc-600 mb-2 uppercase tracking-wider"
          >
            {{ t('contact.form.fields.name.label') }}
          </label>
          <input
            id="name"
            :value="form.name"
            @input="emit('update:form', { ...form, name: ($event.target as HTMLInputElement).value })"
            type="text"
            required
            class="w-full px-0 py-3 border-0 border-b border-zinc-300 focus:border-[#FFCD4B] focus:outline-none transition-colors duration-300 bg-transparent text-zinc-900 placeholder-zinc-400"
            :placeholder="t('contact.form.fields.name.placeholder')"
          />
        </div>

        <div>
          <label
            for="email"
            class="block text-sm font-light text-zinc-600 mb-2 uppercase tracking-wider"
          >
            {{ t('contact.form.fields.email.label') }}
          </label>
          <input
            id="email"
            :value="form.email"
            @input="emit('update:form', { ...form, email: ($event.target as HTMLInputElement).value })"
            type="email"
            required
            class="w-full px-0 py-3 border-0 border-b border-zinc-300 focus:border-[#FFCD4B] focus:outline-none transition-colors duration-300 bg-transparent text-zinc-900 placeholder-zinc-400"
            :placeholder="t('contact.form.fields.email.placeholder')"
          />
        </div>
      </div>

      <!-- Phone & Subject Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            for="phone"
            class="block text-sm font-light text-zinc-600 mb-2 uppercase tracking-wider"
          >
            {{ t('contact.form.fields.phone.label') }}
          </label>
          <div class="relative">
            <VueTelInput
              v-bind="vueTelInputProps"
              :modelValue="form.phone"
              @update:modelValue="emit('update:form', { ...form, phone: String($event) })"
              @on-input="(_phone: string, phoneObject: PhoneInputObject) => emit('handlePhoneInput', _phone, phoneObject)"
              class="w-full vue-tel-input-contact"
            />
            <p
              v-if="form.phone && !isValidPhone"
              class="mt-1 text-sm text-red-500 font-light"
            >
              {{ t('errors.invalidPhone') || 'Please enter a valid phone number' }}
            </p>
          </div>
        </div>

        <div class="relative">
          <label
            for="subject"
            class="block text-sm font-light text-zinc-600 mb-2 uppercase tracking-wider"
          >
            {{ t('contact.form.fields.subject.label') }}
          </label>

          <!-- Custom Dropdown -->
          <div class="relative">
            <!-- Dropdown Button -->
            <button
              type="button"
              @click="emit('toggleDropdown')"
              @blur="emit('closeDropdown')"
              class="w-full px-0 py-3 border-0 border-b border-zinc-300 focus:border-[#FFCD4B] focus:outline-none transition-all duration-300 bg-transparent text-zinc-900 cursor-pointer text-left flex items-center justify-between group"
              :class="{ 'border-[#FFCD4B]': isDropdownOpen }"
            >
              <span class="block truncate">
                {{ selectedSubject?.label || t('contact.form.fields.subject.placeholder') }}
              </span>

              <!-- Custom Arrow Icon -->
              <svg
                class="w-4 h-4 text-zinc-400 group-hover:text-[#FFCD4B] transition-all duration-300 transform"
                :class="{ 'rotate-180 text-[#FFCD4B]': isDropdownOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <div
                v-if="isDropdownOpen"
                class="absolute z-50 w-full mt-2 bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden"
              >
                <div class="py-1 max-h-60 overflow-auto">
                  <button
                    v-for="subject in formSubjects"
                    :key="subject.value"
                    type="button"
                    @click="emit('selectSubject', subject.value)"
                    class="w-full px-4 py-3 text-left hover:bg-[#FFCD4B]/10 focus:bg-[#FFCD4B]/10 focus:outline-none transition-colors duration-200 group"
                    :class="{
                      'bg-[#FFCD4B]/10 text-[#C89116]': form.subject === subject.value,
                      'text-zinc-700': form.subject !== subject.value,
                    }"
                  >
                    <div class="flex items-center justify-between">
                      <span class="block truncate font-light">{{ subject.label }}</span>
                      <svg
                        v-if="form.subject === subject.value"
                        class="w-4 h-4 text-[#FFCD4B]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- Message -->
      <div>
        <label
          for="message"
          class="block text-sm font-light text-zinc-600 mb-2 uppercase tracking-wider"
        >
          {{ t('contact.form.fields.message.label') }}
        </label>
        <textarea
          id="message"
          :value="form.message"
          @input="emit('update:form', { ...form, message: ($event.target as HTMLTextAreaElement).value })"
          rows="5"
          required
          class="w-full px-0 py-3 border-0 border-b border-zinc-300 focus:border-[#FFCD4B] focus:outline-none transition-colors duration-300 bg-transparent text-zinc-900 placeholder-zinc-400 resize-none"
          :placeholder="t('contact.form.fields.message.placeholder')"
        ></textarea>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="!validateForm || isSubmitting"
        class="relative group px-12 py-4 bg-black hover:bg-zinc-900 disabled:bg-zinc-300 disabled:cursor-not-allowed text-[#FFCD4B] disabled:text-zinc-500 font-light tracking-wider uppercase text-sm transition-all duration-500 border border-[#FFCD4B]/30 disabled:border-zinc-300"
      >
        <span v-if="!isSubmitting" class="relative z-10">{{
          t('contact.form.submit')
        }}</span>
        <span v-else class="relative z-10 flex items-center">
          <svg
            class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
          {{ t('contact.form.submitting') }}
        </span>
      </button>
    </form>
  </div>
</template>

<style scoped>
/* Fade slide transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.fade-slide-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

/* Form input focus glow */
input:focus,
textarea:focus,
select:focus {
  box-shadow: 0 1px 0 0 #ffcd4b;
}

/* VueTelInput custom styling to match contact form design */
.vue-tel-input-contact :deep(.vue-tel-input) {
  border: none !important;
  border-bottom: 1px solid #d4d4d8 !important;
  border-radius: 0 !important;
  background: transparent !important;
  padding: 0 !important;
  font-size: 1rem !important;
  transition: all 0.3s ease !important;
  box-shadow: none !important;
}

.vue-tel-input-contact :deep(.vue-tel-input:focus-within) {
  outline: none !important;
  border-bottom-color: #ffcd4b !important;
  box-shadow: 0 1px 0 0 #ffcd4b !important;
}

.vue-tel-input-contact :deep(.vue-tel-input:hover) {
  border-bottom-color: #a1a1aa !important;
}

.vue-tel-input-contact :deep(.vti__dropdown) {
  background: transparent !important;
  border: none !important;
  border-right: 1px solid #d4d4d8 !important;
  border-radius: 0 !important;
  padding: 0.75rem 0.5rem !important;
  color: #18181b !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  font-weight: 300 !important;
}

.vue-tel-input-contact :deep(.vti__dropdown:hover) {
  background: transparent !important;
  border-right-color: #ffcd4b !important;
}

.vue-tel-input-contact :deep(.vti__dropdown .vti__dropdown-arrow) {
  color: #71717a !important;
  transition: all 0.3s ease !important;
}

.vue-tel-input-contact :deep(.vti__dropdown:hover .vti__dropdown-arrow) {
  color: #ffcd4b !important;
}

.vue-tel-input-contact :deep(.vti__dropdown[aria-expanded='true']) {
  border-right-color: #ffcd4b !important;
}

.vue-tel-input-contact :deep(.vti__dropdown[aria-expanded='true'] .vti__dropdown-arrow) {
  transform: rotate(180deg) !important;
  color: #ffcd4b !important;
}

.vue-tel-input-contact :deep(.vti__input) {
  padding: 0.75rem 0 0.75rem 0.5rem !important;
  border: none !important;
  outline: none !important;
  color: #18181b !important;
  background: transparent !important;
  border-radius: 0 !important;
  font-size: 1rem !important;
  font-weight: 300 !important;
}

.vue-tel-input-contact :deep(.vti__input::placeholder) {
  color: #a1a1aa !important;
  font-weight: 300 !important;
}

.vue-tel-input-contact :deep(.vti__dropdown-list) {
  border: 1px solid #d4d4d8 !important;
  border-radius: 0.5rem !important;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  background: white !important;
  z-index: 1000 !important;
  max-height: 200px !important;
  overflow-y: auto !important;
  margin-top: 0.25rem !important;
}

.vue-tel-input-contact :deep(.vti__search_box) {
  padding: 0.75rem !important;
  margin: 0 !important;
  border: none !important;
  border-bottom: 1px solid #e4e4e7 !important;
  background: #fafafa !important;
  font-size: 0.875rem !important;
  color: #18181b !important;
  border-radius: 0.5rem 0.5rem 0 0 !important;
  outline: none !important;
  transition: all 0.2s ease !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 20 !important;
  font-weight: 300 !important;
}

.vue-tel-input-contact :deep(.vti__search_box:focus) {
  background: white !important;
  border-bottom-color: #ffcd4b !important;
  box-shadow: 0 2px 4px rgba(255, 205, 75, 0.1) !important;
}

.vue-tel-input-contact :deep(.vti__search_box::placeholder) {
  color: #71717a !important;
  font-style: italic !important;
  font-weight: 300 !important;
}

.vue-tel-input-contact :deep(.vti__dropdown-item) {
  padding: 0.75rem !important;
  color: #374151 !important;
  font-size: 0.875rem !important;
  border-bottom: 1px solid #f4f4f5 !important;
  transition: all 0.15s ease !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  font-weight: 300 !important;
}

.vue-tel-input-contact :deep(.vti__dropdown-item:last-child) {
  border-bottom: none !important;
  border-radius: 0 0 0.5rem 0.5rem !important;
}

.vue-tel-input-contact :deep(.vti__dropdown-item:hover),
.vue-tel-input-contact :deep(.vti__dropdown-item.highlighted) {
  background-color: rgba(255, 205, 75, 0.1) !important;
  color: #c89116 !important;
  transform: translateX(2px) !important;
}

.vue-tel-input-contact :deep(.vti__dropdown-item:active) {
  background-color: rgba(255, 205, 75, 0.2) !important;
}

.vue-tel-input-contact :deep(.vti__selection) {
  color: #18181b !important;
  font-size: 1rem !important;
  font-weight: 300 !important;
}
</style>
