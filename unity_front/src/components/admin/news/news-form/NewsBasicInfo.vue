<template>
  <FormCard title="ძირითადი ინფორმაცია" variant="emerald">
    <div class="space-y-10">
      <!-- Title -->
      <FormSection title="სათაური" variant="emerald">
        <MultiLanguageField
          field-name="title"
          placeholder="შეიყვანეთ სათაური"
          :form-data="title"
          :required="true"
          variant="emerald"
          :translating="translating"
          :show-translate-button="true"
          @translate="(fromLang, toLang) => emit('translate', 'title', fromLang, toLang)"
          @update:form-data="emit('update:title', $event)"
        />
        <!-- Error Display for Title -->
        <div v-if="hasAnyTitleError" class="mt-3 space-y-2">
          <FieldError v-for="error in getFieldError('title.ka')" :key="error" label="ქართული სათაური" :error="error" />
          <FieldError v-for="error in getFieldError('title.en')" :key="error" label="ინგლისური სათაური" :error="error" />
          <FieldError v-for="error in getFieldError('title.ru')" :key="error" label="რუსული სათაური" :error="error" />
        </div>
      </FormSection>

      <!-- Excerpt -->
      <FormSection title="მოკლე აღწერა" variant="emerald">
        <MultiLanguageField
          field-name="excerpt"
          field-type="textarea"
          placeholder="შეიყვანეთ მოკლე აღწერა"
          :form-data="excerpt"
          :required="true"
          variant="emerald"
          :rows="3"
          :translating="translating"
          :show-translate-button="true"
          @translate="(fromLang, toLang) => emit('translate', 'excerpt', fromLang, toLang)"
          @update:form-data="emit('update:excerpt', $event)"
        />
        <!-- Error Display for Excerpt -->
        <div v-if="hasAnyExcerptError" class="mt-3 space-y-2">
          <FieldError v-for="error in getFieldError('excerpt.ka')" :key="error" label="ქართული აღწერა" :error="error" />
          <FieldError v-for="error in getFieldError('excerpt.en')" :key="error" label="ინგლისური აღწერა" :error="error" />
          <FieldError v-for="error in getFieldError('excerpt.ru')" :key="error" label="რუსული აღწერა" :error="error" />
        </div>
      </FormSection>

      <!-- Content -->
      <FormSection title="სრული შინაარსი" variant="emerald">
        <MultiLanguageField
          field-name="content"
          field-type="textarea"
          placeholder="შეიყვანეთ სრული შინაარსი"
          :form-data="content"
          :required="true"
          variant="emerald"
          :rows="8"
          :translating="translating"
          :show-translate-button="true"
          @translate="(fromLang, toLang) => emit('translate', 'content', fromLang, toLang)"
          @update:form-data="emit('update:content', $event)"
        />
        <!-- Error Display for Content -->
        <div v-if="hasAnyContentError" class="mt-3 space-y-2">
          <FieldError v-for="error in getFieldError('content.ka')" :key="error" label="ქართული შინაარსი" :error="error" />
          <FieldError v-for="error in getFieldError('content.en')" :key="error" label="ინგლისური შინაარსი" :error="error" />
          <FieldError v-for="error in getFieldError('content.ru')" :key="error" label="რუსული შინაარსი" :error="error" />
        </div>
      </FormSection>
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FormCard, FormSection, MultiLanguageField } from '@/components/admin/forms'
import FieldError from './FieldError.vue'

const props = defineProps<{
  title: { ka: string; en: string; ru: string }
  excerpt: { ka: string; en: string; ru: string }
  content: { ka: string; en: string; ru: string }
  translating: boolean
  errors: Record<string, string[]>
}>()

const emit = defineEmits<{
  'update:title': [value: Record<string, string>]
  'update:excerpt': [value: Record<string, string>]
  'update:content': [value: Record<string, string>]
  translate: [field: 'title' | 'excerpt' | 'content', fromLang: string, toLang: string]
}>()

const getFieldError = (fieldName: string) => props.errors[fieldName] || []
const hasFieldError = (fieldName: string) => getFieldError(fieldName).length > 0

const hasAnyTitleError = computed(() => hasFieldError('title.ka') || hasFieldError('title.en') || hasFieldError('title.ru'))
const hasAnyExcerptError = computed(() => hasFieldError('excerpt.ka') || hasFieldError('excerpt.en') || hasFieldError('excerpt.ru'))
const hasAnyContentError = computed(() => hasFieldError('content.ka') || hasFieldError('content.en') || hasFieldError('content.ru'))
</script>
