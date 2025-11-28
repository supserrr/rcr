# Documentation Index

Welcome to the Rwanda Cancer Relief project documentation. This index provides a comprehensive overview of all available documentation organized by category.

## Documentation Structure

```
docs/
├── INDEX.md                    # This file - documentation index
├── README.md                   # Main documentation overview
├── architecture/               # System architecture and design decisions
├── components/                 # UI component documentation
├── development/                # Development guides and best practices
├── deployment/                 # Deployment and environment setup guides
├── features/                   # Feature-specific documentation
├── fixes/                      # Bug fix summaries and troubleshooting
├── apps/                       # Application-specific documentation
└── legacy/                     # Archived documentation for reference
```

## Architecture Documentation

Located in `docs/architecture/`:

- **[Frontend Restructure Summary](architecture/FRONTEND_RESTRUCTURE_SUMMARY.md)** - Complete overview of the frontend restructuring with authentication system
- **[Reorganization Summary](architecture/REORGANIZATION_SUMMARY.md)** - Summary of the monorepo reorganization from shared/frontend to apps/packages structure
- **[Restructure Summary](architecture/RESTRUCTURE_SUMMARY.md)** - Final restructure summary moving to frontend/backend/shared structure

## Component Documentation

Located in `docs/components/`:

### Integration Guides
- **[CTA Integration](components/integration/CTA_INTEGRATION.md)** - Call to Action component
- **[FAQ Section Integration](components/integration/FAQ_SECTION_INTEGRATION.md)** - FAQ accordion component
- **[Features Grid Integration](components/integration/FEATURES_GRID_INTEGRATION.md)** - Feature grid layout
- **[Feature Spotlight Integration](components/integration/FEATURE_SPOTLIGHT_INTEGRATION.md)** - Animated feature highlights
- **[Footer Integration](components/integration/FOOTER_INTEGRATION.md)** - Footer component
- **[Parallax Scroll Integration](components/integration/PARALLAX_SCROLL_INTEGRATION.md)** - Parallax scrolling effects
- **[SVG Scroll Integration](components/integration/SVG_SCROLL_INTEGRATION.md)** - Animated SVG paths

### Quick Start Guides
- **[Quick Start](components/guides/QUICK_START.md)** - General project quick start
- **[CTA Quick Start](components/guides/CTA_QUICK_START.md)** - Call to Action quick setup
- **[FAQ Section Quick Start](components/guides/FAQ_SECTION_QUICK_START.md)** - FAQ quick setup
- **[Features Grid Quick Start](components/guides/FEATURES_GRID_QUICK_START.md)** - Features grid quick setup
- **[Footer Quick Start](components/guides/FOOTER_QUICK_START.md)** - Footer quick setup
- **[Parallax Quick Start](components/guides/PARALLAX_QUICK_START.md)** - Parallax quick setup
- **[SVG Scroll Quick Start](components/guides/SVG_SCROLL_QUICK_START.md)** - SVG animation quick setup

### Component Overviews
- **[All Components Overview](components/overview/ALL_COMPONENTS_OVERVIEW.md)** - Complete component catalog
- **[Complete Integration Summary](components/overview/COMPLETE_INTEGRATION_SUMMARY.md)** - Full integration details
- **[Integration Summary](components/overview/INTEGRATION_SUMMARY.md)** - Component integration overview

### Setup Documentation
- **[Component Library README](components/COMPONENT_LIBRARY_README.md)** - Component library setup guide

## Application Documentation

Located in `docs/apps/`:

- **[Web App Building Guide](apps/BUILDING_GUIDE.md)** - Building and development guide for the main web application
- **[Web App Landing Page](apps/LANDING_PAGE.md)** - Landing page documentation and features

## Development Documentation

Located in `docs/development/`:

- **[Consistency Fixes](development/CONSISTENCY_FIXES.md)** - Code consistency improvements
- **[Demo Removal Summary](development/DEMO_REMOVAL_SUMMARY.md)** - Cleanup of demo content
- **[Frontend Architecture Study](development/FRONTEND_ARCHITECTURE_STUDY.md)** - Architecture analysis

## Deployment Documentation

Located in `docs/deployment/`:

- **[Environment Variables Example](deployment/ENV_EXAMPLE.md)** - Complete environment variable reference
- **[Google OAuth Setup](deployment/GOOGLE_OAUTH_SETUP.md)** - Google OAuth configuration guide
- **[Jitsi Production Deployment](deployment/JITSI_PRODUCTION.md)** - Jitsi production setup
- **[Resend Email Setup](deployment/RESEND_EMAIL_SETUP.md)** - Email configuration
- **[Resend Quick Setup](deployment/RESEND_QUICK_SETUP.md)** - Quick email setup guide
- **[Supabase Redirect URLs](deployment/SUPABASE_REDIRECT_URLS.md)** - URL configuration
- **[Supabase Storage Limits](deployment/SUPABASE_STORAGE_LIMITS.md)** - Storage information
- **[Vercel Deployment](deployment/VERCEL_DEPLOYMENT.md)** - Vercel deployment guide
- **[Vercel Deployment Summary](deployment/VERCEL_DEPLOYMENT_SUMMARY.md)** - Deployment overview

## Features Documentation

Located in `docs/features/`:

### Jitsi Video Conferencing

- **[Jitsi Integration Overview](features/JITSI_INTEGRATION.md)** - Complete Jitsi integration guide
- **[Jitsi Setup Guide](features/jitsi/SETUP.md)** - Basic configuration and setup
- **[Jitsi Keys Setup](features/jitsi/KEYS_SETUP.md)** - JaaS keys configuration
- **[Jitsi Testing Guide](features/jitsi/TESTING.md)** - Testing instructions

## Fixes Documentation

Located in `docs/fixes/`:

- **[Session Card Patient Details Fix](fixes/SESSION_CARD_PATIENT_DETAILS_FIX.md)** - Patient details display fix
- **[Supabase Query Error Troubleshooting](fixes/SUPABASE_QUERY_ERROR_TROUBLESHOOTING.md)** - Query error solutions
- **[Testing Session Card Fixes](fixes/TESTING_SESSION_CARD_FIXES.md)** - Testing guide for fixes

## Quick Navigation

### For New Developers
1. Start with [Main README](README.md) for project overview
2. Read [Architecture Documentation](architecture/) to understand the system
3. Follow [Component Quick Start](components/guides/QUICK_START.md) for setup
4. Check [App Building Guides](apps/) for specific applications

### For Component Development
1. Review [All Components Overview](components/overview/ALL_COMPONENTS_OVERVIEW.md)
2. Check [Integration Guides](components/integration/) for specific components
3. Follow [Quick Start Guides](components/guides/) for rapid setup
4. Reference [Component Library README](components/COMPONENT_LIBRARY_README.md)

### For System Understanding
1. Read [Restructure Summary](architecture/RESTRUCTURE_SUMMARY.md) for current structure
2. Review [Frontend Restructure](architecture/FRONTEND_RESTRUCTURE_SUMMARY.md) for authentication system
3. Check [Reorganization Summary](architecture/REORGANIZATION_SUMMARY.md) for historical context

## Documentation Statistics

- **Total Documentation Files**: 40+
- **Architecture Documents**: 3
- **Component Integration Guides**: 7
- **Quick Start Guides**: 7
- **Component Overviews**: 3
- **Application Guides**: 2
- **Deployment Guides**: 9
- **Feature Documentation**: 4
- **Fix Documentation**: 3

## Documentation Maintenance

This documentation is actively maintained and updated with each major change to the project. When making significant changes:

1. Update relevant documentation files
2. Update this index if new categories are added
3. Update the main README.md if structure changes
4. Follow conventional commit format for documentation changes

## Contributing to Documentation

When adding or updating documentation:

1. Follow the established structure and naming conventions
2. Use clear, concise language following Google's Technical Writing Style Guide
3. Include code examples where appropriate
4. Update this index when adding new documentation
5. Test all links and examples before committing

---

**Last Updated**: January 2025  
**Total Documentation Files**: 25+  
**Documentation Categories**: 5  
**Maintained By**: Development Team