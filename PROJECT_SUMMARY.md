# EFFINITY Platform - Complete Technical Documentation

**Last Updated:** October 15, 2025
**Version:** 1.0
**Project Status:** Production-ready with active development

---

## Table of Contents

1. [General Overview](#1-general-overview)
2. [Project Architecture & Folder Map](#2-project-architecture--folder-map)
3. [Example End-to-End Flows](#3-example-end-to-end-flows)
4. [Frontend (Web Application)](#4-frontend-web-application)
5. [Design System & UI/UX](#5-design-system--uiux)
6. [Backend / API](#6-backend--api)
7. [Database & Models](#7-database--models)
8. [Integrations & External Services](#8-integrations--external-services)
9. [Authentication & Access Logic](#9-authentication--access-logic)
10. [Deployment & Environment](#10-deployment--environment)
11. [UI Pages Summary](#11-ui-pages-summary)
12. [Current Status & Next Steps](#12-current-status--next-steps)

---

## 🧱 1. General Overview

### Project Structure

**EFFINITY** is a **multi-vertical SaaS platform** built as a **Turborepo monorepo** supporting three distinct business verticals:
- **Real Estate** - Property management, lead tracking, AI-powered property search
- **E-Commerce** - Lead management, campaign attribution, sales tracking
- **Production** - Event production, project management, supplier coordination

### Monorepo Architecture

```
all-in-one/
├── apps/
│   ├── web/          # Next.js 15.5 frontend (main application)
│   ├── api/          # NestJS backend API server
│   └── worker/       # Background worker (AWS S3, SQS processing)
├── packages/
│   ├── server/       # Shared server utilities + Prisma schema
│   ├── ui/           # Shared UI components (minimal)
│   ├── lib/          # Shared libraries
│   └── apps/         # Additional shared packages
└── infra/            # Terraform infrastructure (placeholder)
```

### Core Technologies Stack

**Frontend:**
- **Next.js 15.5.5** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5.9.2** - Type safety
- **Tailwind CSS 3.4.1** - Utility-first styling
- **Lucide React** - Icon library
- **Firebase Client SDK 12.2.1** - Authentication
- **SWR** - Data fetching and caching
- **Recharts** - Data visualization

**Backend:**
- **NestJS 10.4.7** - Node.js framework
- **Prisma 6.16.1** - ORM and database toolkit
- **PostgreSQL** - Primary database (Neon.tech hosted)
- **Firebase Admin 13.5.0** - Server-side auth verification
- **Bull/BullMQ** - Job queue management
- **Redis** - Caching and queue backend

**DevOps & Tools:**
- **Turborepo 2.0.6** - Monorepo build system
- **pnpm 8.15.7** - Package manager
- **Node.js 22.x** - Runtime environment
- **Vercel** - Frontend hosting
- **GitHub Actions** - CI/CD (implied)

**External Services:**
- **OpenAI 5.16.0** - AI features
- **Stripe** - Payment processing
- **AWS S3** - File storage
- **Meta/Google/TikTok/LinkedIn APIs** - Campaign integrations

### Global Architecture Flow

```
┌──────────────┐
│   Browser    │
│  (Next.js)   │
└──────┬───────┘
       │ HTTPS
       ▼
┌──────────────────┐
│  Next.js Server  │  ◄─── Firebase Auth (client-side)
│  (Port 3000)     │
└──────┬───────────┘
       │ API calls (/api/*)
       ▼
┌──────────────────┐
│  NestJS API      │  ◄─── Firebase Admin (server-side)
│  (Port 4000)     │
└──────┬───────────┘
       │
       ├─► PostgreSQL (Neon.tech)
       ├─► Redis (Queue/Cache)
       ├─► AWS S3 (File storage)
       ├─► OpenAI API
       ├─► Stripe API
       └─► Meta/Google/TikTok APIs
```

**Data Flow:**
1. User interacts with Next.js frontend
2. Frontend authenticates via Firebase (client SDK)
3. API calls go to Next.js API routes (`/api/*`)
4. Next.js proxies to NestJS backend (`/api` → `localhost:4000/api`)
5. NestJS verifies Firebase tokens, enforces permissions
6. NestJS queries PostgreSQL via Prisma
7. Background jobs queued in Redis/Bull
8. External API integrations (OpenAI, Stripe, campaigns)

---

## 📁 2. Project Architecture & Folder Map

### Complete Directory Structure

```
all-in-one/                              # Monorepo root
│
├── .github/                             # GitHub configuration
│   └── workflows/                       # CI/CD workflows (if configured)
│
├── .vscode/                             # VSCode workspace settings
│   └── settings.json                    # Editor configuration
│
├── apps/                                # All deployable applications
│   │
│   ├── web/                            # Next.js 15.5 Frontend
│   │   ├── __tests__/                  # Test files
│   │   │   └── e2e/                    # End-to-end tests
│   │   │
│   │   ├── app/                        # Next.js App Router (main app)
│   │   │   ├── (marketing)/            # Public marketing pages group
│   │   │   │   ├── layout.tsx          # Marketing layout
│   │   │   │   ├── page.tsx            # Homepage
│   │   │   │   ├── about/              # About page
│   │   │   │   ├── features/           # Features page
│   │   │   │   ├── pricing/            # Pricing page
│   │   │   │   ├── contact/            # Contact page
│   │   │   │   └── demo/               # Demo request page
│   │   │   │
│   │   │   ├── (public)/               # Public pages group (property landing pages)
│   │   │   │   ├── property/[slug]/    # Dynamic property pages
│   │   │   │   └── real-estate/[slug]/ # Alternative property routes
│   │   │   │
│   │   │   ├── login/                  # Login page
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── register/               # Registration page
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── dashboard/              # Protected dashboard routes
│   │   │   │   ├── layout.tsx          # Dashboard layout wrapper
│   │   │   │   │
│   │   │   │   ├── real-estate/        # Real Estate vertical
│   │   │   │   │   ├── layout.tsx      # RE-specific layout
│   │   │   │   │   ├── dashboard/      # RE dashboard overview
│   │   │   │   │   ├── properties/     # Property management
│   │   │   │   │   │   ├── page.tsx    # Properties list
│   │   │   │   │   │   ├── new/        # Create property
│   │   │   │   │   │   └── [slug]/     # Property details
│   │   │   │   │   ├── leads/          # Lead management
│   │   │   │   │   ├── campaigns/      # Campaign management
│   │   │   │   │   ├── automations/    # Workflow automations
│   │   │   │   │   ├── integrations/   # External integrations
│   │   │   │   │   ├── ai-searcher/    # AI property search
│   │   │   │   │   └── reports/        # Analytics & reports
│   │   │   │   │
│   │   │   │   ├── e-commerce/         # E-Commerce vertical
│   │   │   │   │   ├── layout.tsx      # EC-specific layout
│   │   │   │   │   ├── dashboard/      # EC dashboard overview
│   │   │   │   │   ├── leads/          # Lead management
│   │   │   │   │   │   ├── page.tsx    # Leads list
│   │   │   │   │   │   ├── [id]/       # Lead details
│   │   │   │   │   │   └── intake/     # Quick lead entry
│   │   │   │   │   ├── campaigns/      # Campaign management
│   │   │   │   │   ├── templates/      # Auto-followup templates
│   │   │   │   │   ├── jobs/           # Background jobs monitor
│   │   │   │   │   └── shopify-csv/    # Shopify import tool
│   │   │   │   │
│   │   │   │   ├── production/         # Production vertical (events)
│   │   │   │   │   ├── dashboard/      # Production dashboard
│   │   │   │   │   ├── projects/       # Project management
│   │   │   │   │   ├── suppliers/      # Supplier database
│   │   │   │   │   ├── team/           # Team management (company)
│   │   │   │   │   ├── company/        # Company dashboard
│   │   │   │   │   └── private/        # Freelancer dashboard
│   │   │   │   │
│   │   │   │   ├── productions/        # Creative productions (video/ads)
│   │   │   │   │   ├── page.tsx        # Productions overview
│   │   │   │   │   ├── projects/       # Creative projects
│   │   │   │   │   │   ├── page.tsx    # Projects list
│   │   │   │   │   │   └── [id]/       # Project details
│   │   │   │   │   ├── assets/         # Media asset library
│   │   │   │   │   ├── templates/      # Creative templates
│   │   │   │   │   └── reviews/        # Approval workflow
│   │   │   │   │
│   │   │   │   └── law/                # Law vertical (placeholder)
│   │   │   │       ├── layout.tsx
│   │   │   │       └── dashboard/
│   │   │   │
│   │   │   ├── org/                    # Organization management
│   │   │   │   └── admin/              # Org settings (OWNER/ADMIN)
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── api/                    # Next.js API Routes (internal)
│   │   │   │   ├── auth/               # Auth endpoints
│   │   │   │   │   ├── me/             # Get current user
│   │   │   │   │   ├── register/       # User registration
│   │   │   │   │   └── firebase/       # Firebase session
│   │   │   │   ├── billing/            # Billing & subscriptions
│   │   │   │   │   ├── subscription/   # Get subscription
│   │   │   │   │   ├── upgrade/        # Upgrade plan
│   │   │   │   │   ├── portal/         # Stripe portal
│   │   │   │   │   ├── usage/          # Usage tracking
│   │   │   │   │   └── webhooks/       # Stripe webhooks
│   │   │   │   ├── campaigns/          # Campaign API
│   │   │   │   │   └── [id]/           # Campaign operations
│   │   │   │   │       ├── activate/
│   │   │   │   │       ├── pause/
│   │   │   │   │       └── preflight-check/
│   │   │   │   ├── connections/        # OAuth connections
│   │   │   │   ├── leads/              # Lead management API
│   │   │   │   │   ├── csv-import/     # CSV upload
│   │   │   │   │   ├── csv-preview/    # Preview import
│   │   │   │   │   └── [id]/           # Lead operations
│   │   │   │   ├── notifications/      # Notifications API
│   │   │   │   ├── organizations/      # Org management
│   │   │   │   │   ├── me/             # Current org
│   │   │   │   │   └── members/        # Member management
│   │   │   │   ├── permissions/        # Permission checks
│   │   │   │   ├── productions/        # Creative productions API
│   │   │   │   │   ├── projects/       # Projects CRUD
│   │   │   │   │   ├── assets/         # Assets upload
│   │   │   │   │   ├── templates/      # Templates CRUD
│   │   │   │   │   ├── reviews/        # Review workflow
│   │   │   │   │   ├── renders/        # Render queue
│   │   │   │   │   └── ai/             # AI features
│   │   │   │   │       ├── script/     # Script generation
│   │   │   │   │       ├── ad-copy/    # Ad copy generation
│   │   │   │   │       └── brief-generator/
│   │   │   │   ├── real-estate/        # Real estate API
│   │   │   │   │   └── ai-advisor/     # AI property advisor
│   │   │   │   ├── health/             # Health check
│   │   │   │   └── debug/              # Debug endpoints (dev only)
│   │   │   │
│   │   │   ├── layout.tsx              # Root layout (providers)
│   │   │   ├── page.tsx                # Homepage
│   │   │   ├── globals.css             # Global styles (Tailwind)
│   │   │   ├── providers.tsx           # Context providers wrapper
│   │   │   └── middleware.ts           # Edge middleware
│   │   │
│   │   ├── components/                 # React components
│   │   │   ├── ui/                     # Base UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── virtual-list.tsx
│   │   │   ├── dashboard/              # Dashboard-specific components
│   │   │   ├── marketing/              # Marketing page components
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── FeatureCard.tsx
│   │   │   │   ├── PricingCard.tsx
│   │   │   │   ├── Testimonial.tsx
│   │   │   │   ├── FAQ.tsx
│   │   │   │   └── CTASection.tsx
│   │   │   ├── real-estate/            # Real estate components
│   │   │   ├── auth/                   # Auth components
│   │   │   ├── billing/                # Billing components
│   │   │   ├── brand/                  # Brand components
│   │   │   ├── campaigns/              # Campaign components
│   │   │   ├── forms/                  # Form components
│   │   │   ├── i18n/                   # i18n components
│   │   │   ├── layout/                 # Layout components
│   │   │   ├── leads/                  # Lead components
│   │   │   ├── mobile/                 # Mobile-specific
│   │   │   ├── modals/                 # Modal dialogs
│   │   │   ├── notifications/          # Notification system
│   │   │   ├── org/                    # Organization components
│   │   │   └── performance/            # Performance monitoring
│   │   │
│   │   ├── lib/                        # Utilities & helpers
│   │   │   ├── api.ts                  # API client wrapper
│   │   │   ├── apiAuth.ts              # API authentication
│   │   │   ├── firebase.ts             # Firebase client config
│   │   │   ├── firebaseAdmin.server.ts # Firebase Admin SDK
│   │   │   ├── auth-context.tsx        # Auth context provider
│   │   │   ├── organization-context.tsx# Org context provider
│   │   │   ├── language-context.tsx    # i18n context (EN/HE)
│   │   │   ├── permissions.ts          # RBAC permission system
│   │   │   ├── automation-engine.ts    # Automation logic
│   │   │   ├── billing-guard.ts        # Subscription checks
│   │   │   ├── brand.ts                # Brand configuration
│   │   │   ├── colors.ts               # Color system
│   │   │   ├── typography.ts           # Typography system
│   │   │   ├── spacing.ts              # Spacing system
│   │   │   ├── animations.ts           # Animation utilities
│   │   │   ├── responsive.ts           # Responsive utilities
│   │   │   ├── aiPromptBuilders.ts     # OpenAI prompt helpers
│   │   │   ├── aiRateLimiter.ts        # AI rate limiting
│   │   │   ├── aiRequestLogger.ts      # AI usage tracking
│   │   │   ├── prisma.server.ts        # Prisma client singleton
│   │   │   ├── stripe.ts               # Stripe integration
│   │   │   ├── usage-tracker.ts        # Usage metrics
│   │   │   └── [50+ more utilities]
│   │   │
│   │   ├── public/                     # Static assets
│   │   │   ├── icons/                  # Icon files
│   │   │   ├── images/                 # Image assets
│   │   │   ├── sw.js                   # Service worker
│   │   │   └── manifest.json           # PWA manifest
│   │   │
│   │   ├── scripts/                    # Build/dev scripts
│   │   │   ├── accessibility-check.cjs
│   │   │   ├── bundle-size-check.js
│   │   │   └── performance-test.js
│   │   │
│   │   ├── next.config.js              # Next.js configuration
│   │   ├── tailwind.config.js          # Tailwind CSS config
│   │   ├── tsconfig.json               # TypeScript config
│   │   ├── package.json                # Dependencies
│   │   ├── vercel.json                 # Vercel deployment config
│   │   └── middleware.ts               # Edge middleware
│   │
│   ├── api/                            # NestJS Backend API
│   │   ├── src/
│   │   │   ├── modules/                # Feature modules
│   │   │   │   ├── auth/               # Authentication
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── guards/         # Auth guards
│   │   │   │   │   ├── decorators/     # Custom decorators
│   │   │   │   │   └── dto/            # Data transfer objects
│   │   │   │   ├── real-estate-properties/
│   │   │   │   │   ├── real-estate-properties.module.ts
│   │   │   │   │   ├── real-estate-properties.controller.ts
│   │   │   │   │   ├── real-estate-properties.service.ts
│   │   │   │   │   ├── property-import.service.ts
│   │   │   │   │   ├── property-scoring.service.ts
│   │   │   │   │   ├── dtos/           # DTOs
│   │   │   │   │   └── utils/          # Utility functions
│   │   │   │   ├── real-estate-leads/
│   │   │   │   │   ├── real-estate-leads.module.ts
│   │   │   │   │   ├── real-estate-leads.controller.ts
│   │   │   │   │   ├── real-estate-leads.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── real-estate-research/  # AI property search
│   │   │   │   │   ├── search-job.service.ts
│   │   │   │   │   ├── yad2-scraper.service.ts
│   │   │   │   │   ├── madlan-scraper.service.ts
│   │   │   │   │   ├── ai-enrichment.service.ts
│   │   │   │   │   └── processors/     # Job processors
│   │   │   │   ├── campaigns/          # Campaign management
│   │   │   │   │   ├── campaigns.module.ts
│   │   │   │   │   ├── campaigns.controller.ts
│   │   │   │   │   ├── campaigns.service.ts
│   │   │   │   │   ├── integrations/   # Platform integrations
│   │   │   │   │   │   ├── meta-campaign.service.ts
│   │   │   │   │   │   ├── google-campaign.service.ts
│   │   │   │   │   │   └── tiktok-campaign.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── connections/        # OAuth connections
│   │   │   │   │   ├── connections.module.ts
│   │   │   │   │   ├── connections.controller.ts
│   │   │   │   │   ├── oauth-token.service.ts
│   │   │   │   │   ├── meta-oauth.service.ts
│   │   │   │   │   └── google-oauth.service.ts
│   │   │   │   ├── insights/           # Campaign analytics
│   │   │   │   ├── ai/                 # OpenAI integrations
│   │   │   │   │   ├── ai.module.ts
│   │   │   │   │   ├── openai.service.ts
│   │   │   │   │   ├── prompt.service.ts
│   │   │   │   │   └── rate-limit.service.ts
│   │   │   │   ├── production/         # Production vertical
│   │   │   │   │   ├── production.module.ts
│   │   │   │   │   ├── projects.controller.ts
│   │   │   │   │   ├── tasks.controller.ts
│   │   │   │   │   ├── suppliers.controller.ts
│   │   │   │   │   ├── budget.controller.ts
│   │   │   │   │   └── files.controller.ts
│   │   │   │   ├── organizations/      # Organization management
│   │   │   │   ├── uploads/            # File uploads (S3)
│   │   │   │   ├── jobs/               # Background jobs
│   │   │   │   ├── platform-jobs/      # Platform-level jobs
│   │   │   │   ├── audit/              # Audit logging
│   │   │   │   ├── health/             # Health checks
│   │   │   │   └── housekeeping/       # Cleanup tasks
│   │   │   │
│   │   │   ├── common/                 # Shared utilities
│   │   │   │   ├── middleware/         # Custom middleware
│   │   │   │   │   └── performance.middleware.ts
│   │   │   │   └── interceptors/       # Global interceptors
│   │   │   │
│   │   │   ├── lib/                    # Shared libraries
│   │   │   │   └── prisma.service.ts   # Prisma client
│   │   │   │
│   │   │   ├── app.module.ts           # Root module
│   │   │   ├── main.ts                 # Bootstrap file
│   │   │   └── minimal-main.ts         # Minimal server (testing)
│   │   │
│   │   ├── tmp/                        # Temporary files
│   │   │   └── uploads/                # Temp upload storage
│   │   │
│   │   ├── package.json                # Dependencies
│   │   ├── tsconfig.json               # TypeScript config
│   │   └── nest-cli.json               # NestJS CLI config
│   │
│   └── worker/                         # Background Worker
│       ├── src/
│       │   └── index.ts                # Worker entry point
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                           # Shared packages
│   │
│   ├── server/                         # Server-side shared code
│   │   ├── db/
│   │   │   └── prisma/
│   │   │       ├── schema.prisma       # **DATABASE SCHEMA** (60+ models)
│   │   │       ├── migrations/         # Migration history
│   │   │       └── seed.ts             # Database seeding
│   │   └── package.json
│   │
│   ├── ui/                             # Shared UI components (minimal)
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── lib/                            # Shared libraries
│   │   └── src/
│   │
│   └── apps/                           # App-specific shared code
│       └── src/
│
├── infra/                              # Infrastructure as Code
│   └── (Terraform configs - placeholder)
│
├── docs/                               # Documentation
│   └── (Additional docs)
│
├── scripts/                            # Monorepo-level scripts
│   └── (Build/deploy scripts)
│
├── .env.example                        # Environment variables template
├── .gitignore                          # Git ignore rules
├── package.json                        # Root package.json (workspaces)
├── pnpm-workspace.yaml                 # pnpm workspace config
├── pnpm-lock.yaml                      # Dependency lock file
├── turbo.json                          # Turborepo configuration
├── tsconfig.json                       # Root TypeScript config
├── README.md                           # Project README
├── CLAUDE.md                           # Claude Code instructions
└── PROJECT_SUMMARY.md                  # This document
```

### Key Folder Relationships

**Data Flow Paths:**

1. **User Request → Frontend:**
   ```
   Browser
   → apps/web/app/[route]/page.tsx (React component)
   → apps/web/components/* (UI components)
   → apps/web/lib/api.ts (API client)
   ```

2. **Frontend → Backend:**
   ```
   apps/web/lib/api.ts
   → apps/web/app/api/[endpoint]/route.ts (Next.js API route)
   → apps/api/src/modules/[feature]/[feature].controller.ts (NestJS)
   ```

3. **Backend → Database:**
   ```
   apps/api/src/modules/[feature]/[feature].service.ts
   → packages/server/db/prisma/schema.prisma (Schema definition)
   → PostgreSQL (Neon.tech)
   ```

4. **Backend → External Services:**
   ```
   apps/api/src/modules/[feature]/[feature].service.ts
   → apps/api/src/modules/ai/openai.service.ts (OpenAI)
   → apps/api/src/modules/uploads/s3-upload.service.ts (AWS S3)
   → apps/api/src/modules/connections/meta-oauth.service.ts (Meta API)
   ```

### File Naming Conventions

**Frontend (Next.js):**
- `page.tsx` - Route page component
- `layout.tsx` - Layout wrapper
- `route.ts` - API route handler
- `loading.tsx` - Loading UI
- `error.tsx` - Error boundary
- `not-found.tsx` - 404 page

**Backend (NestJS):**
- `*.module.ts` - NestJS module
- `*.controller.ts` - HTTP controller
- `*.service.ts` - Business logic service
- `*.dto.ts` - Data transfer object
- `*.guard.ts` - Route guard
- `*.middleware.ts` - Middleware
- `*.processor.ts` - Bull job processor

**Shared:**
- `*.types.ts` - TypeScript type definitions
- `*.config.ts` - Configuration files
- `*.test.ts` - Test files
- `*.spec.ts` - Spec files (NestJS)

---

## 🔄 3. Example End-to-End Flows

### Flow 1: User Registration (Complete Journey)

**Purpose:** New user creates an account and gets redirected to their vertical dashboard

**Step-by-Step Process:**

#### **Step 1: User Visits Registration Page**

**File:** [apps/web/app/register/page.tsx](apps/web/app/register/page.tsx)

**What Happens:**
- User navigates to `https://effinity.co.il/register`
- Next.js renders the registration page (client component)
- Form is displayed with fields:
  - Full Name
  - Email
  - Password
  - Vertical selection (Real Estate / E-Commerce / Law / Production)
  - Account type (Freelancer / Company)
  - Terms acceptance checkbox

**Code Flow:**
```tsx
// apps/web/app/register/page.tsx
'use client';
import { useState } from 'react';
import { auth } from '@/lib/firebase'; // Firebase client SDK
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    vertical: 'REAL_ESTATE',
    accountType: 'FREELANCER'
  });

  const handleSubmit = async (e) => {
    // Form submission logic (see Step 2)
  };

  return <RegisterForm onSubmit={handleSubmit} />;
}
```

---

#### **Step 2: Form Submission & Firebase Auth**

**Files Involved:**
- [apps/web/app/register/page.tsx](apps/web/app/register/page.tsx) (form handler)
- [apps/web/lib/firebase.ts](apps/web/lib/firebase.ts) (Firebase config)

**What Happens:**
1. User clicks "Create Account" button
2. Frontend validates form data (client-side)
3. Firebase Authentication creates user account

**Code Flow:**
```tsx
// apps/web/app/register/page.tsx
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Step 2a: Create Firebase user
    const { user } = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    // Step 2b: Send email verification
    await sendEmailVerification(user);

    // Step 2c: Get Firebase ID token
    const idToken = await user.getIdToken();

    // Proceed to Step 3
    await createDatabaseUser(user, idToken);
  } catch (error) {
    // Handle Firebase errors (email already exists, weak password, etc.)
  }
};
```

**Firebase Configuration:**
```typescript
// apps/web/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

---

#### **Step 3: Create Database Records (API Call)**

**Files Involved:**
- [apps/web/app/register/page.tsx](apps/web/app/register/page.tsx) (API call)
- [apps/web/lib/api.ts](apps/web/lib/api.ts) (API client)
- [apps/web/app/api/auth/register/route.ts](apps/web/app/api/auth/register/route.ts) (Next.js API route)
- [apps/api/src/modules/auth/auth.controller.ts](apps/api/src/modules/auth/auth.controller.ts) (NestJS controller)
- [apps/api/src/modules/auth/auth.service.ts](apps/api/src/modules/auth/auth.service.ts) (NestJS service)
- [packages/server/db/prisma/schema.prisma](packages/server/db/prisma/schema.prisma) (Database schema)

**What Happens:**
1. Frontend makes POST request to `/api/auth/register`
2. Next.js API route proxies to NestJS backend
3. NestJS creates database records (User, Organization, Membership, UserProfile)
4. Transaction ensures all records created or none

**Code Flow:**

**3a. Frontend API Call:**
```typescript
// apps/web/app/register/page.tsx
const createDatabaseUser = async (firebaseUser, idToken) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({
      uid: firebaseUser.uid,
      fullName: formData.fullName,
      email: formData.email,
      vertical: formData.vertical,
      accountType: formData.accountType
    })
  });

  if (!response.ok) throw new Error('Registration failed');

  const data = await response.json();
  return data;
};
```

**3b. Next.js API Route (Proxy):**
```typescript
// apps/web/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const authHeader = request.headers.get('Authorization');

  // Forward to NestJS API
  const response = await fetch('http://localhost:4000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

**3c. NestJS Controller:**
```typescript
// apps/api/src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(FirebaseAuthGuard) // Verify Firebase token
  async register(@Body() dto: RegisterDto) {
    return this.authService.createUser(dto);
  }
}
```

**3d. NestJS Service (Business Logic):**
```typescript
// apps/api/src/modules/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma.service';
import { Vertical, AccountType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: RegisterDto) {
    // Use Prisma transaction to create all records atomically
    return this.prisma.$transaction(async (tx) => {

      // 1. Create User
      const user = await tx.user.create({
        data: {
          id: dto.uid,              // Firebase UID
          fullName: dto.fullName,
          email: dto.email,
          passwordHash: '',          // Firebase manages passwords
          lang: 'en'
        }
      });

      // 2. Create Organization
      const slug = this.generateSlug(dto.fullName);
      const organization = await tx.organization.create({
        data: {
          ownerUid: user.id,
          name: `${dto.fullName}'s Organization`,
          slug: slug,
          ownerUserId: user.id,
          planTier: 'STARTER',
          seatLimit: 5,
          usedSeats: 1
        }
      });

      // 3. Create Membership (OWNER role)
      await tx.membership.create({
        data: {
          userId: user.id,
          orgId: organization.id,
          ownerUid: user.id,
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: new Date()
        }
      });

      // 4. Create UserProfile
      await tx.userProfile.create({
        data: {
          userId: user.id,
          defaultVertical: dto.vertical,
          accountType: dto.accountType,
          termsConsentAt: new Date(),
          termsVersion: '1.0'
        }
      });

      // 5. Create default Subscription (trial)
      await tx.subscription.create({
        data: {
          orgId: organization.id,
          plan: 'BASIC',
          status: 'TRIALING',
          userSeats: 1,
          leadLimit: 100,
          propertyLimit: 50,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
        }
      });

      return {
        user,
        organization,
        vertical: dto.vertical
      };
    });
  }

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  }
}
```

**3e. Database Tables (Prisma Schema):**
```prisma
// packages/server/db/prisma/schema.prisma

model User {
  id                 String   @id @default(cuid())
  fullName           String
  email              String   @unique
  passwordHash       String
  lang               String   @default("en")
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  memberships        Membership[]
  userProfile        UserProfile?
  ownedOrgs          Organization[]
}

model Organization {
  id              String           @id @default(cuid())
  ownerUid        String           @unique
  name            String
  slug            String           @unique
  seatLimit       Int              @default(5)
  usedSeats       Int              @default(1)
  planTier        OrganizationTier @default(STARTER)
  ownerUserId     String
  createdAt       DateTime         @default(now())

  owner           User          @relation(...)
  memberships     Membership[]
  subscription    Subscription?
  // ... other relations
}

model Membership {
  id       String           @id @default(cuid())
  userId   String
  orgId    String
  role     MembershipRole   @default(MEMBER)
  status   MembershipStatus @default(ACTIVE)

  user         User         @relation(...)
  organization Organization @relation(...)

  @@unique([userId, orgId])
}

model UserProfile {
  userId          String       @id
  defaultVertical Vertical
  accountType     AccountType?
  termsConsentAt  DateTime
  termsVersion    String

  user User @relation(...)
}

model Subscription {
  id           String             @id @default(cuid())
  orgId        String             @unique
  plan         SubscriptionPlan   @default(BASIC)
  status       SubscriptionStatus @default(TRIALING)
  userSeats    Int                @default(1)
  leadLimit    Int                @default(100)
  propertyLimit Int               @default(50)
  trialEndsAt  DateTime?

  organization Organization @relation(...)
}
```

---

#### **Step 4: Update Auth Context (Client State)**

**Files Involved:**
- [apps/web/lib/auth-context.tsx](apps/web/lib/auth-context.tsx)
- [apps/web/lib/organization-context.tsx](apps/web/lib/organization-context.tsx)

**What Happens:**
1. Registration success triggers context updates
2. Auth context stores user data
3. Organization context stores org data
4. User is now authenticated globally

**Code Flow:**
```tsx
// apps/web/lib/auth-context.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch full user data from database
        const idToken = await firebaseUser.getIdToken();
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const userData = await response.json();

        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

#### **Step 5: Redirect to Dashboard**

**Files Involved:**
- [apps/web/app/register/page.tsx](apps/web/app/register/page.tsx)
- [apps/web/app/dashboard/real-estate/dashboard/page.tsx](apps/web/app/dashboard/real-estate/dashboard/page.tsx) (or other vertical)

**What Happens:**
1. After successful registration, user is redirected
2. Redirect URL based on selected vertical
3. Dashboard loads with user's data

**Code Flow:**
```tsx
// apps/web/app/register/page.tsx
const handleSubmit = async (e) => {
  // ... previous steps ...

  try {
    const result = await createDatabaseUser(user, idToken);

    // Redirect based on vertical
    const dashboardMap = {
      'REAL_ESTATE': '/dashboard/real-estate/dashboard',
      'E_COMMERCE': '/dashboard/e-commerce/dashboard',
      'LAW': '/dashboard/law/dashboard',
      'PRODUCTION': '/dashboard/production/dashboard'
    };

    const redirectUrl = dashboardMap[result.vertical];
    router.push(redirectUrl);

  } catch (error) {
    setError(error.message);
  }
};
```

---

#### **Step 6: Dashboard Loads User Data**

**Files Involved:**
- [apps/web/app/dashboard/real-estate/dashboard/page.tsx](apps/web/app/dashboard/real-estate/dashboard/page.tsx)
- [apps/web/lib/api.ts](apps/web/lib/api.ts)
- [apps/api/src/modules/real-estate-properties/real-estate-properties.controller.ts](apps/api/src/modules/real-estate-properties/real-estate-properties.controller.ts)

**What Happens:**
1. Dashboard component mounts
2. Fetches user-specific data (properties, leads, etc.)
3. All queries scoped to user's organization
4. Displays personalized dashboard

**Code Flow:**
```tsx
// apps/web/app/dashboard/real-estate/dashboard/page.tsx
'use client';
import { useAuth } from '@/lib/auth-context';
import { useOrganization } from '@/lib/organization-context';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export default function RealEstateDashboard() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();

  // Fetch properties (org-scoped)
  const { data: properties } = useSWR(
    `/api/real-estate/properties?orgId=${currentOrg.id}`
  );

  // Fetch leads (org-scoped)
  const { data: leads } = useSWR(
    `/api/real-estate/leads?orgId=${currentOrg.id}`
  );

  return (
    <div>
      <h1>Welcome, {user.fullName}!</h1>
      <StatsCards properties={properties} leads={leads} />
      <RecentLeadsTable leads={leads} />
      <PropertyChart properties={properties} />
    </div>
  );
}
```

**Backend (Organization-Scoped Query):**
```typescript
// apps/api/src/modules/real-estate-properties/real-estate-properties.controller.ts
@Get()
@UseGuards(FirebaseAuthGuard, OrganizationGuard)
async getProperties(@Request() req, @Query() query) {
  const { orgId } = req.user; // Injected by OrganizationGuard

  return this.prisma.property.findMany({
    where: {
      orgId: orgId,  // ← Organization scoping
      status: query.status || undefined
    },
    include: {
      photos: true,
      leads: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}
```

---

**Complete Flow Summary:**

```
1. User → /register page (Next.js)
   ↓
2. Form submit → Firebase createUser (client)
   ↓
3. POST /api/auth/register (Next.js API route)
   ↓
4. Forward → NestJS /api/auth/register
   ↓
5. Prisma transaction → PostgreSQL
   - Create User
   - Create Organization
   - Create Membership
   - Create UserProfile
   - Create Subscription
   ↓
6. Response → Frontend
   ↓
7. Update AuthContext & OrganizationContext
   ↓
8. Redirect → /dashboard/{vertical}/dashboard
   ↓
9. Dashboard loads → Fetch org-scoped data
   ↓
10. Display personalized dashboard
```

---

### Flow 2: Creating a Property (Real Estate Vertical)

**Purpose:** User creates a new property listing with photos

**Files Involved:**
- Frontend: [apps/web/app/dashboard/real-estate/properties/new/page.tsx](apps/web/app/dashboard/real-estate/properties/new/page.tsx)
- Backend: [apps/api/src/modules/real-estate-properties/](apps/api/src/modules/real-estate-properties/)
- Upload: [apps/api/src/modules/uploads/](apps/api/src/modules/uploads/)
- Database: [packages/server/db/prisma/schema.prisma](packages/server/db/prisma/schema.prisma)

**Step-by-Step:**

1. **User navigates to "Add Property"**
   - URL: `/dashboard/real-estate/properties/new`
   - Form loads with fields: name, address, price, rooms, size, photos

2. **User fills form and uploads photos**
   ```tsx
   // apps/web/app/dashboard/real-estate/properties/new/page.tsx
   const handlePhotoUpload = async (files) => {
     const formData = new FormData();
     files.forEach(file => formData.append('photos', file));

     const response = await fetch('/api/uploads/properties', {
       method: 'POST',
       body: formData,
       headers: {
         'Authorization': `Bearer ${await user.getIdToken()}`
       }
     });

     const { urls } = await response.json();
     setPhotoUrls(urls);
   };
   ```

3. **Photos uploaded to AWS S3**
   ```typescript
   // apps/api/src/modules/uploads/s3-upload.service.ts
   async uploadPropertyPhoto(file: Express.Multer.File, propertyId: string) {
     const s3Key = `properties/${propertyId}/${Date.now()}-${file.originalname}`;

     await this.s3Client.send(new PutObjectCommand({
       Bucket: process.env.AWS_S3_BUCKET,
       Key: s3Key,
       Body: file.buffer,
       ContentType: file.mimetype
     }));

     return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
   }
   ```

4. **User submits form**
   ```tsx
   const handleSubmit = async (e) => {
     e.preventDefault();

     const response = await fetch('/api/real-estate/properties', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${await user.getIdToken()}`,
         'x-org-id': currentOrg.id
       },
       body: JSON.stringify({
         name: formData.name,
         address: formData.address,
         city: formData.city,
         price: formData.price,
         rooms: formData.rooms,
         size: formData.size,
         photoUrls: photoUrls,
         status: 'PUBLISHED'
       })
     });

     const property = await response.json();
     router.push(`/dashboard/real-estate/properties/${property.slug}`);
   };
   ```

5. **Backend creates property record**
   ```typescript
   // apps/api/src/modules/real-estate-properties/real-estate-properties.service.ts
   async createProperty(dto: CreatePropertyDto, orgId: string, userId: string) {
     const slug = this.generateSlug(dto.name);

     return this.prisma.property.create({
       data: {
         orgId,
         ownerUid: userId,
         name: dto.name,
         address: dto.address,
         city: dto.city,
         price: dto.price,
         rooms: dto.rooms,
         size: dto.size,
         slug,
         status: dto.status,
         transactionType: 'SALE',
         currency: 'ILS',
         provider: 'MANUAL',

         // Create related photos
         photos: {
           create: dto.photoUrls.map((url, index) => ({
             url,
             sortIndex: index
           }))
         }
       },
       include: {
         photos: true
       }
     });
   }
   ```

6. **Database records created**
   - `Property` record inserted
   - `PropertyPhoto` records inserted (relation)
   - Auto-generated slug and timestamps

7. **User redirected to property detail page**
   - URL: `/dashboard/real-estate/properties/{slug}`
   - Property displayed with photos
   - Option to generate landing page

**Data Flow:**
```
User Form
  → File Upload → S3 (photos)
  → POST /api/properties → NestJS
  → Prisma → PostgreSQL (Property + PropertyPhoto)
  → Response → Frontend
  → Redirect to property detail page
```

---

### Flow 3: Lead Capture from Landing Page

**Purpose:** External user submits lead form on public property landing page

**Files Involved:**
- Frontend: [apps/web/app/(public)/property/[slug]/page.tsx](apps/web/app/(public)/property/[slug]/page.tsx)
- API: [apps/api/src/modules/real-estate-leads/](apps/api/src/modules/real-estate-leads/)
- Database: Property, RealEstateLead, RealEstateLeadEvent

**Step-by-Step:**

1. **External user visits landing page**
   - URL: `https://effinity.co.il/property/beautiful-apartment-tel-aviv-123`
   - Public page (no auth required)
   - Displays property details + lead form

2. **Page loads property data**
   ```tsx
   // apps/web/app/(public)/property/[slug]/page.tsx
   export default async function PropertyLandingPage({ params }) {
     const property = await fetch(
       `${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/public/${params.slug}`
     ).then(res => res.json());

     return (
       <div>
         <PropertyGallery photos={property.photos} />
         <PropertyDetails property={property} />
         <LeadCaptureForm propertyId={property.id} />
       </div>
     );
   }
   ```

3. **User fills lead form**
   - Name, phone, email, message
   - Submits form

4. **Frontend sends lead data**
   ```tsx
   const handleLeadSubmit = async (e) => {
     e.preventDefault();

     const response = await fetch('/api/real-estate/leads/public', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         propertyId: property.id,
         fullName: formData.name,
         phone: formData.phone,
         email: formData.email,
         message: formData.message,
         source: 'LANDING_PAGE'
       })
     });

     setSubmitted(true);
     // Show success message
   };
   ```

5. **Backend creates lead + event**
   ```typescript
   // apps/api/src/modules/real-estate-leads/real-estate-leads.service.ts
   async createLeadFromPublic(dto: CreatePublicLeadDto) {
     // Get property to find orgId
     const property = await this.prisma.property.findUnique({
       where: { id: dto.propertyId }
     });

     return this.prisma.$transaction(async (tx) => {
       // Create lead
       const lead = await tx.realEstateLead.create({
         data: {
           orgId: property.orgId,
           ownerUid: property.ownerUid,
           propertyId: dto.propertyId,
           fullName: dto.fullName,
           phone: dto.phone,
           email: dto.email,
           message: dto.message,
           source: 'LANDING_PAGE'
         }
       });

       // Create event (timeline)
       await tx.realEstateLeadEvent.create({
         data: {
           leadId: lead.id,
           type: 'LEAD_CREATED',
           payload: {
             source: 'LANDING_PAGE',
             propertyId: dto.propertyId
           }
         }
       });

       // TODO: Trigger auto-followup (email/SMS)
       // TODO: Send notification to property owner

       return lead;
     });
   }
   ```

6. **Lead appears in dashboard**
   - Property owner sees new lead in `/dashboard/real-estate/leads`
   - Lead is linked to property
   - Timeline shows creation event

**Data Flow:**
```
Public Landing Page (no auth)
  → POST /api/leads/public
  → NestJS LeadsService
  → Prisma transaction:
     - Create RealEstateLead
     - Create RealEstateLeadEvent
  → Response: success
  → Show thank you message

Property Owner Dashboard
  → GET /api/leads (org-scoped)
  → Sees new lead
  → Can contact lead
```

---

### Flow 4: AI Property Scoring

**Purpose:** User requests AI to score a property listing

**Files Involved:**
- Frontend: [apps/web/app/dashboard/real-estate/properties/[slug]/page.tsx](apps/web/app/dashboard/real-estate/properties/[slug]/page.tsx)
- Backend: [apps/api/src/modules/ai/](apps/api/src/modules/ai/)
- Integration: OpenAI API

**Step-by-Step:**

1. **User clicks "AI Score" button**
   ```tsx
   const handleAIScore = async () => {
     setLoading(true);

     const response = await fetch(`/api/properties/${property.id}/ai-score`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${await user.getIdToken()}`
       }
     });

     const result = await response.json();
     setAiScore(result);
     setLoading(false);
   };
   ```

2. **Backend calls OpenAI**
   ```typescript
   // apps/api/src/modules/ai/openai.service.ts
   async scoreProperty(property: Property) {
     const prompt = this.buildPropertyScorePrompt(property);

     const completion = await this.openai.chat.completions.create({
       model: 'gpt-4',
       messages: [
         { role: 'system', content: 'You are a real estate expert...' },
         { role: 'user', content: prompt }
       ],
       temperature: 0.3
     });

     const analysis = JSON.parse(completion.choices[0].message.content);

     // Update property with AI score
     await this.prisma.property.update({
       where: { id: property.id },
       data: {
         aiScore: analysis.score,
         aiCategory: analysis.category,
         aiInsights: analysis.insights,
         aiScoredAt: new Date()
       }
     });

     return analysis;
   }

   private buildPropertyScorePrompt(property: Property): string {
     return `
       Analyze this property and provide a score (0-100):

       Name: ${property.name}
       Location: ${property.city}, ${property.address}
       Price: ${property.price} ${property.currency}
       Size: ${property.size} sqm
       Rooms: ${property.rooms}

       Provide JSON response with:
       - score (0-100)
       - category (excellent/good/fair/poor)
       - insights { strengths: [], weaknesses: [], recommendations: [] }
     `;
   }
   ```

3. **AI response processed**
   - Score stored in database
   - Insights displayed to user
   - Category badge shown

**Data Flow:**
```
User → Click "AI Score"
  → POST /api/properties/{id}/ai-score
  → NestJS AIService
  → OpenAI API (GPT-4)
  → Parse JSON response
  → Update Property record (aiScore, aiInsights)
  → Return to frontend
  → Display score + insights
```

---

### Flow 5: Campaign Creation (Meta Ads)

**Purpose:** User connects Facebook account and creates ad campaign

**Step-by-Step:**

1. **User clicks "Connect Facebook"**
   - Redirects to `/api/connections/meta/auth`

2. **OAuth flow initiates**
   ```typescript
   // apps/api/src/modules/connections/meta-oauth.service.ts
   getAuthUrl(userId: string) {
     const state = this.generateState(userId);

     const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
       `client_id=${process.env.META_CLIENT_ID}` +
       `&redirect_uri=${process.env.META_REDIRECT_URI}` +
       `&state=${state}` +
       `&scope=ads_management,ads_read,leads_retrieval`;

     return authUrl;
   }
   ```

3. **User authorizes on Facebook**
   - Facebook redirects to callback

4. **Callback exchanges code for token**
   ```typescript
   // apps/api/src/modules/connections/connections.controller.ts
   @Get('meta/callback')
   async metaCallback(@Query('code') code, @Query('state') state) {
     const userId = this.verifyState(state);

     // Exchange code for access token
     const tokenData = await this.metaOAuth.exchangeCode(code);

     // Encrypt and store token
     await this.prisma.connection.create({
       data: {
         ownerUid: userId,
         provider: 'META',
         status: 'CONNECTED',
         displayName: tokenData.accountName,
         oauthTokens: {
           create: {
             accessToken: this.encrypt(tokenData.accessToken),
             refreshToken: this.encrypt(tokenData.refreshToken),
             expiresAt: tokenData.expiresAt
           }
         }
       }
     });

     return { redirect: '/dashboard/e-commerce/campaigns?connected=meta' };
   }
   ```

5. **User creates campaign**
   - Fills campaign form (name, budget, audience, creative)
   - Submits to backend

6. **Backend creates campaign on Meta**
   ```typescript
   // apps/api/src/modules/campaigns/integrations/meta-campaign.service.ts
   async createCampaign(dto: CreateCampaignDto, connection: Connection) {
     const token = this.decrypt(connection.oauthTokens[0].accessToken);

     // Call Meta Ads API
     const response = await fetch(
       `https://graph.facebook.com/v18.0/act_${dto.adAccountId}/campaigns`,
       {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           name: dto.name,
           objective: dto.objective,
           status: 'PAUSED',
           daily_budget: dto.dailyBudget * 100 // Convert to cents
         })
       }
     );

     const metaCampaign = await response.json();

     // Store in database
     return this.prisma.campaign.create({
       data: {
         orgId: dto.orgId,
         ownerUid: dto.userId,
         name: dto.name,
         platform: 'META',
         status: 'DRAFT',
         goal: dto.goal,
         budget: dto.budget,
         dailyBudget: dto.dailyBudget,
         platformCampaignId: metaCampaign.id,
         connectionId: connection.id
       }
     });
   }
   ```

**Data Flow:**
```
User → Connect Facebook
  → OAuth flow → Facebook
  → Callback → Exchange code
  → Store encrypted token → Database

User → Create Campaign
  → POST /api/campaigns
  → Meta Ads API (create campaign)
  → Store campaign → Database
  → Return campaign data
```

---

These flows demonstrate the complete journey of data through the system, showing how frontend, backend, database, and external services interact at each step.

---

## 🌐 4. Frontend (Web Application)

### Folder Structure

```
apps/web/
├── app/                      # Next.js App Router
│   ├── (marketing)/          # Public marketing pages
│   │   ├── layout.tsx        # Marketing layout
│   │   ├── page.tsx          # Homepage
│   │   ├── about/
│   │   ├── features/
│   │   ├── pricing/
│   │   ├── contact/
│   │   └── demo/
│   ├── (public)/             # Public routes
│   ├── login/                # Login page
│   ├── register/             # Registration
│   ├── dashboard/            # Main dashboard (protected)
│   │   ├── layout.tsx        # Dashboard layout
│   │   ├── real-estate/      # Real estate vertical
│   │   │   ├── dashboard/
│   │   │   ├── properties/
│   │   │   ├── leads/
│   │   │   ├── campaigns/
│   │   │   ├── automations/
│   │   │   ├── integrations/
│   │   │   ├── ai-searcher/
│   │   │   └── reports/
│   │   ├── e-commerce/       # E-commerce vertical
│   │   │   ├── dashboard/
│   │   │   ├── leads/
│   │   │   ├── campaigns/
│   │   │   ├── templates/
│   │   │   ├── jobs/
│   │   │   └── shopify-csv/
│   │   ├── production/       # Production vertical
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── suppliers/
│   │   │   ├── team/
│   │   │   ├── company/
│   │   │   └── private/
│   │   ├── productions/      # Creative productions
│   │   │   ├── projects/
│   │   │   ├── assets/
│   │   │   ├── templates/
│   │   │   └── reviews/
│   │   └── law/              # Law vertical (placeholder)
│   ├── org/                  # Organization management
│   │   └── admin/
│   ├── api/                  # Next.js API routes (internal)
│   │   ├── auth/
│   │   ├── properties/
│   │   ├── leads/
│   │   └── [...]
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   ├── globals.css           # Global styles
│   ├── providers.tsx         # Context providers
│   └── middleware.ts         # Edge middleware
├── components/               # React components
│   ├── ui/                   # Base UI components
│   ├── dashboard/            # Dashboard components
│   ├── marketing/            # Marketing components
│   ├── real-estate/          # Real estate components
│   ├── auth/                 # Auth components
│   ├── billing/              # Billing components
│   ├── brand/                # Brand components
│   ├── campaigns/            # Campaign components
│   ├── forms/                # Form components
│   ├── i18n/                 # i18n components
│   ├── layout/               # Layout components
│   ├── leads/                # Lead management
│   ├── mobile/               # Mobile-specific
│   ├── modals/               # Modal dialogs
│   ├── notifications/        # Notifications
│   ├── org/                  # Organization
│   └── performance/          # Performance tools
├── lib/                      # Utilities and helpers
│   ├── api.ts                # API client
│   ├── apiAuth.ts            # API authentication
│   ├── firebase.ts           # Firebase client
│   ├── firebaseAdmin.server.ts # Firebase admin
│   ├── auth-context.tsx      # Auth context
│   ├── organization-context.tsx
│   ├── language-context.tsx  # i18n context
│   ├── permissions.ts        # Permission system
│   ├── automation-engine.ts  # Automation logic
│   ├── billing-guard.ts      # Billing checks
│   ├── brand.ts              # Brand config
│   ├── colors.ts             # Color system
│   ├── typography.ts         # Typography system
│   ├── spacing.ts            # Spacing system
│   ├── animations.ts         # Animation helpers
│   ├── responsive.ts         # Responsive utilities
│   └── [50+ utility files]
├── hooks/                    # Custom React hooks (if separate)
├── public/                   # Static assets
│   ├── icons/
│   ├── images/
│   ├── sw.js                 # Service worker
│   └── manifest.json         # PWA manifest
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

### Routing and Navigation

**Route Structure:**

1. **Public Routes** (`(marketing)` group):
   - `/` - Homepage with hero, features, pricing
   - `/about` - About page
   - `/features` - Feature showcase
   - `/pricing` - Pricing plans
   - `/contact` - Contact form
   - `/demo` - Demo request

2. **Authentication Routes:**
   - `/login` - Firebase login
   - `/register` - User registration with vertical selection

3. **Protected Dashboard Routes** (`/dashboard/*`):
   - Authentication required via middleware
   - Role-based access control
   - Organization-scoped data

**Middleware Logic** ([middleware.ts](apps/web/middleware.ts)):
- Currently minimal (safety wrapper)
- Returns `NextResponse.next()` for all routes
- Error boundary for edge runtime stability
- Matcher excludes: `api`, `_next/static`, `_next/image`, `favicon.ico`

### State Management

**Context Providers** ([providers.tsx](apps/web/app/providers.tsx)):
1. **AuthContext** - User authentication state
2. **OrganizationContext** - Current organization data
3. **LanguageContext** - i18n and locale management
4. **PerformanceProvider** - Performance monitoring

**Data Fetching Strategy:**
- **SWR** for client-side data fetching with automatic revalidation
- Server Components for initial data loading
- Optimistic updates for mutations
- Real-time updates via Firebase listeners (selective)

### Internationalization (i18n)

**Implementation** ([lib/language-context.tsx](apps/web/lib/language-context.tsx)):

**Supported Languages:**
- English (`en`)
- Hebrew (`he`) with RTL support

**Translation System:**
- Context-based translation provider
- `t(key)` function for translations
- Comprehensive translation object covering all UI text
- Language toggle component in header
- Persisted to localStorage
- Automatic RTL layout switching

**Coverage:**
- ✅ Real Estate vertical (100%)
- ✅ E-Commerce vertical (100%)
- ✅ Production vertical (100%)
- ✅ Marketing pages (100%)
- ✅ Auth flows (100%)
- ✅ Common UI components (100%)

**RTL Support:**
- Automatic `dir="rtl"` on `<html>` element
- Tailwind RTL utilities
- Flipped layouts for Hebrew
- Hebrew font family: Assistant

---

## 🎨 3. Design System & UI/UX

### Visual Identity & Brand

**Brand Name:** EFFINITY
**Positioning:** Modern, efficient, data-driven platform for vertical-specific business management

**Color Palette** ([lib/colors.ts](apps/web/lib/colors.ts), [tailwind.config.js](apps/web/tailwind.config.js)):

**Primary Colors** (Blue):
```
primary-50:  #eff6ff  (lightest)
primary-100: #dbeafe
primary-200: #bfdbfe
primary-300: #93c5fd
primary-400: #60a5fa
primary-500: #3b82f6  ← Main brand color
primary-600: #2563eb
primary-700: #1d4ed8
primary-800: #1e40af
primary-900: #1e3a8a  (darkest)
```

**Secondary Colors** (Gray/Slate):
```
secondary-50:  #f8fafc
secondary-100: #f1f5f9
secondary-200: #e2e8f0
secondary-300: #cbd5e1
secondary-400: #94a3b8
secondary-500: #64748b  ← Neutral base
secondary-600: #475569
secondary-700: #334155
secondary-800: #1e293b
secondary-900: #0f172a
```

**Semantic Colors:**
- Success: Green (Tailwind green-500)
- Warning: Amber (Tailwind amber-500)
- Error: Red (Tailwind red-500)
- Info: Blue (primary-500)

### Typography System

**Font Families** ([tailwind.config.js](apps/web/tailwind.config.js)):
- **Default:** `Inter` (sans-serif) - Latin scripts
- **Hebrew:** `Assistant` - Hebrew/RTL support
- **Fallback:** `system-ui`, `sans-serif`

**Type Scale** ([lib/typography.ts](apps/web/lib/typography.ts)):
```
Display:  text-6xl (60px) - Hero headlines
H1:       text-5xl (48px) - Page titles
H2:       text-4xl (36px) - Section headers
H3:       text-3xl (30px) - Subsections
H4:       text-2xl (24px) - Card titles
H5:       text-xl  (20px) - Component headers
H6:       text-lg  (18px) - Small headers
Body:     text-base (16px) - Default text
Small:    text-sm  (14px) - Helper text
Tiny:     text-xs  (12px) - Labels, captions
```

**Font Weights:**
- Light: 300
- Regular: 400 (default)
- Medium: 500
- Semibold: 600 (headings)
- Bold: 700 (emphasis)

### Spacing System

**8pt Grid System** ([lib/spacing.ts](apps/web/lib/spacing.ts)):
```
0:    0px
1:    0.25rem  (4px)
2:    0.5rem   (8px)
3:    0.75rem  (12px)
4:    1rem     (16px)  ← Base unit
5:    1.25rem  (20px)
6:    1.5rem   (24px)
8:    2rem     (32px)
10:   2.5rem   (40px)
12:   3rem     (48px)
16:   4rem     (64px)
20:   5rem     (80px)
24:   6rem     (96px)
```

**Custom Spacing:**
- `18`: 4.5rem (72px)
- `88`: 22rem (352px)

**Max Widths:**
- `max-w-8xl`: 88rem
- `max-w-9xl`: 96rem

### UI Components Library

**Component System** ([components/ui/](apps/web/components/ui/)):

**Base Components:**
1. **Button** ([button.tsx](apps/web/components/ui/button.tsx))
   - Variants: primary, secondary, outline, ghost, danger
   - Sizes: sm, md, lg
   - States: default, hover, active, disabled, loading

2. **Input** ([input.tsx](apps/web/components/ui/input.tsx))
   - Text, email, password, number, search
   - Validation states: default, error, success
   - Icons: left/right icon support

3. **Badge** ([badge.tsx](apps/web/components/ui/badge.tsx))
   - Status indicators
   - Variants: default, success, warning, error, info
   - Sizes: sm, md, lg

4. **Dialog/Modal** ([dialog.tsx](apps/web/components/ui/dialog.tsx))
   - Overlay with backdrop
   - Sizes: sm, md, lg, xl, full
   - Animations: fade-in, slide-up

5. **Dropdown Menu** ([dropdown-menu.tsx](apps/web/components/ui/dropdown-menu.tsx))
   - Contextual menus
   - Nested submenus
   - Keyboard navigation

6. **Select** ([select.tsx](apps/web/components/ui/select.tsx))
   - Custom dropdown select
   - Search/filter support
   - Multi-select variant

7. **Tabs** ([tabs.tsx](apps/web/components/ui/tabs.tsx))
   - Horizontal/vertical tabs
   - Animated indicator
   - Icon support

8. **Tooltip** ([tooltip.tsx](apps/web/components/ui/tooltip.tsx))
   - Hover tooltips
   - Positions: top, right, bottom, left
   - Delay control

9. **Switch/Toggle** ([switch.tsx](apps/web/components/ui/switch.tsx))
   - Boolean toggle
   - Sizes: sm, md, lg
   - Labeled variants

10. **Progress Bar** ([progress.tsx](apps/web/components/ui/progress.tsx))
    - Linear progress
    - Circular progress
    - Percentage display
    - Indeterminate state

11. **Skeleton** ([skeleton.tsx](apps/web/components/ui/skeleton.tsx))
    - Loading placeholders
    - Pulse animation
    - Custom shapes

12. **Label** ([label.tsx](apps/web/components/ui/label.tsx))
    - Form field labels
    - Required indicator
    - Helper text

13. **Textarea** ([textarea.tsx](apps/web/components/ui/textarea.tsx))
    - Multi-line input
    - Auto-resize
    - Character count

14. **Pagination** ([pagination.tsx](apps/web/components/ui/pagination.tsx))
    - Page navigation
    - Items per page selector
    - Total count display

15. **Loading States** ([loading.tsx](apps/web/components/ui/loading.tsx), [loading-states.tsx](apps/web/components/ui/loading-states.tsx))
    - Spinner
    - Skeleton screens
    - Progressive loading

16. **Virtual List** ([virtual-list.tsx](apps/web/components/ui/virtual-list.tsx))
    - Performance optimization for long lists
    - Windowing/virtualization
    - Infinite scroll support

### Animations & Transitions

**Animation System** ([lib/animations.ts](apps/web/lib/animations.ts)):

**Keyframe Animations:**
```css
@keyframes fadeIn {
  0%   { opacity: 0 }
  100% { opacity: 1 }
}

@keyframes slideUp {
  0%   { transform: translateY(10px); opacity: 0 }
  100% { transform: translateY(0); opacity: 1 }
}

@keyframes bounce {
  /* Tailwind default bounce */
}
```

**Animation Classes:**
- `animate-fade-in`: 0.5s ease-in-out fade
- `animate-slide-up`: 0.3s ease-out slide
- `animate-bounce-slow`: 2s infinite bounce

**Transition Patterns:**
- Page transitions: 200ms ease
- Hover effects: 150ms ease
- Modal open/close: 300ms ease-out
- Drawer slide: 250ms cubic-bezier

**Motion Library:**
- Framer Motion integration for complex animations (optional)
- CSS transitions for simple effects
- Reduced motion respect (`prefers-reduced-motion`)

### Responsive Design

**Breakpoints** ([lib/responsive.ts](apps/web/lib/responsive.ts)):
```
sm:  640px   (mobile landscape)
md:  768px   (tablet)
lg:  1024px  (desktop)
xl:  1280px  (large desktop)
2xl: 1536px  (extra large)
```

**Responsive Strategy:**
- **Mobile-first** approach
- Flexbox and Grid layouts
- Container queries (where supported)
- Responsive typography (clamp)
- Touch-friendly targets (min 44px)

**Layout Patterns:**
- Sidebar: Hidden on mobile, drawer on tablet, fixed on desktop
- Navigation: Hamburger → tabs → horizontal menu
- Cards: 1 column → 2 columns → 3-4 columns
- Forms: Full width → 2 column layouts

### Theme Management

**Current Implementation:**
- Light mode only (primary)
- Dark mode infrastructure prepared
- Theme context ready for expansion

**Theme Variables:**
- CSS custom properties in `globals.css`
- Tailwind config colors
- Consistent across components

### Accessibility (a11y)

**Standards Compliance:**
- WCAG 2.1 Level AA target
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support

**Tools:**
- `@axe-core/react` for testing
- `jest-axe` for automated tests
- `eslint-plugin-jsx-a11y` for linting

**Features:**
- Skip to main content
- Focus visible styles
- Alt text for images
- Form field associations
- Error announcements
- Color contrast compliance

---

## ⚙️ 4. Backend / API

### Architecture Overview

**Framework:** NestJS 10.4.7
**Runtime:** Node.js 22.x
**Port:** 4000 (default)
**Global Prefix:** `/api`

**Module Structure** ([apps/api/src/app.module.ts](apps/api/src/app.module.ts)):

```typescript
AppModule
├── AuthModule              # Authentication & authorization
├── ScheduleModule          # Cron jobs (NestJS schedule)
├── BullModule              # Job queue management
├── AiModule                # AI integrations (OpenAI)
├── AiCoachModule           # AI coach/assistant features
├── HealthModule            # Health checks
├── JobsModule              # Background jobs
├── UploadsModule           # File uploads
├── HousekeepingModule      # Data cleanup tasks
├── RealEstateLeadsModule   # Real estate lead management
├── RealEstatePropertiesModule # Property CRUD
├── RealEstateResearchModule # AI property search
├── CampaignsModule         # Campaign management
├── ConnectionsModule       # OAuth connections (Meta, Google, etc.)
├── InsightsModule          # Campaign analytics
├── PlatformJobsModule      # Platform-level jobs
├── AuditModule             # Audit logging
└── ProductionModule        # Production vertical
```

### API Module Breakdown

#### 1. **AuthModule** ([modules/auth/](apps/api/src/modules/auth/))

**Purpose:** User authentication and authorization

**Controllers:**
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login (Firebase token exchange)
- `POST /api/auth/verify-token` - Verify Firebase ID token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/change-password` - Change user password
- `POST /api/auth/reset-password` - Password reset flow

**Services:**
- `AuthService` - Core auth logic
- `FirebaseAuthService` - Firebase Admin SDK integration
- `JwtStrategy` - Passport JWT strategy
- `PermissionService` - Role-based access control

**Guards:**
- `FirebaseAuthGuard` - Verify Firebase tokens
- `RolesGuard` - Check user roles
- `OrganizationGuard` - Enforce organization scoping

#### 2. **RealEstatePropertiesModule** ([modules/real-estate-properties/](apps/api/src/modules/real-estate-properties/))

**Purpose:** Property management for real estate vertical

**Controllers:**
- `GET /api/real-estate-properties` - List properties (paginated, filtered)
- `GET /api/real-estate-properties/:id` - Get single property
- `POST /api/real-estate-properties` - Create property
- `PUT /api/real-estate-properties/:id` - Update property
- `DELETE /api/real-estate-properties/:id` - Delete property
- `POST /api/real-estate-properties/import` - Bulk import (CSV, Yad2, Madlan)
- `POST /api/real-estate-properties/:id/photos` - Upload photos
- `POST /api/real-estate-properties/:id/score` - AI property scoring

**Services:**
- `PropertiesService` - CRUD operations
- `PropertyImportService` - Import from external sources
- `PropertyScoringService` - AI-based property scoring
- `PhotoUploadService` - S3 upload handling

#### 3. **RealEstateLeadsModule** ([modules/real-estate-leads/](apps/api/src/modules/real-estate-leads/))

**Purpose:** Lead tracking and management

**Controllers:**
- `GET /api/real-estate-leads` - List leads
- `GET /api/real-estate-leads/:id` - Get lead details
- `POST /api/real-estate-leads` - Create lead (form submission)
- `PUT /api/real-estate-leads/:id` - Update lead
- `DELETE /api/real-estate-leads/:id` - Delete lead
- `POST /api/real-estate-leads/import` - Bulk import

**Services:**
- `LeadsService` - Lead CRUD
- `LeadEventService` - Event tracking (timeline)
- `LeadImportService` - CSV/API imports
- `LeadNotificationService` - Email/SMS notifications

#### 4. **CampaignsModule** ([modules/campaigns/](apps/api/src/modules/campaigns/))

**Purpose:** Multi-platform campaign management

**Controllers:**
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/:id` - Get campaign
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `POST /api/campaigns/:id/activate` - Launch campaign
- `POST /api/campaigns/:id/pause` - Pause campaign
- `GET /api/campaigns/:id/insights` - Get performance data

**Services:**
- `CampaignsService` - Campaign CRUD
- `MetaCampaignService` - Meta (Facebook/Instagram) integration
- `GoogleCampaignService` - Google Ads integration
- `TikTokCampaignService` - TikTok Ads integration
- `LinkedInCampaignService` - LinkedIn Ads integration

#### 5. **ConnectionsModule** ([modules/connections/](apps/api/src/modules/connections/))

**Purpose:** OAuth connection management for external platforms

**Controllers:**
- `GET /api/connections` - List user's connections
- `GET /api/connections/:provider/auth` - Initiate OAuth flow
- `GET /api/connections/:provider/callback` - OAuth callback
- `DELETE /api/connections/:id` - Disconnect
- `POST /api/connections/:id/refresh` - Refresh token

**Supported Providers:**
- Meta (Facebook/Instagram)
- Google Ads
- TikTok Ads
- LinkedIn Ads

**Services:**
- `ConnectionsService` - Connection management
- `OAuthTokenService` - Token encryption/refresh
- `MetaOAuthService` - Meta-specific OAuth
- `GoogleOAuthService` - Google-specific OAuth

#### 6. **InsightsModule** ([modules/insights/](apps/api/src/modules/insights/))

**Purpose:** Campaign performance analytics

**Controllers:**
- `GET /api/insights/:connectionId` - Get insights for connection
- `GET /api/insights/campaign/:campaignId` - Campaign-specific insights
- `POST /api/insights/sync` - Trigger manual sync

**Services:**
- `InsightsService` - Insight aggregation
- `MetaInsightsService` - Fetch from Meta API
- `GoogleInsightsService` - Fetch from Google Ads API
- `InsightsCacheService` - Cache frequently accessed data

#### 7. **RealEstateResearchModule** ([modules/real-estate-research/](apps/api/src/modules/real-estate-research/))

**Purpose:** AI-powered property search and research

**Controllers:**
- `POST /api/real-estate-research/search` - Create search job
- `GET /api/real-estate-research/jobs/:id` - Get job status
- `GET /api/real-estate-research/jobs/:id/listings` - Get results
- `POST /api/real-estate-research/saved-searches` - Save search

**Services:**
- `SearchJobService` - Manage search jobs
- `YAD2ScraperService` - Scrape YAD2 listings
- `MadlanScraperService` - Scrape Madlan listings
- `AIEnrichmentService` - OpenAI enrichment
- `ListingDedupeService` - Deduplication logic

#### 8. **ProductionModule** ([modules/production/](apps/api/src/modules/production/))

**Purpose:** Production vertical (event management)

**Controllers:**
- Projects: CRUD for production projects
- Tasks: Task management within projects
- Suppliers: Supplier database and linking
- Budget: Budget tracking and invoicing
- Files: File uploads for project assets

**Services:**
- `ProductionProjectsService`
- `ProductionTasksService`
- `ProductionSuppliersService`
- `ProductionBudgetService`
- `ProductionFilesService`

#### 9. **AiModule** ([modules/ai/](apps/api/src/modules/ai/))

**Purpose:** OpenAI integrations

**Controllers:**
- `POST /api/ai/chat` - Chat completion
- `POST /api/ai/property-score` - Score property
- `POST /api/ai/lead-qualify` - Qualify lead
- `POST /api/ai/content-generate` - Generate content

**Services:**
- `OpenAIService` - OpenAI API wrapper
- `PromptService` - Prompt engineering
- `RateLimitService` - Rate limit AI calls
- `UsageTrackingService` - Track AI usage/costs

#### 10. **UploadsModule** ([modules/uploads/](apps/api/src/modules/uploads/))

**Purpose:** File upload handling

**Controllers:**
- `POST /api/uploads/properties` - Upload property images
- `POST /api/uploads/documents` - Upload documents
- `DELETE /api/uploads/:id` - Delete file

**Services:**
- `S3UploadService` - AWS S3 integration
- `ImageProcessingService` - Resize, optimize images
- `FileValidationService` - Validate file types/sizes

### Middleware & Guards

**Global Middlewares:**
1. **CompressionMiddleware** - Gzip compression
2. **CacheHeadersMiddleware** - Cache control headers
3. **PerformanceMonitoringMiddleware** - Request timing

**Guards:**
1. **FirebaseAuthGuard** - Verify Firebase ID tokens
2. **OrganizationGuard** - Enforce organization scoping
3. **RolesGuard** - Role-based access control
4. **ThrottlerGuard** - Rate limiting

### Error Handling

**Global Exception Filter:**
- Standardized error responses
- Error codes and messages
- Logging to console/external service
- Sanitized error details for production

### Background Jobs (Bull/Redis)

**Job Queues:**
1. **campaigns** - Campaign creation/sync
2. **insights** - Fetch analytics data
3. **imports** - Property/lead imports
4. **ai** - AI processing tasks
5. **emails** - Email notifications
6. **webhooks** - Webhook processing

**Job Processors:**
- Retry logic with exponential backoff
- Job progress tracking
- Failed job handling
- Scheduled jobs (cron)

### Database Connection

**Prisma Client:**
- Singleton instance
- Connection pooling (default)
- Query logging in development
- Error handling and retries

**Query Optimization:**
- Efficient indexes (see database section)
- `select` to limit fields
- Cursor-based pagination for large datasets
- `include` for relations only when needed

---

## 🗃️ 5. Database & Models

### Database Configuration

**Type:** PostgreSQL 16.x
**Hosting:** Neon.tech (serverless Postgres)
**Connection:** Prisma Client 6.16.1
**Schema Location:** [packages/server/db/prisma/schema.prisma](packages/server/db/prisma/schema.prisma)

**Environment Variables:**
```bash
DATABASE_URL="postgresql://..."        # Connection pooler
DIRECT_URL="postgresql://..."          # Direct connection (migrations)
SHADOW_DATABASE_URL="postgresql://..."  # Shadow DB for migrations
```

### Prisma Schema Overview

**Total Models:** 60+
**Total Enums:** 35+
**Architecture:** Multi-tenant with organization scoping

### Core Models

#### 1. **User**
```prisma
model User {
  id                 String   @id @default(cuid())
  fullName           String
  email              String   @unique
  passwordHash       String
  lang               String   @default("en")
  mustChangePassword Boolean  @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Relations
  memberships        Membership[]
  userProfile        UserProfile?
  ownedOrgs          Organization[]
  emailVerifications EmailVerification[]
  tasks              Task[]
  messages           Message[]
  productionTasks    ProductionTask[]
  productionFiles    ProductionFileAsset[]
}
```

**Purpose:** Core user authentication and profile
**Key Fields:**
- `email` - Unique identifier (synced with Firebase)
- `passwordHash` - bcrypt hash (Firebase manages this)
- `lang` - User's preferred language (en/he)

#### 2. **Organization**
```prisma
model Organization {
  id              String           @id @default(cuid())
  ownerUid        String           @unique // Backward compatibility
  name            String
  slug            String           @unique
  seatLimit       Int              @default(5)
  usedSeats       Int              @default(1)
  planTier        OrganizationTier @default(STARTER)
  ownerUserId     String
  domainAllowlist String[]         @default([])
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relations
  owner               User                  @relation(...)
  memberships         Membership[]
  invites             Invite[]
  properties          Property[]
  realEstateLeads     RealEstateLead[]
  ecommerceLeads      EcommerceLead[]
  campaigns           Campaign[]
  followupTemplates   AutoFollowupTemplate[]
  productionProjects  ProductionProject[]
  productionSuppliers ProductionSupplier[]
  subscription        Subscription?
  CreativeProject     CreativeProject[]
  CreativeAsset       CreativeAsset[]
  CreativeTemplate    CreativeTemplate[]
}
```

**Purpose:** Multi-tenant organization container
**Key Features:**
- Owns all business data (properties, leads, campaigns)
- Subscription and billing tied to org
- Seat limits and usage tracking
- Custom domain support

#### 3. **Membership**
```prisma
model Membership {
  id       String           @id @default(cuid())
  userId   String
  orgId    String
  ownerUid String           // Backward compatibility
  role     MembershipRole   @default(MEMBER)
  status   MembershipStatus @default(ACTIVE)

  // Custom permissions (overrides)
  customPermissions Json?

  // Invitation metadata
  invitedBy  String?
  invitedAt  DateTime?
  acceptedAt DateTime?
  joinedAt   DateTime  @default(now())

  // Relations
  user         User         @relation(...)
  organization Organization @relation(...)

  @@unique([userId, orgId])
}
```

**Purpose:** User-Organization relationship
**Roles:**
- `OWNER` - Full control
- `ADMIN` - Manage members, settings
- `MANAGER` - Manage data, campaigns
- `MEMBER` - View and edit assigned data
- `VIEWER` - Read-only access

### Real Estate Models

#### 4. **Property**
```prisma
model Property {
  id              String           @id @default(cuid())
  ownerUid        String
  orgId           String?
  name            String
  address         String?
  city            String?
  neighborhood    String?
  description     String?
  status          PropertyStatus   @default(DRAFT)
  transactionType TransactionType  @default(SALE)
  type            PropertyType?
  rooms           Int?
  size            Int?
  price           Int?
  rentPriceMonthly Int?
  currency        String?          @default("ILS")
  slug            String?          @unique

  // Import tracking
  provider      PropertyProvider @default(MANUAL)
  externalId    String?
  externalUrl   String?
  syncStatus    SyncStatus       @default(IDLE)
  lastSyncAt    DateTime?

  // AI scoring
  aiScore    Float?
  aiCategory String?
  aiInsights Json?
  aiScoredAt DateTime?

  // Relations
  photos       PropertyPhoto[]
  leads        RealEstateLead[]
  landingPages LandingPage[]
  organization Organization?

  @@index([ownerUid, status])
  @@index([orgId, status])
  @@index([city, status])
  @@index([price, status])
}
```

**Purpose:** Real estate property listings
**Features:**
- Multi-source imports (YAD2, Madlan, Guesty, manual)
- AI property scoring (quality assessment)
- Auto-generated landing pages
- Photo management
- SEO optimization fields

#### 5. **RealEstateLead**
```prisma
model RealEstateLead {
  id          String    @id @default(cuid())
  ownerUid    String
  orgId       String?
  fullName    String?
  phone       String?
  email       String?
  message     String?
  source      String?
  propertyId  String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  property            Property?
  organization        Organization?
  RealEstateLeadEvent RealEstateLeadEvent[]

  @@index([ownerUid, createdAt])
  @@index([orgId, createdAt])
  @@index([propertyId])
}
```

**Purpose:** Lead tracking for real estate
**Features:**
- Property association
- Event timeline
- Multi-channel sources

### E-Commerce Models

#### 6. **EcommerceLead**
```prisma
model EcommerceLead {
  id         String     @id @default(cuid())
  ownerUid   String
  orgId      String?
  externalId String?

  // Contact info
  fullName  String?
  firstName String?
  lastName  String?
  phone     String?
  email     String?
  city      String?

  // Lead management
  status     LeadStage  @default(NEW)
  score      LeadScore  @default(COLD)
  source     LeadSource @default(MANUAL)
  sourceName String?
  assigneeId String?

  // UTM tracking
  utmSource   String?
  utmMedium   String?
  utmCampaign String?
  utmTerm     String?
  utmContent  String?

  // Validation
  phoneValid FieldValidationStatus @default(PENDING)
  emailValid FieldValidationStatus @default(PENDING)

  // Campaign attribution
  campaignId String?

  // Conversion tracking
  orderValue     Decimal?
  conversionDate DateTime?
  orderNumber    String?

  // Relations
  events       LeadEvent[]
  activities   LeadActivity[]
  campaign     Campaign?
  organization Organization?
  followups    AutoFollowupExecution[]
  sales        Sale[]

  @@unique([ownerUid, externalId, source])
  @@index([ownerUid, status, createdAt])
}
```

**Purpose:** E-commerce lead management
**Features:**
- Multi-source imports (Facebook, CSV, Shopify)
- Lead scoring (HOT/WARM/COLD)
- Campaign attribution
- UTM tracking
- Conversion tracking
- Auto-followup execution

#### 7. **Campaign**
```prisma
model Campaign {
  id       String           @id @default(cuid())
  ownerUid String
  orgId    String?
  name     String
  platform CampaignPlatform
  status   CampaignStatus   @default(DRAFT)
  goal     CampaignGoal

  // Budget
  budget      Float?
  dailyBudget Float?

  // Platform IDs
  platformCampaignId String?
  platformAdSetId    String?

  // Performance
  spend       Float @default(0)
  clicks      Int   @default(0)
  impressions Int   @default(0)
  conversions Int   @default(0)

  // Relations
  connection   OAuthConnection
  connectionId String
  organization Organization?
  leads        EcommerceLead[]
  sales        Sale[]

  @@index([ownerUid])
  @@index([orgId, status])
}
```

**Purpose:** Multi-platform campaign management
**Platforms:** Meta, Google, TikTok, LinkedIn

### Production Vertical Models

#### 8. **ProductionProject**
```prisma
model ProductionProject {
  id          String        @id @default(cuid())
  name        String
  description String?
  type        ProjectType   @default(OTHER)
  status      ProjectStatus @default(PLANNING)
  startDate   DateTime?
  endDate     DateTime?

  ownerUid       String
  organizationId String

  // Relations
  organization Organization
  tasks        ProductionTask[]
  budgetItems  ProductionBudgetItem[]
  files        ProductionFileAsset[]
  suppliers    ProductionProjectSupplier[]
}
```

**Purpose:** Event/production project management
**Features:**
- Task management with dependencies
- Budget tracking (planned vs actual)
- Supplier management
- File uploads (permits, designs, contracts)

### Creative Productions Models

#### 9. **CreativeProject**
```prisma
model CreativeProject {
  id             String                @id @default(cuid())
  orgId          String
  name           String
  objective      String?
  targetAudience String?
  channels       String[] // ["META_FEED", "INSTAGRAM_STORY", ...]
  status         CreativeProjectStatus @default(DRAFT)
  dueDate        DateTime?
  ownerUid       String

  tasks   CreativeTask[]
  assets  CreativeAsset[]
  reviews CreativeReview[]
  renders CreativeRender[]
}
```

**Purpose:** Video/ad production workflow
**Features:**
- Task workflow (script, design, edit, etc.)
- Asset management (video, images, copy)
- Review/approval process
- Multi-format rendering

### Platform Integration Models

#### 10. **Connection**
```prisma
model Connection {
  id             String             @id @default(cuid())
  ownerUid       String
  organizationId String?
  provider       ConnectionProvider
  status         ConnectionStatus   @default(DISCONNECTED)
  displayName    String?
  accountEmail   String?
  lastSyncAt     DateTime?
  lastErrorAt    DateTime?

  oauthTokens OAuthToken[]
  adAccounts  AdAccount[]
  campaigns   ExternalCampaign[]
  jobs        Job[]
  insights    Insight[]

  @@unique([ownerUid, provider])
}
```

**Purpose:** OAuth connections to external platforms
**Features:**
- Encrypted token storage
- Automatic token refresh
- Health monitoring
- Multi-account support

### Billing & Subscription Models

#### 11. **Subscription**
```prisma
model Subscription {
  id           String             @id @default(cuid())
  orgId        String             @unique
  plan         SubscriptionPlan   @default(BASIC)
  status       SubscriptionStatus @default(TRIALING)

  // Stripe
  stripeCustomerId       String?   @unique
  stripeSubscriptionId   String?   @unique
  stripeCurrentPeriodEnd DateTime?

  // Usage limits
  userSeats     Int @default(1)
  leadLimit     Int @default(100)
  propertyLimit Int @default(50)

  // Billing
  trialEndsAt     DateTime?
  billingEmail    String?
  nextBillingDate DateTime?

  organization Organization
  invoices     Invoice[]
  usageRecords UsageRecord[]
}
```

**Purpose:** SaaS billing and subscription management
**Plans:**
- **BASIC** - $29/mo - 1 user, 100 leads
- **PRO** - $99/mo - 5 users, 1000 leads, automations
- **AGENCY** - $299/mo - Unlimited, white-label, API
- **ENTERPRISE** - Custom pricing

### Enums (Key Types)

**Vertical:**
```prisma
enum Vertical {
  REAL_ESTATE
  LAW
  E_COMMERCE
  PRODUCTION
}
```

**MembershipRole:**
```prisma
enum MembershipRole {
  OWNER
  ADMIN
  MANAGER
  MEMBER
  VIEWER
}
```

**PropertyStatus:**
```prisma
enum PropertyStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**LeadStage:**
```prisma
enum LeadStage {
  NEW
  CONTACTED
  QUALIFIED
  MEETING
  OFFER
  DEAL
  WON
  LOST
}
```

**CampaignPlatform:**
```prisma
enum CampaignPlatform {
  META
  GOOGLE
  TIKTOK
  LINKEDIN
}
```

### Indexes & Performance

**Index Strategy:**
1. **Organization scoping:** `[orgId, status]`, `[orgId, createdAt]`
2. **User scoping:** `[ownerUid, status]`, `[ownerUid, createdAt]`
3. **Search/filter:** `[city, status]`, `[price, rooms]`
4. **Foreign keys:** All relation fields indexed
5. **Unique constraints:** `email`, `slug`, composite keys

**Performance Optimizations:**
- Cursor-based pagination for large lists
- Selective field loading (`select`)
- Efficient joins (`include` with filters)
- Compound indexes for common queries

### Migrations

**Migration Strategy:**
- Development: `prisma migrate dev`
- Production: `prisma migrate deploy`
- Shadow database for safe migration testing

**Migration Files:** [packages/server/db/prisma/migrations/](packages/server/db/prisma/migrations/)

---

## 🔌 6. Integrations & External Services

### Firebase (Authentication & Backend)

**Status:** ✅ Active (Production)
**Implementation:** Client SDK + Admin SDK

**Services Used:**
1. **Firebase Authentication**
   - Email/password authentication
   - Email verification
   - Password reset
   - User management

2. **Firestore** (Legacy/Migration)
   - Being migrated to PostgreSQL
   - Some user profile data still in Firestore

3. **Firebase Storage** (Optional)
   - Alternative to AWS S3 for file storage
   - Not primary storage solution

**Configuration:**
- Client SDK: [lib/firebase.ts](apps/web/lib/firebase.ts)
- Admin SDK: [lib/firebaseAdmin.server.ts](apps/web/lib/firebaseAdmin.server.ts)
- Environment variables: `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_ADMIN_*`

### OpenAI (AI Features)

**Status:** ✅ Active (Production)
**Version:** 5.16.0
**Implementation:** [apps/api/src/modules/ai/](apps/api/src/modules/ai/)

**Use Cases:**
1. **Property Scoring**
   - Analyze property descriptions
   - Score quality (0-100)
   - Generate insights and recommendations

2. **Lead Qualification**
   - Qualify leads based on message content
   - Sentiment analysis
   - Priority scoring

3. **Content Generation**
   - Property descriptions
   - Email templates
   - Ad copy

4. **AI Property Search**
   - Parse natural language search queries
   - Enrich scraped listings
   - Match properties to buyer criteria

**Rate Limiting:**
- Rate limiter: [lib/aiRateLimiter.ts](apps/web/lib/aiRateLimiter.ts)
- Usage tracking: [lib/aiRequestLogger.ts](apps/web/lib/aiRequestLogger.ts)
- Cost monitoring in database

**Models Used:**
- GPT-4 for complex analysis
- GPT-3.5-turbo for simple tasks
- Text-embedding-ada-002 for search

### AWS S3 (File Storage)

**Status:** ✅ Active (Production)
**SDK:** `@aws-sdk/client-s3`
**Implementation:** [apps/api/src/modules/uploads/](apps/api/src/modules/uploads/)

**Use Cases:**
1. **Property Photos**
   - Optimized image storage
   - Automatic resizing
   - CDN integration

2. **Document Storage**
   - PDF contracts
   - Design files
   - Permits and certifications

3. **Creative Assets**
   - Video files
   - Audio assets
   - Final renders

**Bucket Structure:**
```
effinity-production/
├── properties/
│   ├── {propertyId}/
│   │   ├── original/
│   │   ├── large/
│   │   ├── medium/
│   │   └── thumbnail/
├── documents/
├── creative-assets/
└── temp/
```

**Security:**
- Pre-signed URLs for uploads
- Time-limited download URLs
- Public read for published property images
- Private for documents

### Stripe (Payment Processing)

**Status:** ✅ Active (Production)
**SDK:** `stripe` (server), `@stripe/stripe-js` (client)
**Implementation:** [lib/stripe.ts](apps/web/lib/stripe.ts)

**Integration Points:**
1. **Subscription Management**
   - Create customers
   - Subscribe to plans
   - Upgrade/downgrade
   - Cancel subscriptions

2. **Billing Portal**
   - Customer self-service
   - Invoice history
   - Payment method management

3. **Webhooks**
   - `invoice.paid` - Renew subscription
   - `invoice.payment_failed` - Suspend account
   - `customer.subscription.deleted` - Cancel subscription

**Plans Configuration:**
- Basic: `STRIPE_PRICE_BASIC`
- Pro: `STRIPE_PRICE_PRO`
- Agency: `STRIPE_PRICE_AGENCY`

### Meta (Facebook/Instagram)

**Status:** ✅ Active (Production)
**Implementation:** [apps/api/src/modules/connections/](apps/api/src/modules/connections/)

**OAuth Flow:**
1. User clicks "Connect Facebook"
2. Redirect to Meta OAuth: `GET /api/connections/meta/auth`
3. User authorizes on Facebook
4. Callback: `GET /api/connections/meta/callback`
5. Exchange code for access token
6. Store encrypted token in database
7. Fetch ad accounts

**Features:**
1. **Campaign Creation**
   - Create campaigns via API
   - Set budgets and targeting
   - Upload creatives

2. **Lead Sync**
   - Pull leads from Lead Ads
   - Webhook integration
   - Deduplication

3. **Insights**
   - Daily performance sync
   - Spend, impressions, clicks
   - Conversion tracking

**Permissions Required:**
- `ads_management`
- `ads_read`
- `leads_retrieval`
- `pages_read_engagement`

### Google Ads

**Status:** 🟡 In Progress
**Implementation:** [apps/api/src/modules/connections/](apps/api/src/modules/connections/)

**OAuth Flow:** Similar to Meta
**Features:**
- Campaign management
- Keyword bidding
- Performance insights
- Lead extensions

**Status:** OAuth flow complete, campaign creation in progress

### TikTok Ads

**Status:** 🟡 Planned
**Implementation:** Placeholder ready

**Features (Planned):**
- Campaign creation
- Video ad uploads
- Audience targeting
- Performance tracking

### LinkedIn Ads

**Status:** 🟡 Planned
**Implementation:** Placeholder ready

**Features (Planned):**
- B2B campaign management
- Lead gen forms
- Audience targeting
- Company page integration

### Real Estate Platforms

#### YAD2 (Israeli Real Estate)

**Status:** ✅ Active (Production)
**Type:** Web scraping
**Implementation:** [apps/api/src/modules/real-estate-research/](apps/api/src/modules/real-estate-research/)

**Features:**
- Property listing scraper
- Search by location, price, rooms
- Image extraction
- Contact info parsing
- Deduplication

**Rate Limiting:**
- Respectful scraping (delays between requests)
- User-agent rotation
- Error handling for blocked requests

#### Madlan (Israeli Real Estate)

**Status:** ✅ Active (Production)
**Type:** Web scraping
**Implementation:** Similar to YAD2

**Features:**
- Alternative data source
- Cross-platform deduplication
- Price comparison

#### Guesty (Property Management)

**Status:** 🔴 Planned
**Type:** API integration

**Planned Features:**
- Import properties from Guesty
- Sync bookings and availability
- Calendar integration
- Guest communication

### Email Service

**Status:** 🟡 To Be Implemented
**Options:** SendGrid, AWS SES, Postmark

**Use Cases:**
- Transactional emails (welcome, password reset)
- Lead notifications
- Auto-followup sequences
- Invoice emails

### SMS Service

**Status:** 🟡 To Be Implemented
**Options:** Twilio, AWS SNS

**Use Cases:**
- Lead notifications (urgent)
- 2FA codes
- Auto-followup sequences

### Webhook Providers

#### Zapier Integration

**Status:** 🟡 Planned
**Features:**
- Trigger on new lead
- Trigger on new property
- Action: Create lead
- Action: Update lead status

#### Make (Integromat)

**Status:** 🟡 Planned
**Features:** Similar to Zapier

---

## 🔐 7. Authentication & Access Logic

### Firebase Authentication Flow

**Registration Flow:**

1. **User Input** ([app/register/page.tsx](apps/web/app/register/page.tsx))
   - Email, password, full name
   - Vertical selection (Real Estate, E-Commerce, Law, Production)
   - Account type (Freelancer/Company)
   - Terms acceptance

2. **Client-side Firebase Auth**
   ```typescript
   const { user } = await createUserWithEmailAndPassword(auth, email, password);
   await sendEmailVerification(user);
   ```

3. **Send Email Verification**
   - Automatic email sent by Firebase
   - User must verify before full access

4. **Create Database Record** (API call)
   - POST to `/api/auth/register`
   - Creates `User` record in PostgreSQL
   - Creates `Organization` record
   - Creates `Membership` with OWNER role
   - Creates `UserProfile` with vertical preference

5. **Redirect to Dashboard**
   - Based on selected vertical
   - Onboarding flow (if needed)

**Login Flow:**

1. **User Input** ([app/login/page.tsx](apps/web/app/login/page.tsx))
   - Email and password

2. **Firebase Sign In**
   ```typescript
   const { user } = await signInWithEmailAndPassword(auth, email, password);
   const idToken = await user.getIdToken();
   ```

3. **Client State Update**
   - `AuthContext` updates
   - User object stored
   - Token stored in memory (not localStorage for security)

4. **Fetch User Profile** (API call)
   - GET `/api/auth/me` with token
   - Retrieves full user profile, organization, membership

5. **Redirect to Dashboard**
   - Based on user's default vertical
   - Restores previous location if available

**Logout Flow:**

1. **Firebase Sign Out**
   ```typescript
   await signOut(auth);
   ```

2. **Clear Client State**
   - AuthContext reset
   - OrganizationContext reset
   - Clear any cached data

3. **Redirect to Login**

### Session Management

**Client-side ([lib/auth-context.tsx](apps/web/lib/auth-context.tsx)):**

```typescript
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

// Firebase listener
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const idToken = await firebaseUser.getIdToken();
      // Fetch full user profile from API
      const userData = await fetchUserProfile(idToken);
      setUser(userData);
    } else {
      setUser(null);
    }
    setLoading(false);
  });

  return unsubscribe;
}, []);
```

**Server-side Token Verification ([apps/api/src/modules/auth/](apps/api/src/modules/auth/)):**

```typescript
// Guard on protected routes
@UseGuards(FirebaseAuthGuard)
async getProtectedData(@Request() req) {
  // req.user populated by guard
  const { uid, email, orgId } = req.user;
  // ...
}

// FirebaseAuthGuard implementation
async canActivate(context: ExecutionContext) {
  const request = context.switchToHttp().getRequest();
  const authHeader = request.headers.authorization;

  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');

  // Verify with Firebase Admin SDK
  const decodedToken = await admin.auth().verifyIdToken(token);

  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { id: decodedToken.uid }
  });

  request.user = user;
  return true;
}
```

### Role-Based Access Control (RBAC)

**Permission System ([lib/permissions.ts](apps/web/lib/permissions.ts)):**

**Roles:**
- **OWNER** - Full access to organization
- **ADMIN** - Manage members, settings, billing
- **MANAGER** - Manage properties, leads, campaigns
- **MEMBER** - Edit assigned data, view all
- **VIEWER** - Read-only access

**Feature Permissions (Enum):**
```typescript
enum FeatureAccess {
  // Leads
  LEADS_READ,
  LEADS_WRITE,
  LEADS_DELETE,
  LEADS_EXPORT,
  LEADS_BULK_ACTIONS,
  LEADS_ASSIGN,

  // Properties
  PROPERTIES_READ,
  PROPERTIES_WRITE,
  PROPERTIES_DELETE,
  PROPERTIES_PUBLISH,
  PROPERTIES_ASSIGN_AGENT,
  PROPERTIES_IMPORT,

  // Campaigns
  CAMPAIGNS_READ,
  CAMPAIGNS_WRITE,
  CAMPAIGNS_DELETE,
  CAMPAIGNS_ACTIVATE,
  CAMPAIGNS_VIEW_ANALYTICS,
  CAMPAIGNS_MANAGE_BUDGET,

  // Organization
  ORG_SETTINGS,
  ORG_BILLING,
  ORG_MEMBERS_READ,
  ORG_MEMBERS_WRITE,
  ORG_INVITE_MEMBERS,

  // Advanced (plan-gated)
  API_ACCESS,
  WHITE_LABEL,
  CUSTOM_INTEGRATIONS,
  BULK_OPERATIONS,
  ADVANCED_ANALYTICS,
}
```

**Permission Checks:**

```typescript
// Client-side
const { hasPermission } = usePermissions();

{hasPermission('LEADS_WRITE') && (
  <Button onClick={createLead}>Create Lead</Button>
)}

// Server-side
@RequirePermission(FeatureAccess.LEADS_WRITE)
async createLead(@Body() dto: CreateLeadDto) {
  // ...
}
```

**Custom Permissions:**
- Stored in `Membership.customPermissions` (JSON)
- Override default role permissions
- Granular control for specific users

### Organization Scoping

**All queries scoped to organization:**

```typescript
// Frontend API calls
const leads = await api.get('/api/leads', {
  headers: { 'x-org-id': currentOrgId }
});

// Backend enforcement
@UseGuards(OrganizationGuard)
async getLeads(@Request() req) {
  const { orgId } = req.user;

  return prisma.ecommerceLead.findMany({
    where: { orgId }
  });
}
```

**Multi-org Support:**
- Users can be members of multiple organizations
- Organization switcher in header
- Separate data per organization
- Shared user account across orgs

### Security Features

1. **Token Expiration**
   - Firebase tokens expire after 1 hour
   - Auto-refresh handled by Firebase SDK

2. **CSRF Protection**
   - SameSite cookies
   - CORS configuration

3. **Rate Limiting**
   - Per-user rate limits
   - Per-IP rate limits
   - Configurable thresholds

4. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase
   - At least one number
   - At least one special character

5. **Email Verification**
   - Required before full access
   - Resend verification email option

6. **Password Reset**
   - Firebase password reset email
   - Secure token-based flow

---

## ☁️ 8. Deployment & Environment

### Deployment Platforms

**Frontend (Next.js):**
- **Platform:** Vercel
- **URL:** https://effinity.co.il (production)
- **Framework Detection:** Automatic (Next.js)
- **Build Command:** `pnpm run build` (from monorepo root)
- **Output Directory:** `.next`
- **Node Version:** 22.x

**Backend (NestJS):**
- **Platform:** To Be Determined (Railway, Render, or AWS)
- **Current:** Development only (localhost:4000)
- **Port:** 4000
- **PM2** (process management) recommended for production

**Database:**
- **Platform:** Neon.tech (Serverless PostgreSQL)
- **Region:** EU West 2 (Ireland)
- **Connection Pooling:** Built-in
- **Auto-scaling:** Enabled

**File Storage:**
- **Platform:** AWS S3
- **Bucket:** `effinity-production`
- **Region:** us-east-1
- **CDN:** CloudFront (optional)

### Build Process

**Monorepo Build Flow:**

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Generate Prisma client (postinstall hook)
prisma generate --schema packages/server/db/prisma/schema.prisma

# Build all apps (Turbo)
turbo run build

# Apps build order:
# 1. packages/* (shared code)
# 2. apps/api (NestJS)
# 3. apps/web (Next.js)
```

**Vercel Configuration ([apps/web/vercel.json](apps/web/vercel.json)):**

```json
{
  "buildCommand": "pnpm run build",
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "build": {
    "env": {
      "SKIP_ENV_VALIDATION": "true"
    }
  }
}
```

**Next.js Build Optimizations:**
- SWC compiler (faster than Babel)
- Bundle analyzer (optional, `ANALYZE=true`)
- Image optimization (next/image)
- Code splitting (automatic)
- Tree shaking (automatic)
- Minification (production)

### Environment Variables

**Structure:** `.env.example` provides template

**Required Variables:**

**Database:**
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host:5432/db?sslmode=require"
SHADOW_DATABASE_URL="postgresql://..." # For migrations
```

**Firebase (Client - Public):**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
```

**Firebase (Server - Private):**
```bash
FIREBASE_ADMIN_PROJECT_ID="..."
FIREBASE_ADMIN_CLIENT_EMAIL="..."
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

**API:**
```bash
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api" # Dev
# NEXT_PUBLIC_API_BASE_URL="https://effinity.co.il/api" # Prod
```

**OpenAI:**
```bash
OPENAI_API_KEY="sk-..."
```

**Stripe:**
```bash
STRIPE_SECRET_KEY="sk_test_..." # or sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # or pk_live_...
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_AGENCY="price_..."
```

**OAuth Providers:**
```bash
# Meta
META_CLIENT_ID="..."
META_CLIENT_SECRET="..."
META_REDIRECT_URI="https://effinity.co.il/api/connections/meta/callback"

# Google
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="https://effinity.co.il/api/connections/google-ads/callback"

# TikTok
TIKTOK_CLIENT_ID="..."
TIKTOK_CLIENT_SECRET="..."
TIKTOK_REDIRECT_URI="https://effinity.co.il/api/connections/tiktok-ads/callback"

# LinkedIn
LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."
LINKEDIN_REDIRECT_URI="https://effinity.co.il/api/connections/linkedin-ads/callback"
```

**AWS:**
```bash
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="effinity-production"
```

**Redis (for Bull jobs):**
```bash
REDIS_HOST="localhost" # Dev
REDIS_PORT="6379"
REDIS_PASSWORD="" # Optional
```

**Build Flags:**
```bash
NEXT_DISABLE_SWC_TOOLS_PATCHING="1" # Fix SWC issues
SKIP_ENV_VALIDATION="false" # Skip validation in CI
```

### CI/CD Pipeline

**Current Setup:**
- **Vercel Git Integration** - Auto-deploy on push to `main`
- **Preview Deployments** - All pull requests get preview URLs
- **Production Branch** - `main` branch deploys to production

**Build Triggers:**
1. Push to `main` → Production deployment
2. Push to feature branch → Preview deployment
3. Pull request → Preview deployment

**Deployment Steps:**
1. Install dependencies (`pnpm install`)
2. Generate Prisma client
3. Build Next.js app
4. Deploy to Vercel Edge Network
5. Invalidate CDN cache

**Environment Separation:**
- **Production:** Vercel production environment
- **Preview:** Vercel preview deployments
- **Local:** Developer machines

### Current Deployment Status

**Production URL:** https://effinity.co.il

**Recent Deployments:**
- ✅ Successfully deployed to Vercel
- ✅ Middleware issues resolved (simplified to safety wrapper)
- ✅ Build errors fixed (TypeScript/ESLint temporarily ignored)
- ✅ Prisma client generation working

**Known Issues:**
- ⚠️ TypeScript strict mode disabled (`ignoreBuildErrors: true`)
- ⚠️ ESLint disabled during builds (`ignoreDuringBuilds: true`)
- ⚠️ Some components need TypeScript fixes
- ⚠️ API backend not yet deployed (runs locally only)

**Next Deployment Steps:**
1. Deploy NestJS API (Railway/Render recommended)
2. Configure API_BASE_URL to point to deployed API
3. Set up production Redis instance
4. Enable TypeScript strict mode
5. Fix all TypeScript errors
6. Enable ESLint checks
7. Set up monitoring (Sentry, LogRocket, etc.)

### Monitoring & Logging

**Planned:**
- **Error Tracking:** Sentry
- **Performance:** Vercel Analytics
- **User Analytics:** PostHog or Mixpanel
- **Logs:** Vercel Logs + CloudWatch (for API)

**Health Checks:**
- Frontend: Vercel automatic monitoring
- API: `/api/health` endpoint (NestJS HealthModule)

---

## 📱 9. UI Pages Summary

Total pages: **55+**

### Public Marketing Pages (`(marketing)` group)

#### 1. **Homepage** - `/`
**File:** [app/page.tsx](apps/web/app/page.tsx)
**Purpose:** Main landing page with conversion focus

**Sections:**
- **Hero Section** - Value proposition, CTA buttons (Start Free Trial, Book Demo)
- **Stats Counter** - 10K+ properties, 50K+ leads, $50M+ sales, 95% satisfaction
- **Features Grid** - 6 key features (AI leads, properties, campaigns, automation, integrations, analytics)
- **Integration Showcase** - Logos of integrated platforms
- **Pricing Cards** - 3 plans (Basic, Pro, Agency)
- **Testimonials** - 3 customer quotes with attribution
- **FAQ Section** - Common questions
- **CTA Section** - Final conversion push

**Components Used:**
- `Hero`, `FeatureCard`, `PricingCard`, `Testimonial`, `FAQ`, `CTASection`, `IntegrationGrid`, `StatsCounter`

**State:** Client component (workaround for Next.js 15.5 RSC bug)

#### 2. **About** - `/about`
**Purpose:** Company story, mission, team
**Status:** Basic page, needs content

#### 3. **Features** - `/features`
**Purpose:** Detailed feature showcase
**Content:** Expanded feature descriptions with screenshots

#### 4. **Pricing** - `/pricing`
**Purpose:** Pricing plans and comparison
**Features:**
- Plan comparison table
- FAQ about billing
- Free trial CTA

#### 5. **Contact** - `/contact`
**Purpose:** Contact form
**Features:**
- Name, email, message fields
- Form validation
- Email delivery (to be implemented)

#### 6. **Demo** - `/demo`
**Purpose:** Schedule demo request
**Features:**
- Calendar integration (planned)
- Lead capture form

### Authentication Pages

#### 7. **Login** - `/login`
**File:** [app/login/page.tsx](apps/web/app/login/page.tsx)
**Purpose:** User login with Firebase

**Features:**
- Email/password inputs
- Firebase authentication
- Remember me (optional)
- Forgot password link
- Register link
- Error handling

**Flow:**
1. User enters credentials
2. Firebase `signInWithEmailAndPassword`
3. Fetch user profile from API
4. Redirect to dashboard (based on vertical)

#### 8. **Register** - `/register`
**File:** [app/register/page.tsx](apps/web/app/register/page.tsx)
**Purpose:** New user registration

**Features:**
- Full name, email, password
- **Vertical selection** - Real Estate, E-Commerce, Law, Production
- **Account type** - Freelancer vs Company
- Terms acceptance checkbox
- Email verification flow
- Organization creation

**Flow:**
1. User fills form
2. Firebase `createUserWithEmailAndPassword`
3. Send email verification
4. Create User, Organization, Membership in database
5. Redirect to vertical-specific onboarding

### Dashboard - Real Estate Vertical

#### 9. **Real Estate Dashboard** - `/dashboard/real-estate/dashboard`
**File:** [app/dashboard/real-estate/dashboard/page.tsx](apps/web/app/dashboard/real-estate/dashboard/page.tsx)

**Purpose:** Overview of real estate business

**Widgets:**
- Total properties (with trend)
- New leads (today/week)
- Active campaigns
- Conversion rate
- Recent leads table
- Properties by status chart
- Lead sources breakdown
- Quick actions (Add Property, Create Campaign)

#### 10. **Properties List** - `/dashboard/real-estate/properties`
**File:** [app/dashboard/real-estate/properties/page.tsx](apps/web/app/dashboard/real-estate/properties/page.tsx)

**Purpose:** Manage property listings

**Features:**
- Searchable/filterable table
- Columns: Name, City, Price, Rooms, Size, Status, Actions
- Status filters (Draft, Published, Archived)
- Bulk actions
- Sort by price, date, etc.
- Pagination
- Quick view modal
- Edit/Delete actions

**Actions:**
- Create new property
- Edit property
- Delete property
- Publish/unpublish
- Generate landing page
- View analytics

#### 11. **New Property** - `/dashboard/real-estate/properties/new`
**File:** [app/dashboard/real-estate/properties/new/page.tsx](apps/web/app/dashboard/real-estate/properties/new/page.tsx)

**Purpose:** Create new property listing

**Form Fields:**
- Property name
- Address, city, neighborhood
- Transaction type (Sale/Rent)
- Property type (Apartment, House, Villa, etc.)
- Price (sale or monthly rent)
- Rooms, size (sqm)
- Description (rich text)
- Agent name, phone
- Photos (multi-upload with preview)
- Amenities (checkboxes)
- SEO fields (title, description)

**Features:**
- Auto-generate slug
- Photo upload to S3
- Form validation
- Save as draft or publish
- Preview before publish

#### 12. **Property Details** - `/dashboard/real-estate/properties/[slug]`
**File:** [app/dashboard/real-estate/properties/[slug]/page.tsx](apps/web/app/dashboard/real-estate/properties/[slug]/page.tsx)

**Purpose:** View/edit property details

**Sections:**
- Property gallery (photo carousel)
- Details panel
- Lead form preview
- Analytics (views, leads, conversion)
- Associated leads table
- Activity timeline
- Landing page URL + QR code

**Actions:**
- Edit property
- Generate/view landing page
- Share (social, WhatsApp)
- Download QR code
- AI score property

#### 13. **Property Edit** - `/dashboard/real-estate/[id]/edit`
**File:** [app/dashboard/real-estate/[id]/edit/page.tsx](apps/web/app/dashboard/real-estate/[id]/edit/page.tsx)

**Purpose:** Edit existing property
**Content:** Same form as "New Property" with pre-filled data

#### 14. **Leads** - `/dashboard/real-estate/leads`
**File:** [app/dashboard/real-estate/leads/page.tsx](apps/web/app/dashboard/real-estate/leads/page.tsx)

**Purpose:** Manage real estate leads

**Features:**
- Leads table (Name, Phone, Email, Property, Source, Date)
- Status filters
- Source filters (Website, Phone, Email, Referral)
- Search by name/phone/email
- Bulk actions (Assign, Delete, Export)
- Lead timeline view
- Export to CSV

**Actions:**
- View lead details
- Contact lead (call, email, WhatsApp)
- Assign to agent
- Update status
- Add notes

#### 15. **AI Property Searcher** - `/dashboard/real-estate/ai-searcher`
**File:** [app/dashboard/real-estate/ai-searcher/page.tsx](apps/web/app/dashboard/real-estate/ai-searcher/page.tsx)

**Purpose:** AI-powered property search across YAD2, Madlan

**Features:**
- Natural language search input
- Filters: Location, price range, rooms, size
- Provider selection (YAD2, Madlan, both)
- Search job tracking
- Results table with AI scoring
- Deduplication across sources
- Save search for recurring runs
- Export results

**Flow:**
1. User enters search criteria
2. Create SearchJob (backend)
3. Scrape providers (background job)
4. AI enrichment (OpenAI)
5. Deduplication
6. Display results with scores
7. Option to import to properties

#### 16. **Campaigns** - `/dashboard/real-estate/campaigns`
**File:** [app/dashboard/real-estate/campaigns/page.tsx](apps/web/app/dashboard/real-estate/campaigns/page.tsx)

**Purpose:** Campaign management

**Features:**
- Campaigns table (Name, Platform, Status, Budget, Spend, Leads, ROI)
- Create campaign wizard
- Platform connections (Meta, Google)
- Performance charts
- Active/Paused/Archived filters

#### 17. **Automations** - `/dashboard/real-estate/automations`
**File:** [app/dashboard/real-estate/automations/page.tsx](apps/web/app/dashboard/real-estate/automations/page.tsx)

**Purpose:** Workflow automations

**Features:**
- Automation rules list
- Create automation wizard
- Triggers: New lead, status change, no response, etc.
- Actions: Send email, SMS, assign lead, create task
- Templates library
- Execution logs

#### 18. **Integrations** - `/dashboard/real-estate/integrations`
**File:** [app/dashboard/real-estate/integrations/page.tsx](apps/web/app/dashboard/real-estate/integrations/page.tsx)

**Purpose:** External integrations management

**Available Integrations:**
- YAD2 (scraping, no OAuth)
- Madlan (scraping)
- Guesty (planned)
- Zillow (planned)
- HubSpot (planned)
- Zoho (planned)
- Salesforce (planned)

**Features:**
- Connection status
- Last sync time
- Sync now button
- Configuration settings
- Disconnect option

#### 19. **Reports** - `/dashboard/real-estate/reports`
**File:** [app/dashboard/real-estate/reports/page.tsx](apps/web/app/dashboard/real-estate/reports/page.tsx)

**Purpose:** Analytics and reporting

**Reports:**
- Leads over time (chart)
- Properties by status (pie chart)
- Lead sources (bar chart)
- Conversion funnel
- Agent performance
- Campaign ROI

**Features:**
- Date range selector
- Export to PDF/CSV
- Schedule reports (email)
- Custom report builder (planned)

### Dashboard - E-Commerce Vertical

#### 20. **E-Commerce Dashboard** - `/dashboard/e-commerce/dashboard`
**File:** [app/dashboard/e-commerce/dashboard/page.tsx](apps/web/app/dashboard/e-commerce/dashboard/page.tsx)

**Purpose:** E-commerce overview

**Widgets:**
- Total leads
- Hot leads (score)
- Conversion rate
- Revenue attributed
- Recent leads
- Lead sources chart
- Campaign performance

#### 21. **Leads** - `/dashboard/e-commerce/leads`
**File:** [app/dashboard/e-commerce/leads/page.tsx](apps/web/app/dashboard/e-commerce/leads/page.tsx)

**Purpose:** E-commerce lead management

**Features:**
- Leads table with scoring (HOT/WARM/COLD)
- Filters: Status, Score, Source, Campaign
- Search by name/email/phone
- Bulk actions
- Lead timeline
- Validation status (phone/email)

#### 22. **Lead Details** - `/dashboard/e-commerce/leads/[id]`
**File:** [app/dashboard/e-commerce/leads/[id]/page.tsx](apps/web/app/dashboard/e-commerce/leads/[id]/page.tsx)

**Purpose:** Single lead view

**Sections:**
- Contact info
- Lead score and status
- Source and UTM parameters
- Campaign attribution
- Activity timeline (calls, emails, meetings)
- Notes
- Conversion tracking (if converted)

**Actions:**
- Update status
- Change score
- Assign to user
- Add activity
- Send email/SMS
- Mark as duplicate

#### 23. **Lead Intake Form** - `/dashboard/e-commerce/leads/intake`
**File:** [app/dashboard/e-commerce/leads/intake/page.tsx](apps/web/app/dashboard/e-commerce/leads/intake/page.tsx)

**Purpose:** Quick lead entry

**Form:**
- Name, phone, email
- Source
- Budget
- Interests
- Notes

**Features:**
- Duplicate detection
- Auto-scoring
- Auto-followup trigger

#### 24. **Campaigns** - `/dashboard/e-commerce/campaigns`
**File:** [app/dashboard/e-commerce/campaigns/page.tsx](apps/web/app/dashboard/e-commerce/campaigns/page.tsx)

**Purpose:** Multi-platform campaign management

**Features:**
- Campaigns table
- Platform connections (Meta, Google, TikTok, LinkedIn)
- Create campaign
- Performance tracking
- Budget management
- Lead attribution

#### 25. **Auto-Followup Templates** - `/dashboard/e-commerce/templates`
**File:** [app/dashboard/e-commerce/templates/page.tsx](apps/web/app/dashboard/e-commerce/templates/page.tsx)

**Purpose:** Email/SMS followup sequences

**Features:**
- Template list
- Create template
- Trigger selection (New Lead, Hot Lead, No Response, etc.)
- Channel (Email, SMS, WhatsApp)
- Variable insertion (name, property, etc.)
- Delay settings
- Active/inactive toggle

#### 26. **Platform Jobs** - `/dashboard/e-commerce/jobs`
**File:** [app/dashboard/e-commerce/jobs/page.tsx](apps/web/app/dashboard/e-commerce/jobs/page.tsx)

**Purpose:** Background job monitoring

**Features:**
- Job queue status
- Job types: Sync, Fetch Insights, Create Campaign, Token Refresh
- Status: Pending, Running, Completed, Failed
- Retry failed jobs
- View job details and logs

#### 27. **Shopify CSV Tool** - `/dashboard/e-commerce/shopify-csv`
**File:** [app/dashboard/e-commerce/shopify-csv/page.tsx](apps/web/app/dashboard/e-commerce/shopify-csv/page.tsx)

**Purpose:** Import leads from Shopify CSV export

**Features:**
- CSV upload
- Field mapping
- Preview before import
- Duplicate detection
- Validation errors
- Import progress
- Results summary

### Dashboard - Production Vertical

#### 28. **Production Dashboard (Freelancer)** - `/dashboard/production/private`
**File:** [app/dashboard/production/private/page.tsx](apps/web/app/dashboard/production/private/page.tsx)

**Purpose:** Freelancer dashboard

**Widgets:**
- Monthly earnings
- Client rating
- Hours this month
- Pending invoices
- Recent projects
- Upcoming deadlines

#### 29. **Production Dashboard (Company)** - `/dashboard/production/company`
**File:** [app/dashboard/production/company/page.tsx](apps/web/app/dashboard/production/company/page.tsx)

**Purpose:** Company dashboard

**Widgets:**
- Team overview
- Monthly revenue
- Client satisfaction
- All projects count
- Project performance metrics
- Team member cards (status, projects)

#### 30. **Production Dashboard (General)** - `/dashboard/production/dashboard`
**File:** [app/dashboard/production/dashboard/page.tsx](apps/web/app/dashboard/production/dashboard/page.tsx)

**Purpose:** Generic production dashboard

**Widgets:**
- Active projects
- Completed tasks
- Upcoming deadlines
- Budget used
- Recent projects
- Quick actions

#### 31. **Projects** - `/dashboard/production/projects`
**File:** [app/dashboard/production/projects/page.tsx](apps/web/app/dashboard/production/projects/page.tsx)

**Purpose:** Project management

**Features:**
- Projects table (Name, Type, Client, Deadline, Progress, Budget, Status)
- Filters: All, Active, Planning, On Hold, Done
- Create new project
- Project types: Conference, Show, Filming, Other
- Progress tracking
- Budget vs actual

#### 32. **Suppliers** - `/dashboard/production/suppliers`
**File:** [app/dashboard/production/suppliers/page.tsx](apps/web/app/dashboard/production/suppliers/page.tsx)

**Purpose:** Supplier database

**Features:**
- Suppliers table (Name, Category, Rating, Contact, Projects)
- Categories: Stage, Lighting, Audio, Catering, Venue, Other
- Add supplier
- Rating system (1-5 stars)
- Contact info (phone, email)
- Price notes
- Link to projects

#### 33. **Team** - `/dashboard/production/team`
**File:** [app/dashboard/production/team/page.tsx](apps/web/app/dashboard/production/team/page.tsx)

**Purpose:** Team member management (Company accounts only)

**Features:**
- Team members list
- Invite members
- Roles and permissions
- Assigned projects
- Workload view

### Dashboard - Creative Productions

#### 34. **Creative Projects** - `/dashboard/productions/projects`
**File:** [app/dashboard/productions/projects/page.tsx](apps/web/app/dashboard/productions/projects/page.tsx)

**Purpose:** Video/ad production projects

**Features:**
- Projects list
- Workflow: Script → Design → Edit → Review → Deliver
- Task management
- Team assignments
- Deadline tracking

#### 35. **Creative Project Details** - `/dashboard/productions/projects/[id]`
**File:** [app/dashboard/productions/projects/[id]/page.tsx](apps/web/app/dashboard/productions/projects/[id]/page.tsx)

**Purpose:** Single creative project

**Sections:**
- Project overview
- Task board (Kanban)
- Asset library
- Review/approval workflow
- Render queue
- Delivery files

#### 36. **Creative Assets** - `/dashboard/productions/assets`
**File:** [app/dashboard/productions/assets/page.tsx](apps/web/app/dashboard/productions/assets/page.tsx)

**Purpose:** Media asset library

**Features:**
- Asset grid/list view
- Upload videos, images, audio
- Tagging system
- Search/filter
- Version history
- Preview modal
- Download/share

#### 37. **Creative Templates** - `/dashboard/productions/templates`
**File:** [app/dashboard/productions/templates/page.tsx](apps/web/app/dashboard/productions/templates/page.tsx)

**Purpose:** Reusable creative templates

**Templates:**
- Briefs
- Scripts
- Shot lists
- Ad copy

**Features:**
- Template library
- Create from template
- Customize fields
- Multi-language support (EN/HE)

#### 38. **Creative Reviews** - `/dashboard/productions/reviews`
**File:** [app/dashboard/productions/reviews/page.tsx](apps/web/app/dashboard/productions/reviews/page.tsx)

**Purpose:** Approval workflow

**Features:**
- Pending reviews
- Approve/request changes
- Comment threads
- Version comparison
- Final approval sign-off

### Dashboard - Law Vertical (Placeholder)

#### 39. **Law Dashboard** - `/dashboard/law/dashboard`
**File:** [app/dashboard/law/dashboard/page.tsx](apps/web/app/dashboard/law/dashboard/page.tsx)

**Purpose:** Legal practice management (future)

**Planned Features:**
- Cases
- Clients
- Documents
- Billable hours
- Court dates

### Organization Management

#### 40. **Organization Admin** - `/org/admin`
**File:** [app/org/admin/page.tsx](apps/web/app/org/admin/page.tsx)

**Purpose:** Organization settings (OWNER/ADMIN only)

**Sections:**
- Organization profile (name, slug)
- Members management (invite, remove, change roles)
- Billing and subscription
- Domain allowlist (for auto-join)
- Danger zone (delete org)

### Other Pages

#### 41. **External Campaigns** - `/external-campaigns`
**Purpose:** (Legacy or specific feature, needs verification)

#### 42. **Platform Dashboard** - `/platform-dashboard`
**Purpose:** (Legacy or specific feature, needs verification)

#### 43. **Connections** - `/connections`
**Purpose:** OAuth connections management (may be integrated into /dashboard/*/integrations)

#### 44. **Test Page** - `/test`
**Purpose:** Development testing

---

## 📈 10. Current Status & Next Steps

### ✅ Completed Features

**Core Infrastructure:**
- ✅ Monorepo setup (Turborepo + pnpm)
- ✅ Next.js 15.5 + React 19 frontend
- ✅ NestJS backend API
- ✅ PostgreSQL database (Neon.tech)
- ✅ Prisma ORM with comprehensive schema
- ✅ Firebase Authentication (client + admin)
- ✅ Multi-tenant architecture (Organizations)
- ✅ Role-based access control (RBAC)
- ✅ Internationalization (English + Hebrew with RTL)

**Design System:**
- ✅ Tailwind CSS configuration
- ✅ Complete color palette
- ✅ Typography system
- ✅ Spacing (8pt grid)
- ✅ 24+ UI components
- ✅ Animation system
- ✅ Responsive breakpoints
- ✅ Accessibility foundation

**Real Estate Vertical:**
- ✅ Property CRUD (create, read, update, delete)
- ✅ Property import (YAD2, Madlan scraping)
- ✅ Photo uploads to S3
- ✅ AI property scoring (OpenAI)
- ✅ Lead management
- ✅ AI property search
- ✅ Landing page generation (basic)
- ✅ Property analytics

**E-Commerce Vertical:**
- ✅ Lead management with scoring
- ✅ CSV/Shopify lead import
- ✅ Campaign tracking (basic)
- ✅ Auto-followup templates
- ✅ Lead timeline/events
- ✅ Validation (phone/email)
- ✅ Duplicate detection

**Production Vertical:**
- ✅ Project management
- ✅ Task management with dependencies
- ✅ Supplier database
- ✅ Budget tracking (planned vs actual)
- ✅ File uploads
- ✅ Freelancer vs Company dashboards

**Creative Productions:**
- ✅ Database schema
- ✅ Basic UI pages
- ⚠️ Workflow implementation (partial)

**Integrations:**
- ✅ Firebase Auth (complete)
- ✅ OpenAI API (complete)
- ✅ AWS S3 (complete)
- ✅ YAD2/Madlan scraping (complete)
- ✅ Meta OAuth flow (complete)
- ⚠️ Meta campaign creation (partial)
- ⚠️ Google Ads (OAuth only)
- ❌ TikTok Ads (planned)
- ❌ LinkedIn Ads (planned)

**Billing:**
- ✅ Stripe integration (basic)
- ✅ Subscription model
- ⚠️ Billing portal (partial)
- ❌ Usage tracking (not implemented)

### 🟡 In Progress / Partial

**API Deployment:**
- ⚠️ NestJS backend runs locally only
- ⚠️ Production deployment pending (Railway/Render)
- ⚠️ Redis not configured for production

**Campaign Management:**
- ⚠️ Meta campaign creation UI incomplete
- ⚠️ Google Ads integration incomplete
- ⚠️ Campaign insights sync (basic implementation)
- ⚠️ Multi-platform insights aggregation

**Automations:**
- ⚠️ Automation engine exists
- ⚠️ Limited triggers and actions
- ⚠️ No visual workflow builder

**Email/SMS:**
- ❌ No email service integrated (SendGrid/AWS SES)
- ❌ No SMS service (Twilio)
- ❌ Auto-followups not executing

**Law Vertical:**
- ⚠️ Database schema ready
- ❌ No UI implementation
- ❌ No backend logic

**Testing:**
- ⚠️ Some unit tests exist
- ❌ No E2E tests
- ❌ No integration tests

**Code Quality:**
- ⚠️ TypeScript strict mode disabled for builds
- ⚠️ ESLint disabled during builds
- ⚠️ Some type errors exist
- ✅ Prettier configured

### 🔴 Known Bugs & Issues

**Build/Deployment:**
1. **TypeScript Errors**
   - `ignoreBuildErrors: true` in next.config.js
   - Need to fix ~50+ type errors
   - Strict mode should be enabled

2. **ESLint Warnings**
   - `ignoreDuringBuilds: true` in next.config.js
   - Unused variables, missing dependencies
   - a11y warnings

**Functionality:**
3. **API Backend Not Deployed**
   - Backend runs on localhost:4000 only
   - Frontend deployed but API calls fail in production
   - Need production API hosting

4. **Email Verification Flow**
   - Email verification required but not enforced
   - Users can access dashboard without verifying

5. **Redis/Bull Jobs**
   - No production Redis instance
   - Background jobs only work locally
   - Campaign sync, imports, AI processing affected

6. **Meta Campaign Creation**
   - OAuth connection works
   - Campaign creation UI exists but incomplete
   - API calls to Meta Ads API need debugging

7. **Landing Page Generation**
   - Basic implementation exists
   - URLs not properly generated
   - SEO optimization incomplete

**UX/UI:**
8. **Mobile Responsiveness**
   - Some tables not mobile-friendly
   - Sidebar doesn't collapse on mobile
   - Forms too wide on small screens

9. **Loading States**
   - Inconsistent loading indicators
   - Some pages lack skeletons
   - Slow initial page loads

10. **Error Handling**
    - Generic error messages
    - No retry mechanisms
    - Network errors not gracefully handled

### 🎯 Next Steps (Priority Order)

**Critical (Deployment Blockers):**

1. **Fix TypeScript Errors**
   - Enable strict mode
   - Fix type errors in components
   - Add proper typing for API responses

2. **Deploy NestJS API**
   - Choose platform (Railway, Render, or AWS)
   - Set up environment variables
   - Configure CORS for production
   - Set up monitoring

3. **Set Up Production Redis**
   - Redis Cloud or AWS ElastiCache
   - Configure Bull queues
   - Test background jobs

4. **Implement Email Service**
   - Choose provider (SendGrid/AWS SES)
   - Set up transactional emails
   - Email templates (welcome, verification, notifications)

**High Priority (Core Features):**

5. **Complete Meta Campaign Creation**
   - Debug API integration
   - Test campaign creation flow
   - Implement budget management
   - Add creative upload

6. **Google Ads Integration**
   - Complete OAuth flow
   - Implement campaign creation
   - Fetch insights

7. **Auto-Followup Execution**
   - Implement email sending
   - Implement SMS sending (Twilio)
   - Schedule followups via Bull
   - Track delivery status

8. **Landing Page Generator**
   - Generate unique URLs
   - Template system
   - SEO optimization
   - QR code generation
   - Analytics tracking

9. **Mobile Responsiveness**
   - Audit all pages
   - Fix table overflows
   - Responsive sidebar
   - Touch-friendly controls

**Medium Priority (Enhancements):**

10. **Testing Suite**
    - Unit tests for utilities
    - Integration tests for API
    - E2E tests for critical flows (Playwright)
    - CI/CD integration

11. **Performance Optimization**
    - Code splitting improvements
    - Image optimization audit
    - Database query optimization
    - Caching strategy

12. **Monitoring & Logging**
    - Set up Sentry for error tracking
    - Vercel Analytics
    - API logging (Winston/Pino)
    - User analytics (PostHog)

13. **Automation Workflow Builder**
    - Visual workflow designer
    - More triggers and actions
    - Conditional logic
    - Workflow templates

14. **Advanced Analytics**
    - Custom report builder
    - Data export (PDF/Excel)
    - Scheduled reports
    - Predictive analytics (AI)

**Low Priority (Nice to Have):**

15. **Law Vertical Implementation**
    - Case management
    - Document generation
    - Billable hours tracking
    - Court calendar

16. **White-Label Feature**
    - Custom branding
    - Custom domain
    - Custom email templates
    - Logo upload

17. **API Access**
    - REST API documentation
    - API keys for external access
    - Webhooks system
    - Rate limiting per API key

18. **TikTok & LinkedIn Ads**
    - Complete OAuth
    - Campaign creation
    - Insights sync

19. **Advanced Integrations**
    - HubSpot sync
    - Zoho CRM
    - Salesforce
    - Zapier/Make webhooks
    - Guesty (short-term rentals)

20. **AI Enhancements**
    - AI lead scoring improvements
    - AI property descriptions
    - AI email copywriting
    - Predictive lead conversion

### 💡 Recommendations

**Architecture:**
- Consider migrating to tRPC for type-safe API calls
- Implement server-side caching (Redis)
- Add WebSocket support for real-time updates
- Consider microservices for heavy processing (AI, scraping)

**Code Quality:**
- Enable TypeScript strict mode incrementally
- Add ESLint rules enforcement
- Set up pre-commit hooks (Husky + lint-staged)
- Code review guidelines

**Security:**
- Security audit (especially auth flow)
- Rate limiting on all API endpoints
- CSRF protection review
- SQL injection prevention audit (Prisma handles this)
- XSS prevention audit

**Performance:**
- Lighthouse audit on all pages (target: >90 score)
- Database index optimization
- API response time monitoring (target: <200ms p95)
- Frontend bundle size reduction (target: <200KB initial)

**UX:**
- User onboarding flow (guided tour)
- Empty states for all pages
- Better error messages
- Loading states consistency
- Keyboard shortcuts for power users

**Documentation:**
- API documentation (OpenAPI/Swagger)
- Component library documentation (Storybook)
- User documentation/help center
- Developer onboarding guide

---

## 🏁 Conclusion

**EFFINITY** is a **comprehensive multi-vertical SaaS platform** with a solid foundation:

**Strengths:**
- ✅ Well-architected monorepo structure
- ✅ Modern tech stack (Next.js 15, React 19, NestJS, Prisma)
- ✅ Comprehensive database schema (60+ models)
- ✅ Multi-tenant architecture with RBAC
- ✅ Full i18n support (EN/HE with RTL)
- ✅ Solid design system
- ✅ Three functioning verticals (Real Estate, E-Commerce, Production)
- ✅ AI integrations (OpenAI)
- ✅ External platform integrations started (Meta, Google)

**Immediate Focus Areas:**
1. Deploy backend API to production
2. Fix TypeScript/ESLint errors
3. Complete campaign management features
4. Implement email/SMS services
5. Mobile responsiveness improvements

**Strategic Priorities:**
1. Achieve feature parity across all three verticals
2. Complete all planned integrations
3. Build comprehensive testing suite
4. Optimize performance and SEO
5. Expand to new markets/verticals

**Business-Ready Features:**
- Real Estate vertical is most mature
- E-Commerce vertical is functional
- Production vertical has solid foundation
- Billing system ready for monetization
- Multi-language support enables international expansion

**Total Development Progress: ~70% Complete**

The platform has a strong foundation and clear path to production readiness. With focused effort on the critical path items (API deployment, TypeScript fixes, core feature completion), the platform can be production-ready within 2-4 weeks.

---

**Document Version:** 1.0
**Last Updated:** October 15, 2025
**Maintained By:** Development Team
**Contact:** [Add contact information]

---

*This document should be updated as the project evolves. Key changes should be noted in the commit history and communicated to all stakeholders.*
