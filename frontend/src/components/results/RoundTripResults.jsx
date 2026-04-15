import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { localizeRouteLabel } from "@/data/locations";
import { cn } from "@/lib/utils";

import { BookNowLink } from "./BookNowLink";
import { FlightPreviewContent } from "./FlightPreviewContent";

const COLLAPSE_AFTER = 6;
const INFO_OPEN_DELAY = 280;
const INFO_CLOSE_DELAY = 200;
const PANEL_PX = "px-4 sm:px-6 md:px-8";

function sourceLabel(raw) {
  const s = String(raw ?? "").trim();
  if (!s || s === "—") return "官网";
  const map = {
    demo: "官网",
    ctrip: "携程",
    qunar: "去哪儿",
    fliggy: "飞猪",
    meituan: "美团",
    tongcheng: "同程",
    ly: "同程",
    trip: "Trip.com",
    "trip.com": "Trip.com",
    official: "官网",
    官网: "官网",
    携程: "携程",
    飞猪: "飞猪",
    美团: "美团",
    同程: "同程",
    去哪儿: "去哪儿",
    "Trip.com": "Trip.com",
  };
  return map[s] ?? "官网";
}

function platformsOfFlight(f) {
  const list = Array.isArray(f?.platforms) ? f.platforms.map((x) => sourceLabel(x)).filter(Boolean) : [];
  if (list.length) return [...new Set(list)];
  return [sourceLabel(f?.source)];
}

function comboPlatforms(outbound, inbound) {
  const set = new Set([...platformsOfFlight(outbound), ...platformsOfFlight(inbound)]);
  return [...set];
}

function buildRoundTripCombos(outboundFlights, inboundFlights) {
  const outs = [...(outboundFlights ?? [])].sort((a, b) => (a.price_cny || 0) - (b.price_cny || 0)).slice(0, 18);
  const ins = [...(inboundFlights ?? [])].sort((a, b) => (a.price_cny || 0) - (b.price_cny || 0)).slice(0, 18);
  const combos = [];
  for (const o of outs) {
    for (const r of ins) {
      const base = Number(o.price_cny || 0) + Number(r.price_cny || 0);
      if (!base) continue;
      const sameAirline = o.airline === r.airline;
      const discount = sameAirline ? 0.97 : 1;
      const total = Math.max(1, Math.round(base * discount));
      combos.push({
        id: `${o.id}__${r.id}`,
        outbound: o,
        inbound: r,
        total_price_cny: total,
        discount_cny: base - total,
        stop_combo: `${o.stops === 0 ? "直飞" : "中转"}+${r.stops === 0 ? "直飞" : "中转"}`,
        platforms: comboPlatforms(o, r),
      });
    }
  }
  combos.sort((a, b) => a.total_price_cny - b.total_price_cny);
  return combos;
}

function ComboTags({ labels, compact = false }) {
  if (!labels?.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", compact && "gap-1")}>
      {labels.map((l) => (
        <span
          key={l}
          className={cn(
            "rounded-full border border-violet-300/55 bg-violet-100/55 px-2 py-0.5 text-xs text-violet-800 dark:border-violet-400/35 dark:bg-violet-500/15 dark:text-violet-200",
            compact && "px-1.5 py-0.5 text-[10px]"
          )}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

function ComboLegLine({ title, flight }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/15 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">{title}</p>
        <HoverCard openDelay={INFO_OPEN_DELAY} closeDelay={INFO_CLOSE_DELAY}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className="px-1 text-[11px] text-muted-foreground underline decoration-muted-foreground/60 underline-offset-2 hover:text-foreground/80"
              aria-label={`查看${title}详细信息`}
            >
              详细信息
            </button>
          </HoverCardTrigger>
          <HoverCardContent side="left" align="end" className="w-[min(calc(100vw-2rem),22rem)] p-0 shadow-xl" collisionPadding={16}>
            <FlightPreviewContent flight={flight} />
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
        <span className="font-medium text-foreground">
          {flight.airlineName} {flight.flightNumber}
        </span>
        <span className="tabular-nums text-foreground/90">
          {flight.depTime}
          <span className="mx-1 text-muted-foreground">→</span>
          {flight.arrTime}
        </span>
        <span className="text-muted-foreground">{flight.stops === 0 ? "直飞" : `${flight.stops} 次经停`}</span>
      </div>
      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{localizeRouteLabel(flight.route_label)}</p>
    </div>
  );
}

export function RoundTripRecommendedCard({ combo }) {
  if (!combo) return null;
  return (
    <Card className="border-border/80 bg-gradient-to-br from-muted/30 via-card to-card">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg md:text-xl">全网最低价（往返）</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">当前往返组合总价最低，建议尽快预订。</p>
          </div>
          <div className="flex flex-col items-end">
            <ComboTags labels={combo.platforms} />
            <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight md:text-5xl">¥{combo.total_price_cny}</p>
            <Button size="sm" className="mt-3" asChild>
              <BookNowLink flight={combo.outbound}>立即预订</BookNowLink>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 border-t border-border/50 pt-4">
        <ComboLegLine title="去程" flight={combo.outbound} />
        <ComboLegLine title="返程" flight={combo.inbound} />
      </CardContent>
    </Card>
  );
}

function SummaryCard({ title, combo }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
          <ComboTags labels={combo?.platforms ?? []} compact />
        </div>
        <p className="text-xl font-semibold tabular-nums tracking-tight">{combo ? `¥${combo.total_price_cny}` : "—"}</p>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {combo ? (
          <>
            <ComboLegLine title="去程" flight={combo.outbound} />
            <ComboLegLine title="返程" flight={combo.inbound} />
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" className="h-7 px-3 text-xs" asChild>
                <BookNowLink flight={combo.outbound}>立即预订</BookNowLink>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">暂无</p>
        )}
      </CardContent>
    </Card>
  );
}

export function RoundTripSummaryRow({ combos }) {
  const direct = combos.find((c) => c.outbound.stops === 0 && c.inbound.stops === 0) ?? null;
  const mixed = combos.find((c) => c.outbound.stops > 0 || c.inbound.stops > 0) ?? null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
      <SummaryCard title="直飞最低（往返）" combo={direct} />
      <SummaryCard title="中转最低（往返）" combo={mixed} />
    </div>
  );
}

function depHourOf(depTime) {
  const m = String(depTime ?? "").match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) : null;
}

function depMinOf(depTime) {
  const m = String(depTime ?? "").match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

function inTimeSlot(hour, slot) {
  if (slot === "all") return true;
  if (slot === "night") return hour != null && hour >= 0 && hour < 6;
  if (slot === "morning") return hour != null && hour >= 6 && hour < 12;
  if (slot === "afternoon") return hour != null && hour >= 12 && hour < 18;
  if (slot === "evening") return hour != null && hour >= 18 && hour < 24;
  return true;
}

function SideFlightCard({ title, flight, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(flight)}
      className={cn(
        "w-full rounded-md border px-3 py-2 text-left transition-colors",
        selected
          ? "border-foreground/35 bg-muted/40 ring-1 ring-foreground/10"
          : "border-border/70 bg-background hover:bg-muted/20"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">{title}</p>
        <HoverCard openDelay={INFO_OPEN_DELAY} closeDelay={INFO_CLOSE_DELAY}>
          <HoverCardTrigger asChild>
            <span
              onClick={(e) => e.stopPropagation()}
              className="px-1 text-[11px] text-muted-foreground underline decoration-muted-foreground/60 underline-offset-2 hover:text-foreground/80"
            >
              详细信息
            </span>
          </HoverCardTrigger>
          <HoverCardContent side="left" align="end" className="w-[min(calc(100vw-2rem),22rem)] p-0 shadow-xl" collisionPadding={16}>
            <FlightPreviewContent flight={flight} />
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground">
          {flight.airlineName} {flight.flightNumber}
        </p>
        <p className="text-sm font-semibold tabular-nums text-foreground">¥{flight.price_cny}</p>
      </div>
      <p className="mt-0.5 text-xs tabular-nums text-foreground/90">
        {flight.depTime}
        <span className="mx-1 text-muted-foreground">→</span>
        {flight.arrTime}
      </p>
      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{localizeRouteLabel(flight.route_label)}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{flight.stops === 0 ? "直飞" : `${flight.stops} 次经停`}</p>
    </button>
  );
}

export function RoundTripListTable({ outboundFlights, inboundFlights }) {
  const [goTimeFilter, setGoTimeFilter] = useState("all");
  const [backTimeFilter, setBackTimeFilter] = useState("all");
  const [goStopFilter, setGoStopFilter] = useState("all");
  const [backStopFilter, setBackStopFilter] = useState("all");
  const [goPriceFilter, setGoPriceFilter] = useState("all");
  const [backPriceFilter, setBackPriceFilter] = useState("all");
  const [goSort, setGoSort] = useState("price_asc");
  const [backSort, setBackSort] = useState("price_asc");
  const [selectedOutboundId, setSelectedOutboundId] = useState(null);
  const [selectedInboundId, setSelectedInboundId] = useState(null);

  const timeFilterLabel = { all: "全部时段", night: "凌晨", morning: "上午", afternoon: "下午", evening: "晚上" };
  const priceFilterLabel = { all: "全部价格", lt500: "500以下", "500_800": "500-800", gt800: "800以上" };
  const sortLabel = {
    price_asc: "价格低到高",
    price_desc: "价格高到低",
    dep_asc: "出发时间早到晚",
    dep_desc: "出发时间晚到早",
  };

  const MenuButton = ({ label, valueLabel, items, onPick }) => (
    <details className="group relative">
      <summary className="flex h-8 cursor-pointer list-none items-center gap-1 rounded-md border border-border/80 bg-background px-2.5 text-xs text-foreground transition-colors hover:bg-muted/40">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{valueLabel}</span>
        <span className="ml-0.5 text-[10px] text-muted-foreground">▾</span>
      </summary>
      <div className="absolute left-0 top-[calc(100%+0.35rem)] z-20 min-w-[11rem] rounded-md border border-border/80 bg-card p-1 shadow-lg">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onPick(item.id);
              const details = document.activeElement?.closest("details");
              if (details) details.removeAttribute("open");
            }}
            className={cn(
              "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs transition-colors",
              item.active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )}
          >
            <span>{item.label}</span>
            {item.active ? <span className="text-[10px]">✓</span> : null}
          </button>
        ))}
      </div>
    </details>
  );

  const goFiltered = useMemo(() => {
    const list = [...(outboundFlights ?? [])];
    const filtered = list.filter((f) => {
      if (!inTimeSlot(depHourOf(f.depTime), goTimeFilter)) return false;
      if (goStopFilter === "direct" && f.stops !== 0) return false;
      if (goStopFilter === "connect" && f.stops === 0) return false;
      const p = Number(f.price_cny || 0);
      if (goPriceFilter === "lt500" && !(p < 500)) return false;
      if (goPriceFilter === "500_800" && !(p >= 500 && p <= 800)) return false;
      if (goPriceFilter === "gt800" && !(p > 800)) return false;
      return true;
    });
    filtered.sort((a, b) => {
      if (goSort === "dep_asc") return depMinOf(a.depTime) - depMinOf(b.depTime);
      if (goSort === "dep_desc") return depMinOf(b.depTime) - depMinOf(a.depTime);
      if (goSort === "price_desc") return Number(b.price_cny || 0) - Number(a.price_cny || 0);
      return Number(a.price_cny || 0) - Number(b.price_cny || 0);
    });
    return filtered;
  }, [outboundFlights, goTimeFilter, goStopFilter, goPriceFilter, goSort]);

  const backFiltered = useMemo(() => {
    const list = [...(inboundFlights ?? [])];
    const filtered = list.filter((f) => {
      if (!inTimeSlot(depHourOf(f.depTime), backTimeFilter)) return false;
      if (backStopFilter === "direct" && f.stops !== 0) return false;
      if (backStopFilter === "connect" && f.stops === 0) return false;
      const p = Number(f.price_cny || 0);
      if (backPriceFilter === "lt500" && !(p < 500)) return false;
      if (backPriceFilter === "500_800" && !(p >= 500 && p <= 800)) return false;
      if (backPriceFilter === "gt800" && !(p > 800)) return false;
      return true;
    });
    filtered.sort((a, b) => {
      if (backSort === "dep_asc") return depMinOf(a.depTime) - depMinOf(b.depTime);
      if (backSort === "dep_desc") return depMinOf(b.depTime) - depMinOf(a.depTime);
      if (backSort === "price_desc") return Number(b.price_cny || 0) - Number(a.price_cny || 0);
      return Number(a.price_cny || 0) - Number(b.price_cny || 0);
    });
    return filtered;
  }, [inboundFlights, backTimeFilter, backStopFilter, backPriceFilter, backSort]);

  const selectedOutbound = useMemo(
    () => goFiltered.find((f) => f.id === selectedOutboundId) ?? goFiltered[0] ?? null,
    [goFiltered, selectedOutboundId]
  );
  const selectedInbound = useMemo(
    () => backFiltered.find((f) => f.id === selectedInboundId) ?? backFiltered[0] ?? null,
    [backFiltered, selectedInboundId]
  );

  const totalPrice = useMemo(() => {
    if (!selectedOutbound || !selectedInbound) return null;
    const base = Number(selectedOutbound.price_cny || 0) + Number(selectedInbound.price_cny || 0);
    const discount = selectedOutbound.airline === selectedInbound.airline ? 0.97 : 1;
    return Math.max(1, Math.round(base * discount));
  }, [selectedOutbound, selectedInbound]);

  const stopComboLabel = useMemo(() => {
    if (!selectedOutbound || !selectedInbound) return "—";
    const o = selectedOutbound.stops === 0 ? "直飞" : "中转";
    const r = selectedInbound.stops === 0 ? "直飞" : "中转";
    return `${o} + ${r}`;
  }, [selectedOutbound, selectedInbound]);

  const resetGo = () => {
    setGoTimeFilter("all");
    setGoStopFilter("all");
    setGoPriceFilter("all");
    setGoSort("price_asc");
  };
  const resetBack = () => {
    setBackTimeFilter("all");
    setBackStopFilter("all");
    setBackPriceFilter("all");
    setBackSort("price_asc");
  };

  return (
    <Card>
      <CardHeader className={cn("flex flex-row flex-wrap items-center justify-between gap-2 pb-2", PANEL_PX)}>
        <CardTitle className="text-base">往返自由组合</CardTitle>
        <span className="text-xs text-muted-foreground">左选去程，右选返程，可任意顺序组合</span>
      </CardHeader>
      <CardContent className="p-0 pb-6">
        <div className={cn("grid gap-4 lg:grid-cols-2", PANEL_PX)}>
          <div className="rounded-lg border border-border/70 bg-muted/10">
            <div className="border-b border-border/60 px-3 py-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">去程航班</p>
                <p className="text-[11px] text-muted-foreground">共 {goFiltered.length} 条</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: "全部" },
                  { id: "direct", label: "仅直飞" },
                  { id: "connect", label: "仅中转" },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setGoStopFilter(o.id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-colors",
                      goStopFilter === o.id
                        ? "border-foreground/35 bg-muted/70 text-foreground"
                        : "border-border/80 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <MenuButton
                  label="时段"
                  valueLabel={timeFilterLabel[goTimeFilter]}
                  onPick={setGoTimeFilter}
                  items={[
                    { id: "all", label: "全部", active: goTimeFilter === "all" },
                    { id: "night", label: "凌晨", active: goTimeFilter === "night" },
                    { id: "morning", label: "上午", active: goTimeFilter === "morning" },
                    { id: "afternoon", label: "下午", active: goTimeFilter === "afternoon" },
                    { id: "evening", label: "晚上", active: goTimeFilter === "evening" },
                  ]}
                />
                <MenuButton
                  label="价格"
                  valueLabel={priceFilterLabel[goPriceFilter]}
                  onPick={setGoPriceFilter}
                  items={[
                    { id: "all", label: "全部", active: goPriceFilter === "all" },
                    { id: "lt500", label: "500以下", active: goPriceFilter === "lt500" },
                    { id: "500_800", label: "500-800", active: goPriceFilter === "500_800" },
                    { id: "gt800", label: "800以上", active: goPriceFilter === "gt800" },
                  ]}
                />
                <div className="ml-auto">
                  <MenuButton
                    label="排序"
                    valueLabel={sortLabel[goSort]}
                    onPick={setGoSort}
                    items={[
                      { id: "price_asc", label: "价格低到高", active: goSort === "price_asc" },
                      { id: "price_desc", label: "价格高到低", active: goSort === "price_desc" },
                      { id: "dep_asc", label: "出发时间早到晚", active: goSort === "dep_asc" },
                      { id: "dep_desc", label: "出发时间晚到早", active: goSort === "dep_desc" },
                    ]}
                  />
                </div>
              </div>
              <button type="button" onClick={resetGo} className="mt-1 text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground">
                重置去程筛选
              </button>
            </div>
            <div className="max-h-[26rem] space-y-2 overflow-y-auto p-3">
              {goFiltered.map((f) => (
                <SideFlightCard
                  key={f.id}
                  title="去程"
                  flight={f}
                  selected={selectedOutbound?.id === f.id}
                  onSelect={(flight) => setSelectedOutboundId(flight.id)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-muted/10">
            <div className="border-b border-border/60 px-3 py-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">返程航班</p>
                <p className="text-[11px] text-muted-foreground">共 {backFiltered.length} 条</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: "全部" },
                  { id: "direct", label: "仅直飞" },
                  { id: "connect", label: "仅中转" },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setBackStopFilter(o.id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-colors",
                      backStopFilter === o.id
                        ? "border-foreground/35 bg-muted/70 text-foreground"
                        : "border-border/80 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <MenuButton
                  label="时段"
                  valueLabel={timeFilterLabel[backTimeFilter]}
                  onPick={setBackTimeFilter}
                  items={[
                    { id: "all", label: "全部", active: backTimeFilter === "all" },
                    { id: "night", label: "凌晨", active: backTimeFilter === "night" },
                    { id: "morning", label: "上午", active: backTimeFilter === "morning" },
                    { id: "afternoon", label: "下午", active: backTimeFilter === "afternoon" },
                    { id: "evening", label: "晚上", active: backTimeFilter === "evening" },
                  ]}
                />
                <MenuButton
                  label="价格"
                  valueLabel={priceFilterLabel[backPriceFilter]}
                  onPick={setBackPriceFilter}
                  items={[
                    { id: "all", label: "全部", active: backPriceFilter === "all" },
                    { id: "lt500", label: "500以下", active: backPriceFilter === "lt500" },
                    { id: "500_800", label: "500-800", active: backPriceFilter === "500_800" },
                    { id: "gt800", label: "800以上", active: backPriceFilter === "gt800" },
                  ]}
                />
                <div className="ml-auto">
                  <MenuButton
                    label="排序"
                    valueLabel={sortLabel[backSort]}
                    onPick={setBackSort}
                    items={[
                      { id: "price_asc", label: "价格低到高", active: backSort === "price_asc" },
                      { id: "price_desc", label: "价格高到低", active: backSort === "price_desc" },
                      { id: "dep_asc", label: "出发时间早到晚", active: backSort === "dep_asc" },
                      { id: "dep_desc", label: "出发时间晚到早", active: backSort === "dep_desc" },
                    ]}
                  />
                </div>
              </div>
              <button type="button" onClick={resetBack} className="mt-1 text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground">
                重置返程筛选
              </button>
            </div>
            <div className="max-h-[26rem] space-y-2 overflow-y-auto p-3">
              {backFiltered.map((f) => (
                <SideFlightCard
                  key={f.id}
                  title="返程"
                  flight={f}
                  selected={selectedInbound?.id === f.id}
                  onSelect={(flight) => setSelectedInboundId(flight.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={cn("sticky bottom-3 mt-4", PANEL_PX)}>
          <div className="rounded-lg border border-border/80 bg-card/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/90">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1 text-sm">
                <p className="text-xs text-muted-foreground">
                  已选组合：{selectedOutbound ? `${selectedOutbound.depTime} ${selectedOutbound.airlineName}` : "未选去程"}
                  {"  ·  "}
                  {selectedInbound ? `${selectedInbound.depTime} ${selectedInbound.airlineName}` : "未选返程"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">经停组合：{stopComboLabel}</p>
              </div>
              <p className="text-2xl font-bold tabular-nums">{totalPrice != null ? `¥${totalPrice}` : "—"}</p>
              {selectedOutbound && selectedInbound ? (
                <Button size="sm" asChild>
                  <BookNowLink flight={selectedOutbound}>立即预订</BookNowLink>
                </Button>
              ) : (
                <Button size="sm" disabled>
                  立即预订
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { buildRoundTripCombos };
