import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Brain,
  TrendingUp,
  Cloud,
  MapPin,
  Clock,
  BarChart3,
  Zap,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import heroImage from "@/assets/hero-predictor.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ForecastBite — AI Food Delivery Demand Predictor" },
      {
        name: "description",
        content:
          "Predict food delivery demand with AI. Reduce wait times, optimize staffing, and forecast orders by hour, zone, and weather.",
      },
      { property: "og:title", content: "ForecastBite — AI Food Delivery Demand Predictor" },
      {
        property: "og:description",
        content: "Hyper-accurate AI demand forecasting for restaurants and delivery platforms.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[120px]" />

        <div className="container mx-auto relative px-6 pt-20 pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              Powered by real-time ML models
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Predict every{" "}
              <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                hungry minute
              </span>{" "}
              before it happens.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              ForecastBite uses AI to predict food delivery demand by hour, zone, and weather — so kitchens prep smart, riders move fast, and customers never wait.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/predictor">
                <Button size="lg" className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)] border-0 group">
                  Try the predictor
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-border bg-card/40 backdrop-blur hover:bg-card">
                  Request demo
                </Button>
              </Link>
            </div>
            <div className="flex gap-8 pt-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-foreground">94%</div>
                <div className="text-muted-foreground">accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">-32%</div>
                <div className="text-muted-foreground">food waste</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">2.4M+</div>
                <div className="text-muted-foreground">orders modeled</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-[image:var(--gradient-primary)] opacity-30 blur-2xl" />
            <img
              src={heroImage}
              alt="AI demand prediction dashboard over a city skyline"
              width={1536}
              height={1024}
              className="relative rounded-2xl border border-border shadow-[var(--shadow-elegant)]"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="max-w-2xl mb-16">
          <div className="text-sm uppercase tracking-widest text-primary mb-3">Features</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Forecasting built for the speed of delivery.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Brain, title: "Neural demand engine", desc: "Transformer model trained on millions of orders, weather signals, and local events." },
            { icon: MapPin, title: "Zone-level heatmaps", desc: "Predict demand block by block — not just city-wide averages." },
            { icon: Cloud, title: "Weather-aware", desc: "Rain spikes pizza orders 38%. We know — and we plan ahead." },
            { icon: Clock, title: "Hourly rolling forecasts", desc: "Updates every 15 minutes so kitchens stay one step ahead of the rush." },
            { icon: TrendingUp, title: "Menu-item granularity", desc: "Forecast by SKU, not just totals. Prep the burgers, chill the rest." },
            { icon: ShieldCheck, title: "Enterprise-grade", desc: "SOC 2 compliant, sub-200ms API, and built to scale to thousands of stores." },
          ].map((f) => (
            <Card
              key={f.title}
              className="group relative p-6 bg-card border-border hover:border-primary/50 transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-glow)] hover:-translate-y-1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-[image:var(--gradient-primary)] group-hover:text-primary-foreground transition-colors">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative py-24 border-y border-border bg-card/30">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <div className="text-sm uppercase tracking-widest text-accent mb-3">How it works</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              From raw data to plated insight in three steps.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "01", icon: BarChart3, title: "Ingest", desc: "Connect your POS, delivery app, and weather feed in minutes." },
              { n: "02", icon: Brain, title: "Predict", desc: "Our model learns your unique demand patterns continuously." },
              { n: "03", icon: Zap, title: "Act", desc: "Push forecasts to staffing, prep lists, and dispatch — automatically." },
            ].map((s) => (
              <div key={s.n} className="relative p-8 rounded-2xl bg-background border border-border">
                <div className="absolute -top-4 left-6 text-xs font-mono px-3 py-1 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
                  STEP {s.n}
                </div>
                <s.icon className="h-8 w-8 text-primary mb-4 mt-2" />
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="container mx-auto px-6 py-24">
        <div className="rounded-3xl p-12 md:p-16 border border-border relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/30 blur-[100px]" />
          <div className="relative grid md:grid-cols-4 gap-8 text-center">
            {[
              { v: "94%", l: "Forecast accuracy" },
              { v: "32%", l: "Less food waste" },
              { v: "18min", l: "Faster avg delivery" },
              { v: "$2.1M", l: "Avg yearly savings" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-5xl md:text-6xl font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                  {s.v}
                </div>
                <div className="text-sm text-muted-foreground mt-2">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-24">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Ready to serve demand before it arrives?
          </h2>
          <p className="text-lg text-muted-foreground">
            Try our live AI predictor or request a personalized demo.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/predictor">
              <Button size="lg" className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)] border-0">
                Try predictor
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-border bg-card/40 hover:bg-card">
                Talk to sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
