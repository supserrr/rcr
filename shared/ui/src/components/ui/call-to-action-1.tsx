import { cn } from '@workspace/ui/lib/utils';
import { ArrowRight } from 'lucide-react';

/**
 * Props for the CallToAction component.
 */
interface CallToActionProps {
  /**
   * Main heading text.
   */
  heading: string;
  /**
   * Description text below the heading.
   */
  description?: string;
  /**
   * Primary button text.
   */
  primaryButtonText: string;
  /**
   * Secondary button text (optional).
   */
  secondaryButtonText?: string;
  /**
   * Primary button click handler.
   */
  onPrimaryClick?: () => void;
  /**
   * Secondary button click handler.
   */
  onSecondaryClick?: () => void;
  /**
   * Variant style: gradient (purple gradient) or light (white background).
   */
  variant?: 'gradient' | 'light';
  /**
   * Community badge text (only for gradient variant).
   */
  communityText?: string;
  /**
   * Array of avatar image URLs (only for gradient variant).
   */
  avatars?: string[];
  /**
   * Additional CSS classes.
   */
  className?: string;
}

/**
 * CallToAction component displays a compelling call-to-action section.
 * 
 * This component provides two variants:
 * - Gradient: Purple gradient background with community badge
 * - Light: White background with two-button layout
 * 
 * Perfect for landing pages, conversion sections, or promotional banners.
 * 
 * @param props - Component props
 * @returns A call-to-action section element
 */
export function CallToAction({
  heading,
  description,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
  variant = 'gradient',
  communityText,
  avatars = [],
  className,
}: CallToActionProps) {
  if (variant === 'gradient') {
    return (
      <div
        className={cn(
          'max-w-5xl py-16 md:w-full mx-2 md:mx-auto flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#5524B7] to-[#380B60] rounded-2xl p-10 text-white',
          className
        )}
      >
        {communityText && avatars.length > 0 && (
          <div className="flex flex-wrap items-center justify-center p-1 rounded-full bg-purple-600/10 backdrop-blur border border-purple-500/40 text-sm">
            <div className="flex items-center">
              {avatars.slice(0, 3).map((avatar, index) => (
                <img
                  key={index}
                  className={cn(
                    'size-6 md:size-7 rounded-full border-3 border-white',
                    index > 0 && `-translate-x-${index * 2}`
                  )}
                  src={avatar}
                  alt={`Community member ${index + 1}`}
                />
              ))}
            </div>
            <p className="-translate-x-2 font-medium">{communityText}</p>
          </div>
        )}
        <h1 className="text-4xl md:text-5xl md:leading-[60px] font-semibold max-w-xl mt-5 bg-gradient-to-r from-white to-[#CAABFF] text-transparent bg-clip-text">
          {heading}
        </h1>
        {description && (
          <p className="text-purple-200 mt-4 max-w-2xl">{description}</p>
        )}
        <button
          onClick={onPrimaryClick}
          className="px-8 py-3 text-white bg-violet-600 hover:bg-violet-700 transition-all rounded-full uppercase text-sm mt-8"
        >
          {primaryButtonText}
        </button>
      </div>
    );
  }

  // Light variant
  return (
    <div
      className={cn(
        'flex flex-col items-center bg-white py-16 px-4 max-w-5xl w-full text-center border border-gray-200 rounded-2xl',
        className
      )}
    >
      <h1 className="text-3xl sm:text-4xl font-semibold sm:font-bold text-gray-800">
        {heading}
      </h1>
      {description && (
        <p className="max-w-2xl text-slate-500 mt-4 max-sm:text-sm">{description}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-sm:w-full">
        {secondaryButtonText && (
          <button
            type="button"
            onClick={onSecondaryClick}
            className="group flex items-center justify-center gap-2 px-6 py-2 border border-indigo-500 rounded-full text-indigo-500 hover:bg-indigo-50 transition-all"
          >
            {secondaryButtonText}
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-all" />
          </button>
        )}
        <button
          type="button"
          onClick={onPrimaryClick}
          className="bg-indigo-500 hover:bg-indigo-600 transition-all px-4 py-2 text-white font-medium rounded-full"
        >
          {primaryButtonText}
        </button>
      </div>
    </div>
  );
}

