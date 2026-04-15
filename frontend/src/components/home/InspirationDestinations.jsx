import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INSPIRATION_DESTINATIONS } from "@/data/homeMock";
import { cn } from "@/lib/utils";

/**
 * @param {"default" | "explore" | "compact"} variant
 * compact：仅用于机票搜索页底部，轻量热门目的地，不与「发现」页混排
 */
export function InspirationDestinations({ onPickDestination, variant = "default" }) {
  const isExplore = variant === "explore";
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <section>
        <div className="mb-5 flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">热门目的地</h2>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">点选仅填入到达地</p>
          </div>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-card ring-1 ring-black/[0.03] dark:ring-white/[0.06] md:p-6">
          <div className="flex flex-wrap gap-3">
            {INSPIRATION_DESTINATIONS.map((r) => (
              <Button
                key={r.id}
                variant="outline"
                type="button"
                size="sm"
                className="h-auto rounded-full border-border/80 bg-background px-3 py-2 text-left text-sm shadow-sm"
                onClick={() => onPickDestination(r.destId)}
              >
                <span className="font-medium">{r.label}</span>
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">{r.hint}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("mt-14", isExplore && "mt-0")}>
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">热门目的地</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {isExplore ? "选定后返回搜索页，补全出发地与日期。" : "点选后仅填入到达地，出发地与日期在上方选择。"}
        </p>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold md:text-lg">
            <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden />
            精选城市
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {INSPIRATION_DESTINATIONS.map((r) => (
              <Button
                key={r.id}
                variant="outline"
                type="button"
                className={cn(
                  "h-auto flex-col items-start gap-0.5 rounded-lg border-border/80 px-4 py-3 text-left shadow-sm transition-shadow hover:shadow-card-hover",
                  isExplore && "min-w-[140px] md:min-w-[160px]"
                )}
                onClick={() => onPickDestination(r.destId)}
              >
                <span className="text-base font-semibold">{r.label}</span>
                <span className="text-xs font-normal text-muted-foreground">{r.hint}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
