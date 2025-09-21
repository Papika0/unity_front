<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-4">
        <router-link
          to="/admin/features"
          class="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </router-link>
        <h1 class="text-3xl font-bold text-gray-900">ახალი ფუნქციის დამატება</h1>
      </div>
      <p class="text-gray-600">შექმენით ახალი ფუნქცია, რომელიც შეიძლება მიენიჭოს პროექტებს</p>
    </div>

    <!-- Form -->
    <div class="max-w-4xl">
      <form @submit.prevent="submitForm" class="space-y-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">ძირითადი ინფორმაცია</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Feature Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                ფუნქციის სახელი *
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="e.g., location, quality, security"
              />
              <p class="text-xs text-gray-500 mt-1">ფუნქციის უნიკალური იდენტიფიკატორი</p>
            </div>

            <!-- Sort Order -->
            <div>
              <label for="sortOrder" class="block text-sm font-medium text-gray-700 mb-2">
                დალაგების რიგი
              </label>
              <input
                id="sortOrder"
                v-model.number="form.sort_order"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              <p class="text-xs text-gray-500 mt-1">ქვედა რიცხვები ჯერ ჩნდება</p>
            </div>
          </div>

          <!-- Status -->
          <div class="mt-6">
            <label class="flex items-center">
              <input
                v-model="form.is_active"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">აქტივი (შეიძლება მიენიჭოს პროექტებს)</span>
            </label>
          </div>
        </div>

        <!-- Multilingual Content -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-center mb-8">
            <h2
              class="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2"
            >
              მრავალენოვანი კონტენტი
            </h2>
            <p class="text-slate-600 text-sm">შეავსეთ თარგმანი სამივე ენაზე</p>
          </div>

          <div class="space-y-8">
            <!-- Georgian -->
            <div
              class="bg-gradient-to-br from-slate-50/50 to-white rounded-3xl p-6 border border-slate-200/60"
            >
              <LanguageField
                v-model="form.title.ka"
                language="ka"
                label="🇬🇪 ქართული სათაური"
                placeholder="მდებარეობა"
                :required="true"
              />

              <div class="mt-6">
                <LanguageField
                  v-model="form.description.ka"
                  language="ka"
                  label="🇬🇪 ქართული აღწერა"
                  placeholder="ცენტრალური მდებარეობა მთავარ ქუჩაზე"
                  :required="true"
                />
              </div>
            </div>

            <!-- English -->
            <div
              class="bg-gradient-to-br from-slate-50/50 to-white rounded-3xl p-6 border border-slate-200/60"
            >
              <LanguageField
                v-model="form.title.en"
                language="en"
                label="🇬🇧 English Title"
                placeholder="Location"
                :can-translate="!!form.title.ka"
                :translating="isTranslating"
                @translate="translateField('title', 'ka', 'en')"
              />

              <div class="mt-6">
                <LanguageField
                  v-model="form.description.en"
                  language="en"
                  label="🇬🇧 English Description"
                  placeholder="Central location on main street"
                  :can-translate="!!form.description.ka"
                  :translating="isTranslating"
                  @translate="translateField('description', 'ka', 'en')"
                />
              </div>
            </div>

            <!-- Russian -->
            <div
              class="bg-gradient-to-br from-slate-50/50 to-white rounded-3xl p-6 border border-slate-200/60"
            >
              <LanguageField
                v-model="form.title.ru"
                language="ru"
                label="🇷🇺 русский заголовок"
                placeholder="Местоположение"
                :can-translate="!!form.title.ka"
                :translating="isTranslating"
                @translate="translateField('title', 'ka', 'ru')"
              />

              <div class="mt-6">
                <LanguageField
                  v-model="form.description.ru"
                  language="ru"
                  label="🇷🇺 русское описание"
                  placeholder="Центральное расположение на главной улице"
                  :can-translate="!!form.description.ka"
                  :translating="isTranslating"
                  @translate="translateField('description', 'ka', 'ru')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Visual Properties -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">ვიზუალური თვისებები</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Icon -->
            <div>
              <label for="icon" class="block text-sm font-medium text-gray-700 mb-2">
                ხატულა *
              </label>
              <OnlineIconPicker
                v-model="form.icon"
                placeholder="ძებნა ხატულების შორის..."
                @icon-selected="onIconSelected"
              />
              <p class="text-xs text-gray-500 mt-1">
                ძებნეთ და აირჩიეთ ხატულა კატეგორიების მიხედვით
              </p>
            </div>

            <!-- Color -->
            <div>
              <label for="color" class="block text-sm font-medium text-gray-700 mb-2">
                ფერის კლასები *
              </label>
              <select
                id="color"
                v-model="form.color"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="from-blue-500 to-cyan-500">Blue to Cyan</option>
                <option value="from-green-500 to-emerald-500">Green to Emerald</option>
                <option value="from-amber-500 to-orange-500">Amber to Orange</option>
                <option value="from-purple-500 to-pink-500">Purple to Pink</option>
                <option value="from-red-500 to-rose-500">Red to Rose</option>
                <option value="from-indigo-500 to-blue-500">Indigo to Blue</option>
                <option value="from-gray-500 to-slate-500">Gray to Slate</option>
                <option value="from-slate-600 to-gray-700">Dark Slate (Metro)</option>
                <option value="from-teal-500 to-cyan-500">Teal to Cyan</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Tailwind CSS გრადიენტის კლასები</p>
            </div>
          </div>

          <!-- Preview -->
          <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">წინასწარი ხედვა</label>
            <div class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div
                class="w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center text-white text-lg"
                :class="form.color"
              >
                {{ form.icon || '?' }}
              </div>
              <div>
                <div class="font-medium text-gray-900">
                  {{ form.title.ka || form.title.en || 'Feature Title' }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ form.description.ka || form.description.en || 'Feature description' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Keywords -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">ძიების საკვანძო სიტყვები</h2>

          <div>
            <label for="keywords" class="block text-sm font-medium text-gray-700 mb-2">
              საკვანძო სიტყვები *
            </label>
            <div class="space-y-2">
              <div
                v-for="(keyword, index) in form.keywords"
                :key="index"
                class="flex items-center gap-2"
              >
                <input
                  v-model="form.keywords[index]"
                  type="text"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="შეიყვანეთ საკვანძო სიტყვა"
                />
                <button
                  type="button"
                  @click="removeKeyword(index)"
                  class="text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                @click="addKeyword"
                class="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                საკვანძო სიტყვის დამატება
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              საკვანძო სიტყვები, რომლებიც გამოიყენება ამ ფუნქციის ავტომატურად გამოსაცნობად პროექტის
              აღწერებში
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-4">
          <router-link
            to="/admin/features"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            გაუქმება
          </router-link>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <div
              v-if="isSubmitting"
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
            ></div>
            {{ isSubmitting ? 'შექმნა...' : 'ფუნქციის შექმნა' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { featuresApi } from '@/services/featuresApi'
import OnlineIconPicker from '@/components/admin/OnlineIconPicker.vue'
import LanguageField from '@/components/admin/forms/LanguageField.vue'
import { Translator } from '@/utils/translator'

const router = useRouter()
const isSubmitting = ref(false)
const isTranslating = ref(false)

const form = reactive({
  name: '',
  title: {
    ka: '',
    en: '',
    ru: '',
  },
  description: {
    ka: '',
    en: '',
    ru: '',
  },
  icon: '',
  color: 'from-blue-500 to-cyan-500',
  keywords: [''],
  is_active: true,
  sort_order: 0,
})

const addKeyword = () => {
  form.keywords.push('')
}

const removeKeyword = (index: number) => {
  if (form.keywords.length > 1) {
    form.keywords.splice(index, 1)
  }
}

const onIconSelected = (icon: { color?: string }) => {
  if (icon && icon.color) {
    form.color = icon.color
  }
}

const translateField = async (field: 'title' | 'description', fromLang: string, toLang: string) => {
  const sourceText = form[field][fromLang as keyof typeof form.title]
  if (sourceText) {
    isTranslating.value = true
    try {
      const translatedText = await Translator.translate(sourceText, fromLang, toLang)
      form[field][toLang as keyof typeof form.title] = translatedText
    } catch (error) {
      console.error('Translation failed:', error)
      // Keep original text if translation fails
      form[field][toLang as keyof typeof form.title] = sourceText
    } finally {
      isTranslating.value = false
    }
  }
}

const submitForm = async () => {
  isSubmitting.value = true

  try {
    // Filter out empty keywords
    const filteredKeywords = form.keywords.filter((keyword) => keyword.trim() !== '')

    if (filteredKeywords.length === 0) {
      alert('გთხოვთ, დაამატეთ მინიმუმ ერთი საკვანძო სიტყვა')
      return
    }

    const featureData = {
      ...form,
      keywords: filteredKeywords,
    }

    await featuresApi.create(featureData)

    router.push('/admin/features')
  } catch (error) {
    console.error('Failed to create feature:', error)
    alert('ფუნქციის შექმნა ვერ მოხერხდა. გთხოვთ, კვლავ სცადეთ.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
