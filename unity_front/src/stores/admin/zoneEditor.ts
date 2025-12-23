import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Breadcrumb {
  label: string
  route: { name: string; params: Record<string, string> } | null
}

export const useZoneEditorStore = defineStore('zoneEditor', () => {
  // ==================== STATE ====================
  // Navigation context
  const projectId = ref<number | null>(null)
  const projectName = ref<string>('')
  const buildingId = ref<number | null>(null)
  const buildingName = ref<string>('')
  const floorNumber = ref<number | null>(null)

  // Track where user came from
  const entryPoint = ref<'projects' | 'sidebar' | 'direct'>('direct')

  // ==================== GETTERS ====================
  // Computed breadcrumbs
  const breadcrumbs = computed<Breadcrumb[]>(() => {
    const items: Breadcrumb[] = []

    if (projectId.value && projectName.value) {
      items.push({
        label: projectName.value,
        route: {
          name: 'admin-zones-building-blocks',
          params: { id: projectId.value.toString() },
        },
      })
    }

    if (buildingId.value && buildingName.value) {
      items.push({
        label: buildingName.value,
        route: {
          name: 'admin-zones-floor-strips',
          params: {
            id: projectId.value!.toString(),
            buildingId: buildingId.value.toString(),
          },
        },
      })
    }

    if (floorNumber.value !== null) {
      items.push({
        label: `floor_key:${floorNumber.value}`, // Pass a marker that the component will translate
        route: null, // Current page
      })
    }

    return items
  })

  // ==================== ACTIONS ====================
  function setProject(id: number, name: string) {
    projectId.value = id
    projectName.value = name
  }

  function setBuilding(id: number, name: string) {
    buildingId.value = id
    buildingName.value = name
  }

  function setFloor(floor: number) {
    floorNumber.value = floor
  }

  function setEntryPoint(entry: 'projects' | 'sidebar' | 'direct') {
    entryPoint.value = entry
  }

  function getBackRoute(): string {
    if (entryPoint.value === 'projects') {
      return '/admin/projects'
    }
    return '/admin/projects' // Default to projects
  }

  // ==================== RESET ====================
  function $reset() {
    projectId.value = null
    projectName.value = ''
    buildingId.value = null
    buildingName.value = ''
    floorNumber.value = null
    entryPoint.value = 'direct'
  }

  // Kept for backward compatibility if used elsewhere, but simply calls reset
  function clearContext() {
    $reset()
  }

  // ==================== RETURN ====================
  return {
    projectId,
    projectName,
    buildingId,
    buildingName,
    floorNumber,
    entryPoint,
    breadcrumbs,
    setProject,
    setBuilding,
    setFloor,
    setEntryPoint,
    clearContext,
    $reset,
    getBackRoute,
  }
})
