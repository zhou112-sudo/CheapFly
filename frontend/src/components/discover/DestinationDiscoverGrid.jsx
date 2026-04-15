import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DISCOVER_CARDS } from "@/data/homeMock";
import { cn } from "@/lib/utils";

const SURFACES = [
  "from-muted/40 via-card to-card",
  "from-muted/25 via-card to-muted/30",
  "from-card via-muted/20 to-card",
  "from-muted/35 via-card to-card",
  "from-card to-muted/25",
  "from-muted/30 via-card to-muted/20",
];

const SCENERY_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80",
];

function getRandomSceneryImage(index) {
  const rotateSeed = Math.floor(Date.now() / (1000 * 60 * 20));
  const pick = (index * 5 + rotateSeed) % SCENERY_IMAGE_POOL.length;
  return SCENERY_IMAGE_POOL[pick];
}

export function DestinationDiscoverGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6">
      {DISCOVER_CARDS.map((c, i) => (
        <Card
          key={c.id}
          className={cn(
            "group overflow-hidden border-border/80 bg-gradient-to-br transition-shadow duration-200 hover:shadow-card-hover",
            SURFACES[i % SURFACES.length]
          )}
        >
          <Link to={`/deal/${c.id}`} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60">
            <div className="relative aspect-[16/10] overflow-hidden border-b border-border/50">
              <img
                src={getRandomSceneryImage(i)}
                alt={`${c.city}低价机票推荐`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallbackApplied) {
                    img.dataset.fallbackApplied = "1";
                    img.src = "/default-city.jpg";
                    return;
                  }
                  img.onerror = null;
                  img.src =
                    "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1200&q=80";
                }}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full border border-emerald-300/60 bg-emerald-100/85 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                {c.badge}
              </span>
            </div>
            <div className="flex h-full flex-col p-5 md:p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{c.city}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.route}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                当前最低价{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {"\u00A5"}
                  {c.lowPrice}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{c.insight}</p>
              <Button type="button" variant="secondary" className="mt-auto w-full rounded-lg">
                查看详情
              </Button>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
}
