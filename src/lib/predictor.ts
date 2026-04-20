// Deterministic demand prediction model.
// Simulates an ML forecast using time-of-day, day-of-week, weather, and zone signals.

export type CuisineType = "pizza" | "burger" | "asian" | "healthy" | "dessert";
export type WeatherType = "clear" | "rain" | "snow" | "hot" | "cold";
export type ZoneType = "downtown" | "residential" | "suburb" | "campus";

export interface PredictionInput {
  cuisine: CuisineType;
  weather: WeatherType;
  zone: ZoneType;
  dayOfWeek: number;
  baseOrders: number;
}

export interface HourlyPrediction {
  hour: number;
  orders: number;
  confidence: number;
  staff: number;
}

export interface PredictionResult {
  hourly: HourlyPrediction[];
  peakHour: number;
  peakOrders: number;
  totalOrders: number;
  avgConfidence: number;
  uplift: number;
  insight: string;
  recommendedStaff: number;
  prepItems: { item: string; qty: number }[];
}

const cuisinePeaks: Record<CuisineType, number[]> = {
  pizza: [12, 19, 20],
  burger: [12, 13, 19],
  asian: [12, 13, 18, 19],
  healthy: [12, 13, 18],
  dessert: [15, 20, 21, 22],
};

const cuisineMenu: Record<CuisineType, string[]> = {
  pizza: ["Margherita", "Pepperoni", "Veggie Supreme"],
  burger: ["Classic Cheeseburger", "Bacon Double", "Crispy Chicken"],
  asian: ["Pad Thai", "Chicken Ramen", "Beef Bulgogi Bowl"],
  healthy: ["Power Grain Bowl", "Caesar Salad", "Avocado Wrap"],
  dessert: ["Chocolate Lava Cake", "Cheesecake Slice", "Cookie Trio"],
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

const dayMultiplier = [1.1, 0.85, 0.9, 0.95, 1.05, 1.35, 1.3];

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
    let intensity = 0.05;
    for (const p of peaks) intensity += bell(h, p, 1.6);
    intensity += 0.4 * bell(h, 8, 1.2);

    const orders = Math.max(
      0,
      Math.round(input.baseOrders * intensity * wMult * zMult * dMult),
    );
    const conf = Math.min(
      0.98,
      0.7 + 0.25 * Math.min(1, intensity) - (h < 6 ? 0.1 : 0),
    );
    // Assume 1 staff member handles ~12 orders/hour
    const staff = Math.max(1, Math.ceil(orders / 12));

    hourly.push({ hour: h, orders, confidence: +conf.toFixed(2), staff });
  }

  const totalOrders = hourly.reduce((s, h) => s + h.orders, 0);
  const peak = hourly.reduce((a, b) => (b.orders > a.orders ? b : a));
  const avgConfidence =
    hourly.reduce((s, h) => s + h.confidence, 0) / hourly.length;

  const baseline = input.baseOrders * 24;
  const uplift = ((totalOrders - baseline) / baseline) * 100;
  const recommendedStaff = Math.max(...hourly.map((h) => h.staff));

  const menu = cuisineMenu[input.cuisine];
  const splits = [0.45, 0.32, 0.23];
  const prepItems = menu.map((item, i) => ({
    item,
    qty: Math.round(totalOrders * splits[i]),
  }));

  return {
    hourly,
    peakHour: peak.hour,
    peakOrders: peak.orders,
    totalOrders,
    avgConfidence: +avgConfidence.toFixed(2),
    uplift: +uplift.toFixed(1),
    insight: buildInsight(input, peak.hour, uplift),
    recommendedStaff,
    prepItems,
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

  return `Peak demand at ${formatHour(peakHour)}. ${w} ${z} ${trend}`;
}

export function formatHour(h: number) {
  if (h === 0) return "12:00 AM";
  if (h === 12) return "12:00 PM";
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
}

export function toCSV(result: PredictionResult): string {
  const rows = [
    ["hour", "orders", "confidence", "recommended_staff"],
    ...result.hourly.map((h) => [
      String(h.hour),
      String(h.orders),
      String(h.confidence),
      String(h.staff),
    ]),
  ];
  return rows.map((r) => r.join(",")).join("\n");
}

// Detect current weather using free Open-Meteo API (no key required, CORS-enabled)
export async function detectWeather(city: string): Promise<{
  weather: WeatherType;
  tempC: number;
  description: string;
  resolvedCity: string;
}> {
  const geo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
  );
  if (!geo.ok) throw new Error("Failed to find city");
  const geoJson = await geo.json();
  const place = geoJson.results?.[0];
  if (!place) throw new Error(`City "${city}" not found`);

  const wx = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,precipitation,weather_code`,
  );
  if (!wx.ok) throw new Error("Weather lookup failed");
  const wxJson = await wx.json();
  const t = wxJson.current.temperature_2m as number;
  const precip = wxJson.current.precipitation as number;
  const code = wxJson.current.weather_code as number;

  let weather: WeatherType = "clear";
  if (code >= 71 && code <= 77) weather = "snow";
  else if (precip > 0.1 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82)) weather = "rain";
  else if (t >= 28) weather = "hot";
  else if (t <= 5) weather = "cold";

  return {
    weather,
    tempC: t,
    description: weatherDescription(code),
    resolvedCity: `${place.name}${place.country ? ", " + place.country : ""}`,
  };
}

function weatherDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}
