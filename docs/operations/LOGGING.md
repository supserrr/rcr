# Logging Standards

This document outlines logging practices and standards for the Rwanda Cancer Relief project.

## Overview

Effective logging is essential for debugging, monitoring, and understanding system behavior. This guide establishes logging standards.

## Logging Principles

### What to Log

- **Errors**: All errors and exceptions
- **Important Events**: User actions, system events
- **Performance**: Slow operations, timeouts
- **Security**: Authentication attempts, authorization failures
- **Debug Info**: Development debugging information

### What Not to Log

- **Sensitive Data**: Passwords, tokens, PII
- **Excessive Detail**: Verbose logs in production
- **Personal Information**: User PII without consent

## Log Levels

### Standard Levels

- **ERROR**: Error events that might still allow the application to continue
- **WARN**: Warning messages for potentially harmful situations
- **INFO**: Informational messages highlighting progress
- **DEBUG**: Detailed information for debugging

### Usage Guidelines

```typescript
// ERROR: System errors, exceptions
logger.error('Failed to fetch user data', { error, userId });

// WARN: Deprecations, recoverable issues
logger.warn('Using deprecated API endpoint', { endpoint });

// INFO: Important events, milestones
logger.info('User signed in', { userId });

// DEBUG: Detailed debugging information
logger.debug('Processing request', { requestId, method });
```

## Logging Format

### Structured Logging

Use structured logging with consistent format:

```typescript
logger.info('User action', {
  userId: 'user-123',
  action: 'session_created',
  sessionId: 'session-456',
  timestamp: new Date().toISOString(),
});
```

### Log Format

- **Timestamp**: ISO 8601 format
- **Level**: Log level
- **Message**: Human-readable message
- **Context**: Additional structured data

## Implementation

### Server-Side Logging

```typescript
// API routes
export async function GET(request: Request) {
  const logger = getLogger();
  
  try {
    logger.info('Fetching user data', { userId });
    const user = await fetchUser(userId);
    logger.info('User data fetched', { userId });
    return Response.json(user);
  } catch (error) {
    logger.error('Failed to fetch user', { error, userId });
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
```

### Client-Side Logging

```typescript
// Client components
'use client';

import { logger } from '@/lib/logger';

export function Component() {
  const handleClick = () => {
    logger.info('Button clicked', { component: 'Component' });
    // Handle click
  };
}
```

## Logging Tools

### Recommended Tools

- **Console**: For development
- **Structured Logging**: For production
- **Error Tracking**: Sentry or similar
- **Log Aggregation**: Centralized log management

### Implementation

```typescript
// lib/logger.ts
export const logger = {
  error: (message: string, context?: object) => {
    console.error(JSON.stringify({ level: 'error', message, ...context }));
  },
  warn: (message: string, context?: object) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...context }));
  },
  info: (message: string, context?: object) => {
    console.info(JSON.stringify({ level: 'info', message, ...context }));
  },
  debug: (message: string, context?: object) => {
    console.debug(JSON.stringify({ level: 'debug', message, ...context }));
  },
};
```

## Best Practices

### Context

- Include relevant context
- Use structured data
- Avoid sensitive information
- Make logs searchable

### Performance

- Don't log in hot paths
- Use appropriate log levels
- Batch logs when possible
- Consider log volume

### Security

- Never log secrets
- Sanitize user input
- Follow data regulations
- Review logs regularly

## Log Retention

### Retention Policies

- **Development**: Short retention
- **Staging**: Medium retention
- **Production**: Long retention with archiving

### Compliance

- Follow data retention regulations
- Archive logs appropriately
- Secure log storage
- Control log access

## Resources

- [Structured Logging](https://www.structuredlogging.org/)
- [Logging Best Practices](https://www.loggly.com/ultimate-guide/node-logging-basics/)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

