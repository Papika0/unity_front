<template>
  <div v-if="store.data">
    <div class="mb-8">
      <h3 class="text-3xl font-bold text-gray-800 mb-4">კონტაქტის ინფორმაცია</h3>
      <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
    </div>

    <div class="space-y-8">
      <!-- Address -->
      <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h4 class="text-lg font-semibold text-gray-700 mb-6">
          მისამართი <span class="text-red-500">*</span>
        </h4>

        <!-- Address Value -->
        <div class="mb-6">
          <h5 class="text-md font-semibold text-gray-700 mb-3">მისამართი</h5>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">მისამართი ქართულად</label>
              </div>
              <input
                v-model="store.data.contact_info.address.value.ka"
                type="text"
                placeholder="კომპანიის მისამართი"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">მისამართი ინგლისურად</label>
                <button
                  v-if="store.data.contact_info.address.value.ka && !translating"
                  @click="emit('translate', 'address', 'ka', 'en')"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  თარგმნა
                </button>
              </div>
              <input
                v-model="store.data.contact_info.address.value.en"
                type="text"
                placeholder="Company address"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">მისამართი რუსულად</label>
                <button
                  v-if="store.data.contact_info.address.value.ka && !translating"
                  @click="emit('translate', 'address', 'ka', 'ru')"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  თარგმნა
                </button>
              </div>
              <input
                v-model="store.data.contact_info.address.value.ru"
                type="text"
                placeholder="Адрес компании"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
          </div>
        </div>

        <!-- Address Subtitle -->
        <div>
          <h5 class="text-md font-semibold text-gray-700 mb-3">ქვეწარწერა</h5>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">ქვეწარწერა ქართულად</label>
              </div>
              <input
                v-model="store.data.contact_info.address.subtitle.ka"
                type="text"
                placeholder="მისამართის ქვეწარწერა"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">ქვეწარწერა ინგლისურად</label>
                <button
                  v-if="store.data.contact_info.address.subtitle.ka && !translating"
                  @click="emit('translate', 'address_subtitle', 'ka', 'en')"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  თარგმნა
                </button>
              </div>
              <input
                v-model="store.data.contact_info.address.subtitle.en"
                type="text"
                placeholder="Address subtitle"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">ქვეწარწერა რუსულად</label>
                <button
                  v-if="store.data.contact_info.address.subtitle.ka && !translating"
                  @click="emit('translate', 'address_subtitle', 'ka', 'ru')"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  თარგმნა
                </button>
              </div>
              <input
                v-model="store.data.contact_info.address.subtitle.ru"
                type="text"
                placeholder="Подзаголовок адреса"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Phone Numbers -->
      <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h4 class="text-lg font-semibold text-gray-700 mb-4">
          ტელეფონი <span class="text-red-500">*</span>
        </h4>
        <div class="space-y-4">
          <!-- Phone 1 -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">ძირითადი ნომერი</label>
            <input
              v-model="store.data.contact_info.phone.value"
              type="tel"
              placeholder="+995 577 300 333"
              @input="store.markDirty()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
            />
          </div>
          <!-- Phone 2 -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">დამატებითი ნომერი</label>
            <input
              v-model="store.data.contact_info.phone2.value"
              type="tel"
              placeholder="+995 555 123 456"
              @input="store.markDirty()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
            />
          </div>
          <!-- Phone Subtitles -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">ქვეწარწერა ქართულად</label>
              </div>
              <input
                v-model="store.data.contact_info.phone.subtitle.ka"
                type="text"
                placeholder="ტელეფონის ქვეწარწერა"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">ქვეწარწერა ინგლისურად</label>
                <button
                  v-if="store.data.contact_info.phone.subtitle.ka && !translating"
                  @click="emit('translate', 'phone_subtitle', 'ka', 'en')"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  თარგმნა
                </button>
              </div>
              <input
                v-model="store.data.contact_info.phone.subtitle.en"
                type="text"
                placeholder="Phone subtitle"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">ქვეწარწერა რუსულად</label>
                <button
                  v-if="store.data.contact_info.phone.subtitle.ka && !translating"
                  @click="emit('translate', 'phone_subtitle', 'ka', 'ru')"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  თარგმნა
                </button>
              </div>
              <input
                v-model="store.data.contact_info.phone.subtitle.ru"
                type="text"
                placeholder="Подзаголовок телефона"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Email -->
      <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h4 class="text-lg font-semibold text-gray-700 mb-4">
          ელ. ფოსტა <span class="text-red-500">*</span>
        </h4>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-600 mb-2">ელ. ფოსტის მისამართი</label>
          <input
            v-model="store.data.contact_info.email.value"
            type="email"
            placeholder="info@company.com"
            @input="store.markDirty()"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-600">ქვეწარწერა ქართულად</label>
            </div>
            <input
              v-model="store.data.contact_info.email.subtitle.ka"
              type="text"
              placeholder="ელ. ფოსტის ქვეწარწერა"
              @input="store.markDirty()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
            />
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-600">ქვეწარწერა ინგლისურად</label>
              <button
                v-if="store.data.contact_info.email.subtitle.ka && !translating"
                @click="emit('translate', 'email_subtitle', 'ka', 'en')"
                type="button"
                class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all"
                :disabled="translating"
              >
                <i class="material-icons text-xs">translate</i>
                თარგმნა
              </button>
            </div>
            <input
              v-model="store.data.contact_info.email.subtitle.en"
              type="text"
              placeholder="Email subtitle"
              @input="store.markDirty()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
            />
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-600">ქვეწარწერა რუსულად</label>
              <button
                v-if="store.data.contact_info.email.subtitle.ka && !translating"
                @click="emit('translate', 'email_subtitle', 'ka', 'ru')"
                type="button"
                class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all"
                :disabled="translating"
              >
                <i class="material-icons text-xs">translate</i>
                თარგმნა
              </button>
            </div>
            <input
              v-model="store.data.contact_info.email.subtitle.ru"
              type="text"
              placeholder="Подзаголовок email"
              @input="store.markDirty()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
            />
          </div>
        </div>
      </div>

      <!-- Hours -->
      <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h4 class="text-lg font-semibold text-gray-700 mb-6">სამუშაო საათები</h4>

        <!-- Hours Value -->
        <div class="mb-6">
          <h5 class="text-md font-semibold text-gray-700 mb-3">საათები</h5>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">საათები ქართულად</label>
              </div>
              <input
                v-model="store.data.contact_info.hours.value.ka"
                type="text"
                placeholder="ორშ-პარ 9:00-18:00"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">საათები ინგლისურად</label>
                <button
                  v-if="store.data.contact_info.hours.value.ka && !translating"
                  @click="emit('translate', 'hours_value', 'ka', 'en')"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  თარგმნა
                </button>
              </div>
              <input
                v-model="store.data.contact_info.hours.value.en"
                type="text"
                placeholder="Mon-Fri 9:00-18:00"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">საათები რუსულად</label>
                <button
                  v-if="store.data.contact_info.hours.value.ka && !translating"
                  @click="emit('translate', 'hours_value', 'ka', 'ru')"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  თარგმნა
                </button>
              </div>
              <input
                v-model="store.data.contact_info.hours.value.ru"
                type="text"
                placeholder="Пн-Пт 9:00-18:00"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
          </div>
        </div>

        <!-- Hours Subtitle -->
        <div>
          <h5 class="text-md font-semibold text-gray-700 mb-3">ქვეწარწერა</h5>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">ქვეწარწერა ქართულად</label>
              </div>
              <input
                v-model="store.data.contact_info.hours.subtitle.ka"
                type="text"
                placeholder="საათების ქვეწარწერა"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">ქვეწარწერა ინგლისურად</label>
                <button
                  v-if="store.data.contact_info.hours.subtitle.ka && !translating"
                  @click="emit('translate', 'hours_subtitle', 'ka', 'en')"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  თარგმნა
                </button>
              </div>
              <input
                v-model="store.data.contact_info.hours.subtitle.en"
                type="text"
                placeholder="Hours subtitle"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-600">ქვეწარწერა რუსულად</label>
                <button
                  v-if="store.data.contact_info.hours.subtitle.ka && !translating"
                  @click="emit('translate', 'hours_subtitle', 'ka', 'ru')"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                  :disabled="translating"
                >
                  <i class="material-icons text-xs">translate</i>
                  თარგმნა
                </button>
              </div>
              <input
                v-model="store.data.contact_info.hours.subtitle.ru"
                type="text"
                placeholder="Подзаголовок часов"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useContactSettingsAdminStore } from '@/stores/admin/contactSettings'

defineProps({
  translating: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['translate'])
const store = useContactSettingsAdminStore()
</script>
