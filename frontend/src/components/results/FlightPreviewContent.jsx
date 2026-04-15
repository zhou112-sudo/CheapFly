import { airportDisplay, localizeRouteLabel } from "@/data/locations";
import { cn } from "@/lib/utils";

function SectionTitle({ children }) {
  return <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</p>;
}

export function FlightPreviewContent({ flight, className }) {
  if (!flight) return null;
  const p = flight.preview || {};
  const duration = p.durationLabel ?? flight.durationLabel ?? "—";
  const legs = p.legs ?? flight.legs ?? [];
  const codes = String(flight.route_label ?? "")
    .split("→")
    .map((s) => s.trim())
    .filter(Boolean);
  const hubCode = codes.length >= 3 ? codes[1] : "";
  const baggage = flight.baggageIncluded ?? p.baggageIncluded;
  const refund = flight.refundLabel ?? p.refundLabel ?? "以航司规则为准";
  const change = flight.changeLabel ?? p.changeLabel ?? "有条件改签";

  return (
    <div className={cn("max-h-[min(70vh,420px)] overflow-y-auto text-sm", className)}>
      <div className="border-b border-border/60 px-4 py-3">
        <SectionTitle>航空公司</SectionTitle>
        <p className="mt-1 font-semibold text-foreground">{flight.airlineName}</p>
        <p className="text-xs text-muted-foreground">航班号 {flight.flightNumber}</p>
      </div>
      <div className="border-b border-border/60 px-4 py-3">
        <SectionTitle>时间与航线</SectionTitle>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums">
          <span className="text-base font-semibold">{flight.depTime}</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-base font-semibold">{flight.arrTime}</span>
          <span className="text-xs text-muted-foreground">（{duration}）</span>
        </div>
        <p className="mt-1 text-xs font-medium text-foreground/90">{localizeRouteLabel(flight.route_label)}</p>
      </div>
      <div className="border-b border-border/60 px-4 py-3">
        <SectionTitle>机场</SectionTitle>
        <dl className="mt-2 space-y-1.5 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">出发</dt>
            <dd className="text-right font-medium">{airportDisplay(flight.origin)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">到达</dt>
            <dd className="text-right font-medium">{airportDisplay(flight.destination)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-dashed border-border/50 pt-2">
            <dt className="text-muted-foreground">航站楼 / 登机口</dt>
            <dd className="text-right text-xs">
              {p.originTerminal ?? flight.originTerminal ?? "—"} · {p.originGate ?? flight.originGate ?? "—"} →{" "}
              {p.destTerminal ?? flight.destTerminal ?? "—"} · {p.destGate ?? flight.destGate ?? "—"}
            </dd>
          </div>
        </dl>
      </div>
      {legs.length > 0 ? (
        <div className="border-b border-border/60 px-4 py-3">
          <SectionTitle>中转与分段</SectionTitle>
          <ul className="mt-2 space-y-2 text-xs">
            {legs.map((leg, i) =>
              leg.layoverCity || leg.layoverDuration ? (
                <li key={`lay-${i}`} className="rounded-md bg-muted/50 px-2 py-1.5 text-muted-foreground">
                  经停 {hubCode ? airportDisplay(hubCode) : leg.layoverCity}
                  {leg.layoverDuration ? ` · 停留约 ${leg.layoverDuration}` : ""}
                </li>
              ) : (
                <li key={`seg-${i}`} className="rounded-md border border-border/50 px-2 py-1.5">
                  <span className="font-medium text-foreground">
                    {airportDisplay(leg.from)} → {airportDisplay(leg.to)}
                  </span>
                  <span className="mt-0.5 block tabular-nums text-muted-foreground">
                    {leg.depTime} — {leg.arrTime} · {leg.flightNo}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>
      ) : flight.stops > 0 ? (
        <div className="border-b border-border/60 px-4 py-3 text-xs text-muted-foreground">中转行程，详情以航司为准。</div>
      ) : null}
      <div className="px-4 py-3">
        <SectionTitle>票价与规则</SectionTitle>
        <ul className="mt-2 space-y-1.5 text-xs">
          <li className="flex justify-between gap-3">
            <span className="text-muted-foreground">托运行李</span>
            <span>{baggage ? "含 1 件（示例）" : "不含（示例）"}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span className="text-muted-foreground">退票</span>
            <span className="text-right">{refund}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span className="text-muted-foreground">改签</span>
            <span className="text-right">{change}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
