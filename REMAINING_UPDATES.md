# Remaining Updates for E-Commerce, Law, and Productions Pages

## Pattern to Apply (Already Done for Real Estate)

### 1. Update Imports
```typescript
import { trackEventWithConsent } from '@/lib/analytics/consent';
import { PageHead } from '@/components/seo/PageHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { preserveUTMParams, appendUTMParams } from '@/lib/utils/utm';
```

### 2. Update useEffect
```typescript
useEffect(() => {
  preserveUTMParams();
  trackEventWithConsent('page_view', {
    page_title: '{Profession} Landing Page',
    page_path: '/industries/{profession}',
    profession: '{profession}',
  });
}, []);
```

### 3. Update handleCTAClick
```typescript
const handleCTAClick = (ctaType: 'primary' | 'secondary', location: 'hero' | 'bottom', position: number) => {
  trackEventWithConsent('cta_click', {
    cta_type: ctaType,
    cta_location: location,
    cta_position: position,
    cta_text: ctaType === 'primary' ? 'Start Free Trial' : 'Schedule Demo',
    page: '{profession}',
    profession: '{profession}',
  });
};
```

### 4. Add JSON-LD
```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '{Profession} Management Platform',
  description: '{profession description}',
  url: 'https://effinity.co.il/industries/{profession}',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://effinity.co.il' },
      { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://effinity.co.il/industries' },
      { '@type': 'ListItem', position: 3, name: '{Profession}' },
    ],
  },
  provider: {
    '@type': 'Organization',
    name: 'Effinity',
    url: 'https://effinity.co.il',
  },
};
```

### 5. Add PageHead + Breadcrumbs in JSX
```typescript
return (
  <div className="min-h-screen bg-white">
    <PageHead
      title="{Profession} Management Platform | Effinity"
      description="{description with stats}"
      canonical="https://effinity.co.il/industries/{profession}"
      ogImage="https://effinity.co.il/og-{profession}.jpg"
      keywords="{profession}, {keywords}"
      jsonLd={jsonLd}
    />
    <MarketingNav />
    <section className="pt-32 pb-20 ...">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Industries', href: '/industries' },
            { label: '{Profession}' },
          ]}
          className="mb-8"
        />
```

### 6. Update CTA Links
```typescript
// Hero CTAs
<Link href={appendUTMParams('/register')} onClick={() => handleCTAClick('primary', 'hero', 1)} ...>
<Link href={appendUTMParams('/contact')} onClick={() => handleCTAClick('secondary', 'hero', 2)} ...>

// Bottom CTAs
primaryCTA={{ href: appendUTMParams('/register'), onClick: () => handleCTAClick('primary', 'bottom', 3) }}
secondaryCTA={{ href: appendUTMParams('/contact'), onClick: () => handleCTAClick('secondary', 'bottom', 4) }}
```

## Profession-Specific Details

### E-Commerce
- Title: "E-Commerce Management Platform | Effinity"
- Description: "Complete e-commerce management with marketing automation. Save 20+ hours per week and grow revenue by 50%. Cart recovery, inventory tracking, and omnichannel selling."
- Keywords: "e-commerce platform, online store management, cart abandonment recovery, inventory management, marketing automation"
- OG Image: "og-e-commerce.jpg"
- Color: purple

### Law
- Title: "Law Practice Management Platform | Effinity"
- Description: "Complete law practice management with automation. Save 12+ hours per week and capture 40% more billable hours. Case tracking, document automation, time tracking, and billing."
- Keywords: "law practice management, legal case management, time tracking, billing software, document automation"
- OG Image: "og-law.jpg"
- Color: teal

### Productions
- Title: "Creative Productions Management Platform | Effinity"
- Description: "Project management for creative studios with automation. Save 18+ hours per week and increase margins by 30%. Budget tracking, timeline management, and asset delivery."
- Keywords: "production management, creative studio software, project management, budget tracking, timeline management"
- OG Image: "og-productions.jpg"
- Color: orange
