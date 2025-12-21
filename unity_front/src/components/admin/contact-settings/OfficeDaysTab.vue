<template>
  <div v-if="store.data">
    <h3 class="text-3xl font-bold text-gray-800 mb-8 pb-4 relative">{{ t('admin.contact_settings.fields.office_schedule') }}</h3>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Working Days -->
      <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-blue-100 rounded-lg">
            <i class="material-icons text-blue-600">work</i>
          </div>
          <h4 class="text-lg font-bold text-gray-800">{{ t('admin.contact_settings.fields.working_days') }}</h4>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <button
            v-for="(day, index) in weekDays[currentLanguage]"
            :key="index"
            type="button"
            @click="toggleWorkingDay(dayMapping[index])"
            :class="[
              'flex items-center justify-between p-4 rounded-xl border transition-all duration-200',
              store.data.office_days?.working.includes(dayMapping[index])
                ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]'
                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50',
            ]"
          >
            <span class="font-medium">{{ day }}</span>
            <i class="material-icons text-lg">
              {{
                store.data.office_days?.working.includes(dayMapping[index])
                  ? 'check_circle'
                  : 'radio_button_unchecked'
              }}
            </i>
          </button>
        </div>
      </div>

      <!-- Weekend Days -->
      <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-purple-100 rounded-lg">
            <i class="material-icons text-purple-600">event_busy</i>
          </div>
          <h4 class="text-lg font-bold text-gray-800">{{ t('admin.contact_settings.fields.off_days') }}</h4>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <button
            v-for="(day, index) in weekDays[currentLanguage]"
            :key="index"
            type="button"
            @click="toggleWeekendDay(dayMapping[index])"
            :class="[
              'flex items-center justify-between p-4 rounded-xl border transition-all duration-200',
              store.data.office_days?.weekend.includes(dayMapping[index])
                ? 'bg-purple-600 border-purple-600 text-white shadow-md transform scale-[1.02]'
                : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50',
            ]"
          >
            <span class="font-medium">{{ day }}</span>
            <i class="material-icons text-lg">
              {{
                store.data.office_days?.weekend.includes(dayMapping[index])
                  ? 'check_circle'
                  : 'radio_button_unchecked'
              }}
            </i>
          </button>
        </div>
      </div>
    </div>

    <!-- Language Selector for Days Display -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
      <label class="block text-sm font-medium text-gray-600 mb-2">{{ t('admin.contact_settings.fields.display_language') }}</label>
      <div class="flex gap-4">
        <select
          v-model="currentLanguage"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        >
          <option value="ka">{{ t('admin.common.ka') }}</option>
          <option value="en">{{ t('admin.common.en') }}</option>
          <option value="ru">{{ t('admin.common.ru') }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useContactSettingsAdminStore } from '@/stores/admin/contactSettings'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()

const store = useContactSettingsAdminStore()

// Current language for day names display
const currentLanguage = ref<'ka' | 'en' | 'ru'>('ka')

// Multilingual week days
const weekDays = {
  ka: ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
}

// Day name mapping (index to backend day codes)
const dayMapping = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const toggleWorkingDay = (dayStr: string) => {
  if (!store.data?.office_days) return

  const index = store.data.office_days.working.indexOf(dayStr)
  if (index > -1) {
    store.data.office_days.working.splice(index, 1)
  } else {
    store.data.office_days.working.push(dayStr)
  }
  store.markDirty()
}

const toggleWeekendDay = (dayStr: string) => {
  if (!store.data?.office_days) return

  const index = store.data.office_days.weekend.indexOf(dayStr)
  if (index > -1) {
    store.data.office_days.weekend.splice(index, 1)
  } else {
    store.data.office_days.weekend.push(dayStr)
  }
  store.markDirty()
}
</script>
