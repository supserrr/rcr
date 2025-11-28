# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the Rwanda Cancer Relief project.

## What are ADRs?

Architecture Decision Records document important architectural decisions made in the project. They capture:

- The context and problem
- The decision made
- The consequences of the decision

## ADR Format

Each ADR follows this format:

1. **Status**: Proposed, Accepted, Deprecated, Superseded
2. **Context**: The issue motivating this decision
3. **Decision**: The change that we're proposing or have agreed to implement
4. **Consequences**: What becomes easier or more difficult to do

## ADR Index

### 0001-monorepo-structure.md
Decision to use monorepo structure with pnpm workspaces.

### [More ADRs to be added]

## Creating New ADRs

When making a significant architectural decision:

1. Create a new ADR file: `NNNN-decision-name.md`
2. Use the next sequential number
3. Follow the ADR template
4. Update this README
5. Commit with conventional commit format

## ADR Template

```markdown
# ADR NNNN: Decision Title

## Status

Proposed/Accepted/Deprecated/Superseded

## Context

[Describe the issue and context]

## Decision

[Describe the decision]

## Consequences

[Describe the consequences]

## Alternatives Considered

[Describe alternatives that were considered]
```

## Resources

- [ADR GitHub](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

