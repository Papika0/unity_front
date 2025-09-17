<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div class="container mx-auto px-6 py-12 max-w-5xl">
      <!-- Header -->
      <div class="mb-12">
        <button
          @click="goBack"
          class="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-all duration-300 mb-6 group font-medium text-sm bg-white/80 px-4 py-2 rounded-full border border-slate-300 hover:border-emerald-500/50 shadow-sm"
        >
          <svg
            class="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          უკან პროექტებზე
        </button>
        <h1
          class="text-5xl font-light bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 bg-clip-text text-transparent mb-3 tracking-tight leading-tight py-1"
        >
          ახალი პროექტის დამატება
        </h1>
        <p class="text-slate-600 text-xl font-light">
          შექმენით ახალი პროექტი და ატვირთეთ მისი მედია ფაილები
        </p>
      </div>

      <ProjectForm
        :form="form"
        :previews="previews"
        :submitting="submitting"
        :translating="translating"
        :is-edit="false"
        basic-info-variant="amber"
        details-variant="emerald"
        media-variant="violet"
        @submit="onSubmit"
        @translate="handleTranslate"
        @file-change="handleFileChange"
        @gallery-change="handleGalleryChange"
        @gallery-remove="removeGalleryImage"
        @update:form="updateForm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminProjectsStore } from '@/stores/admin/projects'
import { useProjectForm } from '@/composables/useProjectForm'
import { ProjectForm } from '@/components/admin'

const router = useRouter()
const adminProjectsStore = useAdminProjectsStore()

const {
  submitting,
  translating,
  createInitialForm,
  createInitialPreviews,
  handleTranslate: baseHandleTranslate,
  handleFileChange: baseHandleFileChange,
  handleGalleryChange: baseHandleGalleryChange,
  removeGalleryImage: baseRemoveGalleryImage,
  prepareFormData,
} = useProjectForm()

const form = reactive(createInitialForm(false))
const previews = reactive(createInitialPreviews())

function goBack() {
  router.push({ name: 'admin-projects' })
}

function updateForm(updatedForm: Partial<typeof form>) {
  Object.assign(form, updatedForm)
}

function handleTranslate(fieldName: string, fromLang: string, toLang: string) {
  baseHandleTranslate(form, fieldName, fromLang, toLang)
}

function handleFileChange(fieldName: 'main_image' | 'render_image', files: FileList | null) {
  baseHandleFileChange(form, previews, fieldName, files)
}

function handleGalleryChange(files: FileList | null) {
  baseHandleGalleryChange(form, previews, files, false)
}

function removeGalleryImage(index: number) {
  baseRemoveGalleryImage(form, previews, index, false)
}

async function onSubmit() {
  try {
    submitting.value = true
    const formData = await prepareFormData(form, false)

    const result = await adminProjectsStore.addProject(formData)
    if (result.success) {
      router.push({ name: 'admin-projects' })
    } else {
      console.error('Creation failed:', result.error)
    }
  } catch (error) {
    console.error('Creation failed:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}

/* Custom select styling for light theme */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 3rem;
}

/* Enhanced focus styles for light theme */
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

/* Custom scrollbar for light theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(241, 245, 249, 0.8);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.8);
}

/* Smooth animations for form elements */
input[type='file']::-webkit-file-upload-button {
  background: rgb(236, 253, 245);
  color: rgb(5, 150, 105);
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

input[type='file']::-webkit-file-upload-button:hover {
  background: rgb(209, 250, 229);
  transform: translateY(-1px);
}

/* Checkbox styling for light theme */
input[type='checkbox']:checked {
  background-size: 16px 16px;
}

/* Enhanced hover effects */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

/* Gradient text animation */
@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.bg-gradient-to-r.from-emerald-500.via-emerald-400.to-teal-400 {
  background-size: 200% 200%;
  animation: gradient-shift 6s ease-in-out infinite;
}

/* Card hover effects */
.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
}

/* Button glow effect */
button[type='submit']:not(:disabled):hover {
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
}

/* File input area styling */
.border-dashed:hover {
  background-color: rgba(248, 250, 252, 0.8);
}
</style>
