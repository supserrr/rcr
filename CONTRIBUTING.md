# Contributing to Rwanda Cancer Relief

Thank you for your interest in contributing to the Rwanda Cancer Relief project. This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/rwanda-cancer-relief.git
   cd rwanda-cancer-relief
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or newer
- Supabase CLI (for database operations)

### Running the Development Server

```bash
# Start all apps
pnpm dev

# Start only the web app
pnpm --filter @apps/web dev
```

### Code Quality

Before submitting a pull request, ensure:

1. **Linting passes**:
   ```bash
   pnpm lint
   ```

2. **Type checking passes**:
   ```bash
   pnpm --filter @apps/web typecheck
   ```

3. **Code is formatted**:
   ```bash
   pnpm format
   ```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): Add Google OAuth integration

Implement Google OAuth sign-in using Supabase Auth.
Includes callback handler and user profile creation.

Closes #123
```

```
fix(sessions): Resolve patient details display issue

Fixed session cards not showing patient names and avatars.
Updated Supabase queries to explicitly select avatar_url field.

Fixes #456
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features or bug fixes
3. **Ensure all checks pass** (linting, type checking, tests)
4. **Write a clear PR description**:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Any breaking changes

### PR Title Format

Follow the same format as commit messages:

```
feat(auth): Add Google OAuth integration
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types when possible
- Use explicit return types for functions
- Follow existing code patterns

### React Components

- Use functional components with hooks
- Prefer named exports for components
- Use TypeScript interfaces for props
- Include JSDoc comments for public APIs

### File Naming

- Components: PascalCase (e.g., `SessionCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase (e.g., `Session.ts`)

## Documentation

When adding or modifying features:

1. **Update relevant documentation** in `docs/`
2. **Update `docs/INDEX.md`** if adding new documentation
3. **Follow Google's Technical Writing Style Guide**
4. **Include code examples** where helpful

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test edge cases and error conditions
- Test in multiple browsers when applicable

## Questions?

- Open an issue for questions or discussions
- Check existing documentation in `docs/`
- Review the main README.md

## License

By contributing, you agree that your contributions will be subject to the proprietary license of Rwanda Cancer Relief. All contributions become the property of Rwanda Cancer Relief.

