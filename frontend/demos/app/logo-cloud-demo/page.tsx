import { LogoCloud } from "@workspace/ui/components/ui/logo-cloud";

/**
 * Demo page showcasing the Logo Cloud component.
 *
 * This page demonstrates partner and sponsor logo displays with:
 * - Responsive grid layouts
 * - Dark mode support (inverted logos)
 * - Multiple configurations
 * - Partner showcase sections
 *
 * @returns Logo Cloud demo page
 */
export default function LogoCloudDemoPage() {
  const healthcarePartners = [
    { src: "https://html.tailus.io/blocks/customers/lilly.svg", alt: "Healthcare Partner 1", height: 28 },
    { src: "https://html.tailus.io/blocks/customers/nvidia.svg", alt: "Technology Partner", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/openai.svg", alt: "AI Research Partner", height: 24 },
    { src: "https://html.tailus.io/blocks/customers/vercel.svg", alt: "Platform Partner", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/github.svg", alt: "Development Partner", height: 16 },
  ];

  const internationalNGOs = [
    { src: "https://html.tailus.io/blocks/customers/zapier.svg", alt: "International NGO 1", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/column.svg", alt: "International NGO 2", height: 16 },
    { src: "https://html.tailus.io/blocks/customers/nike.svg", alt: "Corporate Sponsor 1", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/tailwindcss.svg", alt: "Technology Donor", height: 16 },
  ];

  const governmentPartners = [
    { src: "https://html.tailus.io/blocks/customers/lemonsqueezy.svg", alt: "Ministry of Health", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/laravel.svg", alt: "Rwanda Biomedical Center", height: 16 },
    { src: "https://html.tailus.io/blocks/customers/github.svg", alt: "District Health Office", height: 16 },
  ];

  const allPartners = [
    { src: "https://html.tailus.io/blocks/customers/nvidia.svg", alt: "Technology Partner", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/column.svg", alt: "Healthcare Partner", height: 16 },
    { src: "https://html.tailus.io/blocks/customers/github.svg", alt: "Development Partner", height: 16 },
    { src: "https://html.tailus.io/blocks/customers/nike.svg", alt: "Corporate Sponsor", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/laravel.svg", alt: "Medical Equipment Donor", height: 16 },
    { src: "https://html.tailus.io/blocks/customers/lilly.svg", alt: "Pharmaceutical Partner", height: 28 },
    { src: "https://html.tailus.io/blocks/customers/lemonsqueezy.svg", alt: "Ministry of Health", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/openai.svg", alt: "AI Research Partner", height: 24 },
    { src: "https://html.tailus.io/blocks/customers/tailwindcss.svg", alt: "Tech Platform", height: 16 },
    { src: "https://html.tailus.io/blocks/customers/vercel.svg", alt: "Infrastructure Partner", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/zapier.svg", alt: "International NGO", height: 20 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="mx-auto max-w-7xl px-6 py-12 text-center space-y-4">
          <h1 className="text-4xl font-bold">Logo Cloud Demo</h1>
          <p className="text-muted-foreground text-lg">
            Showcase your partners, sponsors, and trusted organizations
          </p>
        </div>
      </div>

      {/* Default Logo Cloud */}
      <LogoCloud />

      {/* Healthcare Partners */}
      <LogoCloud
        title="Trusted by leading healthcare organizations"
        logos={healthcarePartners}
        className="bg-muted/30"
      />

      {/* International Partners */}
      <LogoCloud
        title="Supported by international NGOs and donors"
        logos={internationalNGOs}
      />

      {/* Government Partners */}
      <LogoCloud
        title="Working with Rwanda government institutions"
        logos={governmentPartners}
        className="bg-primary/5"
      />

      {/* All Partners */}
      <LogoCloud
        title="Our Network of Partners & Supporters"
        logos={allPartners}
      />

      {/* Use Cases */}
      <section className="py-20 bg-card">
        <div className="mx-auto max-w-6xl px-6 space-y-12">
          <h2 className="text-3xl font-bold text-center">Use Cases for Rwanda Cancer Relief</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3 text-center">
              <h3 className="font-semibold text-primary text-lg">Partner Showcase</h3>
              <p className="text-sm text-muted-foreground">
                Display logos of healthcare organizations, pharmaceutical companies,
                and medical equipment providers supporting cancer care initiatives
              </p>
            </div>
            <div className="space-y-3 text-center">
              <h3 className="font-semibold text-primary text-lg">Donor Recognition</h3>
              <p className="text-sm text-muted-foreground">
                Acknowledge corporate sponsors, foundations, and international
                organizations funding screening programs and treatment services
              </p>
            </div>
            <div className="space-y-3 text-center">
              <h3 className="font-semibold text-primary text-lg">Trust Indicators</h3>
              <p className="text-sm text-muted-foreground">
                Build credibility by showcasing partnerships with WHO, government
                health ministries, and established medical institutions
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid gap-6 md:grid-cols-4 pt-8">
            <div className="rounded-lg border bg-background p-4 text-center">
              <h4 className="font-semibold mb-2">Responsive</h4>
              <p className="text-xs text-muted-foreground">
                Adapts to all screen sizes
              </p>
            </div>
            <div className="rounded-lg border bg-background p-4 text-center">
              <h4 className="font-semibold mb-2">Dark Mode</h4>
              <p className="text-xs text-muted-foreground">
                Auto-inverts logos in dark mode
              </p>
            </div>
            <div className="rounded-lg border bg-background p-4 text-center">
              <h4 className="font-semibold mb-2">Flexible Grid</h4>
              <p className="text-xs text-muted-foreground">
                Wraps naturally with any number
              </p>
            </div>
            <div className="rounded-lg border bg-background p-4 text-center">
              <h4 className="font-semibold mb-2">Customizable</h4>
              <p className="text-xs text-muted-foreground">
                Custom title and logos array
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
            <h3 className="font-semibold mb-2">About Logo Cloud Component</h3>
            <p className="text-sm text-muted-foreground">
              The Logo Cloud component provides a clean, professional way to showcase
              partner organizations, sponsors, and trusted brands. With automatic dark
              mode inversion, responsive grid layout, and flexible spacing, it creates
              visual trust indicators and acknowledges important relationships. Perfect
              for landing pages, about sections, and footer areas.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

