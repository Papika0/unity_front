<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        ინტერაქტიული ზონების მართვა
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
            <select v-model="selectedBuildingId" @change="loadZones" class="w-full px-4 py-2 border rounded-lg text-gray-900" :disabled="!selectedProjectId">
              <option :value="null">-- აირჩიეთ --</option>
              <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
        </div>
        <button
          @click="showDrawing = true"
          :disabled="!selectedBuildingId"
          class="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          ახალი ზონის დამატება
        </button>
      </div>

      <!-- Zones List -->
      <div v-if="zones.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="zone in zones" :key="zone.id" class="bg-white rounded-xl shadow-sm p-4">
          <h3 class="font-bold mb-2">{{ zone.label }}</h3>
          <p class="text-sm text-slate-600">Apartment: {{ zone.entity_id }}</p>
          <div class="mt-3 flex gap-2">
            <button @click="editZone(zone)" class="flex-1 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm">Edit</button>
            <button @click="deleteZone(zone)" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Delete</button>
          </div>
        </div>
      </div>
      <div v-else-if="selectedBuildingId" class="bg-white rounded-xl shadow-sm p-12 text-center text-slate-500">
        ზონები არ მოიძებნა
      </div>
    </div>

    <!-- Drawing Modal (Simplified) -->
    <div v-if="showDrawing" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">{{ editingZone ? 'ზონის რედაქტირება' : 'ახალი ზონა' }}</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">ბინის ID</label>
            <input v-model.number="zoneForm.entity_id" type="number" class="w-full px-4 py-2 border rounded-lg text-gray-900" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">ლეიბლი</label>
            <input v-model="zoneForm.label" type="text" class="w-full px-4 py-2 border rounded-lg text-gray-900" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Polygon Coordinates (JSON)</label>
            <textarea v-model="zoneForm.polygon" rows="4" class="w-full px-4 py-2 border rounded-lg font-mono text-sm"></textarea>
            <p class="text-xs text-slate-500 mt-1">Format: [[x1,y1],[x2,y2],...]</p>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="closeDrawing" class="flex-1 px-6 py-3 border rounded-xl">Cancel</button>
          <button @click="saveZone" class="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl">Save</button>
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

interface Zone {
  id: number
  entity_id: number
  label: string
  polygon: number[][]
  type: string
}

const projectsStore = useAdminProjectsStore()
const buildingsStore = useBuildingsAdminStore()

const selectedProjectId = ref<number | null>(null)
const selectedBuildingId = ref<number | null>(null)
const projects = ref<Project[]>([])
const buildings = ref<Building[]>([])
const zones = ref<Zone[]>([])
const showDrawing = ref(false)
const editingZone = ref<Zone | null>(null)
const zoneForm = ref({
  entity_id: null as number | null,
  label: '',
  polygon: '[]',
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
  zones.value = []
}

async function loadZones() {
  if (!selectedProjectId.value || !selectedBuildingId.value) return
  try {
    const res = await api.get(
      `/admin/projects/${selectedProjectId.value}/buildings/${selectedBuildingId.value}/zones`
    )
    zones.value = res.data.data || []
  } catch (error) {
    console.error('Failed to load zones:', error)
  }
}

function editZone(zone: Zone) {
  editingZone.value = zone
  zoneForm.value = {
    entity_id: zone.entity_id,
    label: zone.label,
    polygon: JSON.stringify(zone.polygon),
  }
  showDrawing.value = true
}

function closeDrawing() {
  showDrawing.value = false
  editingZone.value = null
  zoneForm.value = { entity_id: null, label: '', polygon: '[]' }
}

async function saveZone() {
  try {
    const payload = {
      entity_id: zoneForm.value.entity_id,
      label: zoneForm.value.label,
      polygon: JSON.parse(zoneForm.value.polygon),
      type: 'building_block',
    }

    if (editingZone.value) {
      await api.put(
        `/admin/projects/${selectedProjectId.value}/buildings/${selectedBuildingId.value}/zones/${editingZone.value.id}`,
        payload
      )
    } else {
      await api.post(
        `/admin/projects/${selectedProjectId.value}/buildings/${selectedBuildingId.value}/zones`,
        payload
      )
    }

    closeDrawing()
    loadZones()
    alert('ზონა წარმატებით შენახულია')
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } }; message?: string }
    alert('შეცდომა: ' + (apiError.response?.data?.message || apiError.message))
  }
}

async function deleteZone(zone: Zone) {
  if (!confirm(`Delete zone "${zone.label}"?`)) return
  try {
    await api.delete(
      `/admin/projects/${selectedProjectId.value}/buildings/${selectedBuildingId.value}/zones/${zone.id}`
    )
    loadZones()
    alert('ზონა წაიშალა')
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } }; message?: string }
    alert('შეცდომა: ' + (apiError.response?.data?.message || apiError.message))
  }
}
</script>
