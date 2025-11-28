# Unit Testing Guide

This guide covers unit testing practices for the Rwanda Cancer Relief project.

## Overview

Unit tests verify individual functions, utilities, and components in isolation. They are fast, focused, and should cover the majority of test cases.

## Tools

- **Vitest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: DOM matchers

## Writing Unit Tests

### Function Tests

Test pure functions and utilities:

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate, calculateAge } from '@/lib/utils/date';

describe('formatDate', () => {
  it('formats date in default format', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });

  it('handles invalid dates', () => {
    expect(() => formatDate(new Date('invalid'))).toThrow();
  });
});

describe('calculateAge', () => {
  it('calculates age correctly', () => {
    const birthDate = new Date('2000-01-01');
    const today = new Date('2024-01-01');
    expect(calculateAge(birthDate, today)).toBe(24);
  });
});
```

### Component Tests

Test React components in isolation:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Tests

Test custom React hooks:

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

## Best Practices

### Test Structure

- Use `describe` blocks to group related tests
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused on one behavior

### Test Data

- Use factories for complex data
- Create reusable test fixtures
- Use realistic but minimal data
- Avoid hardcoded values when possible

### Assertions

- Make assertions specific
- Test behavior, not implementation
- Use appropriate matchers
- Verify both success and error cases

### Isolation

- Tests should be independent
- Don't rely on test execution order
- Clean up after tests
- Mock external dependencies

## Common Patterns

### Testing Async Code

```typescript
import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';

describe('asyncFunction', () => {
  it('handles async operations', async () => {
    const result = await asyncFunction();
    expect(result).toBeDefined();
  });

  it('waits for async updates', async () => {
    render(<AsyncComponent />);
    await waitFor(() => {
      expect(screen.getByText('Loaded')).toBeInTheDocument();
    });
  });
});
```

### Testing Error Cases

```typescript
describe('errorHandling', () => {
  it('handles errors gracefully', () => {
    expect(() => riskyOperation()).toThrow('Expected error');
  });

  it('returns error state on failure', async () => {
    const { result } = renderHook(() => useData());
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

### Mocking Dependencies

```typescript
import { vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: [] })),
}));

describe('component', () => {
  it('uses mocked dependency', () => {
    // Test implementation
  });
});
```

## Running Unit Tests

```bash
# Run all unit tests
pnpm test:unit

# Run tests in watch mode
pnpm test:unit --watch

# Run specific test file
pnpm test:unit path/to/test.ts

# Run with coverage
pnpm test:unit --coverage
```

## Coverage Goals

- **Target**: 80%+ coverage for utilities and business logic
- **Focus**: Critical paths and edge cases
- **Exclude**: Generated code, types, config files

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

