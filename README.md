# Rwanda Cancer Relief

A monorepo for Rwanda Cancer Relief project containing multiple applications and shared packages.

## Repository Structure

### Frontend

- **frontend/apps/web** - Main public-facing website with cancer services information
- **frontend/packages/ui** - Shared UI component library built with shadcn/ui
- **frontend/packages/eslint-config** - Shared ESLint configurations
- **frontend/packages/typescript-config** - Shared TypeScript configurations

### Backend

- **backend/** - Backend services and API (coming soon)

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Documentation Index](docs/INDEX.md)** - Complete documentation index and navigation
- **[docs/architecture/](docs/architecture/)** - System architecture and design decisions (3 documents)
- **[docs/components/](docs/components/)** - UI component documentation (18 files)
  - **[Integration Guides](docs/components/integration/)** - Component implementation guides (7 guides)
  - **[Quick Start Guides](docs/components/guides/)** - Rapid setup tutorials (7 guides)
  - **[Component Overviews](docs/components/overview/)** - Component catalogs and summaries (3 documents)
  - **[Setup Documentation](docs/components/)** - Component library setup (1 guide)
- **[docs/apps/](docs/apps/)** - Application-specific documentation (4 guides)
- **[docs/development/](docs/development/)** - Development guides and best practices (coming soon)
- **[docs/backend/](docs/backend/)** - Backend documentation (coming soon)

See the **[Documentation README](docs/README.md)** for a complete overview.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run all apps in development mode:

```bash
pnpm dev
```

Run the web app:

```bash
# Web app (runs on http://localhost:3000)
cd frontend/apps/web && pnpm dev
```

Build all apps:

```bash
pnpm build
```

## Demo Pages

The web app includes comprehensive demo pages showcasing various UI components:

### Component Demos
- **Mini Navbar** (`/demo`) - Responsive navigation component
- **Helix Hero** (`/helix-demo`) - 3D hero section
- **Feature Spotlight** (`/feature-spotlight-demo`) - Animated feature highlights
- **Services Demo** (`/services-demo`) - Service cards and layouts
- **Parallax Scroll** (`/parallax-demo`) - Scroll-based animations
- **Features Grid** (`/features-demo`) - Feature grid layouts
- **FAQ Section** (`/faq-demo`) - Collapsible FAQ component
- **Call to Action** (`/cta-demo`) - CTA variants
- **Footer** (`/footer-demo`) - Footer component showcase
- **SVG Scroll Animation** (`/svg-scroll-demo`) - Animated SVG paths

### AI & Interactive Demos
- **AI Elements** (`/ai-demo`) - Full AI chatbot with message streaming
- **ElevenLabs Orb** (`/orb-demo`) - 3D voice agent visualization
- **Audio Player** (`/audio-player-demo`) - Customizable audio player with speed controls
- **Waveform** (`/waveform-demo`) - Audio visualizations and microphone input
- **Shimmering Text** (`/shimmering-text-demo`) - Animated gradient text effects
- **Conversation Bar** (`/conversation-bar-demo`) - Voice conversation interface
- **Profile Card** (`/profile-card-demo`) - Animated profile cards with follow functionality
- **User Profile Card** (`/user-profile-card-demo`) - Compact expandable cards with stats
- **Stats Section** (`/stats-demo`) - Impact metrics and statistics display
- **Feature Cards** (`/feature-card-demo`) - Service and feature showcase cards
- **Multi-Step Form** (`/multi-step-form-demo`) - Progressive form with step navigation
- **Logo Cloud** (`/logo-cloud-demo`) - Partner and sponsor logo showcase


## Adding UI Components

To add components to your app, run the following command at the root of your app:

```bash
pnpm dlx shadcn@latest add button -c frontend/web
```

This will place the ui components in the `shared/ui/src/components` directory.

### Adding AI Components
```bash
cd frontend/web
npx ai-elements@latest
```

### Adding ElevenLabs Components
```bash
cd frontend/web
npx shadcn@latest add https://ui.elevenlabs.io/r/orb.json
```

## Using Components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.
