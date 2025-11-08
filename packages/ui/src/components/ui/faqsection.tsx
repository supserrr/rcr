'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/ui/accordion';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

/**
 * Data structure for a single FAQ item.
 */
type FAQItem = {
  /**
   * The question text.
   */
  question: string;
  /**
   * The answer text.
   */
  answer: string;
};

/**
 * Props for the FAQSection component.
 */
interface FAQSectionProps {
  /**
   * Main title of the FAQ section.
   */
  title?: string;
  /**
   * Subtitle or category label.
   */
  subtitle?: string;
  /**
   * Description text below the title.
   */
  description?: string;
  /**
   * Label for the call-to-action button.
   */
  buttonLabel?: string;
  /**
   * Callback function when the button is clicked.
   */
  onButtonClick?: () => void;
  /**
   * Array of FAQ items for the left column.
   */
  faqsLeft: FAQItem[];
  /**
   * Array of FAQ items for the right column.
   */
  faqsRight: FAQItem[];
  /**
   * Additional CSS classes for the section container.
   */
  className?: string;
}

/**
 * FAQSection component displays a two-column FAQ section with accordion-style questions.
 * 
 * This component provides a clean, organized way to present frequently asked questions
 * with expandable answers. It includes a header section with title, subtitle, description,
 * and a call-to-action button.
 * 
 * Features:
 * - Two-column responsive layout
 * - Accordion-based Q&A format
 * - Customizable header content
 * - Optional CTA button
 * - Smooth expand/collapse animations
 * 
 * @param props - Component props
 * @returns A FAQ section element with accordion-style questions
 */
export function FAQSection({
  title = 'Product & Account Help',
  subtitle = 'Frequently Asked Questions',
  description = 'Get instant answers to the most common questions about your account, product setup, and updates.',
  buttonLabel = 'Browse All FAQs →',
  onButtonClick,
  faqsLeft,
  faqsRight,
  className,
}: FAQSectionProps) {
  return (
    <section className={cn('w-full max-w-7xl mx-auto py-16 px-4', className)}>
      {/* Header */}
      <div className="text-center mb-16">
        {subtitle && (
          <p className="font-jakarta-sans text-sm text-muted-foreground font-medium tracking-wide mb-2">
            {subtitle}
          </p>
        )}
        <h2 className="font-jakarta-sans text-4xl lg:text-5xl font-semibold text-foreground mb-4">{title}</h2>
        <p className="font-jakarta-sans text-muted-foreground max-w-2xl mx-auto text-base" style={{ marginBottom: buttonLabel ? '2rem' : '0' }}>{description}</p>
        {buttonLabel && (
          <Button variant="default" className="rounded-full bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20" onClick={onButtonClick}>
            {buttonLabel}
          </Button>
        )}
      </div>

      {/* FAQs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {[faqsLeft, faqsRight].map((faqColumn, columnIndex) => (
          <Accordion key={columnIndex} type="single" collapsible className="space-y-4">
            {faqColumn.map((faq, i) => (
              <AccordionItem key={i} value={`item-${columnIndex}-${i}`} className="border-primary/10">
                <AccordionTrigger className="font-jakarta-sans text-base font-semibold text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-jakarta-sans text-sm text-muted-foreground leading-relaxed">
                  <div className="min-h-[40px] transition-all duration-200 ease-in-out">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ))}
      </div>
    </section>
  );
}

