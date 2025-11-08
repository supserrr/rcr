'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';
import { ChevronDownIcon } from '@radix-ui/react-icons';

/**
 * Accordion component that allows showing and hiding content sections.
 * 
 * This component provides an accessible, collapsible container for
 * content that users can expand and collapse. Built on Radix UI primitives.
 * 
 * @example
 * ```tsx
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Question 1</AccordionTrigger>
 *     <AccordionContent>Answer 1</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
const Accordion = AccordionPrimitive.Root;

/**
 * AccordionItem component representing a single item in an accordion.
 * 
 * Each item contains a trigger (button) and content that can be expanded/collapsed.
 * 
 * @param props - Standard Radix UI AccordionItem props
 * @param ref - Forwarded ref
 * @returns An accordion item element
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b border-border', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

/**
 * AccordionTrigger component that acts as the clickable header for an accordion item.
 * 
 * This button toggles the visibility of the associated content. Includes
 * a chevron icon that rotates when the item is open.
 * 
 * @param props - Standard Radix UI AccordionTrigger props
 * @param ref - Forwarded ref
 * @returns An accordion trigger button element
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-left font-semibold transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        width={16}
        height={16}
        className="shrink-0 opacity-60 transition-transform duration-200"
        aria-hidden="true"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

/**
 * AccordionContent component that contains the expandable content.
 * 
 * This component animates smoothly when opening and closing using
 * Radix UI's data attributes and CSS animations.
 * 
 * @param props - Standard Radix UI AccordionContent props
 * @param ref - Forwarded ref
 * @returns An accordion content container element
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };

