import { StatsSection } from "@workspace/ui/components/ui/stats-section";

/**
 * Demo page showcasing the Stats Section component.
 *
 * This page demonstrates the statistics display component with:
 * - Large, bold numbers
 * - Descriptive labels
 * - Centered layout with dividers
 * - Responsive grid design
 * - Customizable content
 *
 * @returns Stats Section demo page
 */
export default function StatsDemoPage() {
  const impactStats = [
    { value: "50,000+", label: "Patients Screened" },
    { value: "500+", label: "Communities Served" },
    { value: "15", label: "Mobile Health Units" },
  ];

  const programStats = [
    { value: "95%", label: "Early Detection Rate" },
    { value: "24/7", label: "Support Hotline" },
    { value: "1,200+", label: "Lives Saved" },
  ];

  const teamStats = [
    { value: "150+", label: "Healthcare Professionals" },
    { value: "300+", label: "Volunteers" },
    { value: "25+", label: "Partner Organizations" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Default Stats */}
      <StatsSection />

      {/* Rwanda Cancer Relief Impact */}
      <StatsSection
        title="Our Impact in Rwanda"
        description="Through early detection, free screenings, and comprehensive support, we're making a difference in communities across Rwanda."
        stats={impactStats}
        className="bg-primary/5"
      />

      {/* Program Effectiveness */}
      <StatsSection
        title="Program Effectiveness"
        description="Our evidence-based approach and dedicated team deliver measurable results in cancer prevention and treatment."
        stats={programStats}
      />

      {/* Team & Network */}
      <StatsSection
        title="Our Team & Network"
        description="A growing network of healthcare professionals, volunteers, and partners working together to fight cancer."
        stats={teamStats}
        className="bg-muted/50"
      />

      {/* Custom Stats - 4 Columns */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
          <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
            <h2 className="text-4xl font-medium lg:text-5xl">2024 Annual Report</h2>
            <p>A year of growth, innovation, and life-saving impact across Rwanda's cancer care landscape.</p>
          </div>

          <div className="grid gap-8 divide-y *:text-center md:grid-cols-4 md:gap-2 md:divide-x md:divide-y-0">
            <div className="space-y-4 pt-8 md:pt-0">
              <div className="text-5xl font-bold text-primary">85%</div>
              <p className="text-sm font-medium">Treatment Success Rate</p>
            </div>
            <div className="space-y-4 pt-8 md:pt-0">
              <div className="text-5xl font-bold text-primary">12,000+</div>
              <p className="text-sm font-medium">Free Screenings Provided</p>
            </div>
            <div className="space-y-4 pt-8 md:pt-0">
              <div className="text-5xl font-bold text-primary">30</div>
              <p className="text-sm font-medium">Districts Covered</p>
            </div>
            <div className="space-y-4 pt-8 md:pt-0">
              <div className="text-5xl font-bold text-primary">98%</div>
              <p className="text-sm font-medium">Patient Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-12 bg-card">
        <div className="mx-auto max-w-6xl px-6 space-y-8">
          <h2 className="text-3xl font-bold text-center">Use Cases for Rwanda Cancer Relief</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-background p-6 space-y-3">
              <h3 className="font-semibold text-primary">Landing Page Impact</h3>
              <p className="text-sm text-muted-foreground">
                Display key metrics and achievements to visitors, showcasing the
                scale and effectiveness of cancer care programs
              </p>
            </div>
            <div className="rounded-lg border bg-background p-6 space-y-3">
              <h3 className="font-semibold text-primary">Annual Reports</h3>
              <p className="text-sm text-muted-foreground">
                Highlight yearly accomplishments, patient outcomes, and program
                growth in a visually compelling format
              </p>
            </div>
            <div className="rounded-lg border bg-background p-6 space-y-3">
              <h3 className="font-semibold text-primary">Donation Pages</h3>
              <p className="text-sm text-muted-foreground">
                Show donors the impact of their contributions through powerful
                statistics about lives saved and communities served
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
            <h3 className="font-semibold mb-2">About Stats Section Component</h3>
            <p className="text-sm text-muted-foreground">
              The Stats Section component provides a clean, centered layout for displaying
              key metrics and achievements. With responsive grid design and elegant dividers,
              it creates visual hierarchy and draws attention to important numbers. Perfect
              for landing pages, annual reports, and impact showcases.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

