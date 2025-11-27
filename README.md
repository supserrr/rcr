# Rwanda Cancer Relief Monorepo

This repository hosts the Rwanda Cancer Relief product suite. The project uses a Supabase-first architecture and deploys the customer-facing experience to Vercel. Turbo and pnpm coordinate tasks across applications and shared packages.

## Table of Contents
- [Overview](#overview)
- [Repository Layout](#repository-layout)
- [Key Technologies](#key-technologies)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Development Workflow](#development-workflow)
- [Quality and Testing](#quality-and-testing)
- [Supabase Operations](#supabase-operations)
- [Dashboard Data Tooling](#dashboard-data-tooling)
- [Documentation](#documentation)
- [Deployment](#deployment)
- [Support](#support)

## Overview
The product delivers a secure onboarding and care-management workflow for patients, counselors, and administrators. Authentication, data storage, role-based access control, and analytics run entirely on Supabase. The web application is a Next.js 16 App Router project using Cache Components and a shared design system.

## Repository Layout
| Path | Description |
| --- | --- |
| `apps/web` | Next.js 16 application that powers the public site and authenticated dashboards |
| `packages/ui` | Shared component library built on shadcn/ui and Radix primitives |
| `packages/eslint-config` | Centralized ESLint configurations for the monorepo |
| `packages/typescript-config` | Shared TypeScript base configurations |
| `scripts/` | Operational scripts (seeding, data validation, utilities) |
| `supabase/` | Database migrations, Edge Functions, and configuration |
| `docs/` | Current documentation set |
| `docs/legacy/backend/` | Archived REST backend documentation kept for reference |

## Key Technologies
- Next.js 16 with App Router, Cache Components, and Turbopack
- React 19 with TypeScript 5.7
- Supabase (Auth, Database, Storage, Edge Functions, Realtime)
- pnpm 8+ with workspaces and Turbo 2 for task orchestration
- Tailwind CSS 4 and shadcn/ui component patterns
- AI Gateway integrations via Vercel AI SDK and ElevenLabs components

## Prerequisites
- Node.js 20.x (match the engine in `package.json`)
- pnpm 8.x or newer (`corepack enable` is recommended)
- Supabase CLI (`brew install supabase/tap/supabase` or follow Supabase docs)
- A Supabase project with the required tables, views, and policies
- Vercel account (for deployments and secrets management)

## Environment Setup

### Quick Start

1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Create environment files**
   - Create `apps/web/.env.local`
   - Populate Supabase, Vercel AI Gateway, and analytics keys using the matrix in `docs/deployment/ENV_EXAMPLE.md`
   - For email configuration, see `docs/deployment/RESEND_EMAIL_SETUP.md`
3. **Link Supabase project**
   ```bash
   supabase link --project-ref <your-project-ref>
   ```
4. **Apply database schema**
   ```bash
   cd supabase
   supabase db push
   cd ..
   ```

## Development Workflow
- **Run all apps**
  ```bash
  pnpm dev
  ```
- **Run only the web app**
  ```bash
  pnpm --filter @apps/web dev
  ```
- **Build for production**
  ```bash
  pnpm build
  ```
- **Preview production output locally**
  ```bash
  pnpm --filter @apps/web build
  pnpm --filter @apps/web start
  ```

## Quality and Testing
- **Lint**
  ```bash
  pnpm lint
  ```
- **Type check**
  ```bash
  pnpm --filter @apps/web typecheck
  ```
- **Run integration tests (web)**
  ```bash
  pnpm --filter @apps/web test:integration
  ```
- **Run Turbo pipeline selectively**
  ```bash
  pnpm turbo run lint --filter=@apps/web
  ```

## Supabase Operations
- **Edge Functions**  
  Source of truth lives in `supabase/functions/`. Deploy using:
  ```bash
  supabase functions deploy admin --project-ref <your-project-ref>
  ```
- **Migrations**  
  All migrations reside in `supabase/migrations/`. Generate new migration files with:
  ```bash
  supabase migration new <descriptive_name>
  ```
- **Configure Resend Email (SMTP)**
  Set up Resend for password reset and authentication emails:
  ```bash
  # Option 1: Use the automated script (requires env vars)
  pnpm configure:resend
  
  # Option 2: Manual setup via Supabase Dashboard
  # See docs/deployment/RESEND_EMAIL_SETUP.md for detailed instructions
  ```

Legacy REST API materials remain available for reference in `docs/legacy/backend/`, but they are no longer part of the active architecture.

## Dashboard Data Tooling
- **Seed demo analytics data**
  ```bash
  pnpm --filter @apps/web seed:dashboard
  ```
- **Validate dashboard data integrity**
  ```bash
  pnpm --filter @apps/web test:dashboard-data
  ```
Both scripts connect to Supabase using the environment variables configured in `apps/web/.env.local`.

## Documentation
- Start at the [Documentation Index](docs/INDEX.md)
- Architecture decisions: `docs/architecture/`
- Component usage and design system: `docs/components/`
- Deployment guides: `docs/deployment/`
- Feature documentation: `docs/features/`
- Application-specific guides: `docs/apps/`
- Development practices: `docs/development/`
- Bug fixes and troubleshooting: `docs/fixes/`
- Legacy backend archive: `docs/legacy/backend/`

Follow the writing standards in `docs/README.md` when adding or updating documentation.

## Deployment
- The web application deploys to Vercel. Keep environment variables in sync via the Vercel dashboard or the Vercel CLI.
- Supabase hosts the database, authentication, storage, and Edge Functions. Use the Supabase dashboard or CLI for runtime configuration.
- The `turbo.json` file ensures build pipelines pick up required environment variables (`ASSISTANT_API_KEY`, Supabase auth secrets, etc.).

## Support
- Review open tasks and next steps in `docs/NEXT_STEPS.md`.
- For Supabase or schema issues, consult the migrations and the seed scripts in `supabase/` and `scripts/`.
- For legacy backend questions, rely on `docs/legacy/backend/` to avoid reintroducing deprecated services.
