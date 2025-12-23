import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  NavigationLevel,
  NavigationResponse,
  ApartmentDetail,
  FloorZone,
  ZoneImage,
} from '@/types/apartments'
import { apartmentNavigationApi } from '@/services/apartmentNavigationApi'

export const useApartmentNavigationStore = defineStore('apartmentNavigation', () => {
  // ==================== STATE ====================
  const currentLevel = ref<NavigationLevel | null>(null)
  const currentProjectId = ref<number | null>(null)
  const currentBuildingId = ref<number | null>(null)
  const currentFloorNumber = ref<number | null>(null)
  const navigationData = ref<NavigationResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedApartment = ref<ApartmentDetail | null>(null)
  const minFloor = ref<number | null>(null)
  const maxFloor = ref<number | null>(null)
  const imageLoading = ref(false)

  // Cache for navigation data to prevent unnecessary refetches
  const navigationCache = new Map<string, { data: NavigationResponse; timestamp: number }>()
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Image preloading cache
  const preloadedImages = new Set<string>()

  // ==================== GETTERS ====================
  const hasMultipleBuildings = computed(() => {
    return navigationData.value?.has_multiple_buildings ?? false
  })

  const currentZones = computed(() => {
    if (!navigationData.value) return []

    if (currentLevel.value === 'floor') {
      return navigationData.value.apartments ?? []
    }

    return navigationData.value.zones ?? []
  })

  const currentImage = computed((): ZoneImage | null => {
    return navigationData.value?.image ?? null
  })

  const buildingIdentifier = computed((): string | null => {
    return navigationData.value?.building?.identifier ?? null
  })

  const buildingName = computed((): string | null => {
    return navigationData.value?.building?.name ?? null
  })

  const projectTitle = computed((): string | null => {
    return navigationData.value?.project?.title ?? null
  })

  // ==================== HELPER FUNCTIONS ====================
  function getCacheKey(
    projectId: number,
    level: NavigationLevel,
    buildingId?: number,
    floorNumber?: number,
  ): string {
    return `${projectId}-${level}-${buildingId || 'null'}-${floorNumber || 'null'}`
  }

  function getCachedData(cacheKey: string): NavigationResponse | null {
    const cached = navigationCache.get(cacheKey)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION
    if (isExpired) {
      navigationCache.delete(cacheKey)
      return null
    }

    return cached.data
  }

  function setCachedData(cacheKey: string, data: NavigationResponse) {
    navigationCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    })
  }

  function preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (preloadedImages.has(url)) {
        resolve()
        return
      }

      const img = new Image()
      img.onload = () => {
        preloadedImages.add(url)
        resolve()
      }
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${url}`))
      }
      img.src = url
    })
  }

  // ==================== ACTIONS ====================
  async function loadNavigation(
    projectId: number,
    level: NavigationLevel,
    buildingId?: number,
    floorNumber?: number,
  ) {
    const cacheKey = getCacheKey(projectId, level, buildingId, floorNumber)

    // Check cache first
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      // Important: Set loading to false immediately for cached data
      isLoading.value = false

      navigationData.value = cachedData
      currentLevel.value = level
      currentProjectId.value = projectId
      currentBuildingId.value = buildingId ?? null
      currentFloorNumber.value = floorNumber ?? null

      // Preload image in background if not already loaded
      if (cachedData.image?.url && !preloadedImages.has(cachedData.image.url)) {
        preloadImage(cachedData.image.url).catch(console.error)
      }

      return
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await apartmentNavigationApi.fetchNavigationData(
        projectId,
        level,
        buildingId,
        floorNumber,
      )

      // Cache the data
      setCachedData(cacheKey, data)

      // If we loaded building data, cache the min/max floors
      if (level === 'building' && data.zones) {
        const floorZones = data.zones.filter(z => z.type === 'floor_strip') as FloorZone[]
        if (floorZones.length > 0) {
          const numbers = floorZones.map(z => z.floor_number)
          minFloor.value = Math.min(...numbers)
          maxFloor.value = Math.max(...numbers)
        }
      }

      navigationData.value = data
      currentLevel.value = level
      currentProjectId.value = projectId
      currentBuildingId.value = buildingId ?? null
      currentFloorNumber.value = floorNumber ?? null

      // Preload the image in background
      if (data.image?.url) {
        preloadImage(data.image.url).catch(console.error)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load navigation data'
      console.error('Failed to load navigation:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadApartmentDetail(apartmentId: number) {
    isLoading.value = true
    error.value = null

    try {
      const data = await apartmentNavigationApi.fetchApartmentDetail(apartmentId)
      selectedApartment.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load apartment details'
      console.error('Failed to load apartment detail:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function navigateToLevel(
    level: NavigationLevel,
    buildingId?: number,
    floorNumber?: number,
  ) {
    if (!currentProjectId.value) {
      throw new Error('No project ID set')
    }

    await loadNavigation(currentProjectId.value, level, buildingId, floorNumber)
  }

  // ==================== RESET ====================
  function $reset() {
    currentLevel.value = null
    currentProjectId.value = null
    currentBuildingId.value = null
    currentFloorNumber.value = null
    navigationData.value = null
    isLoading.value = false
    error.value = null
    selectedApartment.value = null
    minFloor.value = null
    maxFloor.value = null
  }

  return {
    // State
    currentLevel,
    currentProjectId,
    currentBuildingId,
    currentFloorNumber,
    navigationData,
    isLoading,
    imageLoading,
    error,
    selectedApartment,
    minFloor,
    maxFloor,
    // Getters
    hasMultipleBuildings,
    currentZones,
    currentImage,
    buildingIdentifier,
    buildingName,
    projectTitle,
    // Actions
    loadNavigation,
    loadApartmentDetail,
    navigateToLevel,
    preloadImage,
    $reset,
  }
})
