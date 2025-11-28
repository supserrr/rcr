# Glossary

This document defines terms, acronyms, and concepts used in the Rwanda Cancer Relief project.

## Terms

### Application Terms

**Patient**
A user who receives care and support through the platform.

**Counselor**
A healthcare professional who provides counseling and support to patients.

**Admin**
An administrator with full system access and management capabilities.

**Session**
A scheduled meeting between a patient and counselor, which may include video conferencing.

**Resource**
Educational or informational content available to users (documents, articles, etc.).

### Technical Terms

**App Router**
Next.js 16's routing system using the `app/` directory structure.

**Server Component**
A React component that renders on the server, enabling direct data fetching.

**Client Component**
A React component that renders on the client, marked with `"use client"`.

**Cache Components**
Next.js 16 feature for optimal caching and performance.

**Row Level Security (RLS)**
PostgreSQL feature that restricts data access at the row level based on user context.

**Edge Function**
Serverless function running on Supabase Edge network.

**Realtime**
Supabase feature for real-time database subscriptions and updates.

## Acronyms

### Technology

- **API**: Application Programming Interface
- **CDN**: Content Delivery Network
- **CI/CD**: Continuous Integration/Continuous Deployment
- **E2E**: End-to-End (testing)
- **ESLint**: ECMAScript Linter
- **JaaS**: Jitsi as a Service
- **JWT**: JSON Web Token
- **OAuth**: Open Authorization
- **PII**: Personally Identifiable Information
- **RBAC**: Role-Based Access Control
- **RLS**: Row Level Security
- **REST**: Representational State Transfer
- **SSR**: Server-Side Rendering
- **UI**: User Interface
- **UX**: User Experience

### Project-Specific

- **ADR**: Architecture Decision Record
- **PR**: Pull Request
- **RCR**: Rwanda Cancer Relief

## Concepts

### Architecture

**Monorepo**
A repository containing multiple related projects or packages.

**Workspace**
A package or application within a monorepo.

**Supabase-First Architecture**
Architecture approach where Supabase provides backend services (database, auth, storage).

### Development

**Conventional Commits**
Commit message format following a specification for automated tooling.

**Type Safety**
Using TypeScript to catch errors at compile time.

**Code Review**
Process of reviewing code changes before merging.

### Security

**Authentication**
Verifying user identity.

**Authorization**
Determining what a user can access.

**Encryption**
Converting data into a secure format.

**Session**
User's authenticated state during a visit.

## Domain-Specific

### Healthcare

**HIPAA**
Health Insurance Portability and Accountability Act (considerations for healthcare data).

**PHI**
Protected Health Information.

### Project Features

**Dashboard**
User interface showing personalized information and controls.

**Onboarding**
Process of setting up a new user account and profile.

**Video Conferencing**
Real-time video communication between users.

## Resources

- [Architecture Documentation](ARCHITECTURE.md)
- [Development Guide](DEVELOPMENT.md)
- [Project Structure](PROJECT_STRUCTURE.md)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

