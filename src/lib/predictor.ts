// Deterministic demand prediction model.
// Simulates an ML forecast using time-of-day, day-of-week, weather, and zone signals.

export type CuisineType = "pizza" | "burger" | "asian" | "healthy" | "dessert";
export type WeatherType = "clear" | "rain" | "snow" | "hot" | "cold";
export type ZoneType = "downtown" | "residential" | "suburb" | "campus";

export interface PredictionInput {
  cuisine: CuisineType;
  weather: WeatherType;
  zone: ZoneType;
  dayOfWeek: number; // 0-6 (0=Sun)
  baseOrders: number; // typical hourly average
}

export interface HourlyPrediction {
  hour: number;
  orders: number;
  confidence: number;
}

export interface PredictionResult {
  hourly: HourlyPrediction[];
  peakHour: number;
  totalOrders: number;
  avgConfidence: number;
  uplift: number; // % vs baseline
  insight: string;
}

const cuisinePeaks: Record<CuisineType, number[]> = {
  pizza: [12, 19, 20],
  burger: [12, 13, 19],
  asian: [12, 13, 18, 19],
  healthy: [12, 13, 18],
  dessert: [15, 20, 21, 22],
};

const weatherMultiplier: Record<WeatherType, number> = {
  clear: 1.0,
  rain: 1.38,
  snow: 1.52,
  hot: 1.18,
  cold: 1.22,
};

const zoneMultiplier: Record<ZoneType, number> = {
  downtown: 1.25,
  residential: 1.0,
  suburb: 0.85,
  campus: 1.15,
};

const dayMultiplier = [1.1, 0.85, 0.9, 0.95, 1.05, 1.35, 1.3]; // Sun..Sat

function bell(hour: number, peak: number, spread: number) {
  return Math.exp(-Math.pow(hour - peak, 2) / (2 * spread * spread));
}

export function predictDemand(input: PredictionInput): PredictionResult {
  const peaks = cuisinePeaks[input.cuisine];
  const wMult = weatherMultiplier[input.weather];
  const zMult = zoneMultiplier[input.zone];
  const dMult = dayMultiplier[input.dayOfWeek] ?? 1;

  const hourly: HourlyPrediction[] = [];
  for (let h = 0; h < 24; h++) {
    let intensity = 0.05; // base background
    for (const p of peaks) intensity += bell(h, p, 1.6);
    // breakfast bump
    intensity += 0.4 * bell(h, 8, 1.2);

    const orders = Math.max(
      0,
      Math.round(input.baseOrders * intensity * wMult * zMult * dMult),
    );

    // Confidence: higher near peaks, lower at off-hours
    const conf = Math.min(
      0.98,
      0.7 + 0.25 * Math.min(1, intensity) - (h < 6 ? 0.1 : 0),
    );

    hourly.push({ hour: h, orders, confidence: +conf.toFixed(2) });
  }

  const totalOrders = hourly.reduce((s, h) => s + h.orders, 0);
  const peak = hourly.reduce((a, b) => (b.orders > a.orders ? b : a));
  const avgConfidence =
    hourly.reduce((s, h) => s + h.confidence, 0) / hourly.length;

  const baseline = input.baseOrders * 24;
  const uplift = ((totalOrders - baseline) / baseline) * 100;

  const insight = buildInsight(input, peak.hour, uplift);

  return {
    hourly,
    peakHour: peak.hour,
    totalOrders,
    avgConfidence: +avgConfidence.toFixed(2),
    uplift: +uplift.toFixed(1),
    insight,
  };
}

function buildInsight(
  input: PredictionInput,
  peakHour: number,
  uplift: number,
) {
  const w =
    input.weather === "rain"
      ? "Rain typically lifts delivery orders 30-40%."
      : input.weather === "snow"
      ? "Snow drives a major spike — staff up early."
      : input.weather === "hot"
      ? "Hot weather boosts cold items and dessert."
      : input.weather === "cold"
      ? "Cold weather increases comfort food orders."
      : "Clear weather — expect normal patterns.";

  const z =
    input.zone === "downtown"
      ? "Downtown zones see lunch dominance."
      : input.zone === "campus"
      ? "Campus demand peaks late evening."
      : input.zone === "suburb"
      ? "Suburbs concentrate orders at dinner."
      : "Residential demand is dinner-heavy.";

  const trend =
    uplift > 5
      ? `Expect ${uplift.toFixed(0)}% more orders than baseline.`
      : uplift < -5
      ? `Expect ${Math.abs(uplift).toFixed(0)}% fewer orders than baseline.`
      : "Order volume tracks close to baseline.";

  const peakStr =
    peakHour < 12
      ? `${peakHour}:00 AM`
      : peakHour === 12
      ? "12:00 PM"
      : `${peakHour - 12}:00 PM`;

  return `Peak demand at ${peakStr}. ${w} ${z} ${trend}`;
}
