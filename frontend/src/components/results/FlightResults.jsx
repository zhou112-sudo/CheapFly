import React, { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { localizeRouteLabel } from "@/data/locations";
import { usePrefersFineHover } from "@/hooks/usePrefersFineHover";
import { cn } from "@/lib/utils";

import { BookNowLink } from "./BookNowLink";
import { FlightDetailDialogTrigger } from "./FlightDetailDialog";
import { FlightPreviewContent } from "./FlightPreviewContent";
import { FlightRowHoverCard } from "./FlightHoverOrDialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const COLLAPSE_AFTER = 4;
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

function flightsAtPrice(flights, price, filterFn) {
  const list = flights ?? [];
  const hits = list.filter(
    (f) => f != null && Number(f.price_cny) === Number(price) && (!filterFn || filterFn(f))
  );
  const sources = [...new Set(hits.flatMap((f) => (Array.isArray(f?.platforms) && f.platforms.length ? f.platforms.map((p) => sourceLabel(p)) : [sourceLabel(f?.source)])))];
  return sources.length ? sources : ["官网"];
}

function PlatformTags({ labels, compact = false }) {
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

function SecondaryLowestCard({ title, price, flight, labels }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
          <PlatformTags labels={labels} compact />
        </div>
        <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground">{price != null ? `¥${price}` : "—"}</p>
      </CardHeader>
      <CardContent className="flex min-h-[4.75rem] flex-col pt-0">
        {flight ? (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
              <p className="font-medium text-foreground">
                {flight.airlineName} {flight.flightNumber}
              </p>
              <p className="tabular-nums text-foreground/90">
                {flight.depTime}
                <span className="mx-1 text-muted-foreground">→</span>
                {flight.arrTime}
              </p>
            </div>
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{localizeRouteLabel(flight.route_label)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{flight.stops === 0 ? "直飞" : `${flight.stops} 次经停`}</p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">暂无</p>
        )}
        {flight ? (
          <div className="mt-2 flex items-center justify-end gap-2">
            <HoverCard openDelay={INFO_OPEN_DELAY} closeDelay={INFO_CLOSE_DELAY}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="px-1 text-xs text-muted-foreground underline decoration-muted-foreground/60 underline-offset-2 hover:text-foreground/80"
                  aria-label="查看详细信息"
                >
                  详细信息
                </button>
              </HoverCardTrigger>
              <HoverCardContent
                side="left"
                align="end"
                className="w-[min(calc(100vw-2rem),22rem)] p-0 shadow-xl"
                collisionPadding={16}
              >
                <FlightPreviewContent flight={flight} />
              </HoverCardContent>
            </HoverCard>
            <Button size="sm" className="h-7 px-3 text-xs" asChild>
              <BookNowLink flight={flight}>立即预订</BookNowLink>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function FlightSummaryRow({ flights, lowestDirect, lowestConnecting }) {
  const list = flights ?? [];
  const d = lowestDirect;
  const c = lowestConnecting;
  const liDirect = d ? flightsAtPrice(list, d.price_cny, (p) => p.stops === 0) : [];
  const liConn = c ? flightsAtPrice(list, c.price_cny, (p) => p.stops > 0) : [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
      <SecondaryLowestCard title="直飞最低" price={d?.price_cny} flight={d} labels={liDirect} />
      <SecondaryLowestCard title="中转最低" price={c?.price_cny} flight={c} labels={liConn} />
    </div>
  );
}

const TableRowInner = React.forwardRef(function TableRowInner({ m, lowestDirect, fineHover }, ref) {
  const highlight = lowestDirect && Number(m.price_cny) === Number(lowestDirect.price_cny) && m.stops === 0;
  return (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border/60 transition-colors",
        highlight && "bg-muted/40",
        fineHover && "cursor-default hover:bg-muted/30"
      )}
    >
      <td className="px-2 py-3 align-top">
        <p className="font-semibold text-foreground">{m.airlineName}</p>
        <p className="text-xs text-muted-foreground">航班号 {m.flightNumber}</p>
      </td>
      <td className="px-2 py-3 align-top text-muted-foreground">
        <p className="tabular-nums text-foreground">
          <span className="text-base font-semibold">{m.depTime}</span>
          <span className="mx-1">→</span>
          <span className="text-base font-semibold">{m.arrTime}</span>
        </p>
        <p className="mt-1 text-xs font-medium text-foreground/90">{localizeRouteLabel(m.route_label)}</p>
      </td>
      <td className="px-2 py-3 align-top text-muted-foreground">{m.stops === 0 ? "直飞" : `${m.stops} 次`}</td>
      <td className="px-2 py-3 align-top text-right font-semibold tabular-nums text-foreground">
        {"\u00A5"}
        {m.price_cny}
      </td>
      <td className="px-2 py-3 align-top text-right">
        <div className="flex items-center justify-end gap-2">
          {!fineHover ? <FlightDetailDialogTrigger flight={m} /> : null}
          <HoverCard openDelay={INFO_OPEN_DELAY} closeDelay={INFO_CLOSE_DELAY}>
            <HoverCardTrigger asChild>
              <button
                type="button"
                className="px-1 text-xs text-muted-foreground underline decoration-muted-foreground/60 underline-offset-2 hover:text-foreground/80"
                aria-label="查看详细信息"
              >
                详细信息
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              side="left"
              align="end"
              className="w-[min(calc(100vw-2rem),22rem)] p-0 shadow-xl"
              collisionPadding={16}
            >
              <FlightPreviewContent flight={m} />
            </HoverCardContent>
          </HoverCard>
          <Button variant="outline" size="sm" asChild>
            <BookNowLink flight={m}>立即预订</BookNowLink>
          </Button>
        </div>
      </td>
    </tr>
  );
});
TableRowInner.displayName = "TableRowInner";

export function FlightListTable({ flights, lowestDirect }) {
  const rows = flights ?? [];
  const fineHover = usePrefersFineHover();
  const [expanded, setExpanded] = useState(false);
  const [stopFilter, setStopFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("price_asc");

  if (!rows.length) {
    return <p className="text-sm text-muted-foreground">当前时间范围内暂无可预订航班。</p>;
  }
  const timeFilterLabel = { all: "全部时段", night: "凌晨", morning: "上午", afternoon: "下午", evening: "晚上" };
  const priceFilterLabel = { all: "全部价格", lt500: "500以下", "500_800": "500-800", gt800: "800以上" };
  const sortLabel = {
    price_asc: "价格低到高",
    price_desc: "价格高到低",
    dep_asc: "出发时间早到晚",
    dep_desc: "出发时间晚到早",
    dur_asc: "总时长短到长",
  };

  const depHourOf = (depTime) => {
    const m = String(depTime ?? "").match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return Number(m[1]);
  };

  const durationMinutesOf = (flight) => {
    const dm = String(flight?.durationLabel ?? "").match(/(\d+)\s*小时\s*(\d+)\s*分/);
    if (dm) return Number(dm[1]) * 60 + Number(dm[2]);
    const sm = String(flight?.durationLabel ?? "").match(/(\d+)\s*分/);
    if (sm) return Number(sm[1]);
    const [dh, dm2] = String(flight?.depTime ?? "0:0").split(":").map((x) => Number(x) || 0);
    const [ah, am] = String(flight?.arrTime ?? "0:0").split(":").map((x) => Number(x) || 0);
    let dep = dh * 60 + dm2;
    let arr = ah * 60 + am;
    if (arr < dep) arr += 24 * 60;
    return Math.max(0, arr - dep);
  };

  const depMinutesOf = (depTime) => {
    const m = String(depTime ?? "").match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return 0;
    return Number(m[1]) * 60 + Number(m[2]);
  };

  const filteredRows = rows.filter((r) => {
    if (stopFilter === "direct" && r.stops !== 0) return false;
    if (stopFilter === "stop1" && r.stops !== 1) return false;
    if (stopFilter === "stop2plus" && Number(r.stops || 0) < 2) return false;

    const h = depHourOf(r.depTime);
    if (timeFilter === "night" && !(h != null && h >= 0 && h < 6)) return false;
    if (timeFilter === "morning" && !(h != null && h >= 6 && h < 12)) return false;
    if (timeFilter === "afternoon" && !(h != null && h >= 12 && h < 18)) return false;
    if (timeFilter === "evening" && !(h != null && h >= 18 && h < 24)) return false;

    const p = Number(r.price_cny || 0);
    if (priceFilter === "lt500" && !(p < 500)) return false;
    if (priceFilter === "500_800" && !(p >= 500 && p <= 800)) return false;
    if (priceFilter === "gt800" && !(p > 800)) return false;

    return true;
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (sortBy === "price_desc") return Number(b.price_cny || 0) - Number(a.price_cny || 0);
    if (sortBy === "dep_asc") return depMinutesOf(a.depTime) - depMinutesOf(b.depTime);
    if (sortBy === "dep_desc") return depMinutesOf(b.depTime) - depMinutesOf(a.depTime);
    if (sortBy === "dur_asc") return durationMinutesOf(a) - durationMinutesOf(b);
    return Number(a.price_cny || 0) - Number(b.price_cny || 0);
  });

  const hiddenCount = Math.max(0, sortedRows.length - COLLAPSE_AFTER);
  const visibleRows = expanded || hiddenCount === 0 ? sortedRows : sortedRows.slice(0, COLLAPSE_AFTER);

  const resetFilters = () => {
    setStopFilter("all");
    setTimeFilter("all");
    setPriceFilter("all");
    setSortBy("price_asc");
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
              setExpanded(false);
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

  return (
    <Card>
      <CardHeader className={cn("flex flex-row flex-wrap items-center justify-between gap-2 pb-2", PANEL_PX)}>
        <CardTitle className="text-base">全部行程</CardTitle>
        <span className="text-xs text-muted-foreground">悬停“详细信息”可查看详情（桌面端）</span>
      </CardHeader>
      <CardContent className="p-0 pb-6">
        <div className={cn("mb-3 flex flex-col gap-2.5", PANEL_PX)}>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "全部" },
              { id: "direct", label: "仅直飞" },
              { id: "stop1", label: "1次经停" },
              { id: "stop2plus", label: "2次及以上" },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setStopFilter(o.id);
                  setExpanded(false);
                }}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  stopFilter === o.id
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
              valueLabel={timeFilterLabel[timeFilter]}
              onPick={setTimeFilter}
              items={[
                { id: "all", label: "全部", active: timeFilter === "all" },
                { id: "night", label: "凌晨", active: timeFilter === "night" },
                { id: "morning", label: "上午", active: timeFilter === "morning" },
                { id: "afternoon", label: "下午", active: timeFilter === "afternoon" },
                { id: "evening", label: "晚上", active: timeFilter === "evening" },
              ]}
            />
            <MenuButton
              label="价格"
              valueLabel={priceFilterLabel[priceFilter]}
              onPick={setPriceFilter}
              items={[
                { id: "all", label: "全部", active: priceFilter === "all" },
                { id: "lt500", label: "500以下", active: priceFilter === "lt500" },
                { id: "500_800", label: "500-800", active: priceFilter === "500_800" },
                { id: "gt800", label: "800以上", active: priceFilter === "gt800" },
              ]}
            />
            <div className="ml-auto">
              <MenuButton
                label="排序"
                valueLabel={sortLabel[sortBy]}
                onPick={setSortBy}
                items={[
                  { id: "price_asc", label: "价格低到高", active: sortBy === "price_asc" },
                  { id: "price_desc", label: "价格高到低", active: sortBy === "price_desc" },
                  { id: "dep_asc", label: "出发时间早到晚", active: sortBy === "dep_asc" },
                  { id: "dep_desc", label: "出发时间晚到早", active: sortBy === "dep_desc" },
                  { id: "dur_asc", label: "总时长短到长", active: sortBy === "dur_asc" },
                ]}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetFilters();
                setExpanded(false);
              }}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              重置筛选
            </button>
            <p className="ml-auto text-[11px] text-muted-foreground">共 {sortedRows.length} 条结果</p>
          </div>
        </div>
        {sortedRows.length === 0 ? (
          <div className={cn("rounded-md border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground", PANEL_PX)}>
            当前筛选条件下暂无行程，可尝试放宽筛选条件。
          </div>
        ) : null}
        <div className={cn("overflow-x-auto", PANEL_PX, sortedRows.length === 0 && "hidden")}>
          <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2">航班</th>
              <th className="px-3 py-2">时间 · 航线</th>
              <th className="px-3 py-2">经停</th>
              <th className="px-3 py-2 text-right">价格</th>
              <th className="px-3 py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((m) =>
              fineHover ? (
                <FlightRowHoverCard key={m.id} flight={m}>
                  <TableRowInner m={m} lowestDirect={lowestDirect} fineHover />
                </FlightRowHoverCard>
              ) : (
                <Fragment key={m.id}>
                  <TableRowInner m={m} lowestDirect={lowestDirect} fineHover={false} />
                </Fragment>
              )
            )}
          </tbody>
          </table>
        </div>
        {hiddenCount > 0 ? (
          <div className={cn("border-t border-border/60 py-3 text-center", PANEL_PX)}>
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => setExpanded((e) => !e)}>
              <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
              {expanded ? "收起列表" : `展开其余 ${hiddenCount} 条`}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
