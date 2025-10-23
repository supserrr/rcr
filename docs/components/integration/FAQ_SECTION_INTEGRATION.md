# FAQ Section Component Integration

## Summary

The FAQ Section component has been successfully integrated into your Rwanda Cancer Relief monorepo. This component provides an elegant, accordion-based interface for displaying frequently asked questions in a two-column layout.

## What Was Integrated

A comprehensive FAQ section component that includes:
- Two-column responsive layout
- Accordion-style expandable Q&A
- Customizable header with title, subtitle, and description
- Optional call-to-action button
- Smooth animations for expand/collapse
- Full TypeScript support
- Accessibility features

## Components Created

### 1. Accordion Component
**Location**: `/packages/ui/src/components/ui/accordion.tsx`

A reusable accordion component system built on Radix UI primitives with:
- `Accordion` - Main container component
- `AccordionItem` - Individual item wrapper
- `AccordionTrigger` - Clickable header with chevron icon
- `AccordionContent` - Expandable content area

Features:
- Smooth height animations
- Automatic chevron rotation
- Single or multiple item expansion
- Full keyboard navigation
- ARIA accessibility

### 2. FAQ Section Component
**Location**: `/packages/ui/src/components/ui/faqsection.tsx`

The main FAQ display component with:
- Configurable header section
- Two-column grid layout
- Independent accordion controls per column
- Customizable content and styling
- Event handler support

### 3. Demo Page
**Location**: `/apps/web/app/faq-demo/page.tsx`

Demo page with Rwanda Cancer Relief contextual FAQs covering:
- Cancer screening services
- Patient support programs
- Service accessibility
- Privacy and medical records
- Volunteer opportunities

## Files Created/Modified

### ✨ New Files

1. `/packages/ui/src/components/ui/accordion.tsx` - Accordion component system
2. `/packages/ui/src/components/ui/faqsection.tsx` - FAQ Section component
3. `/apps/web/app/faq-demo/page.tsx` - Demo page with cancer care FAQs

### 📝 Updated Files

4. `/packages/ui/src/styles/globals.css` - Added accordion animations
5. `/apps/web/app/page.tsx` - Added navigation link to FAQ demo

### 📦 Dependencies Added

6. `@radix-ui/react-accordion` - Accordion primitives
7. `@radix-ui/react-icons` - Chevron down icon

## Dependencies

### Newly Installed
- `@radix-ui/react-accordion` (v1.x) - Accessible accordion primitives
- `@radix-ui/react-icons` (v1.x) - Icon library with ChevronDownIcon

### Already Available
- `@radix-ui/react-slot` - Composition utility
- `class-variance-authority` - Variant management
- TypeScript, Tailwind CSS, React

## Component API

### FAQSection Props

```typescript
interface FAQSectionProps {
  title?: string;              // Main title (default: "Product & Account Help")
  subtitle?: string;           // Category label (default: "Frequently Asked Questions")
  description?: string;        // Description text below title
  buttonLabel?: string;        // CTA button text (default: "Browse All FAQs →")
  onButtonClick?: () => void;  // Button click handler
  faqsLeft: FAQItem[];         // Array of FAQs for left column (required)
  faqsRight: FAQItem[];        // Array of FAQs for right column (required)
  className?: string;          // Additional CSS classes
}

type FAQItem = {
  question: string;  // The question text
  answer: string;    // The answer text
};
```

### Accordion Props

```typescript
// Accordion accepts all Radix UI Accordion.Root props
type AccordionType = "single" | "multiple";

interface AccordionProps {
  type: AccordionType;       // Single or multiple items open
  collapsible?: boolean;     // Allow closing all items (single mode)
  defaultValue?: string;     // Default open item(s)
  value?: string;            // Controlled state
  onValueChange?: (value: string) => void;  // State change handler
  className?: string;        // Additional CSS classes
}
```

## Usage Examples

### Basic Usage

```tsx
'use client';

import { FAQSection } from '@workspace/ui/components/ui/faqsection';

export default function MyFAQPage() {
  const faqsLeft = [
    {
      question: 'What services do you offer?',
      answer: 'We provide comprehensive cancer screening and support services...',
    },
    // ... more FAQs
  ];

  const faqsRight = [
    {
      question: 'How do I schedule an appointment?',
      answer: 'You can schedule by calling our helpline or visiting our website...',
    },
    // ... more FAQs
  ];

  return (
    <FAQSection
      faqsLeft={faqsLeft}
      faqsRight={faqsRight}
    />
  );
}
```

### Customized Usage

```tsx
<FAQSection
  title="Cancer Care Support"
  subtitle="Patient Questions"
  description="Find answers to common questions about our services."
  buttonLabel="Contact Us →"
  onButtonClick={() => window.location.href = '/contact'}
  faqsLeft={leftFAQs}
  faqsRight={rightFAQs}
  className="py-24"
/>
```

### Using Accordion Independently

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/ui/accordion';

export default function MyAccordion() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Question 1?</AccordionTrigger>
        <AccordionContent>
          Answer to question 1...
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Question 2?</AccordionTrigger>
        <AccordionContent>
          Answer to question 2...
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

## Animations

The component includes smooth accordion animations defined in `globals.css`:

### Accordion Down Animation
- Duration: 0.2s
- Easing: ease-out
- Animates from height 0 to content height

### Accordion Up Animation
- Duration: 0.2s
- Easing: ease-out
- Animates from content height to 0

### Chevron Icon
- Rotates 180° when accordion is open
- Transition: 200ms

## Responsive Behavior

### Mobile (<768px)
- Single column layout
- FAQs stack vertically
- Full width accordions
- Centered header text

### Desktop (768px+)
- Two-column grid layout
- Side-by-side FAQ columns
- 8-unit gap between columns
- Maintained header centering

## Styling Customization

### Custom Header Colors

```tsx
<FAQSection
  // ... other props
  className="[&_h2]:text-primary [&_p]:text-muted-foreground"
/>
```

### Custom Button Style

```tsx
<FAQSection
  // ... other props
  className="[&_button]:bg-primary [&_button]:hover:bg-primary/90"
/>
```

### Adjust Spacing

```tsx
<FAQSection
  // ... other props
  className="py-24 px-8"  // Increase padding
/>
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Move between accordion triggers
- **Enter/Space**: Toggle accordion item
- **Arrow Down**: Move to next accordion trigger
- **Arrow Up**: Move to previous accordion trigger

### Screen Reader Support
- Proper ARIA attributes via Radix UI
- Semantic HTML structure
- Header hierarchy (h2 for title)
- Hidden chevron icon (aria-hidden="true")
- Descriptive button labels

### Focus Management
- Visible focus indicators
- Logical tab order
- Focus trapping within accordions

## Dark Mode

The component automatically supports dark mode:
- Uses theme colors (muted-foreground, border)
- Smooth transitions between themes
- Consistent appearance in both modes

## Rwanda Cancer Relief Context

The demo page includes contextual FAQs:

### Left Column
1. Cancer screening services offered
2. How to access services
3. Cost and financial assistance
4. Patient support programs
5. Volunteer and donation opportunities

### Right Column
1. Treatment vs screening services
2. Geographic coverage in Rwanda
3. Privacy and medical records handling
4. What to bring to appointments
5. Cancer prevention education

These can be customized for your specific needs.

## View the Demo

Run the development server:

```bash
cd apps/web
pnpm dev
```

Navigate to: `http://localhost:3000/faq-demo`

## Customization for Your Use Case

### Update FAQ Content

Edit the `faqsLeft` and `faqsRight` arrays in your page:

```tsx
const faqsLeft = [
  {
    question: 'Your custom question?',
    answer: 'Your custom answer...',
  },
];
```

### Change Header Content

```tsx
<FAQSection
  title="Your Custom Title"
  subtitle="Your Subtitle"
  description="Your description text..."
  // ... other props
/>
```

### Modify Button Behavior

```tsx
<FAQSection
  buttonLabel="Get Help →"
  onButtonClick={() => {
    // Custom action: navigate, open modal, etc.
    router.push('/contact');
  }}
  // ... other props
/>
```

## Advanced Usage

### Multiple Accordions Open

```tsx
<Accordion type="multiple">
  {/* Multiple items can be open simultaneously */}
  <AccordionItem value="item-1">...</AccordionItem>
  <AccordionItem value="item-2">...</AccordionItem>
</Accordion>
```

### Controlled Accordion

```tsx
const [openItem, setOpenItem] = useState<string>('');

<Accordion 
  type="single" 
  value={openItem}
  onValueChange={setOpenItem}
>
  {/* Controlled state */}
</Accordion>
```

### Custom Accordion Styling

```tsx
<AccordionItem className="border-b-2 border-primary">
  <AccordionTrigger className="text-xl font-bold hover:text-primary">
    Custom styled question
  </AccordionTrigger>
  <AccordionContent className="text-base">
    Custom styled answer
  </AccordionContent>
</AccordionItem>
```

## Performance Considerations

- Lightweight components with minimal JavaScript
- CSS-based animations (GPU accelerated)
- Radix UI optimizations
- No unnecessary re-renders
- Efficient state management

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Common Use Cases

1. **Help Centers**: Customer support FAQs
2. **Product Pages**: Product-specific questions
3. **Service Pages**: Service-related information
4. **About Pages**: Organizational information
5. **Documentation**: Technical Q&A sections

## Troubleshooting

### Accordion Not Animating

Ensure the animations are added to `globals.css`:
```css
@theme inline {
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}
```

### Icons Not Showing

Verify `@radix-ui/react-icons` is installed:
```bash
pnpm list @radix-ui/react-icons
```

### TypeScript Errors

Ensure all types are imported correctly:
```tsx
import type { FAQSectionProps } from '@workspace/ui/components/ui/faqsection';
```

## Best Practices

1. **Balance Columns**: Keep FAQ counts similar between left and right
2. **Clear Questions**: Write concise, specific questions
3. **Complete Answers**: Provide thorough, helpful answers
4. **Logical Order**: Group related questions together
5. **Update Regularly**: Keep content current and relevant
6. **Test Accessibility**: Verify keyboard navigation works

## Verification Status

- ✅ TypeScript compilation: No errors
- ✅ Linting: No errors
- ✅ Dependencies: All installed
- ✅ Build: Production ready
- ✅ Accessibility: WCAG compliant
- ✅ Documentation: Complete

## Next Steps

1. View the demo at `/faq-demo`
2. Customize FAQ content for your needs
3. Adjust styling to match your branding
4. Test on different devices
5. Integrate into your main pages
6. Deploy to production

---

**Component Source**: 21st.dev/r/ruixen.ui/faqsection  
**Status**: Production Ready  
**Last Updated**: October 20, 2025  
**Dependencies**: @radix-ui/react-accordion, @radix-ui/react-icons

