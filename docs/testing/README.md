# Testing Guide

This document provides an overview of testing practices and infrastructure for the Rwanda Cancer Relief project.

## Overview

Testing is essential for maintaining code quality and preventing regressions. This guide covers testing strategies, tools, and best practices.

## Testing Strategy

### Testing Pyramid

The project follows a testing pyramid approach:

1. **Unit Tests** (Base): Fast, isolated component and function tests
2. **Integration Tests** (Middle): Test component interactions and API integration
3. **E2E Tests** (Top): Full user workflow tests

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage for utilities and business logic
- **Integration Tests**: Critical user flows and API endpoints
- **E2E Tests**: Core user journeys

## Testing Tools

### Unit Testing

- **Vitest**: Fast unit test runner
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: DOM matchers

### Integration Testing

- **Vitest**: Test runner
- **MSW (Mock Service Worker)**: API mocking
- **Supabase Test Client**: Database testing

### E2E Testing

- **Playwright**: Browser automation
- **Playwright Test**: E2E test runner

## Test Structure

### Directory Organization

```
apps/web/
├── __tests__/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # E2E tests
├── components/
│   └── __tests__/      # Component tests
└── lib/
    └── __tests__/      # Utility tests
```

### Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Spec files: `*.spec.ts` or `*.spec.tsx`
- Co-located with source or in `__tests__` directories

## Running Tests

### All Tests

```bash
pnpm test
```

### Unit Tests

```bash
pnpm test:unit
```

### Integration Tests

```bash
pnpm test:integration
```

### E2E Tests

```bash
pnpm test:e2e
```

### Watch Mode

```bash
pnpm test:watch
```

### Coverage

```bash
pnpm test:coverage
```

## Writing Tests

### Unit Tests

Test individual functions and components in isolation.

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/utils/date';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2025');
  });
});
```

### Component Tests

Test React components with React Testing Library.

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test component interactions and API integration.

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';

describe('PatientDashboard', () => {
  it('loads and displays patient data', async () => {
    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Patient Name')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

Test complete user workflows.

```typescript
import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Sign In');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});
```

## Best Practices

### Test Organization

- Group related tests with `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and isolated

### Test Data

- Use factories for test data
- Create reusable test fixtures
- Mock external dependencies
- Use realistic test data

### Assertions

- Make assertions specific and clear
- Test behavior, not implementation
- Use appropriate matchers
- Verify error cases

### Performance

- Keep tests fast
- Use appropriate test types
- Mock expensive operations
- Run tests in parallel when possible

## Mocking

### API Mocking

Use MSW for API mocking:

```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/patients', (req, res, ctx) => {
    return res(ctx.json({ patients: [] }));
  })
);
```

### Component Mocking

Mock external components and dependencies:

```typescript
vi.mock('@/lib/api', () => ({
  fetchPatients: vi.fn(() => Promise.resolve([])),
}));
```

## Continuous Integration

Tests run automatically on:

- Pull requests
- Pushes to main/develop branches
- Before deployment

See [CI/CD Documentation](../.github/workflows/test.yml) for details.

## Resources

### Internal

- [Unit Testing Guide](UNIT_TESTING.md)
- [Integration Testing Guide](INTEGRATION_TESTING.md)
- [E2E Testing Guide](E2E_TESTING.md)

### External

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

