# Integration Testing Guide

This guide covers integration testing practices for the Rwanda Cancer Relief project.

## Overview

Integration tests verify that multiple components, services, or systems work together correctly. They test interactions between different parts of the application.

## Tools

- **Vitest**: Test runner
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Supabase Test Client**: Database testing

## Writing Integration Tests

### Component Integration

Test component interactions:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';
import { PatientProvider } from '@/components/providers';

describe('PatientDashboard Integration', () => {
  it('loads and displays patient data', async () => {
    render(
      <PatientProvider>
        <PatientDashboard />
      </PatientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Patient Name')).toBeInTheDocument();
    });
  });

  it('handles data loading state', () => {
    render(<PatientDashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### API Integration

Test API endpoint integration:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { fetchPatients } from '@/lib/api/patients';

const server = setupServer(
  rest.get('/api/patients', (req, res, ctx) => {
    return res(ctx.json({ patients: [{ id: '1', name: 'Test Patient' }] }));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('API Integration', () => {
  it('fetches patients from API', async () => {
    const patients = await fetchPatients();
    expect(patients).toHaveLength(1);
    expect(patients[0].name).toBe('Test Patient');
  });
});
```

### Database Integration

Test database operations:

```typescript
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { getPatientData } from '@/lib/api/patients';

describe('Database Integration', () => {
  it('retrieves patient data from database', async () => {
    const patient = await getPatientData('patient-id');
    expect(patient).toBeDefined();
    expect(patient.name).toBeDefined();
  });

  it('enforces Row Level Security', async () => {
    // Test that RLS policies work correctly
    const unauthorizedClient = createClient(/* unauthorized config */);
    const { error } = await unauthorizedClient
      .from('patients')
      .select('*');
    
    expect(error).toBeDefined();
  });
});
```

## Best Practices

### Test Scope

- Test critical user flows
- Test component interactions
- Test API integration
- Test error handling

### Test Data

- Use test database or mocks
- Create realistic test scenarios
- Clean up test data after tests
- Use factories for test data

### Isolation

- Tests should be independent
- Use transactions for database tests
- Mock external services
- Reset state between tests

## Common Patterns

### Testing Form Submissions

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatientForm } from '@/components/forms/PatientForm';

describe('PatientForm Integration', () => {
  it('submits form and updates UI', async () => {
    render(<PatientForm />);
    
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test Patient' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Patient created')).toBeInTheDocument();
    });
  });
});
```

### Testing Authentication Flow

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInForm } from '@/components/auth/SignInForm';

describe('Authentication Integration', () => {
  it('signs in user and redirects', async () => {
    render(<SignInForm />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
```

## Running Integration Tests

```bash
# Run all integration tests
pnpm test:integration

# Run specific test file
pnpm test:integration path/to/test.ts

# Run with coverage
pnpm test:integration --coverage
```

## Test Environment

### Setup

- Use test database or mocks
- Configure test environment variables
- Set up test data fixtures
- Mock external services

### Cleanup

- Clean up test data after tests
- Reset database state
- Clear caches
- Close connections

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [MSW Documentation](https://mswjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supabase Testing](https://supabase.com/docs/guides/cli/local-development)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

