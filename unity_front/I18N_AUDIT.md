# Internationalization (i18n) Audit Report

**Generated:** December 20, 2025

---

## Summary

### Files with Hardcoded Text
| Category | Vue Files | TS Files | Total Lines |
|----------|-----------|----------|-------------|
| Admin Views | 82 | - | ~1,100+ |
| Admin Components | 37 | - | ~400+ |
| Composables/Stores | - | 44 | ~500+ |
| **Total** | **119** | **44** | **~2,000+** |

---

## Current I18n Structure

### Existing Translation Files
- `src/locales/ka.json` - Georgian (5KB, ~95 lines)
- `src/locales/en.json` - English (3KB)
- `src/locales/ru.json` - Russian (4KB)

### Existing Admin Translations
The `ka.json` file has an `admin` section with:
- `admin.sidebar.*` - Sidebar navigation labels
- `admin.topbar.*` - Top bar labels
- `admin.common.*` - Common actions (save, cancel, delete, etc.)

---

## Hardcoded Text Categories

### 1. Admin Views (82 files)
**Locations:**
- `views/admin/projects/` - 8 files
- `views/admin/news/` - 9 files
- `views/admin/zones/` - 12 files
- `views/admin/calculator/` - 7 files
- `views/admin/features/` - 5 files
- `views/admin/customers/` - 5 files
- `views/admin/marketing-emails/` - 4 files
- `views/admin/buildings/` - 2 files
- `views/admin/gallery/` - 4 files
- `views/admin/apartments/` - 3 files
- `views/admin/users/` - 4 files
- `views/admin/bank-rates/` - 3 files
- `views/admin/translations/` - 1 file
- `views/admin/about/` - 1 file
- `views/admin/contact-info/` - 1 file
- `views/admin/auth/` - 1 file
- `views/admin/layout/` - 3 files

**Common Text Patterns:**
```
უკან პროექტებზე - "Back to projects"
რედაქტირება - "Edit"  
ხელახლა ცდა - "Retry"
პროექტის ჩატვირთვის შეცდომა - "Error loading project"
შენახვა - "Save"
წაშლა - "Delete"
გაუქმება - "Cancel"
მონაცემების ჩატვირთვა - "Loading data"
```

### 2. Admin Components (37 files)
**Locations:**
- `components/admin/contact-settings/` - 6 files
- `components/admin/news/news-form/` - 5 files
- `components/admin/gallery/` - 4 files
- `components/admin/polygon-editor/` - 3 files
- `components/admin/forms/` - 3 files
- `components/admin/ui/` - 3 files
- `components/admin/translations/` - 2 files
- `components/admin/projects/` - 1 file
- Other - 10 files

### 3. TypeScript Files (44 files)
**Locations:**
- `composables/` - 15 files
- `views/admin/*/composables/` - 12 files
- `stores/admin/` - 4 files
- `utils/` - 4 files
- Other - 9 files

**Common Patterns:**
- Error messages
- Toast notifications
- Validation messages
- PDF/export text
- Alert/confirm dialogs

---

## Recommended Translation Keys Structure

```json
{
  "admin": {
    "common": {
      "back_to": "უკან {to}-ზე",
      "edit": "რედაქტირება",
      "save": "შენახვა",
      "save_changes": "ცვლილებების შენახვა",
      "saving": "შენახვა...",
      "delete": "წაშლა",
      "cancel": "გაუქმება",
      "confirm": "დადასტურება",
      "loading": "იტვირთება...",
      "retry": "ხელახლა ცდა",
      "search": "ძებნა",
      "filter": "ფილტრი",
      "create": "შექმნა",
      "add": "დამატება",
      "actions": "მოქმედებები",
      "status": "სტატუსი",
      "active": "აქტიური",
      "inactive": "არააქტიური",
      "featured": "რჩეული",
      "select_all": "ყველას მონიშვნა",
      "deselect_all": "მონიშნულის გაუქმება"
    },
    "errors": {
      "loading_failed": "{item}-ის ჩატვირთვა ვერ მოხერხდა",
      "save_failed": "შენახვა ვერ მოხერხდა",
      "delete_failed": "წაშლა ვერ მოხერხდა",
      "not_found": "{item} ვერ მოიძებნა",
      "unknown_error": "უცნობი შეცდომა"
    },
    "messages": {
      "save_success": "წარმატებით შეინახა",
      "delete_success": "წარმატებით წაიშალა",
      "confirm_delete": "დარწმუნებული ხართ, რომ გსურთ წაშლა?"
    },
    "projects": {
      "title": "პროექტები",
      "add_project": "ახალი პროექტის დამატება",
      "edit_project": "პროექტის რედაქტირება",
      "project_details": "პროექტის დეტალები",
      "back_to_projects": "უკან პროექტებზე",
      "back_to_details": "უკან დეტალებზე"
    },
    "news": {
      "title": "სიახლეები",
      "add_article": "სტატიის დამატება",
      "edit_article": "სტატიის რედაქტირება"
    },
    "gallery": {
      "title": "გალერეა",
      "upload_image": "სურათის ატვირთვა",
      "edit_image": "სურათის რედაქტირება"
    },
    "zones": {
      "building_block": "შენობის ბლოკი",
      "floor_strip": "სართულების ზოლი",
      "apartment": "ბინა"
    },
    "form": {
      "required": "აუცილებელი ველი",
      "title_ka": "სახელი ქართულად",
      "title_en": "სახელი ინგლისურად",
      "title_ru": "სახელი რუსულად",
      "description_ka": "აღწერა ქართულად",
      "description_en": "აღწერა ინგლისურად",
      "description_ru": "აღწერა რუსულად"
    }
  }
}
```

---

## Priority Files to Fix

### High Priority (Most Used)
1. `views/admin/projects/DetailView.vue`
2. `views/admin/projects/AddView.vue`
3. `views/admin/projects/EditView.vue`
4. `views/admin/news/ListView.vue`
5. `components/admin/projects/ProjectForm.vue`
6. `views/admin/AdminDashboardView.vue`
7. `views/admin/layout/AdminSidebar.vue`

### Medium Priority
- Zone editor components (12 files)
- Calculator components (7 files)
- Customer views (5 files)
- Gallery components (4 files)

### Low Priority
- Utility/helper text in composables
- Rarely seen error messages
- PDF export text

---

## Implementation Steps

1. **Extend Translation Files**
   - Add `admin.*` sections to all 3 locale files
   - Create translation keys for all common patterns

2. **Update Components**
   - Import `useTranslations` composable
   - Replace hardcoded text with `t('admin.xxx')` calls

3. **Update TypeScript Files**
   - Import translation function
   - Replace alert/toast messages

4. **Testing**
   - Test language switching in admin panel
   - Verify all text updates correctly

---

## Estimated Effort

| Task | Files | Est. Time |
|------|-------|-----------|
| Translation key setup | 3 JSON files | 1 hour |
| Admin views modification | 82 files | 4-6 hours |
| Admin components | 37 files | 2-3 hours |
| TypeScript files | 44 files | 2-3 hours |
| Testing & QA | - | 1-2 hours |
| **Total** | **163 files** | **10-15 hours** |

---

## Notes

- Public-facing views already use `t()` translations properly
- Admin area is the main focus for i18n work
- Consider batch processing similar files together
- Many strings are repeated - can use shared keys
