import { cn } from "@workspace/ui/lib/utils";

interface Logo {
  src: string;
  alt: string;
  height?: number;
  className?: string;
}

interface LogoCloudProps {
  title?: string;
  logos?: Logo[];
  className?: string;
}

export function LogoCloud({
  title = "Your favorite companies are our partners.",
  logos = [
    { src: "https://html.tailus.io/blocks/customers/nvidia.svg", alt: "Nvidia Logo", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/column.svg", alt: "Column Logo", height: 16 },
    { src: "https://html.tailus.io/blocks/customers/github.svg", alt: "GitHub Logo", height: 16 },
    { src: "https://html.tailus.io/blocks/customers/nike.svg", alt: "Nike Logo", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/laravel.svg", alt: "Laravel Logo", height: 16 },
    { src: "https://html.tailus.io/blocks/customers/lilly.svg", alt: "Lilly Logo", height: 28 },
    { src: "https://html.tailus.io/blocks/customers/lemonsqueezy.svg", alt: "Lemon Squeezy Logo", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/openai.svg", alt: "OpenAI Logo", height: 24 },
    { src: "https://html.tailus.io/blocks/customers/tailwindcss.svg", alt: "Tailwind CSS Logo", height: 16 },
    { src: "https://html.tailus.io/blocks/customers/vercel.svg", alt: "Vercel Logo", height: 20 },
    { src: "https://html.tailus.io/blocks/customers/zapier.svg", alt: "Zapier Logo", height: 20 },
  ],
  className,
}: LogoCloudProps) {
  const getHeightClass = (height: number) => {
    const heightMap: Record<number, string> = {
      16: "h-4",
      20: "h-5",
      24: "h-6",
      28: "h-7",
    };
    return heightMap[height] || "h-5";
  };

  return (
    <section className={cn("bg-background py-16", className)}>
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-lg font-medium">{title}</h2>
        <div className="mx-auto mt-20 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12">
          {logos.map((logo, index) => (
            <img
              key={index}
              className={cn(
                getHeightClass(logo.height || 20),
                "w-fit dark:invert",
                logo.className
              )}
              src={logo.src}
              alt={logo.alt}
              height={logo.height || 20}
              width="auto"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Export as default for backward compatibility
export default LogoCloud;