<template>
  <div v-if="store.data">
    <h3 class="text-3xl font-bold text-gray-800 mb-8 pb-4 relative">{{ t('admin.contact_settings.tabs.form_subjects') }}</h3>

    <div class="space-y-4">
      <div
        v-for="(subject, index) in store.data.form_subjects"
        :key="index"
        class="bg-gray-50 rounded-lg p-6 border border-gray-200"
      >
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-lg font-semibold text-gray-700">{{ t('admin.contact_settings.fields.subject') }} #{{ index + 1 }}</h4>
          <button
            type="button"
            @click="removeFormSubject(index)"
            class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            {{ t('admin.common.delete') }}
          </button>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-600 mb-2">{{ t('admin.contact_settings.fields.value') }}</label>
          <input
            v-model="subject.value"
            type="text"
            placeholder="contact_general"
            @input="store.markDirty()"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-600">{{ t('admin.contact_settings.fields.name_ka') }}</label>
            </div>
            <input
              v-model="subject.label.ka"
              type="text"
              :placeholder="t('admin.contact_settings.fields.name_ka')"
              @input="store.markDirty()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
            />
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-600">{{ t('admin.contact_settings.fields.name_en') }}</label>
              <button
                v-if="subject.label.ka && !translating"
                @click="emit('translate', 'form_subject_label', 'ka', 'en', index)"
                type="button"
                class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                :disabled="translating"
              >
                <i class="material-icons text-xs">translate</i>
                {{ t('admin.common.translate') }}
              </button>
            </div>
            <input
              v-model="subject.label.en"
              type="text"
              :placeholder="t('admin.contact_settings.fields.name_en')"
              @input="store.markDirty()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
            />
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-600">{{ t('admin.contact_settings.fields.name_ru') }}</label>
              <button
                v-if="subject.label.ka && !translating"
                @click="emit('translate', 'form_subject_label', 'ka', 'ru', index)"
                type="button"
                class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                :disabled="translating"
              >
                <i class="material-icons text-xs">translate</i>
                {{ t('admin.common.translate') }}
              </button>
            </div>
            <input
              v-model="subject.label.ru"
              type="text"
              :placeholder="t('admin.contact_settings.fields.name_ru')"
              @input="store.markDirty()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        @click="addFormSubject"
        class="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all font-medium flex items-center justify-center gap-2"
      >
        <i class="material-icons">add_circle_outline</i>
        {{ t('admin.contact_settings.fields.add_subject') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useContactSettingsAdminStore } from '@/stores/admin/contactSettings'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

defineProps({
  translating: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['translate'])
const store = useContactSettingsAdminStore()

const addFormSubject = () => {
  if (!store.data) return
  store.data.form_subjects.push({ value: '', label: { ka: '', en: '', ru: '' } })
  store.markDirty()
}

const removeFormSubject = (index: number) => {
  if (!store.data) return
  store.data.form_subjects.splice(index, 1)
  store.markDirty()
}
</script>
