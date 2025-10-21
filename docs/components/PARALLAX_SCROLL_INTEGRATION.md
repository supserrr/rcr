# Parallax Scroll Feature Section Integration

## Summary

The ParallaxScrollFeatureSection component has been successfully integrated into your Rwanda Cancer Relief monorepo. This component creates an engaging full-page scroll experience with parallax animations.

## What Was Integrated

A full-page parallax scroll component that displays features or services with smooth scroll-triggered animations including:
- Fade-in effects
- Clip-path reveals
- Vertical translation animations
- Alternating layouts

## Dependencies Installed

### New Package
- **framer-motion**: Animation library for React (installed in `@workspace/ui`)

### Existing Packages
- `lucide-react`: Already installed for icons
- TypeScript: Already configured
- Tailwind CSS: Already set up

## Files Created/Modified

### New Files

1. **Component**: `/packages/ui/src/components/ui/parallax-scroll-feature-section.tsx`
   - Main component with TypeScript interfaces
   - Configurable sections with scroll animations
   - Full JSDoc documentation
   - Responsive design

2. **Demo Page 1**: `/apps/web/app/parallax-demo/page.tsx`
   - Basic demo with default content
   - Shows component capabilities

3. **Demo Page 2**: `/apps/web/app/cancer-services/page.tsx`
   - Rwanda Cancer Relief contextual demo
   - Four service sections with custom content
   - Demonstrates customization options

### Modified Files

4. **Homepage**: `/apps/web/app/page.tsx`
   - Added navigation links to new demos

5. **UI Package**: `/packages/ui/package.json`
   - Added framer-motion dependency

## Component API

### Props

```typescript
interface ParallaxScrollFeatureSectionProps {
  heading?: string;              // Main heading at top (default: "PARALLAX SCROLL FEATURE SECTION")
  scrollText?: string;           // Scroll instruction text (default: "SCROLL")
  endingText?: string;           // Ending text at bottom (default: "The End")
  sections?: FeatureSection[];   // Array of feature sections
  className?: string;            // Additional CSS classes
}

interface FeatureSection {
  id: number;                    // Unique identifier
  title: string;                 // Feature title
  description: string;           // Feature description
  imageUrl: string;              // Image URL
  reverse?: boolean;             // Reverse layout (image on left)
}
```

## Usage Examples

### Basic Usage

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

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      title: 'Service One',
      description: 'Description for service one...',
      imageUrl: 'https://images.unsplash.com/photo-{id}?w=800&q=80',
      reverse: false,
    },
    {
      id: 2,
      title: 'Service Two',
      description: 'Description for service two...',
      imageUrl: 'https://images.unsplash.com/photo-{id}?w=800&q=80',
      reverse: true, // Image on left
    },
  ];

  return (
    <ParallaxScrollFeatureSection
      heading="Our Services"
      scrollText="EXPLORE"
      endingText="Contact Us Today"
      sections={services}
    />
  );
}
```

## View the Demos

To see the component in action:

```bash
cd apps/web
pnpm dev
```

Then navigate to:
- **Basic Demo**: `http://localhost:3000/parallax-demo`
- **Cancer Services**: `http://localhost:3000/cancer-services`

## Animation Features

### Scroll-Triggered Animations

1. **Opacity**: Elements fade in as they enter the viewport (0 to 1)
2. **Clip Path**: Images reveal with a wipe effect (right to left)
3. **Translation**: Text elements slide up into position (−50px to 0)

### Animation Timing

- **Trigger Point**: Starts when section enters bottom of viewport
- **Complete Point**: Finishes when section reaches center
- **Progress Range**: 0 to 0.7 for most effects

## Responsive Design

### Desktop (md+)
- Two-column layout with text and image side-by-side
- 40px gap between columns
- Full parallax effects

### Mobile
- Single column stacked layout
- 20px spacing
- Reduced padding
- Maintains animation effects

### Layout Variations

- **Normal**: Text left, image right
- **Reverse**: Image left, text right (set `reverse: true`)

## Customization Options

### Content Customization

```tsx
<ParallaxScrollFeatureSection
  heading="Your Custom Heading"
  scrollText="SCROLL DOWN"
  endingText="Thank You"
  sections={yourSections}
  className="bg-custom-gradient"
/>
```

### Styling

The component uses Tailwind CSS and respects your theme colors:
- Background: Uses default background color
- Text: Uses foreground color
- Muted Text: Uses muted-foreground color

### Images

Recommended image specifications:
- **Size**: 800x800px (square)
- **Format**: JPEG or WebP
- **Quality**: 80% compression
- **Source**: Unsplash URLs work great

Example Unsplash format:
```
https://images.unsplash.com/photo-{photo-id}?w=800&q=80
```

## Important Notes

### Client Component

This component **must** be used in a Client Component because it uses:
- React hooks (`useRef`, `useState`)
- Framer Motion animations
- Scroll event listeners

Always include `'use client'` at the top of your file when using this component.

### Performance Considerations

- Each section creates its own scroll progress tracker
- Animations are GPU-accelerated via transform properties
- Images should be optimized for web

### Accessibility

- Images include alt text describing the feature
- Semantic HTML structure
- Keyboard navigation support through scroll
- Screen reader compatible

## Browser Support

Works in all modern browsers that support:
- CSS `clip-path` property
- Intersection Observer API (via Framer Motion)
- ES6+ JavaScript

## Integration with Your App

### Best Use Cases

1. **Landing Pages**: Showcase key features
2. **Services Pages**: Display service offerings
3. **Product Tours**: Guide users through features
4. **Portfolio Sites**: Show project highlights

### Rwanda Cancer Relief Context

The `/cancer-services` page demonstrates a practical implementation with:
- Early Detection Programs
- Patient Support Services
- Community Education
- Treatment Access

This provides a template for how to structure and present services in a compelling, scroll-driven format.

## Troubleshooting

### Images Not Loading

- Verify image URLs are accessible
- Check CORS settings for external images
- Use Unsplash or local assets

### Animations Not Working

- Ensure `'use client'` directive is present
- Check that framer-motion is installed
- Verify scroll position is changing

### Layout Issues

- Test responsive breakpoints
- Check Tailwind CSS classes
- Verify flexbox properties

## Next Steps

1. Replace stock images with your own assets
2. Customize section content for your use case
3. Adjust animation timings if desired
4. Add to your main navigation
5. Consider adding transition effects between sections

## Technical Details

### Dependencies

```json
{
  "framer-motion": "^11.x",
  "lucide-react": "^0.475.0"
}
```

### Component Structure

- Uses `useScroll` hook for scroll progress tracking
- Implements `useTransform` for animation value mapping
- Creates refs for each section dynamically
- Maps animation values to visual properties

### Performance Optimizations

- Uses CSS transforms (GPU-accelerated)
- Leverages Framer Motion's optimized animation engine
- Implements efficient scroll listeners
- Minimal re-renders with proper memoization

## Additional Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Scroll Animations Guide](https://www.framer.com/motion/scroll-animations/)
- [useScroll Hook](https://www.framer.com/motion/use-scroll/)

---

The component is production-ready and follows your project's coding standards and documentation guidelines!

