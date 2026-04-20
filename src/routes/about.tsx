import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Brain, Globe, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ForecastBite" },
      { name: "description", content: "ForecastBite is a team of ML engineers and former restaurant operators on a mission to eliminate food delivery waste." },
      { property: "og:title", content: "About — ForecastBite" },
      { property: "og:description", content: "Our mission: end food waste through smarter forecasting." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="container mx-auto px-6 pt-20 pb-12 max-w-3xl">
        <div className="text-sm uppercase tracking-widest text-primary mb-3">About us</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          We help kitchens cook only what people will actually order.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          ForecastBite was founded in 2024 by a team of machine learning engineers and former restaurant operators frustrated by one fact: <strong className="text-foreground">over 30% of food prepared for delivery is wasted</strong> — usually because of bad demand guesses.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mt-4">
          We built an AI demand engine that learns each restaurant's unique pattern and combines it with weather, events, and traffic signals — giving operators forecasts they can actually staff and prep against.
        </p>
      </section>

      <section className="container mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5 max-w-5xl">
        {[
          { icon: Brain, title: "Research-driven", desc: "Our models are built on the latest temporal-fusion transformer research." },
          { icon: Heart, title: "Operator-led", desc: "Half our team has run restaurants. We know the kitchen pain points." },
          { icon: Globe, title: "Global scale", desc: "Forecasting orders in 12 countries and 4 languages — and growing." },
        ].map((v) => (
          <Card key={v.title} className="p-6 bg-card border-border">
            <v.icon className="h-7 w-7 text-primary mb-3" />
            <h3 className="font-semibold mb-2">{v.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
          </Card>
        ))}
      </section>

      <SiteFooter />
    </div>
  );
}
