# Creative Productions Sprint 2 - QA Testing Guide

## Test Environment
- Staging URL: (Will be provided after deployment)
- Test Organization: Create new org or use existing test org
- Test User: Create test user with Productions access

---

## 1. Templates System Testing

### Test 1.1: Auto-Seeding Built-in Templates
**Steps:**
1. Navigate to `/dashboard/productions/templates`
2. First-time load should auto-seed 7 built-in templates

**Expected Results:**
- ✅ 7 templates appear: Campaign Brief, Script 30/60/90, Shotlist, Ad Copy, UGC Brief
- ✅ All built-in templates have `locked` badge
- ✅ Templates display correct kind (BRIEF, SCRIPT, SHOTLIST, AD_COPY)
- ✅ Default locale is EN

**Pass Criteria:**
- All 7 templates visible
- No errors in console
- Loading states display correctly

---

### Test 1.2: Template Filtering
**Steps:**
1. Use kind filter dropdown (All, Brief, Script, Shotlist, Ad Copy)
2. Use locale filter dropdown (All, EN, HE)

**Expected Results:**
- ✅ Filters work independently and in combination
- ✅ Grid updates without page reload
- ✅ "No templates found" message if filters match nothing

---

### Test 1.3: Create Custom Template
**Steps:**
1. Click "New Template" button
2. Fill form:
   - Title: "My Custom Brief"
   - Kind: BRIEF
   - Locale: EN
   - Add 3 sections with titles and content
3. Save

**Expected Results:**
- ✅ Template appears in grid
- ✅ Unlocked by default
- ✅ Can edit immediately after creation
- ✅ Success notification displayed

---

### Test 1.4: Edit Template (Locked vs Unlocked)
**Steps:**
1. Try to edit locked built-in template
2. Try to edit unlocked custom template
3. Unlock a locked template, then edit
4. Lock an unlocked template, then try to edit

**Expected Results:**
- ✅ Locked templates show disabled edit button or 403 error
- ✅ Unlocked templates open in editor
- ✅ Unlock → Edit works
- ✅ Lock → Edit blocked with clear error message

**API Validation:**
```bash
# Should fail with 403
PATCH /api/productions/templates/{id}
Body: { "title": "Updated" }
Headers: { "Authorization": "Bearer TOKEN", "x-org-id": "ORG_ID" }
Response: { "error": "Cannot edit locked template. Unlock it first." }
```

---

### Test 1.5: Duplicate Template
**Steps:**
1. Click "Duplicate" on any template (locked or unlocked)
2. Verify new template created

**Expected Results:**
- ✅ New template appears with " (Copy)" suffix
- ✅ **Always created unlocked** regardless of source
- ✅ Content identical to source
- ✅ Can edit immediately

---

### Test 1.6: Localize Template
**Steps:**
1. Select EN template
2. Click "Localize" → choose HE
3. Verify new HE template created
4. Try to localize HE template back to HE (should fail)

**Expected Results:**
- ✅ New template created with target locale
- ✅ Created unlocked
- ✅ Content structure preserved (user translates manually)
- ✅ Cannot localize to same locale (validation error)

---

### Test 1.7: Delete Template
**Steps:**
1. Try to delete locked template
2. Delete unlocked custom template

**Expected Results:**
- ✅ Locked templates cannot be deleted (403)
- ✅ Unlocked templates deleted with confirmation
- ✅ Template removed from grid

---

## 2. Reviews Inbox Testing

### Test 2.1: Create Review
**Prerequisites:**
- Create project with at least 1 asset

**Steps:**
1. Navigate to `/dashboard/productions/reviews`
2. Create review via API or dedicated UI (if exists)
3. Verify review appears in pending list

**Expected Results:**
- ✅ Review listed with PENDING status
- ✅ Shows project name, asset title, version
- ✅ Requested timestamp displayed
- ✅ Yellow "Pending" badge with clock icon

---

### Test 2.2: Filter Reviews by Status
**Steps:**
1. Use status dropdown: All, Pending, Approved, Changes Requested
2. Verify filtering works

**Expected Results:**
- ✅ Default shows PENDING reviews
- ✅ Each status filter shows correct reviews
- ✅ Empty state displays when no reviews match

---

### Test 2.3: Preview Review
**Steps:**
1. Click on pending review card
2. Verify preview modal opens

**Expected Results:**
- ✅ Modal displays asset preview:
  - **Image**: Rendered in modal
  - **Video**: Player with controls
  - **PDF**: Link to open in new tab
  - **Copy/Text**: Display in modal
- ✅ Status badge visible
- ✅ Comments section (if any)
- ✅ Timestamps displayed
- ✅ ESC key closes modal
- ✅ Click outside closes modal (if configured)

---

### Test 2.4: Approve Review (Optional Comments)
**Steps:**
1. Open pending review
2. Click "Approve"
3. Enter optional comments: "Looks great!"
4. Confirm approval

**Expected Results:**
- ✅ Status changes to APPROVED
- ✅ Green "Approved" badge with checkmark icon
- ✅ decidedAt timestamp set
- ✅ Comments saved and displayed
- ✅ Asset version locked (check asset record)
- ✅ Review removed from PENDING filter
- ✅ Success notification

**API Validation:**
```bash
POST /api/productions/reviews/{id}/approve
Body: { "comments": "Looks great!" }
Response: { "review": {..., "status": "APPROVED", "decidedAt": "2025-10-14T..." }}
```

---

### Test 2.5: Request Changes (Required Comments)
**Steps:**
1. Open pending review
2. Click "Request Changes"
3. Try to submit WITHOUT comments (should fail)
4. Try with empty string "" (should fail)
5. Enter valid comments: "Please adjust color grading in scene 2"
6. Submit

**Expected Results:**
- ✅ Validation prevents submission without comments
- ✅ Clear error: "Comments are required when requesting changes"
- ✅ With valid comments → status changes to CHANGES_REQUESTED
- ✅ Red "Changes Requested" badge with X icon
- ✅ decidedAt timestamp set
- ✅ Comments displayed in timeline
- ✅ Review removed from PENDING filter

**API Validation:**
```bash
# Should fail
POST /api/productions/reviews/{id}/request-changes
Body: { "comments": "" }
Response: 400 { "error": "Validation error", "details": [...] }

# Should succeed
Body: { "comments": "Please fix X" }
Response: 200 { "review": {..., "status": "CHANGES_REQUESTED"}}
```

---

### Test 2.6: Review Decision Cannot Be Changed
**Steps:**
1. Approve a review
2. Try to request changes on same review (should fail)
3. Try to approve an already approved review (should fail)

**Expected Results:**
- ✅ API returns 400: "Review already decided"
- ✅ Action buttons disabled for decided reviews
- ✅ Only PENDING reviews show action buttons

---

### Test 2.7: Mobile Responsive Review Cards
**Steps:**
1. Test on mobile viewport (375px width)
2. Verify cards stack vertically
3. Verify preview modal adapts

**Expected Results:**
- ✅ Cards full-width on mobile
- ✅ Touch targets ≥44px
- ✅ Preview modal scrollable
- ✅ Action buttons accessible

---

## 3. AI Assistants Testing

### Test 3.1: Brief Generator
**Endpoint:** `POST /api/productions/ai/brief-generator`

**Steps:**
1. Send request with property details and campaign context
2. Verify structured brief returned

**Request:**
```json
{
  "vertical": "real-estate",
  "propertyDetails": {
    "title": "Luxury Penthouse",
    "description": "3BR panoramic views",
    "price": 2500000,
    "location": "Downtown",
    "features": ["Pool", "Gym", "Concierge"]
  },
  "campaignDetails": {
    "name": "Q1 Launch",
    "objective": "50 qualified leads",
    "targetAudience": "High-net-worth families",
    "budget": 15000
  },
  "targetLocale": "EN"
}
```

**Expected Results:**
- ✅ 200 status
- ✅ Brief with 8 sections: Campaign Overview, Target Audience, Key Message, Goals & KPIs, Creative Direction, CTA, Channels & Formats, Timeline & Budget
- ✅ Content in requested locale (EN)
- ✅ Metadata includes prompt, model, locale

---

### Test 3.2: Ad Copy Variants
**Endpoint:** `POST /api/productions/ai/ad-copy`

**Steps:**
1. Request 5 variants for Meta channel
2. Verify character limits respected

**Request:**
```json
{
  "productName": "Luxury Apartment",
  "description": "Modern 3BR with premium finishes",
  "targetAudience": "Families, 35-55, high income",
  "tone": "luxury",
  "channel": "meta",
  "variantsCount": 5,
  "targetLocale": "EN"
}
```

**Expected Results:**
- ✅ 5 variants returned
- ✅ Each variant has: headline, primaryText, description, cta, hook
- ✅ Headline ≤40 characters (Meta limit)
- ✅ Primary text ≤125 characters (Meta limit)
- ✅ Different hook types: Problem/Solution, Social Proof, Urgency, Benefit-Driven

---

### Test 3.3: Script & Shotlist
**Endpoint:** `POST /api/productions/ai/script`

**Steps:**
1. Request 30-second script
2. Verify timing breakdown

**Request:**
```json
{
  "duration": 30,
  "productName": "Smart Home System",
  "keyMessage": "Control your home from anywhere",
  "targetAudience": "Tech-savvy homeowners",
  "callToAction": "Get free consultation",
  "tone": "friendly",
  "targetLocale": "EN"
}
```

**Expected Results:**
- ✅ Voiceover array with timing (0-3s, 3-10s, etc.)
- ✅ Scenes array with visuals and on-screen text
- ✅ Shotlist with camera directions
- ✅ Total duration matches request (30s)

---

### Test 3.4: Auto-Tagging
**Endpoint:** `POST /api/productions/ai/auto-tag`

**Steps:**
1. Upload asset or provide filename/description
2. Request tags

**Request:**
```json
{
  "assetType": "image",
  "fileName": "property_exterior_001.jpg",
  "description": "Front view of modern house",
  "existingTags": ["real-estate", "exterior"]
}
```

**Expected Results:**
- ✅ 8-12 tags returned
- ✅ Categories: Content Type, Subject Matter, Style, Usage, Season/Time
- ✅ Tags specific and searchable

---

### Test 3.5: Cutdown Plan
**Endpoint:** `POST /api/productions/ai/cutdown-plan`

**Steps:**
1. Request cutdowns for 15s, 30s, 60s
2. Verify platform optimizations

**Request:**
```json
{
  "videoDuration": 120,
  "targetDurations": [15, 30, 60],
  "description": "Property tour video",
  "keyMoments": [
    "Exterior aerial shot",
    "Living room pan",
    "Kitchen reveal",
    "Master bedroom",
    "CTA with contact info"
  ]
}
```

**Expected Results:**
- ✅ 3 cutdown plans (one per target duration)
- ✅ Each has: timestamps, scenes, transitions, edits, platform optimization
- ✅ Hook preserved in first 3 seconds
- ✅ CTA included in each cutdown

---

### Test 3.6: Rate Limiting
**Steps:**
1. Send 11 requests to same AI endpoint within 60 seconds
2. Verify rate limit enforced

**Expected Results:**
- ✅ First 10 requests succeed (200)
- ✅ 11th request fails with 429 status
- ✅ Response includes:
  ```json
  {
    "error": "Rate limit exceeded",
    "message": "Too many AI requests. Please try again later.",
    "remaining": 0
  }
  ```
- ✅ Headers: `Retry-After: 60`, `X-RateLimit-Remaining: 0`
- ✅ After 60 seconds, requests work again

---

### Test 3.7: Bilingual Outputs (EN/HE)
**Steps:**
1. Request brief with `targetLocale: "HE"`
2. Verify Hebrew response

**Expected Results:**
- ✅ All content in Hebrew (RTL)
- ✅ Structure preserved (8 sections)
- ✅ Professional tone maintained

---

## 4. Export Pack Testing

### Test 4.1: Create Export Pack
**Endpoint:** `POST /api/productions/exports`

**Prerequisites:**
- Project with 2+ assets

**Steps:**
1. Create export pack with multiple channels

**Request:**
```json
{
  "projectId": "uuid",
  "name": "Q1_Campaign_Launch",
  "channels": [
    "meta-story",
    "meta-feed",
    "youtube-short",
    "tiktok"
  ],
  "assetIds": ["uuid1", "uuid2"],
  "includeHandoff": true
}
```

**Expected Results:**
- ✅ 201 status
- ✅ Export pack created with status: PENDING
- ✅ Specs array contains 4 channel specifications
- ✅ Filenames generated: `q1_campaign_launch_meta-story.mp4`, etc.
- ✅ Canonical naming (lowercase, underscores)

---

### Test 4.2: Channel Specifications
**Steps:**
1. Verify each channel spec includes correct dimensions

**Expected Specs:**
- **meta-story**: 1080x1920, 9:16, 4GB max, 60s
- **meta-feed**: 1080x1080, 1:1, 4GB max, 60s
- **youtube-short**: 1080x1920, 9:16, 256MB max, 60s
- **tiktok**: 1080x1920, 9:16, 4GB max, 10m

**Expected Results:**
- ✅ All specs match channel requirements
- ✅ Recommendations included
- ✅ Video codec, audio codec, bitrate specified

---

### Test 4.3: Attach Export to Campaign
**Endpoint:** `POST /api/productions/exports/{id}/attach-campaign`

**Steps:**
1. Create campaign
2. Attach export pack to campaign

**Request:**
```json
{
  "campaignId": "campaign-uuid"
}
```

**Expected Results:**
- ✅ 200 status
- ✅ Export pack updated with campaignId
- ✅ Can fetch campaign and see attached export

---

### Test 4.4: Detach Export from Campaign
**Endpoint:** `DELETE /api/productions/exports/{id}/attach-campaign`

**Steps:**
1. Detach previously attached export

**Expected Results:**
- ✅ campaignId set to null
- ✅ Campaign no longer references export

---

### Test 4.5: Export Pack Listing
**Endpoint:** `GET /api/productions/exports?projectId={uuid}&status=PENDING`

**Steps:**
1. List exports for project
2. Filter by status

**Expected Results:**
- ✅ Returns exports matching filters
- ✅ Includes project and campaign relations
- ✅ Ordered by createdAt desc

---

### Test 4.6: Delete Export Pack
**Endpoint:** `DELETE /api/productions/exports/{id}`

**Steps:**
1. Delete export pack

**Expected Results:**
- ✅ 200 status
- ✅ Export removed from database
- ✅ Cannot fetch afterward (404)

---

## 5. Performance & Metadata Testing

### Test 5.1: Verify Metadata Warnings Fixed
**Steps:**
1. Run build: `pnpm --filter web build`
2. Check for viewport/themeColor warnings

**Expected Results:**
- ✅ No warnings about viewport in metadata export
- ✅ No warnings about themeColor in metadata export
- ✅ Build completes successfully

---

### Test 5.2: Bundle Size Check
**Steps:**
1. Check build output for page sizes
2. Verify no pages exceed 1MB significantly

**Expected Results:**
- ✅ Most pages under 700KB
- ✅ Heavy pages (charts/reports) identified for future optimization
- ✅ No unnecessary bloat from new Sprint 2 features

---

## 6. Accessibility Testing

### Test 6.1: Keyboard Navigation
**Steps:**
1. Navigate templates page using only keyboard (Tab, Enter, Esc)
2. Open template editor modal
3. Close with Esc

**Expected Results:**
- ✅ All interactive elements focusable
- ✅ Focus indicators visible
- ✅ Logical tab order
- ✅ ESC closes modals
- ✅ Enter activates buttons

---

### Test 6.2: Screen Reader
**Steps:**
1. Use NVDA/JAWS/VoiceOver
2. Navigate reviews inbox
3. Verify announcements

**Expected Results:**
- ✅ Status badges announced
- ✅ Buttons have aria-labels
- ✅ Forms have proper labels
- ✅ Loading states announced

---

## 7. Mobile Responsiveness Testing

### Test 7.1: Templates on Mobile
**Devices:** iPhone 13 (390px), Android (360px)

**Steps:**
1. Load `/dashboard/productions/templates` on mobile
2. Test all actions

**Expected Results:**
- ✅ Cards stack vertically
- ✅ Touch targets ≥44px
- ✅ Filters in dropdown/drawer
- ✅ Actions menu accessible
- ✅ Smooth scrolling

---

### Test 7.2: Reviews on Mobile
**Steps:**
1. Load reviews inbox on mobile
2. Open review preview
3. Approve/request changes

**Expected Results:**
- ✅ Preview modal fullscreen on mobile
- ✅ Video player responsive
- ✅ Buttons accessible
- ✅ Comments textarea expandable

---

## 8. Cross-Browser Testing

### Test 8.1: Browser Compatibility
**Browsers:** Chrome, Safari, Firefox, Edge

**Steps:**
1. Test Templates, Reviews, AI endpoints, Export Pack in each browser

**Expected Results:**
- ✅ All features work consistently
- ✅ No console errors
- ✅ Styling consistent
- ✅ Modals/dropdowns position correctly

---

## 9. Security & Org Scoping

### Test 9.1: Org Isolation
**Steps:**
1. Create template in Org A
2. Try to access from Org B (different x-org-id header)

**Expected Results:**
- ✅ Org B cannot see Org A's templates
- ✅ Org B cannot edit/delete Org A's templates
- ✅ Returns empty list or 404, not 403 (to prevent info leakage)

---

### Test 9.2: Authentication Required
**Steps:**
1. Call any API without Authorization header

**Expected Results:**
- ✅ 401 Unauthorized
- ✅ Clear error message

---

## 10. Error Handling

### Test 10.1: Network Errors
**Steps:**
1. Disconnect network mid-request
2. Verify error handling

**Expected Results:**
- ✅ User-friendly error message
- ✅ Retry option provided
- ✅ No app crash

---

### Test 10.2: Validation Errors
**Steps:**
1. Submit invalid data (empty required fields, invalid UUIDs)

**Expected Results:**
- ✅ 400 Bad Request
- ✅ Zod error details returned
- ✅ Clear field-level errors in UI

---

## Test Summary Template

### Tester Information
- **Name:** _______________
- **Date:** _______________
- **Environment:** Staging / Production
- **Device:** Desktop / Mobile (specify)
- **Browser:** Chrome / Safari / Firefox / Edge (version: ___)

### Test Results
| Test ID | Feature | Status | Notes |
|---------|---------|--------|-------|
| 1.1 | Templates Auto-Seed | ☐ Pass ☐ Fail | |
| 1.2 | Templates Filter | ☐ Pass ☐ Fail | |
| 1.3 | Create Template | ☐ Pass ☐ Fail | |
| 1.4 | Edit Template | ☐ Pass ☐ Fail | |
| 1.5 | Duplicate Template | ☐ Pass ☐ Fail | |
| 1.6 | Localize Template | ☐ Pass ☐ Fail | |
| 1.7 | Delete Template | ☐ Pass ☐ Fail | |
| 2.1 | Create Review | ☐ Pass ☐ Fail | |
| 2.2 | Filter Reviews | ☐ Pass ☐ Fail | |
| 2.3 | Preview Review | ☐ Pass ☐ Fail | |
| 2.4 | Approve Review | ☐ Pass ☐ Fail | |
| 2.5 | Request Changes | ☐ Pass ☐ Fail | |
| 2.6 | Decision Immutable | ☐ Pass ☐ Fail | |
| 3.1 | Brief Generator | ☐ Pass ☐ Fail | |
| 3.2 | Ad Copy Variants | ☐ Pass ☐ Fail | |
| 3.3 | Script & Shotlist | ☐ Pass ☐ Fail | |
| 3.4 | Auto-Tagging | ☐ Pass ☐ Fail | |
| 3.5 | Cutdown Plan | ☐ Pass ☐ Fail | |
| 3.6 | Rate Limiting | ☐ Pass ☐ Fail | |
| 4.1 | Create Export Pack | ☐ Pass ☐ Fail | |
| 4.2 | Channel Specs | ☐ Pass ☐ Fail | |
| 4.3 | Attach to Campaign | ☐ Pass ☐ Fail | |
| 5.1 | Metadata Warnings | ☐ Pass ☐ Fail | |
| 6.1 | Keyboard Navigation | ☐ Pass ☐ Fail | |
| 7.1 | Mobile Templates | ☐ Pass ☐ Fail | |
| 7.2 | Mobile Reviews | ☐ Pass ☐ Fail | |
| 9.1 | Org Isolation | ☐ Pass ☐ Fail | |

### Critical Blockers
(List any issues preventing release)
1.
2.
3.

### Non-Critical Issues
(List minor issues for backlog)
1.
2.
3.

### Sign-off
- ☐ All critical tests passed
- ☐ No critical blockers
- ☐ Ready for production deployment

**Tester Signature:** _______________
**Date:** _______________
