# Repository Handover Guide

This document provides comprehensive information for teams taking over the Rwanda Cancer Relief project. It covers project overview, architecture, access requirements, and operational procedures.

## Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Access and Credentials](#access-and-credentials)
- [Architecture Overview](#architecture-overview)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Key Contacts](#key-contacts)
- [Known Issues](#known-issues)
- [Next Steps](#next-steps)

## Project Overview

Rwanda Cancer Relief is a healthcare management platform that provides secure onboarding and care-management workflows for patients, counselors, and administrators. The system uses a Supabase-first architecture with a Next.js 16 frontend deployed to Vercel.

### Key Features

- Patient onboarding and profile management
- Counselor directory and matching
- Secure video conferencing via Jitsi Meet
- Real-time chat and messaging
- AI-powered assistance
- Role-based dashboards (Patient, Counselor, Admin)
- Session booking and management
- Resource library and management
- Analytics and reporting

### Technology Stack

- **Frontend**: Next.js 16 (App Router, Cache Components), React 19, TypeScript 5.7
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions, Realtime)
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Build Tools**: pnpm workspaces, Turbo 2
- **Deployment**: Vercel (frontend), Supabase (backend services)
- **AI Integration**: Vercel AI SDK, ElevenLabs

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or newer (enable with `corepack enable`)
- Supabase CLI (`brew install supabase/tap/supabase`)
- Git

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rwanda-cancer-relief
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   - Copy `docs/deployment/ENV_EXAMPLE.md` as reference
   - Create `apps/web/.env.local` with required variables
   - See [Environment Setup](HANDOVER/ENVIRONMENT_SETUP.md) for details

4. **Link Supabase project**
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

5. **Apply database migrations**
   ```bash
   cd supabase
   supabase db push
   cd ..
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000

For detailed setup instructions, see [Environment Setup Guide](HANDOVER/ENVIRONMENT_SETUP.md).

## Access and Credentials

### Required Access

The following access credentials are required to operate this project:

- **Supabase Project**: Database, authentication, storage, and Edge Functions
- **Vercel Account**: Frontend deployment and environment variables
- **GitHub Repository**: Source code and CI/CD workflows
- **Domain/DNS**: Production domain configuration (if applicable)
- **Third-party Services**:
  - Vercel AI Gateway (for AI features)
  - ElevenLabs (for voice features)
  - Resend (for email services)
  - Jitsi JaaS (for video conferencing)

### Credential Management

All sensitive credentials are stored in:

- **Local Development**: `apps/web/.env.local` (not committed to git)
- **Vercel**: Environment variables in Vercel dashboard
- **Supabase**: Project settings in Supabase dashboard

**Important**: Never commit `.env.local` files or expose credentials in code.

See [Environment Setup Guide](HANDOVER/ENVIRONMENT_SETUP.md) for complete credential requirements.

## Architecture Overview

### Monorepo Structure

```
rwanda-cancer-relief/
├── apps/
│   └── web/              # Next.js 16 application
├── packages/
│   ├── ui/               # Shared component library
│   ├── eslint-config/    # ESLint configurations
│   └── typescript-config/# TypeScript configurations
├── scripts/              # Operational scripts
├── supabase/             # Database migrations and Edge Functions
└── docs/                 # Project documentation
```

### System Architecture

The application follows a Supabase-first architecture:

- **Frontend**: Next.js application with Server Components and Client Components
- **Authentication**: Supabase Auth with Google OAuth support
- **Database**: PostgreSQL via Supabase with Row Level Security (RLS)
- **Storage**: Supabase Storage for file uploads
- **Real-time**: Supabase Realtime for live updates
- **Edge Functions**: Supabase Edge Functions for serverless operations
- **Deployment**: Vercel for frontend, Supabase for backend services

### Key Components

- **Authentication System**: Role-based access control (Patient, Counselor, Admin)
- **Dashboard System**: Separate dashboards for each user role
- **Session Management**: Booking, scheduling, and video call integration
- **Chat System**: Real-time messaging with Socket.IO
- **AI Integration**: Vercel AI SDK for conversational features
- **Resource Management**: Document and resource library

For detailed architecture information, see [Architecture Documentation](../ARCHITECTURE.md) and [Architecture Decision Records](../architecture/ADRs/README.md).

## Development Workflow

### Code Standards

- Follow [Code Style Guide](../development/CODE_STYLE.md)
- Use [Conventional Commits](../development/COMMIT_STANDARDS.md)
- Follow [File Naming Conventions](../development/FILE_NAMING.md)
- Read [Code Review Guidelines](../CODE_REVIEW.md)

### Development Commands

```bash
# Start development server
pnpm dev

# Run linting
pnpm lint

# Type checking
pnpm --filter @apps/web typecheck

# Build for production
pnpm build

# Run tests (when implemented)
pnpm test
```

### Git Workflow

1. Create feature branch from `main`
2. Make changes following code standards
3. Commit using conventional commit format
4. Push and create pull request
5. Code review required before merge
6. Merge to `main` after approval

See [Development Guide](../DEVELOPMENT.md) for complete workflow details.

## Deployment

### Frontend Deployment (Vercel)

The frontend automatically deploys to Vercel on push to `main` branch.

**Manual Deployment**:
1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy via Vercel CLI or dashboard

See [Vercel Deployment Guide](../deployment/VERCEL_DEPLOYMENT.md) for details.

### Backend Services (Supabase)

**Database Migrations**:
```bash
cd supabase
supabase db push --project-ref <project-ref>
```

**Edge Functions**:
```bash
supabase functions deploy <function-name> --project-ref <project-ref>
```

See [Deployment Documentation](../deployment/) for complete deployment guides.

## Key Contacts

For handover, the following contacts should be documented:

- **Technical Lead**: [To be filled]
- **Project Manager**: [To be filled]
- **DevOps/Infrastructure**: [To be filled]
- **Security Contact**: [To be filled]
- **Support Contact**: [To be filled]

See [Contacts Document](HANDOVER/CONTACTS.md) for complete contact information template.

## Known Issues

The following known issues and technical debt items should be addressed:

1. **Testing Infrastructure**: Unit and integration tests need to be implemented
2. **CI/CD**: GitHub Actions workflows need to be configured
3. **Monitoring**: Production monitoring and alerting need to be set up
4. **Documentation**: Some areas need additional documentation
5. **Backend Directory**: Empty `backend/` directory needs clarification or removal

See [Known Issues Document](HANDOVER/KNOWN_ISSUES.md) for complete list and prioritization.

## Next Steps

After handover, the following steps are recommended:

1. **Review Documentation**: Read all documentation in `docs/`
2. **Set Up Access**: Obtain all required credentials and access
3. **Run Local Setup**: Complete local development environment setup
4. **Review Codebase**: Familiarize with code structure and patterns
5. **Address Known Issues**: Prioritize and address known issues
6. **Set Up Monitoring**: Implement production monitoring
7. **Plan Improvements**: Identify and plan technical improvements

See [Handover Checklist](HANDOVER/CHECKLIST.md) for complete handover verification.

## Additional Resources

- [Onboarding Guide](../ONBOARDING.md) - New developer onboarding
- [Project Structure](../PROJECT_STRUCTURE.md) - Detailed project structure
- [Architecture Overview](../ARCHITECTURE.md) - System architecture
- [Development Guide](../DEVELOPMENT.md) - Development workflow
- [Maintainers Guide](../MAINTAINERS.md) - Maintainer responsibilities

## Support

For questions or issues during handover:

1. Review relevant documentation in `docs/`
2. Check [Known Issues](HANDOVER/KNOWN_ISSUES.md)
3. Review [Troubleshooting Guides](../fixes/)
4. Contact key personnel listed in [Contacts](HANDOVER/CONTACTS.md)

---

**Last Updated**: [Date]
**Handover Version**: 1.0
**Maintained By**: Development Team
