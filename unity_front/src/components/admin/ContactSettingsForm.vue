<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <!-- Toast Notifications -->
    <Teleport to="body">
      <div v-if="toastMessage" class="fixed top-4 right-4 z-50">
        <div
          :class="[
            'flex items-center p-4 rounded-lg shadow-xl transform transition-all duration-300',
            toastType === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200',
          ]"
        >
          <i class="material-icons mr-2 text-xl">{{ toastType === 'success' ? 'check_circle' : 'error' }}</i>
          <span class="font-medium">{{ toastMessage }}</span>
        </div>
      </div>
    </Teleport>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="flex flex-col items-center justify-center py-16">
      <div
        class="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"
      ></div>
      <p class="text-gray-600">კონტაქტის პარამეტრების ჩატვირთვა...</p>
    </div>

    <!-- Main Form -->
    <div v-else-if="store.data">
      <!-- Tab Navigation -->
      <div
        class="bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 p-6 border-b border-gray-200"
      >
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            v-for="tab in availableTabs"
            :key="tab.id"
            :class="[
              'group relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105',
              store.currentTab === tab.id
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:text-gray-800 hover:bg-white hover:shadow-md border border-gray-200/50',
            ]"
            @click="store.setCurrentTab(tab.id)"
          >
            <!-- Icon -->
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-all duration-300',
                store.currentTab === tab.id
                  ? 'bg-white/20'
                  : 'bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200',
              ]"
            >
              <i
                :class="[
                  'material-icons text-lg transition-colors duration-300',
                  store.currentTab === tab.id
                    ? 'text-white'
                    : 'text-blue-600 group-hover:text-purple-600',
                ]"
              >
                {{ tab.icon }}
              </i>
            </div>

            <!-- Tab name -->
            <span
              :class="[
                'text-xs font-medium text-center leading-tight transition-colors duration-300',
                store.currentTab === tab.id
                  ? 'text-white'
                  : 'text-gray-700 group-hover:text-gray-800',
              ]"
            >
              {{ tab.nameGeorgian }}
            </span>
          </button>
        </div>
      </div>

      <!-- Form Content -->
      <div class="p-6">
        <ContactInfoTab 
          v-if="store.currentTab === 'contact_info'" 
          :translating="translating"
          @translate="handleTranslate"
        />
        <SocialLinksTab v-if="store.currentTab === 'social_links'" />
        <MapSettingsTab v-if="store.currentTab === 'map_settings'" />
        <FormSubjectsTab 
          v-if="store.currentTab === 'form_subjects'"
          :translating="translating"
          @translate="handleTranslate"
        />
        <FaqsTab 
          v-if="store.currentTab === 'faqs'"
          :translating="translating"
          @translate="handleTranslate"
        />
        <OfficeDaysTab v-if="store.currentTab === 'office_days'" />
      </div>

      <!-- Form Actions -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
        <button
          type="button"
          :disabled="!store.isDirty"
          @click="store.resetForm()"
          class="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          ცვლილებების გაუქმება
        </button>

        <button
          type="button"
          :disabled="!store.canSave"
          @click="handleSave"
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          <span v-if="store.isSaving">შენახვა...</span>
          <span v-else>ცვლილებების შენახვა</span>
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-16">
      <p class="text-gray-600 mb-4">კონტაქტის პარამეტრების ჩატვირთვა ვერ მოხერხდა.</p>
      <button
        @click="store.loadSettings()"
        class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        ხელახლა ცდა
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useContactSettingsAdminStore } from '@/stores/admin/contactSettings'
import { Translator } from '@/utils/translator'

// Sub-components
import ContactInfoTab from './contact-settings/ContactInfoTab.vue'
import SocialLinksTab from './contact-settings/SocialLinksTab.vue'
import MapSettingsTab from './contact-settings/MapSettingsTab.vue'
import FormSubjectsTab from './contact-settings/FormSubjectsTab.vue'
import FaqsTab from './contact-settings/FaqsTab.vue'
import OfficeDaysTab from './contact-settings/OfficeDaysTab.vue'

const store = useContactSettingsAdminStore()

// Toast notification state
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Translation state
const translating = ref(false)

const availableTabs = computed(() => [
  { id: 'contact_info', nameGeorgian: 'კონტაქტი', icon: 'contact_mail' },
  { id: 'social_links', nameGeorgian: 'სოც. ბმულები', icon: 'share' },
  { id: 'map_settings', nameGeorgian: 'რუკა', icon: 'map' },
  { id: 'form_subjects', nameGeorgian: 'ფორმა', icon: 'list' },
  { id: 'faqs', nameGeorgian: 'კითხვები', icon: 'help' },
  { id: 'office_days', nameGeorgian: 'განრიგი', icon: 'schedule' },
])

onMounted(() => {
  if (!store.data) {
    store.loadSettings()
  }
})

// Toast notification function
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// Translation function
async function handleTranslate(
  fieldName: string,
  fromLang: string,
  toLang: string,
  index?: number,
) {
  if (translating.value || !store.data) return

  // Get the multilingual field from the nested structure
  let field: Record<string, string> | null = null

  // Handle different field paths in the contact info structure
  if (fieldName === 'address') {
    field = store.data.contact_info.address.value
  } else if (fieldName === 'address_subtitle') {
    field = store.data.contact_info.address.subtitle
  } else if (fieldName === 'phone_subtitle') {
    field = store.data.contact_info.phone.subtitle
  } else if (fieldName === 'email_subtitle') {
    field = store.data.contact_info.email.subtitle
  } else if (fieldName === 'hours_value') {
    field = store.data.contact_info.hours.value
  } else if (fieldName === 'hours_subtitle') {
    field = store.data.contact_info.hours.subtitle
  } else if (fieldName === 'form_subject_label' && typeof index === 'number') {
    field = store.data.form_subjects[index]?.label
  } else if (fieldName === 'faq_question' && typeof index === 'number') {
    field = store.data.faqs[index]?.question
  } else if (fieldName === 'faq_answer' && typeof index === 'number') {
    field = store.data.faqs[index]?.answer
  }

  if (!field) return

  const sourceText = field[fromLang]
  if (!sourceText) return

  try {
    translating.value = true
    const translatedText = await Translator.translate(sourceText, fromLang, toLang)
    field[toLang] = translatedText
    store.markDirty()
  } catch (error) {
    console.error('Translation failed:', error)
    showToast('თარგმნა ვერ მოხერხდა', 'error')
  } finally {
    translating.value = false
  }
}

// Validate required fields
const validateForm = (): boolean => {
  if (!store.data) return false

  const errors: string[] = []

  // Check required contact info fields
  if (!store.data.contact_info.address.value.ka) {
    errors.push('მისამართი (ქართული) აუცილებელია')
  }
  if (!store.data.contact_info.phone.value) {
    errors.push('ტელეფონის ნომერი აუცილებელია')
  }
  if (!store.data.contact_info.email.value) {
    errors.push('ელ. ფოსტა აუცილებელია')
  }

  // Check map settings
  if (!store.data.map_settings.latitude) {
    errors.push('რუკის განედი აუცილებელია')
  }
  if (!store.data.map_settings.longitude) {
    errors.push('რუკის გრძედი აუცილებელია')
  }

  if (errors.length > 0) {
    showToast(errors[0], 'error')
    return false
  }

  return true
}

const handleSave = async () => {
  if (!validateForm()) return

  const success = await store.saveSettings()
  if (success) {
    showToast('პარამეტრები წარმატებით შეინახა', 'success')
  } else {
    showToast('პარამეტრების შენახვა ვერ მოხერხდა', 'error')
  }
}
</script>

<style scoped>
/* Enhanced Tab Navigation Effects */
.group:hover .material-icons {
  transform: scale(1.1);
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
}

.shadow-blue-500\/25 {
  box-shadow: 0 10px 25px -3px rgba(59, 130, 246, 0.25), 0 4px 6px -2px rgba(59, 130, 246, 0.1);
}

.transform {
  will-change: transform;
}

.group .material-icons {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  50% { box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.3); }
}

.bg-gradient-to-br.text-white {
  animation: pulse-glow 2s ease-in-out infinite;
}

@media (max-width: 768px) {
  .text-xs {
    font-size: 0.7rem;
    line-height: 0.9rem;
  }
}

.group:hover {
  transform: translateY(-2px) scale(1.05);
}

.group:active {
  transform: translateY(0) scale(1.02);
}
</style>
