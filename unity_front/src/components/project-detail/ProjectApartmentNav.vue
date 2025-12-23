<template>
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-light text-zinc-900 mb-4">
          {{ t('projects.explore_apartments') }}
        </h2>
        <div class="w-20 h-0.5 bg-[#FFCD4B] mx-auto"></div>
      </div>

      <!-- Building Selector and Inline Apartment Viewer -->
      <Transition name="fade-slide" mode="out-in">
        <BuildingSelector
          v-if="!selectedBuilding"
          :key="buildingSelectorKey"
          :project-id="projectId"
          :auto-navigate="false"
          @building-selected="$emit('buildingSelected', $event)"
        />

        <InlineApartmentViewer
          v-else
          :key="'viewer'"
          :project-id="projectId"
          :selected-building="selectedBuilding"
          @building-deselected="$emit('buildingDeselected')"
          @floor-selected="$emit('floorSelected', $event)"
          @floor-deselected="$emit('floorDeselected')"
          class="mt-8"
        />
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import BuildingSelector from '@/components/apartments/BuildingSelector.vue'
import InlineApartmentViewer from '@/components/apartments/InlineApartmentViewer.vue'
import type { BuildingZone, FloorZone } from '@/types/apartments'

const { t } = useTranslations()

const props = defineProps<{
  projectId: number
  selectedBuilding: BuildingZone | null
}>()

defineEmits<{
  (e: 'buildingSelected', building: BuildingZone): void
  (e: 'buildingDeselected'): void
  (e: 'floorSelected', floor: FloorZone): void
  (e: 'floorDeselected'): void
}>()

const buildingSelectorKey = computed(() => {
  return `building-selector-${props.selectedBuilding ? props.selectedBuilding.id : 'none'}`
})
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
