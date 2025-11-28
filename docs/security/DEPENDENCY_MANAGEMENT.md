# Dependency Management

This document outlines dependency management practices for the Rwanda Cancer Relief project.

## Overview

Proper dependency management is essential for security, stability, and maintainability. This guide provides practices for managing project dependencies.

## Dependency Types

### Production Dependencies

Dependencies required for the application to run in production.

- Installed in production environments
- Included in production builds
- Should be minimal and well-maintained

### Development Dependencies

Dependencies required only for development.

- Not installed in production
- Used for building, testing, and tooling
- Can include development tools and utilities

## Package Manager

### pnpm

This project uses **pnpm** as the package manager.

**Why pnpm**:
- Efficient disk usage with content-addressable storage
- Fast installation with hard linking
- Strict dependency resolution
- Workspace support for monorepos

### Installation

```bash
# Install pnpm globally
npm install -g pnpm

# Or enable corepack (recommended)
corepack enable
```

## Adding Dependencies

### Process

1. **Check if dependency is needed**
   - Is there an existing solution?
   - Does it fit the project architecture?
   - Is it well-maintained?

2. **Research the dependency**
   - Check GitHub stars and activity
   - Review security advisories
   - Check bundle size impact
   - Review license compatibility

3. **Add the dependency**
   ```bash
   # Production dependency
   pnpm add package-name
   
   # Development dependency
   pnpm add -D package-name
   
   # In specific workspace
   pnpm --filter @apps/web add package-name
   ```

4. **Update lock file**
   - `pnpm-lock.yaml` is automatically updated
   - Commit the lock file

5. **Test the dependency**
   - Verify it works as expected
   - Check for breaking changes
   - Test in development and build

### Best Practices

- Add dependencies to the correct workspace
- Use exact versions for critical dependencies
- Document why dependency was added
- Review dependency size and impact

## Updating Dependencies

### Regular Updates

Update dependencies regularly to:

- Fix security vulnerabilities
- Get bug fixes
- Access new features
- Maintain compatibility

### Update Process

1. **Check for updates**
   ```bash
   pnpm outdated
   ```

2. **Review changelogs**
   - Check for breaking changes
   - Review new features
   - Check security fixes

3. **Update dependencies**
   ```bash
   # Update all dependencies
   pnpm update
   
   # Update specific package
   pnpm update package-name
   
   # Update to latest (may include breaking changes)
   pnpm update --latest
   ```

4. **Test updates**
   - Run tests
   - Check for breaking changes
   - Verify functionality
   - Test build process

5. **Commit updates**
   - Update lock file
   - Document breaking changes
   - Update documentation if needed

### Update Strategy

- **Patch updates**: Apply automatically (security fixes)
- **Minor updates**: Review and test before applying
- **Major updates**: Plan migration, test thoroughly

## Security

### Vulnerability Scanning

Regularly scan for vulnerabilities:

```bash
# Check for known vulnerabilities
pnpm audit

# Fix vulnerabilities automatically (when possible)
pnpm audit --fix
```

### Dependabot

GitHub Dependabot is configured to:

- Monitor dependencies for vulnerabilities
- Create PRs for security updates
- Alert on known vulnerabilities

### Security Best Practices

- Review Dependabot alerts promptly
- Address high and critical vulnerabilities immediately
- Test security updates before applying
- Document security-related updates

## Dependency Review

### Before Adding

- Is it necessary?
- Is it well-maintained?
- Is it secure?
- What's the bundle size impact?
- Is the license compatible?

### Regular Review

- Review unused dependencies quarterly
- Remove unused dependencies
- Consolidate similar dependencies
- Review dependency tree size

### Removing Dependencies

```bash
# Remove dependency
pnpm remove package-name

# Remove from specific workspace
pnpm --filter @apps/web remove package-name
```

## Monorepo Dependencies

### Workspace Dependencies

In a monorepo, dependencies can be:

- **Root dependencies**: Shared across workspaces
- **Workspace dependencies**: Specific to a workspace
- **Internal dependencies**: Dependencies on other workspaces

### Internal Dependencies

```json
{
  "dependencies": {
    "@workspace/ui": "workspace:*"
  }
}
```

Use `workspace:*` for internal package references.

## Lock File

### pnpm-lock.yaml

The lock file ensures:

- Consistent dependency versions
- Reproducible installations
- Version resolution tracking

### Best Practices

- Always commit the lock file
- Never manually edit the lock file
- Regenerate if corrupted: `pnpm install --force`

## Dependency Policies

### Version Pinning

- **Exact versions**: For critical dependencies
- **Caret ranges**: For most dependencies (`^1.2.3`)
- **Tilde ranges**: For patch updates only (`~1.2.3`)

### License Compliance

- Review all dependency licenses
- Ensure license compatibility
- Document license requirements
- Maintain license file

## Troubleshooting

### Common Issues

**Issue**: Dependency conflicts
- **Solution**: Use `pnpm why` to trace dependencies
- **Solution**: Update conflicting packages
- **Solution**: Use resolutions if necessary

**Issue**: Installation failures
- **Solution**: Clear cache: `pnpm store prune`
- **Solution**: Delete `node_modules` and reinstall
- **Solution**: Check network connectivity

**Issue**: Version mismatches
- **Solution**: Update lock file
- **Solution**: Use `pnpm install --force`

## Automation

### CI/CD Integration

Dependency checks are automated:

- Vulnerability scanning
- Dependency updates
- License checking
- Build verification

### Scripts

```bash
# Check outdated packages
pnpm outdated

# Audit dependencies
pnpm audit

# Update dependencies
pnpm update
```

## Resources

### Internal

- [Security Guidelines](SECURITY_GUIDELINES.md)
- [Development Guide](../DEVELOPMENT.md)

### External

- [pnpm Documentation](https://pnpm.io/)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [Snyk Vulnerability Database](https://snyk.io/vuln)

---

**Last Updated**: [Date]
**Maintained By**: Development Team

