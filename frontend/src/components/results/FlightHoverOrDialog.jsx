import { FlightPreviewContent } from "./FlightPreviewContent";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const OPEN_DELAY = 280;
const CLOSE_DELAY = 200;

/** 桌面：整行 tr 作为触发器；请传入单个子元素 <tr>...</tr> */
export function FlightRowHoverCard({ flight, children, side = "right" }) {
  return (
    <HoverCard openDelay={OPEN_DELAY} closeDelay={CLOSE_DELAY}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        side={side}
        align="start"
        className="w-[min(calc(100vw-2rem),20rem)] p-0 shadow-xl"
        collisionPadding={16}
      >
        <FlightPreviewContent flight={flight} />
      </HoverCardContent>
    </HoverCard>
  );
}
