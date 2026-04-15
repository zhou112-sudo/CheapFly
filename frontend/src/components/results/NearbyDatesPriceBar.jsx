import { cn } from "@/lib/utils";

/**
 * @typedef {{ ymd: string; label: string; price: number | null; loading?: boolean }} NearbyDateItem
 */

/**
 * @param {{
 *   items: NearbyDateItem[];
 *   selectedYmd: string;
 *   onSelect: (ymd: string) => void;
 *   hint?: string | null;
 *   disabled?: boolean;
 *   title?: string;
 * }} props
 */
export function NearbyDatesPriceBar({ items, selectedYmd, onSelect, hint, disabled, title = "相邻日期最低价" }) {
  const validPrices = items.map((x) => x.price).filter((p) => Number.isFinite(p));
  const minPrice = validPrices.length ? Math.min(...validPrices) : null;
  const maxPrice = validPrices.length ? Math.max(...validPrices) : null;
  const avgPrice = validPrices.length ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length : null;
  const spread = minPrice != null && maxPrice != null ? maxPrice - minPrice : 0;
  const tinySpread = avgPrice != null ? spread <= Math.max(20, avgPrice * 0.06) : true;
  const minCount = minPrice == null ? 0 : validPrices.filter((p) => p === minPrice).length;
  const edgeBand = Math.max(8, spread * 0.15);

  const levelOfPrice = (price) => {
    if (!Number.isFinite(price) || minPrice == null || maxPrice == null || avgPrice == null) return "normal";
    if (tinySpread) return "normal";
    if (minCount === 1 && price === minPrice) return "low";
    if (minCount === 1) {
      const highByAvg = price >= avgPrice * 1.08;
      const nearMax = price >= maxPrice - edgeBand && price >= avgPrice * 1.02;
      return highByAvg || nearMax ? "high" : "normal";
    }
    const lowByAvg = price <= avgPrice * 0.92;
    const nearMin = price <= minPrice + edgeBand && price <= avgPrice * 0.98;
    if (lowByAvg || nearMin) return "low";
    const highByAvg = price >= avgPrice * 1.08;
    const nearMax = price >= maxPrice - edgeBand && price >= avgPrice * 1.02;
    if (highByAvg || nearMax) return "high";
    return "normal";
  };

  return (
    <section className="mb-8 rounded-lg border border-border/60 bg-muted/10 p-3 md:p-4" aria-label="相邻日期最低价参考">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-medium text-foreground md:text-sm">{title}</h2>
        <p className="text-[10px] text-muted-foreground md:text-xs">与下方列表同一过滤规则下的可订最低价</p>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
        {items.map(({ ymd, label, price, loading }) => {
          const selected = ymd === selectedYmd;
          const level = levelOfPrice(price);
          return (
            <button
              key={ymd}
              type="button"
              disabled={Boolean(disabled) || Boolean(loading)}
              aria-pressed={selected}
              onClick={() => onSelect(ymd)}
              className={cn(
                "relative flex min-w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-md border px-2.5 py-2 text-center transition-colors",
                selected
                  ? "border-foreground/45 bg-background text-foreground shadow-sm ring-1 ring-foreground/10"
                  : "border-border/80 bg-background/60 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground",
                disabled && "opacity-60",
              )}
            >
              <span className="text-[11px] leading-tight md:text-xs">{label}</span>
              <span
                className={cn(
                  "mt-1 text-sm font-semibold tabular-nums",
                  level === "low" && "text-[hsl(145_42%_35%)]",
                  level === "high" && "text-[hsl(7_48%_46%)]",
                  level === "normal" && "text-foreground",
                )}
              >
                {loading ? "…" : price != null ? `¥${price}` : "—"}
              </span>
            </button>
          );
        })}
      </div>
      {hint ? <p className="mt-2 text-xs leading-snug text-muted-foreground">{hint}</p> : null}
    </section>
  );
}
