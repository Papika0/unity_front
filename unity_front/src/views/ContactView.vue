<script setup lang="ts">
import { useContactForm } from './contact/composables'
import {
  ContactHero,
  ContactFormSection,
  ContactInfoSection,
  ContactMap,
  ContactFaq,
  ContactCta,
} from './contact/components'

const {
  t,
  contactInfo,
  socialLinks,
  mapCoordinates,
  formSubjects,
  faqs,
  officeDays,
  form,
  scrollProgress,
  isSubmitting,
  isSubmitted,
  openFaq,
  mapLoaded,
  isDropdownOpen,
  isValidPhone,
  selectedSubject,
  validateForm,
  vueTelInputProps,
  toggleDropdown,
  selectSubject,
  closeDropdown,
  handlePhoneInput,
  toggleFaq,
  submitForm,
  scrollToForm,
} = useContactForm()
</script>

<template>
  <div class="contact-page">
    <!-- Hero Section with Scroll Progress -->
    <ContactHero
      :scrollProgress="scrollProgress"
      :t="t"
    />

    <!-- Main Content Section -->
    <section id="contact-form" class="py-24 lg:py-32 bg-white">
      <div class="container mx-auto px-6 lg:px-12 xl:px-20">
        <div class="grid grid-cols-1 xl:grid-cols-5 gap-16 xl:gap-20">
          <!-- Contact Form -->
          <ContactFormSection
            :form="form"
            :formSubjects="formSubjects"
            :selectedSubject="selectedSubject"
            :isDropdownOpen="isDropdownOpen"
            :isValidPhone="isValidPhone"
            :isSubmitting="isSubmitting"
            :isSubmitted="isSubmitted"
            :validateForm="validateForm"
            :vueTelInputProps="vueTelInputProps"
            :t="t"
            @toggleDropdown="toggleDropdown"
            @closeDropdown="closeDropdown"
            @selectSubject="selectSubject"
            @handlePhoneInput="handlePhoneInput"
            @submitForm="submitForm"
            @update:form="Object.assign(form, $event)"
          />

          <!-- Contact Information -->
          <ContactInfoSection
            :contactInfo="contactInfo"
            :socialLinks="socialLinks"
            :officeDays="officeDays"
            :t="t"
          />
        </div>
      </div>
    </section>

    <!-- Map Section -->
    <ContactMap
      :mapLoaded="mapLoaded"
      :mapCoordinates="mapCoordinates"
      :contactInfo="contactInfo"
      :t="t"
    />

    <!-- FAQ Section -->
    <ContactFaq
      :faqs="faqs"
      :openFaq="openFaq"
      :t="t"
      @toggleFaq="toggleFaq"
    />

    <!-- CTA Section -->
    <ContactCta
      :t="t"
      @scrollToForm="scrollToForm"
    />
  </div>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f4f4f5;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #ffcd4b, #ebb738);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #ebb738, #c89116);
}

/* Text selection */
::selection {
  background-color: rgba(255, 205, 75, 0.3);
  color: inherit;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}
</style>
