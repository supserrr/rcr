# Code Style Guide

This document outlines code style standards for the Rwanda Cancer Relief project.

## Overview

Consistent code style improves readability and maintainability. This guide establishes standards for TypeScript, React, and related technologies used in the project.

## TypeScript

### Type Definitions

- Use explicit types for function parameters and return values
- Avoid `any` type; use `unknown` when type is truly unknown
- Use type aliases for complex types
- Prefer interfaces for object shapes
- Use enums for fixed sets of values

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User | null> {
  // Implementation
}

// Bad
function getUser(id: any): any {
  // Implementation
}
```

### Naming Conventions

- **Variables and functions**: camelCase
- **Types and interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Components**: PascalCase
- **Files**: Match export (PascalCase for components, camelCase for utilities)

```typescript
// Good
const userName = 'John';
const MAX_RETRIES = 3;
interface UserProfile {}
function calculateTotal() {}
const UserCard: React.FC = () => {};

// Bad
const user_name = 'John';
const maxRetries = 3;
interface user_profile {}
function CalculateTotal() {}
```

### Imports

- Use absolute imports with path aliases when configured
- Group imports: external, internal, relative
- Sort imports alphabetically within groups
- Use named exports when possible

```typescript
// Good
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/date';
import type { User } from '@/lib/types';

// Bad
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/date';
import { useState, useEffect } from 'react'; // Duplicate
```

## React

### Components

- Use functional components with hooks
- Prefer named exports for components
- Use TypeScript interfaces for props
- Keep components focused and small
- Extract reusable logic into custom hooks

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

// Bad
export default function button(props: any) {
  return <button>{props.label}</button>;
}
```

### Hooks

- Use hooks at the top level of components
- Follow rules of hooks
- Create custom hooks for reusable logic
- Name custom hooks with "use" prefix

```typescript
// Good
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  // Implementation
  return user;
}

// Bad
function getUserData(userId: string) {
  // Not a hook
}
```

### JSX

- Use self-closing tags when appropriate
- Use meaningful prop names
- Extract complex JSX into variables or components
- Use fragments when multiple elements are needed

```typescript
// Good
<div>
  <UserCard user={user} />
  <Button onClick={handleClick} disabled={isLoading} />
</div>

// Bad
<div>
  <UserCard user={user}></UserCard>
  <Button onClick={handleClick} disabled={isLoading}></Button>
</div>
```

## Formatting

### Indentation

- Use 2 spaces for indentation
- Use consistent indentation throughout

### Line Length

- Maximum 100 characters per line
- Break long lines appropriately
- Use trailing commas in multi-line structures

### Spacing

- Use single spaces around operators
- No spaces inside parentheses
- Single blank line between logical sections

```typescript
// Good
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad
function calculateTotal( items:Item[] ):number{
  return items.reduce((sum,item)=>sum+item.price,0);
}
```

## Comments

### Code Comments

- Write self-documenting code
- Add comments for complex logic
- Use JSDoc for public APIs
- Keep comments up to date

```typescript
// Good
/**
 * Calculates the total price including tax.
 * @param items - Array of items to calculate total for
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns Total price including tax
 */
function calculateTotalWithTax(items: Item[], taxRate: number): number {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 + taxRate);
}

// Bad
// Calculate total
function calc(items: any, tax: any) {
  // Sum items and add tax
  return items.reduce((a, b) => a + b.price, 0) * (1 + tax);
}
```

## Error Handling

### Error Patterns

- Use try-catch for async operations
- Provide meaningful error messages
- Handle errors gracefully
- Log errors appropriately

```typescript
// Good
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error(`Unable to fetch user ${id}`);
  }
}

// Bad
async function fetchUser(id: string) {
  const response = await api.get(`/users/${id}`);
  return response.data; // No error handling
}
```

## File Organization

### File Structure

- One component per file
- Co-locate related files
- Use index files for exports
- Group related functionality

```
components/
  Button/
    Button.tsx
    Button.test.tsx
    index.ts
```

### Exports

- Use named exports for components
- Use default exports sparingly
- Re-export from index files when appropriate

```typescript
// Good
export { Button } from './Button';
export type { ButtonProps } from './Button';

// Bad
export default Button;
```

## Best Practices

### Performance

- Use React.memo for expensive components
- Memoize expensive calculations
- Lazy load components when appropriate
- Optimize re-renders

### Accessibility

- Use semantic HTML
- Add ARIA labels when needed
- Ensure keyboard navigation
- Test with screen readers

### Security

- Validate all user input
- Sanitize data before rendering
- Use parameterized queries
- Never expose secrets

## Tools

### Linting

- ESLint enforces code style
- Run `pnpm lint` before committing
- Fix auto-fixable issues

### Formatting

- Prettier formats code automatically
- Run `pnpm format` before committing
- Configure editor to format on save

## Resources

- [TypeScript Style Guide](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Best Practices](https://react.dev/learn)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

