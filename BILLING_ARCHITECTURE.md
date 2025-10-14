# EFFINITY Billing System Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EFFINITY BILLING SYSTEM                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│                  │         │                  │         │              │
│   User Browser   │◄───────►│   Next.js App    │◄───────►│  PostgreSQL  │
│                  │         │                  │         │   Database   │
└──────────────────┘         └──────────────────┘         └──────────────┘
         │                            │                            │
         │                            │                            │
         ▼                            ▼                            ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│  Stripe.js       │         │  API Routes      │         │  Subscription│
│  (Client SDK)    │         │  /api/billing/*  │         │  Invoice     │
│                  │         │                  │         │  UsageRecord │
└──────────────────┘         └──────────────────┘         └──────────────┘
         │                            │
         │                            │
         └────────────────┬───────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │                  │
                 │   Stripe API     │
                 │                  │
                 └──────────────────┘
                          │
                          │ Webhooks
                          ▼
                 ┌──────────────────┐
                 │  /api/billing/   │
                 │    webhooks      │
                 └──────────────────┘
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐  ┌───────────────┐│
│  │ Billing Dashboard  │  │  Pricing Cards     │  │  Usage Stats  ││
│  │                    │  │                    │  │               ││
│  │ /dashboard/billing │  │  Plan Selection    │  │  Progress Bar ││
│  └────────────────────┘  └────────────────────┘  └───────────────┘│
│                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐  ┌───────────────┐│
│  │  Invoices List     │  │  Upgrade Prompt    │  │  Stripe.js    ││
│  │                    │  │                    │  │               ││
│  │  Billing History   │  │  Limit Modals      │  │  Checkout     ││
│  └────────────────────┘  └────────────────────┘  └───────────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ API Calls
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           API LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │              Billing API Routes (/api/billing/*)                ││
│  ├────────────────────────────────────────────────────────────────┤│
│  │                                                                  ││
│  │  GET/POST /subscription  │  Fetch/Create subscription           ││
│  │  POST     /portal        │  Access billing portal               ││
│  │  POST     /upgrade       │  Change subscription plan            ││
│  │  GET      /usage         │  Get usage statistics                ││
│  │  POST     /webhooks      │  Handle Stripe events                ││
│  │                                                                  ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │              Business Logic & Guards                            ││
│  ├────────────────────────────────────────────────────────────────┤│
│  │                                                                  ││
│  │  guardResourceCreation() │  Enforce limits before creation      ││
│  │  requireActiveSubscription() │  Verify subscription status      ││
│  │  trackLeadCreation()     │  Record usage events                 ││
│  │  enforceLimit()          │  Throw error if limit exceeded       ││
│  │                                                                  ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Database Queries
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ Subscription │  │   Invoice    │  │     UsageRecord          │ │
│  ├──────────────┤  ├──────────────┤  ├──────────────────────────┤ │
│  │ id           │  │ id           │  │ id                       │ │
│  │ orgId        │  │ subscription │  │ subscriptionId           │ │
│  │ plan         │  │ amount       │  │ resourceType             │ │
│  │ status       │  │ status       │  │ action                   │ │
│  │ limits       │  │ pdfUrl       │  │ quantity                 │ │
│  │ counts       │  │ periodDates  │  │ createdAt                │ │
│  │ stripe*      │  │ paidAt       │  │                          │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                      Organization                               ││
│  │  ├─ subscription (1:1 relation)                                 ││
│  │  ├─ memberships                                                 ││
│  │  ├─ properties                                                  ││
│  │  └─ leads                                                       ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Stripe Sync
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        STRIPE INTEGRATION                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │   Checkout       │  │  Billing Portal  │  │   Webhooks       │ │
│  │                  │  │                  │  │                  │ │
│  │ - Create session │  │ - Manage payment │  │ - Invoice paid   │ │
│  │ - Trial period   │  │ - View invoices  │  │ - Payment failed │ │
│  │ - Price selection│  │ - Cancel sub     │  │ - Sub updated    │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Subscription Creation Flow

```
User                Browser              Next.js API           Database         Stripe
 │                    │                      │                    │               │
 │  Click Plan        │                      │                    │               │
 ├───────────────────►│                      │                    │               │
 │                    │  POST /subscription  │                    │               │
 │                    ├─────────────────────►│                    │               │
 │                    │                      │  Check Org Exists  │               │
 │                    │                      ├───────────────────►│               │
 │                    │                      │◄───────────────────┤               │
 │                    │                      │  Create Checkout   │               │
 │                    │                      ├───────────────────────────────────►│
 │                    │                      │                    │ Session ID    │
 │                    │                      │◄───────────────────────────────────┤
 │                    │  Redirect to Stripe  │                    │               │
 │                    │◄─────────────────────┤                    │               │
 │                    │                      │                    │               │
 │  Stripe Checkout   │                      │                    │               │
 ├────────────────────┼──────────────────────┼────────────────────┼──────────────►│
 │                    │                      │                    │               │
 │◄───────────────────┼──────────────────────┼────────────────────┼───────────────┤
 │  Payment Complete  │                      │                    │               │
 │                    │                      │                    │               │
 │                    │                      │  Webhook Event     │               │
 │                    │                      │◄───────────────────────────────────┤
 │                    │                      │                    │               │
 │                    │                      │  Create/Update Sub │               │
 │                    │                      ├───────────────────►│               │
 │                    │                      │                    │               │
 │  Return to App     │                      │                    │               │
 │◄───────────────────┤                      │                    │               │
 │                    │                      │                    │               │
```

### 2. Limit Enforcement Flow

```
User                Browser              API Route             Usage Tracker    Database
 │                    │                      │                      │             │
 │  Create Lead       │                      │                      │             │
 ├───────────────────►│                      │                      │             │
 │                    │  POST /leads         │                      │             │
 │                    ├─────────────────────►│                      │             │
 │                    │                      │  Check Subscription  │             │
 │                    │                      ├─────────────────────►│             │
 │                    │                      │                      │  Get Sub    │
 │                    │                      │                      ├────────────►│
 │                    │                      │                      │◄────────────┤
 │                    │                      │  Check Limit         │             │
 │                    │                      │◄─────────────────────┤             │
 │                    │                      │                      │             │
 │                    │         ┌────────────┴──────────────┐       │             │
 │                    │         │  Within Limit?            │       │             │
 │                    │         └────────────┬──────────────┘       │             │
 │                    │                      │                      │             │
 │                    │                      │  YES                 │             │
 │                    │                      │  Create Lead         │             │
 │                    │                      ├──────────────────────────────────►│
 │                    │                      │                      │             │
 │                    │                      │  Track Usage         │             │
 │                    │                      ├─────────────────────►│             │
 │                    │                      │                      │  Update     │
 │                    │                      │                      │  Counter    │
 │                    │                      │                      ├────────────►│
 │                    │                      │                      │             │
 │                    │  201 Created         │                      │             │
 │                    │◄─────────────────────┤                      │             │
 │                    │                      │                      │             │
 │  Success           │                      │                      │             │
 │◄───────────────────┤                      │                      │             │
 │                    │                      │                      │             │
 │                    │                      │  NO (Limit Reached)  │             │
 │                    │                      │                      │             │
 │                    │  403 Forbidden       │                      │             │
 │                    │  + Upgrade Prompt    │                      │             │
 │                    │◄─────────────────────┤                      │             │
 │                    │                      │                      │             │
 │  Show Upgrade Modal│                      │                      │             │
 │◄───────────────────┤                      │                      │             │
 │                    │                      │                      │             │
```

### 3. Webhook Processing Flow

```
Stripe              Next.js API          Database            Email Service
 │                      │                    │                    │
 │  Event Occurs        │                    │                    │
 │  (invoice.paid)      │                    │                    │
 │                      │                    │                    │
 │  POST /webhooks      │                    │                    │
 ├─────────────────────►│                    │                    │
 │                      │                    │                    │
 │                      │  Verify Signature  │                    │
 │                      │  ✓ Valid           │                    │
 │                      │                    │                    │
 │                      │  Parse Event       │                    │
 │                      │  Type: invoice.paid│                    │
 │                      │                    │                    │
 │                      │  Find Subscription │                    │
 │                      ├───────────────────►│                    │
 │                      │◄───────────────────┤                    │
 │                      │                    │                    │
 │                      │  Create Invoice    │                    │
 │                      ├───────────────────►│                    │
 │                      │                    │                    │
 │                      │  Update Sub Status │                    │
 │                      ├───────────────────►│                    │
 │                      │                    │                    │
 │                      │  Send Confirmation │                    │
 │                      ├────────────────────────────────────────►│
 │                      │                    │                    │
 │  200 OK              │                    │                    │
 │◄─────────────────────┤                    │                    │
 │                      │                    │                    │
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                              │
└─────────────────────────────────────────────────────────────────────┘

Layer 1: Transport Security
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ┌────────────────┐
  │  HTTPS/TLS     │  All communication encrypted
  └────────────────┘

Layer 2: Authentication
━━━━━━━━━━━━━━━━━━━━━━━━
  ┌────────────────┐
  │  Firebase Auth │  User authentication
  │  + Session     │  Session management
  └────────────────┘

Layer 3: Authorization
━━━━━━━━━━━━━━━━━━━━━━━━
  ┌────────────────┐
  │  Organization  │  orgId verification
  │  Scoping       │  User role checks
  └────────────────┘

Layer 4: API Security
━━━━━━━━━━━━━━━━━━━━━━
  ┌────────────────┐
  │  Stripe        │  Webhook signature verification
  │  Signature     │  Request validation
  └────────────────┘

Layer 5: Data Security
━━━━━━━━━━━━━━━━━━━━━━
  ┌────────────────┐
  │  Environment   │  Encrypted keys
  │  Variables     │  No secrets in code
  └────────────────┘

Layer 6: Business Logic
━━━━━━━━━━━━━━━━━━━━━━━━
  ┌────────────────┐
  │  Server-Side   │  All checks on server
  │  Enforcement   │  Never trust client
  └────────────────┘
```

---

## Scaling Considerations

```
Current Architecture          Future Scaling Options
━━━━━━━━━━━━━━━━━━━━━━       ━━━━━━━━━━━━━━━━━━━━━

Next.js Server                Load Balancer
     │                             │
     ├─ API Routes          ┌──────┴──────┐
     └─ Database           Server  Server  Server
                                    │
                           ┌────────┴────────┐
                           │                 │
                    Primary DB         Read Replicas
                           │                 │
                     Redis Cache       Redis Cache

Webhook Handler            Background Jobs
     │                          │
     └─ Direct DB         ┌─────┴──────┐
                          │  Job Queue  │
                          │  (Bull)     │
                          └─────┬──────┘
                                │
                          Worker Processes
```

---

## Monitoring Points

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MONITORING ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Application Metrics                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  • API Response Times         • Error Rates                  │  │
│  │  • Webhook Processing Times   • Success/Failure Counts       │  │
│  │  • Database Query Performance • Active Connections           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Business Metrics                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  • New Subscriptions          • MRR/ARR                       │  │
│  │  • Trial Conversions          • Churn Rate                    │  │
│  │  • Upgrade Frequency          • Average Usage                 │  │
│  │  • Failed Payments            • Limit Reached Events          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Infrastructure Metrics                                              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  • CPU Usage                  • Memory Usage                  │  │
│  │  • Network I/O                • Disk I/O                      │  │
│  │  • Database Connections       • Cache Hit Rates               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  External Service Metrics                                            │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  • Stripe API Latency         • Stripe Error Rates            │  │
│  │  • Webhook Delivery Success   • Webhook Retry Counts          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
Error Occurs
     │
     ▼
┌─────────────────┐
│ Error Type?     │
└─────┬───────────┘
      │
      ├─► Validation Error (400)
      │   └─► Return clear message to user
      │
      ├─► Auth Error (401)
      │   └─► Redirect to login
      │
      ├─► Limit Error (403)
      │   └─► Show upgrade prompt
      │
      ├─► Not Found (404)
      │   └─► Return resource not found
      │
      ├─► Payment Required (402)
      │   └─► Show subscription required message
      │
      └─► Server Error (500)
          ├─► Log to error tracking (Sentry)
          ├─► Send alert to team
          └─► Return generic error to user
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PRODUCTION DEPLOYMENT                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  DNS (Cloudflare)                                                    │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────┐                                                   │
│  │   Vercel     │  Next.js Application                              │
│  │   Edge       │  - API Routes                                     │
│  │   Network    │  - React Pages                                    │
│  └──────┬───────┘  - Static Assets                                  │
│         │                                                            │
│         ├─────────────────┬──────────────────┐                      │
│         │                 │                  │                      │
│         ▼                 ▼                  ▼                      │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐               │
│  │ PostgreSQL │    │   Stripe   │    │  Firebase  │               │
│  │  (Neon)    │    │    API     │    │    Auth    │               │
│  └────────────┘    └────────────┘    └────────────┘               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

This architecture ensures:
- ✅ High availability
- ✅ Scalability
- ✅ Security
- ✅ Monitoring
- ✅ Easy deployment
