<template>
  <div class="bg-white overflow-hidden shadow rounded-lg border-l-4" :class="`border-${color}-500`">
    <div class="p-4 sm:p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div :class="`p-3 rounded-md bg-${color}-100`">
            <component :is="iconComponent" :class="`h-5 w-5 sm:h-6 sm:w-6 text-${color}-600`" />
          </div>
        </div>
        <div class="ml-4 sm:ml-5 w-0 flex-1">
          <dl>
            <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">{{ title }}</dt>
            <dd class="text-base sm:text-lg font-semibold text-gray-900">{{ value }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Home,
  Lock,
  Check,
  AlertTriangle
} from 'lucide-vue-next'

interface Props {
  title: string
  value: string | number
  icon: string
  color: string
}

const props = defineProps<Props>()

const iconMap: Record<string, any> = {
  'dollar-sign': DollarSign,
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'trending-up': TrendingUp,
  'home': Home,
  'lock': Lock,
  'check': Check,
  'alert-triangle': AlertTriangle,
}

const iconComponent = computed(() => iconMap[props.icon] || AlertCircle)
</script>
