# Dependency Management Guide

This document outlines dependency management practices for the Rwanda Cancer Relief project.

## Overview

Proper dependency management ensures security, stability, and maintainability. This guide covers dependency management practices.

## Package Manager

### pnpm

The project uses **pnpm** as the package manager.

**Why pnpm**:
- Efficient disk usage
- Fast installation
- Strict dependency resolution
- Workspace support

## Adding Dependencies

### Process

1. **Check if needed**: Is there an existing solution?
2. **Research**: Check maintenance, security, license
3. **Add dependency**: Use appropriate command
4. **Test**: Verify it works
5. **Commit**: Include lock file

### Commands

```bash
# Production dependency
pnpm add package-name

# Development dependency
pnpm add -D package-name

# In specific workspace
pnpm --filter @apps/web add package-name
```

## Updating Dependencies

### Regular Updates

Update dependencies regularly for:

- Security patches
- Bug fixes
- New features
- Compatibility

### Update Process

```bash
# Check outdated packages
pnpm outdated

# Update all dependencies
pnpm update

# Update specific package
pnpm update package-name

# Update to latest (may include breaking changes)
pnpm update --latest package-name
```

## Security

### Vulnerability Scanning

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```

### Dependabot

GitHub Dependabot automatically:

- Monitors dependencies
- Creates PRs for updates
- Alerts on vulnerabilities

## Best Practices

### Version Pinning

- Use exact versions for critical dependencies
- Use caret ranges for most dependencies (`^1.2.3`)
- Review major version updates carefully

### License Compliance

- Review all dependency licenses
- Ensure license compatibility
- Document license requirements

### Dependency Review

- Review before adding
- Remove unused dependencies
- Consolidate similar dependencies
- Regular dependency audits

## Resources

- [Dependency Management Documentation](security/DEPENDENCY_MANAGEMENT.md)
- [pnpm Documentation](https://pnpm.io/)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

