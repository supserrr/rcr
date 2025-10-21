'use client';

import { FeatureCard } from "@workspace/ui/components/ui/feature-card";
import { motion } from "framer-motion";
import { 
  Heart, 
  Stethoscope, 
  Users, 
  Laptop, 
  Phone, 
  Calendar, 
  MapPin,
  GraduationCap,
  Truck,
  ShieldCheck,
  Handshake,
  Activity
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Demo page showcasing the Feature Card component.
 *
 * This page demonstrates the feature card with:
 * - Icon and text display
 * - Hover animations
 * - Responsive grid layout
 * - Multiple use case examples
 *
 * @returns Feature Card demo page
 */
export default function FeatureCardDemo() {
  const coreServices = [
    {
      icon: <Stethoscope className="h-8 w-8 text-primary" />,
      title: "Free Cancer Screenings",
      description: "Comprehensive screening services including breast, cervical, and prostate cancer detection available at no cost to underserved communities.",
    },
    {
      icon: <Truck className="h-8 w-8 text-primary" />,
      title: "Mobile Health Units",
      description: "Our fleet of 15 mobile units brings advanced screening equipment directly to rural communities across all 30 districts of Rwanda.",
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Patient Support Services",
      description: "Comprehensive counseling, support groups, nutritional guidance, and palliative care for patients and their families throughout treatment.",
    },
    {
      icon: <Phone className="h-8 w-8 text-primary" />,
      title: "24/7 Helpline",
      description: "Round-the-clock support hotline staffed by trained counselors providing information, guidance, and emotional support in multiple languages.",
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: "Education Programs",
      description: "Community awareness campaigns, health literacy workshops, and training programs to promote early detection and cancer prevention.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Support Groups",
      description: "Peer support networks connecting cancer patients, survivors, and caregivers for shared experiences and emotional support.",
    },
  ];

  const technologyFeatures = [
    {
      icon: <Laptop className="h-8 w-8 text-primary" />,
      title: "Telemedicine Platform",
      description: "Virtual consultations with oncology specialists, enabling remote access to expert medical advice and follow-up care.",
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Smart Scheduling",
      description: "AI-powered appointment system that optimizes screening schedules and sends automated reminders via SMS.",
    },
    {
      icon: <Activity className="h-8 w-8 text-primary" />,
      title: "Patient Portal",
      description: "Secure online access to medical records, test results, treatment plans, and educational resources.",
    },
  ];

  const partnershipFeatures = [
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Quality Assurance",
      description: "Internationally certified screening and treatment protocols ensuring the highest standards of cancer care.",
    },
    {
      icon: <Handshake className="h-8 w-8 text-primary" />,
      title: "Community Partnerships",
      description: "Collaboration with 25+ local organizations, health centers, and international NGOs to expand our reach.",
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: "Nationwide Network",
      description: "Strategic partnerships across Rwanda providing coordinated care and seamless patient referral systems.",
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-6 space-y-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Feature Card Demo</h1>
          <p className="text-muted-foreground text-lg">
            Showcase features and services with elegant, hoverable cards
          </p>
        </div>

        {/* Core Services */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Our Core Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive cancer care services designed to make early detection and treatment accessible to everyone in Rwanda
            </p>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {coreServices.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Technology Features */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Technology & Innovation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Leveraging technology to improve patient outcomes and expand access to quality cancer care
            </p>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {technologyFeatures.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Partnership & Quality */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Partnership & Quality</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Building a sustainable cancer care ecosystem through collaboration and excellence
            </p>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {partnershipFeatures.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Use Cases */}
        <section className="py-12 bg-card rounded-2xl">
          <div className="mx-auto max-w-6xl px-6 space-y-8">
            <h2 className="text-3xl font-bold text-center">Use Cases</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3 text-center">
                <h3 className="font-semibold text-primary">Service Pages</h3>
                <p className="text-sm text-muted-foreground">
                  Display available services and programs with clear descriptions
                  and visual icons
                </p>
              </div>
              <div className="space-y-3 text-center">
                <h3 className="font-semibold text-primary">Landing Pages</h3>
                <p className="text-sm text-muted-foreground">
                  Highlight key features and benefits to visitors in an
                  engaging, scannable format
                </p>
              </div>
              <div className="space-y-3 text-center">
                <h3 className="font-semibold text-primary">About Section</h3>
                <p className="text-sm text-muted-foreground">
                  Showcase organizational capabilities and unique value
                  propositions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 max-w-4xl mx-auto">
          <h3 className="font-semibold mb-2">About Feature Card Component</h3>
          <p className="text-sm text-muted-foreground">
            The Feature Card component provides a clean, consistent way to display
            features and services. With hover animations, icon support, and responsive
            design, it creates an engaging user experience. The component works with
            any icon system (lucide-react, custom SVGs, or images) and adapts
            seamlessly to light and dark modes.
          </p>
        </div>
      </div>
    </div>
  );
}

