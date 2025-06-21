<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useTranslations } from '../composables/useTranslations'

const { t } = useTranslations()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
  subject: 'general',
})

const isSubmitting = ref(false)
const isSubmitted = ref(false)

const contactInfo = [
  {
    icon: '📍',
    title: 'მისამართი',
    value: 'ვაშლიჯვარი ქუჩა 47, თბილისი, საქართველო',
  },
  {
    icon: '📞',
    title: 'ტელეფონი',
    value: '+995 577 300 333',
  },
  {
    icon: '✉️',
    title: 'ელ. ფოსტა',
    value: 'info@unitydev.ge',
  },
  {
    icon: '🕒',
    title: 'სამუშაო საათები',
    value: 'ორშ-პარ: 9:00-18:00',
  },
]

const subjects = [
  { value: 'general', label: 'ზოგადი ინფორმაცია' },
  { value: 'project', label: 'ახალი პროექტი' },
  { value: 'consultation', label: 'კონსულტაცია' },
  { value: 'partnership', label: 'პარტნიორობა' },
]

const submitForm = async () => {
  isSubmitting.value = true

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Reset form
  Object.keys(form).forEach((key) => {
    form[key as keyof typeof form] = key === 'subject' ? 'general' : ''
  })

  isSubmitting.value = false
  isSubmitted.value = true

  // Hide success message after 3 seconds
  setTimeout(() => {
    isSubmitted.value = false
  }, 3000)
}

const validateForm = () => {
  return form.name && form.email && form.message
}
</script>

<template>
  <div class="contact-page">
    <!-- Hero Section -->
    <section class="relative h-96 bg-gradient-to-r from-gray-900 to-gray-700">
      <div class="absolute inset-0 bg-black opacity-50"></div>
      <div class="relative z-10 h-full flex items-center">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            {{ t('contact.title') }}
          </h1>
          <p class="text-xl text-gray-300 max-w-3xl">
            მზად ვართ თქვენთან ვისაუბროთ თქვენს შემდეგ პროექტზე. დაგვიკავშირდით ნებისმიერი
            შეკითხვისთვის.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Content -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Contact Form -->
          <div class="bg-gray-50 p-8 rounded-xl">
            <h2 class="text-2xl font-bold mb-6">გაგზავნეთ შეტყობინება</h2>

            <!-- Success Message -->
            <div
              v-if="isSubmitted"
              class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
            >
              ✅ თქვენი შეტყობინება წარმატებით გაიგზავნა! ჩვენ მალე დაგიკავშირდებით.
            </div>

            <form @submit.prevent="submitForm" class="space-y-6">
              <!-- Name -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('contact.name') }} *
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="თქვენი სახელი"
                />
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('contact.email') }} *
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <!-- Phone -->
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                  ტელეფონი
                </label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="+995 XXX XXX XXX"
                />
              </div>

              <!-- Subject -->
              <div>
                <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
                  თემა
                </label>
                <select
                  id="subject"
                  v-model="form.subject"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option v-for="subject in subjects" :key="subject.value" :value="subject.value">
                    {{ subject.label }}
                  </option>
                </select>
              </div>

              <!-- Message -->
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('contact.message') }} *
                </label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="5"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  placeholder="დაწერეთ თქვენი შეტყობინება..."
                ></textarea>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="!validateForm() || isSubmitting"
                class="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                <span v-if="isSubmitting" class="flex items-center justify-center">
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
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
                  გაგზავნა...
                </span>
                <span v-else>{{ t('contact.send') }}</span>
              </button>
            </form>
          </div>

          <!-- Contact Information -->
          <div class="space-y-8">
            <div>
              <h2 class="text-2xl font-bold mb-6">საკონტაქტო ინფორმაცია</h2>
              <div class="space-y-6">
                <div
                  v-for="info in contactInfo"
                  :key="info.title"
                  class="flex items-start space-x-4"
                >
                  <div class="text-2xl">{{ info.icon }}</div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ info.title }}</h3>
                    <p class="text-gray-600">{{ info.value }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Map Placeholder -->
            <div>
              <h3 class="text-xl font-bold mb-4">რუკა</h3>
              <div
                class="h-64 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl flex items-center justify-center"
              >
                <div class="text-center">
                  <svg
                    class="w-16 h-16 text-gray-600 mx-auto mb-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <p class="text-gray-600">ინტერაქტიული რუკა</p>
                </div>
              </div>
            </div>

            <!-- Social Links -->
            <div>
              <h3 class="text-xl font-bold mb-4">სოციალური ქსელები</h3>
              <div class="flex space-x-4">
                <a
                  href="#"
                  class="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📘 Facebook
                </a>
                <a
                  href="#"
                  class="bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  📷 Instagram
                </a>
                <a
                  href="#"
                  class="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  💼 LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">ხშირად დასმული კითხვები</h2>
          <p class="text-gray-600">ყველაზე გავრცელებული კითხვების პასუხები</p>
        </div>

        <div class="max-w-3xl mx-auto space-y-6">
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="font-bold mb-2">რამდენ ხანში ხდება პროექტის განხორციელება?</h3>
            <p class="text-gray-600">
              პროექტის ხანგრძლივობა დამოკიდებულია მისი სირთულესა და ფართობზე. ჩვეულებრივ,
              საცხოვრებელი პროექტები 12-18 თვეში ხორციელდება.
            </p>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="font-bold mb-2">შეიძლება თუ არა კონსულტაცია ონლაინ?</h3>
            <p class="text-gray-600">
              დიახ, ჩვენ ვთავაზობთ ონლაინ კონსულტაციას ვიდეო ზარის მეშვეობით. ეს განსაკუთრებით
              მოსახერხებელია საწყისი ეტაპისთვის.
            </p>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="font-bold mb-2">რა ღირს არქიტექტურული პროექტი?</h3>
            <p class="text-gray-600">
              ფასი დამოკიდებულია პროექტის სირთულესა და ფართობზე. უფასო კონსულტაციის დროს ჩვენ
              შემოგთავაზებთ ზუსტ ფასს.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
