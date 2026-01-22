# Doctor Notes Application Structure Analysis

**Date:** 2025-01-27  
**Purpose:** Comprehensive analysis of the Doctor Notes feature to understand current architecture, identify bottlenecks, and propose refactor strategy.

---

## 1. Backend Project Structure

### 1.1 Folder Structure

```
anubha-backend/src/modules/
├── admin/
│   ├── admin.controller.ts          # DoctorNotes CRUD logic (saveDoctorNotes, getDoctorNotes)
│   ├── admin.routes.ts              # Express routes for DoctorNotes APIs
│   ├── admin-appointment.controller.ts
│   ├── admin-profile.controller.ts
│   ├── admin-user.controller.ts
│   └── ... (other admin controllers)
├── appointment/
├── auth/
├── patient/
├── payment/
└── ... (other modules)
```

**Pattern:** Module-based architecture with route/controller pairs. Each module is self-contained.

### 1.2 API Registration

**Express Router Pattern:**
- Routes are defined in `admin.routes.ts` using `Express.Router()`
- Routes are registered in `app.ts`:
  ```typescript
  app.use("/api/admin", adminRoutes);
  ```
- Middleware chain: `attachUser` → `requireAuth` → `requireAdmin` → `multer` → `validateFileContentMiddleware` → `controller`

**Doctor Notes Endpoints:**
```
POST   /api/admin/doctor-notes
GET    /api/admin/doctor-notes/:appointmentId
PATCH  /api/admin/doctor-notes/:appointmentId
GET    /api/admin/doctor-notes/attachment/:attachmentId/view
GET    /api/admin/doctor-notes/attachment/:attachmentId/download
DELETE /api/admin/doctor-notes/attachment/:attachmentId
POST   /api/admin/doctor-notes/attachment/:attachmentId/send-email
```

### 1.3 Naming Conventions

- **Routes:** kebab-case (`/doctor-notes`)
- **Controllers:** camelCase (`saveDoctorNotes`, `getDoctorNotes`)
- **Files:** kebab-case (`admin.controller.ts`, `doctor-notes-api.ts`)
- **Database Models:** PascalCase (`DoctorNotes`, `DoctorNoteAttachment`)
- **Database Fields:** camelCase (`appointmentId`, `formData`, `isDraft`)

### 1.4 Where DoctorNotes is Created/Fetched/Updated

**Creation/Update (`saveDoctorNotes`):**
- **Location:** `admin.controller.ts` (lines ~850-1580)
- **Method:** `POST /api/admin/doctor-notes` (create) or `PATCH /api/admin/doctor-notes/:appointmentId` (update)
- **Logic:**
  1. Extract `appointmentId` and `formData` from request
  2. Handle file uploads (multer middleware → R2 upload)
  3. Parse `formData` JSON string
  4. For PATCH: Fetch existing `DoctorNotes`, deep merge with new data
  5. Upsert `DoctorNotes` record (Prisma `upsert`)
  6. Create/update `DoctorNoteAttachment` records for uploaded files
  7. Return success response

**Fetching (`getDoctorNotes`):**
- **Location:** `admin.controller.ts` (lines ~1760-1830)
- **Method:** `GET /api/admin/doctor-notes/:appointmentId`
- **Logic:**
  1. Validate `appointmentId`
  2. Fetch `DoctorNotes` with `include: { attachments: ... }`
  3. For legacy Cloudinary files: Generate signed URLs
  4. For R2 files: Return filePath (URL generation handled client-side or on-demand)
  5. Return `formData` JSON + attachments array

### 1.5 Architecture Pattern: Fat Controller

**Current State:** **Fat Controller Pattern**

- **Evidence:**
  - `admin.controller.ts` is ~2500 lines
  - `saveDoctorNotes` function is ~730 lines
  - Controller handles: validation, file upload logic, R2 upload orchestration, Prisma queries, deep merge logic, error handling
  - No service layer abstraction for DoctorNotes
  - Business logic mixed with HTTP handling

**Comparison with Other Modules:**
- Some modules (e.g., `auth`, `patient`) have service layers (`auth.service.ts`, `patient.service.ts`)
- DoctorNotes does **not** have a dedicated service file
- File upload logic (`uploadDoctorNoteFile`) is imported from a shared utility, but orchestration remains in controller

---

## 2. Database Layer

### 2.1 How DoctorNotes is Persisted

**Storage Strategy: Hybrid (JSON + Normalized)**

**JSON Storage (`formData` field):**
```prisma
formData Json?  // Stores entire form state as JSON
```
- **Contents:** All 10 sections stored as nested JSON object
- **Size:** Potentially large (estimated 10-50KB+ per record depending on data)
- **Structure:**
  ```typescript
  {
    personalInfo: { ... },
    foodRecall: { meals: [...] },
    weekendDiet: { ... },
    questionnaire: { answers: [...] },
    foodFrequency: { categories: [...] },
    healthProfile: { conditions: [...], ... },
    dietPrescribed: { ... },
    bodyMeasurements: { ... },
    prePostConsultationImages: { ... },
    notes: "..."
  }
  ```

**Normalized Tables:**
```prisma
model MealEntry {
  doctorNotesId String
  mealPeriod MealPeriod  // BREAKFAST, LUNCH, DINNER, SNACK
  foodItems Json          // Array of food items per meal
  // ... other fields
}

model FoodFrequencyItem {
  doctorNotesId String
  category String
  itemName String
  checked Boolean
  quantity String?
  frequency String?
  // ... other fields
}

model HealthCondition {
  doctorNotesId String
  conditionName String
  hasCondition String  // "Yes" | "No"
  notes String?
  // ... other fields
}

model QuestionnaireAnswer {
  doctorNotesId String
  questionKey String
  answer String?
  answerType String?
  otherValue String?
  // ... other fields
}

model DoctorNoteAttachment {
  doctorNotesId String
  fileName String
  filePath String        // R2 key or Cloudinary public ID
  fileUrl String?        // Optional, for backward compatibility
  mimeType String
  sizeInBytes Int
  provider StorageProvider
  fileCategory AttachmentCategory
  section String?
  // ... other fields
}
```

**Dual Storage for Body Measurements:**
- Stored in `formData.bodyMeasurements` (JSON)
- Also stored in `bodyMeasurements` field (JSON) at root level for queryability
- Backend keeps both in sync (mirrors `formData.bodyMeasurements`)

### 2.2 JSON vs Normalized Breakdown

| Data Type | Storage | Rationale |
|-----------|---------|-----------|
| Personal Info (Section 1) | JSON only | Simple key-value pairs, no querying needed |
| Food Recall (Section 2) | **Hybrid:** JSON + `MealEntry` table | `MealEntry` exists but appears unused (no queries found) |
| Weekend Diet (Section 3) | JSON only | Simple structure |
| Questionnaire (Section 4) | **Hybrid:** JSON + `QuestionnaireAnswer` table | `QuestionnaireAnswer` exists but appears unused |
| Food Frequency (Section 5) | **Hybrid:** JSON + `FoodFrequencyItem` table | `FoodFrequencyItem` exists but appears unused |
| Health Profile (Section 6) | **Hybrid:** JSON + `HealthCondition` table | `HealthCondition` exists but appears unused |
| Diet Prescribed (Section 7) | JSON only | PDFs stored separately in `DoctorNoteAttachment` |
| Body Measurements (Section 8) | **Dual JSON:** `formData.bodyMeasurements` + `bodyMeasurements` field | Mirrored for queryability |
| Pre/Post Images (Section 9) | JSON (metadata) + `DoctorNoteAttachment` (files) | Files normalized, metadata in JSON |
| Notes (Section 10) | JSON + optional `notes` field | Dual storage |

**Key Finding:** Normalized tables (`MealEntry`, `FoodFrequencyItem`, `HealthCondition`, `QuestionnaireAnswer`) are **created but appear unused**. No queries found that read from these tables. They exist in schema but logic always reads from `formData` JSON.

### 2.3 Read-Heavy vs Write-Heavy Models

**DoctorNotes:**
- **Write Pattern:** Single upsert per save (create or update entire record)
- **Read Pattern:** Single `findUnique` by `appointmentId` (one-to-one relationship)
- **Frequency:** Write-heavy during form editing (multiple saves per session), read-heavy in preview/view mode
- **Indexes:**
  ```prisma
  @@index([appointmentId])           // Primary lookup
  @@index([createdAt])                // Sorting
  @@index([formVersion])              // Version tracking
  @@index([isCompleted, submittedAt]) // Status queries
  @@index([isDraft])                  // Draft filtering
  @@index([isArchived, archivedAt])   // Soft delete
  @@index([createdBy])                // Admin filtering
  @@index([submittedAt])              // Submission sorting
  ```

**DoctorNoteAttachment:**
- **Write Pattern:** Multiple inserts per save (one per file)
- **Read Pattern:** Fetched via `include` when loading `DoctorNotes`
- **Frequency:** Write-heavy when uploading files, read-heavy when viewing notes
- **Indexes:**
  ```prisma
  @@index([doctorNotesId])            // Join optimization
  @@index([fileCategory])             // Filter by category
  @@index([section])                  // Filter by section
  @@index([provider])                 // Filter by storage provider
  @@index([isArchived])               // Soft delete
  ```

**Normalized Tables (MealEntry, FoodFrequencyItem, etc.):**
- **Write Pattern:** Unknown (no code found that writes to these)
- **Read Pattern:** Unknown (no code found that reads from these)
- **Status:** **UNUSED / ORPHANED TABLES**

### 2.4 Unused/Underused Relations

**Unused Relations:**
1. **`DoctorNotes.mealEntries`** → `MealEntry[]`
   - Table exists, indexed, but no queries found
   - Data stored in `formData.foodRecall` JSON instead

2. **`DoctorNotes.foodFrequencyItems`** → `FoodFrequencyItem[]`
   - Table exists, indexed, but no queries found
   - Data stored in `formData.foodFrequency` JSON instead

3. **`DoctorNotes.healthConditions`** → `HealthCondition[]`
   - Table exists, indexed, but no queries found
   - Data stored in `formData.healthProfile.conditions` JSON instead

4. **`DoctorNotes.questionnaireAnswers`** → `QuestionnaireAnswer[]`
   - Table exists, indexed, but no queries found
   - Data stored in `formData.questionnaire` JSON instead

**Underused Relations:**
- **`DoctorNotes.attachments`** → `DoctorNoteAttachment[]`
  - **Used:** Yes, fetched via `include` in `getDoctorNotes`
  - **Issue:** Files are read but metadata (e.g., section association) may not be fully utilized in queries

**Active Relations:**
- **`DoctorNotes.appointment`** → `Appointment` (one-to-one)
  - Used correctly, indexed, required

---

## 3. Frontend

### 3.1 How DoctorNotesForm is Mounted

**Entry Point:** `/admin/appointments/[id]/notes`

**Mount Flow:**
```
1. Page Component (`app/admin/appointments/[id]/notes/page.tsx`)
   ├── Fetches appointment details (`getAppointmentDetails`)
   ├── Fetches existing doctor notes (`getDoctorNotes`)
   └── Renders `<DoctorNotesProvider>` with `initialData`

2. DoctorNotesProvider (`app/context/DoctorNotesContext.tsx`)
   ├── Initializes form state from `initialData` or `localStorage`
   ├── Provides `formData`, `updateFormData`, `getFormValue` via Context
   └── Renders `<DoctorNotesForm>`

3. DoctorNotesForm (`components/doctor-notes/DoctorNotesForm.tsx`)
   ├── Consumes `DoctorNotesContext` via `useDoctorNotes()`
   ├── Renders 10 section components (PersonalInfo, FoodRecall, etc.)
   └── Handles save button click → calls `saveAllSections()`
```

**Key Files:**
- **Page:** `app/admin/appointments/[id]/notes/page.tsx`
- **Provider:** `app/context/DoctorNotesContext.tsx`
- **Form:** `components/doctor-notes/DoctorNotesForm.tsx`

### 3.2 Form State Management

**Pattern: Custom Context + useState (NOT react-hook-form)**

**Implementation:**
- **Context:** `DoctorNotesContext` (custom React Context)
- **State:** `useState<DoctorNotesFormData>` for entire form data
- **Updates:** `updateFormData(path: string[], value: any)` - deep updates nested paths
- **Auto-save:** Debounced (2 seconds) localStorage persistence
- **Draft Recovery:** Loads from `localStorage` on mount if available

**Why NOT react-hook-form?**
- Form has 10 complex sections
- Heavy nested structures
- File uploads mixed with form fields
- Custom update logic for deep paths
- Auto-save to localStorage required

**State Update Mechanism:**
```typescript
updateFormData(path: string[], value: any) {
  // Creates new object at each level to trigger re-render
  // Marks hasUnsavedChanges = true
  // Triggers debounced localStorage save
}
```

### 3.3 What Causes Rerenders and Lag

**Rerender Triggers:**
1. **Any form field change** → Updates entire `formData` object (new object reference)
   - All 10 section components receive new `formData` prop
   - Even with `React.memo`, if parent re-renders, children may re-render

2. **Context value changes** → All consumers re-render
   - `DoctorNotesContext` provides entire `formData` object
   - Single field change → new context value → all sections re-render

3. **localStorage auto-save** → State update for `lastSaved`, `isAutoSaving`
   - Minor, but adds to render cycle

4. **File uploads** → Updates `formData.dietPrescribed.dietChartFiles` array
   - Causes re-render of entire form

**Performance Issues:**
1. **Large formData object** (~10-50KB+)
   - Passed as prop to all sections
   - Deep cloning on every update (to maintain immutability)
   - JSON.stringify for localStorage (blocks main thread)

2. **Heavy sections** (especially FoodRecall, FoodFrequency):
   - Complex nested rendering (arrays of arrays)
   - Multiple `map()` calls
   - No virtualization for long lists

3. **No selective updates:**
   - Entire `formData` passed to each section
   - Sections can't subscribe to only their slice of data

4. **Accordion-style toggling recently added:**
   - Sections conditionally rendered (`{isOpen && <Section />}`)
   - Helps initial load, but doesn't prevent re-renders when open

### 3.4 Heavy Sections (Logic + DOM)

**Heavy Sections (Ranked):**

1. **Section 5: Food Frequency** ⚠️⚠️⚠️
   - **Logic:** Multiple categories (grains, vegetables, fruits, etc.), each with arrays of items
   - **DOM:** Hundreds of checkboxes, quantity inputs, frequency selects
   - **Rendering:** Multiple nested maps, conditional rendering
   - **Memoization:** ✅ Wrapped with `React.memo`, uses `useMemo`

2. **Section 2: Food Recall** ⚠️⚠️
   - **Logic:** 4 meals (Breakfast, Lunch, Dinner, Snacks), each with array of food items, water intake, medicines
   - **DOM:** Multiple input fields per meal, arrays of food items
   - **Rendering:** Nested loops, dynamic form fields
   - **Memoization:** ✅ Wrapped with `React.memo`, uses `useMemo`

3. **Section 6: Health Profile** ⚠️⚠️
   - **Logic:** Array of health conditions, medication details, family history
   - **DOM:** Condition checkboxes, medication inputs, nested fields
   - **Rendering:** Dynamic condition list, conditional fields
   - **Memoization:** ✅ Wrapped with `React.memo`, uses `useMemo`

4. **Section 7: Diet Prescribed** ⚠️
   - **Logic:** Date fields, file uploads (PDFs), code generation
   - **DOM:** Date pickers, file input, PDF preview cards
   - **Rendering:** File upload UI, PDF preview grid
   - **Memoization:** ✅ Wrapped with `React.memo`, uses `useMemo`

5. **Section 9: Pre/Post Images** ⚠️
   - **Logic:** Image upload, grid display
   - **DOM:** Image grid, upload buttons, delete buttons
   - **Rendering:** Image cards, modal previews
   - **Memoization:** ✅ Wrapped with `React.memo`, uses `useMemo`

**Lighter Sections:**
- Section 1: Personal Info (simple fields)
- Section 3: Weekend Diet (simple structure)
- Section 4: Questionnaire (moderate)
- Section 8: Body Measurements (many fields but simple)
- Section 10: Notes (single textarea)

### 3.5 Eager vs Lazy Data Saving

**Current Pattern: Manual Save (Lazy)**

**Save Triggers:**
1. **User clicks "Save Changes" or "Save as Draft"** → Calls `saveAllSections()`
2. **No auto-save to server** (only localStorage auto-save)

**`saveAllSections()` Implementation:**
- Sends **parallel** POST/PATCH requests for each section
- Uses `Promise.allSettled` for resilience
- Currently all sections use same endpoint (`admin/doctor-notes/:appointmentId`)
- Payload: Full `formData` object (even though `selectData` extracts section-specific data, backend receives full JSON via PATCH merge)

**Save Frequency:**
- **Per session:** 1-10 saves (user decides when to save)
- **Draft saves:** More frequent (user can save draft multiple times)
- **Final save:** Once (when marking as completed)

**Issues:**
- **Large payloads:** Even with `selectData`, backend receives full `formData` via PATCH deep merge
- **Network overhead:** Sending entire form state on every save
- **Race conditions:** Multiple saves in quick succession could cause conflicts
- **No incremental saves:** Always sends full form state

---

## 4. Current Problems (Bottlenecks)

### 4.1 Rendering Bottlenecks

**Problem 1: Context Re-renders**
- **Impact:** ⚠️⚠️⚠️ High
- **Cause:** Single `formData` object in Context, any change triggers re-render of all consumers
- **Evidence:** All 10 sections re-render on single field change (even with `React.memo`, parent re-render propagates)
- **Location:** `DoctorNotesContext.tsx`

**Problem 2: Heavy Section Rendering**
- **Impact:** ⚠️⚠️ Medium
- **Cause:** Food Frequency, Food Recall render hundreds of DOM nodes
- **Evidence:** Slow initial render, lag when scrolling through sections
- **Location:** `FoodFrequencySection.tsx`, `FoodRecallSection.tsx`

**Problem 3: Large FormData Prop Drilling**
- **Impact:** ⚠️⚠️ Medium
- **Cause:** Entire `formData` (~10-50KB+) passed to each section
- **Evidence:** Memory overhead, serialization cost for localStorage
- **Location:** All section components

**Problem 4: Deep Cloning on Updates**
- **Impact:** ⚠️⚠️ Medium
- **Cause:** `updateFormData` creates new objects at each nesting level
- **Evidence:** CPU spike on rapid form edits
- **Location:** `DoctorNotesContext.tsx` → `updateFormData`

### 4.2 State Update Bottlenecks

**Problem 5: JSON.stringify for localStorage**
- **Impact:** ⚠️⚠️ Medium
- **Cause:** Entire `formData` serialized every 2 seconds (debounced)
- **Evidence:** Blocks main thread during auto-save, noticeable lag
- **Location:** `DoctorNotesContext.tsx` → `saveToLocalStorage`

**Problem 6: No Selective Updates**
- **Impact:** ⚠️⚠️ Medium
- **Cause:** Can't update single section without triggering full form re-render
- **Evidence:** Typing in one field causes all sections to re-render
- **Location:** `DoctorNotesContext.tsx` → `updateFormData`

### 4.3 API Payload Size Bottlenecks

**Problem 7: Full FormData on Every Save**
- **Impact:** ⚠️⚠️⚠️ High
- **Cause:** Even though `saveAllSections()` extracts section data, PATCH endpoint deep merges with existing data, requiring full fetch + merge + write
- **Evidence:** Network payloads 10-50KB+ per save, backend reads entire existing record
- **Location:** `doctor-notes-sections-save.ts` → `saveAllSections`, `admin.controller.ts` → `saveDoctorNotes`

**Problem 8: Deep Merge Overhead**
- **Impact:** ⚠️⚠️ Medium
- **Cause:** Backend fetches existing `DoctorNotes`, deep merges with incoming partial data, writes entire new JSON
- **Evidence:** Database read + merge computation + write for every save
- **Location:** `admin.controller.ts` → `deepMerge` function

**Problem 9: No Incremental Updates**
- **Impact:** ⚠️⚠️ Medium
- **Cause:** Always sends full section data, even if only one field changed
- **Evidence:** Unnecessary network traffic
- **Location:** `doctor-notes-sections-save.ts` → `selectData`

### 4.4 Database Write Bottlenecks

**Problem 10: Full JSON Overwrite**
- **Impact:** ⚠️⚠️⚠️ High
- **Cause:** Every save writes entire `formData` JSON field (PostgreSQL JSONB update)
- **Evidence:** Large JSONB column updates, potential locking issues
- **Location:** `admin.controller.ts` → Prisma `upsert` → `formData: parsedFormData`

**Problem 11: Unused Normalized Tables**
- **Impact:** ⚠️ Low (wasted schema, but not blocking)
- **Cause:** `MealEntry`, `FoodFrequencyItem`, `HealthCondition`, `QuestionnaireAnswer` tables exist but never used
- **Evidence:** No queries found reading from these tables
- **Location:** Schema definition vs actual usage mismatch

**Problem 12: No Optimistic Updates**
- **Impact:** ⚠️ Low (UX, not performance)
- **Cause:** UI waits for server response before showing success
- **Evidence:** Save button disabled during save, user waits
- **Location:** `DoctorNotesForm.tsx` → `handleSave`

---

## 5. Proposed Solutions (Post-Analysis)

### 5.1 Refactor Strategy That Fits THIS App

**Recommended Approach: Incremental Optimization (Not Big Bang Refactor)**

**Phase 1: Frontend State Optimization (Low Risk, High Impact)**
- Split `DoctorNotesContext` into per-section contexts or use `useReducer` with selective subscriptions
- Replace full `formData` prop drilling with `useWatch`-like hooks that subscribe to specific paths
- Implement `useMemo` for expensive computations (already partially done)
- Add virtualization for long lists (Food Frequency, Food Recall)

**Phase 2: Backend Service Layer (Medium Risk, Medium Impact)**
- Extract `DoctorNotesService` from fat controller
- Move business logic (deep merge, validation) to service
- Keep controller thin (HTTP handling only)

**Phase 3: API Optimization (Medium Risk, High Impact)**
- Implement per-section endpoints (`PATCH /api/admin/doctor-notes/:appointmentId/sections/:sectionKey`)
- Use JSONB partial updates (PostgreSQL `jsonb_set`, `jsonb_insert`)
- Return only changed fields in response

**Phase 4: Database Optimization (High Risk, Low-Medium Impact)**
- **Decision point:** Keep JSON vs migrate to normalized
- **Recommendation:** Keep JSON for now (migration risk high, normalized tables unused)
- Add partial update indexes if needed

### 5.2 Section-Wise APIs: Yes, But Incremental

**Should section-wise APIs be implemented?** ✅ **YES**

**Benefits:**
- Smaller payloads (send only changed section)
- Parallel saves (already implemented in `saveAllSections`)
- Resilience (one section failure doesn't block others)
- Better caching (can cache sections independently)

**Implementation:**
```typescript
PATCH /api/admin/doctor-notes/:appointmentId/sections/personal-info
PATCH /api/admin/doctor-notes/:appointmentId/sections/food-recall
PATCH /api/admin/doctor-notes/:appointmentId/sections/food-frequency
// ... etc
```

**Backend Changes:**
- New route: `admin.routes.ts` → `PATCH /sections/:sectionKey`
- New controller: `updateSection(appointmentId, sectionKey, sectionData)`
- Use PostgreSQL JSONB operators for partial updates:
  ```sql
  UPDATE doctor_notes 
  SET form_data = jsonb_set(form_data, '{foodFrequency}', $1::jsonb)
  WHERE appointment_id = $2
  ```

**Migration Path:**
- Keep existing `PATCH /doctor-notes/:appointmentId` for backward compatibility
- Add new section endpoints incrementally
- Frontend gradually migrates sections to use new endpoints

### 5.3 JSON vs Normalized Storage: Keep JSON

**Should normalized tables be used?** ❌ **NO (For Now)**

**Rationale:**
1. **Normalized tables are unused** - No code reads from them, migration would require refactoring read paths
2. **JSON fits use case** - Doctor notes are document-like, rarely queried by nested fields
3. **PostgreSQL JSONB is performant** - Indexed, supports queries if needed later
4. **Migration risk high** - Would require:
   - Backfilling normalized tables from existing JSON
   - Updating all read/write paths
   - Handling data consistency (JSON + normalized)
   - Testing edge cases

**Future Consideration:**
- If querying by nested fields becomes critical (e.g., "find all patients with condition X"), consider adding computed columns or materialized views
- For now, JSONB indexes on commonly queried paths are sufficient

**Action Item:** Remove unused normalized tables? **NO** - Leave them for potential future use, but document that they're currently unused.

### 5.4 Autosave / Chunk-Save / Draft-Save: Implement Incremental Autosave

**Recommended: Incremental Autosave to Server**

**Current State:**
- ✅ Auto-save to localStorage (working)
- ❌ No auto-save to server (manual save only)

**Proposed:**
1. **Keep localStorage auto-save** (for offline resilience)
2. **Add server auto-save** (debounced, 5-10 seconds)
3. **Incremental saves** (only send changed sections)
4. **Optimistic updates** (mark as saved immediately, handle errors gracefully)

**Implementation:**
```typescript
// In DoctorNotesContext
useEffect(() => {
  if (!hasUnsavedChanges) return;
  
  const timer = setTimeout(() => {
    // Get changed sections since last save
    const changedSections = getChangedSections(formData, lastSavedFormData);
    
    // Save only changed sections
    saveChangedSections(changedSections);
  }, 5000); // 5 second debounce
  
  return () => clearTimeout(timer);
}, [hasUnsavedChanges]);
```

**Benefits:**
- Reduces data loss risk
- Better UX (user doesn't need to remember to save)
- Smaller network payloads (only changed sections)

**Challenges:**
- Need to track "last saved state" to compute diffs
- Handle conflicts (if user edits while auto-save in flight)
- Show auto-save status without being intrusive

---

## 6. Summary & Recommendations

### 6.1 Priority Fixes (Quick Wins)

1. **Split Context by Section** (Frontend)
   - Replace single `formData` Context with per-section contexts
   - **Impact:** Reduces re-renders from 10 sections to 1
   - **Effort:** Medium (2-3 days)

2. **Implement Section-Wise API Endpoints** (Backend)
   - Add `PATCH /sections/:sectionKey` endpoints
   - Use JSONB partial updates
   - **Impact:** Reduces payload size by 80-90%
   - **Effort:** Medium (3-5 days)

3. **Add Selective Subscriptions** (Frontend)
   - Use `useWatch`-like hooks to subscribe to specific paths
   - **Impact:** Prevents unnecessary re-renders
   - **Effort:** Low (1-2 days)

### 6.2 Medium-Term Improvements

4. **Extract Service Layer** (Backend)
   - Move business logic from controller to service
   - **Impact:** Better testability, maintainability
   - **Effort:** Medium (2-3 days)

5. **Incremental Autosave** (Frontend + Backend)
   - Auto-save changed sections to server
   - **Impact:** Better UX, reduces data loss
   - **Effort:** High (5-7 days)

6. **Virtualization for Heavy Sections** (Frontend)
   - Add `react-window` or `react-virtuoso` for long lists
   - **Impact:** Faster rendering of Food Frequency, Food Recall
   - **Effort:** Low-Medium (2-3 days)

### 6.3 Long-Term Considerations

7. **Database Migration** (If Needed)
   - Only if querying by nested fields becomes critical
   - **Impact:** Better query performance for specific use cases
   - **Effort:** Very High (2-3 weeks)

8. **Remove Unused Tables** (If Confirmed Unused)
   - Document and remove `MealEntry`, `FoodFrequencyItem`, etc. if confirmed unused
   - **Impact:** Cleaner schema
   - **Effort:** Low (1 day)

---

## 7. Open Questions

1. **Why do normalized tables exist if unused?**
   - Were they used previously and removed?
   - Planned for future use?
   - Need to check git history or ask team

2. **What is the typical `formData` size in production?**
   - Need to measure actual payload sizes
   - May affect optimization priorities

3. **How often are Doctor Notes edited after initial creation?**
   - If rarely edited, incremental autosave may not be necessary
   - If frequently edited, autosave is critical

4. **Are there analytics on save frequency?**
   - How many saves per session?
   - How many draft saves vs final saves?

---

**End of Analysis**
