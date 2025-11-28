# ADR 0001: Monorepo Structure

## Status

Accepted

## Context

The project needs to manage multiple related packages and applications. We needed to decide on a project structure that:

- Supports code sharing between applications
- Enables efficient development workflows
- Facilitates dependency management
- Supports scalable growth

## Decision

We will use a monorepo structure with:

- **pnpm workspaces** for package management
- **Turbo** for task orchestration
- **apps/** directory for applications
- **packages/** directory for shared packages

### Structure

```
rwanda-cancer-relief/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   ├── ui/               # Shared components
│   ├── eslint-config/    # ESLint configs
│   └── typescript-config/# TypeScript configs
└── ...
```

## Consequences

### Positive

- Code sharing is straightforward
- Consistent tooling across packages
- Efficient dependency management
- Single repository for all code
- Easier refactoring across packages

### Negative

- Larger repository size
- More complex initial setup
- Requires understanding of monorepo tools

### Neutral

- Learning curve for pnpm workspaces
- Need to understand Turbo configuration

## Alternatives Considered

### Multi-Repository

- **Pros**: Simpler individual repositories
- **Cons**: Difficult code sharing, version management complexity
- **Decision**: Not chosen due to code sharing needs

### npm/yarn Workspaces

- **Pros**: More common, larger community
- **Cons**: Less efficient than pnpm
- **Decision**: Chose pnpm for better performance

## References

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turbo Documentation](https://turbo.build/repo/docs)

---

**Date**: 2024-01-01
**Author**: Development Team

