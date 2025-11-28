# Developer Onboarding Guide

This guide helps new developers get started with the Rwanda Cancer Relief project quickly and effectively.

## Table of Contents

- [Welcome](#welcome)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Key Concepts](#key-concepts)
- [Common Tasks](#common-tasks)
- [Getting Help](#getting-help)

## Welcome

Welcome to the Rwanda Cancer Relief project. This guide will help you set up your development environment and understand the project structure.

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

- **Node.js**: Version 20.x or higher
  - Check version: `node --version`
  - Download: https://nodejs.org/

- **pnpm**: Version 8.x or newer
  - Install: `npm install -g pnpm` or `corepack enable`
  - Check version: `pnpm --version`

- **Git**: Latest version
  - Check version: `git --version`
  - Download: https://git-scm.com/

- **Supabase CLI**: For database operations
  - Install: `brew install supabase/tap/supabase` (macOS) or see [Supabase Docs](https://supabase.com/docs/guides/cli)
  - Check version: `supabase --version`

### Recommended Tools

- **VS Code**: Code editor with recommended extensions
- **GitHub CLI**: For repository operations
- **Docker**: For local Supabase (optional)

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rwanda-cancer-relief
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs dependencies for all apps and packages in the monorepo.

### 3. Set Up Environment Variables

Create the environment file:

```bash
cp docs/deployment/ENV_EXAMPLE.md apps/web/.env.local
```

Edit `apps/web/.env.local` and add your credentials. See [Environment Setup Guide](HANDOVER/ENVIRONMENT_SETUP.md) for details.

**Required Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ASSISTANT_API_KEY`

### 4. Link Supabase Project

```bash
supabase link --project-ref <your-project-ref>
```

If you don't have a project reference, ask your team lead for access.

### 5. Apply Database Migrations

```bash
cd supabase
supabase db push
cd ..
```

### 6. Start Development Server

```bash
pnpm dev
```

The application will be available at http://localhost:3000

### 7. Verify Setup

- [ ] Application loads at http://localhost:3000
- [ ] No console errors
- [ ] Can sign up/sign in
- [ ] Database queries work

## Development Workflow

### Daily Workflow

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and test locally**
   ```bash
   pnpm dev
   ```

4. **Run quality checks**
   ```bash
   pnpm lint
   pnpm --filter @apps/web typecheck
   ```

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat(scope): your commit message"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Quality

Before committing, ensure:

- [ ] Code passes linting: `pnpm lint`
- [ ] Type checking passes: `pnpm --filter @apps/web typecheck`
- [ ] No console errors
- [ ] Follows [code style guide](development/CODE_STYLE.md)
- [ ] Uses [conventional commits](development/COMMIT_STANDARDS.md)

### Testing

When tests are implemented:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test path/to/test.ts
```

See [Testing Documentation](testing/README.md) for details.

## Project Structure

### Monorepo Layout

```
rwanda-cancer-relief/
├── apps/
│   └── web/              # Next.js 16 application
│       ├── app/          # App Router pages and routes
│       ├── components/   # Application components
│       ├── hooks/        # React hooks
│       ├── lib/          # Utilities and helpers
│       └── public/       # Static assets
├── packages/
│   ├── ui/               # Shared component library
│   ├── eslint-config/    # ESLint configurations
│   └── typescript-config/# TypeScript configurations
├── scripts/              # Operational scripts
├── supabase/             # Database migrations and Edge Functions
└── docs/                 # Project documentation
```

### Key Directories

**`apps/web/app/`**: Next.js App Router pages
- `page.tsx`: Route pages
- `layout.tsx`: Route layouts
- `api/`: API routes

**`apps/web/components/`**: React components
- `auth/`: Authentication components
- `dashboard/`: Dashboard components
- `ui/`: UI primitives

**`packages/ui/`**: Shared component library
- Reusable components used across apps
- Built on shadcn/ui and Radix primitives

**`supabase/migrations/`**: Database migrations
- SQL migration files
- Applied in chronological order

See [Project Structure Documentation](PROJECT_STRUCTURE.md) for complete details.

## Key Concepts

### Architecture

The project uses a **Supabase-first architecture**:

- **Frontend**: Next.js 16 with App Router and Cache Components
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Deployment**: Vercel (frontend), Supabase (backend services)

### Authentication

- Supabase Auth handles authentication
- Google OAuth is supported
- Role-based access control (Patient, Counselor, Admin)
- Row Level Security (RLS) enforces data access

### Data Flow

1. Client makes request to Next.js API route or Server Component
2. Server Component/API route uses Supabase client
3. Supabase enforces RLS policies
4. Data is returned to client
5. Client updates UI

### Component Patterns

- **Server Components**: Default, for data fetching
- **Client Components**: Marked with `"use client"`, for interactivity
- **Shared Components**: From `@workspace/ui` package

See [Architecture Documentation](ARCHITECTURE.md) for complete architecture overview.

## Common Tasks

### Adding a New Page

1. Create file in `apps/web/app/your-page/page.tsx`
2. Export default component
3. Add navigation link if needed

### Adding a New Component

1. Create component in `apps/web/components/`
2. Add TypeScript types
3. Add JSDoc comments
4. Export from appropriate location

### Adding a Database Migration

1. Create migration: `supabase migration new migration_name`
2. Write SQL in generated file
3. Test locally: `supabase db push`
4. Commit migration file

### Updating Dependencies

```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update package-name

# Check outdated packages
pnpm outdated
```

### Running Scripts

```bash
# Seed dashboard data
pnpm seed:dashboard

# Test dashboard data
pnpm test:dashboard-data

# Configure Resend email
pnpm configure:resend
```

## Getting Help

### Documentation

1. **Start here**: [Main README](../README.md)
2. **Architecture**: [Architecture Guide](ARCHITECTURE.md)
3. **Development**: [Development Guide](DEVELOPMENT.md)
4. **Components**: [Component Documentation](components/README.md)
5. **Deployment**: [Deployment Guides](deployment/)

### Asking Questions

1. **Check documentation** first
2. **Search existing issues** on GitHub
3. **Ask in team chat** (Slack/Discord/Teams)
4. **Create GitHub issue** for bugs or feature requests
5. **Contact team lead** for urgent issues

### Code Review

- All code changes require review
- See [Code Review Guidelines](CODE_REVIEW.md)
- Create PR with clear description
- Address review feedback promptly

## Next Steps

After completing setup:

1. **Read Architecture Documentation**: Understand system design
2. **Review Code Style Guide**: Learn coding standards
3. **Explore Codebase**: Familiarize with structure
4. **Pick a Small Task**: Start with a simple issue
5. **Ask Questions**: Don't hesitate to ask for help

## Resources

### Internal

- [Project Structure](PROJECT_STRUCTURE.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Development Guide](DEVELOPMENT.md)
- [Code Style Guide](development/CODE_STYLE.md)
- [Testing Guide](testing/README.md)

### External

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Welcome to the team!** If you have any questions, don't hesitate to ask.

**Last Updated**: [Date]
**Maintained By**: Development Team
