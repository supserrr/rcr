# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Error handling and retry logic in AdminApi
- Chat functionality enhancements with notifications and improved message handling
- Message editing, deletion, and reply features in chat
- Profile view modal for patients and counselors
- Article editing capabilities in AdminResourcesReviewPage
- File upload functionality for training resources
- File size validation for uploads in CounselorResourcesPage and ResourcesApi
- Enhanced patient data fetching and profile management in counselor dashboard
- Enhanced resource management and viewing experience across dashboard pages
- Article editing and external link management in CounselorResourcesPage
- Enhanced resource management in Admin and Counselor pages
- Enhanced password reset flow in ResetPasswordPage component
- Article creation and editing features in CounselorResourcesPage
- Enhanced counselor profile mapping and availability handling
- Enhanced counselor profile data and session statistics
- Enhanced counselor profile and avatar handling
- Enhanced resource management and session handling in dashboard components
- CI/CD workflows for automated testing and deployment
- Testing infrastructure with Vitest and Playwright
- Comprehensive documentation for handover
- Security policies and guidelines
- Code style and development standards
- Architecture Decision Records structure
- Onboarding documentation
- Code review guidelines

### Changed
- Streamlined project documentation and improved clarity
- Updated project documentation and licensing details
- Removed pnpm version specification in CI and workflow files
- Updated .editorconfig and package.json for improved project structure and documentation
- Updated resource status handling in admin review page
- Enhanced onboarding completion check and updated UI components
- Updated counselor visibility logic and import path
- Updated .gitignore and removed obsolete files
- Updated image sources in landing, sign-in, and sign-up pages
- Updated dependencies and improved project configuration
- Streamlined admin training resources and counselor session management
- Streamlined counselor and resource management in admin dashboard
- Updated AI chat functionality and cleaned up unused components
- Enhanced message handling in chat components
- Improved notification handling in ChatApi.sendMessage
- Updated file upload path structure and enhanced error handling in ResourcesApi
- Enhanced project documentation structure
- Improved code organization standards

### Fixed
- Prevented duplicate professional titles in counselor display names
- Prevented duplicate professional titles in patient display names
- Improved message handling in chat components
- Improved error handling and diagnostics in session detail page
- Updated session detail page to use optimized profile queries
- Ensured patient details load correctly in session cards
- Updated import path in next-env.d.ts and enhanced range handling in CounselorResourcesPage
- Renamed variable for clarity in ResetPasswordPage component
- Updated import path in next-env.d.ts for production compatibility
- Updated import path and improved error handling in ResourcesApi
- Updated resource edit modal and counselor page functionality
- Ensured counselor profile existence before document upload

### Removed
- Removed CONTRIBUTING.md from the repository
- Removed obsolete files

### Documentation
- Added Supabase query error troubleshooting guide
- Added comprehensive documentation for patient details loading fix

## [0.0.1] - 2025-01-01

### Added
- Initial project setup
- Next.js 16 application
- Supabase integration
- Authentication system
- Dashboard functionality
- Session management
- Video conferencing integration
- Resource management
- AI chat features

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

