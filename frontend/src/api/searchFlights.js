const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

function searchUrl(queryString) {
  return API_BASE ? `${API_BASE}/search?${queryString}` : `/api/search?${queryString}`;
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
    res = await fetch(url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
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
