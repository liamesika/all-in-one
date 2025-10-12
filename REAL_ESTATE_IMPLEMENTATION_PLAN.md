# Real Estate Vertical - Implementation Plan

**Status:** In Progress
**Target:** Demo-ready by tomorrow
**Last Updated:** October 10, 2025

---

## ✅ COMPLETED (Phase 0)

### AI Advisor Bot
- [x] Created `AIAdvisorBot.tsx` component with:
  - Side popup that collapses/expands
  - Context-aware greetings based on page
  - Persistent state across navigation (localStorage)
  - Full RTL support
  - Mobile responsive
- [x] Created `/api/real-estate/ai-advisor` route with:
  - OpenAI integration (server-side only)
  - Context-aware system prompts
  - Conversation history (last 5 messages)
  - Error handling and logging
  - Security: No API keys exposed to client
- [x] Integrated into Real Estate layout (visible on all pages)
- [x] Status: **PRODUCTION READY** ✅

### Account Type Separation
- [x] Extended `AccountType` enum support to REAL_ESTATE vertical
- [x] Updated registration flow to require account type selection
- [x] Form validation enforces account type for Real Estate users
- [x] Database schema already supports `UserProfile.accountType`
- [x] Status: **PRODUCTION READY** ✅

---

## 🚧 IN PROGRESS

### Dashboard Differentiation (Company vs Freelancer)
**Status:** Needs implementation
**Priority:** HIGH

**Required Work:**
1. Create `/dashboard/real-estate/agency` for Company accounts
2. Create `/dashboard/real-estate/freelancer` for Freelancer accounts
3. Add middleware to redirect based on `accountType`
4. Company view: Full CRM (leads, agents, listings, analytics)
5. Freelancer view: Streamlined solo tools

**Estimated Time:** 3-4 hours

---

## 📋 TODO (Priority Order)

### 1. Leads & Properties CRUD (CRITICAL)
**Priority:** HIGHEST
**Target:** 2 hours

**Leads Module:**
- [ ] Create `/api/real-estate/leads` endpoints:
  - GET (list with filters)
  - POST (create)
  - PUT (update)
  - DELETE (archive)
- [ ] Update `/dashboard/real-estate/leads/page.tsx` with:
  - Real-time data fetching
  - Filters (status, source, date, agent)
  - Create/edit modal
  - Delete confirmation
  - Empty states
- [ ] Add qualification status badges (Hot/Warm/Cold)
- [ ] Link leads to properties

**Properties Module:**
- [ ] Create `/api/real-estate/properties` endpoints:
  - GET (list with filters)
  - POST (create with image upload)
  - PUT (update)
  - DELETE (archive)
- [ ] Update `/dashboard/real-estate/properties/page.tsx` with:
  - Real-time data fetching
  - Filters (status, location, price range, agent)
  - Image gallery
  - Status indicators
  - Empty states
- [ ] Enhance `/dashboard/real-estate/properties/new` with real submission

### 2. Property Ad Generator (HIGH PRIORITY)
**Priority:** HIGH
**Target:** 2 hours

**Required:**
- [ ] Create `/api/real-estate/property-ad-generator` route
- [ ] OpenAI integration for:
  - Marketing description generation
  - Price recommendation logic
  - SEO-friendly content
- [ ] Generate landing page URL (slug-based)
- [ ] Create property landing page template at `/properties/[slug]`
- [ ] Contact form on landing page
- [ ] Export functionality (PDF/shareable link)

### 3. Lead Qualification Bot (HIGH PRIORITY)
**Priority:** HIGH
**Target:** 1.5 hours

**Required:**
- [ ] Create `/api/real-estate/qualify-lead` route
- [ ] Intake form with:
  - Budget range
  - Financing status
  - Urgency (timeline)
  - Preferred locations
  - Property type
- [ ] OpenAI classification logic
- [ ] Rules engine (budget vs property price, timeline, etc.)
- [ ] Auto-update lead status in database
- [ ] Dashboard widget showing qualification distribution

### 4. Comps (Price Comparison) (MEDIUM PRIORITY)
**Priority:** MEDIUM
**Target:** 2 hours

**Required:**
- [ ] Create `/api/real-estate/comps` route
- [ ] Data source options:
  - Database queries (similar properties)
  - External API (if available)
  - Fallback: Static dataset with clear TODO
- [ ] Charts (using Chart.js or Recharts):
  - Price vs sqm scatter plot
  - Price trends over time
  - Neighborhood comparison
  - Min/max/median indicators
- [ ] PDF export functionality
- [ ] Insights generation (OpenAI)

### 5. Open House Kit (MEDIUM PRIORITY)
**Priority:** MEDIUM
**Target:** 2 hours

**Required:**
- [ ] Create `/api/real-estate/open-house` endpoints
- [ ] Registration form per property
- [ ] Attendee database (Prisma model)
- [ ] Email templates:
  - Invitation email
  - Reminder email (24h before)
  - Thank you email (post-event)
- [ ] Printable registration sheet (PDF)
- [ ] Feedback summary report
- [ ] Auto-send emails based on event date

### 6. Automated Marketing (FB/IG) (MEDIUM PRIORITY)
**Priority:** MEDIUM
**Target:** 2 hours

**Required:**
- [ ] Create `/api/real-estate/marketing-generator` route
- [ ] OpenAI integration for:
  - Ad copy generation (headlines, body, CTAs)
  - Multiple variations (A/B testing)
- [ ] Image processing:
  - Resize/crop for FB/IG specs
  - Add text overlays (price, location)
  - Create creative set
- [ ] Export as ZIP with:
  - Images (multiple formats)
  - Copy variations (JSON/CSV)
  - Meta Ads API payload (JSON) - future-ready
- [ ] UI for preview and selection

### 7. Smart Neighborhood Guide (LOW PRIORITY)
**Priority:** LOW
**Target:** 1.5 hours

**Required:**
- [ ] Data sources:
  - Static seed data (schools, transport, amenities)
  - Future: Google Places API
- [ ] Create `/api/real-estate/neighborhood-guide` route
- [ ] Generate PDF report with:
  - Map (static image or embedded)
  - Points of interest list
  - Schools ratings
  - Transportation options
  - Amenities nearby
- [ ] Optional: Dedicated landing page
- [ ] Embed guide on property landing page

---

## 🔐 SECURITY CHECKLIST

- [x] OpenAI API key in ENV only (not exposed to client)
- [x] All AI calls go through Next.js API routes (server-side)
- [x] Firebase Admin SDK for server-side auth
- [x] No hardcoded secrets in codebase
- [ ] Input validation on all forms (Zod schemas)
- [ ] Rate limiting on AI endpoints (prevent abuse)
- [ ] File upload size limits and type validation
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] XSS prevention (React auto-escaping + sanitize user input)

---

## 📊 DATABASE REQUIREMENTS

### New Models Needed

```prisma
model OpenHouseEvent {
  id          String   @id @default(cuid())
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id])
  eventDate   DateTime
  startTime   String
  endTime     String
  location    String?
  description String?
  createdBy   String
  ownerUid    String
  orgId       String?

  attendees   OpenHouseAttendee[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([propertyId])
  @@index([ownerUid])
  @@index([eventDate])
}

model OpenHouseAttendee {
  id          String   @id @default(cuid())
  eventId     String
  event       OpenHouseEvent @relation(fields: [eventId], references: [id])
  fullName    String
  email       String?
  phone       String?
  feedback    String?
  checkedIn   Boolean @default(false)
  checkedInAt DateTime?

  createdAt DateTime @default(now())

  @@index([eventId])
  @@index([email])
}

model PropertyAdCampaign {
  id          String   @id @default(cuid())
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id])
  platform    String   // 'facebook', 'instagram', 'google'
  adCopy      Json     // { headlines: [], descriptions: [], ctas: [] }
  creativeUrls String[] // URLs to generated ad images
  status      String   @default("draft") // 'draft', 'active', 'paused'
  budget      Float?
  startDate   DateTime?
  endDate     DateTime?
  ownerUid    String
  orgId       String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([propertyId])
  @@index([ownerUid])
  @@index([status])
}
```

### Fields to Add to Existing Models

```prisma
// Add to RealEstateLead
model RealEstateLead {
  // ... existing fields ...

  // Lead Qualification
  qualificationStatus LeadQualificationStatus? // HOT, WARM, COLD
  budget              Float?
  financingStatus     String?
  urgency             String?
  preferredLocations  String[]
  propertyType        String?
  qualifiedAt         DateTime?
  qualifiedBy         String? // 'ai' or user ID

  // ... rest of model ...
}

enum LeadQualificationStatus {
  HOT
  WARM
  COLD
}

// Add to Property
model Property {
  // ... existing fields ...

  // Ad Generator fields
  generatedDescription String?
  generatedPrice       Float?
  landingPageUrl       String? @unique
  landingPageActive    Boolean @default(false)

  // Open House
  openHouseEvents OpenHouseEvent[]

  // Marketing
  adCampaigns PropertyAdCampaign[]

  // ... rest of model ...
}
```

---

## 🔧 ENV VARIABLES REQUIRED

```bash
# Already have:
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_PRIVATE_KEY=...
FIREBASE_ADMIN_CLIENT_EMAIL=...

# May need to add:
AWS_S3_BUCKET=effinity-property-images
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# For future external integrations:
YAD2_API_KEY=... (if available)
MADLAN_API_KEY=... (if available)
GOOGLE_PLACES_API_KEY=... (for neighborhood data)
SENDGRID_API_KEY=... (for email sending)
```

---

## 📦 DEPENDENCIES TO ADD

```json
{
  "dependencies": {
    "recharts": "^2.10.0",           // For charts (Comps)
    "jspdf": "^2.5.1",                // PDF generation
    "jspdf-autotable": "^3.8.0",      // Tables in PDFs
    "html2canvas": "^1.4.1",          // Screenshot charts for PDFs
    "sharp": "^0.33.0",               // Image processing
    "canvas": "^2.11.2",              // Image manipulation
    "nodemailer": "^6.9.0",           // Email sending
    "zod": "3.23.8",                  // Already have - validation
    "react-dropzone": "^14.2.3"       // File uploads
  }
}
```

---

## 🎯 DEMO SCRIPT (Tomorrow)

### 1. Registration Flow (2 min)
- Show Real Estate vertical selection
- Show account type selection (Agency vs Freelancer)
- Complete registration

### 2. AI Advisor Demo (2 min)
- Click AI bot on dashboard
- Ask "What should I prioritize today?"
- Show context-aware response
- Navigate to leads page, show bot follows
- Ask lead-specific question

### 3. Leads Management (3 min)
- Show leads list with filters
- Create new lead
- Show hot/warm/cold qualification
- Link lead to property

### 4. Properties Management (3 min)
- Show properties list
- Create new property with images
- Show property detail page

### 5. Property Ad Generator (3 min)
- Select property
- Generate ad copy (OpenAI)
- Show price recommendation
- Generate landing page URL
- Preview landing page

### 6. Lead Qualification Bot (2 min)
- Open lead detail
- Click "Qualify Lead"
- Fill intake form
- Show AI classification
- See dashboard widget update

### 7. Comps Analysis (2 min)
- Open property detail
- Click "View Comps"
- Show price comparison charts
- Export PDF report

### 8. Open House Kit (2 min)
- Create open house event
- Show registration form
- Preview email templates
- Download registration sheet PDF

### 9. Automated Marketing (2 min)
- Select property
- Generate Facebook ad
- Show multiple copy variations
- Show creative set
- Download ZIP

### 10. Neighborhood Guide (1 min)
- Show property landing page
- Display neighborhood data
- Download neighborhood PDF

---

## ⏱️ TIME ESTIMATE

| Task | Hours | Status |
|------|-------|--------|
| AI Advisor Bot | 2 | ✅ Done |
| Account Type | 0.5 | ✅ Done |
| Dashboard Split | 3 | ⏳ TODO |
| Leads CRUD | 2 | ⏳ TODO |
| Properties CRUD | 2 | ⏳ TODO |
| Ad Generator | 2 | ⏳ TODO |
| Lead Qualification | 1.5 | ⏳ TODO |
| Comps | 2 | ⏳ TODO |
| Open House | 2 | ⏳ TODO |
| Marketing | 2 | ⏳ TODO |
| Neighborhood | 1.5 | ⏳ TODO |
| Testing & Polish | 2 | ⏳ TODO |
| **TOTAL** | **22.5** | **~9% done** |

**Realistic assessment:** This is a 3-day project minimum for production-quality code.

**For tomorrow's demo:** Focus on core features with polished UI, use mock data where necessary, add clear TODOs for incomplete parts.

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Run Prisma migration for new models
- [ ] Update ENV variables on Vercel
- [ ] Test all API routes in production
- [ ] Verify OpenAI rate limits and billing
- [ ] Check S3 bucket permissions (if using)
- [ ] Test email sending (if implemented)
- [ ] Verify Firebase Admin SDK permissions
- [ ] Run Lighthouse audit
- [ ] Test mobile responsiveness
- [ ] Check i18n coverage
- [ ] Verify all links work (no 404s)
- [ ] Test error boundaries
- [ ] Review console for errors

---

**Next Steps:** Proceed with implementation in priority order, starting with Leads & Properties CRUD.
