# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a Turborepo monorepo with the following common commands:

**Development:**
- `npm run dev` - Start all apps in development mode (uses Turbo parallel execution)
- `npm run build` - Build all applications
- `npm run lint` - Run linting across all packages
- `npm run format` - Format code with Prettier

**Database:**
- `npm run prisma:generate` - Generate Prisma client (schema located at `packages/server/db/prisma/schema.prisma`)
- Database migrations should be run from the schema location directory

**API-specific (apps/api):**
- `npm run start:dev` - Start API with hot reload (NestJS)
- `npm run start:minimal` - Start minimal API server
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

**Web-specific (apps/web):**
- Next.js 14 with App Router
- Uses TypeScript and Tailwind CSS
- Deployment ready with `next build`

## Architecture

This is a full-stack monorepo structured as:

```
apps/
├── api/        # NestJS API server
├── web/        # Next.js frontend
└── infra/      # Terraform infrastructure

packages/
└── server/     # Shared server utilities and database schema
```

### Database Architecture

The application uses PostgreSQL with Prisma ORM. The schema (`packages/server/db/prisma/schema.prisma`) defines a multi-vertical platform supporting:

**Core System:**
- User authentication and organizations with role-based membership
- Multi-tenant architecture using `ownerUid` pattern

**Business Verticals:**
1. **Real Estate**: Property management, leads, import/export, AI-powered search
2. **E-commerce**: Lead management, campaign attribution, auto-followups
3. **Law**: (Future vertical, structure in place)

**Key Models:**
- `User` + `Organization` + `Membership` for multi-tenant auth
- `Property` + `RealEstateLead` for real estate vertical
- `EcommerceLead` + `Campaign` + `AutoFollowupTemplate` for e-commerce
- `SearchJob` + `Listing` for AI property search functionality

### API Structure

NestJS API with modular architecture:
- `src/modules/auth/` - Authentication and user management
- `src/modules/real-estate-*` - Real estate features (properties, leads)
- `src/modules/campaigns/` - Campaign management
- Firebase integration for authentication
- AWS S3 integration for file storage

### Frontend Structure

Next.js 14 with App Router:
- `/real-estate/` - Real estate dashboard and tools
- `/e-commerce/` - E-commerce lead management
- `/law/` - Law vertical (placeholder)
- API routes in `app/webapi/` for internal endpoints
- Shared components in `components/`

### Key Integrations

- **Firebase**: Authentication and real-time features  
- **AWS S3**: File storage and uploads
- **Prisma**: Database ORM with PostgreSQL
- **OpenAI**: AI features for property search and lead processing
- **Multi-platform OAuth**: Meta, Google, TikTok, LinkedIn campaign integrations

### Development Notes

- Prisma client is generated to root `node_modules` for monorepo sharing
- Uses workspaces for dependency management
- Turborepo for build orchestration and caching
- TypeScript throughout with strict configuration
- Authentication uses Firebase Admin SDK in API, Firebase client in web app