# File Naming Conventions

This document outlines file naming conventions for the Rwanda Cancer Relief project.

## Overview

Consistent file naming improves code organization and discoverability. This guide establishes naming standards for all file types in the project.

## General Rules

### Case Conventions

- **Components**: PascalCase (e.g., `UserCard.tsx`)
- **Utilities and hooks**: camelCase (e.g., `formatDate.ts`, `useAuth.ts`)
- **Types and interfaces**: PascalCase (e.g., `User.ts`, `ApiResponse.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Configuration files**: kebab-case or lowercase (e.g., `next.config.mjs`, `tsconfig.json`)

### Extensions

- **TypeScript files**: `.ts` or `.tsx` (for React components)
- **JavaScript files**: `.js` or `.jsx` (avoided, prefer TypeScript)
- **Test files**: `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx`
- **Configuration**: `.json`, `.mjs`, `.config.ts`

## Component Files

### React Components

- Use PascalCase matching component name
- Co-locate related files in component directory

```
components/
  UserCard/
    UserCard.tsx
    UserCard.test.tsx
    UserCard.stories.tsx
    index.ts
```

### Component Naming

```typescript
// File: UserCard.tsx
export const UserCard: React.FC<UserCardProps> = () => {
  // Component implementation
};

// File: Button.tsx
export const Button: React.FC<ButtonProps> = () => {
  // Component implementation
};
```

## Utility Files

### Utility Functions

- Use camelCase for utility files
- Group related utilities in same file
- Use descriptive names

```
lib/
  utils/
    formatDate.ts
    calculateTotal.ts
    validateEmail.ts
```

### Utility Naming

```typescript
// File: formatDate.ts
export function formatDate(date: Date): string {
  // Implementation
}

// File: validateEmail.ts
export function validateEmail(email: string): boolean {
  // Implementation
}
```

## Hook Files

### Custom Hooks

- Use camelCase with "use" prefix
- Match hook name to file name

```
hooks/
  useAuth.ts
  useUserData.ts
  useSession.ts
```

### Hook Naming

```typescript
// File: useAuth.ts
export function useAuth() {
  // Hook implementation
}

// File: useUserData.ts
export function useUserData(userId: string) {
  // Hook implementation
}
```

## Type Files

### Type Definitions

- Use PascalCase matching type name
- Group related types in same file
- Use descriptive names

```
lib/
  types.ts
  api/
    types.ts
```

### Type Naming

```typescript
// File: types.ts
export interface User {
  id: string;
  name: string;
}

export type UserRole = 'patient' | 'counselor' | 'admin';
```

## Test Files

### Test File Naming

- Co-locate with source or in `__tests__` directory
- Use `.test.ts` or `.spec.ts` extension
- Match source file name

```
components/
  Button.tsx
  Button.test.tsx

// Or

__tests__/
  Button.test.tsx
```

### Test File Structure

```typescript
// File: Button.test.tsx
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    // Test implementation
  });
});
```

## Configuration Files

### Config Files

- Use standard naming conventions
- Match tool conventions

```
next.config.mjs
tsconfig.json
vitest.config.ts
.eslintrc.js
.prettierrc
```

## API Files

### API Routes

- Use route structure for Next.js API routes
- Use descriptive route names

```
app/
  api/
    users/
      route.ts
    sessions/
      route.ts
      [id]/
        route.ts
```

### API Client Files

```
lib/
  api/
    users.ts
    sessions.ts
    auth.ts
```

## Page Files

### Next.js Pages

- Use `page.tsx` for App Router pages
- Use `layout.tsx` for layouts
- Use `loading.tsx` for loading states
- Use `error.tsx` for error boundaries

```
app/
  dashboard/
    page.tsx
    layout.tsx
    loading.tsx
    error.tsx
```

## Directory Naming

### Directory Conventions

- Use kebab-case for directories
- Use descriptive names
- Group related files

```
components/
  user-card/
  session-list/
  dashboard/
```

## Special Files

### Index Files

- Use `index.ts` or `index.tsx` for re-exports
- Keep index files simple

```typescript
// File: index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

### Constants Files

```
lib/
  constants/
    apiEndpoints.ts
    userRoles.ts
```

## Examples

### Complete Example

```
apps/web/
  app/
    dashboard/
      page.tsx
      layout.tsx
  components/
    UserCard/
      UserCard.tsx
      UserCard.test.tsx
      index.ts
  hooks/
    useAuth.ts
    useUserData.ts
  lib/
    api/
      users.ts
      sessions.ts
    utils/
      formatDate.ts
      validateEmail.ts
    types.ts
  __tests__/
    integration/
      auth.test.ts
```

## Best Practices

### Consistency

- Follow established patterns
- Be consistent within directories
- Match team conventions

### Clarity

- Use descriptive names
- Avoid abbreviations
- Make purpose clear from name

### Organization

- Group related files
- Use directories for organization
- Keep files focused

## Resources

- [Next.js File Conventions](https://nextjs.org/docs/app/building-your-application/routing)
- [React File Structure](https://react.dev/learn/thinking-in-react)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

