# Security Guidelines

This document outlines security best practices for the Rwanda Cancer Relief project.

## Overview

Security is a critical aspect of healthcare applications. This guide provides security guidelines for developers working on the project.

## Authentication and Authorization

### Authentication

- Use Supabase Auth for all authentication
- Implement strong password requirements
- Support multi-factor authentication when available
- Use secure session management
- Implement proper logout functionality

### Authorization

- Use Row Level Security (RLS) policies for data access
- Implement role-based access control (RBAC)
- Verify permissions on every request
- Never trust client-side authorization alone
- Validate user roles server-side

### Best Practices

```typescript
// Good: Server-side authorization check
export async function getPatientData(patientId: string, userId: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .eq('user_id', userId) // RLS enforces this
    .single();
  
  if (error) throw error;
  return data;
}

// Bad: Client-side only authorization
// Never rely solely on client-side checks
```

## Data Protection

### Sensitive Data

- Never log sensitive data (passwords, tokens, PII)
- Encrypt sensitive data at rest
- Use HTTPS for all data in transit
- Implement proper data retention policies
- Follow healthcare data regulations (HIPAA considerations)

### Input Validation

- Validate all user input
- Sanitize data before database operations
- Use parameterized queries
- Implement input length limits
- Validate data types and formats

### Best Practices

```typescript
// Good: Input validation with Zod
import { z } from 'zod';

const patientSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
});

const validatedData = patientSchema.parse(userInput);
```

## Secrets Management

### Environment Variables

- Never commit secrets to version control
- Use environment variables for all secrets
- Use different secrets for development and production
- Rotate secrets regularly
- Limit access to production secrets

### Key Management

- Store keys in secure locations (Vercel, Supabase)
- Use service role keys only server-side
- Use anon keys for client-side (with RLS)
- Rotate keys when compromised
- Document key locations and access

### Best Practices

```typescript
// Good: Environment variable validation
import { env } from '@/src/env';

// env.ts validates all required variables
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;

// Bad: Hardcoded secrets
const apiKey = 'sk-1234567890'; // Never do this
```

## Dependency Security

### Dependency Management

- Keep dependencies updated
- Review dependency security advisories
- Use automated dependency scanning
- Pin dependency versions
- Remove unused dependencies

### Vulnerability Scanning

- Run `pnpm audit` regularly
- Review GitHub Dependabot alerts
- Address high and critical vulnerabilities promptly
- Test updates before applying
- Document breaking changes

### Best Practices

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Review outdated packages
pnpm outdated
```

## API Security

### API Endpoints

- Require authentication for all API routes
- Validate all input parameters
- Implement rate limiting (when available)
- Use HTTPS only
- Return appropriate error messages (no sensitive data)

### CORS Configuration

- Configure CORS properly
- Limit allowed origins
- Use credentials only when necessary
- Review CORS policies regularly

### Best Practices

```typescript
// Good: Protected API route
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Validate input
  const body = await request.json();
  const validated = schema.parse(body);
  
  // Process request
  // ...
}
```

## Database Security

### Row Level Security

- Implement RLS policies for all tables
- Test RLS policies thoroughly
- Document RLS policy logic
- Review policies during code review
- Update policies when schema changes

### SQL Injection Prevention

- Use Supabase client methods (parameterized queries)
- Never construct SQL strings with user input
- Validate all database inputs
- Use migrations for schema changes

### Best Practices

```typescript
// Good: Using Supabase client (prevents SQL injection)
const { data } = await supabase
  .from('patients')
  .select('*')
  .eq('id', patientId); // Parameterized

// Bad: String concatenation (vulnerable to SQL injection)
// Never do this with user input
```

## Error Handling

### Error Messages

- Do not expose sensitive information in errors
- Use generic error messages for users
- Log detailed errors server-side only
- Implement proper error boundaries
- Handle errors gracefully

### Logging

- Log security-relevant events
- Do not log sensitive data
- Use structured logging
- Implement log retention policies
- Monitor logs for suspicious activity

### Best Practices

```typescript
// Good: Generic error message
try {
  // Operation
} catch (error) {
  console.error('Internal error:', error); // Server-side only
  return { error: 'An error occurred' }; // Generic user message
}
```

## File Upload Security

### File Validation

- Validate file types
- Limit file sizes
- Scan files for malware (when available)
- Store files securely
- Implement access controls

### Storage

- Use Supabase Storage with RLS
- Implement proper access policies
- Validate file names
- Sanitize file names
- Limit upload rates

## Session Management

### Sessions

- Use secure session tokens
- Implement session expiration
- Invalidate sessions on logout
- Rotate session tokens
- Monitor for suspicious sessions

## Compliance

### Healthcare Data

- Follow healthcare data regulations
- Implement data privacy controls
- Document data handling procedures
- Regular security audits
- Compliance reviews

## Security Checklist

Before deploying code:

- [ ] No secrets committed
- [ ] Input validation implemented
- [ ] Authentication required
- [ ] Authorization verified
- [ ] RLS policies in place
- [ ] Error handling secure
- [ ] Dependencies updated
- [ ] Security review completed

## Reporting Security Issues

See [SECURITY.md](../../SECURITY.md) for vulnerability reporting process.

## Resources

### Internal

- [Dependency Management](DEPENDENCY_MANAGEMENT.md)
- [Security Policy](../../SECURITY.md)

### External

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

