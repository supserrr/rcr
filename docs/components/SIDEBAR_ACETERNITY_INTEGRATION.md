# Aceternity Sidebar Component Integration

## Overview

The Aceternity sidebar component has been successfully integrated into the Rwanda Cancer Relief frontend application.

## Component Location

The sidebar component has been added to:
- **Shared UI Package**: `packages/ui/src/components/ui/sidebar-aceternity.tsx`
- **Demo Component**: `apps/web/components/ui/sidebar-aceternity-demo.tsx`

## Project Structure Support

### ✅ Confirmed Support

1. **shadcn/ui Structure**: ✓
   - Components are in the standard `components/ui` folder structure
   - Compatible with shadcn CLI

2. **Tailwind CSS**: ✓
   - Already configured with CSS variables
   - Supports dark mode
   - Uses Tailwind's utility classes

3. **TypeScript**: ✓
   - Fully typed with TypeScript interfaces
   - Type-safe component props

## Dependencies

### ✅ Already Installed

- `framer-motion`: ^12.23.24 (installed)
- `lucide-react`: ^0.475.0 (installed)
- `next`: ^16.0.1 (installed)
- `react`: ^19.2.0 (installed)
- `react-dom`: ^19.2.0 (installed)

**No additional dependencies need to be installed.**

## Component Usage

### Basic Usage

```tsx
import { Sidebar, SidebarBody, SidebarLink } from "@workspace/ui/components/ui/sidebar-aceternity";
import Link from "next/link";
import { LayoutDashboard, Settings } from "lucide-react";

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Logo />
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink 
                key={idx} 
                link={link}
                as={Link}
              />
            ))}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
```

### With Next.js Link Component

The component supports Next.js Link component via the `as` prop:

```tsx
<SidebarLink 
  link={link}
  as={Link}  // Use Next.js Link for client-side navigation
  className="rounded-md px-3 py-2"
/>
```

### Demo Component

A complete demo component is available at:
`apps/web/components/ui/sidebar-aceternity-demo.tsx`

You can import and use it directly:

```tsx
import { SidebarAceternityDemo } from "@/components/ui/sidebar-aceternity-demo";

function Page() {
  return <SidebarAceternityDemo height="h-screen" />;
}
```

## Component Features

### Desktop Sidebar
- Expands to 300px width when open
- Collapses to 60px width when closed (shows only icons)
- Auto-expands on mouse hover
- Smooth animations using Framer Motion

### Mobile Sidebar
- Hamburger menu trigger
- Full-screen overlay when open
- Smooth slide-in/out animations
- Close button in top-right corner

### Customization
- Fully customizable with className props
- Supports dark mode via Tailwind
- Animate prop to control animations
- Controlled/uncontrolled state modes

## Differences from Original

The component has been adapted for the monorepo structure:

1. **Import Paths**: Uses `../../lib/utils` instead of `@/lib/utils`
2. **Link Component**: Made optional via `as` prop for Next.js compatibility
3. **Styling**: Uses Tailwind CSS variables compatible with the existing theme system
4. **Location**: Added to shared UI package for reuse across apps

## Key Adaptations

1. **Removed Next.js Direct Dependency**: The component doesn't directly import `next/link`, making it reusable in the shared UI package
2. **Flexible Link Component**: Accepts a custom link component via the `as` prop
3. **Monorepo Paths**: All imports use relative paths or workspace aliases
4. **Theme Compatible**: Uses neutral colors that work with both light and dark modes

## Integration Checklist

- [x] Component copied to correct location
- [x] Imports adapted for monorepo structure
- [x] Dependencies verified (all installed)
- [x] TypeScript types checked
- [x] ESLint checks passed
- [x] Demo component created
- [x] Next.js Link compatibility added
- [x] Dark mode support confirmed

## Next Steps

To use the component in your application:

1. Import the component:
   ```tsx
   import { Sidebar, SidebarBody, SidebarLink } from "@workspace/ui/components/ui/sidebar-aceternity";
   ```

2. Create your links array with icons from `lucide-react`

3. Wrap your content with the `Sidebar` component

4. Use `SidebarLink` with Next.js `Link` component for navigation:
   ```tsx
   <SidebarLink link={link} as={Link} />
   ```

## Notes

- The component uses `framer-motion` for animations
- Icons should be from `lucide-react` (already installed)
- The component supports both controlled and uncontrolled state
- Mobile trigger is always visible on mobile devices
- Desktop sidebar auto-expands on hover by default

