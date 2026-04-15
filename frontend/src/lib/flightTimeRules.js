/**
 * 航班出发时刻与「本地当前时间」相关的规则（可预订窗口等）。
 */

import { CITIES } from "@/data/locations";

/** 机场三字码 → 国家名（与机场目录一致，用于区分国内/跨境示意） */
const AIRPORT_COUNTRY = new Map();
for (const city of CITIES) {
  for (const ap of city.airports) {
    AIRPORT_COUNTRY.set(ap.code, city.country);
  }
}

/**
 * @param {string} originCsv
 * @param {string} destCsv
 * @param {string} dateYmd
 */
function hashRouteSeed(originCsv, destCsv, dateYmd) {
  const s = `${String(originCsv)}|${String(destCsv)}|${String(dateYmd)}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** @param {number} seed */
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

/**
 * @param {string[]} oCodes
 * @param {string[]} dCodes
 */
function routeFlags(oCodes, dCodes) {
  const first = (arr) => arr[0];
  const o0 = first(oCodes) ?? "";
  const d0 = first(dCodes) ?? "";
  const ctr = (code) => AIRPORT_COUNTRY.get(code);
  const isChina = (code) => !code || ctr(code) === "中国";
  const intl = Boolean(o0 && d0) && (!isChina(o0) || !isChina(d0));

  const os = new Set(oCodes);
  const ds = new Set(dCodes);
  const pekish = os.has("PEK") || os.has("PKX") || ds.has("PEK") || ds.has("PKX");
  const shang = os.has("PVG") || os.has("SHA") || ds.has("PVG") || ds.has("SHA");
  const canSzx =
    (os.has("CAN") && ds.has("SZX")) ||
    (os.has("SZX") && ds.has("CAN")) ||
    (os.has("CAN") && ds.has("ZUH")) ||
    (os.has("ZUH") && ds.has("CAN"));
  const popular = (pekish && shang) || canSzx || (os.has("CTU") || os.has("TFU")) && shang;

  const shortHaul =
    !intl &&
    (canSzx ||
      ((os.has("SHA") || os.has("PVG")) && (ds.has("TAO") || ds.has("DLC") || ds.has("SHE"))) ||
      ((ds.has("SHA") || ds.has("PVG")) && (os.has("TAO") || os.has("DLC") || os.has("SHE"))));

  return { intl, popular, shortHaul, o0, d0 };
}

/**
 * 基于航线 + 出发日稳定 seed 的示意走势（非真实行情）；同条件刷新形状一致。
 * @param {number} low
 * @param {number | null} avg
 * @param {{ origin_airports?: string; destination_airports?: string; departure_date?: string }} query
 */
export function buildRouteTrendForecast(low, avg, query) {
  const originCsv = query?.origin_airports ?? "";
  const destCsv = query?.destination_airports ?? "";
  const dateYmd = query?.departure_date ?? "";
  const oCodes = originCsv.split(",").map((x) => x.trim().toUpperCase()).filter(Boolean);
  const dCodes = destCsv.split(",").map((x) => x.trim().toUpperCase()).filter(Boolean);

  const seed = hashRouteSeed(originCsv, destCsv, dateYmd);
  const rng = mulberry32(seed);
  const c = Math.round(low);
  const ref = Math.max(c, avg != null ? Math.round(avg) : c, 100);
  const { intl, popular, shortHaul } = routeFlags(oCodes, dCodes);

  const spread =
    ref *
    (intl ? 0.26 + rng() * 0.14 : shortHaul ? 0.09 + rng() * 0.07 : popular ? 0.2 + rng() * 0.12 : 0.13 + rng() * 0.1);
  const wiggle = ref * (popular ? 0.05 : intl ? 0.045 : shortHaul ? 0.025 : 0.035);
  const arch = seed % 4;

  const pastLabels = ["5周前", "4周前", "3周前", "2周前", "1周前", "今天"];
  const stepScales = [0.72, 0.88, 1.05, 0.95, 1.12].map((k, idx) => {
    const phase = Math.sin(((idx + 1) / 5) * Math.PI * (1.2 + arch * 0.2)) * 0.18;
    return k * (1 + phase);
  });
  const pastPrices = [];
  let cur = c + spread * (0.86 + rng() * 0.24);
  for (let i = 0; i < 5; i++) {
    const step = ref * (0.034 + rng() * 0.072) * stepScales[i] * (shortHaul ? 0.72 : popular ? 1.18 : intl ? 1.05 : 1);
    cur -= step;
    cur += (rng() - 0.5) * wiggle * 0.95;
    const floorN = c + 8 + (5 - i) * 5;
    pastPrices.push(Math.round(Math.max(floorN, cur)));
  }
  for (let i = 1; i < 5; i++) {
    if (pastPrices[i] > pastPrices[i - 1] - 5) {
      pastPrices[i] = pastPrices[i - 1] - Math.round(7 + rng() * 16);
    }
  }
  for (let i = 3; i >= 0; i--) {
    pastPrices[i] = Math.max(pastPrices[i], pastPrices[i + 1] + 6);
  }
  pastPrices.push(c);

  const trend = pastLabels.map((label, i) => ({ label, price: pastPrices[i] }));

  const fcLabels = ["1周后", "2周后", "3周后", "4周后"];
  const forecast = [];
  let fp = c;
  const fcAmp = ref * (popular ? 0.055 : intl ? 0.06 : 0.038);
  const drift = (seed % 5) / 100 - 0.02;
  for (let w = 0; w < 4; w++) {
    fp += (rng() - 0.48) * fcAmp + drift * ref * 0.012;
    fp = Math.round(Math.max(1, fp));
    forecast.push({ label: fcLabels[w], price: fp });
  }

  return { trend, forecast };
}

/**
 * @param {string} departureDateYmd YYYY-MM-DD
 * @param {string | undefined} depTime 如 "08:05"
 * @returns {Date | null}
 */
export function parseFlightLocalDeparture(departureDateYmd, depTime) {
  if (!departureDateYmd || !depTime) return null;
  const dm = String(depTime).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!dm) return null;
  const h = Number(dm[1]);
  const min = Number(dm[2]);
  const parts = departureDateYmd.split("-").map(Number);
  const yy = parts[0];
  const mo = parts[1];
  const dd = parts[2];
  if (!yy || !mo || !dd) return null;
  const d = new Date(yy, mo - 1, dd, h, min, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * 是否满足：出发时刻 >= 当前本地时间 + 1 小时
 * @param {string} departureDateYmd
 * @param {string | undefined} depTime
 * @param {Date} [now]
 */
export function isFlightDepartingAtLeastOneHourAhead(departureDateYmd, depTime, now = new Date()) {
  const dt = parseFlightLocalDeparture(departureDateYmd, depTime);
  if (!dt) return false;
  const minDepart = new Date(now.getTime() + 60 * 60 * 1000);
  return dt.getTime() >= minDepart.getTime();
}

/**
 * 依据「当前最低价」相对历史低价与近期均价的区间位置，判定便宜/适中/偏贵（不再使用历史最高价）。
 * position = (current - historical_min) / max(mean - historical_min, 1)，落在 [0,1]。
 */
/**
 * @param {unknown[]} matched
 * @param {number | null} low
 * @param {number | null} avg
 * @param {{ origin_airports?: string; destination_airports?: string; departure_date?: string } | null | undefined} query
 */
function buildInsight(matched, low, avg, query) {
  if (low == null || avg == null) return null;
  const histLow = Math.max(1, Math.floor(low * 0.88));
  const current = low;
  const mean = avg;
  const span = Math.max(1, mean - histLow);
  const position = Math.min(1, Math.max(0, (current - histLow) / span));

  const clearlyBelowMean = current <= mean * 0.92;
  const clearlyAboveMean = current >= mean * 1.08;
  const lowInRange = position <= 0.35;
  const highInRange = position >= 0.72;

  let level;
  let rec;
  if (clearlyBelowMean || lowInRange) {
    level = "good";
    rec = "当前最低价相对历史低位与近期均价更友好，可关注余票与退改规则后入手。";
  } else if (clearlyAboveMean || highInRange) {
    level = "caution";
    rec = "当前最低价相对近期均价偏高，建议多比价或调整日期/时刻。";
  } else {
    level = "neutral";
    rec = "当前最低价处于常见区间，可对比舱位与行李额度后再订。";
  }

  const { trend, forecast } = buildRouteTrendForecast(low, avg, query ?? {});
  return {
    recommendation_level: level,
    current_price_cny: low,
    average_price_cny: avg,
    historical_low_cny: histLow,
    recommendation: rec,
    trend,
    forecast,
  };
}

function pickRecommended(lowestOverall, lowestDirect) {
  if (lowestDirect && lowestOverall) {
    const dp = lowestDirect.price_cny || 0;
    const op = lowestOverall.price_cny || 0;
    if (dp <= op * 1.08) {
      return {
        flight: lowestDirect,
        reason: "直飞省时，价格接近当前最优，适合商务与家庭出行。",
      };
    }
  }
  if (lowestOverall) {
    return {
      flight: lowestOverall,
      reason: "当前全场低价方案，性价比高；若接受中转可再看下方中转推荐。",
    };
  }
  return null;
}

function cheapConnections(matched, lowestDirect) {
  if (!lowestDirect) return [];
  const dprice = lowestDirect.price_cny || 0;
  const cons = matched.filter((f) => (f.stops || 0) > 0);
  cons.sort((a, b) => (a.price_cny || 0) - (b.price_cny || 0) || (a.stops || 0) - (b.stops || 0));
  const out = [];
  for (const f of cons.slice(0, 3)) {
    const save = Math.max(0, Math.floor(dprice - (f.price_cny || 0)));
    out.push({
      flight: f,
      save_vs_direct_cny: save,
      summary: f.routeLabelVisual || f.route_label || "",
    });
  }
  return out;
}

/**
 * 按「出发 >= 本地现在 + 1h」过滤，并重算与列表相关的派生字段（与后端结构一致）。
 * @param {Record<string, unknown>} payload /search 响应体
 * @param {string} departureDateYmd
 */
export function applyDepartureWindowToSearchPayload(payload, departureDateYmd) {
  if (!payload || !departureDateYmd) return payload;
  const raw = payload.flights ?? [];
  const now = new Date();
  const matched = raw.filter((f) => isFlightDepartingAtLeastOneHourAhead(departureDateYmd, f.depTime, now));
  const sorted = [...matched].sort(
    (a, b) => (a.price_cny || 0) - (b.price_cny || 0) || (a.stops || 0) - (b.stops || 0)
  );
  const lowest_overall = sorted[0] ?? null;
  const lowest_direct = sorted.find((f) => (f.stops || 0) === 0) ?? null;
  const lowest_connecting = sorted.find((f) => (f.stops || 0) > 0) ?? null;
  const prices = sorted.map((f) => f.price_cny).filter((p) => p != null);
  const low = prices.length ? Math.min(...prices) : null;
  const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
  const price_insight = buildInsight(sorted, low, avg, payload.query ?? {});
  const recommended = pickRecommended(lowest_overall, lowest_direct);
  const cheap_connections = cheapConnections(sorted, lowest_direct);
  return {
    ...payload,
    flights: sorted,
    lowest_overall,
    lowest_direct,
    lowest_connecting,
    price_insight,
    recommended,
    cheap_connections,
  };
}

/**
 * 与结果页列表一致的「可订过滤后」全场最低价；无可用行程时为 null。
 * @param {Record<string, unknown>} payload /search 原始响应
 * @param {string} departureDateYmd
 */
export function lowestFilteredPriceCny(payload, departureDateYmd) {
  const p = applyDepartureWindowToSearchPayload(payload, departureDateYmd);
  const v = p?.lowest_overall?.price_cny;
  if (v == null) return null;
  return Number(v);
}
