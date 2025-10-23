# Setup & Configuration

Documentation for project setup, configuration, and initial environment setup.

## Available Setup Documentation

### Component Library Setup
**[COMPONENT_LIBRARY_README.md](./COMPONENT_LIBRARY_README.md)**

Complete guide to setting up and using the shared component library in the Rwanda Cancer Relief monorepo.

**Contents:**
- Component library structure
- Installation instructions
- Import patterns
- Usage examples
- Best practices

**Use this when:**
- Setting up the project for the first time
- Understanding the component library architecture
- Learning import conventions
- Onboarding new developers

---

## Initial Project Setup

### Prerequisites

Ensure you have the following installed:

```bash
# Node.js 18 or later
node --version

# pnpm package manager
pnpm --version

# Git
git --version
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rwanda-cancer-relief

# Install all dependencies
pnpm install

# Start all development servers
pnpm dev
```

This will start:
- **Web App:** http://localhost:3000
- **Dash:** http://localhost:3001
- **Dashy:** http://localhost:3002

---

## Project Structure

```
rwanda-cancer-relief/
├── apps/
│   ├── web/              # Main website (Port 3000)
│   │   ├── app/          # Next.js app router
│   │   ├── components/   # App-specific components
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities
│   ├── dash/             # Admin dashboard (Port 3001)
│   └── dashy/            # Analytics dashboard (Port 3002)
├── packages/
│   ├── ui/               # Shared component library
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── hooks/          # Shared hooks
│   │   │   ├── lib/            # Utilities
│   │   │   └── styles/         # Global styles
│   │   └── package.json
│   ├── eslint-config/    # Shared ESLint config
│   └── typescript-config/ # Shared TypeScript config
├── docs/                 # Documentation (this folder)
└── pnpm-workspace.yaml   # Workspace configuration
```

---

## Configuration Files

### Workspace Configuration

**pnpm-workspace.yaml**
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Defines the monorepo workspace structure.

### TypeScript Configuration

Each app extends the shared TypeScript config:

```json
{
  "extends": "@workspace/typescript-config/nextjs.json"
}
```

### ESLint Configuration

Each app uses the shared ESLint config:

```javascript
import { nextJsConfig } from "@workspace/eslint-config/next-js";
export default nextJsConfig;
```

### Tailwind Configuration

Apps share Tailwind config through the UI package:

```javascript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

---

## Environment Setup

### Development

```bash
# Install dependencies
pnpm install

# Start all apps
pnpm dev

# Start specific app
cd apps/web && pnpm dev
```

### Build

```bash
# Build all apps
pnpm build

# Build specific app
cd apps/web && pnpm build
```

### Type Checking

```bash
# Check all apps
pnpm typecheck

# Check specific app
cd apps/web && pnpm typecheck
```

### Linting

```bash
# Lint all apps
pnpm lint

# Lint and fix
pnpm lint:fix

# Lint specific app
cd apps/web && pnpm lint
```

---

## Development Workflow

### Adding Dependencies

**To a specific app:**
```bash
cd apps/web
pnpm add package-name
```

**To the UI package:**
```bash
cd packages/ui
pnpm add package-name
```

**To all workspaces:**
```bash
pnpm add package-name -w
```

### Creating a New Component

1. **Add to UI package:**
```bash
cd packages/ui/src/components
# Create component file
```

2. **Export from package:**
```typescript
// packages/ui/src/components/index.ts
export * from "./my-component";
```

3. **Use in app:**
```tsx
import { MyComponent } from "@workspace/ui/components/my-component";
```

### Creating a Demo Page

1. **Create directory:**
```bash
mkdir apps/web/app/my-demo
```

2. **Create page:**
```tsx
// apps/web/app/my-demo/page.tsx
export default function MyDemo() {
  return <div>Demo content</div>;
}
```

3. **Link from homepage:**
```tsx
// apps/web/app/page.tsx
<Link href="/my-demo">My Demo</Link>
```

---

## Common Commands

### Development
```bash
pnpm dev          # Start all apps
pnpm build        # Build all apps
pnpm lint         # Lint all apps
pnpm lint:fix     # Lint and fix
pnpm typecheck    # Type check all apps
```

### Package Management
```bash
pnpm install      # Install dependencies
pnpm add [pkg]    # Add dependency
pnpm remove [pkg] # Remove dependency
pnpm update       # Update dependencies
```

### Workspace Commands
```bash
pnpm -F web dev              # Run dev in web app
pnpm -F @workspace/ui build  # Build UI package
pnpm -r lint                 # Lint all workspaces
```

---

## IDE Setup

### VS Code

**Recommended Extensions:**
- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Path Intellisense

**Settings (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### IntelliSense for Workspace Packages

TypeScript should automatically resolve workspace packages. If not:

1. Restart TypeScript server (Cmd/Ctrl+Shift+P → Restart TS Server)
2. Check `tsconfig.json` paths
3. Run `pnpm install` again

---

## Troubleshooting

### Port Already in Use

```bash
# Find process on port
lsof -ti:3000

# Kill process
lsof -ti:3000 | xargs kill -9
```

### Dependencies Out of Sync

```bash
# Clean and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Build Errors

```bash
# Clean Next.js cache
rm -rf apps/web/.next
rm -rf apps/dash/.next
rm -rf apps/dashy/.next

# Rebuild
pnpm build
```

### TypeScript Errors

```bash
# Run type check
pnpm typecheck

# Check specific app
cd apps/web && pnpm typecheck
```

### Import Resolution Issues

```bash
# Rebuild workspace
pnpm -r build

# Restart dev server
pnpm dev
```

---

## Best Practices

### Component Organization
- Keep shared components in `packages/ui`
- App-specific components in `apps/*/components`
- Use barrel exports for easier imports

### Styling
- Use Tailwind CSS for styling
- Keep global styles in `packages/ui/src/styles`
- Use CSS modules for component-specific styles

### TypeScript
- Always type props interfaces
- Use type inference where possible
- Export types alongside components

### Git Workflow
- Use conventional commits
- Create feature branches
- Write descriptive commit messages

### Testing
- Test components in demo pages
- Check responsiveness
- Verify accessibility
- Test in all supported browsers

---

## Additional Resources

### Internal Documentation
- **[Component Library](./COMPONENT_LIBRARY_README.md)** - Component setup guide
- **[All Components](../overview/ALL_COMPONENTS_OVERVIEW.md)** - Component catalog
- **[Quick Start Guides](../guides/README.md)** - Fast implementation

### External Resources
- **[Next.js Documentation](https://nextjs.org/docs)**
- **[pnpm Workspaces](https://pnpm.io/workspaces)**
- **[Turborepo Documentation](https://turbo.build/repo/docs)**
- **[Tailwind CSS](https://tailwindcss.com/docs)**
- **[TypeScript](https://www.typescriptlang.org/docs/)**

---

## Getting Help

If you encounter issues:

1. Check this documentation
2. Review error messages carefully
3. Search existing issues
4. Check component demos for examples
5. Review integration guides

---

**Last Updated**: October 21, 2025  
**Node Version**: 18+  
**Package Manager**: pnpm  
**Total Workspaces**: 6

