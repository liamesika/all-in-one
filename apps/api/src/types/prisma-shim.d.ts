// apps/api/src/types/prisma-shim.d.ts
// Shim to provide all Prisma types until the local Prisma Client types resolve correctly.
// Runtime already works; this only fixes TypeScript compilation issues.

declare module '@prisma/client' {
  // Prisma namespace
  export namespace Prisma {
    // Add any Prisma-specific types here
  }

  // Main client
  export class PrismaClient {
    user: any;
    organization: any;
    membership: any;
    userProfile: any;
    emailVerification: any;
    realEstateLeadEvent: any;
    property: any;
    propertyPhoto: any;
    realEstateLead: any;
    propertyImportBatch: any;
    client: any;
    ecommerceLead: any;
    leadEvent: any;
    leadActivity: any;
    leadImportBatch: any;
    leadSourceHealth: any;
    leadAssignmentRule: any;
    oAuthConnection: any;
    campaign: any;
    autoFollowupTemplate: any;
    autoFollowupExecution: any;
    sale: any;
    searchJob: any;
    listing: any;
    savedSearch: any;
    connection: any;
    oAuthToken: any;
    adAccount: any;
    externalCampaign: any;
    insight: any;
    job: any;
    apiAuditLog: any;
    task: any;
    message: any;

    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T>;
    $executeRaw(query: any, ...args: any[]): Promise<any>;
    $queryRaw(query: any, ...args: any[]): Promise<any>;
  }

  // Enums
  export enum Vertical {
    REAL_ESTATE = 'REAL_ESTATE',
    LAW = 'LAW',
    E_COMMERCE = 'E_COMMERCE'
  }

  export enum MembershipRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER'
  }

  export enum PropertyStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED'
  }

  export enum CampaignStatus {
    DRAFT = 'DRAFT',
    READY = 'READY',
    SCHEDULED = 'SCHEDULED',
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    ARCHIVED = 'ARCHIVED',
    FAILED = 'FAILED'
  }

  export enum RealEstateLeadStatus {
    NEW = 'NEW',
    CONTACTED = 'CONTACTED',
    IN_PROGRESS = 'IN_PROGRESS',
    MEETING = 'MEETING',
    OFFER = 'OFFER',
    DEAL = 'DEAL',
    CONVERTED = 'CONVERTED',
    DISQUALIFIED = 'DISQUALIFIED'
  }

  export enum EcommerceLeadStatus {
    NEW = 'NEW',
    CONTACTED = 'CONTACTED',
    QUALIFIED = 'QUALIFIED',
    CONVERTED = 'CONVERTED',
    CLOSED = 'CLOSED'
  }

  export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }

  export enum Priority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
  }

  export enum MessageStatus {
    QUEUED = 'QUEUED',
    SENT = 'SENT',
    DELIVERED = 'DELIVERED',
    FAILED = 'FAILED',
    READ = 'READ'
  }

  export enum MessageChannel {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    WHATSAPP = 'WHATSAPP'
  }

  export enum ConnectionStatus {
    CONNECTED = 'CONNECTED',
    EXPIRED = 'EXPIRED',
    ERROR = 'ERROR',
    DISCONNECTED = 'DISCONNECTED'
  }

  export enum ConnectionProvider {
    META = 'META',
    GOOGLE_ADS = 'GOOGLE_ADS',
    TIKTOK_ADS = 'TIKTOK_ADS',
    LINKEDIN_ADS = 'LINKEDIN_ADS'
  }

  export enum JobType {
    SYNC_ACCOUNTS = 'SYNC_ACCOUNTS',
    FETCH_INSIGHTS = 'FETCH_INSIGHTS',
    CREATE_CAMPAIGN = 'CREATE_CAMPAIGN',
    PAUSE_CAMPAIGN = 'PAUSE_CAMPAIGN',
    RESUME_CAMPAIGN = 'RESUME_CAMPAIGN',
    TOKEN_REFRESH = 'TOKEN_REFRESH'
  }

  export enum JobStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    RETRYING = 'RETRYING'
  }

  // Model types (simplified for TypeScript)
  export interface Connection {
    id: string;
    ownerUid: string;
    provider: ConnectionProvider;
    status: ConnectionStatus;
    [key: string]: any;
  }

  export interface OAuthToken {
    id: string;
    connectionId: string;
    accessToken: string;
    refreshToken?: string;
    [key: string]: any;
  }

  export interface AdAccount {
    id: string;
    connectionId: string;
    ownerUid: string;
    externalId: string;
    name: string;
    [key: string]: any;
  }

  export interface ExternalCampaign {
    id: string;
    connectionId: string;
    adAccountId: string;
    ownerUid: string;
    externalId: string;
    name: string;
    [key: string]: any;
  }

  export interface Job {
    id: string;
    connectionId?: string;
    ownerUid: string;
    type: JobType;
    status: JobStatus;
    [key: string]: any;
  }

  export interface Insight {
    id: string;
    connectionId: string;
    adAccountId?: string;
    campaignId?: string;
    ownerUid: string;
    [key: string]: any;
  }

  // Type aliases for compatibility
  export type Prisma = any;
}
