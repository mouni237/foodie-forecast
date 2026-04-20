import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  predictDemand,
  type CuisineType,
  type WeatherType,
  type ZoneType,
  type PredictionResult,
} from "@/lib/predictor";
import { Brain, Sparkles, TrendingUp, Target, Activity } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/predictor")({
  head: () => ({
    meta: [
      { title: "AI Predictor — ForecastBite" },
      {
        name: "description",
        content:
          "Try the live AI demand predictor. Forecast hourly food delivery orders by cuisine, weather, zone, and day.",
      },
      { property: "og:title", content: "AI Predictor — ForecastBite" },
      {
        property: "og:description",
        content: "Live AI demand forecast for any food delivery scenario.",
      },
    ],
  }),
  component: PredictorPage,
});

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function PredictorPage() {
  const [cuisine, setCuisine] = useState<CuisineType>("pizza");
  const [weather, setWeather] = useState<WeatherType>("rain");
  const [zone, setZone] = useState<ZoneType>("downtown");
  const [day, setDay] = useState<number>(5);
  const [baseOrders, setBaseOrders] = useState<number>(20);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = () => {
    if (baseOrders < 1 || baseOrders > 1000) {
      toast.error("Baseline must be between 1 and 1000 orders/hour.");
      return;
    }
    setLoading(true);
    // Simulate model latency for nicer UX
    setTimeout(() => {
      const r = predictDemand({ cuisine, weather, zone, dayOfWeek: day, baseOrders });
      setResult(r);
      setLoading(false);
      toast.success(`Forecast generated — ${r.totalOrders.toLocaleString()} orders predicted.`);
    }, 600);
  };

  const maxOrders = useMemo(
    () => (result ? Math.max(...result.hourly.map((h) => h.orders), 1) : 1),
    [result],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute -top-32 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="container mx-auto relative px-6 pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur mb-5">
            <Sparkles className="h-3 w-3 text-primary" />
            Live AI demand model
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Forecast <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">delivery demand</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Adjust the inputs and generate a 24-hour order forecast in real time.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* Inputs */}
          <Card className="p-6 bg-card border-border h-fit">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Scenario inputs
            </h2>
            <div className="space-y-5">
              <div>
                <Label htmlFor="cuisine">Cuisine</Label>
                <Select value={cuisine} onValueChange={(v) => setCuisine(v as CuisineType)}>
                  <SelectTrigger id="cuisine" className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pizza">🍕 Pizza</SelectItem>
                    <SelectItem value="burger">🍔 Burgers</SelectItem>
                    <SelectItem value="asian">🍜 Asian</SelectItem>
                    <SelectItem value="healthy">🥗 Healthy</SelectItem>
                    <SelectItem value="dessert">🍰 Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="weather">Weather</Label>
                <Select value={weather} onValueChange={(v) => setWeather(v as WeatherType)}>
                  <SelectTrigger id="weather" className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear">☀️ Clear</SelectItem>
                    <SelectItem value="rain">🌧️ Rain</SelectItem>
                    <SelectItem value="snow">❄️ Snow</SelectItem>
                    <SelectItem value="hot">🔥 Hot</SelectItem>
                    <SelectItem value="cold">🧊 Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="zone">Zone</Label>
                <Select value={zone} onValueChange={(v) => setZone(v as ZoneType)}>
                  <SelectTrigger id="zone" className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="downtown">Downtown</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="suburb">Suburb</SelectItem>
                    <SelectItem value="campus">Campus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="day">Day of week</Label>
                <Select value={String(day)} onValueChange={(v) => setDay(Number(v))}>
                  <SelectTrigger id="day" className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {days.map((d, i) => (
                      <SelectItem key={d} value={String(i)}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="base">Baseline orders / hour</Label>
                <Input
                  id="base"
                  type="number"
                  min={1}
                  max={1000}
                  value={baseOrders}
                  onChange={(e) => setBaseOrders(Number(e.target.value) || 0)}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">Average hourly orders on a typical day.</p>
              </div>

              <Button
                onClick={handlePredict}
                disabled={loading}
                className="w-full bg-[image:var(--gradient-primary)] text-primary-foreground border-0 shadow-[var(--shadow-glow)] hover:opacity-90"
              >
                {loading ? "Computing forecast…" : "Generate forecast"}
              </Button>
            </div>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {!result ? (
              <Card className="p-12 bg-card border-border border-dashed text-center">
                <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Configure your scenario and click <strong className="text-foreground">Generate forecast</strong> to see the 24-hour prediction.
                </p>
              </Card>
            ) : (
              <>
                <div className="grid sm:grid-cols-3 gap-4">
                  <StatCard icon={TrendingUp} label="Total orders (24h)" value={result.totalOrders.toLocaleString()} />
                  <StatCard icon={Target} label="Peak hour" value={formatHour(result.peakHour)} />
                  <StatCard icon={Sparkles} label="Avg confidence" value={`${Math.round(result.avgConfidence * 100)}%`} />
                </div>

                <Card className="p-6 bg-card border-border">
                  <div className="flex items-baseline justify-between mb-5">
                    <h3 className="font-semibold">Hourly demand forecast</h3>
                    <span className={`text-sm font-medium ${result.uplift >= 0 ? "text-accent" : "text-destructive"}`}>
                      {result.uplift >= 0 ? "+" : ""}{result.uplift}% vs baseline
                    </span>
                  </div>
                  <div className="flex items-end gap-1 h-56">
                    {result.hourly.map((h) => {
                      const heightPct = (h.orders / maxOrders) * 100;
                      const isPeak = h.hour === result.peakHour;
                      return (
                        <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group">
                          <div
                            className={`w-full rounded-t-sm transition-all ${
                              isPeak
                                ? "bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]"
                                : "bg-primary/30 group-hover:bg-primary/60"
                            }`}
                            style={{ height: `${Math.max(heightPct, 2)}%` }}
                            title={`${formatHour(h.hour)} — ${h.orders} orders (${Math.round(h.confidence * 100)}% conf)`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono">
                    <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
                  </div>
                </Card>

                <Card className="p-6 bg-card border-border">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" /> AI insight
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{result.insight}</p>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="p-5 bg-card border-border">
      <Icon className="h-5 w-5 text-primary mb-2" />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </Card>
  );
}

function formatHour(h: number) {
  if (h === 0) return "12:00 AM";
  if (h === 12) return "12:00 PM";
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
}
