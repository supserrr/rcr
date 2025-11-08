import { cn } from "@workspace/ui/lib/utils";

interface StatItem {
  value: string;
  label: string;
}

interface StatsSectionProps {
  title?: string;
  description?: string;
  stats?: StatItem[];
  className?: string;
}

export function StatsSection({
  title = "Tailark in numbers",
  description = "Gemini is evolving to be more than just the models. It supports an entire to the APIs and platforms helping developers and businesses innovate.",
  stats = [
    { value: "+1200", label: "Stars on GitHub" },
    { value: "22 Million", label: "Active Users" },
    { value: "+500", label: "Powered Apps" },
  ],
  className,
}: StatsSectionProps) {
    return (
        <section className={cn("py-12 md:py-20", className)}>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
                    <h2 className="text-4xl font-medium lg:text-5xl">{title}</h2>
                    <p>{description}</p>
                </div>

                <div className="grid gap-12 divide-y *:text-center md:grid-cols-3 md:gap-2 md:divide-x md:divide-y-0">
                    {stats.map((stat, index) => (
                        <div key={index} className="space-y-4">
                            <div className="text-5xl font-bold">{stat.value}</div>
                            <p>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Export as default for backward compatibility
export default StatsSection;