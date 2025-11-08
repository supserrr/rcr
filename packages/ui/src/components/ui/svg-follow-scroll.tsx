'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import React, { useRef } from 'react';

/**
 * Props for the LinePath component.
 */
interface LinePathProps {
  /**
   * Additional CSS classes.
   */
  className: string;
  /**
   * Scroll progress value from Framer Motion.
   */
  scrollYProgress: any;
}

/**
 * LinePath component that renders an animated SVG path.
 * 
 * The path draws progressively as the user scrolls, creating
 * a smooth visual effect that follows scroll progress.
 * 
 * @param props - Component props
 * @returns An animated SVG path element
 */
const LinePath = ({ className, scrollYProgress }: LinePathProps) => {
  const pathLength = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  return (
    <svg
      width="1278"
      height="2319"
      viewBox="0 0 1278 2319"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        d="M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"
        stroke="#9333EA"
        strokeWidth="20"
        opacity="0.25"
        style={{
          pathLength,
          strokeDashoffset: useTransform(pathLength, (value) => 1 - value),
        }}
      />
    </svg>
  );
};

/**
 * SvgFollowScroll component demonstrates an animated SVG path that follows scroll progress.
 * 
 * This component creates a visually engaging scroll experience where an SVG path
 * progressively draws as the user scrolls down the page. The component includes:
 * - A large heading section at the top
 * - An animated SVG path that draws based on scroll position
 * - A content section at the bottom
 * 
 * The component uses Framer Motion's scroll-linked animations to create
 * smooth, performant animations tied to the scroll progress.
 * 
 * @returns A full-height section with scroll-animated SVG
 */
const SvgFollowScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
  });

  return (
    <section
      ref={ref}
      className="mx-auto flex h-[350vh] w-screen flex-col items-start overflow-hidden bg-background text-foreground"
    >
      <div className="min-h-screen flex items-center relative w-full max-w-2xl">
        <div className="relative flex flex-col items-start justify-start gap-6 text-left pl-6 lg:pl-12">
        <h1 className="font-jakarta-sans relative z-10 text-5xl font-medium tracking-[-0.02em] lg:text-7xl text-foreground">
          Compassionate Cancer Support, Wherever You Are
        </h1>
        <p className="font-jakarta-sans relative z-10 text-lg lg:text-xl font-normal text-muted-foreground leading-relaxed">
          Living with cancer is not just a medical journey. It's an emotional one. Rwanda Cancer Relief offers counseling and culturally adapted resources to support patients and families through every step, accessible anytime, anywhere.
        </p>
        
        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-row gap-3 lg:gap-4">
          <a href="/get-help" className="inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 text-sm lg:text-base font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/20 whitespace-nowrap">
            Get Help
          </a>
          <a href="/counselor" className="inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 text-sm lg:text-base font-semibold text-primary bg-background border-2 border-primary rounded-full hover:bg-primary/10 transition-all duration-200 whitespace-nowrap">
            I'm a Counselor
          </a>
        </div>

        {/* Mobile & iPad: Behind text */}
        <LinePath
          className="absolute -right-[40%] top-0 z-0 lg:hidden"
          scrollYProgress={scrollYProgress}
        />
        {/* Desktop: Next to text */}
        <LinePath
          className="absolute left-full top-0 z-0 -ml-96 hidden lg:block"
          scrollYProgress={scrollYProgress}
        />
        </div>
      </div>

      {/* Section Title */}
      <div className="relative w-full pt-20 text-center px-6">
        <h2 className="font-jakarta-sans text-4xl lg:text-5xl font-semibold text-foreground mb-24">
          Why This Platform Matters
        </h2>
      </div>

      {/* Feature Spotlight - Positioned in scroll area */}
      <div className="relative w-full pt-12 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start pl-6 lg:pl-12 pr-6 lg:pr-12">
        {/* Image on the left */}
        <div className="relative z-10 flex-1 w-full lg:w-auto">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&auto=format&q=80"
            alt="Compassionate counselor providing support"
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
        </div>

        {/* Text Content on the right */}
        <div className="relative flex flex-col items-start gap-6 text-left max-w-2xl">
          <h2 className="font-jakarta-sans relative z-10 text-3xl lg:text-5xl font-medium text-foreground leading-tight tracking-[-0.02em]">
            Compassionate and <span className="text-primary">Culturally Attuned</span> Counselors You Can Trust
          </h2>
          
          <p className="font-jakarta-sans relative z-10 text-base lg:text-lg text-muted-foreground leading-relaxed">
            Connect with dedicated Rwandan counselors who understand the emotional, cultural, and social challenges faced by cancer patients and their families. Our trained professionals offer compassionate guidance through every stage of your journey, providing the same quality of care as in-person counseling, but accessible anywhere, anytime.
          </p>
          
          <div className="relative z-10 flex flex-row gap-3 lg:gap-4">
            <a href="/counselors" className="inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 text-sm lg:text-base font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/20 whitespace-nowrap">
              Find a Counselor
            </a>
          </div>
        </div>
      </div>

      {/* How It Works Section Title */}
      <div className="relative w-full pt-32 text-center px-6">
        <h2 className="font-jakarta-sans text-4xl lg:text-5xl font-semibold text-foreground mb-20">
          How It Works
        </h2>
      </div>

      {/* How It Works Steps */}
      <div className="relative w-full px-6 lg:px-12 space-y-12 lg:space-y-16 pb-20">
        {/* Step 1 */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
              1
            </div>
            <h3 className="text-3xl lg:text-5xl font-medium text-foreground leading-tight tracking-[-0.02em]">
              Get Connected with the Right Counselor
            </h3>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
              Answer a few short questions to be matched with a trained Rwandan counselor who understands your unique needs and background. Our platform connects you with professionals experienced in supporting cancer patients and their families.
            </p>
          </div>
          <div className="flex-1 w-full lg:w-auto">
            <img
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&auto=format&q=80"
              alt="Counselor matching process"
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </div>
        </div>

        {/* Arrow Indicator */}
        <div className="flex justify-center py-4">
          <svg className="w-8 h-8 text-primary animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
              2
            </div>
            <h3 className="text-3xl lg:text-5xl font-medium text-foreground leading-tight tracking-[-0.02em]">
              Choose How You Communicate
            </h3>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
              Speak with your counselor in the way that feels most comfortable, through secure chat, audio, or video sessions. Every interaction is confidential and guided by compassion and professionalism.
            </p>
          </div>
          <div className="flex-1 w-full lg:w-auto">
            <img
              src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=600&fit=crop&auto=format&q=80"
              alt="Communication options - chat, audio, video"
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </div>
        </div>

        {/* Arrow Indicator */}
        <div className="flex justify-center py-4">
          <svg className="w-8 h-8 text-primary animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
              3
            </div>
            <h3 className="text-3xl lg:text-5xl font-medium text-foreground leading-tight tracking-[-0.02em]">
              Support When You Need It Most
            </h3>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
              Access counseling and emotional support anytime, anywhere. You can message your counselor between sessions or schedule live appointments at times that work best for you, all from your phone or computer.
            </p>
          </div>
          <div className="flex-1 w-full lg:w-auto">
            <img
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&auto=format&q=80"
              alt="24/7 support accessibility"
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { SvgFollowScroll };

// Backward compatibility export
export { SvgFollowScroll as Skiper19 };

