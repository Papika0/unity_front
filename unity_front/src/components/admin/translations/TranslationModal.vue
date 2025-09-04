<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/60 backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
    @click="$emit('close')"
  >
    <div
      @click.stop
      class="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-white/20 ring-1 ring-slate-200/50"
    >
      <!-- Modal Header -->
      <div
        class="sticky top-0 z-20 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-t-3xl border-b border-slate-200/60 px-8 py-6 backdrop-blur-xl"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                ></path>
              </svg>
            </div>
            <div>
              <h3
                class="text-3xl font-light bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              >
                {{ isEdit ? 'თარგმანის რედაქტირება' : 'ახალი თარგმანის შექმნა' }}
              </h3>
              <p class="text-slate-500 text-sm mt-1">
                {{
                  isEdit ? 'განაახლეთ არსებული თარგმანი' : 'დაამატეთ ახალი მრავალენოვანი თარგმანი'
                }}
              </p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="text-slate-400 hover:text-slate-600 transition-all duration-200 p-3 hover:bg-white/60 rounded-2xl group"
          >
            <svg
              class="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="relative z-10 px-8 py-8">
        <form @submit.prevent="$emit('submit')" class="space-y-8">
          <!-- Group Selection (First Step) -->
          <div class="space-y-2">
            <label
              for="group"
              class="flex items-center space-x-2 text-sm font-semibold text-slate-800"
            >
              <div
                class="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
              </div>
              <span>ჯგუფი</span>
              <span
                v-if="!isEdit"
                class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                >პირველი ნაბიჯი</span
              >
            </label>
            <CustomDropdown
              v-model="formGroup"
              :options="groupOptions"
              placeholder="აირჩიეთ ჯგუფი..."
            />
          </div>

          <!-- Key Field (Second Step - appears after group selection) -->
          <div v-if="formGroup || isEdit" class="space-y-2">
            <label
              for="key"
              class="flex items-center space-x-2 text-sm font-semibold text-slate-800"
            >
              <div
                class="w-8 h-8 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 7a2 2 0 012 2m0 0a2 2 0 01-2 2m2-2h3m-3 0h-3m-2-5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2H9z"
                  ></path>
                </svg>
              </div>
              <span>იდენტიფიკატორი (Key)</span>
              <span
                v-if="!isEdit"
                class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                >მეორე ნაბიჯი</span
              >
            </label>
            <div class="relative">
              <div class="flex">
                <span
                  class="inline-flex items-center px-4 py-4 text-sm text-slate-600 bg-slate-100 border-2 border-r-0 border-slate-200 rounded-l-2xl"
                >
                  {{ formGroup }}.
                </span>
                <input
                  v-model="keyWithoutPrefix"
                  type="text"
                  id="key"
                  required
                  :disabled="isEdit"
                  class="block w-full px-4 py-4 text-base text-slate-900 border-2 border-slate-200 rounded-r-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 transition-all duration-300 placeholder:text-slate-500 bg-white"
                  :placeholder="getKeyPlaceholder()"
                />
              </div>
            </div>
          </div>

          <!-- Language Fields (Third Step - appears after key is entered) -->
          <div
            v-if="formGroup || isEdit"
            class="bg-gradient-to-br from-slate-50/50 to-white rounded-3xl p-8 border border-slate-200/60 space-y-8"
          >
            <div class="text-center mb-8">
              <h4
                class="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2"
              >
                მრავალენოვანი თარგმანი
                <span
                  v-if="!isEdit"
                  class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                  >მესამე ნაბიჯი</span
                >
              </h4>
              <p class="text-slate-600 text-sm">შეავსეთ თარგმანი სამივე ენაზე</p>

              <!-- Translate Both Button -->
              <div v-if="formTextKa && (!formTextEn || !formTextRu)" class="mt-4">
                <button
                  @click="translateBoth"
                  type="button"
                  :disabled="translating"
                  class="inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                >
                  <svg
                    v-if="translating"
                    class="animate-spin w-4 h-4"
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
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    ></path>
                  </svg>
                  {{ translating ? '🔄 თარგმნა...' : '🌐 ორივე ენაზე თარგმნა' }}
                </button>
              </div>
            </div>

            <!-- Georgian -->
            <LanguageField
              v-model="formTextKa"
              language="ka"
              label="🇬🇪 ქართული"
              placeholder="ქართული თარგმანი"
              :required="true"
            />

            <!-- English -->
            <LanguageField
              v-model="formTextEn"
              language="en"
              label="🇬🇧 English"
              placeholder="English translation"
              :required="true"
              :can-translate="!!formTextKa"
              :translating="translating"
              @translate="$emit('translate', 'ka', 'en')"
            />

            <!-- Russian -->
            <LanguageField
              v-model="formTextRu"
              language="ru"
              label="🇷🇺 русский"
              placeholder="русский перевод"
              :required="false"
              :can-translate="!!formTextKa"
              :translating="translating"
              @translate="$emit('translate', 'ka', 'ru')"
            />
          </div>

          <!-- Active Status -->
          <div
            class="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200/60"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-slate-900">სტატუსი</h4>
                  <p class="text-xs text-slate-600">თარგმანის გამოყენება</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input id="active" v-model="formActive" type="checkbox" class="sr-only peer" />
                <div
                  class="w-12 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500 shadow-inner"
                ></div>
                <span class="ml-3 text-sm font-medium text-slate-800">
                  {{ formActive ? 'აქტიური' : 'არააქტიური' }}
                </span>
              </label>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div
            class="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t-2 border-gradient-to-r from-indigo-100 via-purple-100 to-pink-100"
          >
            <button
              type="button"
              @click="$emit('close')"
              class="order-2 sm:order-1 px-8 py-4 text-base font-semibold text-slate-800 bg-white/80 backdrop-blur-sm border-2 border-slate-300 rounded-2xl hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-500/20 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              🚫 გაუქმება
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="order-1 sm:order-2 inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 min-w-[140px]"
            >
              <svg v-if="saving" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
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
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              {{ saving ? '🔄 შენახვა...' : '✅ შენახვა' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LanguageField from '../forms/LanguageField.vue'
import { CustomDropdown } from '../ui'

interface TranslationForm {
  key: string
  text_en: string
  text_ka: string
  text_ru: string
  group: string
  active: boolean
}

interface Props {
  isOpen: boolean
  isEdit: boolean
  form: TranslationForm
  saving: boolean
  translating: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit'): void
  (e: 'translate', fromLang: string, toLang: string): void
  (e: 'translateBoth'): void
  (e: 'update:form', form: TranslationForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed properties to handle form updates
const formGroup = computed({
  get: () => props.form.group,
  set: (value: string) => {
    emit('update:form', { ...props.form, group: value })
  },
})

// Computed property for key without prefix
const keyWithoutPrefix = computed({
  get: () => {
    if (!props.form.key || !props.form.group) return props.form.key || ''
    const prefix = `${props.form.group}.`
    return props.form.key.startsWith(prefix)
      ? props.form.key.substring(prefix.length)
      : props.form.key
  },
  set: (value: string) => {
    const newKey = props.form.group && value ? `${props.form.group}.${value}` : value
    emit('update:form', { ...props.form, key: newKey })
  },
})

const formTextKa = computed({
  get: () => props.form.text_ka,
  set: (value: string) => emit('update:form', { ...props.form, text_ka: value }),
})

const formTextEn = computed({
  get: () => props.form.text_en,
  set: (value: string) => emit('update:form', { ...props.form, text_en: value }),
})

const formTextRu = computed({
  get: () => props.form.text_ru,
  set: (value: string) => emit('update:form', { ...props.form, text_ru: value }),
})

const formActive = computed({
  get: () => props.form.active,
  set: (value: boolean) => emit('update:form', { ...props.form, active: value }),
})

// Group options for the dropdown
const groupOptions = [
  { value: 'header', label: 'ნავიგაცია(ზედა)', icon: '🧭' },
  { value: 'footer', label: 'ნავიგაცია(ქვედა)', icon: '🔻' },
  { value: 'home', label: 'მთავარი გვერდი', icon: '🏠' },
  { value: 'about', label: 'ჩვენს შესახებ', icon: 'ℹ️' },
  { value: 'projects', label: 'პროექტები', icon: '🏗️' },
  { value: 'gallery', label: 'გალერეა', icon: '🖼️' },
  { value: 'faq', label: 'FAQ', icon: '❓' },
  { value: 'contact', label: 'კონტაქტი', icon: '📞' },
  { value: 'buttons', label: 'ღილაკები', icon: '🔘' },
  { value: 'messages', label: 'შეტყობინებები', icon: '💬' },
  { value: 'errors', label: 'შეცდომები', icon: '⚠️' },
  { value: 'admin', label: 'ადმინისტრაცია', icon: '👨‍💼' },
  { value: 'auth', label: 'ავთენტიფიკაცია', icon: '🔐' },
  { value: 'testimonials', label: 'რეკომენდაციები', icon: '💭' },
]

// Method to get placeholder text based on selected group
const getKeyPlaceholder = () => {
  const placeholders = {
    header: 'მაგ. menu_item',
    footer: 'მაგ. copyright_text',
    home: 'მაგ. welcome_message',
    about: 'მაგ. company_description',
    projects: 'მაგ. project_title',
    gallery: 'მაგ. image_caption',
    faq: 'მაგ. question_answer',
    contact: 'მაგ. contact_form_label',
    buttons: 'მაგ. submit_button',
    messages: 'მაგ. success_message',
  }
  return placeholders[props.form.group as keyof typeof placeholders] || 'მაგ. unique_identifier'
}

// Method to translate both English and Russian from Georgian
const translateBoth = () => {
  emit('translateBoth')
}
</script>

<style scoped>
/* Modal backdrop blur */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Enhanced focus styles */
input:focus,
textarea:focus,
select:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

/* Custom select arrow */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 3rem;
}
</style>
