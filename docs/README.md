# Rwanda Cancer Relief - Documentation

Comprehensive documentation for the Rwanda Cancer Relief monorepo project.

## Documentation Structure

### 📁 Components
Integration guides for individual UI components with detailed implementation instructions, props documentation, and use cases.

### 📁 Guides
Quick start guides and step-by-step tutorials for getting components up and running quickly.

### 📁 Setup
Project setup, configuration, and initial setup documentation.

### 📁 Overview
High-level project overviews, integration summaries, and complete component catalogs.

---

## Quick Navigation

### Component Integration Guides

Located in `docs/components/`:

- **[CTA Integration](./components/CTA_INTEGRATION.md)** - Call to Action component
- **[FAQ Section Integration](./components/FAQ_SECTION_INTEGRATION.md)** - FAQ accordion component
- **[Features Grid Integration](./components/FEATURES_GRID_INTEGRATION.md)** - Feature grid layout
- **[Feature Spotlight Integration](./components/FEATURE_SPOTLIGHT_INTEGRATION.md)** - Animated feature highlights
- **[Footer Integration](./components/FOOTER_INTEGRATION.md)** - Footer component
- **[Parallax Scroll Integration](./components/PARALLAX_SCROLL_INTEGRATION.md)** - Parallax scrolling effects
- **[SVG Scroll Integration](./components/SVG_SCROLL_INTEGRATION.md)** - Animated SVG paths

### Quick Start Guides

Located in `docs/guides/`:

- **[Quick Start](./guides/QUICK_START.md)** - General project quick start
- **[CTA Quick Start](./guides/CTA_QUICK_START.md)** - Call to Action quick setup
- **[FAQ Section Quick Start](./guides/FAQ_SECTION_QUICK_START.md)** - FAQ quick setup
- **[Features Grid Quick Start](./guides/FEATURES_GRID_QUICK_START.md)** - Features grid quick setup
- **[Footer Quick Start](./guides/FOOTER_QUICK_START.md)** - Footer quick setup
- **[Parallax Quick Start](./guides/PARALLAX_QUICK_START.md)** - Parallax quick setup
- **[SVG Scroll Quick Start](./guides/SVG_SCROLL_QUICK_START.md)** - SVG animation quick setup

### Project Overview

Located in `docs/overview/`:

- **[All Components Overview](./overview/ALL_COMPONENTS_OVERVIEW.md)** - Complete component catalog
- **[Complete Integration Summary](./overview/COMPLETE_INTEGRATION_SUMMARY.md)** - Full integration details
- **[Integration Summary](./overview/INTEGRATION_SUMMARY.md)** - Component integration overview

### Setup & Configuration

Located in `docs/setup/`:

- **[Component Library README](./setup/COMPONENT_LIBRARY_README.md)** - Component library setup guide

---

## Getting Started

### 1. Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd rwanda-cancer-relief

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

This starts all three applications:
- Web App: `http://localhost:3000`
- Dash: `http://localhost:3001`
- Dashy: `http://localhost:3002`

### 2. Explore Demo Pages

Visit `http://localhost:3000` to see 23 demo pages showcasing:
- UI components
- AI features
- Interactive elements
- Form components

### 3. Component Usage

Import components from the shared UI package:

```tsx
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Orb } from "@workspace/ui/components/ui/orb";
```

## Project Structure

```
rwanda-cancer-relief/
├── apps/
│   ├── web/          # Main website (23 demo pages)
│   ├── dash/         # Admin dashboard
│   └── dashy/        # Analytics dashboard
├── packages/
│   ├── ui/           # Shared UI components (68 components)
│   ├── eslint-config/
│   └── typescript-config/
└── docs/             # This documentation
    ├── components/   # Component integration guides
    ├── guides/       # Quick start guides
    ├── setup/        # Setup documentation
    └── overview/     # Project summaries
```

## Component Categories

### UI Components (68 Total)

#### shadcn/ui Base (16)
Button, Card, Input, Label, Select, Avatar, Badge, Progress, Tooltip, Dialog, Dropdown Menu, Hover Card, Scroll Area, Carousel, Collapsible, Textarea

#### Custom Components (11)
Mini Navbar, Helix Hero, Feature Spotlight, Services Grid, Parallax Scroll, Features Grid, FAQ Section, Call to Action, Footer, SVG Scroll, Feature Cards

#### AI Elements (30)
Message, Conversation, Response, PromptInput, Suggestions, Sources, Reasoning, Plan, Task, Actions, Loader, CodeBlock, and more

#### ElevenLabs UI (6)
Orb, Audio Player, Waveform, Live Waveform, Shimmering Text, Conversation Bar

#### 21st.dev Components (5)
Profile Card, User Profile Card, Stats Section, Feature Card, Logo Cloud

## Technologies Used

### Frameworks
- Next.js 15.x (App Router)
- React 19.x
- TypeScript 5.x

### Styling
- Tailwind CSS 4.0
- CSS Modules
- Framer Motion

### 3D Graphics
- Three.js
- React Three Fiber

### AI & Voice
- Vercel AI SDK
- ElevenLabs SDK

### Build Tools
- Turborepo
- pnpm workspaces

## Common Tasks

### Adding a New Component

```bash
# Add shadcn component
pnpm dlx shadcn@latest add button -c apps/web

# Add from 21st.dev
cd apps/web
npx shadcn@latest add https://21st.dev/r/component-name

# Add AI Elements
cd apps/web
npx ai-elements@latest

# Add ElevenLabs component
cd apps/web
npx shadcn@latest add https://ui.elevenlabs.io/r/component-name.json
```

### Creating a Demo Page

1. Create directory: `apps/web/app/my-demo/`
2. Create `page.tsx` with component showcase
3. Add link to homepage: `apps/web/app/page.tsx`
4. Update README.md demo list

### Building for Production

```bash
# Build all apps
pnpm build

# Build specific app
cd apps/web && pnpm build
```

## Troubleshooting

### Missing Dependencies

```bash
pnpm install
```

### Port Already in Use

```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

### TypeScript Errors

```bash
# Run type check
cd apps/web && pnpm typecheck
```

### Build Errors

```bash
# Clean and rebuild
rm -rf apps/web/.next
cd apps/web && pnpm build
```

## Contributing

When adding new components or features:

1. Follow the existing component structure
2. Add TypeScript types for all props
3. Include JSDoc comments
4. Create a demo page
5. Update documentation
6. Test in all three apps
7. Commit with conventional commit format

## Resources

### External Documentation
- [Next.js](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [ElevenLabs UI](https://ui.elevenlabs.io)
- [21st.dev](https://21st.dev)

### Internal Links
- [Main README](../README.md)
- [Component Library](./setup/COMPONENT_LIBRARY_README.md)
- [All Components](./overview/ALL_COMPONENTS_OVERVIEW.md)
- [Complete Summary](./overview/COMPLETE_INTEGRATION_SUMMARY.md)

## Support

For questions or issues:
- Check relevant documentation in this folder
- Review component integration guides
- Consult quick start guides
- Check demo pages for examples

---

**Last Updated**: October 21, 2025  
**Total Components**: 68  
**Total Demo Pages**: 25  
**Total Applications**: 3

