# Frontend Architecture Study - Rwanda Cancer Relief

## Executive Summary

The Rwanda Cancer Relief frontend is a comprehensive Next.js 15 web application built as a monorepo with Turbo. It provides a role-based cancer counseling platform with video conferencing, AI chat, resource management, and patient/counselor dashboards.

## Technology Stack

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **React**: 19.1.1
- **TypeScript**: 5.9.2
- **Build System**: Turborepo (monorepo)
- **Package Manager**: pnpm 10.4.1
- **Node Version**: >=20

### UI & Styling
- **CSS Framework**: Tailwind CSS 4.1.11
- **Component Library**: shadcn/ui based on Radix UI primitives
- **Animations**: Framer Motion 12.23.24
- **Icons**: Lucide React 0.475.0
- **Theme**: next-themes for light/dark mode support

### Third-Party Integrations
- **Video Conferencing**: Jitsi Meet (@jitsi/react-sdk 1.4.4) via 8x8.vc
- **AI Chat**: Vercel AI SDK 5.0.76 (@ai-sdk/react 2.0.76)
- **Voice AI**: ElevenLabs React SDK 0.8.0
- **Calendar**: FullCalendar 6.1.19
- **Charts**: ApexCharts 5.3.5, Recharts 3.3.0
- **3D Graphics**: Three.js (@react-three/fiber 9.4.0, @react-three/drei 10.7.6)

### Shared Packages
- **@workspace/ui**: Shared component library
- **@workspace/eslint-config**: Shared ESLint configs
- **@workspace/typescript-config**: Shared TypeScript configs

## Monorepo Structure

```
rwanda-cancer-relief/
├── frontend/
│   ├── apps/
│   │   └── web/                    # Main Next.js application
│   │       ├── app/                # Next.js App Router pages
│   │       ├── components/         # App-specific components
│   │       ├── lib/                # Utilities, types, validation
│   │       ├── hooks/              # Custom React hooks
│   │       └── public/             # Static assets
│   └── packages/
│       ├── ui/                     # Shared UI component library
│       ├── eslint-config/          # Shared linting config
│       └── typescript-config/      # Shared TS config
├── backend/                        # Coming soon
├── docs/                           # Comprehensive documentation
└── turbo.json                      # Turborepo configuration
```

## Application Architecture

### 1. Authentication & Authorization

**Auth System**: Custom context-based authentication with mock service layer

**Key Files**:
- `lib/auth.ts` - Auth utilities, types, session management
- `components/auth/AuthProvider.tsx` - React context provider
- `components/providers.tsx` - Root providers wrapper
- `hooks/use-auth.ts` - Custom auth hook
- `middleware.ts` - Route protection middleware

**User Roles**:
- `patient` - Cancer patients seeking support
- `counselor` - Mental health professionals
- `admin` - System administrators
- `guest` - Unauthenticated users

**Permission System**:
```typescript
- patient: [VIEW_DASHBOARD]
- counselor: [VIEW_DASHBOARD, MANAGE_PATIENTS]
- admin: [VIEW_DASHBOARD, MANAGE_PATIENTS, MANAGE_COUNSELORS, VIEW_ANALYTICS, MANAGE_SYSTEM]
```

**Session Management**:
- Uses localStorage for client-side session storage
- Mock JWT token generation
- Automatic redirects based on role
- Protected routes via middleware

### 2. Routing Structure

**Public Routes**:
- `/` - Landing page with scroll animations
- `/about` - About us page
- `/contact` - Contact page
- `/counselors` - Public counselor directory
- `/get-help` - Get help information
- `/signin` - Sign in page
- `/signup` - Sign up page (role selection)
- `/signup/patient` - Patient registration
- `/signup/counselor` - Counselor registration
- `/dashboard-demo` - Dashboard preview
- `/onboarding/*` - User onboarding flows

**Protected Routes** (require authentication):
```
/dashboard/
├── /patient/
│   ├── /page.tsx                   # Main dashboard
│   ├── /counselors/                # Counselor directory
│   ├── /resources/                 # Educational resources
│   ├── /sessions/                  # Session management
│   │   └── /session/[sessionId]/   # Video session room
│   ├── /chat/                      # Messaging
│   ├── /ai-chat/                   # AI assistant
│   └── /settings/                  # Profile settings
├── /counselor/
│   ├── /page.tsx                   # Main dashboard
│   ├── /patients/                  # Patient management
│   ├── /sessions/                  # Session management
│   │   └── /session/[sessionId]/   # Video session room
│   ├── /chat/                      # Messaging
│   ├── /resources/                 # Resource library
│   ├── /training/                  # Training materials
│   ├── /ai-chat/                   # Professional AI assistant
│   └── /settings/                  # Profile settings
└── /admin/
    ├── /page.tsx                   # Admin dashboard
    ├── /users/                     # User management
    ├── /support/                   # Support tickets
    ├── /settings/                  # System settings
    ├── /systems/                   # System monitoring
    ├── /training-resources/        # Training resource management
    ├── /resources-review/          # Resource approval
    └── /approvals/                 # User approvals
```

**Demo Routes**:
- `/demo/ai-chat` - AI chat demo
- `/demo/orb` - ElevenLabs Orb demo
- `/demo/sessions` - Session booking demo
- `/demo/components` - Component showcase
- `/animate-demo` - Animation demos
- `/notification-demo` - Notification demo

### 3. Component Architecture

**Shared UI Package** (`@workspace/ui`):
Located at `packages/ui/src/components/` with 111+ components

**Core Components**:
- **Form Components**: Input, Textarea, Select, Checkbox, Switch, Label
- **Layout Components**: Card, Separator, Tabs, Sidebar, ScrollArea, Sheet
- **Feedback Components**: Dialog, Popover, Tooltip, Alert, Progress, Badge
- **Navigation**: DropdownMenu, Avatar, HoverCard
- **Tables**: Table with sorting/pagination
- **Buttons**: Button with multiple variants
- **Skeletons**: Loading states

**Landing Page Components**:
- `ui/mini-navbar` - Navigation header
- `ui/faqsection` - FAQ accordion
- `ui/footer` - Footer with links
- `ui/feature-spotlight` - Feature highlights
- `ui/call-to-action-1` - CTA sections
- `ui/parallax-scroll-feature-section` - Parallax effects
- `ui/logo-cloud` - Partner logos
- `ui/stats-section` - Statistics display
- `ui/multi-step-form` - Multi-step forms

**Dashboard Components**:
- `layouts/PatientLayout` - Patient-specific layout
- `layouts/CounselorLayout` - Counselor-specific layout
- `layouts/AdminLayout` - Admin-specific layout
- `shared/DashboardSidebar` - Navigation sidebar
- `shared/TopBar` - Top navigation bar
- `shared/AnimatedPageHeader` - Animated headers
- `shared/AnimatedStatCard` - Statistics cards
- `shared/ProfileCard` - User profiles
- `shared/ResourceCard` - Resource display
- `shared/SessionCard` - Session cards

**Session Components**:
- `session/JitsiMeeting` - Video conferencing wrapper
- `session/SessionBookingModal` - Booking flow
- `session/CounselorSelectionModal` - Counselor picker
- `session/ScheduleSessionModal` - Session scheduling
- `session/RescheduleModal` - Session rescheduling
- `session/CancelSessionModal` - Cancellation flow

**Resource Components**:
- `article-viewer` - Article display
- `resource-viewer-modal` - Modal viewer
- `pdf-viewer` - PDF rendering
- `audio-player` - Audio playback
- `video-player` - Video playback

**AI Components**:
- `ai-thread` - Chat thread UI
- `ai-chat-runtime` - AI runtime
- `ai-chat-input` - Input interface
- `assistant-ui/*` - Assistant UI primitives
- `thread` - Message threading
- `threadlist-sidebar` - Thread navigation

**Animation Components**:
- `animate-ui/*` - Animation primitives
- `animated-card` - Animated card
- `animated-grid` - Grid animations
- `animated-stat-card` - Animated stats
- `animated-profile-card` - Animated profiles
- `animated-page-header` - Header animations
- `sparkles` - Particle effects

**Utility Components**:
- `upload` - File upload
- `notification-inbox-popover` - Notifications
- `loading-skeleton` - Loading states
- `quick-booking-modal` - Quick booking
- `profile-view-modal` - Profile viewer
- `landing-style-card` - Landing page cards

### 4. State Management

**Context Providers**:
- `AuthProvider` - Authentication state
- `ThemeProvider` - Theme management (light/dark)
- `Toaster` - Toast notifications (Sonner)

**Hooks**:
- `use-auth` - Authentication hook
- `use-mobile` - Responsive detection
- `use-is-in-view` - Intersection observer

**Data Management**:
- Local state via `useState` for UI state
- Context for global auth state
- Dummy data in `lib/dummy-data/` for development
- localStorage for session persistence

### 5. Styling System

**Theme Configuration** (`packages/ui/src/styles/globals.css`):

**Color Palette** - Cancer Purple Theme:
- Primary: `oklch(0.55 0.18 300)` - Rich cancer purple
- Secondary: `oklch(0.92 0.04 300)` - Light lavender
- Muted: `oklch(0.96 0.02 300)` - Very light purple
- Accent: `oklch(0.70 0.15 280)` - Brighter purple
- Destructive: `oklch(0.577 0.245 27.325)` - Error red

**Font**: Ubuntu (300, 400, 500, 700 weights, normal & italic)

**Design System**:
- CSS Variables for theming
- Dark mode support via next-themes
- Responsive breakpoints (mobile-first)
- Custom animations via Framer Motion
- Consistent spacing system

**Tailwind Configuration**:
- `@tailwindcss/postcss` for PostCSS processing
- Custom utilities in globals.css
- Import paths configured for monorepo

### 6. Video Conferencing

**Jitsi Meet Integration**:
- Component: `components/session/JitsiMeeting.tsx`
- Provider: 8x8.vc (Jitsi as a Service)
- Room naming: `session-{sessionId}`
- Session types: video, audio-only

**Features Enabled**:
- Prejoin page (device checks)
- Noise detection
- Screen sharing
- Chat within call
- Recording (optional)
- Virtual backgrounds
- Closed captions

**Features Disabled**:
- Jitsi watermarks
- Mobile app promotion
- Guest invitations
- Room data storage

**Session Flow**:
1. Pre-session lobby (session info, checklist)
2. Active session (full-screen Jitsi interface)
3. Post-session (completion, notes, feedback)

### 7. AI Chat Integration

**AI SDK**:
- Vercel AI SDK for streaming responses
- Route: `/app/api/chat/route.ts`
- Models: Configurable, defaults to perplexity/sonar for web search

**Features**:
- Streaming responses
- Source citations
- Reasoning display
- Web search integration
- Thread management
- Message attachments

**Components**:
- `ai-thread` - Main chat interface
- `assistant-ui` - UI primitives from @assistant-ui/react
- `markdown-text` - Markdown rendering
- `tool-fallback` - Tool error handling
- `attachment` - File attachments

### 8. Data Types

**Core Types** (`lib/types.ts`):
- `User`, `Patient`, `Counselor`, `Admin` - User entities
- `Session` - Counseling sessions
- `Resource` - Educational materials
- `Message`, `Chat` - Messaging
- `SupportTicket` - Support requests
- `TrainingResource` - Training materials
- `Module` - Learning modules
- `DashboardStats` - Statistics
- `SystemHealth` - System monitoring

**TypeScript Usage**:
- Strict type checking enabled
- Shared types in `@workspace/ui/lib/types`
- Consistent naming conventions
- JSDoc comments for documentation

### 9. API Routes

**Current Routes**:
- `/api/chat` - AI chat streaming endpoint

**Implementation**:
- Next.js API routes (Route Handlers)
- POST method for chat
- Streaming response with maxDuration: 30s
- JSON request/response

**Future Routes** (planned):
- Authentication endpoints
- Session management
- Resource CRUD
- User management
- Analytics

### 10. Build & Development

**Turborepo Configuration** (`turbo.json`):
- `dev` - Persistent, no caching
- `build` - Depends on ^build, outputs .next
- `lint` - Depends on ^lint

**Development Workflow**:
```bash
pnpm dev                    # Start all apps
pnpm build                  # Build all packages
pnpm lint                   # Lint all code
cd apps/web && pnpm dev  # Start web app only
```

**Next.js Configuration**:
- Transpiles `@workspace/ui` package
- App Router enabled
- React Server Components enabled
- TypeScript strict mode

### 11. Testing & Quality

**Linting**:
- ESLint with workspace shared config
- React-specific rules
- Next.js-specific rules
- TypeScript support

**Code Quality**:
- Prettier for formatting
- TypeScript for type safety
- Consistent code organization
- JSDoc documentation

### 12. Performance Optimizations

**Implemented**:
- Code splitting via App Router
- Dynamic imports
- Image optimization (Next.js Image)
- Font optimization (next/font/google)
- CSS inlining
- Tree shaking

**Animation Performance**:
- GPU-accelerated transforms
- Framer Motion optimizations
- Reduced motion support
- LazyMotion for code splitting

### 13. Accessibility

**Features**:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
- Reduced motion support

### 14. Security

**Implementations**:
- Route protection via middleware
- Role-based access control
- Secure session storage
- HTTPS-only in production
- Input validation (planned)

**Current State**:
- Mock authentication (development)
- Client-side session management
- No backend integration yet

### 15. Deployment

**Configuration**:
- Vercel-ready (Next.js App Router)
- Environment variables support
- Static exports supported
- Edge runtime compatible

**Requirements**:
- Node >= 20
- pnpm 10.4.1
- Environment variables for production

## Key Features

### 1. Role-Based Dashboards
Three distinct dashboard experiences tailored for patients, counselors, and administrators.

### 2. Video Conferencing
Secure Jitsi-based video sessions with prejoin checks, audio/video controls, and post-session feedback.

### 3. AI Chat Assistant
24/7 AI support with streaming responses, web search, and thread management.

### 4. Resource Library
Educational materials including articles, videos, PDFs, and audio with dedicated viewers.

### 5. Session Management
Complete booking flow with counselor selection, scheduling, rescheduling, and cancellation.

### 6. Messaging System
Real-time messaging between patients and counselors.

### 7. Learning Modules
Progress-tracking modules for coping strategies and emotional support.

### 8. Responsive Design
Mobile-first design with consistent breakpoints and touch-friendly interfaces.

### 9. Dark Mode
Full theme support with persistent user preference.

### 10. Animation System
Smooth, performant animations using Framer Motion.

## Documentation

**Comprehensive docs in `/docs`**:
- Architecture decisions
- Component integration guides
- Quick start tutorials
- Feature documentation
- API documentation (planned)

## Development Status

**Completed**:
- ✅ Monorepo setup with Turborepo
- ✅ Shared UI component library
- ✅ Landing page with animations
- ✅ Role-based authentication (mock)
- ✅ Three dashboard layouts
- ✅ Video conferencing (Jitsi)
- ✅ AI chat integration
- ✅ Resource viewers
- ✅ Session management flows
- ✅ Responsive design
- ✅ Dark mode
- ✅ Comprehensive documentation

**In Progress**:
- 🔄 Backend API integration
- 🔄 Real authentication system
- 🔄 Database integration
- 🔄 File upload system

**Planned**:
- ⏳ Payment integration
- ⏳ Email notifications
- ⏳ SMS notifications
- ⏳ Multi-language support
- ⏳ Mobile apps
- ⏳ Analytics dashboard
- ⏳ HIPAA compliance

## File Statistics

- **Total Components**: 111+ in UI package
- **App Routes**: 43 page files
- **Shared Utilities**: Multiple helper functions
- **Type Definitions**: Comprehensive TypeScript types
- **Animation Utilities**: Custom animation systems

## Conclusion

The Rwanda Cancer Relief frontend is a well-architected, modern web application that demonstrates best practices in React, Next.js, and monorepo management. The codebase is organized, documented, and ready for backend integration. The application provides a complete user experience for cancer counseling with video conferencing, AI support, and comprehensive resource management.

