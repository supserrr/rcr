# Commit Message Standards

This document outlines commit message standards for the Rwanda Cancer Relief project.

## Overview

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This ensures consistent, readable commit history and enables automated tooling.

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Components

- **Type**: Type of change (required)
- **Scope**: Area of change (optional)
- **Subject**: Brief description (required)
- **Body**: Detailed explanation (optional)
- **Footer**: Breaking changes, issue references (optional)

## Types

### Allowed Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

### Type Examples

```bash
feat(auth): Add Google OAuth integration
fix(sessions): Resolve patient details display issue
docs(readme): Update installation instructions
style(components): Format code with Prettier
refactor(api): Simplify user data fetching
test(auth): Add authentication tests
chore(deps): Update dependencies
```

## Scope

### Scope Guidelines

- Use lowercase
- Use dash-separated words if needed
- Be specific but concise
- Omit scope if change affects multiple areas

### Common Scopes

- `auth`: Authentication
- `api`: API routes
- `components`: React components
- `dashboard`: Dashboard features
- `sessions`: Session management
- `ui`: UI components
- `docs`: Documentation
- `deps`: Dependencies
- `ci`: CI/CD

### Scope Examples

```bash
feat(auth): Add password reset
fix(dashboard): Fix patient list loading
docs(api): Document user endpoints
refactor(components): Extract common logic
```

## Subject

### Subject Guidelines

- Use imperative mood ("Add" not "Added")
- First letter lowercase
- No period at end
- Maximum 72 characters
- Be specific and descriptive

### Subject Examples

```bash
# Good
feat(auth): Add Google OAuth integration
fix(sessions): Resolve patient details display issue

# Bad
feat(auth): Added Google OAuth
fix(sessions): Fixed bug
feat: new feature
```

## Body

### Body Guidelines

- Separate from subject with blank line
- Explain what and why, not how
- Wrap at 72 characters
- Use bullet points for multiple changes
- Reference issues when applicable

### Body Examples

```bash
feat(auth): Add Google OAuth integration

Implement Google OAuth sign-in using Supabase Auth.
Includes callback handler and user profile creation.

- Add Google OAuth provider configuration
- Implement OAuth callback handler
- Create user profile on first sign-in
- Add OAuth button to sign-in page

Closes #123
```

## Footer

### Footer Guidelines

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`
- Co-authors: `Co-authored-by: Name <email>`

### Footer Examples

```bash
feat(api): Add user search endpoint

Add new endpoint for searching users by name or email.

Closes #123
Fixes #456

BREAKING CHANGE: User search now requires authentication
```

## Examples

### Feature

```bash
feat(dashboard): Add patient statistics widget

Display key patient statistics including total patients,
active sessions, and recent activity.

- Add statistics API endpoint
- Create statistics widget component
- Integrate with dashboard layout

Closes #234
```

### Bug Fix

```bash
fix(sessions): Resolve patient details display issue

Fixed session cards not showing patient names and avatars.
Updated Supabase queries to explicitly select avatar_url field.

Fixes #456
```

### Documentation

```bash
docs(readme): Update installation instructions

Update README with latest setup steps including new
environment variables and Supabase configuration.

- Add environment variable documentation
- Update Supabase setup steps
- Add troubleshooting section
```

### Refactoring

```bash
refactor(api): Simplify user data fetching

Extract user data fetching logic into reusable hook.
Improves code reusability and testability.

- Create useUserData hook
- Update components to use hook
- Add hook tests
```

### Breaking Change

```bash
feat(api): Redesign user authentication flow

BREAKING CHANGE: Authentication now requires two-factor
authentication. Existing users must set up 2FA on next login.

- Add 2FA setup flow
- Update authentication endpoints
- Migrate existing users

Closes #789
```

## Best Practices

### Commit Often

- Make small, focused commits
- Commit working code
- Don't commit broken code

### Write Clear Messages

- Be specific and descriptive
- Explain why, not just what
- Reference related issues

### Review Before Committing

- Review changes with `git diff`
- Ensure commit message follows format
- Verify no sensitive data included

## Tools

### Commit Hooks

- Use commit hooks to validate format
- Configure editor for commit templates
- Use commit message templates

### Automation

- Conventional commits enable:
  - Automated changelog generation
  - Semantic versioning
  - Release automation

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Commit Best Practices](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

