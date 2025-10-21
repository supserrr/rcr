'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

/**
 * Data structure for a single feature section.
 */
interface FeatureSection {
  /**
   * Unique identifier for the section.
   */
  id: number;
  /**
   * Title of the feature.
   */
  title: string;
  /**
   * Description text for the feature.
   */
  description: string;
  /**
   * URL of the image to display.
   */
  imageUrl: string;
  /**
   * Whether to reverse the layout (image on left instead of right).
   */
  reverse?: boolean;
}

/**
 * Props for the ParallaxScrollFeatureSection component.
 */
interface ParallaxScrollFeatureSectionProps {
  /**
   * Main heading displayed at the top of the component.
   */
  heading?: string;
  /**
   * Scroll instruction text, defaults to "SCROLL".
   */
  scrollText?: string;
  /**
   * Ending text displayed at the bottom, defaults to "The End".
   */
  endingText?: string;
  /**
   * Array of feature sections to display.
   */
  sections?: FeatureSection[];
  /**
   * Additional CSS classes for the container.
   */
  className?: string;
}

/**
 * ParallaxScrollFeatureSection component displays a series of features
 * with parallax scroll animations.
 * 
 * As the user scrolls, each section animates in with fade, clip-path,
 * and translate effects. The component supports alternating layouts
 * for visual variety.
 * 
 * @param props - Component props
 * @returns A full-page parallax scroll feature section
 */
export const ParallaxScrollFeatureSection: React.FC<ParallaxScrollFeatureSectionProps> = ({
  heading = 'PARALLAX SCROLL FEATURE SECTION',
  scrollText = 'SCROLL',
  endingText = 'The End',
  sections = [
    {
      id: 1,
      title: 'Feature 1',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ab maxime sequi, pariatur illum, adipisci ullam optio quod tempora necessitatibus consectetur eaque deleniti id totam possimus unde dolorum inventore incidunt. Ea.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      reverse: false,
    },
    {
      id: 2,
      title: 'Feature 2',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ab maxime sequi, pariatur illum, adipisci ullam optio quod tempora necessitatibus consectetur eaque deleniti id totam possimus unde dolorum inventore incidunt. Ea.',
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
      reverse: true,
    },
    {
      id: 3,
      title: 'Feature 3',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ab maxime sequi, pariatur illum, adipisci ullam optio quod tempora necessitatibus consectetur eaque deleniti id totam possimus unde dolorum inventore incidunt. Ea.',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      reverse: false,
    },
  ],
  className,
}) => {
  // Create refs and animations for each section
  const sectionRefs = sections.map(() => useRef(null));

  const scrollYProgress = sections.map((_, index) => {
    return useScroll({
      target: sectionRefs[index],
      offset: ['start end', 'center start'],
    }).scrollYProgress;
  });

  // Create animations for each section
  const opacityContents = scrollYProgress.map((progress) =>
    useTransform(progress, [0, 0.7], [0, 1])
  );

  const clipProgresses = scrollYProgress.map((progress) =>
    useTransform(progress, [0, 0.7], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'])
  );

  const translateContents = scrollYProgress.map((progress) =>
    useTransform(progress, [0, 1], [-50, 0])
  );

  return (
    <div className={cn('', className)}>
      <div className="min-h-screen w-screen flex flex-col items-center justify-center">
        <h1 className="text-6xl max-w-2xl text-center">{heading}</h1>
        <p className="mt-20 flex items-center gap-1.5 text-sm">
          {scrollText} <ArrowDown size={15} />
        </p>
      </div>

      <div className="flex flex-col md:px-0 px-10">
        {sections.map((section, index) => (
          <div
            key={section.id}
            ref={sectionRefs[index]}
            className={cn(
              'h-screen flex items-center justify-center md:gap-40 gap-20',
              section.reverse ? 'flex-row-reverse' : '',
              'flex-col md:flex-row'
            )}
          >
            <motion.div style={{ y: translateContents[index] }}>
              <div className="text-6xl max-w-sm">{section.title}</div>
              <motion.p
                style={{ y: translateContents[index] }}
                className="text-muted-foreground max-w-sm mt-10"
              >
                {section.description}
              </motion.p>
            </motion.div>
            <motion.div
              style={{
                opacity: opacityContents[index],
                clipPath: clipProgresses[index],
              }}
              className="relative"
            >
              <img
                src={section.imageUrl}
                className="size-80 object-cover rounded-lg"
                alt={`${section.title} illustration`}
              />
            </motion.div>
          </div>
        ))}
      </div>

      <div className="min-h-screen w-screen flex flex-col items-center justify-center">
        <h1 className="text-8xl">{endingText}</h1>
      </div>
    </div>
  );
};

// Backward compatibility export
export const Component = ParallaxScrollFeatureSection;

