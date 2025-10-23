# Quick Start Guides

Step-by-step guides for quickly implementing components in your Rwanda Cancer Relief project.

## Available Quick Start Guides

### General Quick Start
**[QUICK_START.md](./QUICK_START.md)**

Get started with the Rwanda Cancer Relief monorepo project.

**Covers:**
- Project setup
- Development server
- Creating demo pages
- Basic workflow

---

### Call to Action Quick Start
**[CTA_QUICK_START.md](./CTA_QUICK_START.md)**

Quickly add a call-to-action component to your pages.

**Time to implement:** 5 minutes

**What you'll add:**
- CTA component
- Custom styling
- Action buttons
- Animations

**Full Guide:** [CTA_INTEGRATION.md](../components/CTA_INTEGRATION.md)

---

### FAQ Section Quick Start
**[FAQ_SECTION_QUICK_START.md](./FAQ_SECTION_QUICK_START.md)**

Quickly add an FAQ accordion to your pages.

**Time to implement:** 5 minutes

**What you'll add:**
- FAQ accordion
- Question/answer pairs
- Expand/collapse animations
- Mobile responsive design

**Full Guide:** [FAQ_SECTION_INTEGRATION.md](../components/FAQ_SECTION_INTEGRATION.md)

---

### Features Grid Quick Start
**[FEATURES_GRID_QUICK_START.md](./FEATURES_GRID_QUICK_START.md)**

Quickly add a features grid to showcase capabilities.

**Time to implement:** 10 minutes

**What you'll add:**
- Responsive grid
- Feature cards
- Icons
- Descriptions

**Full Guide:** [FEATURES_GRID_INTEGRATION.md](../components/FEATURES_GRID_INTEGRATION.md)

---

### Footer Quick Start
**[FOOTER_QUICK_START.md](./FOOTER_QUICK_START.md)**

Quickly add a complete footer to your site.

**Time to implement:** 10 minutes

**What you'll add:**
- Multi-column footer
- Navigation links
- Social media links
- Copyright info

**Full Guide:** [FOOTER_INTEGRATION.md](../components/FOOTER_INTEGRATION.md)

---

### Parallax Scroll Quick Start
**[PARALLAX_QUICK_START.md](./PARALLAX_QUICK_START.md)**

Quickly add parallax scroll effects to your pages.

**Time to implement:** 5 minutes

**What you'll add:**
- Parallax wrapper
- Layered elements
- Scroll animations
- Depth effects

**Full Guide:** [PARALLAX_SCROLL_INTEGRATION.md](../components/PARALLAX_SCROLL_INTEGRATION.md)

---

### SVG Scroll Animation Quick Start
**[SVG_SCROLL_QUICK_START.md](./SVG_SCROLL_QUICK_START.md)**

Quickly add animated SVG path drawings to your pages.

**Time to implement:** 5 minutes

**What you'll add:**
- SVG component
- Path animation
- Scroll trigger
- Custom timing

**Full Guide:** [SVG_SCROLL_INTEGRATION.md](../components/SVG_SCROLL_INTEGRATION.md)

---

## Quick Start Philosophy

These guides are designed to get you up and running quickly with minimal configuration.

### What Quick Start Guides Include

- **Installation command** - One-line setup
- **Minimal code** - Copy-paste ready
- **Basic example** - Working demo
- **Next steps** - Link to full guide

### What Quick Start Guides Don't Include

- Detailed explanations (see full integration guides)
- Advanced customization (see component docs)
- All props and options (see API reference)

## General Quick Start Pattern

### 1. Install
```bash
cd apps/web
# Install command specific to component
```

### 2. Import
```tsx
import { Component } from "@workspace/ui/components/component";
```

### 3. Use
```tsx
<Component />
```

### 4. Customize
Check the full integration guide for customization options.

## When to Use Quick Start vs Full Guide

### Use Quick Start When:
- You want to get something working immediately
- You're prototyping or testing
- You need a basic implementation
- Time is limited

### Use Full Integration Guide When:
- You need to customize extensively
- You want to understand how it works
- You're implementing for production
- You need accessibility features

## Related Documentation

- **[Component Integration Guides](../components/README.md)** - Detailed component docs
- **[All Components Overview](../overview/ALL_COMPONENTS_OVERVIEW.md)** - Complete catalog
- **[Setup Documentation](../setup/COMPONENT_LIBRARY_README.md)** - Project setup

## Tips for Success

### Before You Start
- Ensure dependencies are installed: `pnpm install`
- Start dev server: `pnpm dev`
- Have your code editor ready

### While Implementing
- Copy code exactly as shown
- Check for TypeScript errors
- Test in browser immediately
- Refer to demo pages for examples

### After Implementation
- Customize to match your design
- Test responsiveness
- Check accessibility
- Review full integration guide

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Review the full integration guide
3. Look at demo pages in `apps/web/app/*-demo/`
4. Check component source in `packages/ui/src/components/`

## Next Steps

After completing a quick start:

1. **Customize the component** - Match your brand and design
2. **Review the full guide** - Understand all options
3. **Test thoroughly** - Check all screen sizes
4. **Add to production** - Integrate into your actual pages

---

**Total Quick Start Guides**: 7  
**Average Implementation Time**: 5-10 minutes  
**Last Updated**: October 21, 2025

