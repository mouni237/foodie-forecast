import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ForecastBite" },
      {
        name: "description",
        content: "Simple, transparent pricing for AI demand forecasting. Plans for single restaurants and global delivery platforms.",
      },
      { property: "og:title", content: "Pricing — ForecastBite" },
      { property: "og:description", content: "Plans starting at $0. Scale to thousands of stores." },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    desc: "For small restaurants exploring demand forecasting.",
    features: [
      "1 location",
      "Daily forecasts",
      "Weather signals",
      "Email support",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$249",
    period: "/month",
    desc: "For multi-location operators ready to optimize ops.",
    features: [
      "Up to 25 locations",
      "Hourly forecasts",
      "Zone heatmaps",
      "POS & delivery integrations",
      "Slack & email alerts",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For delivery platforms and large chains.",
    features: [
      "Unlimited locations",
      "Real-time API (sub-200ms)",
      "Custom model training",
      "SOC 2, SSO, audit logs",
      "Dedicated CSM",
      "99.99% SLA",
    ],
    cta: "Talk to sales",
    highlight: false,
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="container mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Simple pricing.{" "}
          <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">Real ROI.</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Start free. Pay only when forecasting drives revenue.
        </p>
      </section>

      <section className="container mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6 max-w-6xl">
        {tiers.map((t) => (
          <Card
            key={t.name}
            className={`p-8 bg-card border-border relative flex flex-col ${
              t.highlight ? "border-primary shadow-[var(--shadow-glow)] scale-[1.02]" : ""
            }`}
          >
            {t.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium bg-[image:var(--gradient-primary)] text-primary-foreground">
                Most popular
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-1">{t.name}</h3>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">{t.price}</span>
              <span className="text-muted-foreground">{t.period}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/contact">
              <Button
                className={`w-full ${
                  t.highlight
                    ? "bg-[image:var(--gradient-primary)] text-primary-foreground border-0 hover:opacity-90"
                    : ""
                }`}
                variant={t.highlight ? "default" : "outline"}
              >
                {t.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </section>

      <SiteFooter />
    </div>
  );
}
