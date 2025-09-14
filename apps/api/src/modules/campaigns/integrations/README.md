# Campaign Integration System

This module provides a unified abstraction layer for managing advertising campaigns across multiple platforms (Meta, Google Ads, etc.).

## Architecture

```
IntegrationService
├── PlatformFactory (manages adapter instances)
├── CampaignMapper (maps between internal/platform formats)
└── ConnectionManager (handles authentication)
    ├── MetaAdsAdapter (Facebook/Instagram)
    └── GoogleAdsAdapter (Google Ads)
```

## Usage

```typescript
import { IntegrationService } from './integration.service';

// Validate campaign for multiple platforms
const validation = await integrationService.bulkValidateCampaign(
  campaign, 
  ['meta', 'google'], 
  userId
);

// Create campaign on platform
const result = await integrationService.createCampaignOnPlatform(
  campaign,
  'meta',
  userId
);

// Get campaign metrics
const metrics = await integrationService.getCampaignMetrics(
  platformCampaignId,
  'meta',
  { start_date: '2024-01-01', end_date: '2024-01-31' },
  userId
);
```

## Environment Variables

### Meta (Facebook/Instagram)
```env
META_ACCESS_TOKEN=your_long_lived_access_token
META_AD_ACCOUNT_ID=your_ad_account_id
META_API_VERSION=v18.0
META_INSTAGRAM_ACCOUNT_ID=your_instagram_account_id
```

### Google Ads
```env
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CLIENT_ID=your_oauth_client_id
GOOGLE_ADS_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_ADS_REFRESH_TOKEN=user_refresh_token
GOOGLE_ADS_CUSTOMER_ID=your_customer_id
```

## Platform Status

- **Meta Ads**: Interface complete, API implementation pending
- **Google Ads**: Interface complete, API implementation pending
- **OAuth flows**: Planned for Step 5

## Next Steps

1. Implement actual API clients for each platform
2. Add OAuth2 authentication flows
3. Implement campaign preview generation
4. Add comprehensive error handling and retries
5. Add rate limiting and request optimization