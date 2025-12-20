# Folder Reorganization Plan

**Created:** December 20, 2025
**Status:** Planning Phase
**Priority:** High - Architectural Improvement

---

## Executive Summary

After analyzing the codebase against the excellent pattern established in `src/views/admin/zones/`, we identified **20 major folder structure issues** affecting maintainability and scalability.

**Goal:** Reorganize all views and components to follow the zones pattern:
- Main view files: <200 lines (orchestrators)
- `/components/` subdirectory for all view-specific components
- `/composables/` subdirectory for business logic
- Barrel exports (`index.ts`) in all subdirectories

**Current State:** ~60% compliance
**Target State:** 100% compliance

---

## Reference Pattern (Gold Standard)

```
src/views/admin/zones/
├── ApartmentEditor.vue          # 190 lines ✅
├── BuildingBlockEditor.vue      # 172 lines ✅
├── FloorStripEditor.vue         # 181 lines ✅
├── components/                  # 14 sub-components ✅
│   ├── ApartmentEditorImageModal.vue
│   ├── ApartmentEditorPdfModal.vue
│   ├── ApartmentEditorSidebar.vue
│   ├── ApartmentEditorToolbar.vue
│   ├── BuildingBlockEditorImageModal.vue
│   ├── BuildingBlockEditorSidebar.vue
│   ├── BuildingBlockEditorToolbar.vue
│   ├── FloorStripEditorImageModal.vue
│   ├── FloorStripEditorSidebar.vue
│   ├── FloorStripEditorToolbar.vue
│   ├── FloorStripEditorWizard.vue
│   └── index.ts
└── composables/                 # 3 custom hooks ✅
    ├── useApartmentEditor.ts    # 25KB
    ├── useBuildingBlockEditor.ts # 14KB
    ├── useFloorStripEditor.ts   # 18KB
    └── index.ts
```

**Key Principles:**
1. View files are thin orchestrators (<200 lines)
2. All view-specific components in `/components` subdirectory
3. All business logic in `/composables` subdirectory
4. Clear separation of concerns
5. Barrel exports for clean imports

---

## Phase 1: Critical Admin Views (Week 1)

### 1.1 Admin Features View ⚠️ CRITICAL

**Current Issues:**
- 4 large view files (1,470 total lines)
- No organization structure
- EditView.vue is 507 lines
- AddView.vue is 408 lines

**Current Structure:**
```
src/views/admin/features/
├── AddView.vue           # 408 lines ❌
├── AssignToProject.vue   # 267 lines ❌
├── EditView.vue          # 507 lines ❌ VERY LARGE
└── ListView.vue          # 288 lines ❌
```

**Target Structure:**
```
src/views/admin/features/
├── AddView.vue           # ~150 lines
├── EditView.vue          # ~150 lines
├── AssignToProject.vue   # ~120 lines
├── ListView.vue          # ~150 lines
├── components/
│   ├── form/
│   │   ├── FeatureFormCard.vue
│   │   ├── FeatureBasicInfo.vue
│   │   ├── FeatureLanguageFields.vue
│   │   ├── FeatureValidation.vue
│   │   └── index.ts
│   ├── list/
│   │   ├── FeaturesListHeader.vue
│   │   ├── FeaturesListTable.vue
│   │   ├── FeaturesListFilters.vue
│   │   ├── FeatureCard.vue
│   │   └── index.ts
│   └── index.ts
└── composables/
    ├── useFeatureForm.ts
    ├── useFeatureList.ts
    ├── useFeatureAssignment.ts
    └── index.ts
```

**Migration Steps:**
1. Create `/components` and `/composables` directories
2. Extract form sections from EditView.vue and AddView.vue
3. Extract list components from ListView.vue
4. Create composables for form logic, list management, and assignment
5. Update view files to use new components and composables
6. Create barrel exports
7. Test all functionality

**Estimated Time:** 1 day

---

### 1.2 Admin Projects View ⚠️ CRITICAL

**Current Issues:**
- 4 large view files (1,447 total lines)
- ListView.vue is massive (582 lines)
- DetailView.vue is 342 lines
- Related ProjectForm.vue is 326 lines in wrong location

**Current Structure:**
```
src/views/admin/projects/
├── AddView.vue           # 281 lines ❌
├── DetailView.vue        # 342 lines ❌
├── EditView.vue          # 242 lines ❌
└── ListView.vue          # 582 lines ❌ VERY LARGE

src/components/admin/projects/
└── ProjectForm.vue       # 326 lines ❌ WRONG LOCATION
```

**Target Structure:**
```
src/views/admin/projects/
├── AddView.vue           # ~150 lines
├── EditView.vue          # ~140 lines
├── DetailView.vue        # ~160 lines
├── ListView.vue          # ~180 lines
├── components/
│   ├── form/
│   │   ├── ProjectForm.vue          # Move from /components/admin/
│   │   ├── ProjectFormBasicInfo.vue
│   │   ├── ProjectFormMedia.vue
│   │   ├── ProjectFormSEO.vue
│   │   ├── ProjectFormApartments.vue
│   │   ├── ProjectFormLanguageFields.vue
│   │   └── index.ts
│   ├── list/
│   │   ├── ProjectsListHeader.vue
│   │   ├── ProjectsListFilters.vue
│   │   ├── ProjectsListTable.vue
│   │   ├── ProjectsListPagination.vue
│   │   ├── ProjectCard.vue
│   │   └── index.ts
│   ├── detail/
│   │   ├── ProjectDetailHero.vue
│   │   ├── ProjectDetailContent.vue
│   │   ├── ProjectDetailGallery.vue
│   │   ├── ProjectDetailApartments.vue
│   │   └── index.ts
│   └── index.ts
└── composables/
    ├── useProjectForm.ts
    ├── useProjectList.ts
    ├── useProjectDetail.ts
    └── index.ts
```

**Migration Steps:**
1. Create directory structure
2. Move ProjectForm.vue from `/components/admin/projects/` to view components
3. Split ProjectForm.vue into sub-components
4. Extract list components from ListView.vue
5. Extract detail components from DetailView.vue
6. Create composables for business logic
7. Update all view files
8. Update imports throughout codebase
9. Create barrel exports
10. Test thoroughly

**Estimated Time:** 1.5 days

---

### 1.3 Admin Users View ⚠️ CRITICAL

**Current Issues:**
- Single monolithic 435-line file
- No component organization
- No composables

**Current Structure:**
```
src/views/admin/users/
└── AdminUsersView.vue    # 435 lines ❌ MONOLITHIC
```

**Target Structure:**
```
src/views/admin/users/
├── ListView.vue          # ~140 lines
├── components/
│   ├── UsersTable.vue
│   ├── UsersFilters.vue
│   ├── UsersHeader.vue
│   ├── UsersStatistics.vue
│   ├── modals/
│   │   ├── UserCreateModal.vue
│   │   ├── UserEditModal.vue
│   │   ├── UserDeleteModal.vue
│   │   └── index.ts
│   ├── form/
│   │   ├── UserFormFields.vue
│   │   ├── UserRoleSelector.vue
│   │   └── index.ts
│   └── index.ts
└── composables/
    ├── useUsersList.ts
    ├── useUserForm.ts
    ├── useUserCrud.ts
    └── index.ts
```

**Migration Steps:**
1. Create directory structure
2. Extract table component
3. Extract filter components
4. Extract modal components
5. Create form field components
6. Create composables for list management and CRUD operations
7. Refactor main view to use new structure
8. Create barrel exports
9. Test all CRUD operations

**Estimated Time:** 1 day

---

### 1.4 Admin Marketing Emails View ⚠️ CRITICAL

**Current Issues:**
- Single monolithic 440-line file
- Duplicate patterns with other list views

**Current Structure:**
```
src/views/admin/marketing-emails/
└── AdminMarketingEmailsView.vue  # 440 lines ❌ MONOLITHIC
```

**Target Structure:**
```
src/views/admin/marketing-emails/
├── ListView.vue          # ~140 lines
├── components/
│   ├── EmailsTable.vue
│   ├── EmailsFilters.vue
│   ├── EmailsHeader.vue
│   ├── EmailsStatistics.vue
│   ├── EmailStatusBadge.vue
│   ├── modals/
│   │   ├── EmailFormModal.vue
│   │   ├── EmailDeleteModal.vue
│   │   ├── EmailPreviewModal.vue
│   │   └── index.ts
│   ├── form/
│   │   ├── EmailFormFields.vue
│   │   ├── EmailRecipients.vue
│   │   └── index.ts
│   └── index.ts
└── composables/
    ├── useEmailsList.ts
    ├── useEmailForm.ts
    ├── useEmailSending.ts
    └── index.ts
```

**Migration Steps:**
1. Create directory structure
2. Extract table and list components
3. Extract modal components
4. Create form components
5. Create composables for email management
6. Refactor main view
7. Create barrel exports
8. Test email functionality

**Estimated Time:** 1 day

---

## Phase 2: Moderate Admin Views (Week 2)

### 2.1 Admin Apartments View ⚠️ MODERATE

**Current Issues:**
- Has `/components` but missing `/composables`
- ListView.vue is 487 lines (too large)
- Form modal is 430 lines
- Import modal is 321 lines

**Current Structure:**
```
src/views/admin/apartments/
├── ListView.vue                  # 487 lines ❌
├── components/
│   ├── ApartmentFormModal.vue    # 430 lines ❌
│   ├── ApartmentImportModal.vue  # 321 lines ❌
│   └── index.ts
└── (NO composables directory) ❌
```

**Target Structure:**
```
src/views/admin/apartments/
├── ListView.vue          # ~160 lines
├── components/
│   ├── list/
│   │   ├── ApartmentsListHeader.vue
│   │   ├── ApartmentsListFilters.vue
│   │   ├── ApartmentsListTable.vue
│   │   ├── ApartmentsListPagination.vue
│   │   └── index.ts
│   ├── modals/
│   │   ├── ApartmentFormModal.vue      # ~250 lines
│   │   ├── ApartmentImportModal.vue    # ~250 lines
│   │   └── index.ts
│   ├── form/
│   │   ├── ApartmentFormBasic.vue
│   │   ├── ApartmentFormDetails.vue
│   │   ├── ApartmentFormPricing.vue
│   │   └── index.ts
│   └── index.ts
└── composables/
    ├── useApartmentsList.ts
    ├── useApartmentForm.ts
    ├── useApartmentImport.ts
    └── index.ts
```

**Migration Steps:**
1. Create `/composables` directory
2. Extract list components from ListView.vue
3. Split ApartmentFormModal.vue into sub-components
4. Split ApartmentImportModal.vue into sub-components
5. Create composables for list management, form logic, and import
6. Refactor ListView.vue
7. Update barrel exports
8. Test all functionality

**Estimated Time:** 1 day

---

### 2.2 Admin Buildings View ⚠️ MODERATE

**Current Structure:**
```
src/views/admin/buildings/
├── ListView.vue          # 337 lines ❌
├── components/
│   ├── BuildingFormModal.vue
│   └── index.ts
└── (NO composables directory) ❌
```

**Target Structure:**
```
src/views/admin/buildings/
├── ListView.vue          # ~150 lines
├── components/
│   ├── list/
│   │   ├── BuildingsListHeader.vue
│   │   ├── BuildingsListFilters.vue
│   │   ├── BuildingsListTable.vue
│   │   ├── BuildingsListPagination.vue
│   │   └── index.ts
│   ├── BuildingFormModal.vue  # ~200 lines
│   └── index.ts
└── composables/
    ├── useBuildingsList.ts
    ├── useBuildingForm.ts
    └── index.ts
```

**Estimated Time:** 0.5 days

---

### 2.3 Admin Calculator View ⚠️ MODERATE

**Current Issues:**
- Has `/components` but missing `/composables`
- ProjectSettingsModal.vue is 659 lines (VERY LARGE)
- BankCalculator.vue is 472 lines
- AlternativeCalculator.vue is 472 lines

**Current Structure:**
```
src/views/admin/calculator/
├── AdminCalculatorView.vue       # 396 lines ❌
├── components/
│   ├── ProjectSelector.vue
│   ├── ProjectSettingsModal.vue  # 659 lines ❌ VERY LARGE
│   ├── BankCalculator.vue        # 472 lines ❌
│   ├── AlternativeCalculator.vue # 472 lines ❌
│   ├── ApartmentDetailsInput.vue # 360+ lines ❌
│   ├── CalculationResults.vue
│   ├── PaymentScheduleTable.vue
│   └── PaymentAlternativesTabs.vue
└── (NO composables directory) ❌
```

**Target Structure:**
```
src/views/admin/calculator/
├── AdminCalculatorView.vue  # ~150 lines
├── components/
│   ├── ProjectSelector.vue
│   ├── settings/
│   │   ├── ProjectSettingsModal.vue     # ~250 lines
│   │   ├── ProjectSettingsBasic.vue
│   │   ├── ProjectSettingsAdvanced.vue
│   │   └── index.ts
│   ├── bank-calculator/
│   │   ├── BankCalculator.vue           # ~180 lines
│   │   ├── BankCalculatorForm.vue
│   │   ├── CalculationResults.vue
│   │   ├── PaymentScheduleTable.vue
│   │   └── index.ts
│   ├── alternative/
│   │   ├── AlternativeCalculator.vue    # ~180 lines
│   │   ├── PaymentAlternativesTabs.vue
│   │   └── index.ts
│   ├── ApartmentDetailsInput.vue        # ~200 lines
│   └── index.ts
└── composables/
    ├── useBankCalculator.ts
    ├── useAlternativeCalculator.ts
    ├── useProjectSettings.ts
    ├── useApartmentDetails.ts
    └── index.ts
```

**Estimated Time:** 1.5 days

---

### 2.4 Admin Bank Rates View

**Current Structure:**
```
src/views/admin/bank-rates/
├── AdminBankRatesView.vue  # 271 lines ❌
├── components/
│   ├── BankRateFormModal.vue
│   └── index.ts
└── (NO composables directory) ❌
```

**Target Structure:**
```
src/views/admin/bank-rates/
├── ListView.vue          # ~150 lines
├── components/
│   ├── BankRatesHeader.vue
│   ├── BankRatesTable.vue
│   ├── BankRateFormModal.vue  # ~180 lines
│   ├── BankRateDeleteModal.vue
│   └── index.ts
└── composables/
    ├── useBankRatesList.ts
    ├── useBankRateForm.ts
    └── index.ts
```

**Estimated Time:** 0.5 days

---

### 2.5 Admin Translations View

**Current Structure:**
```
src/views/admin/translations/
└── ListView.vue          # 464 lines ❌

src/components/admin/translations/
├── TranslationModal.vue  # 475 lines ❌ WRONG LOCATION
└── TranslationTable.vue
```

**Target Structure:**
```
src/views/admin/translations/
├── ListView.vue          # ~140 lines
├── components/
│   ├── TranslationsHeader.vue
│   ├── TranslationsTable.vue        # Move from /components/admin/
│   ├── TranslationsFilters.vue
│   ├── TranslationModal.vue         # Move from /components/admin/
│   ├── TranslationFormFields.vue
│   └── index.ts
└── composables/
    ├── useTranslationsList.ts
    ├── useTranslationForm.ts
    └── index.ts
```

**Estimated Time:** 0.75 days

---

### 2.6 Admin Contact Info View

**Current Structure:**
```
src/views/admin/contact-info/
└── ListView.vue          # Minimal

src/components/admin/
├── ContactInfoForm.vue   # 208 lines - WRONG LOCATION
├── ContactSettingsForm.vue  # 338 lines - WRONG LOCATION
└── contact-settings/
    ├── ContactInfoTab.vue
    ├── SocialLinksTab.vue
    ├── OfficeDaysTab.vue
    ├── MapSettingsTab.vue
    ├── FaqsTab.vue
    ├── FormSubjectsTab.vue
    └── index.ts
```

**Target Structure:**
```
src/views/admin/contact-info/
├── ListView.vue          # ~140 lines
├── SettingsView.vue      # ~150 lines
├── components/
│   ├── ContactInfoEditModal.vue
│   ├── ContactInfoForm.vue       # Move from /components/admin/
│   ├── settings/
│   │   ├── ContactSettingsForm.vue  # Move from /components/admin/
│   │   ├── ContactInfoTab.vue       # Move from /components/admin/contact-settings/
│   │   ├── SocialLinksTab.vue       # Move
│   │   ├── OfficeDaysTab.vue        # Move
│   │   ├── MapSettingsTab.vue       # Move
│   │   ├── FaqsTab.vue              # Move
│   │   ├── FormSubjectsTab.vue      # Move
│   │   └── index.ts
│   └── index.ts
└── composables/
    ├── useContactInfo.ts
    ├── useContactForm.ts
    ├── useContactSettings.ts
    └── index.ts
```

**Estimated Time:** 1 day

---

### 2.7 Admin About View

**Current Structure:**
```
src/views/admin/about/
└── SettingsView.vue      # 290 lines ❌
```

**Target Structure:**
```
src/views/admin/about/
├── SettingsView.vue      # ~150 lines
├── components/
│   ├── AboutBasicInfo.vue
│   ├── AboutImages.vue
│   ├── AboutDescription.vue
│   ├── AboutSEO.vue
│   ├── AboutLanguageFields.vue
│   └── index.ts
└── composables/
    ├── useAboutSettings.ts
    └── index.ts
```

**Estimated Time:** 0.5 days

---

### 2.8 Admin Auth View

**Current Structure:**
```
src/views/admin/auth/
└── LoginView.vue
```

**Target Structure:**
```
src/views/admin/auth/
├── LoginView.vue         # ~80 lines
├── components/
│   ├── LoginForm.vue
│   ├── LoginCredentials.vue
│   ├── LoginHeader.vue
│   └── index.ts
└── composables/
    ├── useAuthLogin.ts
    └── index.ts
```

**Estimated Time:** 0.25 days

---

## Phase 3: Public Views (Week 3)

### 3.1 Public Contact View ⚠️ CRITICAL

**Current Issues:**
- Largest file in codebase: 1,075 lines
- Everything in one monolithic file

**Current Structure:**
```
src/views/
└── ContactView.vue       # 1,075 lines ❌ LARGEST FILE
```

**Target Structure:**
```
src/views/contact/
├── index.vue             # ~140 lines
├── components/
│   ├── ContactHero.vue
│   ├── ContactForm.vue
│   ├── ContactInfo.vue
│   ├── ContactMap.vue
│   ├── ContactFAQ.vue
│   ├── ContactOfficeDays.vue
│   └── index.ts
└── composables/
    ├── useContactForm.ts
    ├── useContactInfo.ts
    └── index.ts
```

**Estimated Time:** 1 day

---

### 3.2 Public News View ⚠️ CRITICAL

**Current Structure:**
```
src/views/
├── NewsView.vue          # 738 lines ❌
└── NewsDetailView.vue    # 609 lines ❌
```

**Target Structure:**
```
src/views/news/
├── index.vue             # ~140 lines
├── DetailView.vue        # ~160 lines
├── components/
│   ├── NewsHero.vue
│   ├── NewsList.vue
│   ├── NewsCard.vue
│   ├── NewsFilters.vue
│   ├── NewsPagination.vue
│   ├── NewsDetail.vue
│   ├── NewsDetailHero.vue
│   ├── NewsDetailContent.vue
│   ├── NewsDetailRelated.vue
│   └── index.ts
└── composables/
    ├── useNewsList.ts
    ├── useNewsDetail.ts
    ├── useNewsFilters.ts
    └── index.ts
```

**Estimated Time:** 1 day

---

### 3.3 Public Gallery View ⚠️ CRITICAL

**Current Structure:**
```
src/views/
└── GalleryView.vue       # 676 lines ❌
```

**Target Structure:**
```
src/views/gallery/
├── index.vue             # ~140 lines
├── components/
│   ├── GalleryHero.vue
│   ├── GalleryGrid.vue
│   ├── GalleryCard.vue
│   ├── GalleryFilters.vue
│   ├── GalleryLightbox.vue
│   └── index.ts
└── composables/
    ├── useGallery.ts
    ├── useGalleryFilters.ts
    └── index.ts
```

**Estimated Time:** 0.75 days

---

### 3.4 Public About View ⚠️ CRITICAL

**Current Structure:**
```
src/views/
└── AboutView.vue         # 644 lines ❌
```

**Target Structure:**
```
src/views/about/
├── index.vue             # ~140 lines
├── components/
│   ├── AboutHero.vue
│   ├── AboutStory.vue
│   ├── AboutMission.vue
│   ├── AboutValues.vue
│   ├── AboutTeam.vue
│   └── index.ts
└── composables/
    ├── useAbout.ts
    └── index.ts
```

**Estimated Time:** 0.75 days

---

### 3.5 Public Projects View

**Current Structure:**
```
src/views/
├── ProjectsView.vue      # 522 lines ❌
└── ProjectDetailView.vue # 297 lines (acceptable)
```

**Target Structure:**
```
src/views/projects/
├── index.vue             # ~140 lines
├── DetailView.vue        # ~160 lines
├── components/
│   ├── ProjectsHero.vue
│   ├── ProjectsList.vue
│   ├── ProjectsGrid.vue
│   ├── ProjectCard.vue
│   ├── ProjectsFilters.vue
│   └── index.ts
└── composables/
    ├── useProjectsList.ts
    ├── useProjectsFilters.ts
    └── index.ts
```

**Estimated Time:** 0.75 days

---

## Phase 4: Root Components (Week 4)

### 4.1 App Header Component

**Current Structure:**
```
src/components/
└── AppHeader.vue         # 353 lines ❌
```

**Target Structure:**
```
src/components/header/
├── AppHeader.vue         # ~120 lines
├── HeaderDesktopNav.vue
├── HeaderMobileMenu.vue
├── HeaderLogo.vue
├── HeaderActions.vue
├── HeaderLanguageSwitch.vue
└── index.ts
```

**Estimated Time:** 0.5 days

---

### 4.2 Home Components

**Current Issues:**
- ProjectsSection.vue is 218 lines

**Current Structure:**
```
src/components/home/
├── AboutSection.vue      # 103 lines ✅
├── FeaturedProject.vue   # 162 lines ✅
├── HeroSection.vue       # 104 lines ✅
├── NewsSection.vue       # 113 lines ✅
├── ProjectsSection.vue   # 218 lines ❌
├── hero/                 # ✅ Good organization
│   ├── HeroContent.vue
│   ├── HeroNavigation.vue
│   ├── HeroSlide.vue
│   └── index.ts
└── index.ts
```

**Target Structure:**
```
src/components/home/
├── AboutSection.vue
├── FeaturedProject.vue
├── HeroSection.vue
├── NewsSection.vue
├── hero/
│   └── ... (keep as is)
├── projects-section/
│   ├── ProjectsSection.vue    # ~80 lines
│   ├── ProjectsHeader.vue
│   ├── ProjectsGrid.vue
│   ├── ProjectCard.vue
│   ├── ProjectFilters.vue
│   └── index.ts
└── index.ts
```

**Estimated Time:** 0.5 days

---

### 4.3 Project Detail Components

**Current Issues:**
- ProjectHero.vue is 179 lines

**Current Structure:**
```
src/components/project-detail/
├── ProjectApartmentNav.vue   # 80 lines ✅
├── ProjectCTA.vue            # 65 lines ✅
├── ProjectDescription.vue    # 65 lines ✅
├── ProjectDetailsCard.vue    # 80 lines ✅
├── ProjectFeatures.vue       # 81 lines ✅
├── ProjectGallery.vue        # 112 lines ✅
├── ProjectGalleryModal.vue   # 95 lines ✅
├── ProjectHero.vue           # 179 lines ❌
├── ProjectRelated.vue        # 104 lines ✅
└── index.ts
```

**Target Structure:**
```
src/components/project-detail/
├── hero/
│   ├── ProjectHero.vue       # ~100 lines
│   ├── HeroContent.vue
│   ├── HeroImage.vue
│   ├── HeroBadges.vue
│   └── index.ts
├── gallery/
│   ├── ProjectGallery.vue    # ~80 lines
│   ├── ProjectGalleryModal.vue
│   └── index.ts
├── ProjectApartmentNav.vue
├── ProjectCTA.vue
├── ProjectDescription.vue
├── ProjectDetailsCard.vue
├── ProjectFeatures.vue
├── ProjectRelated.vue
└── index.ts
```

**Estimated Time:** 0.5 days

---

### 4.4 Apartments Components

**Current Issues:**
- InlineApartmentViewer.vue is 337 lines

**Current Structure:**
```
src/components/apartments/
├── ApartmentGrid.vue         # 237 lines ❌
├── BuildingSelector.vue      # 155 lines ✅
├── FloorSelector.vue         # 173 lines ✅
├── InlineApartmentViewer.vue # 337 lines ❌ VERY LARGE
├── InteractiveMapViewer.vue  # 201 lines ❌
├── MapTooltip.vue            # 76 lines ✅
└── index.ts
```

**Target Structure:**
```
src/components/apartments/
├── ApartmentGrid.vue         # ~180 lines
├── viewer/
│   ├── InlineApartmentViewer.vue  # ~140 lines
│   ├── ApartmentCard.vue
│   ├── ApartmentDetails.vue
│   ├── ApartmentImage.vue
│   └── index.ts
├── selectors/
│   ├── BuildingSelector.vue       # ~150 lines
│   ├── FloorSelector.vue          # ~150 lines
│   └── index.ts
├── map/
│   ├── InteractiveMapViewer.vue   # ~180 lines
│   ├── MapTooltip.vue
│   └── index.ts
└── index.ts
```

**Estimated Time:** 0.75 days

---

### 4.5 Admin Gallery Components

**Current Issues:**
- Large modals scattered in `/components/admin/gallery/`

**Current Structure:**
```
src/components/admin/gallery/
├── ImageUploadModal.vue      # 520 lines ❌ VERY LARGE
├── ImageEditModal.vue        # 356 lines ❌
├── ImageViewModal.vue        # 323 lines ❌
├── ImageGalleryModal.vue     # 298 lines ❌
└── index.ts
```

**Target Structure:**
```
src/views/admin/gallery/components/
├── upload/
│   ├── ImageUploadModal.vue      # ~200 lines
│   ├── ImageUploadForm.vue
│   ├── ImagePreview.vue
│   ├── ImageMetadata.vue
│   └── index.ts
├── edit/
│   ├── ImageEditModal.vue        # ~180 lines
│   ├── ImageEditForm.vue
│   ├── ImageEditPreview.vue
│   └── index.ts
├── view/
│   ├── ImageViewModal.vue        # ~150 lines
│   ├── ImageInfo.vue
│   └── index.ts
├── ImageGalleryModal.vue
└── index.ts
```

**Estimated Time:** 1 day

---

### 4.6 Admin News Components

**Current Structure:**
```
src/components/admin/news/
├── NewsForm.vue              # 313 lines ❌
└── index.ts

src/views/admin/news/components/
├── NewsFeaturedModal.vue     # 476 lines ❌ VERY LARGE
├── NewsDeleteModal.vue
├── ... (other components)
```

**Target Structure:**
```
src/views/admin/news/components/
├── form/
│   ├── NewsForm.vue          # ~180 lines (move from /components/admin/)
│   ├── NewsFormBasicInfo.vue
│   ├── NewsFormDetails.vue
│   ├── NewsFormMedia.vue
│   ├── NewsFormSEO.vue
│   ├── NewsFormTags.vue
│   ├── FieldError.vue
│   └── index.ts
├── modals/
│   ├── NewsFeaturedModal.vue # ~200 lines
│   ├── NewsDeleteModal.vue
│   └── index.ts
├── list/
│   ├── NewsListHeader.vue
│   ├── NewsListFilters.vue
│   ├── NewsGrid.vue
│   ├── NewsCard.vue
│   ├── NewsPagination.vue
│   ├── NewsEmptyState.vue
│   └── index.ts
└── index.ts
```

**Estimated Time:** 0.75 days

---

## Implementation Strategy

### Approach

**Option A: Big Bang Migration**
- Migrate entire codebase in one effort
- Pros: Consistency immediately achieved
- Cons: High risk, lengthy testing period, blocks other work
- Not recommended

**Option B: Incremental Migration (Recommended)**
- Migrate view-by-view, category-by-category
- Pros: Lower risk, continuous integration, testable in chunks
- Cons: Temporary inconsistency during migration
- **Recommended approach**

### Migration Process Per View

1. **Create Structure**
   - Create `/components` directory
   - Create `/composables` directory
   - Create `index.ts` barrel exports

2. **Extract Components**
   - Identify sections in main view
   - Create component files
   - Move template code
   - Define props/emits interfaces

3. **Extract Composables**
   - Identify business logic
   - Create composable files
   - Move script logic
   - Define clear APIs

4. **Update Main View**
   - Import new components
   - Import new composables
   - Remove extracted code
   - Verify <200 lines

5. **Update Barrel Exports**
   - Export all components
   - Export all composables
   - Test imports

6. **Test Functionality**
   - Manual testing
   - Verify all features work
   - Check for regressions

7. **Update Imports**
   - Find all files importing affected components
   - Update import paths
   - Test affected areas

8. **Commit**
   - Create logical commit
   - Follow commit message convention

### Commit Message Convention

```bash
refactor(views/admin/[view-name]): organize into components/composables structure

- Extract [X] components from main view
- Create [Y] composables for business logic
- Reduce main view from [A] to [B] lines
- Add barrel exports

Follows zones/ pattern for consistency
```

---

## Testing Checklist

For each migrated view, verify:

- [ ] Main view file is <200 lines
- [ ] All functionality works as before
- [ ] No console errors
- [ ] All routes accessible
- [ ] All forms submit correctly
- [ ] All modals open/close
- [ ] All API calls work
- [ ] Barrel exports work
- [ ] TypeScript compiles without errors
- [ ] No breaking changes for consumers

---

## Risk Mitigation

### Risks

1. **Import Path Changes**
   - Risk: Breaking imports in multiple files
   - Mitigation: Use Find All References before moving files

2. **Component Dependencies**
   - Risk: Circular dependencies
   - Mitigation: Review import graph, use dependency injection

3. **Props/Emits Interface Changes**
   - Risk: Breaking parent components
   - Mitigation: Keep interfaces backward compatible initially

4. **Lost Functionality**
   - Risk: Missing logic during extraction
   - Mitigation: Thorough testing checklist per view

5. **Git Conflicts**
   - Risk: Conflicts with ongoing work
   - Mitigation: Coordinate with team, migrate per phase

### Rollback Plan

For each migration:
1. Create feature branch: `refactor/[view-name]-structure`
2. Keep original files until testing complete
3. Can revert entire branch if critical issues found
4. Document known issues before merge

---

## Success Metrics

### Quantitative Metrics

- **Component Size Compliance:** 100% of views <200 lines
- **Organization Coverage:** 100% of views have `/components` and `/composables`
- **Average View Size:** Target <150 lines
- **Code Reusability:** Increase shared component count by 30%

### Qualitative Metrics

- **Developer Experience:** Easier to find relevant code
- **Maintainability:** Smaller, focused files
- **Testability:** Isolated components easier to test
- **Consistency:** All views follow same pattern

---

## Timeline Summary

| Phase | Duration | Views | Effort |
|-------|----------|-------|--------|
| Phase 1: Critical Admin | Week 1 | 4 views | 5 days |
| Phase 2: Moderate Admin | Week 2 | 8 views | 5 days |
| Phase 3: Public Views | Week 3 | 5 views | 4 days |
| Phase 4: Root Components | Week 4 | 6 areas | 4 days |
| **Total** | **4 weeks** | **23 items** | **18 days** |

**Note:** Timeline assumes 1 developer full-time. Can be parallelized with multiple developers.

---

## Next Steps

1. **Get Approval:** Review plan with team
2. **Prioritize:** Confirm phase order
3. **Assign:** Determine who works on what
4. **Schedule:** Set target dates for each phase
5. **Communicate:** Notify team of upcoming changes
6. **Start Phase 1:** Begin with critical admin views

---

**Document Version:** 1.0.0
**Created:** December 20, 2025
**Author:** Claude Code Assistant
**Status:** Awaiting Approval
