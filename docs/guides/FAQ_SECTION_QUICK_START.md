# FAQ Section Component - Quick Start

## What Was Integrated

The FAQ Section component provides an elegant, two-column accordion-based interface for displaying frequently asked questions with smooth animations and full accessibility support.

## Files Created

1. **Accordion Component**: `/packages/ui/src/components/ui/accordion.tsx` (Reusable)
2. **FAQ Section Component**: `/packages/ui/src/components/ui/faqsection.tsx`
3. **Demo Page**: `/apps/web/app/faq-demo/page.tsx` (Rwanda Cancer Relief context)
4. **Updated**: `/packages/ui/src/styles/globals.css` (Accordion animations)
5. **Updated**: `/apps/web/app/page.tsx` (Added navigation)

## Run the Demo

```bash
cd apps/web
pnpm dev
```

Visit:
- Main page: `http://localhost:3000`
- FAQ demo: `http://localhost:3000/faq-demo`

## Quick Usage

### Complete FAQ Section

```tsx
'use client';

import { FAQSection } from '@workspace/ui/components/ui/faqsection';

export default function MyFAQPage() {
  const faqsLeft = [
    {
      question: 'What services do you provide?',
      answer: 'We offer comprehensive cancer screening...',
    },
    {
      question: 'How can I schedule an appointment?',
      answer: 'You can call our helpline or visit online...',
    },
  ];

  const faqsRight = [
    {
      question: 'Are services free?',
      answer: 'Yes, we provide free screening services...',
    },
    {
      question: 'What areas do you serve?',
      answer: 'We serve all regions of Rwanda...',
    },
  ];

  return (
    <FAQSection
      faqsLeft={faqsLeft}
      faqsRight={faqsRight}
    />
  );
}
```

### Customized FAQ Section

```tsx
<FAQSection
  title="Cancer Care Support"
  subtitle="Patient Questions"
  description="Find answers to your questions."
  buttonLabel="Contact Us →"
  onButtonClick={() => router.push('/contact')}
  faqsLeft={leftFAQs}
  faqsRight={rightFAQs}
  className="py-24"
/>
```

### Standalone Accordion

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Question?</AccordionTrigger>
    <AccordionContent>Answer...</AccordionContent>
  </AccordionItem>
</Accordion>
```

## Key Features

- Two-column responsive layout
- Smooth accordion animations
- Customizable header section
- Optional CTA button
- Full keyboard navigation
- ARIA accessible
- Dark mode support
- TypeScript typed

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | "Product & Account Help" | Main section title |
| `subtitle` | string | "Frequently Asked Questions" | Category label |
| `description` | string | Default text | Description below title |
| `buttonLabel` | string | "Browse All FAQs →" | CTA button text |
| `onButtonClick` | function | undefined | Button click handler |
| `faqsLeft` | FAQItem[] | **Required** | Left column FAQs |
| `faqsRight` | FAQItem[] | **Required** | Right column FAQs |
| `className` | string | undefined | Additional CSS classes |

### FAQItem Type

```typescript
type FAQItem = {
  question: string;  // The question text
  answer: string;    // The answer text
};
```

## Responsive Behavior

| Screen Size | Layout |
|-------------|--------|
| Mobile (<768px) | Single column, stacked |
| Desktop (768px+) | Two columns, side-by-side |

## Keyboard Navigation

- **Tab**: Move between triggers
- **Enter/Space**: Toggle accordion
- **Arrow Down**: Next trigger
- **Arrow Up**: Previous trigger

## Accordion Modes

### Single Mode (Default)
Only one item can be open at a time:

```tsx
<Accordion type="single" collapsible>
  {/* Only one item open */}
</Accordion>
```

### Multiple Mode
Multiple items can be open simultaneously:

```tsx
<Accordion type="multiple">
  {/* Multiple items can be open */}
</Accordion>
```

## Customization Examples

### Custom Styling

```tsx
<FAQSection
  faqsLeft={leftFAQs}
  faqsRight={rightFAQs}
  className="bg-muted/50 rounded-xl"
/>
```

### Custom Button Action

```tsx
<FAQSection
  faqsLeft={leftFAQs}
  faqsRight={rightFAQs}
  buttonLabel="Get Help Now →"
  onButtonClick={() => {
    // Custom action
    window.location.href = '/contact';
  }}
/>
```

### Hide Button

```tsx
<FAQSection
  faqsLeft={leftFAQs}
  faqsRight={rightFAQs}
  buttonLabel=""  // Empty string hides button
/>
```

## Rwanda Cancer Relief Context

The demo includes 10 contextual FAQs:

**Left Column (5 FAQs)**:
1. Cancer screening services
2. How to access services
3. Cost and financial assistance
4. Patient support programs
5. Volunteer opportunities

**Right Column (5 FAQs)**:
1. Treatment vs screening
2. Geographic coverage
3. Privacy and records
4. What to bring to appointments
5. Cancer prevention education

## Common Use Cases

1. **Help Centers**: Customer support pages
2. **Service Pages**: Explain service offerings
3. **Product Pages**: Product-specific questions
4. **About Pages**: Organization information
5. **Support Sections**: Technical documentation

## Verification Complete

- ✅ TypeScript: No errors
- ✅ Linting: No errors
- ✅ Dependencies: All installed
- ✅ Build: Production ready
- ✅ Animations: Working smoothly
- ✅ Accessibility: WCAG compliant

## Dependencies Installed

New dependencies added:
- `@radix-ui/react-accordion` - Accordion primitives
- `@radix-ui/react-icons` - ChevronDown icon

Already available:
- `@radix-ui/react-slot`
- `class-variance-authority`

## Animations Added

Added to `globals.css`:

```css
@theme inline {
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}

@keyframes accordion-down { /* ... */ }
@keyframes accordion-up { /* ... */ }
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Best Practices

1. **Balance Columns**: Keep FAQ counts similar between columns
2. **Clear Questions**: Write concise, searchable questions
3. **Complete Answers**: Provide thorough responses
4. **Logical Grouping**: Organize related questions together
5. **Regular Updates**: Keep content current

## Troubleshooting

### Accordion Not Animating

Check that animations are in `globals.css`:
```css
--animate-accordion-down: accordion-down 0.2s ease-out;
--animate-accordion-up: accordion-up 0.2s ease-out;
```

### TypeScript Errors

Ensure proper imports:
```tsx
import { FAQSection } from '@workspace/ui/components/ui/faqsection';
```

### Icons Not Showing

Verify installation:
```bash
pnpm list @radix-ui/react-icons
```

## Next Steps

1. ✅ View the demo at `/faq-demo`
2. 📝 Replace FAQs with your content
3. 🎨 Customize header text
4. 🔘 Set up button action
5. 📱 Test responsive layout
6. 🚀 Deploy to production

## Advanced Usage

### Controlled State

```tsx
const [openItem, setOpenItem] = useState('');

<Accordion 
  type="single" 
  value={openItem}
  onValueChange={setOpenItem}
>
  {/* Controlled */}
</Accordion>
```

### Default Open Item

```tsx
<Accordion type="single" defaultValue="item-1">
  {/* First item open by default */}
</Accordion>
```

### Custom Trigger Style

```tsx
<AccordionTrigger className="text-xl font-bold hover:text-primary">
  Custom Question
</AccordionTrigger>
```

See `FAQ_SECTION_INTEGRATION.md` for detailed documentation.

---

**Status**: Production Ready  
**Complexity**: Simple  
**Dependencies**: @radix-ui/react-accordion, @radix-ui/react-icons

