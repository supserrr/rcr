# Parallax Scroll Component - Quick Start

## What Was Integrated

The ParallaxScrollFeatureSection component creates an engaging full-page scroll experience with smooth parallax animations for showcasing features or services.

## Files Created

1. **Component**: `/packages/ui/src/components/ui/parallax-scroll-feature-section.tsx`
2. **Demo 1**: `/apps/web/app/parallax-demo/page.tsx` (Basic demo)
3. **Demo 2**: `/apps/web/app/cancer-services/page.tsx` (Rwanda Cancer Relief context)
4. **Updated**: `/apps/web/app/page.tsx` (Added navigation)
5. **Dependency**: Added `framer-motion` to UI package

## Run the Demo

```bash
cd apps/web
pnpm dev
```

Visit:
- Main page: `http://localhost:3000`
- Basic demo: `http://localhost:3000/parallax-demo`
- Cancer services: `http://localhost:3000/cancer-services`

## Quick Usage

### Default Content

```tsx
'use client';

import { ParallaxScrollFeatureSection } from '@workspace/ui/components/ui/parallax-scroll-feature-section';

export default function MyPage() {
  return <ParallaxScrollFeatureSection />;
}
```

### Custom Content

```tsx
'use client';

import { ParallaxScrollFeatureSection } from '@workspace/ui/components/ui/parallax-scroll-feature-section';

export default function MyPage() {
  const features = [
    {
      id: 1,
      title: 'Your Feature',
      description: 'Feature description...',
      imageUrl: 'https://images.unsplash.com/photo-{id}?w=800&q=80',
      reverse: false,
    },
  ];

  return (
    <ParallaxScrollFeatureSection
      heading="Your Heading"
      scrollText="SCROLL"
      endingText="Thank You"
      sections={features}
    />
  );
}
```

## Key Features

- Scroll-triggered fade-in animations
- Clip-path image reveals
- Vertical translation effects
- Alternating layouts (text left/right)
- Fully responsive
- TypeScript typed
- Client-side rendering

## Important

Always include `'use client'` directive at the top of your file when using this component.

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `heading` | string | "PARALLAX SCROLL FEATURE SECTION" | Main heading |
| `scrollText` | string | "SCROLL" | Scroll instruction |
| `endingText` | string | "The End" | Ending text |
| `sections` | FeatureSection[] | Default sections | Feature sections array |
| `className` | string | undefined | Additional CSS classes |

### FeatureSection Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Unique identifier |
| `title` | string | Yes | Feature title |
| `description` | string | Yes | Feature description |
| `imageUrl` | string | Yes | Image URL |
| `reverse` | boolean | No | Reverse layout |

## Verification Complete

- TypeScript: No errors
- Linting: No errors
- Dependencies: framer-motion installed
- Build: Ready to deploy

## Animation Timeline

1. **Opacity**: 0 → 1 (as section enters viewport)
2. **Clip Path**: Right-to-left reveal (0-70% scroll progress)
3. **Translation**: Slide up 50px → 0 (full scroll range)

## Responsive Breakpoints

- **Mobile**: Stacked layout, smaller spacing
- **Desktop (md+)**: Side-by-side layout, larger gaps

## Next Steps

1. Customize content for your use case
2. Replace stock images with your own
3. Adjust headings and descriptions
4. Test scroll animations
5. Deploy to production

See `PARALLAX_SCROLL_INTEGRATION.md` for detailed documentation.

