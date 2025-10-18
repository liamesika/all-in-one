# Next Development Priorities

## Current State: Profession Pages
**Branch:** `feature/profession-pages`
**Status:** 60% complete (Real Estate fully enhanced, 3 pages pending)
**Action:** Can be completed later or merged as-is with follow-up PR

---

## 🎯 Priority 1: Pricing & Checkout (NEW BRANCH)

### Scope
- Build `/pricing` page with clear tiers and CTAs
- Integrate PayPlus/Stripe for payments
- Support free trial and coupon codes
- Persist UTM params through `/register` → checkout
- Send attribution data server-side

### Deliverables
- [ ] `/pricing` page with 3 tiers (Starter, Professional, Enterprise)
- [ ] Payment integration (PayPlus primary, Stripe fallback)
- [ ] Free trial flow (14-day, no CC required)
- [ ] Coupon/promo code system
- [ ] UTM → checkout → backend attribution pipeline
- [ ] Vercel preview + Lighthouse screenshots
- [ ] Short Loom walkthrough

### Technical Approach
```typescript
// Pricing tiers structure
interface PricingTier {
  id: 'starter' | 'professional' | 'enterprise';
  name: string;
  price: { monthly: number; yearly: number };
  features: string[];
  cta: { text: string; href: string };
  popular?: boolean;
}

// Payment flow
/register?plan=professional&billing=yearly&utm_source=google
  → Backend: Create user + subscription intent
  → PayPlus/Stripe checkout with attribution metadata
  → Webhook: Activate subscription + log attribution
```

---

## 🎯 Priority 2: Onboarding Wizard (MVP)

### Scope
- 3-5 step wizard after signup
- Select profession → configure base settings → seed demo data → done
- Auto-create demo project tailored to chosen profession

### Steps
1. **Welcome** - "Let's get you set up"
2. **Choose Profession** - Real Estate, E-Commerce, Law, or Productions
3. **Basic Settings** - Company name, timezone, language preference
4. **Demo Data** - Offer to seed with sample data (optional)
5. **Complete** - Redirect to profession-specific dashboard

### Deliverables
- [ ] Onboarding wizard UI (modal/full-page)
- [ ] Profession selection with icons + descriptions
- [ ] Demo data seeding script per profession
- [ ] Backend API: POST /api/onboarding/complete
- [ ] Skip option (for advanced users)
- [ ] Progress indicator (step 1 of 5)

### Technical Approach
```typescript
// Onboarding state management
interface OnboardingState {
  step: number;
  profession: 'real-estate' | 'e-commerce' | 'law' | 'productions';
  companyName: string;
  seedDemoData: boolean;
  complete: boolean;
}

// Demo data seeding
POST /api/onboarding/seed-demo
{
  profession: 'real-estate',
  // Creates: 10 properties, 20 leads, 5 campaigns, 50 contacts
}
```

---

## 🎯 Priority 3: SEO & Navigation (Complete Profession Pages)

### Scope
- Finish applying SEO enhancements to E-Commerce, Law, Productions
- Verify sitemap.xml and robots.txt (already created)
- Test all canonical tags and OG meta

### Status
- ✅ Real Estate: Complete
- ⏳ E-Commerce: Needs SEO enhancements
- ⏳ Law: Needs SEO enhancements
- ⏳ Productions: Needs SEO enhancements

### Can Be Merged To
- `feature/profession-pages` branch (already created)
- Or new branch: `feature/profession-pages-seo-complete`

---

## 🎯 Priority 4: Analytics Enhancement

### Scope
- Data layer specification
- GA4 event taxonomy with profession, cta_position, step
- CMP-ready consent hooks

### Deliverables
- [ ] `dataLayer` spec document
- [ ] Enhanced event tracking with profession context
- [ ] Step tracking for onboarding wizard
- [ ] CMP integration verification (already started)
- [ ] Analytics debug mode for development

### Technical Approach
```typescript
// Enhanced analytics events
trackEvent('onboarding_step_complete', {
  step_number: 2,
  step_name: 'Choose Profession',
  profession: 'real-estate',
  user_id: userId,
  session_id: sessionId,
});

trackEvent('pricing_tier_select', {
  tier: 'professional',
  billing_cycle: 'yearly',
  discount_code: 'LAUNCH50',
  profession: 'real-estate',
});
```

---

## 🎯 Priority 5: Performance & Accessibility

### Scope
- Image optimization with next/image
- Font preloading and subsetting
- Lighthouse mobile ≥90 target
- Accessibility improvements (focus states, contrast)

### Deliverables
- [ ] All images converted to next/image with sizes
- [ ] Font subsetting for Hebrew + English
- [ ] Preload critical resources
- [ ] Lighthouse audit: Performance, A11y, Best Practices, SEO ≥90
- [ ] WCAG 2.1 AA compliance verified

---

## 🎯 Priority 6: Productions Workspace

### Scope
- Wire up Creative Projects/Assets/Render Queue APIs
- Add S3 lifecycle rules and quotas
- Expose queue metrics

### Deliverables
- [ ] Productions Workspace UI component
- [ ] Creative Projects CRUD + status tracking
- [ ] Assets library with S3 upload/download
- [ ] Render Queue with job status
- [ ] S3 lifecycle: Auto-archive after 90 days
- [ ] Storage quotas per plan tier
- [ ] Rate limits on API endpoints
- [ ] Queue metrics dashboard

### Technical Approach
```typescript
// Productions APIs
GET /api/productions/projects
POST /api/productions/projects
GET /api/productions/assets?project_id=123
POST /api/productions/render-queue

// S3 lifecycle
lifecycle_rule: {
  transition_to_glacier: 90 days,
  delete_after: 365 days
}

// Quotas by plan
starter: 10 GB storage, 100 assets
professional: 100 GB, 1000 assets
enterprise: unlimited
```

---

## 📋 PR Template Checklist (Standard for All Features)

```markdown
## Checklist

- [ ] i18n/RTL verified (if applicable)
- [ ] SEO: canonical tags, OG/Twitter meta
- [ ] Breadcrumbs (if multi-level page)
- [ ] Sitemap.xml updated
- [ ] robots.txt verified
- [ ] Analytics events implemented
- [ ] GA4 consent respected (CMP check)
- [ ] Lighthouse mobile ≥90 (Performance, A11y, Best Practices, SEO)
- [ ] Screenshots (mobile + desktop)
- [ ] Vercel preview link
- [ ] Short Loom walkthrough
- [ ] Build passes locally
- [ ] No TypeScript errors
- [ ] No console errors in browser
```

---

## 🚀 Recommended Next Action

**Start with Priority 1: Pricing & Checkout**

Reasoning:
1. Revenue-critical feature
2. Needed before full launch
3. Clear scope and deliverables
4. Can be built independently

**Branch:** `feature/pricing-checkout`

**Command to start:**
```bash
git checkout main
git pull origin main
git checkout -b feature/pricing-checkout
```

Should I proceed with Priority 1 (Pricing & Checkout)?
