import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

/**
 * Card component that serves as a container for related content.
 * 
 * This component provides a consistent card layout with border, background,
 * and shadow styling. It can be used to group related information and
 * create visual hierarchy.
 * 
 * @param props - Standard HTML div attributes
 * @param ref - Forwarded ref
 * @returns A styled card container element
 */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

/**
 * CardHeader component for displaying the header section of a card.
 * 
 * Typically used to contain the CardTitle and CardDescription components.
 * 
 * @param props - Standard HTML div attributes
 * @param ref - Forwarded ref
 * @returns A styled card header element
 */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

/**
 * CardTitle component for displaying the title in a card header.
 * 
 * Renders as an h3 element with appropriate styling for card titles.
 * 
 * @param props - Standard HTML heading attributes
 * @param ref - Forwarded ref
 * @returns A styled card title heading element
 */
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

/**
 * CardDescription component for displaying descriptive text in a card header.
 * 
 * Provides styled paragraph text with muted foreground color.
 * 
 * @param props - Standard HTML paragraph attributes
 * @param ref - Forwarded ref
 * @returns A styled card description paragraph element
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

/**
 * CardContent component for the main content area of a card.
 * 
 * Provides consistent padding for card content.
 * 
 * @param props - Standard HTML div attributes
 * @param ref - Forwarded ref
 * @returns A styled card content container element
 */
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

/**
 * CardFooter component for the footer section of a card.
 * 
 * Typically used for actions or additional information at the bottom of a card.
 * 
 * @param props - Standard HTML div attributes
 * @param ref - Forwarded ref
 * @returns A styled card footer element
 */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

