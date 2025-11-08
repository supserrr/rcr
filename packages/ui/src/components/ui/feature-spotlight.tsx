import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';

/**
 * Props for the AnimatedFeatureSpotlight component.
 * 
 * This component displays a feature spotlight section with animated text content
 * and an accompanying image.
 */
interface AnimatedFeatureSpotlightProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Optional icon to display before the preheader text.
   */
  preheaderIcon?: React.ReactNode;
  /**
   * Text displayed in the preheader section.
   */
  preheaderText: string;
  /**
   * Main heading content, can include styled elements.
   */
  heading: React.ReactNode;
  /**
   * Description text for the feature.
   */
  description: string;
  /**
   * Text displayed on the call-to-action button.
   */
  buttonText: string;
  /**
   * Additional props to pass to the Button component.
   */
  buttonProps?: React.ComponentProps<typeof Button>;
  /**
   * URL of the image to display.
   */
  imageUrl: string;
  /**
   * Alt text for the image, defaults to "Feature illustration".
   */
  imageAlt?: string;
}

/**
 * AnimatedFeatureSpotlight component displays a feature section with animated
 * text content and an accompanying image.
 * 
 * The component includes staggered entrance animations for text elements and
 * a floating animation for the image.
 * 
 * @param props - Component props
 * @param ref - Forwarded ref
 * @returns A feature spotlight section element
 */
const AnimatedFeatureSpotlight = React.forwardRef<HTMLElement, AnimatedFeatureSpotlightProps>(
  (
    {
      className,
      preheaderIcon,
      preheaderText,
      heading,
      description,
      buttonText,
      buttonProps,
      imageUrl,
      imageAlt = 'Feature illustration',
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          'w-full max-w-6xl mx-auto p-8 md:p-12 rounded-2xl bg-background border overflow-hidden',
          className
        )}
        aria-labelledby="feature-spotlight-heading"
        {...props}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Animated Text Content */}
          <div className="flex flex-col space-y-6 text-center md:text-left items-center md:items-start">
            <div
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-top-4 duration-700"
            >
              {preheaderIcon}
              <span>{preheaderText}</span>
            </div>
            <h2
              id="feature-spotlight-heading"
              className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-top-4 duration-700 delay-150"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
              {description}
            </p>
            <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-400">
              <Button size="lg" {...buttonProps}>
                {buttonText}
              </Button>
            </div>
          </div>

          {/* Right Column: Animated Visual */}
          <div className="relative w-full min-h-[250px] md:min-h-[320px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-700 delay-200">
            {/* Main Image with both entrance and continuous animations */}
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full max-w-md object-contain animate-float"
            />
          </div>
        </div>
      </section>
    );
  }
);
AnimatedFeatureSpotlight.displayName = 'AnimatedFeatureSpotlight';

export { AnimatedFeatureSpotlight };

