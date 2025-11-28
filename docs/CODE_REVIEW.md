# Code Review Guidelines

This document outlines code review practices and standards for the Rwanda Cancer Relief project.

## Overview

Code review is a critical part of maintaining code quality. This guide establishes review standards, processes, and best practices.

## Review Process

### When to Request Review

- All code changes require review before merging
- Create pull request for all changes
- Request review from at least one team member
- Wait for approval before merging

### Review Timeline

- **Target**: Reviews within 24 hours
- **Urgent**: Expedited review for critical fixes
- **Follow-up**: Address feedback promptly

## Review Checklist

### Code Quality

- [ ] Code follows [code style guide](development/CODE_STYLE.md)
- [ ] No linting errors
- [ ] Type checking passes
- [ ] Tests pass
- [ ] Code is readable and maintainable

### Functionality

- [ ] Changes work as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance is acceptable

### Security

- [ ] No secrets or credentials exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization verified
- [ ] Security best practices followed

### Testing

- [ ] Tests added for new features
- [ ] Tests updated for changes
- [ ] Tests pass locally
- [ ] Edge cases tested

### Documentation

- [ ] Code is well-commented
- [ ] JSDoc added for public APIs
- [ ] Documentation updated if needed
- [ ] README updated if applicable

## Review Focus Areas

### Architecture

- Changes align with architecture
- No unnecessary complexity
- Follows established patterns
- Maintains separation of concerns

### Performance

- No performance regressions
- Efficient algorithms used
- Appropriate caching
- Optimized database queries

### Accessibility

- Semantic HTML used
- ARIA labels when needed
- Keyboard navigation works
- Screen reader compatible

### Security

- Input validation
- Authentication checks
- Authorization verified
- No security vulnerabilities

## Review Comments

### Types of Comments

- **Approval**: Code is ready to merge
- **Request Changes**: Issues must be addressed
- **Suggestions**: Optional improvements
- **Questions**: Clarification needed

### Comment Guidelines

- Be constructive and respectful
- Explain why, not just what
- Suggest solutions when possible
- Focus on code, not person

### Example Comments

```typescript
// Good comment
// Consider extracting this logic into a utility function
// for reusability. This pattern is used in multiple places.

// Bad comment
// This is wrong
// Fix this
```

## Review Best Practices

### For Authors

- Write clear PR descriptions
- Break large changes into smaller PRs
- Respond to feedback promptly
- Address all review comments
- Update PR based on feedback

### For Reviewers

- Review promptly
- Be constructive and respectful
- Ask questions when unclear
- Approve when satisfied
- Provide specific feedback

## PR Requirements

### PR Description

- Clear description of changes
- Why changes were made
- How to test changes
- Screenshots if UI changes
- Related issues referenced

### PR Checklist

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] CI checks pass

## Approval Requirements

### Standard Changes

- One approval required
- All CI checks must pass
- No blocking review comments

### Critical Changes

- Multiple approvals may be required
- Security review for security-related changes
- Architecture review for major changes

## Common Issues

### Code Style

- Inconsistent formatting
- Missing type annotations
- Unused imports
- Long functions

### Security

- Exposed secrets
- Missing input validation
- Insecure API calls
- Missing authentication

### Performance

- Inefficient queries
- Missing memoization
- Unnecessary re-renders
- Large bundle size

## Review Tools

### Automated Checks

- ESLint for code quality
- TypeScript for type checking
- Tests for functionality
- CI/CD for automation

### Manual Review

- Code reading
- Testing changes locally
- Checking documentation
- Verifying security

## Resources

- [Code Style Guide](development/CODE_STYLE.md)
- [Testing Guide](testing/README.md)
- [Security Guidelines](security/SECURITY_GUIDELINES.md)
- [Development Guide](DEVELOPMENT.md)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

