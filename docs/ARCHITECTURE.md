# System Architecture

This document provides an overview of the Rwanda Cancer Relief system architecture.

## Overview

Rwanda Cancer Relief is a healthcare management platform built with a modern, scalable architecture. The system uses a Supabase-first approach with a Next.js frontend.

## Architecture Principles

- **Supabase-First**: Backend services provided by Supabase
- **Server Components**: Leverage Next.js Server Components for performance
- **Type Safety**: Full TypeScript coverage
- **Security**: Row Level Security (RLS) for data access
- **Scalability**: Designed for growth

## System Components

### Frontend

**Next.js 16 Application**
- App Router with Server and Client Components
- Cache Components for optimal performance
- Server-side rendering and static generation
- API routes for server-side operations

**Key Technologies**:
- React 19
- TypeScript 5.7
- Tailwind CSS 4
- shadcn/ui components

### Backend Services

**Supabase Platform**
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with Google OAuth
- **Storage**: File storage for documents and images
- **Edge Functions**: Serverless functions for custom logic
- **Realtime**: Real-time subscriptions for live updates

### Deployment

- **Frontend**: Vercel
- **Backend**: Supabase Cloud
- **CDN**: Vercel Edge Network

## Data Flow

### Authentication Flow

1. User signs in via Supabase Auth
2. Session token stored in secure cookie
3. Server Components verify session
4. RLS policies enforce data access

### Data Fetching Flow

1. Server Component requests data
2. Supabase client queries database
3. RLS policies filter results
4. Data returned to component
5. Component renders with data

### Real-time Updates

1. Client subscribes to Supabase Realtime
2. Database changes trigger events
3. Client receives updates
4. UI updates automatically

## Architecture Patterns

### Monorepo Structure

```
rwanda-cancer-relief/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   ├── ui/               # Shared components
│   ├── eslint-config/    # Linting configs
│   └── typescript-config/# TypeScript configs
└── supabase/             # Database and functions
```

### Component Architecture

- **Server Components**: Default, for data fetching
- **Client Components**: Marked with "use client"
- **Shared Components**: From `@workspace/ui` package

### API Architecture

- **Server Actions**: For mutations
- **API Routes**: For custom endpoints
- **Supabase Client**: Direct database access

## Security Architecture

### Authentication

- Supabase Auth handles authentication
- Google OAuth for social login
- Secure session management
- Role-based access control

### Authorization

- Row Level Security (RLS) policies
- Role-based permissions
- Server-side verification
- Client-side UI restrictions

### Data Protection

- Encrypted data in transit (HTTPS)
- Encrypted data at rest
- Secure file storage
- Environment variable protection

## Scalability

### Frontend Scaling

- Vercel Edge Network
- Static generation where possible
- Efficient caching strategies
- Code splitting

### Backend Scaling

- Supabase managed scaling
- Database connection pooling
- Edge Functions for serverless compute
- CDN for static assets

## Monitoring and Observability

### Logging

- Application logs
- Error tracking
- Performance monitoring
- User analytics

### Metrics

- Response times
- Error rates
- Database performance
- User activity

## Technology Stack

### Frontend

- Next.js 16
- React 19
- TypeScript 5.7
- Tailwind CSS 4
- shadcn/ui

### Backend

- Supabase (PostgreSQL, Auth, Storage)
- Edge Functions
- Realtime subscriptions

### Development

- pnpm workspaces
- Turbo for task orchestration
- ESLint for linting
- Prettier for formatting

## Architecture Decision Records

See [Architecture Decision Records](architecture/ADRs/README.md) for detailed decisions and rationale.

## Diagrams

### System Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Vercel    │
│  (Next.js)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │
│  (Backend)  │
└─────────────┘
```

### Authentication Flow

```
User → Next.js → Supabase Auth → Database
                ↓
            Session Token
                ↓
            Secure Cookie
```

## Resources

- [Architecture Decision Records](architecture/ADRs/README.md)
- [Project Structure](PROJECT_STRUCTURE.md)
- [Development Guide](DEVELOPMENT.md)
- [Deployment Guide](deployment/VERCEL_DEPLOYMENT.md)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

