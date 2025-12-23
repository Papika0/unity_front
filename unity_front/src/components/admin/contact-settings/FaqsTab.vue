<template>
  <div v-if="store.data">
    <h3 class="text-3xl font-bold text-gray-800 mb-8 pb-4 relative">{{ t('admin.contact_settings.fields.faq_title') }}</h3>

    <div class="space-y-6">
      <div
        v-for="(faq, index) in store.data.faqs"
        :key="index"
        class="bg-gray-50 rounded-lg p-6 border border-gray-200"
      >
        <div class="flex justify-between items-center mb-6">
          <h4 class="text-lg font-semibold text-gray-700">{{ t('admin.contact_settings.fields.question') }} #{{ index + 1 }}</h4>
          <button
            type="button"
            @click="removeFaq(index)"
            class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            {{ t('admin.common.delete') }}
          </button>
        </div>

        <!-- Question -->
        <div class="mb-8">
          <h5 class="text-md font-semibold text-gray-700 mb-4 border-b pb-2">{{ t('admin.contact_settings.fields.question') }}</h5>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">{{ t('admin.contact_settings.fields.question_ka') }}</label>
              </div>
              <textarea
                v-model="faq.question.ka"
                rows="2"
                :placeholder="t('admin.contact_settings.fields.question_ka')"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              ></textarea>
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">{{ t('admin.contact_settings.fields.question_en') }}</label>
                <button
                  v-if="faq.question.ka && !translating"
                  @click="emit('translate', 'faq_question', 'ka', 'en', index)"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  {{ t('admin.common.translate') }}
                </button>
              </div>
              <textarea
                v-model="faq.question.en"
                rows="2"
                :placeholder="t('admin.contact_settings.fields.question_en')"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              ></textarea>
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">{{ t('admin.contact_settings.fields.question_ru') }}</label>
                <button
                  v-if="faq.question.ka && !translating"
                  @click="emit('translate', 'faq_question', 'ka', 'ru', index)"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  {{ t('admin.common.translate') }}
                </button>
              </div>
              <textarea
                v-model="faq.question.ru"
                rows="2"
                :placeholder="t('admin.contact_settings.fields.question_ru')"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Answer -->
        <div>
          <h5 class="text-md font-semibold text-gray-700 mb-4 border-b pb-2">{{ t('admin.contact_settings.fields.answer') }}</h5>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">{{ t('admin.contact_settings.fields.answer_ka') }}</label>
              </div>
              <textarea
                v-model="faq.answer.ka"
                rows="4"
                :placeholder="t('admin.contact_settings.fields.answer_ka')"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              ></textarea>
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">{{ t('admin.contact_settings.fields.answer_en') }}</label>
                <button
                  v-if="faq.answer.ka && !translating"
                  @click="emit('translate', 'faq_answer', 'ka', 'en', index)"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  {{ t('admin.common.translate') }}
                </button>
              </div>
              <textarea
                v-model="faq.answer.en"
                rows="4"
                :placeholder="t('admin.contact_settings.fields.answer_en')"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              ></textarea>
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">{{ t('admin.contact_settings.fields.answer_ru') }}</label>
                <button
                  v-if="faq.answer.ka && !translating"
                  @click="emit('translate', 'faq_answer', 'ka', 'ru', index)"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  {{ t('admin.common.translate') }}
                </button>
              </div>
              <textarea
                v-model="faq.answer.ru"
                rows="4"
                :placeholder="t('admin.contact_settings.fields.answer_ru')"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        @click="addFaq"
        class="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all font-medium flex items-center justify-center gap-2"
      >
        <i class="material-icons">add_circle_outline</i>
        {{ t('admin.contact_settings.fields.add_faq') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useContactSettingsAdminStore } from '@/stores/admin/contactSettings'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()

defineProps({
  translating: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['translate'])
const store = useContactSettingsAdminStore()

const addFaq = () => {
  if (!store.data) return
  store.data.faqs.push({
    question: { ka: '', en: '', ru: '' },
    answer: { ka: '', en: '', ru: '' },
  })
  store.markDirty()
}

const removeFaq = (index: number) => {
  if (!store.data) return
  store.data.faqs.splice(index, 1)
  store.markDirty()
}
</script>
