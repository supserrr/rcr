# Component Update Priority Matrix

Prioritized list of components to update based on user impact and complexity.

## Priority Levels

- **P0 (Critical)**: Core user features, high visibility
- **P1 (High)**: Important features, frequent use
- **P2 (Medium)**: Secondary features, occasional use
- **P3 (Low)**: Admin/utility features, rare use

---

## P0: Critical (Do First)

### 1. Sessions Management
**Impact:** High - Core feature for all users
**Complexity:** Medium
**Dependencies:** None

- ✅ Patient Sessions Page
- 🔄 Counselor Sessions Page
- ⏳ Session Detail Pages (2)

**Why:** Sessions are the primary feature. Users need to book, view, and manage sessions.

---

### 2. Chat & Messaging
**Impact:** High - Core communication feature
**Complexity:** High (requires Socket.IO)
**Dependencies:** Sessions (for user context)

- ⏳ Patient Chat Page
- ⏳ Counselor Chat Page
- ⏳ ChatThreadsSidebar Component

**Why:** Real-time communication is essential. Users need to message each other.

---

### 3. Resources
**Impact:** High - Core content feature
**Complexity:** Low
**Dependencies:** None

- ⏳ Patient Resources Page
- ⏳ Counselor Resources Page

**Why:** Resources are important for patient education and counselor training.

---

## P1: High Priority

### 4. Dashboard Pages
**Impact:** High - User landing pages
**Complexity:** Medium
**Dependencies:** Sessions, Chat, Resources

- ⏳ Patient Dashboard
- ⏳ Counselor Dashboard
- ⏳ Admin Dashboard

**Why:** Dashboards are the first thing users see. Need accurate data.

---

### 5. User Selection Pages
**Impact:** Medium - Needed for session booking
**Complexity:** Low
**Dependencies:** None

- ⏳ Patient Counselors Page
- ⏳ Counselor Patients Page

**Why:** Users need to select counselors/patients for sessions.

---

## P2: Medium Priority

### 6. Settings Pages
**Impact:** Medium - User profile management
**Complexity:** Low
**Dependencies:** Auth

- ⏳ Patient Settings
- ⏳ Counselor Settings

**Why:** Users need to manage their profiles and settings.

---

### 7. Session Modals
**Impact:** Medium - Used by sessions pages
**Complexity:** Low
**Dependencies:** Sessions

- ⏳ SessionBookingModal
- ⏳ RescheduleModal
- ⏳ CancelSessionModal
- ⏳ CounselorRescheduleModal
- ⏳ ScheduleSessionModal

**Why:** Modals are used by updated sessions pages. Should work with real API.

---

## P3: Low Priority

### 8. Admin Features
**Impact:** Low - Admin-only
**Complexity:** Medium
**Dependencies:** Admin API

- ⏳ Admin Users Page
- ⏳ Admin Approvals Page
- ⏳ Admin Support Page
- ⏳ Admin Systems Page
- ⏳ Admin Resources Review
- ⏳ Admin Training Resources

**Why:** Admin features are less critical. Can be done after core features.

---

### 9. Training Resources
**Impact:** Low - Counselor-only
**Complexity:** Low
**Dependencies:** Resources API

- ⏳ Counselor Training Page
- ⏳ Admin Training Resources

**Why:** Training resources are nice-to-have. Not critical for core functionality.

---

## Recommended Update Order

### Week 1: Core Features
1. ✅ Patient Sessions Page
2. 🔄 Counselor Sessions Page
3. Patient Chat Page
4. Counselor Chat Page
5. Patient Resources Page
6. Counselor Resources Page

### Week 2: Dashboards & Selection
7. Patient Dashboard
8. Counselor Dashboard
9. Patient Counselors Page
10. Counselor Patients Page

### Week 3: Details & Modals
11. Session Detail Pages (2)
12. Session Modals (5)
13. Patient Settings
14. Counselor Settings

### Week 4: Admin & Additional
15. Admin Dashboard
16. Admin Users Page
17. Admin Approvals Page
18. Admin Support Page
19. Training Resources Pages
20. Admin Systems Page
21. Admin Resources Review

---

## Complexity vs Impact Matrix

```
High Impact │ Chat Pages    │ Dashboard Pages │ Sessions Pages
            │ Resources     │                 │
────────────┼───────────────┼─────────────────┼───────────────
Low Impact  │ Settings      │ Admin Pages     │ Training
            │ Modals        │                 │
            └───────────────┴─────────────────┴───────────────
               Low Complexity    Medium      High Complexity
```

**Focus Area:** High Impact, Low-Medium Complexity (top-left quadrant)

---

## Estimated Effort

| Priority | Components | Estimated Time |
|----------|-----------|----------------|
| P0       | 6         | 4-5 hours      |
| P1       | 5         | 2-3 hours      |
| P2       | 7         | 2-3 hours      |
| P3       | 8         | 3-4 hours      |
| **Total** | **26**   | **11-15 hours** |

---

## Risk Assessment

### High Risk (Requires Careful Testing)
- Chat Pages (Socket.IO integration)
- Session Detail Pages (Jitsi integration)
- Dashboard Pages (multiple data sources)

### Medium Risk
- Resources Pages (file uploads)
- Admin Pages (permissions)

### Low Risk
- Settings Pages
- Session Modals
- User Selection Pages

---

## Quick Wins (Low Effort, High Impact)

1. ✅ Patient Sessions Page (Done)
2. Counselor Sessions Page (Similar to patient)
3. Resources Pages (Straightforward API calls)
4. Patient Counselors Page (Simple list)
5. Counselor Patients Page (Simple list)

---

## Blockers

### Potential Blockers
1. **User Data**: Need API to fetch counselors/patients
2. **Jitsi Integration**: Need to test with real sessions
3. **Socket.IO**: Need to ensure stable connection
4. **File Uploads**: Need to test resource uploads

### Mitigation
- Create placeholder API calls if needed
- Test Jitsi integration early
- Monitor Socket.IO connection
- Test file uploads in staging

---

## Success Criteria

Component is considered "updated" when:
- ✅ All dummy data removed
- ✅ Real API calls implemented
- ✅ Loading states added
- ✅ Error handling added
- ✅ Toast notifications added
- ✅ Tested and working
- ✅ No linting errors
- ✅ Types are correct

---

## Next Immediate Action

**Update Counselor Sessions Page** (Similar to Patient Sessions Page)

**Why:**
- Similar structure to completed patient page
- High impact (core feature)
- Low complexity (pattern established)
- Quick win (can reuse same approach)

**Estimated Time:** 30 minutes

