<template>
  <div class="bg-white overflow-hidden shadow-sm hover:shadow-md rounded-xl border transition-all duration-200"
       :class="`border-l-4 border-${color}-500`">
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div :class="`p-3 rounded-xl bg-gradient-to-br from-${color}-100 to-${color}-50`">
            <component :is="iconComponent" :class="`h-6 w-6 text-${color}-600`" />
          </div>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">{{ title }}</dt>
            <dd class="text-xl font-bold text-gray-900 mt-1">{{ value }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
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

const iconMap: Record<string, Component> = {
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
