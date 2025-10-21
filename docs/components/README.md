# Component Integration Guides

Detailed integration guides for individual UI components with implementation instructions, props documentation, and use cases.

## Available Component Integrations

### Call to Action (CTA)
**[CTA_INTEGRATION.md](./CTA_INTEGRATION.md)**

A conversion-focused call-to-action component with customizable styling, animations, and action buttons.

**Features:**
- Customizable headings and descriptions
- Primary and secondary action buttons
- Framer Motion animations
- Responsive design

**Quick Start:** [CTA_QUICK_START.md](../guides/CTA_QUICK_START.md)

---

### FAQ Section
**[FAQ_SECTION_INTEGRATION.md](./FAQ_SECTION_INTEGRATION.md)**

An accordion-style FAQ component for displaying questions and answers with smooth animations.

**Features:**
- Collapsible question/answer pairs
- Smooth expand/collapse animations
- Keyboard accessible
- Mobile-friendly

**Quick Start:** [FAQ_SECTION_QUICK_START.md](../guides/FAQ_SECTION_QUICK_START.md)

---

### Feature Spotlight
**[FEATURE_SPOTLIGHT_INTEGRATION.md](./FEATURE_SPOTLIGHT_INTEGRATION.md)**

Animated feature highlight component with visual emphasis and call-to-action elements.

**Features:**
- Eye-catching animations
- Icon support
- Responsive layout
- CTA integration

**Quick Start:** [FEATURE_SPOTLIGHT_INTEGRATION.md](./FEATURE_SPOTLIGHT_INTEGRATION.md)

---

### Features Grid
**[FEATURES_GRID_INTEGRATION.md](./FEATURES_GRID_INTEGRATION.md)**

Grid layout for displaying multiple features with icons, titles, and descriptions.

**Features:**
- Responsive grid system
- Icon support
- Hover effects
- Customizable columns

**Quick Start:** [FEATURES_GRID_QUICK_START.md](../guides/FEATURES_GRID_QUICK_START.md)

---

### Footer
**[FOOTER_INTEGRATION.md](./FOOTER_INTEGRATION.md)**

Complete footer component with navigation links, social media, and branding.

**Features:**
- Multi-column layout
- Social media links
- Newsletter signup
- Copyright information
- Mobile responsive

**Quick Start:** [FOOTER_QUICK_START.md](../guides/FOOTER_QUICK_START.md)

---

### Parallax Scroll
**[PARALLAX_SCROLL_INTEGRATION.md](./PARALLAX_SCROLL_INTEGRATION.md)**

Scroll-based parallax effects for creating depth and visual interest.

**Features:**
- Smooth scroll animations
- Layered depth effects
- Performance optimized
- Customizable speed

**Quick Start:** [PARALLAX_QUICK_START.md](../guides/PARALLAX_QUICK_START.md)

---

### SVG Scroll Animation
**[SVG_SCROLL_INTEGRATION.md](./SVG_SCROLL_INTEGRATION.md)**

Animated SVG path drawing synchronized with scroll position.

**Features:**
- Path animation on scroll
- Customizable timing
- Responsive SVG
- Performance optimized

**Quick Start:** [SVG_SCROLL_QUICK_START.md](../guides/SVG_SCROLL_QUICK_START.md)

---

## General Integration Pattern

All components follow a similar integration pattern:

### 1. Installation
```bash
cd apps/web
# Component-specific installation command
```

### 2. Import
```tsx
import { ComponentName } from "@workspace/ui/components/component-name";
```

### 3. Usage
```tsx
<ComponentName
  prop1="value1"
  prop2="value2"
/>
```

### 4. Demo Page
Create a demo page in `apps/web/app/component-demo/page.tsx`

## Component Structure

Each integration guide includes:

1. **Overview** - Component purpose and features
2. **Installation** - Setup instructions
3. **Usage** - Code examples and props
4. **Customization** - Styling and variants
5. **Best Practices** - Recommendations
6. **Accessibility** - ARIA and keyboard support
7. **Examples** - Real-world use cases

## Related Documentation

- **[All Components Overview](../overview/ALL_COMPONENTS_OVERVIEW.md)** - Complete component catalog
- **[Quick Start Guides](../guides/README.md)** - Fast implementation guides
- **[Integration Summary](../overview/INTEGRATION_SUMMARY.md)** - High-level overview

---

**Total Component Integrations**: 7  
**Last Updated**: October 21, 2025

