import airportCatalog from "./airportCatalog.json";

/** @typedef {{ code: string; name: string; nameEn?: string; pickerName?: string }} CatalogAirport */
/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   nameEn: string;
 *   country: string;
 *   province: string;
 *   countryEn: string;
 *   metroCode: string;
 *   keywords: string[];
 *   airports: CatalogAirport[];
 * }} CityRecord
 */

/** @param {unknown} c */
function normalizeCatalogCity(c) {
  const row = /** @type {any} */ (c);
  return {
    id: String(row.id),
    name: String(row.name),
    nameEn: row.nameEn != null ? String(row.nameEn) : "",
    country: String(row.country),
    province: row.province != null ? String(row.province) : "",
    countryEn: row.countryEn != null ? String(row.countryEn) : "",
    metroCode: String(row.metroCode),
    keywords: Array.isArray(row.keywords) ? row.keywords.map((x) => String(x)) : [],
    airports: Array.isArray(row.airports)
      ? row.airports.map((a) => ({
          code: String(a.code).toUpperCase(),
          name: String(a.name),
          nameEn: a.nameEn != null ? String(a.nameEn) : "",
          pickerName: a.pickerName != null ? String(a.pickerName) : undefined,
        }))
      : [],
  };
}

/** 城市与机场（由 `airportCatalog.json` 构建，可扩充 JSON 或运行 `scripts/build-airport-catalog.mjs` 重新生成） */
export const CITIES = /** @type {CityRecord[]} */ (airportCatalog.cities.map(normalizeCatalogCity));

const AIRPORT_BY_CODE = {};
for (const city of CITIES) {
  for (const ap of city.airports) {
    AIRPORT_BY_CODE[ap.code] = {
      code: ap.code,
      name: ap.name,
      cityName: city.name,
      pickerName: ap.pickerName,
    };
  }
}

/**
 * @param {CityRecord} city
 * @param {CatalogAirport} ap
 */
export function formatAirportPickerName(city, ap) {
  if (ap.pickerName) return `${ap.pickerName}（${ap.code}）`;
  return `${city.name}${ap.name}国际机场（${ap.code}）`;
}

export function cityPickerHeadline(city) {
  return `${city.name} · ${city.country} · ${city.metroCode}`;
}

/**
 * 预计算城市级搜索串：省份（中国）、国家中英文、城市、metro、keywords、各机场字段与展示名。
 * 过滤规则：空白分隔的多个 token 需全部子串命中（轻量“模糊”，适合前端）。
 */
function buildCitySearchBlob(city) {
  const tokens = [
    city.name,
    city.nameEn,
    city.country,
    city.province,
    city.countryEn,
    city.metroCode,
    ...city.keywords,
    ...city.airports.flatMap((a) => {
      const line = formatAirportPickerName(city, a);
      return [a.code, a.name, a.nameEn, a.pickerName, line].filter(Boolean);
    }),
  ];
  return tokens.join(" ").toLowerCase();
}

const CITY_SEARCH_BLOBS = new Map(CITIES.map((c) => [c.id, buildCitySearchBlob(c)]));

/**
 * @param {string} query
 * @returns {CityRecord[]}
 */
export function filterPickerCities(query) {
  const raw = query.trim().toLowerCase();
  if (!raw) return CITIES;
  const parts = raw.split(/\s+/).filter(Boolean);
  return CITIES.filter((city) => {
    const blob = CITY_SEARCH_BLOBS.get(city.id) ?? "";
    return parts.every((p) => blob.includes(p));
  });
}

function buildLocationSearchItems() {
  const items = [];
  for (const city of CITIES) {
    const codes = city.airports.map((a) => a.code);
    items.push({
      kind: "city",
      id: `city:${city.id}`,
      label: `${city.name}（所有机场）`,
      subtitle: cityPickerHeadline(city),
      codes,
      searchBlob: buildCitySearchBlob(city),
    });
    for (const ap of city.airports) {
      items.push({
        kind: "airport",
        id: `ap:${ap.code}`,
        label: formatAirportPickerName(city, ap),
        subtitle: cityPickerHeadline(city),
        codes: [ap.code],
        searchBlob: buildCitySearchBlob(city),
      });
    }
  }
  return items;
}

const _allItems = buildLocationSearchItems();

export function getLocationItemById(id) {
  return _allItems.find((i) => i.id === id) ?? null;
}

export const DEFAULT_LOCATION_PICKS = {
  origin: _allItems.find((i) => i.id === "ap:PEK") ?? null,
  destination: _allItems.find((i) => i.id === "ap:PVG") ?? null,
};

export function airportDisplay(code) {
  if (code == null || code === "") return "—";
  const c = String(code).trim().toUpperCase();
  const FALLBACK_AIRPORT_ZH = {
    HKG: "香港赤鱲角国际机场",
    NRT: "东京成田国际机场",
    HND: "东京羽田国际机场",
    KIX: "大阪关西国际机场",
    ICN: "首尔仁川国际机场",
    GMP: "首尔金浦国际机场",
    SIN: "新加坡樟宜国际机场",
    BKK: "曼谷素万那普国际机场",
    DMK: "曼谷廊曼国际机场",
    DXB: "迪拜国际机场",
    DOH: "多哈哈马德国际机场",
    IST: "伊斯坦布尔机场",
    LHR: "伦敦希思罗机场",
    CDG: "巴黎戴高乐机场",
    FRA: "法兰克福机场",
    AMS: "阿姆斯特丹史基浦机场",
    JFK: "纽约肯尼迪国际机场",
    LAX: "洛杉矶国际机场",
    SFO: "旧金山国际机场",
    SEA: "西雅图-塔科马国际机场",
    YVR: "温哥华国际机场",
    YYZ: "多伦多皮尔逊国际机场",
  };
  const a = AIRPORT_BY_CODE[c];
  if (!a) return FALLBACK_AIRPORT_ZH[c] ? `${FALLBACK_AIRPORT_ZH[c]}（${c}）` : c;
  if (a.pickerName) return `${a.pickerName}（${a.code}）`;
  return `${a.cityName}${a.name}（${a.code}）`;
}

export function localizeRouteLabel(routeLabel) {
  if (routeLabel == null || routeLabel === "") return "—";
  return String(routeLabel)
    .split("→")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((seg) => airportDisplay(seg))
    .join(" → ");
}

export function summarizeAirportGroup(codes) {
  if (!codes?.length) return "—";
  if (codes.length === 1) return airportDisplay(codes[0]);
  const normalized = [...new Set(codes.map((c) => String(c).trim().toUpperCase()).filter(Boolean))];
  for (const city of CITIES) {
    const cityCodes = city.airports.map((a) => a.code.toUpperCase());
    if (cityCodes.length !== normalized.length) continue;
    const allMatch = cityCodes.every((code) => normalized.includes(code));
    if (allMatch) return `${city.name}（所有机场）`;
  }
  return `${codes.map(airportDisplay).join("； ")}（以上任一机场）`;
}

/** 触发器上展示：城市「（所有机场）」；机场为全称（与列表一致） */
export function locationPillLabel(item) {
  if (!item) return "";
  if (item.kind === "city") {
    const raw = item.id.replace(/^city:/, "");
    const city = CITIES.find((c) => c.id === raw);
    return city ? `${city.name}（所有机场）` : item.label;
  }
  const code = item.codes?.[0];
  if (!code) return item.label;
  const city = CITIES.find((c) => c.airports.some((a) => a.code === code));
  const ap = city?.airports.find((a) => a.code === code);
  if (city && ap) return formatAirportPickerName(city, ap);
  return item.label;
}
