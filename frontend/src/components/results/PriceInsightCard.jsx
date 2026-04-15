import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { PriceInsightCharts } from "./PriceInsightCharts";

export function PriceInsightCard({ insight }) {
  if (!insight) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <div>
          <CardTitle className="text-base">价格参考</CardTitle>
          <CardDescription>行情与预测为示意，预订以实际为准</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-muted/25 px-4 py-3">
            <p className="text-xs text-muted-foreground">当前最低</p>
            <p className="text-lg font-semibold tabular-nums">¥{insight.current_price_cny}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/25 px-4 py-3">
            <p className="text-xs text-muted-foreground">近期均价</p>
            <p className="text-lg font-semibold tabular-nums">¥{insight.average_price_cny}</p>
          </div>
          {insight.historical_low_cny != null ? (
            <div className="rounded-lg border border-border/70 bg-muted/25 px-4 py-3">
              <p className="text-xs text-muted-foreground">历史低价（示意）</p>
              <p className="text-lg font-semibold tabular-nums">¥{insight.historical_low_cny}</p>
            </div>
          ) : null}
        </div>
        <PriceInsightCharts insight={insight} />
        <p className="rounded-lg border border-border/70 bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground">
          {insight.recommendation}
        </p>
      </CardContent>
    </Card>
  );
}
