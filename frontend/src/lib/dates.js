/** @param {string | undefined} ymd */
export function formatDepartureLabel(ymd) {
  if (!ymd) return "—";
  const parts = ymd.split("-").map(Number);
  const m = parts[1];
  const d = parts[2];
  if (!m || !d) return ymd;
  return `${m} 月 ${d} 日`;
}

/** 用户本地日历日 YYYY-MM-DD（与出发日字符串比较用） */
export function localCalendarYmd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultDepartureDate() {
  return localCalendarYmd();
}

/** 出发日期是否早于本地「今天」日历日（不含等于） */
export function isDepartureDateBeforeToday(ymd, now = new Date()) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  return ymd < localCalendarYmd(now);
}

/**
 * 在本地日历上加减天数，返回 YYYY-MM-DD
 * @param {string} ymd
 * @param {number} deltaDays
 */
export function addCalendarDays(ymd, deltaDays) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const parts = ymd.split("-").map(Number);
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  dt.setDate(dt.getDate() + deltaDays);
  return localCalendarYmd(dt);
}

/** 紧凑中文：4月15日 */
export function formatDepartureShortZh(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd || "—";
  const [, m, d] = ymd.split("-");
  return `${Number(m)}月${Number(d)}日`;
}

/**
 * 以 center 为中心尽量前后各 3 天共 7 天；不早于 minYmd（通常为今天）。
 * 当 center 靠近今天时，窗口整体右移，仍保证 7 天且含 center。
 * @param {string} centerYmd
 * @param {string} minYmd
 */
export function buildNearbyDepartureDates(centerYmd, minYmd) {
  if (!centerYmd || !/^\d{4}-\d{2}-\d{2}$/.test(centerYmd)) return [];
  const min = minYmd && /^\d{4}-\d{2}-\d{2}$/.test(minYmd) ? minYmd : localCalendarYmd();
  const cMinus3 = addCalendarDays(centerYmd, -3);
  const start = cMinus3 < min ? min : cMinus3;
  return Array.from({ length: 7 }, (_, i) => addCalendarDays(start, i));
}
