# Call-to-Action Component Integration

## Summary

The Call-to-Action (CTA) component has been successfully integrated into your Rwanda Cancer Relief monorepo. This component provides compelling, conversion-focused sections perfect for driving user actions such as donations, volunteer signups, or service bookings.

## What Was Integrated

A versatile call-to-action component with two distinct variants:
- **Gradient Variant**: Eye-catching purple gradient background with community badge
- **Light Variant**: Clean white background with two-button layout

Perfect for landing pages, campaign sections, and conversion-focused areas.

## Component Created

### CallToAction Component
**Location**: `/packages/ui/src/components/ui/call-to-action-1.tsx`

A flexible CTA component that supports:
- Two visual variants (gradient and light)
- Community badge with avatars (gradient variant)
- Single or dual-button layouts
- Customizable headings and descriptions
- Click event handlers
- Full TypeScript support

### Demo Page
**Location**: `/apps/web/app/cta-demo/page.tsx`

Demo page featuring four contextual examples:
1. Volunteer recruitment (gradient)
2. Donation campaign (light)
3. Mobile screening booking (gradient)
4. Newsletter signup (light)

## Files Created/Modified

### ✨ New Files

1. `/packages/ui/src/components/ui/call-to-action-1.tsx` - CTA component
2. `/apps/web/app/cta-demo/page.tsx` - Demo page with cancer relief context

### 📝 Updated Files

3. `/apps/web/app/page.tsx` - Added "Call to Action" navigation link

## Dependencies

No new dependencies required! The component uses:
- Existing utilities (`cn` from utils)
- `lucide-react` (already installed) for the arrow icon
- Standard React and Tailwind CSS

## Component API

### Props

```typescript
interface CallToActionProps {
  heading: string;                    // Main heading text (required)
  description?: string;               // Description below heading
  primaryButtonText: string;          // Primary button text (required)
  secondaryButtonText?: string;       // Secondary button text
  onPrimaryClick?: () => void;        // Primary button handler
  onSecondaryClick?: () => void;      // Secondary button handler
  variant?: 'gradient' | 'light';     // Visual variant (default: 'gradient')
  communityText?: string;             // Community badge text (gradient only)
  avatars?: string[];                 // Avatar URLs (gradient only, max 3)
  className?: string;                 // Additional CSS classes
}
```

## Usage Examples

### Gradient Variant - Volunteer Recruitment

```tsx
'use client';

import { CallToAction } from '@workspace/ui/components/ui/call-to-action-1';

export default function VolunteerPage() {
  const avatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&q=80',
  ];

  return (
    <CallToAction
      variant="gradient"
      heading="Join the fight against cancer"
      description="Be part of our mission to save lives"
      primaryButtonText="Become a Volunteer"
      communityText="Join 5,000+ healthcare heroes"
      avatars={avatars}
      onPrimaryClick={() => router.push('/volunteer')}
    />
  );
}
```

### Light Variant - Donation Campaign

```tsx
<CallToAction
  variant="light"
  heading="Support cancer patients in need"
  description="Your donation provides free screenings and treatment support."
  primaryButtonText="Donate Now"
  secondaryButtonText="Learn More"
  onPrimaryClick={() => router.push('/donate')}
  onSecondaryClick={() => router.push('/about')}
/>
```

### Minimal Usage (Gradient)

```tsx
<CallToAction
  heading="Get Started Today"
  primaryButtonText="Sign Up"
  onPrimaryClick={() => console.log('Clicked')}
/>
```

### Minimal Usage (Light)

```tsx
<CallToAction
  variant="light"
  heading="Ready to make a difference?"
  primaryButtonText="Get Started"
  onPrimaryClick={() => console.log('Clicked')}
/>
```

## Variant Comparison

### Gradient Variant

**Visual Style:**
- Purple gradient background (`from-[#5524B7] to-[#380B60]`)
- White text with gradient heading effect
- Purple button with hover effect
- Community badge with avatars

**Best For:**
- High-impact conversion sections
- Hero CTAs on landing pages
- Campaign announcements
- Community-focused calls to action

**Features:**
- Community badge (optional)
- Up to 3 avatar images
- Gradient text heading effect
- Single prominent button

### Light Variant

**Visual Style:**
- White background with border
- Dark text for contrast
- Two-button layout (primary + secondary)
- Arrow icon on secondary button

**Best For:**
- Content sections
- Multiple action options
- Form submissions
- Newsletter signups

**Features:**
- Two-button layout
- Hover animations
- Arrow icon with slide effect
- Clean, professional appearance

## Responsive Behavior

### Mobile (<768px)
- Single column layout
- Full-width buttons
- Smaller text sizes
- Stacked button layout (light variant)
- Reduced padding

### Desktop (768px+)
- Centered content
- Larger heading text
- Side-by-side buttons (light variant)
- Optimal spacing
- Maximum width container

## Styling Customization

### Custom Background

```tsx
<CallToAction
  variant="gradient"
  heading="Custom CTA"
  primaryButtonText="Click Me"
  className="bg-gradient-to-r from-blue-600 to-purple-600"
/>
```

### Custom Width

```tsx
<CallToAction
  variant="light"
  heading="Wide CTA"
  primaryButtonText="Action"
  className="max-w-7xl"
/>
```

### Custom Spacing

```tsx
<CallToAction
  heading="Spaced CTA"
  primaryButtonText="Go"
  className="py-24 px-8"
/>
```

## Community Badge (Gradient Variant)

The community badge displays:
- Up to 3 avatar images (overlapping)
- Custom text message
- Semi-transparent purple background
- Border with purple accent

### Avatar Requirements

- **Format**: JPEG, PNG, WebP
- **Size**: 50x50px recommended
- **Crop**: Square (1:1 aspect ratio)
- **Source**: Unsplash or your own images

### Example Avatar URLs

```typescript
const avatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&q=80',
];
```

## Button Behavior

### Primary Button (Gradient)
- Violet background (`bg-violet-600`)
- Hover darkens (`hover:bg-violet-700`)
- Uppercase text
- Rounded full
- White text

### Primary Button (Light)
- Indigo background (`bg-indigo-500`)
- Hover darkens (`hover:bg-indigo-600`)
- Regular case text
- Rounded full
- White text

### Secondary Button (Light Only)
- Indigo border
- Indigo text
- Hover background (`hover:bg-indigo-50`)
- Arrow icon with slide animation
- Rounded full

## Event Handlers

### Navigation Example

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

### Analytics Tracking

```tsx
<CallToAction
  heading="Join Us"
  primaryButtonText="Register"
  onPrimaryClick={() => {
    // Track event
    analytics.track('CTA Clicked', { section: 'hero' });
    // Navigate
    router.push('/register');
  }}
/>
```

### Form Submission

```tsx
<CallToAction
  variant="light"
  heading="Subscribe"
  primaryButtonText="Submit"
  onPrimaryClick={() => {
    // Handle form submission
    handleSubmit();
  }}
/>
```

## Rwanda Cancer Relief Context

The demo page includes four contextual examples:

### 1. Volunteer Recruitment (Gradient)
- Heading: "Join the fight against cancer in Rwanda"
- Community: "Join 5,000+ healthcare heroes"
- Button: "Become a Volunteer"

### 2. Donation Campaign (Light)
- Heading: "Support cancer patients in need"
- Two buttons: "Donate Now" and "Learn More"
- Description about screening and treatment support

### 3. Mobile Screening (Gradient)
- Heading: "Schedule a free cancer screening today"
- Community: "Serving 500+ communities"
- Button: "Book Screening"

### 4. Newsletter Signup (Light)
- Heading: "Stay informed about cancer prevention"
- Two buttons: "Subscribe" and "View Archives"
- Description about monthly updates

## View the Demo

Run the development server:

```bash
cd apps/web
pnpm dev
```

Navigate to: `http://localhost:3000/cta-demo`

## Accessibility

The component includes:
- Semantic HTML (h1 for headings)
- Descriptive button text
- Alt text for avatar images
- Proper color contrast
- Keyboard navigation support
- Focus visible states

## Best Practices

### Heading Text
- Keep it concise (under 10 words)
- Use action-oriented language
- Make it benefit-focused
- Create urgency when appropriate

### Button Text
- Use strong action verbs
- Be specific (not just "Click Here")
- Keep it short (2-3 words ideal)
- Match user intent

### Description
- Expand on the heading
- Address user concerns
- Keep it under 30 words
- Use active voice

### Avatar Selection
- Use diverse, representative images
- Ensure professional quality
- Match your brand aesthetic
- Show real community members when possible

## Common Use Cases

1. **Landing Page Hero**: Gradient variant with volunteer signup
2. **Donation Section**: Light variant with donation and info buttons
3. **Service Booking**: Gradient variant for screening appointments
4. **Newsletter**: Light variant with subscribe option
5. **Event Registration**: Either variant for event signups
6. **Campaign Launch**: Gradient variant for announcements

## Performance

- Lightweight component
- No external font loading required
- Optimized images (use appropriate sizes)
- CSS-only animations
- Minimal JavaScript

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Avatars Not Overlapping

Ensure Tailwind's negative margin utilities are working:
```tsx
className="-translate-x-2"  // For second avatar
className="-translate-x-4"  // For third avatar
```

### Button Click Not Working

Verify the handler is passed correctly:
```tsx
<CallToAction
  onPrimaryClick={() => console.log('Clicked')}  // Test function
/>
```

### Text Not Visible (Gradient)

Check the gradient heading is rendering:
```tsx
className="bg-gradient-to-r from-white to-[#CAABFF] text-transparent bg-clip-text"
```

## Verification Status

- ✅ TypeScript compilation: No errors
- ✅ Linting: No errors
- ✅ Dependencies: No new installs needed
- ✅ Build: Production ready
- ✅ Accessibility: Keyboard navigable
- ✅ Documentation: Complete

## Next Steps

1. View the demo at `/cta-demo`
2. Choose appropriate variant for your use case
3. Customize heading and description
4. Set up event handlers
5. Replace avatar images with your team photos
6. Test on different devices
7. Deploy to production

---

**Component Source**: 21st.dev/r/prebuiltui/call-to-action-1  
**Status**: Production Ready  
**Last Updated**: October 20, 2025  
**No New Dependencies Required**

