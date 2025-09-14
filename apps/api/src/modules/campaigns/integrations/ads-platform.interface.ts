// Base interface for all advertising platforms
export interface AdsPlatform {
  // Platform identification
  readonly platformName: string;
  readonly version: string;

  // Campaign Management
  createCampaign(payload: CreateCampaignPayload): Promise<PlatformCampaignResult>;
  updateCampaign(campaignId: string, payload: UpdateCampaignPayload): Promise<PlatformCampaignResult>;
  deleteCampaign(campaignId: string): Promise<boolean>;
  getCampaign(campaignId: string): Promise<PlatformCampaignResult | null>;
  listCampaigns(filters?: CampaignFilters): Promise<PlatformCampaignResult[]>;

  // Ad Set/Ad Group Management  
  createAdSet(campaignId: string, payload: CreateAdSetPayload): Promise<PlatformAdSetResult>;
  updateAdSet(adSetId: string, payload: UpdateAdSetPayload): Promise<PlatformAdSetResult>;
  deleteAdSet(adSetId: string): Promise<boolean>;

  // Creative/Ad Management
  createCreative(adSetId: string, payload: CreateCreativePayload): Promise<PlatformCreativeResult>;
  updateCreative(creativeId: string, payload: UpdateCreativePayload): Promise<PlatformCreativeResult>;
  deleteCreative(creativeId: string): Promise<boolean>;

  // Campaign Actions
  publishCampaign(campaignId: string): Promise<boolean>;
  pauseCampaign(campaignId: string): Promise<boolean>;
  resumeCampaign(campaignId: string): Promise<boolean>;
  archiveCampaign(campaignId: string): Promise<boolean>;

  // Preview & Validation
  validateCampaign(payload: CreateCampaignPayload): Promise<ValidationResult>;
  previewCampaign(payload: CreateCampaignPayload): Promise<PreviewResult>;

  // Reporting & Analytics
  getCampaignMetrics(campaignId: string, dateRange: DateRange): Promise<CampaignMetrics>;
  
  // Account & Authentication
  validateConnection(): Promise<boolean>;
  getAccountInfo(): Promise<AccountInfo>;
}

// === Payload Types ===

export interface CreateCampaignPayload {
  name: string;
  objective: CampaignObjective;
  budget: Budget;
  schedule?: Schedule;
  targeting: Targeting;
  creative: Creative;
  platform_specific?: Record<string, any>;
}

export interface UpdateCampaignPayload extends Partial<CreateCampaignPayload> {
  status?: CampaignStatus;
}

export interface CreateAdSetPayload {
  name: string;
  budget?: Budget;
  targeting: Targeting;
  schedule?: Schedule;
  platform_specific?: Record<string, any>;
}

export interface UpdateAdSetPayload extends Partial<CreateAdSetPayload> {
  status?: AdSetStatus;
}

export interface CreateCreativePayload {
  name: string;
  format: CreativeFormat;
  assets: CreativeAssets;
  copy: CreativeCopy;
  call_to_action?: CallToAction;
  platform_specific?: Record<string, any>;
}

export interface UpdateCreativePayload extends Partial<CreateCreativePayload> {
  status?: CreativeStatus;
}

// === Supporting Types ===

export type CampaignObjective = 
  | 'BRAND_AWARENESS' 
  | 'LEAD_GENERATION' 
  | 'CONVERSIONS' 
  | 'TRAFFIC' 
  | 'ENGAGEMENT' 
  | 'VIDEO_VIEWS'
  | 'REACH'
  | 'APP_INSTALLS';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
export type AdSetStatus = 'ACTIVE' | 'PAUSED' | 'DELETED';
export type CreativeStatus = 'ACTIVE' | 'PAUSED' | 'DELETED';

export interface Budget {
  type: 'DAILY' | 'LIFETIME';
  amount: number;
  currency: string; // ISO currency code
}

export interface Schedule {
  start_date: string; // ISO date string
  end_date?: string; // ISO date string, optional for ongoing campaigns
  timezone?: string; // IANA timezone
}

export interface Targeting {
  demographics: Demographics;
  geography: Geography;
  interests?: string[];
  behaviors?: string[];
  custom_audiences?: string[];
  lookalike_audiences?: string[];
  platform_specific?: Record<string, any>;
}

export interface Demographics {
  age_min: number;
  age_max: number;
  genders: ('male' | 'female' | 'all')[];
  languages?: string[]; // Language codes
}

export interface Geography {
  countries?: string[];
  regions?: string[];
  cities?: string[];
  locations?: GeoLocation[];
  radius_km?: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface Creative {
  primary_text: string;
  headline?: string;
  description?: string;
  images?: ImageAsset[];
  videos?: VideoAsset[];
  website_url?: string;
  display_url?: string;
  call_to_action?: CallToAction;
}

export interface CreativeAssets {
  images?: ImageAsset[];
  videos?: VideoAsset[];
}

export interface CreativeCopy {
  primary_text: string;
  headline?: string;
  description?: string;
}

export interface ImageAsset {
  url: string;
  width?: number;
  height?: number;
  alt_text?: string;
}

export interface VideoAsset {
  url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
}

export type CreativeFormat = 
  | 'SINGLE_IMAGE' 
  | 'SINGLE_VIDEO' 
  | 'CAROUSEL' 
  | 'SLIDESHOW' 
  | 'COLLECTION';

export interface CallToAction {
  type: 'LEARN_MORE' | 'SHOP_NOW' | 'SIGN_UP' | 'DOWNLOAD' | 'BOOK_TRAVEL' | 'CALL_NOW';
  value?: string;
}

// === Result Types ===

export interface PlatformCampaignResult {
  platform_campaign_id: string;
  name: string;
  status: CampaignStatus;
  objective: CampaignObjective;
  budget: Budget;
  created_time: string;
  updated_time: string;
  platform_specific?: Record<string, any>;
}

export interface PlatformAdSetResult {
  platform_adset_id: string;
  campaign_id: string;
  name: string;
  status: AdSetStatus;
  targeting: Targeting;
  created_time: string;
  updated_time: string;
  platform_specific?: Record<string, any>;
}

export interface PlatformCreativeResult {
  platform_creative_id: string;
  adset_id: string;
  name: string;
  status: CreativeStatus;
  format: CreativeFormat;
  created_time: string;
  updated_time: string;
  platform_specific?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface PreviewResult {
  preview_url?: string;
  preview_data: {
    headline: string;
    primary_text: string;
    description?: string;
    image_url?: string;
    call_to_action?: CallToAction;
  };
  estimated_reach?: {
    min: number;
    max: number;
  };
  estimated_cost_per_result?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpm: number; // Cost per thousand impressions
  spend: number;
  conversions?: number;
  cost_per_conversion?: number;
  frequency?: number;
  reach?: number;
  date_range: DateRange;
}

export interface DateRange {
  start_date: string; // ISO date string
  end_date: string; // ISO date string
}

export interface AccountInfo {
  account_id: string;
  account_name: string;
  currency: string;
  timezone: string;
  account_status: 'ACTIVE' | 'DISABLED' | 'UNSETTLED';
  spending_limit?: number;
  permissions: string[];
}

export interface CampaignFilters {
  status?: CampaignStatus[];
  objective?: CampaignObjective[];
  date_range?: DateRange;
  limit?: number;
  offset?: number;
}

// === Error Types ===

export class AdsPlatformError extends Error {
  constructor(
    message: string,
    public readonly platform: string,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AdsPlatformError';
  }
}

export class AuthenticationError extends AdsPlatformError {
  constructor(platform: string, message = 'Authentication failed') {
    super(message, platform, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class ValidationFailedError extends AdsPlatformError {
  constructor(platform: string, errors: ValidationError[]) {
    super('Validation failed', platform, 'VALIDATION_ERROR', errors);
    this.name = 'ValidationFailedError';
  }
}

export class RateLimitError extends AdsPlatformError {
  constructor(platform: string, retryAfterSeconds?: number) {
    super('Rate limit exceeded', platform, 'RATE_LIMIT', { retryAfterSeconds });
    this.name = 'RateLimitError';
  }
}

export class InsufficientPermissionsError extends AdsPlatformError {
  constructor(platform: string, requiredPermissions: string[]) {
    super('Insufficient permissions', platform, 'PERMISSIONS_ERROR', { requiredPermissions });
    this.name = 'InsufficientPermissionsError';
  }
}