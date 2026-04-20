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
  detectWeather,
  toCSV,
  formatHour,
  type CuisineType,
  type WeatherType,
  type ZoneType,
  type PredictionResult,
} from "@/lib/predictor";
import {
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  Activity,
  CloudDownload,
  MapPin,
  Users,
  ChefHat,
  Loader2,
  GitCompare,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/predictor")({
  head: () => ({
    meta: [
      { title: "AI Predictor — ForecastBite" },
      {
        name: "description",
        content:
          "Try the live AI demand predictor. Forecast hourly food delivery orders by cuisine, weather, zone, and day with live weather autodetect.",
      },
      { property: "og:title", content: "AI Predictor — ForecastBite" },
      {
        property: "og:description",
        content: "Live AI demand forecast with real weather, staffing recommendations, and prep lists.",
      },
    ],
  }),
  component: PredictorPage,
});

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Scenario {
  cuisine: CuisineType;
  weather: WeatherType;
  zone: ZoneType;
  day: number;
  baseOrders: number;
}

const presets: { name: string; emoji: string; scenario: Scenario }[] = [
  { name: "Friday Pizza Rush", emoji: "🍕", scenario: { cuisine: "pizza", weather: "rain", zone: "downtown", day: 5, baseOrders: 25 } },
  { name: "Sunny Saturday Burgers", emoji: "🍔", scenario: { cuisine: "burger", weather: "hot", zone: "suburb", day: 6, baseOrders: 18 } },
  { name: "Monday Healthy Lunch", emoji: "🥗", scenario: { cuisine: "healthy", weather: "clear", zone: "downtown", day: 1, baseOrders: 15 } },
  { name: "Snowy Asian Dinner", emoji: "🍜", scenario: { cuisine: "asian", weather: "snow", zone: "residential", day: 4, baseOrders: 20 } },
];

const todayDow = new Date().getDay();

function PredictorPage() {
  const [scenario, setScenario] = useState<Scenario>({
    cuisine: "pizza",
    weather: "rain",
    zone: "downtown",
    day: todayDow,
    baseOrders: 20,
  });
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Compare mode
  const [compareOn, setCompareOn] = useState(false);
  const [compareWeather, setCompareWeather] = useState<WeatherType>("clear");
  const compareResult = useMemo(() => {
    if (!compareOn || !result) return null;
    return predictDemand({
      cuisine: scenario.cuisine,
      weather: compareWeather,
      zone: scenario.zone,
      dayOfWeek: scenario.day,
      baseOrders: scenario.baseOrders,
    });
  }, [compareOn, compareWeather, scenario, result]);

  // Weather autodetect
  const [city, setCity] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<string | null>(null);

  const update = <K extends keyof Scenario>(k: K, v: Scenario[K]) => {
    setScenario((s) => ({ ...s, [k]: v }));
  };

  const applyPreset = (p: Scenario) => {
    setScenario(p);
    toast.success("Preset loaded — click Generate to forecast.");
  };

  const handleDetect = async () => {
    if (!city.trim()) {
      toast.error("Enter a city first.");
      return;
    }
    setDetecting(true);
    setDetectedInfo(null);
    try {
      const wx = await detectWeather(city.trim());
      update("weather", wx.weather);
      setDetectedInfo(`${wx.resolvedCity} · ${Math.round(wx.tempC)}°C · ${wx.description}`);
      toast.success(`Weather detected: ${wx.description} (${Math.round(wx.tempC)}°C)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Weather detection failed");
    } finally {
      setDetecting(false);
    }
  };

  const handlePredict = () => {
    if (scenario.baseOrders < 1 || scenario.baseOrders > 1000) {
      toast.error("Baseline must be between 1 and 1000 orders/hour.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const r = predictDemand({
        cuisine: scenario.cuisine,
        weather: scenario.weather,
        zone: scenario.zone,
        dayOfWeek: scenario.day,
        baseOrders: scenario.baseOrders,
      });
      setResult(r);
      setLoading(false);
      toast.success(`Forecast ready — ${r.totalOrders.toLocaleString()} orders predicted.`);
    }, 500);
  };

  const handleExport = () => {
    if (!result) return;
    const csv = toCSV(result);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forecastbite-${scenario.cuisine}-${days[scenario.day].toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const maxOrders = useMemo(() => {
    if (!result) return 1;
    const a = Math.max(...result.hourly.map((h) => h.orders));
    const b = compareResult ? Math.max(...compareResult.hourly.map((h) => h.orders)) : 0;
    return Math.max(a, b, 1);
  }, [result, compareResult]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute -top-32 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="container mx-auto relative px-6 pt-16 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur mb-5">
            <Sparkles className="h-3 w-3 text-primary" />
            Live AI demand model · Real weather data
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Forecast{" "}
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
              delivery demand
            </span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Live weather autodetect, staffing recommendations, prep lists, and side-by-side scenario comparison.
          </p>
        </div>
      </section>

      {/* Presets */}
      <section className="container mx-auto px-6 pb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="text-xs uppercase tracking-widest text-muted-foreground self-center mr-2">
            Quick presets:
          </span>
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p.scenario)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              {p.emoji} {p.name}
            </button>
          ))}
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
                <Select value={scenario.cuisine} onValueChange={(v) => update("cuisine", v as CuisineType)}>
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

              {/* Weather autodetect */}
              <div>
                <Label htmlFor="city" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Auto-detect weather by city
                </Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="city"
                    placeholder="e.g., Chicago"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleDetect()}
                    maxLength={80}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDetect}
                    disabled={detecting}
                    className="shrink-0"
                  >
                    {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Detect"}
                  </Button>
                </div>
                {detectedInfo && (
                  <p className="text-xs text-accent mt-1.5">✓ {detectedInfo}</p>
                )}
              </div>

              <div>
                <Label htmlFor="weather">Weather</Label>
                <Select value={scenario.weather} onValueChange={(v) => update("weather", v as WeatherType)}>
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
                <Select value={scenario.zone} onValueChange={(v) => update("zone", v as ZoneType)}>
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
                <Select value={String(scenario.day)} onValueChange={(v) => update("day", Number(v))}>
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
                  value={scenario.baseOrders}
                  onChange={(e) => update("baseOrders", Number(e.target.value) || 0)}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">Average hourly orders on a typical day.</p>
              </div>

              <Button
                onClick={handlePredict}
                disabled={loading}
                className="w-full bg-[image:var(--gradient-primary)] text-primary-foreground border-0 shadow-[var(--shadow-glow)] hover:opacity-90"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Computing forecast…</>
                ) : (
                  "Generate forecast"
                )}
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
                <div className="grid sm:grid-cols-4 gap-4">
                  <StatCard icon={TrendingUp} label="Total orders" value={result.totalOrders.toLocaleString()} />
                  <StatCard icon={Target} label="Peak hour" value={formatHour(result.peakHour)} />
                  <StatCard icon={Users} label="Peak staff" value={String(result.recommendedStaff)} />
                  <StatCard icon={Sparkles} label="Confidence" value={`${Math.round(result.avgConfidence * 100)}%`} />
                </div>

                {/* Compare controls */}
                <Card className="p-4 bg-card border-border flex flex-wrap items-center gap-3">
                  <Button
                    variant={compareOn ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCompareOn((c) => !c)}
                    className={compareOn ? "bg-[image:var(--gradient-accent)] border-0 text-accent-foreground" : ""}
                  >
                    <GitCompare className="h-4 w-4 mr-2" />
                    {compareOn ? "Comparing" : "Compare scenarios"}
                  </Button>
                  {compareOn && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">vs weather:</span>
                      <Select value={compareWeather} onValueChange={(v) => setCompareWeather(v as WeatherType)}>
                        <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clear">☀️ Clear</SelectItem>
                          <SelectItem value="rain">🌧️ Rain</SelectItem>
                          <SelectItem value="snow">❄️ Snow</SelectItem>
                          <SelectItem value="hot">🔥 Hot</SelectItem>
                          <SelectItem value="cold">🧊 Cold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={handleExport} className="ml-auto">
                    <CloudDownload className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </Card>

                {/* Chart */}
                <Card className="p-6 bg-card border-border">
                  <div className="flex items-baseline justify-between mb-5 gap-3 flex-wrap">
                    <h3 className="font-semibold">Hourly demand forecast</h3>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded bg-[image:var(--gradient-primary)]" /> Primary
                      </span>
                      {compareResult && (
                        <span className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded bg-accent/60" /> Compared
                        </span>
                      )}
                      <span className={`font-medium ${result.uplift >= 0 ? "text-accent" : "text-destructive"}`}>
                        {result.uplift >= 0 ? "+" : ""}{result.uplift}% vs baseline
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end gap-1 h-56">
                    {result.hourly.map((h, i) => {
                      const heightPct = (h.orders / maxOrders) * 100;
                      const isPeak = h.hour === result.peakHour;
                      const cmp = compareResult?.hourly[i];
                      const cmpHeight = cmp ? (cmp.orders / maxOrders) * 100 : 0;
                      return (
                        <div key={h.hour} className="flex-1 flex items-end gap-0.5 h-full group">
                          <div
                            className={`flex-1 rounded-t-sm transition-all ${
                              isPeak
                                ? "bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]"
                                : "bg-primary/40 group-hover:bg-primary/70"
                            }`}
                            style={{ height: `${Math.max(heightPct, 2)}%` }}
                            title={`${formatHour(h.hour)} — ${h.orders} orders · ${h.staff} staff · ${Math.round(h.confidence * 100)}% conf`}
                          />
                          {cmp && (
                            <div
                              className="flex-1 rounded-t-sm bg-accent/50 group-hover:bg-accent/80 transition-all"
                              style={{ height: `${Math.max(cmpHeight, 2)}%` }}
                              title={`${formatHour(h.hour)} compare — ${cmp.orders} orders`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono">
                    <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
                  </div>
                </Card>

                {/* Heatmap */}
                <Card className="p-6 bg-card border-border">
                  <h3 className="font-semibold mb-4">24-hour intensity heatmap</h3>
                  <div className="grid grid-cols-12 gap-1">
                    {result.hourly.map((h) => {
                      const intensity = h.orders / result.peakOrders;
                      return (
                        <div
                          key={h.hour}
                          className="aspect-square rounded-md border border-border/50 flex items-center justify-center text-[10px] font-mono text-foreground/80 transition-transform hover:scale-110 cursor-default"
                          style={{
                            backgroundColor: `oklch(0.74 ${0.04 + 0.18 * intensity} 50 / ${0.15 + 0.85 * intensity})`,
                          }}
                          title={`${formatHour(h.hour)} — ${h.orders} orders`}
                        >
                          {String(h.hour).padStart(2, "0")}
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Insight + Prep + Staffing */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-6 bg-card border-border">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" /> AI insight
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{result.insight}</p>
                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 text-sm">
                      <Users className="h-4 w-4 text-accent" />
                      <span>
                        Staff <strong className="text-foreground">{result.recommendedStaff}</strong> at peak ({formatHour(result.peakHour)}).
                      </span>
                    </div>
                  </Card>

                  <Card className="p-6 bg-card border-border">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-primary" /> Recommended prep list
                    </h3>
                    <ul className="space-y-2">
                      {result.prepItems.map((p) => (
                        <li key={p.item} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{p.item}</span>
                          <span className="font-mono font-semibold text-foreground">{p.qty}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
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
