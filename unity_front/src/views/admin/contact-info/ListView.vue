<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div class="container mx-auto px-6 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1
              class="text-4xl font-light bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 tracking-tight"
            >
              კონტაქტის პარამეტრები
            </h1>
            <p class="text-slate-600 text-lg font-light">
              მართეთ საკონტაქტო ინფორმაცია და პარამეტრები
            </p>
          </div>
        </div>
      </div>

      <!-- Integrated Contact Settings Form -->
      <div class="max-w-6xl mx-auto">
        <ContactSettingsForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContactSettingsForm from '@/components/admin/ContactSettingsForm.vue'
</script>
