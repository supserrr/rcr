'use client';

import { motion, useScroll, useTransform, useSpring, type MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { Button } from "@workspace/ui/components/button";
import { Navbar } from "@workspace/ui/components/ui/mini-navbar";
import { ThemeTogglerButton } from '@workspace/ui/components/animate-ui/components/buttons/theme-toggler';
import { Card, CardContent } from '@workspace/ui/components/card';
import { ClockIcon } from '@workspace/ui/components/clock';
import { ShieldCheckIcon } from '@workspace/ui/components/shield-check';
import { FAQSection } from '@workspace/ui/components/ui/faqsection';
import { Footer } from '@workspace/ui/components/ui/footer';

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
  scrollYProgress: MotionValue<number>;
}

/**
 * LinePath component that renders an animated SVG path.
 * 
 * The path draws progressively as the user scrolls, creating
 * a smooth visual effect that follows scroll progress.
 * Optimized with Framer Motion's useTransform for efficient animations.
 * 
 * @param props - Component props
 * @returns An animated SVG path element
 */
const LinePath = ({ className, scrollYProgress }: LinePathProps) => {
  // Use lighter spring for better scroll performance
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 40,
    mass: 0.3,
  });
  
  const pathLength = useTransform(smoothProgress, [0, 1], [0.5, 1]);
  const strokeDashoffset = useTransform(pathLength, (value) => 1 - value);

  return (
    <svg
      width="1278"
      height="2319"
      viewBox="0 0 1278 2319"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <motion.path
        d="M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"
        stroke="oklch(0.55 0.18 300)"
        strokeWidth="20"
        style={{
          pathLength,
          strokeDashoffset,
          willChange: 'stroke-dasharray, stroke-dashoffset',
        }}
      />
    </svg>
  );
};

/**
 * Rwanda Cancer Relief - Landing Page
 * 
 * Main homepage with scroll-animated SVG and comprehensive sections.
 */
export default function LandingPage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  return (
    <main 
      className="min-h-screen bg-background overflow-x-hidden" 
      style={{ 
        scrollBehavior: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      }}
    >
      {/* Mini Navbar */}
      <Navbar />

      
      {/* Wrapper for scroll tracking */}
      <div 
        className="relative w-full"
        style={{ position: 'relative' }}
      >
        {/* Scroll Target - invisible element for tracking */}
        <div 
          ref={ref} 
          className="absolute top-0 left-0 w-full h-[350vh] pointer-events-none"
          style={{
            position: 'absolute',
            contain: 'strict',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        ></div>

        {/* Layer 1: Background - Bottom */}
        <div 
          className="fixed inset-0 bg-background -z-10"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        ></div>

        {/* Layer 2: SVG Animation - Middle (sticky) */}
        <div 
          className="sticky top-0 h-screen w-full z-0 pointer-events-none overflow-visible"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <LinePath
            className="absolute left-1/2 top-52 transform -translate-x-1/2"
            scrollYProgress={scrollYProgress}
          />
        </div>

        {/* Layer 3: Content Sections - Top (normal flow) */}
        <div 
          className="relative z-10 bg-transparent" 
          style={{ 
            marginTop: '-100vh',
            transform: 'translateZ(0)',
            willChange: 'contents',
            contain: 'layout style',
          }}
        >
            {/* Hero Section */}
            <div 
              className="min-h-screen flex items-center relative w-full px-6 lg:px-12 bg-transparent"
              style={{
                transform: 'translateZ(0)',
                willChange: 'contents',
                contain: 'layout style paint',
              }}
            >
              <div className="relative max-w-7xl mx-auto w-full">
                <div className="relative flex flex-col items-start justify-start gap-6 text-left max-w-3xl">
                  <h1 className="font-jakarta-sans relative z-10 text-5xl font-medium tracking-[-0.02em] lg:text-7xl text-foreground">
                    Compassionate Cancer Support, Wherever You Are
                  </h1>
                  <p className="font-jakarta-sans relative z-10 text-lg lg:text-xl font-normal text-muted-foreground leading-relaxed">
                    Living with cancer is not just a medical journey. It's an emotional one. Rwanda Cancer Relief offers counseling and culturally adapted resources to support patients and families through every step, accessible anytime, anywhere.
                  </p>
                  
                  {/* CTA Buttons */}
                  <div className="relative z-10 flex flex-col sm:flex-row gap-3 lg:gap-4">
                    <a href="/signup/patient" className="inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 text-sm lg:text-base font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/20">
                      Get Help
                    </a>
                     <a href="/signup/counselor" className="inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 text-sm lg:text-base font-semibold text-primary bg-background border-2 border-primary rounded-full hover:bg-primary/10 transition-all duration-200">
                        I&apos;m a Counselor
                      </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Why This Platform Matters Section */}
            <div 
              className="relative w-full pt-20 px-6 bg-transparent"
              style={{
                transform: 'translateZ(0)',
                contain: 'layout style paint',
              }}
            >
              <div className="max-w-7xl mx-auto text-center">
                <h2 className="font-jakarta-sans text-4xl lg:text-5xl font-semibold text-foreground mb-24">
                  Why This Platform Matters
                </h2>
              </div>
            </div>

            {/* Feature Spotlight */}
            <div 
              className="relative w-full pt-12 px-6 lg:px-12 bg-transparent"
              style={{
                transform: 'translateZ(0)',
                contain: 'layout style paint',
              }}
            >
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                {/* Image on the left */}
                <div 
                  className="relative z-10 flex-1 w-full lg:w-auto"
                  style={{
                    transform: 'translateZ(0)',
                    contain: 'layout style paint',
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&auto=format&q=80"
                    alt="Compassionate counselor providing support"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                    loading="lazy"
                    decoding="async"
                    style={{
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                    }}
                  />
                </div>

                {/* Text Content on the right */}
                <div className="relative flex flex-col items-start gap-6 text-left flex-1">
                  <h2 className="font-jakarta-sans relative z-10 text-3xl lg:text-5xl font-medium text-foreground leading-tight tracking-[-0.02em]">
                    Compassionate and <span className="text-primary">Culturally Attuned</span> Counselors You Can Trust
                  </h2>
                  
                  <p className="font-jakarta-sans relative z-10 text-base lg:text-lg text-muted-foreground leading-relaxed">
                    Connect with dedicated Rwandan counselors who understand the emotional, cultural, and social challenges faced by cancer patients and their families. Our trained professionals offer compassionate guidance through every stage of your journey, providing the same quality of care as in-person counseling, but accessible anywhere, anytime.
                  </p>
                  
                  <div className="relative z-10 flex flex-row gap-3 lg:gap-4">
                    <a href="/counselors" className="inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 text-sm lg:text-base font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/20">
                      Find a Counselor
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div 
              className="relative w-full pt-32 px-6 bg-transparent"
              style={{
                transform: 'translateZ(0)',
                contain: 'layout style paint',
              }}
            >
              <div className="max-w-7xl mx-auto text-center">
                <h2 className="font-jakarta-sans text-4xl lg:text-5xl font-semibold text-foreground mb-20">
                  How It Works
                </h2>
              </div>
            </div>

            {/* How It Works Steps */}
            <div 
              className="relative w-full px-6 lg:px-12 pb-20 bg-transparent"
              style={{
                transform: 'translateZ(0)',
                contain: 'layout style paint',
              }}
            >
              <div className="max-w-7xl mx-auto space-y-12 lg:space-y-16">
                {/* Step 1 */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
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
                  <div 
                    className="flex-1 w-full lg:w-auto"
                    style={{
                      transform: 'translateZ(0)',
                      contain: 'layout style paint',
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&auto=format&q=80"
                      alt="Counselor matching process"
                      className="w-full h-auto rounded-2xl shadow-xl"
                      loading="lazy"
                      decoding="async"
                      style={{
                        transform: 'translateZ(0)',
                        willChange: 'transform',
                      }}
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
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
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
                  <div 
                    className="flex-1 w-full lg:w-auto"
                    style={{
                      transform: 'translateZ(0)',
                      contain: 'layout style paint',
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=600&fit=crop&auto=format&q=80"
                      alt="Communication options - chat, audio, video"
                      className="w-full h-auto rounded-2xl shadow-xl"
                      loading="lazy"
                      decoding="async"
                      style={{
                        transform: 'translateZ(0)',
                        willChange: 'transform',
                      }}
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
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
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
                  <div 
                    className="flex-1 w-full lg:w-auto"
                    style={{
                      transform: 'translateZ(0)',
                      contain: 'layout style paint',
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&auto=format&q=80"
                      alt="24/7 support accessibility"
                      className="w-full h-auto rounded-2xl shadow-xl"
                      loading="lazy"
                      decoding="async"
                      style={{
                        transform: 'translateZ(0)',
                        willChange: 'transform',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Our Approach to Care Section */}
            <div 
              className="relative w-full pt-8 px-6 bg-transparent"
              style={{
                transform: 'translateZ(0)',
                contain: 'layout style paint',
              }}
            >
              <div className="max-w-7xl mx-auto">
                {/* Section Title */}
                <h2 className="font-jakarta-sans text-4xl lg:text-5xl font-semibold text-foreground text-center mb-20">
                  Our Approach to Care
                </h2>
                <div className="relative">
                  <div className="relative z-10 grid grid-cols-6 gap-3">
                    <Card className="relative col-span-full flex overflow-hidden lg:col-span-2 bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20">
                      <CardContent className="relative m-auto size-fit pt-6">
                        {/* Decorative gradient blob */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                        <div className="relative flex h-24 w-56 items-center">
                          <svg
                            className="text-primary/20 absolute inset-0 size-full"
                            viewBox="0 0 254 104"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="font-jakarta-sans relative z-10 mx-auto block w-fit text-5xl font-semibold text-foreground">500+</span>
                        </div>
                        <h2 className="font-jakarta-sans relative z-10 mt-3 text-center text-3xl font-semibold text-foreground">Patients Supported</h2>
                      </CardContent>
                    </Card>
                    <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20">
                      <CardContent className="pt-6">
                        {/* Decorative gradient blob */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                        <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
                          <svg
                            className="text-primary/20 absolute inset-0 size-full"
                            viewBox="0 0 254 104"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                              fill="currentColor"
                            />
                          </svg>
                          <ShieldCheckIcon className="m-auto relative z-10 text-foreground" size={64} />
                        </div>
                        <div className="relative z-10 mt-3 space-y-3 text-center">
                          <h2 className="font-jakarta-sans text-xl font-semibold text-foreground transition">
                            A Safe Space for Healing
                          </h2>
                          <p className="font-jakarta-sans text-sm text-muted-foreground leading-relaxed">
                            Your privacy and comfort matter deeply to us. Every conversation is protected, confidential, and held in a safe space where you can share freely without judgment.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20">
                      <CardContent className="pt-6">
                        {/* Decorative gradient blob */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                        <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
                          <svg
                            className="text-primary/20 absolute inset-0 size-full"
                            viewBox="0 0 254 104"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                              fill="currentColor"
                            />
                          </svg>
                          <ClockIcon className="m-auto relative z-10 text-foreground" size={64} />
                        </div>
                        <div className="relative z-10 mt-3 space-y-3 text-center">
                          <h2 className="font-jakarta-sans text-xl font-semibold text-foreground transition">Always Here When You Need Us</h2>
                          <p className="font-jakarta-sans text-sm text-muted-foreground leading-relaxed">
                            Life with cancer doesn't follow a schedule. That's why our counselors are available whenever you need support, day or night, wherever you are.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action Section */}
            <div 
              className="relative w-full pt-8 pb-20 px-6 bg-transparent"
              style={{
                transform: 'translateZ(0)',
                contain: 'layout style paint',
              }}
            >
              <div className="max-w-7xl mx-auto">
                <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-12 lg:p-16 text-center overflow-hidden">
                  {/* Decorative gradient blob */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                  
                  <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                    <h2 className="font-jakarta-sans text-4xl lg:text-5xl font-semibold text-foreground">
                      You're Not Alone on This Journey
                    </h2>
                    <p className="font-jakarta-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
                      Take the first step toward healing with the support of compassionate counselors who understand your experience.
                    </p>
                    <div className="pt-4">
                       <a href="/signup/patient" className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all duration-200 shadow-xl shadow-primary/30 w-full sm:w-auto">
                          Connect with a Counselor
                        </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div 
              className="relative w-full pt-8 pb-20 px-6 bg-transparent"
              style={{
                transform: 'translateZ(0)',
                contain: 'layout style paint',
              }}
            >
              <FAQSection
                title="Common Questions"
                subtitle=""
                description="Find answers to the most common questions about our platform, counseling services, and how we can support you."
                buttonLabel=""
                faqsLeft={[
                  {
                    question: "What is the Rwanda Cancer Relief counseling platform?",
                    answer: "The RCR counseling platform is an online space where cancer patients and their families can connect with trained counselors for emotional and psychological support. It provides access to culturally sensitive care, resources, and guidance throughout your healing journey."
                  },
                  {
                    question: "Who can use the platform?",
                    answer: "The platform is open to cancer patients, survivors, caregivers, and family members seeking emotional support. Counselors and healthcare professionals can also join to provide guidance and care."
                  },
                  {
                    question: "How do I get started?",
                    answer: "Simply create an account, answer a few short questions about your needs, and you'll be matched with a qualified counselor. You can then book a session or start chatting securely."
                  },
                  {
                    question: "Is the counseling confidential?",
                    answer: "Yes. Every conversation between you and your counselor is private and protected. We strictly follow confidentiality and data protection standards to keep your information safe."
                  },
                  {
                    question: "Do I need to visit a hospital or office for counseling?",
                    answer: "No. All sessions take place online through secure chat, audio, or video — so you can receive support from wherever you are, using your phone or computer."
                  }
                ]}
                faqsRight={[
                  {
                    question: "What kind of support can I receive?",
                    answer: "Our counselors provide emotional support for challenges like anxiety, fear, grief, family stress, or adjustment to treatment. The goal is to help you build resilience, find hope, and improve emotional well-being."
                  },
                  {
                    question: "Are the counselors trained professionals?",
                    answer: "Yes. All RCR counselors are trained professionals who understand both psychological care and the cultural realities of living with cancer in Rwanda."
                  },
                  {
                    question: "How much does it cost to use the platform?",
                    answer: "Some services may be free or subsidized through the Rwanda Cancer Relief program. Any costs will be clearly explained before you begin your session."
                  },
                  {
                    question: "Can I choose or change my counselor?",
                    answer: "Yes. You can request a new counselor if you feel you'd connect better with someone else. Our goal is to ensure you feel safe, understood, and supported."
                  },
                  {
                    question: "What if I need urgent help?",
                    answer: "If you're in crisis or need immediate assistance, the platform will guide you to emergency contacts and local support centers where you can get help right away."
                  }
                ]}
                className="max-w-7xl"
              />
            </div>

            {/* Footer */}
            <Footer
              logo={
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <span className="absolute w-2 h-2 rounded-full bg-primary top-0 left-1/2 transform -translate-x-1/2"></span>
                  <span className="absolute w-2 h-2 rounded-full bg-primary left-0 top-1/2 transform -translate-y-1/2"></span>
                  <span className="absolute w-2 h-2 rounded-full bg-primary right-0 top-1/2 transform -translate-y-1/2"></span>
                  <span className="absolute w-2 h-2 rounded-full bg-primary bottom-0 left-1/2 transform -translate-x-1/2"></span>
                </div>
              }
              brandName="Rwanda Cancer Relief"
              mainLinks={[
                { href: "/get-help", label: "Get Help" },
                { href: "/counselors", label: "Find a Counselor" },
                { href: "/about", label: "About Us" },
                { href: "/resources", label: "Resources" },
                { href: "/contact", label: "Contact" },
                { href: "/signin", label: "Sign In" },
                { href: "/signup/patient", label: "Patient Sign Up" },
                { href: "/signup/counselor", label: "Counselor Sign Up" }
              ]}
              legalLinks={[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" }
              ]}
              socialLinks={[
                { 
                  label: "Facebook", 
                  href: "https://facebook.com/rwandacancerrelief",
                  icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                },
                { 
                  label: "Twitter", 
                  href: "https://twitter.com/rwandacancerrelief",
                  icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                },
                { 
                  label: "Instagram", 
                  href: "https://instagram.com/rwandacancerrelief",
                  icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281h-1.297v1.297h1.297V7.707zm-5.543 1.297c.718 0 1.297.579 1.297 1.297s-.579 1.297-1.297 1.297-1.297-.579-1.297-1.297.579-1.297 1.297-1.297z"/></svg>
                }
              ]}
              copyright={{
                text: "© 2025 Rwanda Cancer Relief",
                license: "All rights reserved."
              }}
              themeToggle={
                <div className="flex items-center justify-center">
                  <ThemeTogglerButton variant="outline" size="default" direction="ltr" modes={['light', 'dark']} className="h-10 w-10 rounded-full" />
                </div>
              }
            />
        </div>
      </div>
    </main>
  );
}