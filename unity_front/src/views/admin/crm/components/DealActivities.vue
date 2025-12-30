<script setup lang="ts">
/**
 * Deal Activities Component (Refactored)
 * Displays timeline of deal activities and form to add new ones.
 * Features premium timeline styling.
 */

import { ref, computed, onMounted } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import { useCrmStore } from '@/stores/admin/crm'
import { useToastStore } from '@/stores/ui/toast'
import type { ActivityType } from '@/types/crm'
import {
  FileText,
  Phone,
  Mail,
  Users,
  RefreshCw,
  CreditCard,
  Settings,
  Pin,
  MessageSquare,
  Send
} from 'lucide-vue-next'

// Props
interface Props {
  dealId: number
}

const props = defineProps<Props>()

// Composables
const { t } = useTranslations()
const { formatDate: formatDt } = useLocaleFormatter()

// Stores
const crmStore = useCrmStore()
const toast = useToastStore()

// State
const isLoadingActivities = ref(false)
const newActivityType = ref<ActivityType>('note')
const newActivityContent = ref('')
const isSubmitting = ref(false)

// Fetch activities on mount
onMounted(() => {
  if (props.dealId) {
    crmStore.fetchActivities(props.dealId)
  }
})

// Activities
const activities = computed(() => crmStore.dealActivities)

// Format date time
function formatDateTime(dateStr: string): string {
  return formatDt(dateStr, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get activity icon
function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'note': return FileText
    case 'call': return Phone
    case 'email': return Mail
    case 'meeting': return Users
    case 'status_change': return RefreshCw
    case 'payment': return CreditCard
    case 'system': return Settings
    default: return Pin
  }
}

// Get activity type label
function getActivityTypeLabel(type: ActivityType): string {
  switch (type) {
    case 'note': return t('admin.crm.activity.types.note')
    case 'call': return t('admin.crm.activity.types.call')
    case 'email': return t('admin.crm.activity.types.email')
    case 'meeting': return t('admin.crm.activity.types.meeting')
    case 'status_change': return t('admin.crm.activity.types.status_change')
    case 'payment': return t('admin.crm.activity.types.payment')
    case 'system': return t('admin.crm.activity.types.system')
    default: return type
  }
}

// Get styles for activity type
function getActivityStyles(type: ActivityType) {
  switch (type) {
    case 'note': return 'bg-amber-100 text-amber-600 border-amber-200'
    case 'call': return 'bg-emerald-100 text-emerald-600 border-emerald-200'
    case 'email': return 'bg-blue-100 text-blue-600 border-blue-200'
    case 'meeting': return 'bg-purple-100 text-purple-600 border-purple-200'
    case 'status_change': return 'bg-gray-100 text-gray-600 border-gray-200'
    case 'payment': return 'bg-green-100 text-green-600 border-green-200'
    case 'system': return 'bg-slate-100 text-slate-500 border-slate-200'
    default: return 'bg-gray-100 text-gray-500 border-gray-200'
  }
}

// Handle submit
async function handleSubmit() {
  if (!newActivityContent.value.trim()) return

  isSubmitting.value = true
  try {
    await crmStore.createActivity({
      deal_id: props.dealId,
      type: newActivityType.value,
      content: newActivityContent.value,
    })
    newActivityContent.value = ''
    toast.success(t('admin.crm.messages.activity_added'))
  } catch (error) {
    console.error('Failed to add activity:', error)
    toast.error(t('admin.crm.messages.activity_add_failed'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- New Activity Input -->
    <div class="bg-gray-50/50 rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-400 focus-within:shadow-lg">
      <div class="p-2 border-b border-gray-200/50 flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          v-for="type in ['note', 'call', 'email', 'meeting'] as const"
          :key="type"
          type="button"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
          :class="newActivityType === type 
            ? 'bg-white text-blue-700 shadow-sm ring-1 ring-gray-200' 
            : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-700'"
          @click="newActivityType = type"
        >
          <component 
            :is="getActivityIcon(type)" 
            class="w-3.5 h-3.5"
            :class="newActivityType === type ? 'text-blue-500' : 'text-gray-400'"
          />
          {{ getActivityTypeLabel(type) }}
        </button>
      </div>
      
      <div class="p-4 relative">
        <textarea
          v-model="newActivityContent"
          rows="3"
          class="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 resize-none text-sm p-0 mb-8"
          :placeholder="t('admin.crm.activity.description_placeholder')"
        ></textarea>
        
        <div class="absolute bottom-3 right-3">
           <button
             @click="handleSubmit"
             :disabled="!newActivityContent.trim() || isSubmitting"
             class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
             :title="t('admin.crm.actions.save')"
           >
             <Send v-if="!isSubmitting" class="w-3.5 h-3.5" />
             <div v-else class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
           </button>
        </div>
      </div>
    </div>

    <!-- Timeline List -->
    <div class="relative pl-3 space-y-0">
       <!-- Vertical Line -->
       <div class="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-gray-200 via-gray-200 to-transparent" v-if="activities.length > 0"></div>

       <div v-if="isLoadingActivities" class="flex justify-center py-10">
         <div class="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
       </div>

       <div v-else-if="activities.length > 0" class="space-y-6">
         <div 
            v-for="(activity, index) in activities" 
            :key="activity.id" 
            class="relative pl-14 group animate-in slide-in-from-left-2 duration-300"
            :style="{ animationDelay: `${index * 50}ms` }"
         >
            <!-- Timeline Dot -->
            <div 
               class="absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center z-10 shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md"
               :class="getActivityStyles(activity.type).replace('text-', 'text-').replace('border-', 'ring-1 ring-').replace('bg-', 'bg-')"
            >
               <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
            </div>
            
            <!-- Feed Item -->
            <div class="pt-1.5">
               <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2">
                     <span class="text-sm font-bold text-gray-900">{{ getActivityTypeLabel(activity.type) }}</span>
                     <span v-if="activity.user" class="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                        {{ activity.user.name }}
                     </span>
                  </div>
                  <time class="text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">{{ formatDateTime(activity.created_at) }}</time>
               </div>
               
               <div class="text-sm text-gray-600 leading-relaxed bg-white rounded-lg p-3 border border-gray-100 shadow-sm group-hover:border-gray-200 group-hover:shadow-md transition-all">
                 <p class="whitespace-pre-wrap">{{ activity.content }}</p>
               </div>
            </div>
         </div>
       </div>

       <!-- Empty State -->
       <div v-else class="text-center py-12">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3 text-gray-400">
            <MessageSquare class="w-6 h-6" />
          </div>
          <h3 class="text-sm font-semibold text-gray-900">{{ t('admin.crm.activity.no_activities') }}</h3>
          <p class="text-xs text-gray-500 mt-1">{{ t('admin.crm.activity.add_first') }}</p>
       </div>
    </div>

  </div>
</template>
