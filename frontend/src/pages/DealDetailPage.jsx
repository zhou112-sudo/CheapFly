import { Link, Navigate, useParams } from "react-router-dom";

import { BookNowLink } from "@/components/results/BookNowLink";
import { FlightPreviewContent } from "@/components/results/FlightPreviewContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DISCOVER_CARDS } from "@/data/homeMock";
import { airportDisplay } from "@/data/locations";

function discountText(lowPrice, avgPrice30d) {
  if (!Number.isFinite(lowPrice) || !Number.isFinite(avgPrice30d) || avgPrice30d <= 0) return null;
  const ratio = lowPrice / avgPrice30d;
  if (ratio >= 1) return "与近30天均价持平";
  return `约${Math.round((1 - ratio) * 100)}% 低于近30天均价`;
}

export function DealDetailPage() {
  const { id } = useParams();
  const deal = DISCOVER_CARDS.find((x) => x.id === id);

  if (!deal) {
    return <Navigate to="/explore" replace />;
  }

  const flight = deal.flight;
  const discount = discountText(deal.lowPrice, deal.avgPrice30d);
  const platforms = Array.isArray(flight?.platforms) ? flight.platforms : [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-5 py-10 md:px-10 md:py-14">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">低价精选详情</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{deal.route}</h1>
        </div>
        <Button variant="outline" asChild>
          <Link to="/explore">返回低价精选</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">基础信息</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p className="text-muted-foreground">
            出发地：<span className="font-medium text-foreground">{deal.originCity}</span>
          </p>
          <p className="text-muted-foreground">
            到达地：<span className="font-medium text-foreground">{deal.destinationCity}</span>
          </p>
          <p className="text-muted-foreground">
            出发日期：<span className="font-medium text-foreground">{deal.departureDate}</span>
          </p>
          <p className="text-muted-foreground">
            当前舱位：<span className="font-medium text-foreground">{deal.cabinClass}</span>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg">推荐票信息</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <FlightPreviewContent flight={flight} />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg">价格信息</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">当前最低价</p>
            <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight">¥{deal.lowPrice}</p>
            <p className="mt-2 text-xs text-muted-foreground">{deal.badge}</p>
            <p className="mt-1 text-xs text-muted-foreground">{deal.insight}</p>
            {discount ? <p className="mt-1 text-xs text-muted-foreground">{discount}</p> : null}
            <p className="mt-3 text-xs text-muted-foreground">航段：{airportDisplay(flight.origin)} → {airportDisplay(flight.destination)}</p>
            {platforms.length ? <p className="mt-1 text-xs text-muted-foreground">来源平台：{platforms.join(" / ")}</p> : null}
            <Button className="mt-4 w-full" asChild>
              <BookNowLink flight={flight}>立即预订</BookNowLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
