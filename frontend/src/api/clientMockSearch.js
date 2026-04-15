/**
 * 无线上后端时的纯前端 mock /search 响应（仅生产构建且未配置 VITE_API_BASE 时使用）。
 * 数据为示意，与真实票价无关；同一路线 + 日期 + 舱位稳定一致。
 */

import { localCalendarYmd } from "@/lib/dates";

function fnv1a32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t ^= Math.imul(t ^ (t >>> 7), t | 61) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CABIN_MUL = {
  economy: 1,
  premium_economy: 1.12,
  business: 1.75,
  first: 2.35,
};

/**
 * @param {string} departureYmd
 * @param {number} index
 */
function pickDepTimes(departureYmd, index) {
  const today = localCalendarYmd();
  const late = ["21:30", "22:10", "23:05", "21:55", "22:40", "23:30"];
  const normal = ["07:25", "09:50", "12:15", "14:40", "17:05", "19:20"];
  const pool = departureYmd <= today ? late : normal;
  return pool[index % pool.length];
}

function addMinutesToClock(depTime, addMin) {
  const m = String(depTime).match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return "12:00";
  let h = Number(m[1]);
  let mi = Number(m[2]) + addMin;
  h += Math.floor(mi / 60);
  mi %= 60;
  h %= 24;
  return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
}

/**
 * @param {{ originAirports: string, destinationAirports: string, departureDate: string, cabinClass?: string }} p
 */
export function buildClientMockSearchPayload(p) {
  const origin_airports = String(p.originAirports ?? "").trim();
  const destination_airports = String(p.destinationAirports ?? "").trim();
  const departure_date = String(p.departureDate ?? "").trim();
  const cabin_class = String(p.cabinClass ?? "economy").trim().toLowerCase() || "economy";

  const oCodes = origin_airports.split(",").map((x) => x.trim().toUpperCase()).filter(Boolean);
  const dCodes = destination_airports.split(",").map((x) => x.trim().toUpperCase()).filter(Boolean);
  const o0 = oCodes[0] ?? "PEK";
  const d0 = dCodes[0] ?? "PVG";

  const seed = fnv1a32(`${origin_airports}|${destination_airports}|${departure_date}|${cabin_class}`);
  const rng = mulberry32(seed);
  const mul = CABIN_MUL[cabin_class] ?? CABIN_MUL.economy;

  const base = 320 + Math.floor(rng() * 420);
  const airlines = [
    ["中国国航", "CA"],
    ["东方航空", "MU"],
    ["南方航空", "CZ"],
    ["海南航空", "HU"],
    ["厦门航空", "MF"],
    ["四川航空", "3U"],
  ];

  const flights = [];
  for (let i = 0; i < 6; i++) {
    const [name, prefix] = airlines[i % airlines.length];
    const stops = i % 3 === 2 ? 1 : 0;
    const dep = pickDepTimes(departure_date, i);
    const durMin = stops ? 185 + Math.floor(rng() * 80) : 95 + Math.floor(rng() * 55);
    const arr = addMinutesToClock(dep, durMin);
    const price = Math.max(
      199,
      Math.round((base + i * 28 + Math.floor(rng() * 60)) * mul * (stops ? 0.92 : 1))
    );
    const route_label = stops ? `${o0}→CAN→${d0}` : `${o0}→${d0}`;
    flights.push({
      id: `mock-${seed}-${i}`,
      airlineName: name,
      airline: prefix.toLowerCase(),
      flightNumber: `${prefix}${4800 + i * 17 + (seed % 100)}`,
      depTime: dep,
      arrTime: arr,
      durationLabel: stops ? `${Math.floor(durMin / 60)}小时${durMin % 60}分` : `${Math.floor(durMin / 60)}小时${durMin % 60}分`,
      stops,
      origin: o0,
      destination: d0,
      route_label: route_label,
      routeLabelVisual: route_label,
      price_cny: price,
      cabin_class,
      platforms: i % 2 === 0 ? ["携程", "官网"] : ["飞猪", "美团"],
      source: i % 2 === 0 ? "ctrip" : "fliggy",
    });
  }

  flights.sort((a, b) => (a.price_cny || 0) - (b.price_cny || 0) || (a.stops || 0) - (b.stops || 0));
  const lowest_overall = flights[0] ?? null;
  const lowest_direct = flights.find((f) => (f.stops || 0) === 0) ?? null;
  const lowest_connecting = flights.find((f) => (f.stops || 0) > 0) ?? null;
  const prices = flights.map((f) => f.price_cny).filter((x) => x != null);
  const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
  const low = prices.length ? Math.min(...prices) : null;

  return {
    query: {
      origin_airports,
      destination_airports,
      departure_date,
      cabin_class,
    },
    flights,
    lowest_overall,
    lowest_direct,
    lowest_connecting,
    price_insight: null,
    recommended: null,
    cheap_connections: [],
    _clientMock: true,
  };
}
