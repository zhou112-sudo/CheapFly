import { Route } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BookNowLink } from "./BookNowLink";

export function CheapConnectionsSection({ items, lowestDirect }) {
  if (!items?.length) return null;
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Route className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h2 className="text-base font-semibold tracking-tight text-foreground">实惠中转</h2>
        <span className="text-xs text-muted-foreground">相较直飞更省，适合时间灵活的行程</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {items.map(({ flight, save_vs_direct_cny, summary }) => (
          <Card key={flight.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">中转推荐</CardTitle>
              <p className="text-lg font-bold tabular-nums">
                {"\u00A5"}
                {flight.price_cny}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  省 {"\u00A5"}
                  {save_vs_direct_cny}
                  {lowestDirect ? "（较直飞）" : ""}
                </span>
              </p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-xs leading-snug text-muted-foreground">{summary}</p>
              <p className="text-xs text-muted-foreground">
                {flight.airlineName} · {flight.depTime}–{flight.arrTime}
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <BookNowLink flight={flight}>立即预订</BookNowLink>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
