# Project Structure

This document provides a detailed overview of the Rwanda Cancer Relief project structure.

## Overview

The project is organized as a monorepo using pnpm workspaces and Turbo for task orchestration.

## Root Structure

```
rwanda-cancer-relief/
├── .github/              # GitHub workflows and templates
├── apps/                 # Applications
├── packages/             # Shared packages
├── scripts/              # Operational scripts
├── supabase/             # Database and Edge Functions
├── docs/                 # Documentation
├── .editorconfig         # Editor configuration
├── .gitignore            # Git ignore rules
├── .prettierrc           # Prettier configuration
├── package.json          # Root package.json
├── pnpm-lock.yaml        # Dependency lock file
├── pnpm-workspace.yaml   # Workspace configuration
├── turbo.json            # Turbo configuration
├── tsconfig.json         # Root TypeScript config
└── vitest.config.ts      # Vitest configuration
```

## Applications

### apps/web

Next.js 16 application that powers the public site and authenticated dashboards.

```
apps/web/
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── auth/             # Auth components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # UI primitives
├── hooks/                # React hooks
├── lib/                  # Utilities and helpers
│   ├── api/              # API client code
│   ├── auth.ts           # Auth utilities
│   └── utils/            # Utility functions
├── public/               # Static assets
├── src/                  # Source files
│   └── env.ts            # Environment validation
├── .env.local            # Environment variables (not committed)
├── components.json       # shadcn/ui config
├── next.config.mjs       # Next.js configuration
├── package.json          # App dependencies
└── tsconfig.json         # TypeScript config
```

## Packages

### packages/ui

Shared component library built on shadcn/ui and Radix primitives.

```
packages/ui/
├── src/
│   ├── components/       # UI components
│   ├── hooks/            # Shared hooks
│   ├── lib/              # Utilities
│   └── styles/          # Global styles
├── components.json       # shadcn/ui config
├── package.json          # Package dependencies
└── tsconfig.json         # TypeScript config
```

### packages/eslint-config

Centralized ESLint configurations for the monorepo.

```
packages/eslint-config/
├── base.js               # Base ESLint config
├── next.js               # Next.js config
├── react-internal.js     # React internal config
├── package.json          # Package dependencies
└── README.md             # Usage documentation
```

### packages/typescript-config

Shared TypeScript base configurations.

```
packages/typescript-config/
├── base.json             # Base TypeScript config
├── nextjs.json           # Next.js TypeScript config
├── react-library.json    # React library config
├── package.json          # Package dependencies
└── README.md             # Usage documentation
```

## Scripts

### scripts/

Operational scripts for seeding, testing, and utilities.

```
scripts/
├── backfill-counselor-avatars.ts
├── backfill-counselor-profile-structure.ts
├── configure-resend-smtp.ts
├── seed-dashboard-data.ts
└── test-dashboard-data.ts
```

## Supabase

### supabase/

Database migrations, Edge Functions, and configuration.

```
supabase/
├── functions/            # Edge Functions
└── migrations/           # Database migrations
    └── *.sql             # Migration files
```

## Documentation

### docs/

Project documentation organized by category.

```
docs/
├── architecture/         # Architecture documentation
│   └── ADRs/             # Architecture Decision Records
├── api/                  # API documentation
├── apps/                 # Application-specific docs
├── components/           # Component documentation
├── deployment/           # Deployment guides
├── development/         # Development guides
├── features/             # Feature documentation
├── fixes/                # Bug fix documentation
├── operations/           # Operations documentation
├── security/             # Security documentation
├── testing/              # Testing documentation
└── HANDOVER/             # Handover documentation
```

## Configuration Files

### Root Configuration

- `.editorconfig`: Editor configuration
- `.gitignore`: Git ignore rules
- `.prettierrc`: Prettier formatting
- `package.json`: Root dependencies and scripts
- `pnpm-workspace.yaml`: Workspace configuration
- `turbo.json`: Turbo task configuration
- `tsconfig.json`: Root TypeScript config
- `vitest.config.ts`: Test configuration

### Application Configuration

- `apps/web/next.config.mjs`: Next.js configuration
- `apps/web/tsconfig.json`: App TypeScript config
- `apps/web/components.json`: shadcn/ui configuration

## Key Directories

### Source Code

- `apps/web/app/`: Next.js App Router pages and routes
- `apps/web/components/`: React components
- `apps/web/lib/`: Utilities and API code
- `packages/ui/src/`: Shared UI components

### Configuration

- `supabase/migrations/`: Database schema
- `.github/workflows/`: CI/CD workflows
- `docs/`: All documentation

### Build Output

- `apps/web/.next/`: Next.js build output
- `apps/web/dist/`: Distribution files (if any)
- `.turbo/`: Turbo cache

## File Naming Conventions

See [File Naming Guide](development/FILE_NAMING.md) for detailed conventions.

## Workspace Configuration

The project uses pnpm workspaces defined in `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## Resources

- [Architecture Overview](ARCHITECTURE.md)
- [Development Guide](DEVELOPMENT.md)
- [File Naming Guide](development/FILE_NAMING.md)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

