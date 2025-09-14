--
-- PostgreSQL database dump
--

\restrict fRMs56ccEk6TEUF7D8EccRKygPw6bGkhgIcP3uovkKDbmK3iSbnlJNILJpEFaLH

-- Dumped from database version 16.10 (Homebrew)
-- Dumped by pg_dump version 16.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: allinone_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO allinone_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: allinone_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AutoFollowupChannel; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."AutoFollowupChannel" AS ENUM (
    'EMAIL',
    'WHATSAPP',
    'SMS'
);


ALTER TYPE public."AutoFollowupChannel" OWNER TO allinone_user;

--
-- Name: AutoFollowupTrigger; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."AutoFollowupTrigger" AS ENUM (
    'NEW_LEAD',
    'HOT_LEAD',
    'FIRST_CONTACT',
    'QUALIFIED',
    'NO_RESPONSE_24H',
    'NO_RESPONSE_7D'
);


ALTER TYPE public."AutoFollowupTrigger" OWNER TO allinone_user;

--
-- Name: CampaignGoal; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."CampaignGoal" AS ENUM (
    'TRAFFIC',
    'CONVERSIONS',
    'LEADS',
    'BRAND_AWARENESS',
    'REACH',
    'ENGAGEMENT'
);


ALTER TYPE public."CampaignGoal" OWNER TO allinone_user;

--
-- Name: CampaignPlatform; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."CampaignPlatform" AS ENUM (
    'META',
    'GOOGLE',
    'TIKTOK',
    'LINKEDIN'
);


ALTER TYPE public."CampaignPlatform" OWNER TO allinone_user;

--
-- Name: CampaignStatus; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."CampaignStatus" AS ENUM (
    'DRAFT',
    'READY',
    'SCHEDULED',
    'ACTIVE',
    'PAUSED',
    'ARCHIVED',
    'FAILED'
);


ALTER TYPE public."CampaignStatus" OWNER TO allinone_user;

--
-- Name: ConnectionStatus; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."ConnectionStatus" AS ENUM (
    'CONNECTED',
    'EXPIRED',
    'ERROR',
    'DISCONNECTED'
);


ALTER TYPE public."ConnectionStatus" OWNER TO allinone_user;

--
-- Name: FieldValidationStatus; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."FieldValidationStatus" AS ENUM (
    'VALID',
    'INVALID',
    'PENDING'
);


ALTER TYPE public."FieldValidationStatus" OWNER TO allinone_user;

--
-- Name: LeadScore; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."LeadScore" AS ENUM (
    'HOT',
    'WARM',
    'COLD'
);


ALTER TYPE public."LeadScore" OWNER TO allinone_user;

--
-- Name: LeadSource; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."LeadSource" AS ENUM (
    'FACEBOOK',
    'INSTAGRAM',
    'WHATSAPP',
    'CSV_UPLOAD',
    'GOOGLE_SHEETS',
    'MANUAL',
    'OTHER'
);


ALTER TYPE public."LeadSource" OWNER TO allinone_user;

--
-- Name: LeadStage; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."LeadStage" AS ENUM (
    'NEW',
    'CONTACTED',
    'MEETING',
    'OFFER',
    'DEAL',
    'QUALIFIED',
    'WON',
    'LOST'
);


ALTER TYPE public."LeadStage" OWNER TO allinone_user;

--
-- Name: ListingType; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."ListingType" AS ENUM (
    'FOR_SALE',
    'FOR_RENT',
    'COMMERCIAL',
    'LAND',
    'NEW_PROJECT',
    'OTHER'
);


ALTER TYPE public."ListingType" OWNER TO allinone_user;

--
-- Name: MembershipRole; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."MembershipRole" AS ENUM (
    'OWNER',
    'ADMIN',
    'MEMBER'
);


ALTER TYPE public."MembershipRole" OWNER TO allinone_user;

--
-- Name: PropertyProvider; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."PropertyProvider" AS ENUM (
    'MANUAL',
    'YAD2',
    'MADLAN',
    'AIRBNB',
    'BOOKING',
    'GUESTY',
    'ZILLOW',
    'OTHER'
);


ALTER TYPE public."PropertyProvider" OWNER TO allinone_user;

--
-- Name: PropertyStatus; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."PropertyStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."PropertyStatus" OWNER TO allinone_user;

--
-- Name: PropertyType; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."PropertyType" AS ENUM (
    'APARTMENT',
    'HOUSE',
    'DUPLEX',
    'PENTHOUSE',
    'COTTAGE',
    'LOT',
    'OFFICE',
    'STORE',
    'OTHER',
    'VILLA',
    'COMMERCIAL'
);


ALTER TYPE public."PropertyType" OWNER TO allinone_user;

--
-- Name: RealEstateLeadStatus; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."RealEstateLeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'MEETING',
    'OFFER',
    'DEAL',
    'IN_PROGRESS',
    'CONVERTED',
    'DISQUALIFIED'
);


ALTER TYPE public."RealEstateLeadStatus" OWNER TO allinone_user;

--
-- Name: SearchJobStatus; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."SearchJobStatus" AS ENUM (
    'QUEUED',
    'RUNNING',
    'ENRICHING',
    'DONE',
    'FAILED'
);


ALTER TYPE public."SearchJobStatus" OWNER TO allinone_user;

--
-- Name: SearchProvider; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."SearchProvider" AS ENUM (
    'SERPAPI',
    'BING_SEARCH',
    'YAD2',
    'MADLAN',
    'FACEBOOK_MARKETPLACE'
);


ALTER TYPE public."SearchProvider" OWNER TO allinone_user;

--
-- Name: SyncStatus; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."SyncStatus" AS ENUM (
    'IDLE',
    'PENDING',
    'SUCCESS',
    'ERROR',
    'SYNCING'
);


ALTER TYPE public."SyncStatus" OWNER TO allinone_user;

--
-- Name: Vertical; Type: TYPE; Schema: public; Owner: allinone_user
--

CREATE TYPE public."Vertical" AS ENUM (
    'REAL_ESTATE',
    'LAW',
    'E_COMMERCE'
);


ALTER TYPE public."Vertical" OWNER TO allinone_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AutoFollowupExecution; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."AutoFollowupExecution" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    "templateId" text NOT NULL,
    channel public."AutoFollowupChannel" NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    subject text,
    content text NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "readAt" timestamp(3) without time zone,
    "clickedAt" timestamp(3) without time zone,
    error text,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "maxRetries" integer DEFAULT 3 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AutoFollowupExecution" OWNER TO allinone_user;

--
-- Name: AutoFollowupTemplate; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."AutoFollowupTemplate" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    name text NOT NULL,
    trigger public."AutoFollowupTrigger" NOT NULL,
    channel public."AutoFollowupChannel" NOT NULL,
    subject text,
    content text NOT NULL,
    variables jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "delayMinutes" integer DEFAULT 0 NOT NULL,
    "brandName" text,
    "brandLogo" text,
    "brandColors" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AutoFollowupTemplate" OWNER TO allinone_user;

--
-- Name: Campaign; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."Campaign" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    audience jsonb,
    status public."CampaignStatus" DEFAULT 'DRAFT'::public."CampaignStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    budget double precision,
    clicks integer DEFAULT 0 NOT NULL,
    "connectionId" text NOT NULL,
    conversions integer DEFAULT 0 NOT NULL,
    creative jsonb,
    "dailyBudget" double precision,
    "endDate" timestamp(3) without time zone,
    impressions integer DEFAULT 0 NOT NULL,
    "lastCheckAt" timestamp(3) without time zone,
    name text NOT NULL,
    "platformAdSetId" text,
    "platformCampaignId" text,
    "preflightChecks" jsonb,
    spend double precision DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone,
    goal public."CampaignGoal" NOT NULL,
    platform public."CampaignPlatform" NOT NULL
);


ALTER TABLE public."Campaign" OWNER TO allinone_user;

--
-- Name: Client; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."Client" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    "fullName" text NOT NULL,
    phone text,
    email text,
    "budgetMin" numeric(12,2),
    "budgetMax" numeric(12,2),
    "preferredCity" text,
    stage public."LeadStage" DEFAULT 'NEW'::public."LeadStage" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Client" OWNER TO allinone_user;

--
-- Name: EcommerceLead; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."EcommerceLead" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    "externalId" text,
    "fullName" text,
    "firstName" text,
    "lastName" text,
    phone text,
    email text,
    city text,
    address text,
    status public."LeadStage" DEFAULT 'NEW'::public."LeadStage" NOT NULL,
    score public."LeadScore" DEFAULT 'COLD'::public."LeadScore" NOT NULL,
    source public."LeadSource" DEFAULT 'MANUAL'::public."LeadSource" NOT NULL,
    "sourceName" text,
    "assigneeId" text,
    budget numeric(12,2),
    interests jsonb,
    notes text,
    "utmSource" text,
    "utmMedium" text,
    "utmCampaign" text,
    "utmTerm" text,
    "utmContent" text,
    "phoneValid" public."FieldValidationStatus" DEFAULT 'PENDING'::public."FieldValidationStatus" NOT NULL,
    "emailValid" public."FieldValidationStatus" DEFAULT 'PENDING'::public."FieldValidationStatus" NOT NULL,
    "firstContactAt" timestamp(3) without time zone,
    "lastContactAt" timestamp(3) without time zone,
    "duplicateOfId" text,
    "isDuplicate" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "campaignId" text,
    "platformAdSetId" text
);


ALTER TABLE public."EcommerceLead" OWNER TO allinone_user;

--
-- Name: EmailVerification; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."EmailVerification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EmailVerification" OWNER TO allinone_user;

--
-- Name: LeadActivity; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."LeadActivity" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    type text NOT NULL,
    subject text,
    content text,
    direction text,
    "userId" text,
    "scheduledAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LeadActivity" OWNER TO allinone_user;

--
-- Name: LeadAssignmentRule; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."LeadAssignmentRule" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    conditions jsonb NOT NULL,
    "assigneeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LeadAssignmentRule" OWNER TO allinone_user;

--
-- Name: LeadEvent; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."LeadEvent" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    type text NOT NULL,
    data jsonb,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LeadEvent" OWNER TO allinone_user;

--
-- Name: LeadImportBatch; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."LeadImportBatch" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    source text NOT NULL,
    filename text,
    "totalRows" integer DEFAULT 0 NOT NULL,
    "validRows" integer DEFAULT 0 NOT NULL,
    "invalidRows" integer DEFAULT 0 NOT NULL,
    "duplicateRows" integer DEFAULT 0 NOT NULL,
    "importedRows" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    errors jsonb,
    summary jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public."LeadImportBatch" OWNER TO allinone_user;

--
-- Name: LeadSourceHealth; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."LeadSourceHealth" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    source public."LeadSource" NOT NULL,
    "lastEventAt" timestamp(3) without time zone,
    "lastErrorAt" timestamp(3) without time zone,
    "lastError" text,
    "isHealthy" boolean DEFAULT true NOT NULL,
    "totalLeads" integer DEFAULT 0 NOT NULL,
    "todayLeads" integer DEFAULT 0 NOT NULL,
    "weekLeads" integer DEFAULT 0 NOT NULL,
    "monthLeads" integer DEFAULT 0 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LeadSourceHealth" OWNER TO allinone_user;

--
-- Name: Listing; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."Listing" (
    id text NOT NULL,
    "searchJobId" text NOT NULL,
    "ownerUid" text NOT NULL,
    title text NOT NULL,
    description text,
    location text,
    city text,
    neighborhood text,
    rooms integer,
    size integer,
    price integer,
    "pricePerSqm" integer,
    currency text DEFAULT 'ILS'::text NOT NULL,
    "listingType" public."ListingType" DEFAULT 'FOR_SALE'::public."ListingType" NOT NULL,
    provider public."SearchProvider" NOT NULL,
    "sourceUrl" text NOT NULL,
    "sourceId" text,
    "aiScore" double precision,
    "aiSummary" text,
    "aiTags" jsonb,
    "agentName" text,
    "agentPhone" text,
    "agentEmail" text,
    images jsonb,
    "primaryImage" text,
    "postedAt" timestamp(3) without time zone,
    "scrapedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dedupeHash" text NOT NULL,
    "isDuplicate" boolean DEFAULT false NOT NULL,
    "duplicateOf" text,
    "rawData" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Listing" OWNER TO allinone_user;

--
-- Name: Membership; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."Membership" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "ownerUid" text NOT NULL,
    role public."MembershipRole" DEFAULT 'MEMBER'::public."MembershipRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Membership" OWNER TO allinone_user;

--
-- Name: OAuthConnection; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."OAuthConnection" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    platform public."CampaignPlatform" NOT NULL,
    status public."ConnectionStatus" DEFAULT 'DISCONNECTED'::public."ConnectionStatus" NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "expiresAt" timestamp(3) without time zone,
    "lastChecked" timestamp(3) without time zone,
    "accountId" text,
    "accountName" text,
    "lastError" text,
    "lastErrorAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OAuthConnection" OWNER TO allinone_user;

--
-- Name: Organization; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."Organization" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Organization" OWNER TO allinone_user;

--
-- Name: Property; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."Property" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    slug text,
    address text,
    city text,
    type public."PropertyType",
    status public."PropertyStatus" DEFAULT 'DRAFT'::public."PropertyStatus" NOT NULL,
    price integer,
    "agentName" text,
    "agentPhone" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    name text NOT NULL,
    "photosJson" jsonb,
    rooms integer,
    size integer,
    amenities text,
    currency text DEFAULT 'ILS'::text,
    description text,
    "externalId" text,
    "externalUrl" text,
    "lastSyncAt" timestamp(3) without time zone,
    "lastSyncError" text,
    "needsReview" boolean DEFAULT false NOT NULL,
    neighborhood text,
    provider public."PropertyProvider" DEFAULT 'MANUAL'::public."PropertyProvider" NOT NULL,
    "seoDescription" text,
    "seoTitle" text,
    "syncData" jsonb,
    "syncStatus" public."SyncStatus" DEFAULT 'IDLE'::public."SyncStatus" NOT NULL
);


ALTER TABLE public."Property" OWNER TO allinone_user;

--
-- Name: PropertyImportBatch; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."PropertyImportBatch" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    source public."PropertyProvider" NOT NULL,
    "importType" text NOT NULL,
    filename text,
    urls jsonb,
    "totalItems" integer DEFAULT 0 NOT NULL,
    "importedItems" integer DEFAULT 0 NOT NULL,
    "updatedItems" integer DEFAULT 0 NOT NULL,
    "duplicateItems" integer DEFAULT 0 NOT NULL,
    "errorItems" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    errors jsonb,
    summary jsonb,
    progress integer DEFAULT 0 NOT NULL,
    "currentItem" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public."PropertyImportBatch" OWNER TO allinone_user;

--
-- Name: PropertyPhoto; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."PropertyPhoto" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    url text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "sortIndex" integer DEFAULT 0
);


ALTER TABLE public."PropertyPhoto" OWNER TO allinone_user;

--
-- Name: RealEstateLead; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."RealEstateLead" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    phone text,
    email text,
    source text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "propertyId" text,
    "fullName" text,
    message text
);


ALTER TABLE public."RealEstateLead" OWNER TO allinone_user;

--
-- Name: RealEstateLeadEvent; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."RealEstateLeadEvent" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    type text NOT NULL,
    payload jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RealEstateLeadEvent" OWNER TO allinone_user;

--
-- Name: Sale; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."Sale" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    "leadId" text,
    amount double precision NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    description text,
    "campaignId" text,
    source public."LeadSource",
    "utmSource" text,
    "utmMedium" text,
    "utmCampaign" text,
    "saleDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "enteredBy" text,
    "importBatchId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Sale" OWNER TO allinone_user;

--
-- Name: SavedSearch; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."SavedSearch" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    "searchJobId" text NOT NULL,
    name text NOT NULL,
    description text,
    location text,
    "minRooms" integer,
    "maxRooms" integer,
    "minSize" integer,
    "maxSize" integer,
    "minPrice" integer,
    "maxPrice" integer,
    keywords text,
    "listingType" public."ListingType" DEFAULT 'FOR_SALE'::public."ListingType",
    "isActive" boolean DEFAULT true NOT NULL,
    frequency text,
    "lastRunAt" timestamp(3) without time zone,
    "nextRunAt" timestamp(3) without time zone,
    "emailAlerts" boolean DEFAULT false NOT NULL,
    "alertEmail" text,
    "minScore" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SavedSearch" OWNER TO allinone_user;

--
-- Name: SearchJob; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."SearchJob" (
    id text NOT NULL,
    "ownerUid" text NOT NULL,
    location text,
    "minRooms" integer,
    "maxRooms" integer,
    "minSize" integer,
    "maxSize" integer,
    "minPrice" integer,
    "maxPrice" integer,
    keywords text,
    "listingType" public."ListingType" DEFAULT 'FOR_SALE'::public."ListingType",
    status public."SearchJobStatus" DEFAULT 'QUEUED'::public."SearchJobStatus" NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    "currentStep" text,
    "totalListings" integer DEFAULT 0 NOT NULL,
    "processedListings" integer DEFAULT 0 NOT NULL,
    "validListings" integer DEFAULT 0 NOT NULL,
    "duplicateListings" integer DEFAULT 0 NOT NULL,
    "errorListings" integer DEFAULT 0 NOT NULL,
    "providersUsed" jsonb,
    "providerResults" jsonb,
    "openaiTokensUsed" integer DEFAULT 0 NOT NULL,
    "openaiCost" double precision DEFAULT 0 NOT NULL,
    errors jsonb,
    "lastError" text,
    "lastErrorAt" timestamp(3) without time zone,
    "searchDuration" integer,
    "enrichmentDuration" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SearchJob" OWNER TO allinone_user;

--
-- Name: User; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    lang text DEFAULT 'en'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO allinone_user;

--
-- Name: UserProfile; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public."UserProfile" (
    "userId" text NOT NULL,
    "defaultVertical" public."Vertical" NOT NULL,
    "termsConsentAt" timestamp(3) without time zone NOT NULL,
    "termsVersion" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserProfile" OWNER TO allinone_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: allinone_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO allinone_user;

--
-- Data for Name: AutoFollowupExecution; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."AutoFollowupExecution" (id, "leadId", "templateId", channel, status, subject, content, "sentAt", "deliveredAt", "readAt", "clickedAt", error, "retryCount", "maxRetries", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AutoFollowupTemplate; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."AutoFollowupTemplate" (id, "ownerUid", name, trigger, channel, subject, content, variables, "isActive", "delayMinutes", "brandName", "brandLogo", "brandColors", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Campaign; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."Campaign" (id, "ownerUid", audience, status, "createdAt", "updatedAt", budget, clicks, "connectionId", conversions, creative, "dailyBudget", "endDate", impressions, "lastCheckAt", name, "platformAdSetId", "platformCampaignId", "preflightChecks", spend, "startDate", goal, platform) FROM stdin;
\.


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."Client" (id, "ownerUid", "fullName", phone, email, "budgetMin", "budgetMax", "preferredCity", stage, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: EcommerceLead; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."EcommerceLead" (id, "ownerUid", "externalId", "fullName", "firstName", "lastName", phone, email, city, address, status, score, source, "sourceName", "assigneeId", budget, interests, notes, "utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent", "phoneValid", "emailValid", "firstContactAt", "lastContactAt", "duplicateOfId", "isDuplicate", "createdAt", "updatedAt", "campaignId", "platformAdSetId") FROM stdin;
cmfjr4tvk0000la539bfgviw9	demo-ecommerce-user	\N	Michael Thompson	Michael	Thompson	+1-555-0101	michael@example.com	New York	\N	QUALIFIED	HOT	FACEBOOK	Summer Sale Campaign	\N	\N	\N	\N	\N	\N	\N	\N	\N	VALID	VALID	2025-09-12 13:49:37.47	\N	\N	f	2025-09-11 13:49:37.47	2025-09-12 13:49:37.47	\N	\N
cmfjr4tvx0001la53lq3onvpd	demo-ecommerce-user	\N	Jennifer Martinez	Jennifer	Martinez	+1-555-0102	jennifer@example.com	Los Angeles	\N	MEETING	HOT	INSTAGRAM	Holiday Campaign	\N	\N	\N	\N	\N	\N	\N	\N	\N	VALID	VALID	2025-09-13 13:49:37.47	\N	\N	f	2025-09-10 13:49:37.47	2025-09-13 13:49:37.47	\N	\N
cmfjr4tvz0002la53iq9cdhb0	demo-ecommerce-user	\N	Robert Kim	Robert	Kim	+1-555-0103	robert@example.com	Chicago	\N	WON	HOT	GOOGLE_SHEETS	Partner Referral	\N	\N	\N	\N	\N	\N	\N	\N	\N	VALID	VALID	2025-09-09 13:49:37.47	\N	\N	f	2025-09-07 13:49:37.47	2025-09-10 13:49:37.47	\N	\N
cmfjr4tw10003la538q5xe2ix	demo-ecommerce-user	\N	Lisa Wang	Lisa	Wang	+1-555-0104	lisa@example.com	Seattle	\N	CONTACTED	WARM	CSV_UPLOAD	Trade Show List	\N	\N	\N	\N	\N	\N	\N	\N	\N	VALID	VALID	2025-09-11 13:49:37.47	\N	\N	f	2025-09-08 13:49:37.47	2025-09-11 13:49:37.47	\N	\N
cmfjr4tw20004la53vry7n2ab	demo-ecommerce-user	\N	James Wilson	James	Wilson	+1-555-0105	james@example.com	Miami	\N	QUALIFIED	WARM	WHATSAPP	Customer Referral	\N	\N	\N	\N	\N	\N	\N	\N	\N	VALID	VALID	\N	\N	\N	f	2025-09-06 13:49:37.47	2025-09-06 13:49:37.47	\N	\N
cmfjr4tw40005la53kl1nasxd	demo-ecommerce-user	\N	Amanda Davis	Amanda	Davis	+1-555-0106	amanda@example.com	Denver	\N	NEW	COLD	FACEBOOK	Brand Awareness Campaign	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING	VALID	\N	\N	\N	f	2025-09-14 01:49:37.47	2025-09-14 01:49:37.47	\N	\N
cmfjr4tw50006la5304lx0img	demo-ecommerce-user	\N	Carlos Rodriguez	Carlos	Rodriguez	+1-555-0107	carlos@example.com	Phoenix	\N	LOST	COLD	MANUAL	Cold Call	\N	\N	\N	\N	\N	\N	\N	\N	\N	INVALID	VALID	\N	\N	\N	f	2025-08-31 13:49:37.47	2025-08-31 13:49:37.47	\N	\N
cmfjr4tw80007la53sszlmu0k	demo-ecommerce-user	\N	Emma Johnson	Emma	Johnson	+1-555-0108	emma@example.com	Boston	\N	NEW	WARM	INSTAGRAM	Influencer Campaign	\N	\N	\N	\N	\N	\N	\N	\N	\N	VALID	VALID	\N	\N	\N	f	2025-09-14 09:49:37.47	2025-09-14 09:49:37.47	\N	\N
\.


--
-- Data for Name: EmailVerification; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."EmailVerification" (id, "userId", token, "expiresAt", "usedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: LeadActivity; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."LeadActivity" (id, "leadId", type, subject, content, direction, "userId", "scheduledAt", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LeadAssignmentRule; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."LeadAssignmentRule" (id, "ownerUid", name, "isActive", priority, conditions, "assigneeId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LeadEvent; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."LeadEvent" (id, "leadId", type, data, "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: LeadImportBatch; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."LeadImportBatch" (id, "ownerUid", source, filename, "totalRows", "validRows", "invalidRows", "duplicateRows", "importedRows", status, errors, summary, "createdAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: LeadSourceHealth; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."LeadSourceHealth" (id, "ownerUid", source, "lastEventAt", "lastErrorAt", "lastError", "isHealthy", "totalLeads", "todayLeads", "weekLeads", "monthLeads", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Listing; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."Listing" (id, "searchJobId", "ownerUid", title, description, location, city, neighborhood, rooms, size, price, "pricePerSqm", currency, "listingType", provider, "sourceUrl", "sourceId", "aiScore", "aiSummary", "aiTags", "agentName", "agentPhone", "agentEmail", images, "primaryImage", "postedAt", "scrapedAt", "dedupeHash", "isDuplicate", "duplicateOf", "rawData", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Membership; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."Membership" (id, "userId", "ownerUid", role, "createdAt", "updatedAt") FROM stdin;
cmfgiyuvk0004lazffy36rqsl	cmfgiyuv80000lazfps2pldjp	cmfgiyuvf0002lazfb55f7m69	OWNER	2025-09-12 07:37:43.377	2025-09-12 07:37:43.377
cmfgkfrxn0003la115n3283dk	d8FoEwWgULYlNBKjSBwlq1KGxKr2	cmfgkfrxm0001la111dnu3m2x	OWNER	2025-09-12 08:18:52.332	2025-09-12 08:18:52.332
\.


--
-- Data for Name: OAuthConnection; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."OAuthConnection" (id, "ownerUid", platform, status, "accessToken", "refreshToken", "expiresAt", "lastChecked", "accountId", "accountName", "lastError", "lastErrorAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Organization; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."Organization" (id, "ownerUid", name, "createdAt", "updatedAt") FROM stdin;
cmfgiyuvf0002lazfb55f7m69	cmfgiyuv80000lazfps2pldjp	Test User's Organization	2025-09-12 07:37:43.371	2025-09-12 07:37:43.371
cmfgkfrxm0001la111dnu3m2x	d8FoEwWgULYlNBKjSBwlq1KGxKr2	יובל מס's Organization	2025-09-12 08:18:52.33	2025-09-12 08:18:52.33
\.


--
-- Data for Name: Property; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."Property" (id, "ownerUid", slug, address, city, type, status, price, "agentName", "agentPhone", "createdAt", "updatedAt", name, "photosJson", rooms, size, amenities, currency, description, "externalId", "externalUrl", "lastSyncAt", "lastSyncError", "needsReview", neighborhood, provider, "seoDescription", "seoTitle", "syncData", "syncStatus") FROM stdin;
cmfjrdo3v0005lajoex5x2yom	demo-realestate-user	\N	123 Dizengoff St, Tel Aviv	Tel Aviv	\N	PUBLISHED	850000	\N	\N	2025-09-09 13:56:29.861	2025-09-09 13:56:29.861	Modern 3BR Apartment in Downtown Tel Aviv	\N	3	1200	parking, elevator, balcony, air-conditioning	ILS	Stunning modern apartment with city views, premium finishes, and rooftop access	\N	\N	\N	\N	f	City Center	MANUAL	\N	\N	\N	IDLE
cmfjrdo480006lajo9reyq3q3	demo-realestate-user	\N	456 Gordon St, Herzliya	Herzliya	\N	PUBLISHED	2400000	\N	\N	2025-09-02 13:56:29.861	2025-09-02 13:56:29.861	Luxury Villa with Pool in Herzliya	\N	5	3200	pool, garden, garage, security	ILS	Spacious villa with private pool, garden, and premium location	\N	\N	\N	\N	f	Herzliya Pituach	MANUAL	\N	\N	\N	IDLE
cmfjrdo4b0007lajouowdgidn	demo-realestate-user	\N	789 HaAtzmaut Blvd, Netanya	Netanya	\N	PUBLISHED	620000	\N	\N	2025-09-06 13:56:29.861	2025-09-06 13:56:29.861	Cozy 2BR Near Beach in Netanya	\N	2	900	near-beach, renovated, bright	ILS	Charming apartment just 5 minutes walk from the beach	\N	\N	\N	\N	f	City Center	MANUAL	\N	\N	\N	IDLE
cmfjrdo4e0008lajofmuxcpxv	demo-realestate-user	\N	100 Rothschild Blvd, Tel Aviv	Tel Aviv	\N	DRAFT	3500000	\N	\N	2025-09-11 13:56:29.861	2025-09-11 13:56:29.861	Penthouse with Panoramic Views	\N	4	2800	penthouse, panoramic-views, luxury-finishes, private-elevator	ILS	Exclusive penthouse with 360-degree city and sea views	\N	\N	\N	\N	f	Rothschild	MANUAL	\N	\N	\N	IDLE
\.


--
-- Data for Name: PropertyImportBatch; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."PropertyImportBatch" (id, "ownerUid", source, "importType", filename, urls, "totalItems", "importedItems", "updatedItems", "duplicateItems", "errorItems", status, errors, summary, progress, "currentItem", "createdAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: PropertyPhoto; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."PropertyPhoto" (id, "propertyId", url, "createdAt", "updatedAt", "sortIndex") FROM stdin;
\.


--
-- Data for Name: RealEstateLead; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."RealEstateLead" (id, "ownerUid", phone, email, source, "createdAt", "updatedAt", "propertyId", "fullName", message) FROM stdin;
cmfjrdo2w0000lajo7ttv9lbi	demo-realestate-user	+972-52-555-0201	yossi.abraham@gmail.com	FACEBOOK	2025-09-12 13:56:29.861	2025-09-12 13:56:29.861	\N	Yossi Abraham	Looking for family apartment in Tel Aviv, 3BR, needs parking
cmfjrdo3l0001lajobd3i3e60	demo-realestate-user	+972-54-555-0202	rachel.cohen@outlook.com	GOOGLE	2025-09-08 13:56:29.861	2025-09-08 13:56:29.861	\N	Rachel Cohen	Investment property, looking for 4BR house in Herzliya or Kfar Saba
cmfjrdo3o0002lajo41wmjjs7	demo-realestate-user	+972-50-555-0203	david.goldberg@gmail.com	MANUAL	2025-09-04 13:56:29.861	2025-09-04 13:56:29.861	\N	David Goldberg	First-time buyer, looking for 2BR apartment in Netanya
cmfjrdo3q0003lajotezeihtm	demo-realestate-user	+972-53-555-0204	sarah.levi@yahoo.com	REFERRAL	2025-09-13 13:56:29.861	2025-09-13 13:56:29.861	\N	Sarah Levi	High-end penthouse in Tel Aviv, 5 bedrooms, urgent need
cmfjrdo3t0004lajoz2rcs95v	demo-realestate-user	+972-52-555-0205	michael.green@gmail.com	INSTAGRAM	2025-09-10 13:56:29.861	2025-09-10 13:56:29.861	\N	Michael Green	Young professional needs studio in Tel Aviv or Jaffa, close to work
\.


--
-- Data for Name: RealEstateLeadEvent; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."RealEstateLeadEvent" (id, "leadId", type, payload, "createdAt") FROM stdin;
\.


--
-- Data for Name: Sale; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."Sale" (id, "ownerUid", "leadId", amount, currency, description, "campaignId", source, "utmSource", "utmMedium", "utmCampaign", "saleDate", "enteredBy", "importBatchId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SavedSearch; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."SavedSearch" (id, "ownerUid", "searchJobId", name, description, location, "minRooms", "maxRooms", "minSize", "maxSize", "minPrice", "maxPrice", keywords, "listingType", "isActive", frequency, "lastRunAt", "nextRunAt", "emailAlerts", "alertEmail", "minScore", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SearchJob; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."SearchJob" (id, "ownerUid", location, "minRooms", "maxRooms", "minSize", "maxSize", "minPrice", "maxPrice", keywords, "listingType", status, progress, "currentStep", "totalListings", "processedListings", "validListings", "duplicateListings", "errorListings", "providersUsed", "providerResults", "openaiTokensUsed", "openaiCost", errors, "lastError", "lastErrorAt", "searchDuration", "enrichmentDuration", "createdAt", "startedAt", "completedAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."User" (id, "fullName", email, "passwordHash", lang, "createdAt", "updatedAt") FROM stdin;
cmfgiyuv80000lazfps2pldjp	Test User	test@example.com	$2b$12$7jO2IGbAiYevdPxbnkIxFu69sJopgE62jw18W/BNE9Vys7Ezw.O7G	en	2025-09-12 07:37:43.364	2025-09-12 07:37:43.364
d8FoEwWgULYlNBKjSBwlq1KGxKr2	יובל מס	yuvalmesika19@gmail.com		he	2025-09-12 08:18:52.328	2025-09-12 08:18:52.328
\.


--
-- Data for Name: UserProfile; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public."UserProfile" ("userId", "defaultVertical", "termsConsentAt", "termsVersion", "createdAt", "updatedAt") FROM stdin;
cmfgiyuv80000lazfps2pldjp	E_COMMERCE	2025-09-12 07:37:43.384	1.0	2025-09-12 07:37:43.384	2025-09-12 07:37:43.384
d8FoEwWgULYlNBKjSBwlq1KGxKr2	REAL_ESTATE	2025-09-12 08:18:52.334	1.0	2025-09-12 08:18:52.334	2025-09-12 08:18:52.334
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: allinone_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b422ede8-3d2d-400a-9a9c-610126d2dee9	81c77773ce263f35dc0266a14780cae27a6d6b3d6a2bec11cc0e07aea723bf30	2025-09-12 01:25:46.016561+03	20250904101357_init_postgres	\N	\N	2025-09-12 01:25:46.002996+03	1
d91b7186-03c9-40ed-882c-30d81c72678c	288b0bf65505d4cb89c2ebe931e8bdc5345dd03b16135ffdd353ac4c0400b3cf	2025-09-12 01:25:46.017605+03	20250907203810_backfill_property_requireds	\N	\N	2025-09-12 01:25:46.016834+03	1
dd6a0520-f65a-4001-95b4-cfc51af7116a	288b0bf65505d4cb89c2ebe931e8bdc5345dd03b16135ffdd353ac4c0400b3cf	2025-09-12 01:25:46.018625+03	20250907211335_add_agent_fields	\N	\N	2025-09-12 01:25:46.017845+03	1
d50e4578-5fd5-4748-9e78-e205dc2285d6	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	2025-09-12 01:25:46.019448+03	20250907221713_20250907220700_add_property_name_column_fix	\N	\N	2025-09-12 01:25:46.018868+03	1
8de678f5-2fe3-4fc0-bdd9-a73c3d8ce48e	425f040b5a626466be0115c9580612e858fb266ef1a3b9c3c1a8cb7931cb5105	2025-09-12 01:25:46.020353+03	20250907224243_add_property_area_sqm	\N	\N	2025-09-12 01:25:46.019672+03	1
93ca12ec-4cbd-48f8-ba42-241397a19b34	d83809c2f60b034a98f7dc1e5278f5693669d40219a05491d826cf3c20d59012	2025-09-12 01:25:46.030421+03	20250908091658_add_property_back_relations	\N	\N	2025-09-12 01:25:46.020656+03	1
1bdf81ff-dd68-4e31-86c3-f69f89ca02b0	8220ffd382c24d6b098aecdadaf5e2db74a09dd915f09c38ecaaed66bc0dea1d	2025-09-12 01:25:46.032844+03	20250909075318_add_real_estate_lead_event	\N	\N	2025-09-12 01:25:46.030675+03	1
0bda5dad-c251-493b-851b-dfb864ec98f7	6e9306052aca55dbae1d167c8efcbc540741af8124d9dda761f840934fea3536	2025-09-12 01:25:46.043947+03	20250910233604_add_auth_models	\N	\N	2025-09-12 01:25:46.03316+03	1
f859eb22-a120-493b-9920-fda6b5f8059b	e8ca634e3581cb989f59f509f9e4012f29839e4e5d7b3065b934cdcecba77f87	2025-09-12 01:25:46.057879+03	20250911075941_add_ecommerce_leads_system	\N	\N	2025-09-12 01:25:46.044253+03	1
\.


--
-- Name: AutoFollowupExecution AutoFollowupExecution_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."AutoFollowupExecution"
    ADD CONSTRAINT "AutoFollowupExecution_pkey" PRIMARY KEY (id);


--
-- Name: AutoFollowupTemplate AutoFollowupTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."AutoFollowupTemplate"
    ADD CONSTRAINT "AutoFollowupTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Campaign Campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Campaign"
    ADD CONSTRAINT "Campaign_pkey" PRIMARY KEY (id);


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: EcommerceLead EcommerceLead_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."EcommerceLead"
    ADD CONSTRAINT "EcommerceLead_pkey" PRIMARY KEY (id);


--
-- Name: EmailVerification EmailVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."EmailVerification"
    ADD CONSTRAINT "EmailVerification_pkey" PRIMARY KEY (id);


--
-- Name: LeadActivity LeadActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."LeadActivity"
    ADD CONSTRAINT "LeadActivity_pkey" PRIMARY KEY (id);


--
-- Name: LeadAssignmentRule LeadAssignmentRule_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."LeadAssignmentRule"
    ADD CONSTRAINT "LeadAssignmentRule_pkey" PRIMARY KEY (id);


--
-- Name: LeadEvent LeadEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."LeadEvent"
    ADD CONSTRAINT "LeadEvent_pkey" PRIMARY KEY (id);


--
-- Name: LeadImportBatch LeadImportBatch_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."LeadImportBatch"
    ADD CONSTRAINT "LeadImportBatch_pkey" PRIMARY KEY (id);


--
-- Name: LeadSourceHealth LeadSourceHealth_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."LeadSourceHealth"
    ADD CONSTRAINT "LeadSourceHealth_pkey" PRIMARY KEY (id);


--
-- Name: Listing Listing_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_pkey" PRIMARY KEY (id);


--
-- Name: Membership Membership_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_pkey" PRIMARY KEY (id);


--
-- Name: OAuthConnection OAuthConnection_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."OAuthConnection"
    ADD CONSTRAINT "OAuthConnection_pkey" PRIMARY KEY (id);


--
-- Name: Organization Organization_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_pkey" PRIMARY KEY (id);


--
-- Name: PropertyImportBatch PropertyImportBatch_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."PropertyImportBatch"
    ADD CONSTRAINT "PropertyImportBatch_pkey" PRIMARY KEY (id);


--
-- Name: PropertyPhoto PropertyPhoto_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."PropertyPhoto"
    ADD CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY (id);


--
-- Name: Property Property_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_pkey" PRIMARY KEY (id);


--
-- Name: RealEstateLeadEvent RealEstateLeadEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."RealEstateLeadEvent"
    ADD CONSTRAINT "RealEstateLeadEvent_pkey" PRIMARY KEY (id);


--
-- Name: RealEstateLead RealEstateLead_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."RealEstateLead"
    ADD CONSTRAINT "RealEstateLead_pkey" PRIMARY KEY (id);


--
-- Name: Sale Sale_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_pkey" PRIMARY KEY (id);


--
-- Name: SavedSearch SavedSearch_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."SavedSearch"
    ADD CONSTRAINT "SavedSearch_pkey" PRIMARY KEY (id);


--
-- Name: SearchJob SearchJob_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."SearchJob"
    ADD CONSTRAINT "SearchJob_pkey" PRIMARY KEY (id);


--
-- Name: UserProfile UserProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."UserProfile"
    ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId");


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AutoFollowupExecution_leadId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "AutoFollowupExecution_leadId_idx" ON public."AutoFollowupExecution" USING btree ("leadId");


--
-- Name: AutoFollowupExecution_sentAt_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "AutoFollowupExecution_sentAt_idx" ON public."AutoFollowupExecution" USING btree ("sentAt");


--
-- Name: AutoFollowupExecution_status_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "AutoFollowupExecution_status_idx" ON public."AutoFollowupExecution" USING btree (status);


--
-- Name: AutoFollowupTemplate_isActive_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "AutoFollowupTemplate_isActive_idx" ON public."AutoFollowupTemplate" USING btree ("isActive");


--
-- Name: AutoFollowupTemplate_ownerUid_trigger_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "AutoFollowupTemplate_ownerUid_trigger_idx" ON public."AutoFollowupTemplate" USING btree ("ownerUid", trigger);


--
-- Name: Campaign_ownerUid_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Campaign_ownerUid_idx" ON public."Campaign" USING btree ("ownerUid");


--
-- Name: Campaign_platform_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Campaign_platform_idx" ON public."Campaign" USING btree (platform);


--
-- Name: Campaign_status_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Campaign_status_idx" ON public."Campaign" USING btree (status);


--
-- Name: Client_ownerUid_stage_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Client_ownerUid_stage_idx" ON public."Client" USING btree ("ownerUid", stage);


--
-- Name: EcommerceLead_campaignId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "EcommerceLead_campaignId_idx" ON public."EcommerceLead" USING btree ("campaignId");


--
-- Name: EcommerceLead_email_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "EcommerceLead_email_idx" ON public."EcommerceLead" USING btree (email);


--
-- Name: EcommerceLead_externalId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "EcommerceLead_externalId_idx" ON public."EcommerceLead" USING btree ("externalId");


--
-- Name: EcommerceLead_ownerUid_createdAt_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "EcommerceLead_ownerUid_createdAt_idx" ON public."EcommerceLead" USING btree ("ownerUid", "createdAt");


--
-- Name: EcommerceLead_ownerUid_externalId_source_key; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE UNIQUE INDEX "EcommerceLead_ownerUid_externalId_source_key" ON public."EcommerceLead" USING btree ("ownerUid", "externalId", source);


--
-- Name: EcommerceLead_ownerUid_score_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "EcommerceLead_ownerUid_score_idx" ON public."EcommerceLead" USING btree ("ownerUid", score);


--
-- Name: EcommerceLead_ownerUid_source_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "EcommerceLead_ownerUid_source_idx" ON public."EcommerceLead" USING btree ("ownerUid", source);


--
-- Name: EcommerceLead_ownerUid_status_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "EcommerceLead_ownerUid_status_idx" ON public."EcommerceLead" USING btree ("ownerUid", status);


--
-- Name: EcommerceLead_phone_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "EcommerceLead_phone_idx" ON public."EcommerceLead" USING btree (phone);


--
-- Name: EmailVerification_expiresAt_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "EmailVerification_expiresAt_idx" ON public."EmailVerification" USING btree ("expiresAt");


--
-- Name: EmailVerification_token_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "EmailVerification_token_idx" ON public."EmailVerification" USING btree (token);


--
-- Name: EmailVerification_token_key; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE UNIQUE INDEX "EmailVerification_token_key" ON public."EmailVerification" USING btree (token);


--
-- Name: EmailVerification_userId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "EmailVerification_userId_idx" ON public."EmailVerification" USING btree ("userId");


--
-- Name: LeadActivity_createdAt_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadActivity_createdAt_idx" ON public."LeadActivity" USING btree ("createdAt");


--
-- Name: LeadActivity_leadId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadActivity_leadId_idx" ON public."LeadActivity" USING btree ("leadId");


--
-- Name: LeadActivity_scheduledAt_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadActivity_scheduledAt_idx" ON public."LeadActivity" USING btree ("scheduledAt");


--
-- Name: LeadActivity_type_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadActivity_type_idx" ON public."LeadActivity" USING btree (type);


--
-- Name: LeadAssignmentRule_ownerUid_isActive_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadAssignmentRule_ownerUid_isActive_idx" ON public."LeadAssignmentRule" USING btree ("ownerUid", "isActive");


--
-- Name: LeadAssignmentRule_priority_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadAssignmentRule_priority_idx" ON public."LeadAssignmentRule" USING btree (priority);


--
-- Name: LeadEvent_createdAt_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadEvent_createdAt_idx" ON public."LeadEvent" USING btree ("createdAt");


--
-- Name: LeadEvent_leadId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadEvent_leadId_idx" ON public."LeadEvent" USING btree ("leadId");


--
-- Name: LeadEvent_type_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadEvent_type_idx" ON public."LeadEvent" USING btree (type);


--
-- Name: LeadImportBatch_createdAt_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadImportBatch_createdAt_idx" ON public."LeadImportBatch" USING btree ("createdAt");


--
-- Name: LeadImportBatch_ownerUid_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadImportBatch_ownerUid_idx" ON public."LeadImportBatch" USING btree ("ownerUid");


--
-- Name: LeadImportBatch_status_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadImportBatch_status_idx" ON public."LeadImportBatch" USING btree (status);


--
-- Name: LeadSourceHealth_ownerUid_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadSourceHealth_ownerUid_idx" ON public."LeadSourceHealth" USING btree ("ownerUid");


--
-- Name: LeadSourceHealth_ownerUid_source_key; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE UNIQUE INDEX "LeadSourceHealth_ownerUid_source_key" ON public."LeadSourceHealth" USING btree ("ownerUid", source);


--
-- Name: LeadSourceHealth_source_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "LeadSourceHealth_source_idx" ON public."LeadSourceHealth" USING btree (source);


--
-- Name: Listing_aiScore_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Listing_aiScore_idx" ON public."Listing" USING btree ("aiScore");


--
-- Name: Listing_city_rooms_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Listing_city_rooms_idx" ON public."Listing" USING btree (city, rooms);


--
-- Name: Listing_dedupeHash_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Listing_dedupeHash_idx" ON public."Listing" USING btree ("dedupeHash");


--
-- Name: Listing_dedupeHash_key; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE UNIQUE INDEX "Listing_dedupeHash_key" ON public."Listing" USING btree ("dedupeHash");


--
-- Name: Listing_ownerUid_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Listing_ownerUid_idx" ON public."Listing" USING btree ("ownerUid");


--
-- Name: Listing_price_rooms_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Listing_price_rooms_idx" ON public."Listing" USING btree (price, rooms);


--
-- Name: Listing_provider_sourceId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Listing_provider_sourceId_idx" ON public."Listing" USING btree (provider, "sourceId");


--
-- Name: Listing_provider_sourceId_key; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE UNIQUE INDEX "Listing_provider_sourceId_key" ON public."Listing" USING btree (provider, "sourceId");


--
-- Name: Listing_searchJobId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Listing_searchJobId_idx" ON public."Listing" USING btree ("searchJobId");


--
-- Name: Membership_ownerUid_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Membership_ownerUid_idx" ON public."Membership" USING btree ("ownerUid");


--
-- Name: Membership_userId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Membership_userId_idx" ON public."Membership" USING btree ("userId");


--
-- Name: Membership_userId_ownerUid_key; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE UNIQUE INDEX "Membership_userId_ownerUid_key" ON public."Membership" USING btree ("userId", "ownerUid");


--
-- Name: OAuthConnection_ownerUid_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "OAuthConnection_ownerUid_idx" ON public."OAuthConnection" USING btree ("ownerUid");


--
-- Name: OAuthConnection_ownerUid_platform_key; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE UNIQUE INDEX "OAuthConnection_ownerUid_platform_key" ON public."OAuthConnection" USING btree ("ownerUid", platform);


--
-- Name: Organization_ownerUid_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Organization_ownerUid_idx" ON public."Organization" USING btree ("ownerUid");


--
-- Name: Organization_ownerUid_key; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE UNIQUE INDEX "Organization_ownerUid_key" ON public."Organization" USING btree ("ownerUid");


--
-- Name: PropertyImportBatch_createdAt_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "PropertyImportBatch_createdAt_idx" ON public."PropertyImportBatch" USING btree ("createdAt");


--
-- Name: PropertyImportBatch_ownerUid_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "PropertyImportBatch_ownerUid_idx" ON public."PropertyImportBatch" USING btree ("ownerUid");


--
-- Name: PropertyImportBatch_source_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "PropertyImportBatch_source_idx" ON public."PropertyImportBatch" USING btree (source);


--
-- Name: PropertyImportBatch_status_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "PropertyImportBatch_status_idx" ON public."PropertyImportBatch" USING btree (status);


--
-- Name: PropertyPhoto_propertyId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "PropertyPhoto_propertyId_idx" ON public."PropertyPhoto" USING btree ("propertyId");


--
-- Name: Property_ownerUid_provider_externalId_key; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE UNIQUE INDEX "Property_ownerUid_provider_externalId_key" ON public."Property" USING btree ("ownerUid", provider, "externalId");


--
-- Name: Property_ownerUid_provider_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Property_ownerUid_provider_idx" ON public."Property" USING btree ("ownerUid", provider);


--
-- Name: Property_ownerUid_status_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Property_ownerUid_status_idx" ON public."Property" USING btree ("ownerUid", status);


--
-- Name: Property_provider_externalId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Property_provider_externalId_idx" ON public."Property" USING btree (provider, "externalId");


--
-- Name: Property_slug_key; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE UNIQUE INDEX "Property_slug_key" ON public."Property" USING btree (slug);


--
-- Name: RealEstateLeadEvent_leadId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "RealEstateLeadEvent_leadId_idx" ON public."RealEstateLeadEvent" USING btree ("leadId");


--
-- Name: RealEstateLead_ownerUid_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "RealEstateLead_ownerUid_idx" ON public."RealEstateLead" USING btree ("ownerUid");


--
-- Name: RealEstateLead_propertyId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "RealEstateLead_propertyId_idx" ON public."RealEstateLead" USING btree ("propertyId");


--
-- Name: Sale_campaignId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Sale_campaignId_idx" ON public."Sale" USING btree ("campaignId");


--
-- Name: Sale_leadId_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Sale_leadId_idx" ON public."Sale" USING btree ("leadId");


--
-- Name: Sale_ownerUid_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Sale_ownerUid_idx" ON public."Sale" USING btree ("ownerUid");


--
-- Name: Sale_saleDate_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "Sale_saleDate_idx" ON public."Sale" USING btree ("saleDate");


--
-- Name: SavedSearch_isActive_nextRunAt_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "SavedSearch_isActive_nextRunAt_idx" ON public."SavedSearch" USING btree ("isActive", "nextRunAt");


--
-- Name: SavedSearch_ownerUid_isActive_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "SavedSearch_ownerUid_isActive_idx" ON public."SavedSearch" USING btree ("ownerUid", "isActive");


--
-- Name: SavedSearch_ownerUid_nextRunAt_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "SavedSearch_ownerUid_nextRunAt_idx" ON public."SavedSearch" USING btree ("ownerUid", "nextRunAt");


--
-- Name: SavedSearch_searchJobId_key; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE UNIQUE INDEX "SavedSearch_searchJobId_key" ON public."SavedSearch" USING btree ("searchJobId");


--
-- Name: SearchJob_createdAt_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "SearchJob_createdAt_idx" ON public."SearchJob" USING btree ("createdAt");


--
-- Name: SearchJob_ownerUid_createdAt_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "SearchJob_ownerUid_createdAt_idx" ON public."SearchJob" USING btree ("ownerUid", "createdAt");


--
-- Name: SearchJob_ownerUid_status_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "SearchJob_ownerUid_status_idx" ON public."SearchJob" USING btree ("ownerUid", status);


--
-- Name: SearchJob_status_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "SearchJob_status_idx" ON public."SearchJob" USING btree (status);


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: allinone_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: AutoFollowupExecution AutoFollowupExecution_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."AutoFollowupExecution"
    ADD CONSTRAINT "AutoFollowupExecution_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."EcommerceLead"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AutoFollowupExecution AutoFollowupExecution_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."AutoFollowupExecution"
    ADD CONSTRAINT "AutoFollowupExecution_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."AutoFollowupTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Campaign Campaign_connectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Campaign"
    ADD CONSTRAINT "Campaign_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES public."OAuthConnection"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EcommerceLead EcommerceLead_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."EcommerceLead"
    ADD CONSTRAINT "EcommerceLead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."Campaign"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EcommerceLead EcommerceLead_duplicateOfId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."EcommerceLead"
    ADD CONSTRAINT "EcommerceLead_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES public."EcommerceLead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EmailVerification EmailVerification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."EmailVerification"
    ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeadActivity LeadActivity_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."LeadActivity"
    ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."EcommerceLead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeadEvent LeadEvent_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."LeadEvent"
    ADD CONSTRAINT "LeadEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."EcommerceLead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Listing Listing_searchJobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_searchJobId_fkey" FOREIGN KEY ("searchJobId") REFERENCES public."SearchJob"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Membership Membership_ownerUid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_ownerUid_fkey" FOREIGN KEY ("ownerUid") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Membership Membership_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Organization Organization_ownerUid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_ownerUid_fkey" FOREIGN KEY ("ownerUid") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PropertyPhoto PropertyPhoto_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."PropertyPhoto"
    ADD CONSTRAINT "PropertyPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RealEstateLeadEvent RealEstateLeadEvent_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."RealEstateLeadEvent"
    ADD CONSTRAINT "RealEstateLeadEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."RealEstateLead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RealEstateLead RealEstateLead_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."RealEstateLead"
    ADD CONSTRAINT "RealEstateLead_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Sale Sale_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."Campaign"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Sale Sale_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."EcommerceLead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SavedSearch SavedSearch_searchJobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."SavedSearch"
    ADD CONSTRAINT "SavedSearch_searchJobId_fkey" FOREIGN KEY ("searchJobId") REFERENCES public."SearchJob"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserProfile UserProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: allinone_user
--

ALTER TABLE ONLY public."UserProfile"
    ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: allinone_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict fRMs56ccEk6TEUF7D8EccRKygPw6bGkhgIcP3uovkKDbmK3iSbnlJNILJpEFaLH

