import { Link } from "react-router-dom";

import { DestinationDiscoverGrid } from "@/components/discover/DestinationDiscoverGrid";
import { Button } from "@/components/ui/button";

export function ExplorePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-20">
      <section className="mb-10 text-center md:mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">发现低价出行机会</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:mt-5 md:text-lg">
          聚合近期更有价格优势的航线，帮你快速找到值得出发的低价机票。
        </p>

        <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-border/80 bg-card px-6 py-10 shadow-card ring-1 ring-black/[0.03] dark:ring-white/[0.06] md:mt-10 md:px-10 md:py-12">
          <p className="text-sm text-muted-foreground md:text-base">低价榜单已更新，优先查看近期价格优势航线</p>
          <Button className="mt-6 h-10 rounded-lg px-6" variant="secondary" asChild>
            <Link to="/">已有行程，去搜机票</Link>
          </Button>
        </div>
      </section>
      <section className="mb-5 md:mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">今日低价推荐</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">优先展示近期价格更低、性价比更高的热门航线。</p>
      </section>
      <DestinationDiscoverGrid />
    </div>
  );
}
