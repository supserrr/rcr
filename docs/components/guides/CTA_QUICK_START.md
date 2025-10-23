# Call-to-Action Component - Quick Start

## What Was Integrated

The Call-to-Action (CTA) component provides conversion-focused sections with two distinct visual styles: a bold purple gradient variant and a clean light variant with dual buttons.

## Files Created

1. **CTA Component**: `/packages/ui/src/components/ui/call-to-action-1.tsx`
2. **Demo Page**: `/apps/web/app/cta-demo/page.tsx` (4 Rwanda Cancer Relief examples)
3. **Updated**: `/apps/web/app/page.tsx` (Added navigation)

## Run the Demo

```bash
cd apps/web
pnpm dev
```

Visit:
- Main page: `http://localhost:3000`
- CTA demo: `http://localhost:3000/cta-demo`

## Quick Usage

### Gradient Variant (Bold)

```tsx
'use client';

import { CallToAction } from '@workspace/ui/components/ui/call-to-action-1';

export default function MyPage() {
  const avatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&q=80',
  ];

  return (
    <CallToAction
      variant="gradient"
      heading="Join the fight against cancer"
      description="Be part of our mission"
      primaryButtonText="Get Started"
      communityText="Join 5,000+ volunteers"
      avatars={avatars}
      onPrimaryClick={() => console.log('Clicked')}
    />
  );
}
```

### Light Variant (Clean)

```tsx
<CallToAction
  variant="light"
  heading="Support cancer patients in need"
  description="Your donation makes a difference"
  primaryButtonText="Donate Now"
  secondaryButtonText="Learn More"
  onPrimaryClick={() => console.log('Donate')}
  onSecondaryClick={() => console.log('Learn')}
/>
```

### Minimal (Gradient)

```tsx
<CallToAction
  heading="Get Started Today"
  primaryButtonText="Sign Up"
/>
```

### Minimal (Light)

```tsx
<CallToAction
  variant="light"
  heading="Ready to help?"
  primaryButtonText="Join Us"
/>
```

## Key Features

- Two visual variants (gradient/light)
- Community badge with avatars
- Single or dual-button layouts
- Responsive design
- Event handlers
- TypeScript typed
- No new dependencies

## Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `heading` | string | ✅ | - | Main heading text |
| `description` | string | ❌ | - | Description below heading |
| `primaryButtonText` | string | ✅ | - | Primary button text |
| `secondaryButtonText` | string | ❌ | - | Secondary button (light only) |
| `onPrimaryClick` | function | ❌ | - | Primary button handler |
| `onSecondaryClick` | function | ❌ | - | Secondary button handler |
| `variant` | 'gradient' \| 'light' | ❌ | 'gradient' | Visual style |
| `communityText` | string | ❌ | - | Badge text (gradient only) |
| `avatars` | string[] | ❌ | [] | Avatar URLs (gradient only) |
| `className` | string | ❌ | - | Additional CSS classes |

## Variants Comparison

### Gradient Variant
- **Style**: Purple gradient background
- **Text**: White with gradient effect
- **Button**: Single violet button
- **Badge**: Community badge with avatars
- **Best For**: High-impact hero sections, campaigns

### Light Variant
- **Style**: White background with border
- **Text**: Dark gray
- **Buttons**: Two buttons (primary + secondary)
- **Icon**: Arrow on secondary button
- **Best For**: Content sections, forms, newsletters

## Responsive Behavior

| Screen | Layout |
|--------|--------|
| Mobile (<768px) | Full width, stacked buttons |
| Desktop (768px+) | Centered, side-by-side buttons |

## Rwanda Cancer Relief Examples

The demo includes 4 contextual examples:

1. **Volunteer Recruitment** (Gradient)
   - "Join the fight against cancer in Rwanda"
   - Community: 5,000+ healthcare heroes

2. **Donation Campaign** (Light)
   - "Support cancer patients in need"
   - Two buttons: Donate + Learn More

3. **Mobile Screening** (Gradient)
   - "Schedule a free cancer screening"
   - Community: Serving 500+ communities

4. **Newsletter** (Light)
   - "Stay informed about cancer prevention"
   - Two buttons: Subscribe + Archives

## Customization

### Change Colors (Gradient)

```tsx
<CallToAction
  heading="Custom CTA"
  primaryButtonText="Go"
  className="bg-gradient-to-b from-blue-600 to-blue-900"
/>
```

### Add Spacing

```tsx
<CallToAction
  variant="light"
  heading="Spacious CTA"
  primaryButtonText="Action"
  className="py-24"
/>
```

### Navigation Handler

```tsx
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const router = useRouter();
  
  return (
    <CallToAction
      heading="Get Started"
      primaryButtonText="Sign Up"
      onPrimaryClick={() => router.push('/signup')}
    />
  );
}
```

## Common Use Cases

1. **Landing Page Hero**: Gradient variant
2. **Donation Section**: Light variant with two buttons
3. **Service Booking**: Gradient variant
4. **Newsletter Signup**: Light variant
5. **Event Registration**: Either variant
6. **Campaign Launch**: Gradient variant

## Avatar Requirements

- **Size**: 50x50px recommended
- **Format**: JPEG, PNG, WebP
- **Aspect Ratio**: Square (1:1)
- **Max Display**: 3 avatars shown

## Best Practices

### Headlines
- Keep under 10 words
- Use action-oriented language
- Create urgency
- Focus on benefits

### Buttons
- Use strong verbs
- Be specific
- Keep short (2-3 words)
- Match user intent

### Descriptions
- Under 30 words
- Active voice
- Address concerns
- Expand on headline

## Verification Complete

- ✅ TypeScript: No errors
- ✅ Linting: No errors
- ✅ Dependencies: No new installs
- ✅ Build: Production ready
- ✅ Responsive: Mobile + Desktop
- ✅ Documentation: Complete

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Next Steps

1. ✅ View demo at `/cta-demo`
2. 🎨 Choose variant for your use case
3. 📝 Customize heading and description
4. 🔘 Set up event handlers
5. 🖼️ Add your team avatars
6. 📱 Test responsive layout
7. 🚀 Deploy to production

See `CTA_INTEGRATION.md` for detailed documentation.

---

**Status**: Production Ready  
**Complexity**: Simple  
**No New Dependencies**

