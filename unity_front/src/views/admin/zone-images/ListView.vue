<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-pink-50 p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold mb-6 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
        ზონის სურათების მართვა
      </h1>

      <!-- Project & Building Selection -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">პროექტი</label>
            <select v-model="selectedProjectId" @change="loadBuildings" class="w-full px-4 py-2 border rounded-lg text-gray-900">
              <option :value="null">-- აირჩიეთ --</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">შენობა</label>
            <select v-model="selectedBuildingId" @change="loadImages" class="w-full px-4 py-2 border rounded-lg text-gray-900" :disabled="!selectedProjectId">
              <option :value="null">-- აირჩიეთ --</option>
              <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
        </div>
        <button
          @click="showUpload = true"
          :disabled="!selectedBuildingId"
          class="mt-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          სურათის ატვირთვა
        </button>
      </div>

      <!-- Images List -->
      <div v-if="images.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="image in images" :key="image.id" class="bg-white rounded-xl shadow-sm overflow-hidden">
          <img :src="image.image_url" :alt="`Floor ${image.floor_number}`" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h3 class="font-bold">სართული {{ image.floor_number }}</h3>
            <p class="text-sm text-slate-600">{{ image.viewBox }}</p>
            <div class="mt-3 flex gap-2">
              <button @click="editImage(image)" class="flex-1 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm">Edit</button>
              <button @click="deleteImage(image)" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="selectedBuildingId" class="bg-white rounded-xl shadow-sm p-12 text-center text-slate-500">
        სურათები არ მოიძებნა
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUpload" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-2xl w-full">
        <h2 class="text-2xl font-bold mb-4">{{ editingImage ? 'სურათის რედაქტირება' : 'ახალი სურათი' }}</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">სართული</label>
            <input v-model.number="imageForm.floor_number" type="number" class="w-full px-4 py-2 border rounded-lg text-gray-900" />
          </div>
          <div v-if="!editingImage">
            <label class="block text-sm font-medium mb-2">სურათი</label>
            <input @change="handleFileSelect" type="file" accept="image/*" class="w-full px-4 py-2 border rounded-lg text-gray-900" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">ViewBox</label>
            <input v-model="imageForm.viewBox" type="text" class="w-full px-4 py-2 border rounded-lg text-gray-900" placeholder="0 0 1000 800" />
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="closeUpload" class="flex-1 px-6 py-3 border rounded-xl">Cancel</button>
          <button @click="saveImage" :disabled="!editingImage && !selectedFile" class="flex-1 bg-rose-600 text-white px-6 py-3 rounded-xl disabled:opacity-50">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminProjectsStore } from '@/stores/admin/projects'
import { useBuildingsAdminStore } from '@/stores/admin/buildings'
import type { Project } from '@/types'
import type { Building } from '@/types/apartments'
import api from '@/plugins/axios/api'

interface ZoneImage {
  id: number
  floor_number: number
  image_url: string
  viewBox: string
}

const projectsStore = useAdminProjectsStore()
const buildingsStore = useBuildingsAdminStore()

const selectedProjectId = ref<number | null>(null)
const selectedBuildingId = ref<number | null>(null)
const projects = ref<Project[]>([])
const buildings = ref<Building[]>([])
const images = ref<ZoneImage[]>([])
const showUpload = ref(false)
const editingImage = ref<ZoneImage | null>(null)
const selectedFile = ref<File | null>(null)
const imageForm = ref({
  floor_number: 1,
  viewBox: '0 0 1000 800',
})

onMounted(async () => {
  await projectsStore.loadProjects()
  projects.value = projectsStore.projects
})

async function loadBuildings() {
  if (!selectedProjectId.value) return
  await buildingsStore.fetchBuildings(selectedProjectId.value)
  buildings.value = buildingsStore.buildings
  selectedBuildingId.value = null
  images.value = []
}

async function loadImages() {
  if (!selectedProjectId.value || !selectedBuildingId.value) return
  try {
    const res = await api.get(`/admin/projects/${selectedProjectId.value}/zone-images`, {
      params: { building_id: selectedBuildingId.value }
    })
    images.value = res.data.data || []
  } catch (error) {
    console.error('Failed to load images:', error)
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

function editImage(image: ZoneImage) {
  editingImage.value = image
  imageForm.value = {
    floor_number: image.floor_number,
    viewBox: image.viewBox,
  }
  showUpload.value = true
}

function closeUpload() {
  showUpload.value = false
  editingImage.value = null
  selectedFile.value = null
  imageForm.value = { floor_number: 1, viewBox: '0 0 1000 800' }
}

async function saveImage() {
  try {
    // Parse viewBox to get width and height
    const viewBoxParts = imageForm.value.viewBox.split(' ')
    const width = viewBoxParts[2] ? parseInt(viewBoxParts[2]) : 1000
    const height = viewBoxParts[3] ? parseInt(viewBoxParts[3]) : 800

    const formData = new FormData()
    formData.append('level_type', 'floor')
    formData.append('building_id', selectedBuildingId.value!.toString())
    formData.append('floor_number', imageForm.value.floor_number.toString())
    formData.append('image_type', 'background')
    formData.append('viewbox', imageForm.value.viewBox)
    formData.append('width', width.toString())
    formData.append('height', height.toString())

    if (selectedFile.value) {
      formData.append('image', selectedFile.value)
    }

    if (editingImage.value) {
      await api.put(`/admin/projects/${selectedProjectId.value}/zone-images/${editingImage.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      await api.post(`/admin/projects/${selectedProjectId.value}/zone-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    closeUpload()
    loadImages()
    alert('სურათი წარმატებით შენახულია')
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } }; message?: string }
    alert('შეცდომა: ' + (apiError.response?.data?.message || apiError.message))
  }
}

async function deleteImage(image: ZoneImage) {
  if (!confirm(`Delete image for floor ${image.floor_number}?`)) return
  try {
    await api.delete(`/admin/projects/${selectedProjectId.value}/zone-images/${image.id}`)
    loadImages()
    alert('სურათი წაიშალა')
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } }; message?: string }
    alert('შეცდომა: ' + (apiError.response?.data?.message || apiError.message))
  }
}
</script>
