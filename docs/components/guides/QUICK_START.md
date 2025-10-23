# Feature Spotlight Component - Quick Start

## What Was Integrated

The AnimatedFeatureSpotlight component has been successfully integrated into your Rwanda Cancer Relief monorepo.

## Files Created

1. **Component**: `/packages/ui/src/components/ui/feature-spotlight.tsx`
2. **Demo Page 1**: `/apps/web/app/feature-spotlight-demo/page.tsx` (Original demo)
3. **Demo Page 2**: `/apps/web/app/services-demo/page.tsx` (Rwanda Cancer Relief context)
4. **Updated Styles**: `/packages/ui/src/styles/globals.css` (Added float animation)
5. **Updated Homepage**: `/apps/web/app/page.tsx` (Added navigation links)

## Run the Demo

```bash
cd apps/web
pnpm dev
```

Visit:
- Main page: `http://localhost:3000`
- Original demo: `http://localhost:3000/feature-spotlight-demo`
- Services demo: `http://localhost:3000/services-demo`

## Quick Usage

```tsx
'use client'; // Required when using event handlers!

import { Heart } from 'lucide-react';
import { AnimatedFeatureSpotlight } from '@workspace/ui/components/ui/feature-spotlight';

export default function MyPage() {
  return (
    <AnimatedFeatureSpotlight
      preheaderIcon={<Heart className="h-4 w-4" />}
      preheaderText="Your Preheader"
      heading={<>Your <span className="text-primary">Heading</span></>}
      description="Your description text goes here."
      buttonText="Call to Action"
      buttonProps={{ onClick: () => console.log('clicked') }}
      imageUrl="https://images.unsplash.com/photo-{id}?w=800&q=80"
      imageAlt="Alt text for image"
    />
  );
}
```

**Note**: Add `'use client'` at the top of your file when passing event handlers via `buttonProps`.

## Key Features

- Staggered entrance animations
- Floating image animation
- Fully responsive (mobile-first)
- TypeScript typed
- Accessible (ARIA labels)
- Works with existing Button component

## Verification Complete

- TypeScript: No errors
- Linting: No errors  
- Dependencies: All installed
- Build: Ready to deploy

## Next Steps

1. Customize content for your use case
2. Replace stock images with your own assets
3. Integrate into your landing or feature pages
4. Adjust animation timings if needed

See `FEATURE_SPOTLIGHT_INTEGRATION.md` for detailed documentation.

