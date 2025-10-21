# Rwanda Cancer Relief

A monorepo for Rwanda Cancer Relief project containing multiple applications and shared packages.

## Repository Structure

### Frontend

- **frontend/web** - Main public-facing website with cancer services information
- **frontend/dash** - Admin dashboard for managing the platform (Port 3001)
- **frontend/dashy** - Alternative admin dashboard with advanced analytics (Port 3002)

### Backend

- **backend/** - Backend services and API (coming soon)

### Shared

- **shared/ui** - Shared UI component library built with shadcn/ui
- **shared/eslint-config** - Shared ESLint configurations
- **shared/typescript-config** - Shared TypeScript configurations

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[docs/components/](docs/components/)** - Component integration guides (7 guides)
- **[docs/guides/](docs/guides/)** - Quick start guides (7 guides)
- **[docs/overview/](docs/overview/)** - Project overviews and summaries (3 documents)
- **[docs/setup/](docs/setup/)** - Setup and configuration documentation (1 guide)

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

Run a specific app:

```bash
# Web app (runs on http://localhost:3000)
cd frontend/web && pnpm dev

# Dash - Admin Dashboard (runs on http://localhost:3001)
cd frontend/dash && pnpm dev

# Dashy - Analytics Dashboard (runs on http://localhost:3002)
cd frontend/dashy && pnpm dev
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

### Admin Dashboards
- **Dashboard Demo** (`http://localhost:3001/demo`) - Admin dashboard components
- **Dashy Demo** (`http://localhost:3002/pages/demo`) - Analytics dashboard

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
