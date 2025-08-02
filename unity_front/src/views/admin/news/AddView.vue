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
          უკან სიახლეებზე
        </button>
        <h1
          class="text-5xl font-light bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3 tracking-tight leading-tight py-1"
        >
          ახალი სიახლის დამატება
        </h1>
        <p class="text-slate-600 text-xl font-light">
          შექმენით ახალი სიახლე კომპლექსური ინფორმაციით
        </p>
      </div>

      <!-- News Form -->
      <NewsForm
        :form="form"
        mode="add"
        :submitting="submitting"
        :errors="adminNewsStore.validationErrors"
        @submit="onSubmit"
        @update:form="updateForm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminNewsStore } from '@/stores/admin/news'
import { useToastStore } from '@/stores/ui/toast'
import NewsForm from '@/components/admin/news/NewsForm.vue'

const router = useRouter()
const adminNewsStore = useAdminNewsStore()
const toastStore = useToastStore()

// Refs
const submitting = ref(false)

// Form data
const form = reactive({
  title: { ka: '', en: '', ru: '' },
  excerpt: { ka: '', en: '', ru: '' },
  content: { ka: '', en: '', ru: '' },
  category: 'company',
  publish_date: '',
  is_active: true,
  is_featured: false,
  main_image: null as File | null,
  gallery_images: [] as File[],
  tags: [] as string[],
  meta_title: '',
  meta_description: '',
})

// Functions
function goBack() {
  // Clear validation errors when navigating away
  adminNewsStore.clearValidationErrors()
  adminNewsStore.clearError()
  router.push({ name: 'admin-news' })
}

function updateForm(updatedForm: any) {
  // Clear validation errors when form is updated
  adminNewsStore.clearValidationErrors()
  // Use Object.assign to maintain reactivity
  Object.assign(form, updatedForm)
}

async function onSubmit(formData: FormData) {
  try {
    submitting.value = true
    // Clear previous validation errors
    adminNewsStore.clearValidationErrors()

    const result = await adminNewsStore.addArticle(formData)
    if (result.success) {
      toastStore.success(
        'სიახლე წარმატებით დაემატა',
        'ახალი სიახლე შეიქმნა და ხელმისაწვდომია მომხმარებლებისთვის',
      )
      router.push({ name: 'admin-news' })
    } else {
      if (result.validationErrors) {
        toastStore.error('ფორმაში შეცდომები', 'გთხოვთ, შეასწოროთ ქვემოთ მითითებული ველები')
      } else {
        toastStore.error('შეცდომა', result.error || 'სიახლის დამატება ვერ მოხერხდა')
      }
    }
  } catch (error) {
    console.error('Submit failed:', error)
    toastStore.error('შეცდომა', 'სიახლის დამატება ვერ მოხერხდა')
  } finally {
    submitting.value = false
  }
}

// Lifecycle - Clear errors when component mounts
onMounted(() => {
  adminNewsStore.clearValidationErrors()
  adminNewsStore.clearError()

  // Set default publish date to today if not set
  if (!form.publish_date) {
    form.publish_date = new Date().toISOString().split('T')[0]
  }
})

// Cleanup when component is unmounted
onUnmounted(() => {
  adminNewsStore.clearValidationErrors()
  adminNewsStore.clearError()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
