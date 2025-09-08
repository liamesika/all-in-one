# MVP Base Monorepo (Next.js + NestJS + Worker + Terraform)

Production‑ready scaffold aimed to scale from MVP → V1.

## Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind
- **API:** NestJS (Node 20)
- **Workers:** Node TS (AWS SQS consumer)
- **DB:** PostgreSQL (Aurora/Cloud SQL), Prisma-ready (schema placeholder)
- **Storage:** S3 (uploads/outputs) + CloudFront
- **Queue:** SQS
- **Auth:** Clerk/Auth0 (placeholders) with Organizations
- **Infra:** Terraform (AWS) – minimal skeleton
- **CI:** GitHub Actions + Turborepo

> This is a scaffold. Install deps and connect cloud resources to go live.
