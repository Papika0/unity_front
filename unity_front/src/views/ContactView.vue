<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { VueTelInput } from 'vue-tel-input'
import { useTranslations } from '../composables/useTranslations'
import { useContactPage } from '../composables/useContactPage'
import 'vue-tel-input/vue-tel-input.css'

const { t } = useTranslations()
const {
  contactInfo,
  socialLinks,
  mapCoordinates,
  formSubjects,
  faqs,
  officeDays,
  loadContactPage,
} = useContactPage()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
  subject: 'general',
})

const isSubmitting = ref(false)
const isSubmitted = ref(false)
const openFaq = ref<number | null>(null)
const mapLoaded = ref(false)
const isDropdownOpen = ref(false)
const isValidPhone = ref(false)

const selectedSubject = computed(() => {
  return formSubjects.value.find((subject) => subject.value === form.subject)
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectSubject = (value: string) => {
  form.subject = value
  isDropdownOpen.value = false
}

const closeDropdown = () => {
  setTimeout(() => {
    isDropdownOpen.value = false
  }, 150)
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

const handlePhoneInput = (number: string, phoneObject?: PhoneInputObject) => {
  form.phone = number
  if (phoneObject) {
    isValidPhone.value = phoneObject.valid || false
  } else {
    isValidPhone.value = false
  }
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

// contactInfo is now provided by useContactSettings composable

// formSubjects is now provided by useContactSettings composable

// faqs is now provided by useContactSettings composable

// socialLinks is now provided by useContactSettings composable

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index
}

const submitForm = async () => {
  if (!validateForm.value) return

  isSubmitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 2000))

  Object.keys(form).forEach((key) => {
    form[key as keyof typeof form] = key === 'subject' ? 'general' : ''
  })

  isSubmitting.value = false
  isSubmitted.value = true

  setTimeout(() => {
    isSubmitted.value = false
  }, 5000)
}

const scrollToForm = () => {
  const formSection = document.getElementById('contact-form')
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const validateForm = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return !!(form.name.trim() && emailRegex.test(form.email) && form.message.trim())
})

onMounted(async () => {
  // Load contact page data and translations
  await loadContactPage()

  // Initialize map after component mount
  setTimeout(() => {
    mapLoaded.value = true
  }, 500)
})
</script>

<template>
  <div class="contact-page">
    <!-- Hero Section - Warm gradient with orange tones -->
    <section
      class="relative h-[60vh] min-h-[500px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-orange-900"
    >
      <!-- Subtle pattern overlay -->
      <div class="absolute inset-0 bg-black/20"></div>
      <div
        class="absolute inset-0 opacity-[0.03]"
        style="
          background-image: url(&quot;data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E&quot;);
        "
      ></div>

      <div class="relative z-10 h-full flex items-center">
        <div class="container mx-auto px-6 lg:px-12 xl:px-20">
          <div class="max-w-5xl">
            <!-- Elegant accent line -->
            <div
              class="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mb-12 animate-expand"
            ></div>

            <h1
              class="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight text-white mb-8 tracking-tight"
            >
              {{ t('contact.title') }}
            </h1>

            <p class="text-lg md:text-xl text-orange-100/90 font-light leading-relaxed max-w-2xl">
              {{ t('contact.hero.subtitle') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Elegant scroll indicator -->
      <div class="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <div class="w-px h-12 bg-gradient-to-b from-orange-400 to-transparent animate-pulse"></div>
      </div>
    </section>

    <!-- Main Content Section -->
    <section id="contact-form" class="py-24 lg:py-32 bg-white">
      <div class="container mx-auto px-6 lg:px-12 xl:px-20">
        <div class="grid grid-cols-1 xl:grid-cols-5 gap-16 xl:gap-20">
          <!-- Contact Form - 3 columns -->
          <div class="xl:col-span-3">
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
                class="mb-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-lg"
              >
                <div class="flex items-start">
                  <svg
                    class="w-5 h-5 text-orange-600 mt-0.5 mr-3"
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
                    <p class="text-orange-800 font-medium">{{ t('contact.form.success.title') }}</p>
                    <p class="text-orange-600 text-sm mt-1">
                      {{ t('contact.form.success.message') }}
                    </p>
                  </div>
                </div>
              </div>
            </transition>

            <!-- Form Fields -->
            <form @submit.prevent="submitForm" class="space-y-8">
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
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-0 py-3 border-0 border-b border-zinc-300 focus:border-orange-500 focus:outline-none transition-colors duration-300 bg-transparent text-zinc-900 placeholder-zinc-400"
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
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full px-0 py-3 border-0 border-b border-zinc-300 focus:border-orange-500 focus:outline-none transition-colors duration-300 bg-transparent text-zinc-900 placeholder-zinc-400"
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
                      v-model="form.phone"
                      @on-input="handlePhoneInput"
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
                      @click="toggleDropdown"
                      @blur="closeDropdown"
                      class="w-full px-0 py-3 border-0 border-b border-zinc-300 focus:border-orange-500 focus:outline-none transition-all duration-300 bg-transparent text-zinc-900 cursor-pointer text-left flex items-center justify-between group"
                      :class="{ 'border-orange-500': isDropdownOpen }"
                    >
                      <span class="block truncate">
                        {{ selectedSubject?.label || t('contact.form.fields.subject.placeholder') }}
                      </span>

                      <!-- Custom Arrow Icon -->
                      <svg
                        class="w-4 h-4 text-zinc-400 group-hover:text-orange-500 transition-all duration-300 transform"
                        :class="{ 'rotate-180 text-orange-500': isDropdownOpen }"
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
                            @click="selectSubject(subject.value)"
                            class="w-full px-4 py-3 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none transition-colors duration-200 group"
                            :class="{
                              'bg-orange-50 text-orange-600': form.subject === subject.value,
                              'text-zinc-700': form.subject !== subject.value,
                            }"
                          >
                            <div class="flex items-center justify-between">
                              <span class="block truncate font-light">{{ subject.label }}</span>
                              <svg
                                v-if="form.subject === subject.value"
                                class="w-4 h-4 text-orange-500"
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
                  v-model="form.message"
                  rows="5"
                  required
                  class="w-full px-0 py-3 border-0 border-b border-zinc-300 focus:border-orange-500 focus:outline-none transition-colors duration-300 bg-transparent text-zinc-900 placeholder-zinc-400 resize-none"
                  :placeholder="t('contact.form.fields.message.placeholder')"
                ></textarea>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="!validateForm || isSubmitting"
                class="relative group px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-zinc-300 disabled:to-zinc-400 text-white font-light tracking-wider uppercase text-sm transition-all duration-500 overflow-hidden transform hover:scale-[1.02] hover:shadow-lg"
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

          <!-- Contact Information - 2 columns -->
          <div class="xl:col-span-2 space-y-12">
            <!-- Quick Contact -->
            <div>
              <h3 class="text-2xl font-extralight text-zinc-900 mb-8">
                {{ t('contact.info.title') }}
              </h3>
              <div class="space-y-6" v-if="contactInfo">
                <div v-for="info in contactInfo" :key="info.title" class="group">
                  <div class="flex items-start space-x-4">
                    <div
                      class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300"
                    >
                      <div
                        class="text-orange-600 group-hover:text-white transition-colors duration-300"
                        v-html="info.icon"
                      ></div>
                    </div>
                    <div class="flex-1">
                      <p class="text-xs font-light text-zinc-500 uppercase tracking-wider mb-1">
                        {{ info.title }}
                      </p>
                      <!-- Special handling for phone numbers -->
                      <div v-if="info.phones" class="space-y-1">
                        <a
                          v-for="phone in info.phones"
                          :key="phone.number"
                          :href="phone.href"
                          class="block text-zinc-900 font-light hover:text-orange-600 transition-colors duration-200"
                        >
                          {{ phone.number }}
                        </a>
                      </div>
                      <!-- Default handling for other contact info -->
                      <p v-else class="text-zinc-900 font-light">{{ info.value }}</p>
                      <p v-if="info.subtitle" class="text-sm text-zinc-500 mt-1">
                        {{ info.subtitle }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Office Hours Visual -->
            <div class="p-8 bg-gradient-to-br from-zinc-50 to-orange-50 rounded-xl">
              <h4 class="text-lg font-light text-zinc-900 mb-4">
                {{ t('contact.office.status') }}
              </h4>
              <div class="grid grid-cols-5 gap-2 text-center">
                <div
                  v-for="day in officeDays?.working || []"
                  :key="day"
                  class="py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded transition-transform duration-200 hover:scale-105"
                >
                  {{ day }}
                </div>
              </div>
              <div class="grid grid-cols-5 gap-2 text-center mt-2">
                <div
                  v-for="day in officeDays?.weekend || []"
                  :key="day"
                  class="py-2 bg-zinc-200 text-zinc-500 text-xs rounded"
                >
                  {{ day }}
                </div>
                <div class="col-span-3"></div>
              </div>
              <p class="text-sm text-zinc-600 mt-4 font-light">{{ t('contact.office.hours') }}</p>
            </div>

            <!-- Social Links -->
            <div>
              <h4 class="text-lg font-light text-zinc-900 mb-6">{{ t('contact.social.title') }}</h4>
              <div class="flex space-x-3">
                <a
                  v-for="social in socialLinks"
                  :key="social.name"
                  :href="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-12 h-12 border border-zinc-300 hover:border-transparent text-zinc-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  :class="social.color"
                  :aria-label="social.name"
                >
                  <span v-html="social.icon"></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Section - Interactive -->
    <section class="relative h-[500px] bg-zinc-100 overflow-hidden">
      <!-- Map Container -->
      <div class="absolute inset-0">
        <!-- Google Maps iframe with location pin -->
        <iframe
          v-if="mapLoaded && mapCoordinates"
          :src="`https://maps.google.com/maps?q=${mapCoordinates.latitude},${mapCoordinates.longitude}&t=&z=${mapCoordinates.zoom || 16}&ie=UTF8&iwloc=&output=embed`"
          width="100%"
          height="100%"
          frameborder="0"
          style="border: 0"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          class="grayscale contrast-75 brightness-95"
        ></iframe>

        <!-- Loading state -->
        <div
          v-else
          class="h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200"
        >
          <div class="text-center">
            <svg
              class="w-12 h-12 text-zinc-400 mx-auto mb-4 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p class="text-zinc-500 font-light">{{ t('contact.map.loading') }}</p>
          </div>
        </div>
      </div>

      <!-- Overlay with address -->
      <div
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8"
      >
        <div class="container mx-auto px-6 lg:px-12 xl:px-20">
          <div class="text-white">
            <h3 class="text-2xl font-light mb-2">{{ t('contact.map.office.title') }}</h3>
            <p v-if="contactInfo && contactInfo[0]" class="text-orange-200 font-light">
              {{ contactInfo[0].value }}, {{ contactInfo[0].subtitle }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-24 lg:py-32 bg-gradient-to-br from-white to-orange-50/30">
      <div class="container mx-auto px-6 lg:px-12 xl:px-20">
        <div class="max-w-4xl mx-auto">
          <!-- Section Header -->
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-extralight text-zinc-900 mb-4">
              {{ t('contact.faq.title') }}
            </h2>
            <div class="w-20 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto"></div>
          </div>

          <!-- FAQ Items -->
          <div class="space-y-1">
            <div
              v-for="(faq, index) in faqs"
              :key="index"
              class="bg-white border-l-2 border-transparent hover:border-orange-500 transition-all duration-300"
            >
              <button
                @click="toggleFaq(index)"
                class="w-full py-6 px-8 flex items-center justify-between text-left hover:bg-orange-50/50 transition-colors duration-300"
              >
                <span class="text-lg font-light text-zinc-900 pr-4">{{ faq.question }}</span>
                <svg
                  class="w-5 h-5 text-orange-500 transition-transform duration-300 flex-shrink-0"
                  :class="{ 'rotate-45': openFaq === index }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              </button>
              <transition name="accordion">
                <div v-if="openFaq === index" class="px-8 pb-6">
                  <p class="text-zinc-600 font-light leading-relaxed">
                    {{ faq.answer }}
                  </p>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section - Smaller and refined -->
    <section class="relative py-20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-orange-900">
      <!-- Subtle pattern overlay -->
      <div
        class="absolute inset-0 opacity-[0.02]"
        style="
          background-image: url(&quot;data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='dots' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='20' cy='20' r='0.5' fill='white'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23dots)' /%3E%3C/svg%3E&quot;);
        "
      ></div>

      <div class="relative container mx-auto px-6 lg:px-12 xl:px-20 text-center">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-3xl lg:text-4xl font-extralight text-white mb-6 leading-tight">
            {{ t('contact.cta.title.part1') }}
            <span class="text-orange-400">{{ t('contact.cta.title.part2') }}</span>
          </h2>
          <p class="text-lg text-orange-100/80 font-light leading-relaxed mb-8">
            {{ t('contact.cta.subtitle') }}
          </p>

          <!-- Simple CTA button -->
          <button
            @click="scrollToForm"
            class="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-light tracking-wider uppercase text-sm transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            {{ t('contact.cta.button') }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Typography refinements */
::selection {
  background-color: rgb(251 146 60 / 0.2);
  color: inherit;
}

/* Smooth animations */
.animate-expand {
  animation: expand 1s ease-out;
}

@keyframes expand {
  from {
    width: 0;
  }
  to {
    width: 6rem;
  }
}

/* Accordion transitions */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

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

/* Custom select arrow */
select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0 center;
  background-size: 1.5em 1.5em;
  padding-right: 2em;
}

/* Google Maps styling */
iframe {
  filter: grayscale(100%) contrast(0.9) brightness(0.95);
  transition: filter 0.3s ease;
}

iframe:hover {
  filter: grayscale(50%) contrast(1) brightness(1);
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Remove input autofill background */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
textarea:-webkit-autofill,
textarea:-webkit-autofill:hover,
textarea:-webkit-autofill:focus,
select:-webkit-autofill,
select:-webkit-autofill:hover,
select:-webkit-autofill:focus {
  -webkit-text-fill-color: rgb(24 24 27);
  -webkit-box-shadow: 0 0 0px 1000px white inset;
  transition: background-color 5000s ease-in-out 0s;
}

/* Form input focus glow */
input:focus,
textarea:focus,
select:focus {
  box-shadow: 0 1px 0 0 rgb(251 146 60);
}

/* Social icon hover effects */
.hover\:bg-gradient-to-br:hover {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
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
  border-bottom-color: #f97316 !important;
  box-shadow: 0 1px 0 0 #f97316 !important;
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
  border-right-color: #f97316 !important;
}

.vue-tel-input-contact :deep(.vti__dropdown .vti__dropdown-arrow) {
  color: #71717a !important;
  transition: all 0.3s ease !important;
}

.vue-tel-input-contact :deep(.vti__dropdown:hover .vti__dropdown-arrow) {
  color: #f97316 !important;
}

.vue-tel-input-contact :deep(.vti__dropdown[aria-expanded='true']) {
  border-right-color: #f97316 !important;
}

.vue-tel-input-contact :deep(.vti__dropdown[aria-expanded='true'] .vti__dropdown-arrow) {
  transform: rotate(180deg) !important;
  color: #f97316 !important;
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
  border-bottom-color: #f97316 !important;
  box-shadow: 0 2px 4px rgba(249, 115, 22, 0.1) !important;
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
  background-color: #fef3f2 !important;
  color: #f97316 !important;
  transform: translateX(2px) !important;
}

.vue-tel-input-contact :deep(.vti__dropdown-item:active) {
  background-color: #fed7cc !important;
}

.vue-tel-input-contact :deep(.vti__selection) {
  color: #18181b !important;
  font-size: 1rem !important;
  font-weight: 300 !important;
}
</style>
