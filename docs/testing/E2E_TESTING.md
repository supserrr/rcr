# End-to-End Testing Guide

This guide covers end-to-end (E2E) testing practices for the Rwanda Cancer Relief project.

## Overview

E2E tests verify complete user workflows from start to finish. They test the application as a user would interact with it, including all layers of the stack.

## Tools

- **Playwright**: Browser automation and testing
- **Playwright Test**: E2E test runner
- **Playwright Codegen**: Test generation tool

## Setup

### Installation

Playwright is installed as a dev dependency. Install browsers:

```bash
pnpm exec playwright install
```

### Configuration

Playwright configuration is in `playwright.config.ts` (to be created).

## Writing E2E Tests

### Basic Test

```typescript
import { test, expect } from '@playwright/test';

test('user can navigate to homepage', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Rwanda Cancer Relief/);
});
```

### User Flow Test

```typescript
import { test, expect } from '@playwright/test';

test('user can sign up and access dashboard', async ({ page }) => {
  // Navigate to sign up page
  await page.goto('http://localhost:3000/signup');
  
  // Fill sign up form
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.fill('input[name="name"]', 'Test User');
  await page.selectOption('select[name="role"]', 'patient');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/dashboard/);
  
  // Verify dashboard content
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

### Authentication Test

```typescript
import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }) => {
  await page.goto('http://localhost:3000/signin');
  
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL(/dashboard/);
  await expect(page).toHaveURL(/dashboard/);
});
```

### Session Management Test

```typescript
import { test, expect } from '@playwright/test';

test('user can book a session', async ({ page }) => {
  // Sign in first
  await page.goto('http://localhost:3000/signin');
  await page.fill('input[name="email"]', 'patient@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);
  
  // Navigate to booking
  await page.click('text=Book Session');
  await page.waitForURL(/sessions\/book/);
  
  // Select counselor
  await page.click('text=Select Counselor');
  await page.click('text=Dr. Smith');
  
  // Select date and time
  await page.click('input[name="date"]');
  await page.click('text=15');
  await page.selectOption('select[name="time"]', '10:00 AM');
  
  // Submit booking
  await page.click('button[type="submit"]');
  
  // Verify confirmation
  await expect(page.locator('text=Session booked')).toBeVisible();
});
```

## Best Practices

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Test complete user journeys
- Keep tests independent

### Test Data

- Use test accounts and data
- Clean up test data after tests
- Use factories for test data
- Isolate test data from production

### Selectors

- Prefer role-based selectors
- Use data-testid for stable selectors
- Avoid CSS selectors when possible
- Make selectors resilient to changes

### Waiting

- Use explicit waits
- Wait for navigation
- Wait for elements to be visible
- Avoid fixed timeouts

## Common Patterns

### Page Object Model

Create page objects for reusable page interactions:

```typescript
// pages/SignInPage.ts
export class SignInPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('http://localhost:3000/signin');
  }

  async signIn(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}

// test file
import { SignInPage } from './pages/SignInPage';

test('user can sign in', async ({ page }) => {
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  await signInPage.signIn('test@example.com', 'password123');
  await expect(page).toHaveURL(/dashboard/);
});
```

### Authentication Helpers

Create helpers for common operations:

```typescript
// helpers/auth.ts
export async function signInAsPatient(page: Page) {
  await page.goto('http://localhost:3000/signin');
  await page.fill('input[name="email"]', 'patient@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);
}
```

## Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests in headed mode
pnpm test:e2e --headed

# Run specific test file
pnpm test:e2e path/to/test.spec.ts

# Run tests in debug mode
pnpm test:e2e --debug

# Generate test code
pnpm exec playwright codegen http://localhost:3000
```

## Test Environment

### Prerequisites

- Development server running on localhost:3000
- Test database configured
- Test accounts created
- Environment variables set

### Setup

```bash
# Start development server
pnpm dev

# In another terminal, run tests
pnpm test:e2e
```

## CI/CD Integration

E2E tests run in CI/CD pipeline:

- On pull requests
- Before deployment
- On schedule (nightly)

See [CI/CD Documentation](../.github/workflows/test.yml) for details.

## Debugging

### Debug Mode

```bash
pnpm test:e2e --debug
```

### Screenshots

Playwright automatically takes screenshots on failure.

### Video Recording

Videos are recorded for failed tests (configured in playwright.config.ts).

### Trace Viewer

```bash
pnpm exec playwright show-trace trace.zip
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Test Generator](https://playwright.dev/docs/codegen)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

