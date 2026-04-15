/**
 * 规范化后端基址，避免 `fetch("example.com/...")` 这类缺少协议的字符串在 Safari 下抛出
 * `The string did not match the expected pattern`。
 * @param {string} raw
 */
function normalizeApiBase(raw) {
  let s = String(raw ?? "").trim().replace(/\/+$/, "");
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(s) || /^localhost:\d+/i.test(s);
  return `${isLocal ? "http" : "https"}://${s.replace(/^\/+/, "")}`;
}

function searchUrl(queryString) {
  const base = normalizeApiBase(import.meta.env.VITE_API_BASE ?? "");
  if (!base) return `/api/search?${queryString}`;
  return `${base}/search?${queryString}`;
}

/**
 * @param {{ originAirports: string, destinationAirports: string, departureDate: string, cabinClass?: string }} params
 */
export async function searchFlights({ originAirports, destinationAirports, departureDate, cabinClass = "economy" }) {
  const qs = new URLSearchParams({
    origin_airports: originAirports.trim(),
    destination_airports: destinationAirports.trim(),
    departure_date: departureDate.trim(),
    cabin_class: cabinClass.trim(),
  });
  const url = searchUrl(qs.toString());
  let res;
  try {
    try {
      new URL(url, typeof window !== "undefined" ? window.location.href : "http://localhost");
    } catch {
      throw new Error(
        "接口地址无效。请在环境变量 VITE_API_BASE 中填写完整地址（例如 https://api.example.com），或留空以使用本站 /api 代理。"
      );
    }
    res = await fetch(url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("did not match the expected pattern")) {
      throw new Error(
        "请求地址格式无效（常见于接口域名缺少 https://）。请检查 VITE_API_BASE，或留空使用 /api。"
      );
    }
    if (
      e instanceof TypeError &&
      (msg.includes("fetch") || msg.includes("Failed to load") || msg.includes("NetworkError"))
    ) {
      throw new Error("网络异常，暂时无法获取票价，请稍后重试。");
    }
    throw e instanceof Error ? e : new Error(msg);
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body.detail) detail = JSON.stringify(body.detail);
    } catch {
      /* ignore */
    }
    throw new Error(detail || `请求失败 (${res.status})`);
  }
  return res.json();
}
