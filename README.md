# Rwanda Cancer Relief

A monorepo for Rwanda Cancer Relief project containing multiple applications and shared packages.

## Repository Structure

### Frontend

- **apps/web** - Main public-facing website with cancer services information
- **packages/ui** - Shared UI component library built with shadcn/ui
- **packages/eslint-config** - Shared ESLint configurations
- **packages/typescript-config** - Shared TypeScript configurations

### Backend

- Historical backend documentation now lives under `docs/legacy/backend/`

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
cd apps/web && pnpm dev
```

Build all apps:

```bash
pnpm build
```

## Adding UI Components

To add components to your app, run the following command at the root of your app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the UI components in the `packages/ui/src/components` directory.

### Adding AI Components
```bash
cd apps/web
npx ai-elements@latest
```

### Adding ElevenLabs Components
```bash
cd apps/web
npx shadcn@latest add https://ui.elevenlabs.io/r/orb.json
```

## Using Components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.
