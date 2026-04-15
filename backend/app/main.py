import json
import math
import random
import datetime
from pathlib import Path
from typing import Optional

import airportsdata
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TicketPlatform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "mock_flights.json"
CABIN_CLASS_SET = {"economy", "premium_economy", "business", "first"}
AIRPORTS_IATA = airportsdata.load("IATA")
TRANSIT_HUBS = ["CAN", "CTU", "XIY", "SZX", "HKG", "ICN", "SIN", "DXB", "DOH", "IST"]
ALLOWED_PLATFORMS = ["携程", "飞猪", "美团", "同程", "去哪儿", "Trip.com", "官网"]


def _load_catalog():
    with open(DATA_PATH, encoding="utf-8") as f:
        return json.load(f)


def _with_cabin_price(flight: dict, cabin_class: str, departure_date: str) -> dict:
    prices = flight.get("cabin_prices") or {}
    picked = prices.get(cabin_class)
    if picked is None:
        picked = prices.get("economy", flight.get("price_cny"))
    out = dict(flight)
    out["cabin_class"] = cabin_class
    out["price_cny"] = int(picked) if picked is not None else None
    if out["price_cny"] is not None:
        adjusted = out["price_cny"] + _date_price_adjustment(out, departure_date, cabin_class)
        out["price_cny"] = max(1, int(round(adjusted)))
    src = str(flight.get("source") or "").strip().lower()
    source_map = {
        "ctrip": "携程",
        "fliggy": "飞猪",
        "meituan": "美团",
        "ly": "同程",
        "tongcheng": "同程",
        "qunar": "去哪儿",
        "trip": "Trip.com",
        "trip.com": "Trip.com",
        "official": "官网",
    }
    raw_platforms = flight.get("platforms")
    if isinstance(raw_platforms, list):
        cleaned = [str(x).strip() for x in raw_platforms if str(x).strip() in ALLOWED_PLATFORMS]
    else:
        cleaned = []
    if not cleaned:
        cleaned = [source_map.get(src, "官网")]
    out["platforms"] = cleaned
    out["source"] = source_map.get(src, cleaned[0])
    return out


def _day_of_week_ymd(ymd: str) -> int:
    try:
        yy, mm, dd = [int(x) for x in ymd.split("-")]
        # 0=Monday ... 6=Sunday
        return datetime.date(yy, mm, dd).weekday()
    except Exception:
        return 0


def _date_price_adjustment(flight: dict, departure_date: str, cabin_class: str) -> int:
    """
    对每个日期生成稳定且可解释的价格偏移：
    - 周末略高、工作日略低
    - 近几天更敏感（偏移幅度稍大）
    - 舱位越高，偏移幅度略放大
    """
    base = int(flight.get("price_cny") or 0)
    if base <= 0:
        return 0

    seed_key = f"{flight.get('id')}-{departure_date}-{cabin_class}"
    seed = sum((i + 1) * ord(ch) for i, ch in enumerate(seed_key))
    rnd = random.Random(seed)

    dow = _day_of_week_ymd(departure_date)
    weekend_bump = 0
    if dow == 5:  # Saturday
        weekend_bump = round(base * 0.045)
    elif dow == 6:  # Sunday
        weekend_bump = round(base * 0.04)
    elif dow in (1, 2):  # Tue/Wed
        weekend_bump = -round(base * 0.015)

    # 离今天越近，波动稍敏感（±3 天内更明显）
    today = datetime.date.today()
    try:
        yy, mm, dd = [int(x) for x in departure_date.split("-")]
        dep_date = datetime.date(yy, mm, dd)
        near_factor = 1.15 if abs((dep_date - today).days) <= 3 else 1.0
    except Exception:
        near_factor = 1.0

    cabin_factor = {
        "economy": 1.0,
        "premium_economy": 1.08,
        "business": 1.2,
        "first": 1.32,
    }.get(cabin_class, 1.0)

    noise = round((rnd.random() - 0.5) * base * 0.06 * near_factor * cabin_factor)
    return int(weekend_bump + noise)


def _airport_line(iata: str) -> str:
    ap = AIRPORTS_IATA.get(iata)
    if not ap:
        return iata
    city = ap.get("city") or iata
    name = ap.get("name") or ""
    return f"{city} {name}（{iata}）"


def _route_visual(path_codes: list[str]) -> str:
    return " → ".join(_airport_line(code) for code in path_codes)


def _build_cabin_prices(base_price: int) -> dict:
    return {
        "economy": int(base_price),
        "premium_economy": int(base_price * 1.2),
        "business": int(base_price * 1.85),
        "first": int(base_price * 2.4),
    }


def _seed_for_route(origin: str, destination: str, departure_date: str) -> int:
    key = f"{origin}-{destination}-{departure_date}"
    return sum((i + 1) * ord(ch) for i, ch in enumerate(key))


def _generate_direct_flight(origin: str, destination: str, seq: int, rnd: random.Random) -> dict:
    dep_hour = 6 + seq * 3 + rnd.randint(0, 1)
    dep_min = rnd.choice([0, 10, 20, 30, 40, 50])
    duration_min = 105 + rnd.randint(0, 120)
    arr_total = dep_hour * 60 + dep_min + duration_min
    arr_hour = (arr_total // 60) % 24
    arr_min = arr_total % 60
    base_price = 420 + seq * 85 + rnd.randint(0, 120)
    carrier = rnd.choice(
        [
            ("中国国航", "CA"),
            ("中国东航", "MU"),
            ("中国南航", "CZ"),
            ("海南航空", "HU"),
            ("厦门航空", "MF"),
        ]
    )
    dep = f"{dep_hour:02d}:{dep_min:02d}"
    arr = f"{arr_hour:02d}:{arr_min:02d}"
    route_code = f"{origin}→{destination}"
    platform_pool = ["携程", "飞猪", "美团", "同程", "去哪儿", "Trip.com", "官网"]
    platform_count = 2 if rnd.random() < 0.28 else 1
    platforms = rnd.sample(platform_pool, k=platform_count)
    return {
        "id": f"auto-{origin.lower()}-{destination.lower()}-d{seq}",
        "origin": origin,
        "destination": destination,
        "airlineName": carrier[0],
        "airline": carrier[1],
        "flightNumber": f"{carrier[1]}{rnd.randint(1000, 8999)}",
        "depTime": dep,
        "arrTime": arr,
        "route_label": route_code,
        "routeLabelVisual": _route_visual([origin, destination]),
        "stops": 0,
        "price_cny": base_price,
        "cabin_prices": _build_cabin_prices(base_price),
        "source": platforms[0],
        "platforms": platforms,
        "durationLabel": f"{duration_min // 60} 小时 {duration_min % 60} 分",
        "baggageIncluded": True,
        "refundLabel": "按舱位规则（示例）",
        "changeLabel": "有条件改签（示例）",
        "preview": {
            "durationLabel": f"{duration_min // 60} 小时 {duration_min % 60} 分",
            "originAirportLine": _airport_line(origin),
            "destAirportLine": _airport_line(destination),
            "legs": [],
        },
    }


def _generate_connecting_flight(origin: str, destination: str, seq: int, rnd: random.Random) -> dict:
    hub_candidates = [h for h in TRANSIT_HUBS if h not in {origin, destination} and h in AIRPORTS_IATA]
    hub = rnd.choice(hub_candidates) if hub_candidates else origin
    dep_hour = 7 + seq * 4
    dep_min = rnd.choice([5, 20, 35, 50])
    layover_min = 70 + rnd.randint(0, 60)
    leg1 = 80 + rnd.randint(0, 80)
    leg2 = 90 + rnd.randint(0, 90)
    total = leg1 + leg2 + layover_min
    arr_total = dep_hour * 60 + dep_min + total
    arr_hour = (arr_total // 60) % 24
    arr_min = arr_total % 60
    base_price = 360 + seq * 60 + rnd.randint(0, 90)
    carrier = rnd.choice(
        [
            ("中国南航", "CZ"),
            ("吉祥航空", "HO"),
            ("四川航空", "3U"),
            ("春秋航空", "9C"),
        ]
    )
    dep = f"{dep_hour:02d}:{dep_min:02d}"
    arr = f"{arr_hour:02d}:{arr_min:02d}"
    platform_pool = ["携程", "飞猪", "美团", "同程", "去哪儿", "Trip.com", "官网"]
    platform_count = 2 if rnd.random() < 0.22 else 1
    platforms = rnd.sample(platform_pool, k=platform_count)
    return {
        "id": f"auto-{origin.lower()}-{destination.lower()}-c{seq}",
        "origin": origin,
        "destination": destination,
        "airlineName": carrier[0],
        "airline": carrier[1],
        "flightNumber": f"{carrier[1]}{rnd.randint(1000, 8999)}",
        "depTime": dep,
        "arrTime": arr,
        "route_label": f"{origin}→{hub}→{destination}",
        "routeLabelVisual": _route_visual([origin, hub, destination]),
        "stops": 1,
        "price_cny": base_price,
        "cabin_prices": _build_cabin_prices(base_price),
        "source": platforms[0],
        "platforms": platforms,
        "durationLabel": f"{total // 60} 小时 {total % 60} 分",
        "baggageIncluded": False,
        "refundLabel": "特价舱限制较多（示例）",
        "changeLabel": "改签需按规则（示例）",
        "preview": {
            "durationLabel": f"{total // 60} 小时 {total % 60} 分",
            "originAirportLine": _airport_line(origin),
            "destAirportLine": _airport_line(destination),
            "legs": [
                {"from": origin, "to": hub, "flightNo": f"{carrier[1]}{rnd.randint(100,999)}"},
                {"layoverCity": AIRPORTS_IATA.get(hub, {}).get("city") or hub, "layoverDuration": f"{layover_min} 分"},
                {"from": hub, "to": destination, "flightNo": f"{carrier[1]}{rnd.randint(100,999)}"},
            ],
        },
    }


def _generate_synthetic_flights(origins: set[str], dests: set[str], departure_date: str) -> list[dict]:
    flights: list[dict] = []
    for origin in origins:
        for destination in dests:
            if origin == destination:
                continue
            if origin not in AIRPORTS_IATA or destination not in AIRPORTS_IATA:
                continue
            rnd = random.Random(_seed_for_route(origin, destination, departure_date))
            flights.append(_generate_direct_flight(origin, destination, 1, rnd))
            flights.append(_generate_direct_flight(origin, destination, 2, rnd))
            flights.append(_generate_connecting_flight(origin, destination, 1, rnd))
    return flights


def _fnv1a32_route_seed(origin_csv: str, dest_csv: str, dep: str) -> int:
    s = f"{origin_csv}|{dest_csv}|{dep}"
    h = 2166136261
    for b in s.encode("utf-8"):
        h ^= b
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def _route_chart_flags(origin_csv: str, dest_csv: str) -> tuple[bool, bool, bool]:
    o_codes = [x.strip().upper() for x in origin_csv.split(",") if x.strip()]
    d_codes = [x.strip().upper() for x in dest_csv.split(",") if x.strip()]

    def country_iso(iata: str) -> Optional[str]:
        ap = AIRPORTS_IATA.get(iata)
        if not ap:
            return None
        return str(ap.get("country") or "").upper() or None

    def is_china(iata: str) -> bool:
        co = country_iso(iata)
        return co is None or co == "CN"

    o0 = o_codes[0] if o_codes else ""
    d0 = d_codes[0] if d_codes else ""
    intl = bool(o0 and d0) and (not is_china(o0) or not is_china(d0))

    os_ = set(o_codes)
    ds_ = set(d_codes)
    pekish = bool({"PEK", "PKX"} & os_ or {"PEK", "PKX"} & ds_)
    shang = bool({"PVG", "SHA"} & os_ or {"PVG", "SHA"} & ds_)
    can_szx = ("CAN" in os_ and "SZX" in ds_) or ("SZX" in os_ and "CAN" in ds_) or ("CAN" in os_ and "ZUH" in ds_) or ("ZUH" in os_ and "CAN" in ds_)
    popular = (pekish and shang) or can_szx or (bool({"CTU", "TFU"} & os_) and shang)

    short_haul = (not intl) and (
        can_szx
        or (bool({"SHA", "PVG"} & os_) and bool({"TAO", "DLC", "SHE"} & ds_))
        or (bool({"SHA", "PVG"} & ds_) and bool({"TAO", "DLC", "SHE"} & os_))
    )
    return intl, popular, short_haul


def _build_route_trend_forecast(
    low: int,
    avg: Optional[int],
    origin_csv: str,
    dest_csv: str,
    dep: str,
) -> tuple[list[dict], list[dict]]:
    seed = _fnv1a32_route_seed(origin_csv.strip(), dest_csv.strip(), dep.strip())
    rnd = random.Random(seed)
    c = int(low)
    ref = max(c, int(avg) if avg is not None else c, 100)
    intl, popular, short_haul = _route_chart_flags(origin_csv, dest_csv)

    if intl:
        spread = ref * (0.26 + rnd.random() * 0.14)
    elif short_haul:
        spread = ref * (0.09 + rnd.random() * 0.07)
    elif popular:
        spread = ref * (0.2 + rnd.random() * 0.12)
    else:
        spread = ref * (0.13 + rnd.random() * 0.1)

    if popular:
        wiggle = ref * 0.05
    elif intl:
        wiggle = ref * 0.045
    elif short_haul:
        wiggle = ref * 0.025
    else:
        wiggle = ref * 0.035

    arch = seed % 4
    ks = [0.72, 0.88, 1.05, 0.95, 1.12]
    step_scales = []
    for idx in range(5):
        phase = math.sin(((idx + 1) / 5) * math.pi * (1.2 + arch * 0.2)) * 0.18
        step_scales.append(ks[idx] * (1 + phase))

    past_prices: list[int] = []
    cur = c + spread * (0.86 + rnd.random() * 0.24)
    for i in range(5):
        if short_haul:
            mult = 0.72
        elif popular:
            mult = 1.18
        elif intl:
            mult = 1.05
        else:
            mult = 1.0
        step = ref * (0.034 + rnd.random() * 0.072) * step_scales[i] * mult
        cur -= step
        cur += (rnd.random() - 0.5) * wiggle * 0.95
        floor_n = c + 8 + (5 - i) * 5
        past_prices.append(max(floor_n, round(cur)))

    for i in range(1, 5):
        if past_prices[i] > past_prices[i - 1] - 5:
            past_prices[i] = past_prices[i - 1] - int(7 + rnd.random() * 16)

    for i in range(3, -1, -1):
        past_prices[i] = max(past_prices[i], past_prices[i + 1] + 6)

    past_prices.append(c)
    labels = ["5周前", "4周前", "3周前", "2周前", "1周前", "今天"]
    trend = [{"label": labels[i], "price": past_prices[i]} for i in range(6)]

    forecast: list[dict] = []
    fp = float(c)
    fc_amp = ref * (0.055 if popular else 0.06 if intl else 0.038)
    drift = (seed % 5) / 100 - 0.02
    fc_labels = ["1周后", "2周后", "3周后", "4周后"]
    for w in range(4):
        fp += (rnd.random() - 0.48) * fc_amp + drift * ref * 0.012
        forecast.append({"label": fc_labels[w], "price": max(1, int(round(fp)))})

    return trend, forecast


def _build_insight(
    matched: list,
    low: Optional[int],
    avg: Optional[int],
    origin_airports: str = "",
    destination_airports: str = "",
    departure_date: str = "",
) -> Optional[dict]:
    if low is None or avg is None:
        return None
    hist_low = max(1, int(low * 0.88))
    current = int(low)
    mean = int(avg)
    span = max(1, mean - hist_low)
    position = min(1.0, max(0.0, (current - hist_low) / span))

    clearly_below_mean = current <= mean * 0.92
    clearly_above_mean = current >= mean * 1.08
    low_in_range = position <= 0.35
    high_in_range = position >= 0.72

    if clearly_below_mean or low_in_range:
        level = "good"
        rec = "当前最低价相对历史低位与近期均价更友好，可关注余票与退改规则后入手。"
    elif clearly_above_mean or high_in_range:
        level = "caution"
        rec = "当前最低价相对近期均价偏高，建议多比价或调整日期/时刻。"
    else:
        level = "neutral"
        rec = "当前最低价处于常见区间，可对比舱位与行李额度后再订。"

    trend, forecast = _build_route_trend_forecast(
        int(low), avg, origin_airports, destination_airports, departure_date
    )
    return {
        "recommendation_level": level,
        "current_price_cny": low,
        "average_price_cny": avg,
        "historical_low_cny": hist_low,
        "recommendation": rec,
        "trend": trend,
        "forecast": forecast,
    }


def _pick_recommended(lowest_overall: Optional[dict], lowest_direct: Optional[dict]) -> Optional[dict]:
    if lowest_direct and lowest_overall:
        dp = lowest_direct.get("price_cny") or 0
        op = lowest_overall.get("price_cny") or 0
        if dp <= op * 1.08:
            return {
                "flight": lowest_direct,
                "reason": "直飞省时，价格接近当前最优，适合商务与家庭出行。",
            }
    if lowest_overall:
        return {
            "flight": lowest_overall,
            "reason": "当前全场低价方案，性价比高；若接受中转可再看下方中转推荐。",
        }
    return None


def _cheap_connections(matched: list, lowest_direct: Optional[dict], limit: int = 3) -> list:
    if not lowest_direct:
        return []
    dprice = lowest_direct.get("price_cny") or 0
    cons = [f for f in matched if (f.get("stops") or 0) > 0]
    cons.sort(key=lambda x: (x.get("price_cny") or 0, x.get("stops") or 0))
    out = []
    for f in cons[:limit]:
        save = int(dprice - (f.get("price_cny") or 0))
        out.append(
            {
                "flight": f,
                "save_vs_direct_cny": max(0, save),
                "summary": f.get("routeLabelVisual") or f.get("route_label") or "",
            }
        )
    return out


@app.get("/search")
def search_flights(
    origin_airports: str = Query(..., description="Comma-separated origin IATA codes"),
    destination_airports: str = Query(..., description="Comma-separated destination IATA codes"),
    departure_date: str = Query(..., description="YYYY-MM-DD"),
    cabin_class: str = Query("economy", description="economy|premium_economy|business|first"),
):
    origins = {x.strip().upper() for x in origin_airports.split(",") if x.strip()}
    dests = {x.strip().upper() for x in destination_airports.split(",") if x.strip()}
    catalog = _load_catalog()
    raw = catalog.get("flights", [])
    cabin = cabin_class.strip().lower()
    if cabin not in CABIN_CLASS_SET:
        cabin = "economy"
    base_matched = [f for f in raw if f.get("origin") in origins and f.get("destination") in dests]
    if not base_matched:
        base_matched = _generate_synthetic_flights(origins, dests, departure_date)
    matched = [_with_cabin_price(f, cabin, departure_date.strip()) for f in base_matched]
    matched.sort(key=lambda x: (x.get("price_cny") or 0, x.get("stops") or 0))

    lowest_overall = matched[0] if matched else None
    lowest_direct = next((f for f in matched if (f.get("stops") or 0) == 0), None)
    lowest_connecting = next((f for f in matched if (f.get("stops") or 0) > 0), None)

    prices = [f["price_cny"] for f in matched if f.get("price_cny") is not None]
    avg = round(sum(prices) / len(prices)) if prices else None
    low = min(prices) if prices else None

    insight = _build_insight(
        matched,
        low,
        avg,
        origin_airports.strip(),
        destination_airports.strip(),
        departure_date.strip(),
    )
    recommended = _pick_recommended(lowest_overall, lowest_direct)
    cheap_connections = _cheap_connections(matched, lowest_direct)

    return {
        "query": {
            "origin_airports": origin_airports.strip(),
            "destination_airports": destination_airports.strip(),
            "departure_date": departure_date.strip(),
            "cabin_class": cabin,
        },
        "flights": matched,
        "lowest_overall": lowest_overall,
        "lowest_direct": lowest_direct,
        "lowest_connecting": lowest_connecting,
        "price_insight": insight,
        "recommended": recommended,
        "cheap_connections": cheap_connections,
    }
