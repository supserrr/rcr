import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard Demo | Rwanda Cancer Relief Admin",
  description:
    "Demo page showcasing the Rwanda Cancer Relief admin dashboard components and features",
};

/**
 * Demo page showcasing the admin dashboard components.
 *
 * This page demonstrates various dashboard components including:
 * - Metrics cards with statistics
 * - Interactive charts and visualizations
 * - Data tables with pagination
 * - UI components like buttons, badges, and alerts
 *
 * @returns Demo page with dashboard component showcase
 */
export default function DashboardDemo() {
  return (
    <>
      <PageBreadCrumb pageTitle="Dashboard Demo" />

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {/* Metrics Section */}
        <ComponentCard title="Metrics Cards" desc="Key performance indicators and statistics">
          <EcommerceMetrics />
        </ComponentCard>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
          <ComponentCard
            title="Monthly Sales Chart"
            desc="Visual representation of sales data over time"
          >
            <MonthlySalesChart />
          </ComponentCard>

          <ComponentCard
            title="Statistics Chart"
            desc="Multi-series data visualization"
          >
            <StatisticsChart />
          </ComponentCard>
        </div>

        {/* UI Components Section */}
        <ComponentCard
          title="Buttons & Badges"
          desc="Interactive button components with various styles"
        >
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Buttons
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="primary" size="sm">Small Button</Button>
                <Button variant="outline" size="sm">Small Outline</Button>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Badges
              </h3>
              <div className="flex flex-wrap gap-3">
                <Badge color="success">Success</Badge>
                <Badge color="error">Error</Badge>
                <Badge color="warning">Warning</Badge>
                <Badge color="info">Info</Badge>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Alerts Section */}
        <ComponentCard
          title="Alert Components"
          desc="Notification and message displays"
        >
          <div className="space-y-4">
            <Alert
              variant="success"
              title="Success Alert"
              message="This is a success message indicating a positive action or outcome."
            />

            <Alert
              variant="error"
              title="Error Alert"
              message="This is an error message indicating something went wrong."
            />

            <Alert
              variant="warning"
              title="Warning Alert"
              message="This is a warning message to draw attention to important information."
            />

            <Alert
              variant="info"
              title="Info Alert"
              message="This is an informational message providing helpful context."
            />
          </div>
        </ComponentCard>

        {/* Table Section */}
        <ComponentCard
          title="Data Tables"
          desc="Structured data display with sorting and pagination"
        >
          <BasicTableOne />
        </ComponentCard>

        {/* Feature Overview */}
        <ComponentCard
          title="Dashboard Features"
          desc="Rwanda Cancer Relief Admin Dashboard Overview"
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Patient Management
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track patient records, treatment plans, and medical history
                  with comprehensive data management tools.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Analytics & Reporting
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate detailed reports on treatment outcomes, resource
                  allocation, and program effectiveness.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Resource Tracking
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitor medical supplies, equipment availability, and
                  financial resources in real-time.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Appointment Scheduling
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage screening appointments, treatment sessions, and
                  follow-up visits with integrated calendar tools.
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}

