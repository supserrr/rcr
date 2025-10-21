# Rwanda Cancer Relief - Landing Page

## Overview

The landing page (`frontend/web/app/page.tsx`) is a comprehensive, conversion-optimized homepage built using the components from our shared UI library.

## Structure

### 1. Hero Section
**Component:** `HelixHero`
- Eye-catching 3D animated hero
- Clear value proposition: "Hope. Care. Recovery."
- Two primary CTAs: "Get Support" and "Donate Now"

### 2. Mission Section
**Custom section with values cards**
- Organization mission statement
- Three key values with icons:
  - Compassionate Care
  - Community Support
  - Access to Treatment

### 3. Services Section
**Component:** `FeaturesGrid`
- Six core services displayed in a grid:
  1. Financial Assistance
  2. Patient Navigation
  3. Counseling Services
  4. Home Care Support
  5. Nutrition Programs
  6. Transportation

### 4. Impact Statistics
**Component:** `StatsSection`
- Four key metrics:
  - Patients Supported: 2,500+
  - Families Helped: 1,800+
  - Treatment Sessions Funded: 15,000+
  - Support Groups: 45

### 5. How You Can Help
**Custom section with action cards**
- Three ways to contribute:
  - Donate
  - Volunteer
  - Spread Awareness

### 6. Call to Action
**Component:** `CallToAction`
- Encourages visitors to request support
- Clear messaging for cancer patients and families

### 7. Partners Section
**Component:** `LogoCloud`
- Displays partner organizations
- Builds credibility and trust

### 8. Contact Section
**Custom section with contact information**
- Three contact methods:
  - Physical address
  - Phone number
  - Email addresses
- Two CTAs: "Contact Us" and "Emergency Support"

### 9. Footer
**Component:** `Footer`
- Site-wide navigation
- Additional links and information

### 10. Development Tools (Dev Only)
**Fixed bottom-right panel**
- Quick access to all component demos
- Only visible in development mode
- Collapsible for easy access

---

## Customization Guide

### Update Content

#### Mission & Values
```tsx
// Edit the mission text around line 30-38
<p className="text-lg text-muted-foreground leading-relaxed">
  Rwanda Cancer Relief is dedicated to...
</p>
```

#### Services
```tsx
// Edit the features array around line 70-95
features={[
  {
    title: "Your Service",
    description: "Service description",
    icon: "🎯"
  },
  // Add more services...
]}
```

#### Statistics
```tsx
// Update stats around line 107-112
stats={[
  { label: "Your Metric", value: "1,000+" },
  // Add more stats...
]}
```

#### Contact Information
```tsx
// Update contact details around line 180-220
<p className="text-sm text-muted-foreground">
  Kigali, Rwanda<br />
  Your Address
</p>
```

### Update Colors & Branding

The landing page uses Tailwind CSS classes with the design system:
- `primary` - Primary brand color
- `muted` - Muted backgrounds
- `background` - Main background
- `foreground` - Text color

Update these in `frontend/web/app/globals.css` or your theme configuration.

### Add New Sections

To add a new section:

1. Import the component you want to use
2. Add it between existing sections
3. Wrap in a `<section>` tag with appropriate padding

Example:
```tsx
<section className="py-20 px-6 bg-muted/50">
  <div className="max-w-7xl mx-auto">
    <YourComponent />
  </div>
</section>
```

### Update CTAs (Call to Actions)

Update button links and text:
```tsx
<Button className="w-full" size="lg">
  Your CTA Text <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

Update link destinations:
```tsx
primaryButtonLink="/your-destination"
```

---

## Available Routes

Create these pages to complete the user journey:

- `/services` - Detailed services page
- `/donate` - Donation page
- `/get-support` - Support request form
- `/about` - About organization
- `/volunteer` - Volunteer sign-up

Example:
```bash
mkdir frontend/web/app/services
touch frontend/web/app/services/page.tsx
```

---

## Component Library

All components used are from `shared/ui/src/components/ui/`:

- `helix-hero.tsx` - 3D animated hero
- `features-8.tsx` - Features grid
- `stats-section.tsx` - Statistics display
- `call-to-action-1.tsx` - CTA section
- `logo-cloud.tsx` - Partner logos
- `footer.tsx` - Site footer

See `docs/overview/ALL_COMPONENTS_OVERVIEW.md` for all available components.

---

## Development

### View Landing Page
```bash
# Navigate to
http://localhost:3000
```

### Access Component Demos
- Click the "Component Demos" panel in the bottom-right corner (dev mode only)
- Or visit individual demo pages: `/demo`, `/helix-demo`, etc.

### Hot Reload
Changes to `frontend/web/app/page.tsx` will automatically reload in the browser.

---

## Best Practices

### Content
- ✅ Keep messaging clear and compassionate
- ✅ Use patient-first language
- ✅ Highlight impact and results
- ✅ Make CTAs prominent and action-oriented
- ✅ Include trust signals (partners, statistics)

### Design
- ✅ Maintain consistent spacing (py-20 for sections)
- ✅ Use max-width containers (max-w-7xl, max-w-4xl)
- ✅ Ensure responsive design (md:grid-cols-3, etc.)
- ✅ Provide good contrast for accessibility
- ✅ Use meaningful icons from lucide-react

### Performance
- ✅ All components are optimized
- ✅ Images should use Next.js Image component
- ✅ Lazy load below-the-fold content when needed

---

## Next Steps

1. **Replace placeholder content** with real data
2. **Add real partner logos** to LogoCloud
3. **Create linked pages** (/services, /donate, etc.)
4. **Add images** for a more visual experience
5. **Integrate forms** for support requests and donations
6. **Add testimonials** section with patient stories
7. **Implement analytics** to track conversions
8. **Optimize SEO** with metadata and descriptions

---

## Support

For questions about the components:
- Check `docs/components/` for integration guides
- Review `docs/guides/` for quick starts
- See component source in `shared/ui/src/components/ui/`

For landing page specific questions:
- Review this guide
- Check the inline comments in `page.tsx`
- Reference similar examples in `/demo` pages

---

**Last Updated:** October 21, 2025  
**Status:** Ready for customization  
**Built With:** Next.js 15.4.5, Tailwind CSS, shadcn/ui

