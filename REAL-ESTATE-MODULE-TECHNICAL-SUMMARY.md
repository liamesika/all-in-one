# Real Estate Module - Comprehensive Technical Summary

**Platform**: Effinity All-in-One Platform
**Module**: Real Estate Vertical
**Last Updated**: 2025-10-23
**Status**: Production

---

## Table of Contents

1. [Module Overview](#module-overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Pages & Routes](#pages--routes)
5. [API Endpoints](#api-endpoints)
6. [UI Components](#ui-components)
7. [State Management](#state-management)
8. [Integrations](#integrations)
9. [AI Features](#ai-features)
10. [Data Flow](#data-flow)
11. [Dependencies](#dependencies)
12. [Environment Variables](#environment-variables)

---

## 1. Module Overview

The Real Estate module is a comprehensive property management and lead generation system designed for real estate agents, brokers, and agencies. It provides end-to-end functionality for:

- **Property Management**: Create, import, manage, and publish property listings
- **Lead Management**: Capture, qualify, and convert leads from multiple sources
- **Marketing Automation**: Create and manage campaigns across Meta, Google, TikTok, LinkedIn
- **Integrations**: Connect with Yad2, Madlan, Zillow, CRMs (HubSpot, Zoho, Salesforce)
- **AI-Powered Features**: Property scoring, lead qualification, ad copy generation
- **Analytics & Reporting**: Comprehensive dashboards with performance metrics

---

## 2. System Architecture

### 2.1 Folder Structure

```
apps/
├── web/
│   ├── app/
│   │   ├── dashboard/real-estate/          # Main dashboard routes
│   │   │   ├── dashboard/                   # Main dashboard page
│   │   │   ├── properties/                  # Property management
│   │   │   │   ├── page.tsx                # List view
│   │   │   │   ├── [slug]/                 # Property detail
│   │   │   │   ├── new/                    # Create property
│   │   │   │   └── PropertiesClient.tsx   # Client component
│   │   │   ├── leads/                       # Lead management
│   │   │   │   ├── page.tsx
│   │   │   │   └── LeadsClient.tsx
│   │   │   ├── campaigns/                   # Campaign management
│   │   │   │   ├── page.tsx
│   │   │   │   └── CampaignsClient.tsx
│   │   │   ├── automations/                 # Automation builder
│   │   │   │   ├── page.tsx
│   │   │   │   └── AutomationsClient.tsx
│   │   │   ├── integrations/                # Integration hub
│   │   │   │   ├── page.tsx
│   │   │   │   └── IntegrationsClient.tsx
│   │   │   ├── reports/                     # Analytics & reports
│   │   │   │   └── page.tsx
│   │   │   ├── ai-searcher/                 # AI property search
│   │   │   │   └── page.tsx
│   │   │   ├── calendar/                    # Calendar view
│   │   │   ├── customers/                   # Customer management
│   │   │   └── [id]/edit/                   # Edit property
│   │   └── api/real-estate/                 # API routes
│   │       ├── properties/
│   │       ├── leads/
│   │       ├── campaigns/
│   │       ├── automations/
│   │       ├── integrations/
│   │       ├── reports/
│   │       ├── dashboard/
│   │       ├── ai-advisor/
│   │       ├── qualify-lead/
│   │       └── property-ad-generator/
│   ├── components/
│   │   └── real-estate/
│   │       ├── PropertyAdGenerator.tsx      # AI ad copy
│   │       ├── LeadQualificationBot.tsx     # AI lead scoring
│   │       ├── AIAdvisorBot.tsx             # AI property advisor
│   │       ├── ScoreBadge.tsx               # Lead/property scoring UI
│   │       ├── AssignAgentModal.tsx         # Agent assignment
│   │       ├── AssignAgentButton.tsx
│   │       ├── leads/                       # Lead modals
│   │       │   ├── CreateLeadModal.tsx
│   │       │   ├── EditLeadModal.tsx
│   │       │   ├── ViewLeadModal.tsx
│   │       │   ├── QualifyLeadModal.tsx
│   │       │   ├── LinkPropertyModal.tsx
│   │       │   ├── ImportLeadsModal.tsx
│   │       │   └── WhatsAppActions.tsx
│   │       ├── campaigns/                    # Campaign components
│   │       │   ├── CampaignCard.tsx
│   │       │   ├── CreateCampaignModal.tsx
│   │       │   └── EditCampaignModal.tsx
│   │       ├── automations/                  # Automation components
│   │       │   ├── AutomationCard.tsx
│   │       │   ├── VisualFlowBuilder.tsx
│   │       │   ├── AutomationBuilderModal.tsx
│   │       │   └── AutomationTemplates.tsx
│   │       ├── integrations/                 # Integration components
│   │       │   ├── IntegrationCard.tsx
│   │       │   ├── ConnectIntegrationModal.tsx
│   │       │   └── IntegrationSettingsModal.tsx
│   │       └── reports/                      # Chart components
│   │           ├── charts/
│   │           │   ├── LeadsOverTimeChart.tsx
│   │           │   ├── LeadsBySourceChart.tsx
│   │           │   ├── LeadStatusChart.tsx
│   │           │   ├── PropertiesPerformanceChart.tsx
│   │           │   ├── ResponseTimeTrendChart.tsx
│   │           │   └── RevenueByTypeChart.tsx
│   │           └── ExportPDFButton.tsx
│   └── lib/
│       ├── hooks/                           # Custom React hooks
│       └── utils/                           # Utility functions
└── api/                                      # NestJS backend (if separate)

packages/
└── server/
    └── db/
        └── prisma/
            └── schema.prisma                 # Database schema
```

### 2.2 Technical Stack

**Frontend**:
- Next.js 15.5.5 (App Router)
- React 18+ with TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Recharts for data visualization
- Framer Motion for animations
- React Query (TanStack Query) for state management
- React Hook Form for form handling
- Zod for validation

**Backend**:
- Next.js API Routes
- NestJS (for separate API service if used)
- Prisma ORM
- PostgreSQL database (Neon)

**External Services**:
- OpenAI API (GPT-4) for AI features
- Firebase Auth
- Meta Ads API
- Google Ads API
- TikTok Ads API
- LinkedIn Ads API
- Yad2 API (Israel real estate)
- Madlan API (Israel real estate)

---

## 3. Database Schema

### 3.1 Core Models

#### **Property**
```prisma
model Property {
  id           String          @id @default(cuid())
  ownerUid     String          // User/org owner
  orgId        String?         // Organization scope
  name         String          // Property title
  address      String?
  city         String?
  neighborhood String?
  description  String?

  // Status and transaction
  status          PropertyStatus      @default(DRAFT)
  transactionType TransactionType     @default(SALE)
  type            PropertyType?       // APARTMENT, HOUSE, VILLA, etc.

  // Physical attributes
  rooms        Int?
  size         Int?             // Square meters

  // Pricing
  price            Int?          // For SALE
  rentPriceMonthly Int?          // For RENT
  rentTerms        String?       // Lease details
  currency         String?       @default("ILS")

  // Media and SEO
  photos           PropertyPhoto[]     @relation("PropertyToPhotos")
  photosJson       Json?
  slug             String?             @unique
  seoTitle         String?
  seoDescription   String?
  amenities        String?

  // Agent assignment
  agentName       String?
  agentPhone      String?
  assignedAgentId String?        // For company accounts

  // Import tracking
  provider       PropertyProvider @default(MANUAL)
  externalId     String?         // Yad2/Madlan ID
  externalUrl    String?
  syncStatus     SyncStatus      @default(IDLE)
  lastSyncAt     DateTime?
  lastSyncError  String?
  syncData       Json?
  needsReview    Boolean         @default(false)

  // AI scoring
  aiScore        Float?          // 0-100
  aiCategory     String?         // excellent, good, fair, poor
  aiInsights     Json?           // Reasons, market insights
  aiScoredAt     DateTime?

  // Relations
  leads           RealEstateLead[]   @relation("PropertyToLeads")
  landingPages    LandingPage[]
  organization    Organization?      @relation(fields: [orgId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([ownerUid, provider, externalId])
  @@index([ownerUid, status])
  @@index([orgId, status])
  @@index([city, status])
  @@index([price, status])
  @@index([slug])
}
```

#### **PropertyPhoto**
```prisma
model PropertyPhoto {
  id         String   @id @default(cuid())
  url        String
  propertyId String
  sortIndex  Int?     @default(0)
  property   Property @relation(name: "PropertyToPhotos", fields: [propertyId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([propertyId])
}
```

#### **RealEstateLead**
```prisma
model RealEstateLead {
  id        String   @id @default(cuid())
  ownerUid  String   // Backward compatibility
  orgId     String?  // Organization scope
  fullName  String?
  phone     String?
  email     String?
  message   String?
  source    String?  // FACEBOOK, INSTAGRAM, CSV_UPLOAD, etc.

  propertyId   String?
  property     Property?             @relation(name: "PropertyToLeads", fields: [propertyId], references: [id])
  organization Organization?         @relation(fields: [orgId], references: [id])
  events       RealEstateLeadEvent[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerUid])
  @@index([orgId])
  @@index([propertyId])
  @@index([phone])
  @@index([email])
  @@index([source])
}
```

#### **RealEstateLeadEvent**
```prisma
model RealEstateLeadEvent {
  id       String           @id @default(cuid())
  leadId   String
  lead     RealEstateLead   @relation(fields: [leadId], references: [id], onDelete: Cascade)
  eventType String          // 'contacted', 'qualified', 'meeting_scheduled', etc.
  notes    String?
  createdAt DateTime        @default(now())

  @@index([leadId])
}
```

#### **Campaign**
```prisma
model Campaign {
  id          String          @id @default(cuid())
  ownerUid    String
  orgId       String?
  name        String
  status      CampaignStatus  @default(DRAFT)
  platform    CampaignPlatform // META, GOOGLE, TIKTOK, LINKEDIN
  goal        CampaignGoal    // TRAFFIC, CONVERSIONS, LEADS, etc.

  // Targeting
  targetAudience Json?
  budget         Float?
  startDate      DateTime?
  endDate        DateTime?

  // Creative
  adCopy         String?
  imageUrl       String?
  landingPageUrl String?

  // Performance
  impressions    Int?      @default(0)
  clicks         Int?      @default(0)
  conversions    Int?      @default(0)
  spend          Float?    @default(0)

  organization Organization? @relation(fields: [orgId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerUid])
  @@index([orgId])
  @@index([status])
}
```

#### **Integration**
```prisma
model Integration {
  id          String             @id @default(cuid())
  ownerUid    String
  orgId       String?
  type        IntegrationType    // HUBSPOT, ZOHO, YAD2, MADLAN, etc.
  status      IntegrationStatus  @default(DISCONNECTED)

  // OAuth credentials (encrypted)
  accessToken  String?
  refreshToken String?
  expiresAt    DateTime?

  // Settings
  settings     Json?              // Integration-specific config

  // Sync tracking
  lastSyncAt   DateTime?
  syncLogs     IntegrationSyncLog[]

  organization Organization?      @relation(fields: [orgId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerUid])
  @@index([orgId])
  @@index([type])
}
```

#### **Automation**
```prisma
model Automation {
  id          String            @id @default(cuid())
  ownerUid    String
  orgId       String?
  name        String
  description String?
  status      AutomationStatus  @default(DRAFT)

  // Flow definition
  trigger     Json              // Trigger config (NEW_LEAD, PROPERTY_CREATED, etc.)
  actions     Json              // Array of actions to execute

  // Execution tracking
  executions  AutomationExecution[]

  organization Organization?    @relation(fields: [orgId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerUid])
  @@index([orgId])
  @@index([status])
}
```

### 3.2 Enums

```typescript
enum PropertyStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum TransactionType {
  SALE
  RENT
}

enum PropertyType {
  APARTMENT
  HOUSE
  VILLA
  PENTHOUSE
  DUPLEX
  COTTAGE
  OFFICE
  STORE
  LOT
  COMMERCIAL
  OTHER
}

enum PropertyProvider {
  MANUAL
  YAD2
  MADLAN
  ZILLOW
  AIRBNB
  BOOKING
  GUESTY
  OTHER
}

enum SyncStatus {
  IDLE
  SYNCING
  PENDING
  SUCCESS
  ERROR
}

enum LeadSource {
  FACEBOOK
  INSTAGRAM
  WHATSAPP
  CSV_UPLOAD
  GOOGLE_SHEETS
  MANUAL
  OTHER
}

enum CampaignStatus {
  DRAFT
  READY
  SCHEDULED
  ACTIVE
  PAUSED
  ARCHIVED
  FAILED
}

enum CampaignPlatform {
  META
  GOOGLE
  TIKTOK
  LINKEDIN
}

enum CampaignGoal {
  TRAFFIC
  CONVERSIONS
  LEADS
  BRAND_AWARENESS
  REACH
  ENGAGEMENT
}

enum IntegrationType {
  HUBSPOT
  ZOHO
  MONDAY
  SALESFORCE
  YAD2
  MADLAN
  ZILLOW
  FACEBOOK_LEADS
  INSTAGRAM_LEADS
  GOOGLE_CALENDAR
  CUSTOM_WEBHOOK
}

enum IntegrationStatus {
  CONNECTED
  DISCONNECTED
  ERROR
  SYNCING
}

enum AutomationStatus {
  ACTIVE
  PAUSED
  DRAFT
}
```

### 3.3 Entity Relationship Diagram

```
┌─────────────────┐
│  Organization   │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴──────────────────────────┬──────────────┬───────────────┐
    │                               │              │               │
┌───▼────────┐  ┌──────────────┐  ┌▼────────┐  ┌──▼──────────┐  ┌▼──────────┐
│  Property  │  │   Campaign   │  │ Lead    │  │ Integration │  │Automation │
└───┬───┬────┘  └──────────────┘  └──┬──────┘  └─────────────┘  └───────────┘
    │   │                             │
    │   │ 1:N                         │
    │   │                             │
    │   │                        ┌────▼─────────────────┐
    │   └────────────────────────│ RealEstateLeadEvent  │
    │                            └──────────────────────┘
    │ 1:N
    │
┌───▼────────────┐
│ PropertyPhoto  │
└────────────────┘
```

---

## 4. Pages & Routes

### 4.1 Dashboard Routes

| Route | Component | Purpose | Auth Required |
|-------|-----------|---------|---------------|
| `/dashboard/real-estate/dashboard` | RealEstateDashboard | Main analytics dashboard | ✅ |
| `/dashboard/real-estate/properties` | PropertiesClient | Property list with filters | ✅ |
| `/dashboard/real-estate/properties/new` | CreateProperty | Create new property | ✅ |
| `/dashboard/real-estate/properties/[slug]` | PropertyDetail | Property detail view | ✅ |
| `/dashboard/real-estate/[id]/edit` | EditProperty | Edit existing property | ✅ |
| `/dashboard/real-estate/leads` | LeadsClient | Lead management table | ✅ |
| `/dashboard/real-estate/campaigns` | CampaignsClient | Campaign management | ✅ |
| `/dashboard/real-estate/automations` | AutomationsClient | Automation builder | ✅ |
| `/dashboard/real-estate/integrations` | IntegrationsClient | Integration hub | ✅ |
| `/dashboard/real-estate/reports` | ReportsPage | Analytics & reports | ✅ |
| `/dashboard/real-estate/ai-searcher` | AISearcher | AI property search | ✅ |
| `/dashboard/real-estate/calendar` | Calendar | Event calendar | ✅ |
| `/dashboard/real-estate/customers` | Customers | Customer management | ✅ |

### 4.2 Public Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/real-estate` | RealEstateLanding | Public landing page |
| `/real-estate/[slug]` | PublicPropertyLanding | Public property page |
| `/property/[slug]` | PublicPropertyLanding | Alias for property page |

### 4.3 Page Features

#### **Dashboard (`/dashboard/real-estate/dashboard`)**
- **Sections**:
  - Leads & Marketing (lead quality, campaigns)
  - Listings & Inventory (imported properties, performance)
  - Deals & Revenue (financial flow, revenue tracking)
  - Operations & Productivity (matter pipeline, open house)
  - Client Experience (neighborhood guide, comparables)
  - Compliance & Risk (deadlines timeline)
  - Market Intelligence (auto-marketing suggestions)
  - Automation Health (automation status)

- **Widgets**:
  - `LeadsQualityWidget` - Lead scoring distribution
  - `RevenueWidget` - Revenue over time chart
  - `FinancialFlow` - Cash flow visualization
  - `MatterPipeline` - Deal pipeline Kanban
  - `ImportedPropertiesWidget` - Sync status from Yad2/Madlan
  - `ListingsPerformanceWidget` - Top-performing listings
  - `CompsWidget` - Comparable properties
  - `OpenHouseWidget` - Upcoming open houses
  - `NeighborhoodGuideWidget` - Area insights
  - `AutoMarketingWidget` - AI marketing suggestions
  - `OperationsWidget` - Task management
  - `DeadlinesTimeline` - Critical dates

#### **Properties (`/dashboard/real-estate/properties`)**
- **Features**:
  - Table view with pagination
  - Filters: status, type, transaction type, city, price range
  - Search: by name, address, agent
  - Sort: by date, price, rooms, size
  - Bulk actions: publish, archive, delete
  - Quick actions: edit, view, duplicate
  - AI scoring badge
  - Import from Yad2/Madlan
  - Export to CSV

- **Columns**:
  - Photo thumbnail
  - Name/Address
  - Type/Transaction
  - Price
  - Rooms/Size
  - Status badge
  - AI Score
  - Agent assigned
  - Created date
  - Actions menu

#### **Leads (`/dashboard/real-estate/leads`)**
- **Features**:
  - Table view with pagination
  - Filters: source, date range, property
  - Search: by name, phone, email
  - Lead qualification scoring
  - WhatsApp integration
  - Link to property
  - Event timeline per lead
  - Import from CSV
  - Export to CRM

- **Actions**:
  - Create lead
  - Edit lead
  - Qualify lead (AI-powered)
  - Link to property
  - Send WhatsApp message
  - View event history
  - Mark as converted/disqualified

#### **Campaigns (`/dashboard/real-estate/campaigns`)**
- **Features**:
  - Card grid layout
  - Platform badges (Meta, Google, TikTok, LinkedIn)
  - Status indicators
  - Performance metrics (impressions, clicks, conversions)
  - Budget tracking
  - Duplicate campaign
  - Pause/resume controls

- **Campaign Creation**:
  - Platform selection
  - Goal selection (traffic, conversions, leads)
  - Audience targeting
  - Budget allocation
  - Creative upload (image/video)
  - Ad copy generator (AI)
  - Schedule start/end dates

#### **Automations (`/dashboard/real-estate/automations`)**
- **Features**:
  - Visual flow builder (drag & drop)
  - Pre-built templates
  - Trigger options: NEW_LEAD, HOT_LEAD, FIRST_CONTACT, NO_RESPONSE_24H
  - Action options: SEND_EMAIL, SEND_WHATSAPP, SEND_SMS, CREATE_TASK, NOTIFY_AGENT
  - Execution logs
  - Enable/disable toggle

- **Templates**:
  - Lead follow-up sequence
  - Property inquiry response
  - Hot lead escalation
  - Open house invitation
  - Price drop notification

#### **Integrations (`/dashboard/real-estate/integrations`)**
- **Supported Integrations**:
  - **CRMs**: HubSpot, Zoho, Salesforce, Monday.com
  - **Property Platforms**: Yad2, Madlan, Zillow
  - **Calendars**: Google Calendar, Outlook, Apple Calendar
  - **Social**: Facebook Leads, Instagram Leads
  - **Automation**: Zapier, Make (Integromat)
  - **Custom**: Webhooks

- **Features**:
  - OAuth connection flow
  - Sync status indicators
  - Last sync timestamp
  - Settings configuration
  - Manual sync trigger
  - Disconnect option
  - Sync logs viewer

#### **Reports (`/dashboard/real-estate/reports`)**
- **Charts**:
  - Leads over time (line chart)
  - Leads by source (pie chart)
  - Lead status distribution (bar chart)
  - Properties performance (bar chart)
  - Response time trend (line chart)
  - Revenue by property type (pie chart)

- **Filters**:
  - Date range picker
  - Agent filter
  - Property type filter
  - Source filter

- **Export**:
  - PDF report generation
  - CSV data export

#### **AI Searcher (`/dashboard/real-estate/ai-searcher`)**
- **Features**:
  - Natural language search
  - Multi-source aggregation (Yad2, Madlan, internal)
  - AI property scoring
  - Enrichment with market data
  - Save search criteria
  - Alert on new matches

---

## 5. API Endpoints

### 5.1 Property Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/api/real-estate/properties` | List properties | Query: status, type, city, limit, offset | `{ properties: Property[], total: number }` |
| POST | `/api/real-estate/properties` | Create property | `CreatePropertyInput` | `{ property: Property }` |
| GET | `/api/real-estate/properties/[id]` | Get property by ID | - | `{ property: Property }` |
| PATCH | `/api/real-estate/properties/[id]` | Update property | `UpdatePropertyInput` | `{ property: Property }` |
| DELETE | `/api/real-estate/properties/[id]` | Delete property | - | `{ success: boolean }` |
| POST | `/api/real-estate/properties/[id]/assign-agent` | Assign agent | `{ agentId: string }` | `{ property: Property }` |
| GET | `/api/real-estate/properties/[id]/slug` | Generate unique slug | - | `{ slug: string }` |
| GET | `/api/real-estate/properties/search` | AI-powered search | Query: query, sources[] | `{ results: Listing[], job: SearchJob }` |

### 5.2 Lead Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/api/real-estate/leads` | List leads | Query: source, propertyId, limit, offset | `{ leads: RealEstateLead[], total: number }` |
| POST | `/api/real-estate/leads` | Create lead | `CreateLeadInput` | `{ lead: RealEstateLead }` |
| GET | `/api/real-estate/leads/[id]` | Get lead by ID | - | `{ lead: RealEstateLead }` |
| PATCH | `/api/real-estate/leads/[id]` | Update lead | `UpdateLeadInput` | `{ lead: RealEstateLead }` |
| DELETE | `/api/real-estate/leads/[id]` | Delete lead | - | `{ success: boolean }` |
| POST | `/api/real-estate/leads/[id]/qualify` | Qualify lead with AI | `{ notes?: string }` | `{ lead: RealEstateLead, score: number, insights: object }` |
| POST | `/api/real-estate/leads/[id]/link-property` | Link lead to property | `{ propertyId: string }` | `{ lead: RealEstateLead }` |
| GET | `/api/real-estate/leads/[id]/events` | Get lead events | - | `{ events: RealEstateLeadEvent[] }` |
| POST | `/api/real-estate/leads/import` | Import leads from CSV | FormData with file | `{ imported: number, failed: number, errors: string[] }` |
| GET | `/api/real-estate/leads/export` | Export leads to CSV | Query: filters | CSV file download |

### 5.3 Campaign Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/api/real-estate/campaigns` | List campaigns | Query: status, platform, limit, offset | `{ campaigns: Campaign[], total: number }` |
| POST | `/api/real-estate/campaigns` | Create campaign | `CreateCampaignInput` | `{ campaign: Campaign }` |
| GET | `/api/real-estate/campaigns/[id]` | Get campaign by ID | - | `{ campaign: Campaign }` |
| PATCH | `/api/real-estate/campaigns/[id]` | Update campaign | `UpdateCampaignInput` | `{ campaign: Campaign }` |
| DELETE | `/api/real-estate/campaigns/[id]` | Delete campaign | - | `{ success: boolean }` |

### 5.4 Automation Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/api/real-estate/automations` | List automations | Query: status, limit, offset | `{ automations: Automation[], total: number }` |
| POST | `/api/real-estate/automations` | Create automation | `CreateAutomationInput` | `{ automation: Automation }` |
| GET | `/api/real-estate/automations/[id]` | Get automation by ID | - | `{ automation: Automation }` |
| PATCH | `/api/real-estate/automations/[id]` | Update automation | `UpdateAutomationInput` | `{ automation: Automation }` |
| DELETE | `/api/real-estate/automations/[id]` | Delete automation | - | `{ success: boolean }` |
| POST | `/api/real-estate/automations/[id]/toggle` | Enable/disable | - | `{ automation: Automation }` |
| POST | `/api/real-estate/automations/execute` | Manual execution | `{ automationId: string, context: object }` | `{ execution: AutomationExecution }` |

### 5.5 Integration Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/api/real-estate/integrations` | List integrations | - | `{ integrations: Integration[] }` |
| POST | `/api/real-estate/integrations` | Create integration | `CreateIntegrationInput` | `{ integration: Integration }` |
| GET | `/api/real-estate/integrations/[id]` | Get integration | - | `{ integration: Integration }` |
| PATCH | `/api/real-estate/integrations/[id]` | Update settings | `UpdateIntegrationInput` | `{ integration: Integration }` |
| DELETE | `/api/real-estate/integrations/[id]` | Disconnect | - | `{ success: boolean }` |
| POST | `/api/real-estate/integrations/[id]/sync` | Trigger sync | - | `{ syncLog: IntegrationSyncLog }` |
| GET | `/api/real-estate/integrations/oauth/[platform]` | Initiate OAuth | - | Redirect to OAuth provider |
| GET | `/api/real-estate/integrations/oauth/callback` | OAuth callback | Query: code, state | Redirect to integrations page |

### 5.6 Dashboard & Reports Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/api/real-estate/dashboard` | Get dashboard data | Query: dateRange | `{ widgets: object }` |
| GET | `/api/real-estate/reports` | Get analytics data | Query: dateRange, filters | `{ reports: object }` |

### 5.7 AI Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/api/real-estate/ai-advisor` | Get AI property advice | `{ propertyId: string, question: string }` | `{ response: string }` |
| POST | `/api/real-estate/qualify-lead` | AI lead qualification | `{ leadId: string }` | `{ score: number, insights: object }` |
| POST | `/api/real-estate/property-ad-generator` | Generate ad copy | `{ propertyId: string, platform: string }` | `{ adCopy: string, suggestions: string[] }` |

---

## 6. UI Components

### 6.1 Shared Components

| Component | Path | Purpose |
|-----------|------|---------|
| `PropertyAdGenerator` | `components/real-estate/PropertyAdGenerator.tsx` | AI-powered ad copy generation |
| `LeadQualificationBot` | `components/real-estate/LeadQualificationBot.tsx` | AI lead scoring interface |
| `AIAdvisorBot` | `components/real-estate/AIAdvisorBot.tsx` | Chatbot for property advice |
| `ScoreBadge` | `components/real-estate/ScoreBadge.tsx` | Visual score indicator |
| `AssignAgentModal` | `components/real-estate/AssignAgentModal.tsx` | Agent assignment dialog |
| `AssignAgentButton` | `components/real-estate/AssignAgentButton.tsx` | Quick assign button |

### 6.2 Lead Components

| Component | Purpose |
|-----------|---------|
| `CreateLeadModal` | Form to create new lead |
| `EditLeadModal` | Form to edit existing lead |
| `ViewLeadModal` | Read-only lead details |
| `QualifyLeadModal` | AI qualification interface |
| `LinkPropertyModal` | Link lead to property |
| `ImportLeadsModal` | CSV import wizard |
| `WhatsAppActions` | WhatsApp messaging actions |

### 6.3 Campaign Components

| Component | Purpose |
|-----------|---------|
| `CampaignCard` | Campaign summary card |
| `CreateCampaignModal` | Multi-step campaign creation |
| `EditCampaignModal` | Campaign editor |

### 6.4 Automation Components

| Component | Purpose |
|-----------|---------|
| `AutomationCard` | Automation summary card |
| `VisualFlowBuilder` | Drag-and-drop flow editor |
| `AutomationBuilderModal` | Automation creation wizard |
| `AutomationTemplates` | Pre-built automation templates |

### 6.5 Integration Components

| Component | Purpose |
|-----------|---------|
| `IntegrationCard` | Integration status card |
| `ConnectIntegrationModal` | OAuth connection flow |
| `IntegrationSettingsModal` | Integration configuration |

### 6.6 Report Components

| Component | Purpose |
|-----------|---------|
| `LeadsOverTimeChart` | Line chart of lead volume |
| `LeadsBySourceChart` | Pie chart of lead sources |
| `LeadStatusChart` | Bar chart of lead pipeline |
| `PropertiesPerformanceChart` | Property metrics comparison |
| `ResponseTimeTrendChart` | Response time analysis |
| `RevenueByTypeChart` | Revenue breakdown |
| `ExportPDFButton` | Report export to PDF |

### 6.7 Dashboard Widgets

| Widget | Purpose |
|--------|---------|
| `LeadsQualityWidget` | Lead quality distribution |
| `RevenueWidget` | Revenue over time |
| `FinancialFlow` | Cash flow visualization |
| `MatterPipeline` | Deal pipeline Kanban |
| `ImportedPropertiesWidget` | Import sync status |
| `ListingsPerformanceWidget` | Top listings |
| `CompsWidget` | Comparable properties |
| `OpenHouseWidget` | Upcoming events |
| `NeighborhoodGuideWidget` | Area insights |
| `AutoMarketingWidget` | AI marketing suggestions |
| `OperationsWidget` | Task management |
| `DeadlinesTimeline` | Critical dates |

---

## 7. State Management

### 7.1 React Query (TanStack Query)

**Usage**: Server state management for all API calls

**Query Keys Structure**:
```typescript
// Properties
['real-estate', 'properties'] // List
['real-estate', 'properties', propertyId] // Detail
['real-estate', 'properties', 'search', query] // Search

// Leads
['real-estate', 'leads'] // List
['real-estate', 'leads', leadId] // Detail
['real-estate', 'leads', leadId, 'events'] // Events

// Campaigns
['real-estate', 'campaigns'] // List
['real-estate', 'campaigns', campaignId] // Detail

// Automations
['real-estate', 'automations'] // List
['real-estate', 'automations', automationId] // Detail

// Integrations
['real-estate', 'integrations'] // List
['real-estate', 'integrations', integrationId] // Detail

// Dashboard
['real-estate', 'dashboard', dateRange] // Dashboard data
['real-estate', 'reports', dateRange, filters] // Reports
```

**Example Hook**:
```typescript
// Custom hook for properties
export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['real-estate', 'properties', filters],
    queryFn: async () => {
      const response = await fetch('/api/real-estate/properties?' + new URLSearchParams(filters));
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation hook for creating property
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePropertyInput) => {
      const response = await fetch('/api/real-estate/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate properties list
      queryClient.invalidateQueries({ queryKey: ['real-estate', 'properties'] });
      toast.success('Property created successfully');
    },
  });
}
```

### 7.2 React Context (Global State)

**Usage**: User preferences, UI state, global settings

**Contexts**:
- `LanguageContext` - i18n language selection
- `ThemeContext` - Dark/light mode
- `OrganizationContext` - Current organization data
- `UserContext` - Current user data

---

## 8. Integrations

### 8.1 Property Platform Integrations

#### **Yad2 (Israel)**
- **Type**: Real estate listings aggregator
- **Features**:
  - Import listings by URL
  - Bulk import from search results
  - Sync property updates
  - Track price changes
- **API**: Web scraping + API (if available)
- **OAuth**: Not required
- **Implementation**: `IntegrationType.YAD2`

#### **Madlan (Israel)**
- **Type**: Real estate listings aggregator
- **Features**:
  - Import listings by URL
  - Market data enrichment
  - Price history
- **API**: Web scraping + API
- **OAuth**: Not required
- **Implementation**: `IntegrationType.MADLAN`

#### **Zillow (US)**
- **Type**: Real estate marketplace
- **Features**:
  - Property search
  - Zestimate pricing
  - Market trends
- **API**: Zillow API (limited)
- **OAuth**: API Key
- **Implementation**: `IntegrationType.ZILLOW`

### 8.2 CRM Integrations

#### **HubSpot**
- **Type**: CRM platform
- **Features**:
  - Sync contacts (leads)
  - Sync deals (properties)
  - Activity tracking
  - Automated workflows
- **API**: HubSpot REST API
- **OAuth**: OAuth 2.0
- **Scopes**: `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.deals.read`, `crm.objects.deals.write`
- **Implementation**: `IntegrationType.HUBSPOT`

#### **Zoho CRM**
- **Type**: CRM platform
- **Features**:
  - Sync contacts
  - Sync leads
  - Custom modules
- **API**: Zoho CRM API
- **OAuth**: OAuth 2.0
- **Implementation**: `IntegrationType.ZOHO`

#### **Salesforce**
- **Type**: Enterprise CRM
- **Features**:
  - Sync leads
  - Sync opportunities
  - Custom objects
- **API**: Salesforce REST API
- **OAuth**: OAuth 2.0
- **Implementation**: `IntegrationType.SALESFORCE`

### 8.3 Marketing Platform Integrations

#### **Meta (Facebook/Instagram)**
- **Type**: Social media advertising
- **Features**:
  - Create ad campaigns
  - Lead ads integration
  - Track conversions
  - Audience insights
- **API**: Meta Marketing API
- **OAuth**: OAuth 2.0
- **Permissions**: `ads_management`, `ads_read`, `leads_retrieval`
- **Implementation**: `CampaignPlatform.META`

#### **Google Ads**
- **Type**: Search advertising
- **Features**:
  - Create search campaigns
  - Display ads
  - Performance tracking
- **API**: Google Ads API
- **OAuth**: OAuth 2.0
- **Implementation**: `CampaignPlatform.GOOGLE`

#### **TikTok Ads**
- **Type**: Social video advertising
- **Features**:
  - Create video campaigns
  - Lead generation
  - Performance tracking
- **API**: TikTok Marketing API
- **OAuth**: OAuth 2.0
- **Implementation**: `CampaignPlatform.TIKTOK`

### 8.4 Calendar Integrations

#### **Google Calendar**
- **Type**: Calendar sync
- **Features**:
  - Sync open house events
  - Meeting scheduling
  - Reminders
- **API**: Google Calendar API
- **OAuth**: OAuth 2.0
- **Implementation**: `IntegrationType.GOOGLE_CALENDAR`

### 8.5 Automation Platforms

#### **Zapier**
- **Type**: Integration platform
- **Features**:
  - Trigger webhooks on events
  - Connect 5000+ apps
- **API**: Webhooks
- **Implementation**: `IntegrationType.ZAPIER`

#### **Make (Integromat)**
- **Type**: Integration platform
- **Features**:
  - Complex workflows
  - Data transformation
- **API**: Webhooks
- **Implementation**: `IntegrationType.MAKE`

---

## 9. AI Features

### 9.1 Property Scoring

**Purpose**: Automatically score properties based on market data, location, condition

**Implementation**:
- **Trigger**: On property creation or update
- **AI Model**: OpenAI GPT-4
- **Input**: Property details (location, size, price, amenities, photos)
- **Output**:
  - Score: 0-100
  - Category: excellent, good, fair, poor
  - Insights: JSON with reasons, market comparison, recommendations

**API Endpoint**: Internal processing, stored in `Property.aiScore`, `Property.aiInsights`

**Example Insight**:
```json
{
  "score": 85,
  "category": "excellent",
  "reasons": [
    "Prime location in Tel Aviv city center",
    "Recently renovated",
    "Competitive pricing vs market average"
  ],
  "marketComparison": {
    "avgPricePerSqm": 45000,
    "propertyPricePerSqm": 42000,
    "percentBelowMarket": 7
  },
  "recommendations": [
    "Highlight renovation in marketing",
    "Emphasize location proximity to public transport"
  ]
}
```

### 9.2 Lead Qualification

**Purpose**: Score and qualify leads automatically

**Implementation**:
- **Trigger**: Manual (via QualifyLeadModal) or automatic (on lead creation)
- **AI Model**: OpenAI GPT-4
- **Input**: Lead data (message, source, linked property, history)
- **Output**:
  - Score: HOT, WARM, COLD
  - Priority: HIGH, MEDIUM, LOW
  - Insights: Buying intent, timeline, budget estimation

**API Endpoint**: `POST /api/real-estate/qualify-lead`

**Example Response**:
```json
{
  "score": "HOT",
  "priority": "HIGH",
  "insights": {
    "buyingIntent": "immediate",
    "estimatedTimeline": "1-2 weeks",
    "budgetRange": "$500k-$600k",
    "concerns": ["Mortgage pre-approval needed"],
    "nextSteps": ["Schedule viewing", "Discuss financing options"]
  }
}
```

### 9.3 Property Ad Generation

**Purpose**: Generate compelling ad copy for different platforms

**Implementation**:
- **Trigger**: Manual (via PropertyAdGenerator component)
- **AI Model**: OpenAI GPT-4
- **Input**: Property details, target platform (Facebook, Instagram, Google)
- **Output**: Platform-optimized ad copy with multiple variations

**API Endpoint**: `POST /api/real-estate/property-ad-generator`

**Example Request**:
```json
{
  "propertyId": "prop_123",
  "platform": "FACEBOOK",
  "tone": "professional",
  "language": "en"
}
```

**Example Response**:
```json
{
  "adCopy": {
    "headline": "Stunning 3BR Apartment in Prime Tel Aviv Location",
    "body": "Discover your dream home in the heart of Tel Aviv. This beautifully renovated 3-bedroom apartment features modern finishes, abundant natural light, and breathtaking city views. Walk to cafes, restaurants, and public transport. Schedule your private viewing today!",
    "callToAction": "Book a Viewing"
  },
  "variations": [
    {
      "headline": "Your Perfect Tel Aviv Home Awaits",
      "body": "..."
    }
  ],
  "suggestions": [
    "Use high-quality photos of the living room and balcony",
    "Target audience: 30-45 years old, looking to buy",
    "Best performing time: Weekday evenings"
  ]
}
```

### 9.4 AI Property Search

**Purpose**: Natural language property search across multiple sources

**Implementation**:
- **Page**: `/dashboard/real-estate/ai-searcher`
- **AI Model**: OpenAI GPT-4 (query understanding) + aggregation
- **Input**: Natural language query (e.g., "3 bedroom apartment in Tel Aviv under $600k")
- **Sources**: Internal database, Yad2, Madlan, Zillow
- **Output**: Enriched listings with AI scoring

**API Endpoint**: `GET /api/real-estate/properties/search`

**Example Query**:
```
"Find me a modern apartment with 3 bedrooms near Rothschild Boulevard,
budget up to 3 million ILS, with parking and a balcony"
```

**Processing**:
1. Parse query with GPT-4 to extract filters
2. Query multiple sources in parallel
3. Deduplicate results
4. Enrich with market data
5. Score with AI
6. Rank by relevance

---

## 10. Data Flow

### 10.1 Property Creation Flow

```
User fills form
    ↓
Client validation (React Hook Form + Zod)
    ↓
POST /api/real-estate/properties
    ↓
Server validation
    ↓
Prisma create Property record
    ↓
Generate slug
    ↓
Trigger AI scoring (async)
    ↓
Return property to client
    ↓
React Query updates cache
    ↓
UI reflects new property
    ↓
(Background) AI scoring completes
    ↓
(Background) Update property with aiScore
    ↓
React Query refetches on next focus
```

### 10.2 Lead Import Flow

```
User uploads CSV file
    ↓
POST /api/real-estate/leads/import (multipart/form-data)
    ↓
Server parses CSV
    ↓
Validate each row (email, phone format)
    ↓
Bulk create leads in Prisma
    ↓
Track import errors
    ↓
Return import summary
    ↓
Client shows success/error notifications
    ↓
(Background) Trigger automation: NEW_LEAD
    ↓
(Background) Send welcome WhatsApp message
```

### 10.3 Campaign Creation Flow

```
User fills campaign form
    ↓
POST /api/real-estate/campaigns
    ↓
Server validates
    ↓
Store campaign in database (status: DRAFT)
    ↓
Return campaign to client
    ↓
User clicks "Activate"
    ↓
PATCH /api/real-estate/campaigns/[id] (status: ACTIVE)
    ↓
Server calls Meta/Google API
    ↓
Create ad campaign on platform
    ↓
Store platform campaign ID
    ↓
Start background job to fetch performance metrics
    ↓
Update campaign with impressions/clicks/spend
```

### 10.4 Integration Sync Flow

```
User connects Yad2 integration
    ↓
Server stores integration (status: CONNECTED)
    ↓
User clicks "Sync Now"
    ↓
POST /api/real-estate/integrations/[id]/sync
    ↓
Create IntegrationSyncLog (status: PENDING)
    ↓
Fetch listings from Yad2 API
    ↓
For each listing:
    Check if exists (by externalId)
    If not, create Property
    If yes, update Property (if changed)
    Track sync status
    ↓
Update IntegrationSyncLog (status: SUCCESS/ERROR)
    ↓
Return sync summary to client
```

### 10.5 Automation Execution Flow

```
Trigger event occurs (e.g., NEW_LEAD created)
    ↓
Check for active automations with matching trigger
    ↓
For each automation:
    Create AutomationExecution record
    Load automation.actions array
    For each action:
        Execute action (SEND_EMAIL, SEND_WHATSAPP, etc.)
        Log action result
    Update AutomationExecution (status: SUCCESS/FAILED)
    ↓
Track execution metrics
```

---

## 11. Dependencies

### 11.1 Frontend Dependencies

**Core Framework**:
```json
{
  "next": "15.5.5",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.3.0"
}
```

**UI & Styling**:
```json
{
  "tailwindcss": "^4.0.0",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-tooltip": "^1.0.7",
  "framer-motion": "^11.0.0",
  "lucide-react": "^0.300.0"
}
```

**Forms & Validation**:
```json
{
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0"
}
```

**State Management**:
```json
{
  "@tanstack/react-query": "^5.0.0"
}
```

**Data Visualization**:
```json
{
  "recharts": "^2.10.0"
}
```

**File Handling**:
```json
{
  "papaparse": "^5.4.0",
  "react-dropzone": "^14.2.0"
}
```

**Date Handling**:
```json
{
  "date-fns": "^3.0.0"
}
```

### 11.2 Backend Dependencies

**ORM & Database**:
```json
{
  "@prisma/client": "^5.7.0",
  "prisma": "^5.7.0"
}
```

**API Integrations**:
```json
{
  "openai": "^4.20.0",
  "axios": "^1.6.0"
}
```

### 11.3 Development Dependencies

```json
{
  "@types/node": "^20.10.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "eslint": "^8.55.0",
  "prettier": "^3.1.0",
  "playwright": "^1.40.0"
}
```

---

## 12. Environment Variables

### 12.1 Database

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
DIRECT_URL="postgresql://user:pass@host:5432/dbname"
SHADOW_DATABASE_URL="postgresql://user:pass@host:5432/shadow_db"
```

### 12.2 Authentication

```env
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://effinity.co.il"
```

### 12.3 AI & OpenAI

```env
OPENAI_API_KEY="sk-..."
OPENAI_ORG_ID="org-..."
```

### 12.4 Meta (Facebook/Instagram)

```env
META_APP_ID="your-app-id"
META_APP_SECRET="your-app-secret"
META_ACCESS_TOKEN="your-access-token"
```

### 12.5 Google

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_ADS_DEVELOPER_TOKEN="your-dev-token"
```

### 12.6 TikTok

```env
TIKTOK_APP_ID="your-app-id"
TIKTOK_APP_SECRET="your-app-secret"
```

### 12.7 Property Platforms

```env
YAD2_API_KEY="your-api-key" # If available
MADLAN_API_KEY="your-api-key" # If available
ZILLOW_API_KEY="your-api-key"
```

### 12.8 CRM Integrations

```env
HUBSPOT_CLIENT_ID="your-client-id"
HUBSPOT_CLIENT_SECRET="your-client-secret"

ZOHO_CLIENT_ID="your-client-id"
ZOHO_CLIENT_SECRET="your-client-secret"

SALESFORCE_CLIENT_ID="your-client-id"
SALESFORCE_CLIENT_SECRET="your-client-secret"
```

### 12.9 File Storage

```env
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="effinity-properties"
```

### 12.10 WhatsApp

```env
WHATSAPP_BUSINESS_ACCOUNT_ID="your-account-id"
WHATSAPP_ACCESS_TOKEN="your-access-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
```

---

## 13. Summary & Data Flow Diagram

### 13.1 Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  (Next.js 15 App Router + React 18 + Tailwind CSS)            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      API Routes Layer                           │
│              (Next.js API Routes)                              │
│  /api/real-estate/properties, /leads, /campaigns, etc.        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │                 │
           ┌───────▼──────┐  ┌──────▼───────┐
           │ Prisma ORM   │  │ External APIs│
           │              │  │              │
           │ - Property   │  │ - OpenAI     │
           │ - Lead       │  │ - Meta Ads   │
           │ - Campaign   │  │ - Yad2       │
           │ - Integration│  │ - HubSpot    │
           │ - Automation │  │ - etc.       │
           └───────┬──────┘  └──────────────┘
                   │
           ┌───────▼──────┐
           │  PostgreSQL  │
           │   (Neon)     │
           └──────────────┘
```

### 13.2 Request Flow Example (Property Creation)

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Fills form
     ▼
┌─────────────────┐
│ PropertiesClient│
│  Component      │
└────┬────────────┘
     │ 2. Submits (React Hook Form)
     ▼
┌──────────────────────┐
│ useCreateProperty()  │
│  React Query Hook    │
└────┬─────────────────┘
     │ 3. POST request
     ▼
┌───────────────────────────────┐
│ /api/real-estate/properties   │
│    API Route Handler          │
└────┬──────────────────────────┘
     │ 4. Validate (Zod schema)
     ▼
┌─────────────────────┐
│  Prisma Client      │
│  prisma.property    │
│  .create()          │
└────┬────────────────┘
     │ 5. SQL INSERT
     ▼
┌──────────────┐
│ PostgreSQL   │
│  Database    │
└────┬─────────┘
     │ 6. Return created record
     ▼
┌───────────────────────────────┐
│ API Route                     │
│ - Generate slug               │
│ - Trigger AI scoring (async)  │
│ - Return JSON response        │
└────┬──────────────────────────┘
     │ 7. Response with property
     ▼
┌──────────────────────┐
│ React Query          │
│ - Update cache       │
│ - Invalidate queries │
└────┬─────────────────┘
     │ 8. Re-render UI
     ▼
┌─────────────────┐
│  User sees new  │
│  property in    │
│  list           │
└─────────────────┘
```

### 13.3 Module Statistics

- **Total Routes**: 15+ dashboard pages
- **API Endpoints**: 40+ RESTful endpoints
- **Database Models**: 10+ core models
- **UI Components**: 60+ React components
- **Integrations**: 15+ external services
- **AI Features**: 3 core AI capabilities

---

## 14. Next Steps & Recommendations

### 14.1 Potential Improvements

1. **Performance Optimization**:
   - Implement infinite scrolling for properties list
   - Add Redis caching for frequently accessed data
   - Optimize images with Next.js Image component

2. **Feature Enhancements**:
   - Mobile app (React Native)
   - Advanced reporting with custom dashboards
   - Voice search for AI property search
   - Video tours integration

3. **Integration Expansion**:
   - Add more CRM integrations (Pipedrive, Freshsales)
   - Property management software (AppFolio, Buildium)
   - Email marketing (Mailchimp, SendGrid)

4. **AI Capabilities**:
   - Predictive pricing models
   - Automated property description generation
   - Image recognition for property condition assessment
   - Chatbot for website visitors

5. **Security**:
   - Implement rate limiting on APIs
   - Add CSRF protection
   - Encrypt sensitive integration credentials
   - Audit logging for all actions

### 14.2 Testing Strategy

1. **Unit Tests**: Test individual components and utilities
2. **Integration Tests**: Test API endpoints with Prisma
3. **E2E Tests**: Test full user flows with Playwright
4. **Performance Tests**: Measure page load times, API response times
5. **Security Tests**: Penetration testing, vulnerability scanning

---

**Document Version**: 1.0
**Last Updated**: 2025-10-23
**Maintained By**: Effinity Development Team

🤖 Generated with [Claude Code](https://claude.com/claude-code)
