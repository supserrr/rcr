import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Alert } from "@/components/ui-elements/alert";
import { Button } from "@/components/ui-elements/button";
import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { WeeksProfit } from "@/components/Charts/weeks-profit";
import { UsedDevices } from "@/components/Charts/used-devices";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Demo | Rwanda Cancer Relief Admin",
  description:
    "Demo page showcasing the Rwanda Cancer Relief Dashy admin dashboard components and features",
};

/**
 * Demo page showcasing the Dashy admin dashboard components.
 *
 * This page demonstrates various dashboard components including:
 * - Charts and data visualizations
 * - Alert components
 * - Button variants
 * - UI showcase sections
 *
 * @returns Demo page with dashboard component showcase
 */
export default function DashboardDemo() {
  return (
    <>
      <Breadcrumb pageName="Dashboard Demo" />

      <div className="space-y-7.5">
        {/* Alerts Section */}
        <ShowcaseSection title="Alert Components">
          <div className="space-y-7.5">
            <Alert
              variant="success"
              title="Success Message"
              description="Patient record has been successfully updated and saved to the database."
            />

            <Alert
              variant="warning"
              title="Attention Needed"
              description="Upcoming cancer screening appointment scheduled for tomorrow. Please confirm attendance."
            />

            <Alert
              variant="error"
              title="Error Occurred"
              description="Unable to process the medical report submission. Please try again."
            />
          </div>
        </ShowcaseSection>

        {/* Buttons Section */}
        <ShowcaseSection title="Button Components">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="default">
              Primary Action
            </Button>
            <Button variant="secondary" size="default">
              Secondary Action
            </Button>
            <Button variant="outline" size="default">
              Outline Button
            </Button>
            <Button variant="ghost" size="default">
              Ghost Button
            </Button>
            <Button variant="primary" size="sm">
              Small Button
            </Button>
          </div>
        </ShowcaseSection>

        {/* Charts Section */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <PaymentsOverview
            className="col-span-12 xl:col-span-8"
            timeFrame="this_month"
          />

          <WeeksProfit
            timeFrame="this_month"
            className="col-span-12 xl:col-span-4"
          />

          <UsedDevices
            className="col-span-12 xl:col-span-6"
            timeFrame="this_month"
          />

          <div className="col-span-12 xl:col-span-6">
            <ShowcaseSection title="Dashboard Features">
              <div className="space-y-4">
                <div className="rounded-lg border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-gray-dark">
                  <h4 className="mb-2 font-semibold text-dark dark:text-white">
                    Patient Management
                  </h4>
                  <p className="text-sm text-body-color dark:text-dark-6">
                    Comprehensive patient tracking with medical history,
                    treatment plans, and appointment scheduling.
                  </p>
                </div>

                <div className="rounded-lg border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-gray-dark">
                  <h4 className="mb-2 font-semibold text-dark dark:text-white">
                    Analytics & Reporting
                  </h4>
                  <p className="text-sm text-body-color dark:text-dark-6">
                    Advanced data visualization and reporting tools for
                    treatment outcomes and program effectiveness.
                  </p>
                </div>

                <div className="rounded-lg border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-gray-dark">
                  <h4 className="mb-2 font-semibold text-dark dark:text-white">
                    Resource Tracking
                  </h4>
                  <p className="text-sm text-body-color dark:text-dark-6">
                    Real-time monitoring of medical supplies, equipment, and
                    financial resources.
                  </p>
                </div>

                <div className="rounded-lg border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-gray-dark">
                  <h4 className="mb-2 font-semibold text-dark dark:text-white">
                    Multi-Language Support
                  </h4>
                  <p className="text-sm text-body-color dark:text-dark-6">
                    Interface available in Kinyarwanda, French, and English for
                    accessibility.
                  </p>
                </div>
              </div>
            </ShowcaseSection>
          </div>
        </div>
      </div>
    </>
  );
}

