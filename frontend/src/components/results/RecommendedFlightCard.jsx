import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { localizeRouteLabel } from "@/data/locations";

import { BookNowLink } from "./BookNowLink";
import { FlightPreviewContent } from "./FlightPreviewContent";

const INFO_OPEN_DELAY = 280;
const INFO_CLOSE_DELAY = 200;

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

function platformLabelsForRecommended(flight, flights) {
  if (!flight) return [];
  const normalizePlatforms = (f) => {
    const list = Array.isArray(f?.platforms) ? f.platforms.map((x) => sourceLabel(x)).filter(Boolean) : [];
    if (list.length) return [...new Set(list)];
    return [sourceLabel(f?.source)];
  };
  const all = flights ?? [];
  const samePriceSources = [...new Set(all.filter((x) => Number(x?.price_cny) === Number(flight.price_cny)).flatMap((x) => normalizePlatforms(x)))];
  if (samePriceSources.length > 1) return samePriceSources;
  return normalizePlatforms(flight);
}

function PlatformTags({ labels }) {
  if (!labels?.length) return null;
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {labels.map((l) => (
        <span
          key={l}
          className="rounded-full border border-violet-300/55 bg-violet-100/55 px-2 py-0.5 text-xs text-violet-800 dark:border-violet-400/35 dark:bg-violet-500/15 dark:text-violet-200"
        >
          {l}
        </span>
      ))}
    </div>
  );
}

export function RecommendedFlightCard({ recommended, flights }) {
  if (!recommended?.flight) return null;
  const f = recommended.flight;
  const labels = platformLabelsForRecommended(f, flights);
  return (
    <Card className="border-border/80 bg-gradient-to-br from-muted/30 via-card to-card">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-muted/50 text-foreground shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-lg md:text-xl">全网最低价</CardTitle>
              <CardDescription className="mt-1 max-w-2xl leading-relaxed">
                当前查询结果中的最低价格，性价比最高，建议尽快预订。
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <PlatformTags labels={labels} />
            <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-foreground md:mt-2.5 md:text-5xl">
              {"\u00A5"}
              {f.price_cny}
            </p>
            <HoverCard openDelay={INFO_OPEN_DELAY} closeDelay={INFO_CLOSE_DELAY}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="mt-2 px-1 text-xs text-muted-foreground underline decoration-muted-foreground/60 underline-offset-2 hover:text-foreground/80"
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
                <FlightPreviewContent flight={f} />
              </HoverCardContent>
            </HoverCard>
            <Button asChild className="mt-3" size="sm">
              <BookNowLink flight={f}>立即预订</BookNowLink>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t border-border/50 pt-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <p className="font-semibold text-foreground">
              {f.airlineName} {f.flightNumber}
            </p>
            <p className="text-xs text-muted-foreground">{f.stops === 0 ? "直飞" : `${f.stops} 次经停`}</p>
          </div>
          <div className="tabular-nums">
            <span className="font-semibold text-foreground">{f.depTime}</span>
            <span className="mx-1 text-muted-foreground">→</span>
            <span className="font-semibold text-foreground">{f.arrTime}</span>
          </div>
          <p className="text-sm text-muted-foreground">{localizeRouteLabel(f.route_label)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
