# Feature Spotlight Component Integration

## Summary

The AnimatedFeatureSpotlight component has been successfully integrated into your monorepo codebase.

## Project Status

Your project already had all the necessary requirements:

- **TypeScript**: Fully configured
- **Tailwind CSS**: v4 with PostCSS
- **shadcn structure**: Component library in `packages/ui`
- **Dependencies**: All required packages already installed
  - `@radix-ui/react-slot`
  - `class-variance-authority`
  - `lucide-react`
  - `tw-animate-css`

## Files Created/Modified

### New Files

1. **Component**: `/packages/ui/src/components/ui/feature-spotlight.tsx`
   - Main component with TypeScript types and JSDoc documentation
   - Supports staggered entrance animations
   - Includes floating image animation
   - Fully accessible with ARIA labels

2. **Demo Page**: `/apps/web/app/feature-spotlight-demo/page.tsx`
   - Example implementation showing component usage
   - Uses Unsplash stock image for visual demonstration
   - Includes lucide-react Eye icon

### Modified Files

3. **Styles**: `/packages/ui/src/styles/globals.css`
   - Added `@keyframes float` animation
   - Added `.animate-float` utility class

## Component API

### Props

```typescript
interface AnimatedFeatureSpotlightProps {
  preheaderIcon?: React.ReactNode;      // Optional icon before preheader text
  preheaderText: string;                // Small text above heading
  heading: React.ReactNode;             // Main heading (can include JSX)
  description: string;                  // Feature description
  buttonText: string;                   // CTA button text
  buttonProps?: ComponentProps<Button>; // Additional button props
  imageUrl: string;                     // Feature image URL
  imageAlt?: string;                    // Image alt text (default: "Feature illustration")
  className?: string;                   // Additional CSS classes
}
```

## Usage Example

```tsx
'use client'; // Required if passing event handlers (onClick, etc.)

import { Eye } from 'lucide-react';
import { AnimatedFeatureSpotlight } from '@workspace/ui/components/ui/feature-spotlight';

export default function MyPage() {
  return (
    <AnimatedFeatureSpotlight
      preheaderIcon={<Eye className="h-4 w-4" />}
      preheaderText="Feature Preview"
      heading={
        <>
          <span className="text-primary">Transform</span> Your Workflow
        </>
      }
      description="Streamline your process with powerful tools and intuitive design."
      buttonText="Get Started"
      buttonProps={{ 
        onClick: () => console.log('CTA clicked'),
        variant: 'default'
      }}
      imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
      imageAlt="Dashboard preview"
    />
  );
}
```

### Important: Client Component Requirement

When passing event handlers via `buttonProps` (such as `onClick`), your page must be marked as a Client Component using the `'use client'` directive at the top of the file. This is a Next.js App Router requirement.

If you do not need interactivity, you can omit the `buttonProps.onClick` and use the button as a wrapper with a Link component instead.

## View the Demo

To see the component in action:

```bash
cd apps/web
pnpm dev
```

Then navigate to: `http://localhost:3000/feature-spotlight-demo`

## Animation Features

1. **Text Animations**: Staggered fade-in with slide-from-top effect
   - Preheader: 700ms
   - Heading: 700ms with 150ms delay
   - Description: 700ms with 300ms delay
   - Button: 700ms with 400ms delay

2. **Image Animation**: 
   - Entrance: Fade-in with zoom effect (700ms, 200ms delay)
   - Continuous: Float animation (6s loop)

## Responsive Design

- **Mobile**: Single column layout, centered text
- **Desktop (md+)**: Two-column grid, left-aligned text, image on right

## Accessibility

- Uses semantic `<section>` element
- Includes `aria-labelledby` for screen readers
- Proper heading hierarchy with `<h2>`
- Descriptive alt text for images

## Customization

### Styling

Customize the component by passing a `className` prop:

```tsx
<AnimatedFeatureSpotlight
  className="max-w-7xl shadow-2xl"
  // ... other props
/>
```

### Button Variants

The component uses your existing Button component. Customize via `buttonProps`:

```tsx
buttonProps={{
  variant: 'outline',  // default | destructive | outline | secondary | ghost | link
  size: 'lg',          // default | sm | lg | icon
  onClick: handleClick
}}
```

### Image Sources

Recommended stock image sources:
- **Unsplash**: `https://images.unsplash.com/photo-{id}?w=800&q=80`
- **Pexels**: Use their API or direct links
- **Your assets**: Place in `/apps/web/public/` and reference as `/image.png`

## Component Architecture

The component follows best practices:

- Uses `React.forwardRef` for ref forwarding
- Properly typed with TypeScript
- Documented with JSDoc comments (Google Technical Writing Style Guide)
- Follows SOLID principles
- Compatible with your monorepo structure

## Import Paths

The component uses workspace aliases:

```typescript
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
```

When using in the web app:

```typescript
import { AnimatedFeatureSpotlight } from '@workspace/ui/components/ui/feature-spotlight';
```

## Next Steps

1. Customize the demo content to match your use case
2. Replace the stock image with your own assets
3. Adjust animation timings in the component if needed
4. Add to your landing page or feature pages

## Notes

- All dependencies were already installed
- No additional packages required
- Component is production-ready
- Follows your project's coding standards and documentation guidelines

