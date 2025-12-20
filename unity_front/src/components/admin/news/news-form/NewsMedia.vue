<template>
  <FormCard title="მედია ფაილები" variant="emerald">
    <div class="space-y-10">
      <!-- Main Image -->
      <FormSection title="მთავარი სურათი" variant="emerald">
        <FileUpload
          field-id="main_image"
          :preview="mainImagePreview"
          alt-text="Main image preview"
          variant="emerald"
          :enable-compression="true"
          image-type="main"
          @change="emit('main-image-change', $event)"
          @compression-progress="emit('compression-progress', $event)"
          @compression-complete="emit('compression-complete', $event)"
        />
      </FormSection>

      <!-- Gallery Images -->
      <FormSection title="გალერეის სურათები" variant="emerald">
        <FileUpload
          field-id="gallery_images"
          :multiple="true"
          :preview="galleryPreviews.map((p) => p.url)"
          alt-text="Gallery image"
          variant="emerald"
          :enable-compression="true"
          image-type="gallery"
          @change="emit('gallery-change', $event)"
          @remove="emit('gallery-remove', $event)"
          @compression-progress="emit('compression-progress', $event)"
          @compression-complete="emit('compression-complete', $event)"
        />
      </FormSection>
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import { FormCard, FormSection, FileUpload } from '@/components/admin/forms'

defineProps<{
  mainImagePreview: string
  galleryPreviews: Array<{ url: string; type: string; path?: string; file?: File }>
}>()

const emit = defineEmits<{
  'main-image-change': [files: FileList | null]
  'gallery-change': [files: FileList | null]
  'gallery-remove': [index: number]
  'compression-progress': [progress: number]
  'compression-complete': [files: File[]]
}>()
</script>
