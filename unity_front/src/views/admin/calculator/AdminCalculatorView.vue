<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header with Language Switcher -->
    <div class="bg-gradient-to-r from-amber-500/90 to-yellow-500/90 rounded-3xl p-8 mb-8 shadow-xl">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-light text-white">{{ t('title') }}</h1>
          <p class="text-white/80 mt-2">{{ t('subtitle') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button v-if="authStore.isAdmin" @click="showProjectSettingsModal = true" class="px-4 py-2 bg-white text-amber-600 rounded-xl font-medium hover:bg-amber-50 transition-all shadow-lg flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="hidden sm:inline">{{ t('projectSettings') }}</span>
          </button>
          <div class="flex gap-2">
            <button v-for="lang in (['ka', 'en', 'ru'] as const)" :key="lang" @click="currentLang = lang" :class="['px-4 py-2 rounded-xl font-medium transition-all', currentLang === lang ? 'bg-white text-amber-600 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30']">
              {{ langLabels[lang] }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="calculatorStore.loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="calculatorStore.error" class="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
      <p class="text-red-600">{{ calculatorStore.error }}</p>
      <button @click="calculatorStore.initialize()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">{{ t('retry') }}</button>
    </div>

    <!-- Main Content -->
    <template v-else>
      <FormCard :title="t('projectSelection')" variant="amber">
        <ProjectSelector :projects="calculatorStore.activeProjects" :selectedProject="calculatorStore.selectedProject" :usesCustomPrice="calculatorStore.usesCustomPrice" :customPrice="calculatorStore.customBasePrice" :currentLang="currentLang" @update:selectedProject="calculatorStore.selectProject" @update:usesCustomPrice="val => (calculatorStore.usesCustomPrice = val)" @update:customPrice="calculatorStore.setCustomBasePrice" />
      </FormCard>

      <FormCard :title="t('apartmentDetails')" variant="amber" class="mt-6">
        <ApartmentDetailsInput :area="calculatorStore.apartmentArea" :basePrice="calculatorStore.basePrice" :baseTotal="calculatorStore.baseTotal" :currentLang="currentLang" @update:area="calculatorStore.setArea" />
      </FormCard>

      <FormCard :title="t('paymentAlternatives')" variant="amber" class="mt-6">
        <PaymentAlternativesTabs :project="calculatorStore.selectedProject" :basePrice="calculatorStore.basePrice" :area="calculatorStore.apartmentArea" :currentLang="currentLang" @calculate="handleCalculation" @calculateBank="handleBankCalculation" />
      </FormCard>

      <!-- Results Card -->
      <transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 transform scale-95" enter-to-class="opacity-100 transform scale-100" leave-active-class="transition-all duration-300" leave-from-class="opacity-100 transform scale-100" leave-to-class="opacity-0 transform scale-95">
        <FormCard :title="t('results')" variant="amber" class="mt-6 calculator-print-area" v-if="currentResult">
          <CalculationResults v-if="calculatorStore.calculationResult" :result="calculatorStore.calculationResult" :currentLang="currentLang" />
          <div v-else-if="calculatorStore.bankLoanResult" class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-10 border-3 border-indigo-300 shadow-2xl">
            <div class="text-center mb-8">
              <p class="text-slate-600 text-sm uppercase tracking-wider mb-3 font-medium">{{ t('monthsAndPayment') }}</p>
              <p class="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{{ calculatorStore.loanTermYears * 12 }} {{ calculatorStore.loanTermYears * 12 === 1 ? t('month') : t('months') }}</p>
              <div class="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-base font-medium shadow-lg">${{ calculatorStore.bankLoanResult.monthlyPayment.toLocaleString() }} / {{ t('perMonth') }}</div>
            </div>
          </div>
        </FormCard>
      </transition>

      <!-- Payment Schedule Card -->
      <transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 transform scale-95" enter-to-class="opacity-100 transform scale-100" leave-active-class="transition-all duration-300" leave-from-class="opacity-100 transform scale-100" leave-to-class="opacity-0 transform scale-95">
        <FormCard :title="t('schedule')" variant="amber" class="mt-6" v-if="hasSchedule">
          <PaymentScheduleTable v-if="calculatorStore.calculationResult?.paymentSchedule" :schedule="calculatorStore.calculationResult.paymentSchedule" :isBankSchedule="false" :currentLang="currentLang" />
          <PaymentScheduleTable v-else-if="calculatorStore.bankLoanResult?.paymentSchedule" :schedule="calculatorStore.bankLoanResult.paymentSchedule" :isBankSchedule="true" :currentLang="currentLang" />
        </FormCard>
      </transition>

      <!-- Actions -->
      <transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 transform translate-y-4" enter-to-class="opacity-100 transform translate-y-0">
        <div class="flex justify-end gap-4 mt-8" v-if="currentResult">
          <button @click="calculatorStore.$reset()" class="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all font-medium flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {{ t('reset') }}
          </button>
          <button @click="handlePrint()" class="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all font-medium flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            {{ t('print') }}
          </button>
          <button @click="handleExportPDF()" class="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl font-medium transform hover:scale-105 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {{ t('exportPDF') }}
          </button>
        </div>
      </transition>
    </template>

    <!-- Project Settings Modal -->
    <ProjectSettingsModal v-model="showProjectSettingsModal" :projects="calculatorStore.activeProjects" :current-lang="currentLang" @saved="handleProjectSettingsSaved" />
  </div>
</template>

<script setup lang="ts">
import FormCard from '@/components/admin/forms/FormCard.vue'
import ProjectSelector from './components/inputs/ProjectSelector.vue'
import ApartmentDetailsInput from './components/inputs/ApartmentDetailsInput.vue'
import PaymentAlternativesTabs from './components/results/PaymentAlternativesTabs.vue'
import CalculationResults from './components/results/CalculationResults.vue'
import PaymentScheduleTable from './components/results/PaymentScheduleTable.vue'
import ProjectSettingsModal from './components/modals/ProjectSettingsModal.vue'
import { useCalculatorView } from './composables'

const {
  calculatorStore,
  authStore,
  showProjectSettingsModal,
  currentLang,
  langLabels,
  currentResult,
  hasSchedule,
  t,
  handleProjectSettingsSaved,
  handleCalculation,
  handleBankCalculation,
  handleExportPDF,
  handlePrint,
} = useCalculatorView()
</script>
