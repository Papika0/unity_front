<template>
  <form @submit.prevent="onSubmit" class="space-y-12">
    <!-- Basic Information Card -->
    <FormCard title="ძირითადი ინფორმაცია" :variant="basicInfoVariant">
      <div class="space-y-10">
        <!-- Title -->
        <FormSection title="სათაური" :variant="basicInfoVariant">
          <MultiLanguageField
            field-name="title"
            placeholder="შეიყვანეთ სათაური"
            :form-data="form.title"
            :required="true"
            :variant="basicInfoVariant"
            :translating="translating"
            @translate="
              (fromLang: string, toLang: string) => handleTranslate('title', fromLang, toLang)
            "
            @update:form-data="form.title = $event"
          />
        </FormSection>

        <!-- Description -->
        <FormSection title="აღწერა" :variant="basicInfoVariant">
          <MultiLanguageField
            field-name="description"
            field-type="textarea"
            placeholder="შეიყვანეთ აღწერა"
            :form-data="form.description"
            :required="true"
            :variant="basicInfoVariant"
            :translating="translating"
            @translate="
              (fromLang: string, toLang: string) => handleTranslate('description', fromLang, toLang)
            "
            @update:form-data="form.description = $event"
          />
        </FormSection>

        <!-- Location -->
        <FormSection title="მდებარეობა" :variant="basicInfoVariant">
          <MultiLanguageField
            field-name="location"
            placeholder="შეიყვანეთ მდებარეობა"
            :form-data="form.location"
            :variant="basicInfoVariant"
            :translating="translating"
            @translate="
              (fromLang: string, toLang: string) => handleTranslate('location', fromLang, toLang)
            "
            @update:form-data="form.location = $event"
          />
        </FormSection>
      </div>
    </FormCard>

    <!-- Project Details Card -->
    <FormCard title="პროექტის დეტალები" :variant="detailsVariant">
      <div class="space-y-8">
        <!-- Status & Year -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            field-id="status"
            field-type="select"
            label="სტატუსი"
            v-model:model-value="form.status"
            :required="true"
            :variant="detailsVariant"
          >
            <option value="planning">🎯 გეგმაში</option>
            <option value="ongoing">⚡ მიმდინარეობს</option>
            <option value="completed">✅ დასრულდა</option>
          </FormField>

          <FormField
            field-id="year"
            label="წელი"
            input-type="number"
            v-model:model-value="form.year"
            :min="1900"
            :max="2100"
            :required="true"
            :variant="detailsVariant"
          />
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            field-id="start_date"
            label="დაწყების თარიღი"
            input-type="date"
            v-model:model-value="form.start_date"
            :required="true"
            :variant="detailsVariant"
          />

          <FormField
            field-id="completion_date"
            label="დამთავრების თარიღი"
            input-type="date"
            v-model:model-value="form.completion_date"
            :required="true"
            :variant="detailsVariant"
          />
        </div>

        <!-- Toggle Switches -->
        <div class="flex flex-wrap items-center gap-12 pt-6">
          <CheckboxField
            field-id="is_active"
            label="აქტიური"
            v-model:model-value="form.is_active"
            :variant="detailsVariant"
          />
          <CheckboxField
            field-id="is_featured"
            label="რჩეული"
            v-model:model-value="form.is_featured"
            variant="amber"
          />
        </div>
      </div>
    </FormCard>

    <!-- Media Upload Card -->
    <FormCard title="მედია ფაილები" :variant="mediaVariant">
      <div class="space-y-10">
        <!-- Main Image -->
        <FormSection title="მთავარი სურათი" :variant="mediaVariant">
          <FileUpload
            field-id="main_image"
            :preview="previews.main_image"
            alt-text="Main image preview"
            :variant="mediaVariant"
            @change="handleFileChange('main_image', $event)"
          />
        </FormSection>

        <!-- Render Image -->
        <FormSection title="რენდერი" :variant="mediaVariant">
          <FileUpload
            field-id="render_image"
            :preview="previews.render_image"
            alt-text="Render image preview"
            :variant="mediaVariant"
            @change="handleFileChange('render_image', $event)"
          />
        </FormSection>

        <!-- Gallery Images -->
        <FormSection title="გალერეის სურათები" :variant="mediaVariant">
          <FileUpload
            field-id="gallery_images"
            :multiple="true"
            :preview="previews.gallery_images"
            alt-text="Gallery image"
            :variant="mediaVariant"
            :backend-url="backendUrl"
            @change="handleGalleryChange"
            @remove="removeGalleryImage"
          />
        </FormSection>
      </div>
    </FormCard>

    <!-- Submit Button -->
    <div class="flex justify-end pt-8">
      <button type="submit" :disabled="submitting" :class="submitButtonClass">
        <svg
          v-if="submitting"
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="submitIconPath"
          ></path>
        </svg>
        <span class="text-lg font-medium">{{ submitButtonText }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectFormData, ProjectPreviews } from '@/composables/useProjectForm'
import FormCard from '../forms/FormCard.vue'
import FormSection from '../forms/FormSection.vue'
import MultiLanguageField from '../forms/MultiLanguageField.vue'
import FormField from '../forms/FormField.vue'
import CheckboxField from '../forms/CheckboxField.vue'
import FileUpload from '../forms/FileUpload.vue'

interface Props {
  form: ProjectFormData
  previews: ProjectPreviews
  submitting: boolean
  translating: boolean
  isEdit?: boolean
  backendUrl?: string
  basicInfoVariant?: 'amber' | 'emerald' | 'violet'
  detailsVariant?: 'amber' | 'emerald' | 'violet'
  mediaVariant?: 'amber' | 'emerald' | 'violet'
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  backendUrl: '',
  basicInfoVariant: 'emerald',
  detailsVariant: 'violet',
  mediaVariant: 'amber',
})

const emit = defineEmits<{
  submit: []
  translate: [fieldName: string, fromLang: string, toLang: string]
  fileChange: [fieldName: 'main_image' | 'render_image', files: FileList | null]
  galleryChange: [files: FileList | null]
  galleryRemove: [index: number]
}>()

const submitButtonClass = computed(() => {
  const baseClass =
    'px-10 py-5 text-white font-medium rounded-2xl shadow-xl focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 flex items-center space-x-3'

  if (props.isEdit) {
    return `${baseClass} bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 focus:ring-amber-400/50`
  } else {
    return `${baseClass} bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 focus:ring-emerald-400/50`
  }
})

const submitButtonText = computed(() => {
  if (props.submitting) {
    return 'მიმდინარეობს შენახვა…'
  }
  return props.isEdit ? 'შენახვა' : 'შექმნა'
})

const submitIconPath = computed(() => {
  return props.isEdit
    ? 'M5 13l4 4L19 7' // Check icon for edit
    : 'M12 6v6m0 0v6m0-6h6m-6 0H6' // Plus icon for add
})

function onSubmit() {
  emit('submit')
}

function handleTranslate(fieldName: string, fromLang: string, toLang: string) {
  emit('translate', fieldName, fromLang, toLang)
}

function handleFileChange(fieldName: 'main_image' | 'render_image', files: FileList | null) {
  emit('fileChange', fieldName, files)
}

function handleGalleryChange(files: FileList | null) {
  emit('galleryChange', files)
}

function removeGalleryImage(index: number) {
  emit('galleryRemove', index)
}
</script>
