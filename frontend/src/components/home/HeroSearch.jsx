import { ArrowLeftRight, CalendarDays, ChevronsDown, Loader2, MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DepartureDatePicker } from "./DepartureDatePicker";
import { LocationPickerCommand } from "./LocationPickerCommand";

export function HeroSearch({
  origin,
  destination,
  departureDate,
  returnDate,
  tripType,
  cabinClass,
  onOriginChange,
  onDestinationChange,
  onDepartureDateChange,
  onReturnDateChange,
  onTripTypeChange,
  onCabinClassChange,
  onSwap,
  onSubmit,
  loading,
  canSubmit,
  error,
}) {
  const isRoundTrip = tripType === "roundtrip";

  return (
    <section className="space-y-6 md:space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">发现你的下一站旅程</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-lg">
          输入出发地和目的地，快速找到最具性价比的机票选择
        </p>
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-card ring-1 ring-black/[0.03] dark:ring-white/[0.06] md:p-6">
        <div className="mb-3 flex justify-center md:mb-4">
          <div className="inline-flex items-center rounded-lg border border-border/80 bg-background p-1">
            <Button
              type="button"
              size="sm"
              variant={isRoundTrip ? "ghost" : "secondary"}
              className={cn("h-8 rounded-md px-4", !isRoundTrip && "shadow-sm")}
              onClick={() => onTripTypeChange("oneway")}
            >
              单程
            </Button>
            <Button
              type="button"
              size="sm"
              variant={isRoundTrip ? "secondary" : "ghost"}
              className={cn("h-8 rounded-md px-4", isRoundTrip && "shadow-sm")}
              onClick={() => onTripTypeChange("roundtrip")}
            >
              往返
            </Button>
          </div>
        </div>
        {/* 小屏：标签在框外、与输入成对 */}
        <div className="flex flex-col gap-4 md:hidden">
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              出发
            </p>
            <div className="rounded-lg border border-border/80 bg-background px-2.5 py-2 shadow-sm">
              <LocationPickerCommand
                value={origin}
                onChange={onOriginChange}
                placeholder="请点击填写"
                triggerClassName="h-auto min-h-8 w-full rounded-md border-0 bg-transparent px-0 py-0.5 text-left text-sm font-medium leading-snug text-foreground shadow-none hover:bg-transparent"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-border/80 bg-background shadow-sm"
              onClick={onSwap}
              aria-label="交换出发和到达"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              到达
            </p>
            <div className="rounded-lg border border-border/80 bg-background px-2.5 py-2 shadow-sm">
              <LocationPickerCommand
                value={destination}
                onChange={onDestinationChange}
                placeholder="请点击填写"
                triggerClassName="h-auto min-h-8 w-full rounded-md border-0 bg-transparent px-0 py-0.5 text-left text-sm font-medium leading-snug text-foreground shadow-none hover:bg-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                去程日期
              </p>
              <div className="rounded-lg border border-border/80 bg-background px-2.5 py-2 shadow-sm">
                <DepartureDatePicker id="departure-date-sm" value={departureDate} onChange={onDepartureDateChange} />
              </div>
            </div>
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                返程日期
              </p>
              <div className="rounded-lg border border-border/80 bg-background px-2.5 py-2 shadow-sm">
                {isRoundTrip ? (
                  <DepartureDatePicker id="return-date-sm" value={returnDate} onChange={onReturnDateChange} />
                ) : (
                  <div className="flex min-h-8 items-center text-sm text-muted-foreground">单程无需返程</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 桌面：标签一行、输入一行；地点列更宽、日期列更窄 */}
        <div className="hidden gap-x-3 gap-y-1.5 md:grid md:grid-cols-[minmax(0,1.35fr)_auto_minmax(0,1.35fr)_minmax(0,0.72fr)_minmax(0,0.72fr)] md:items-end md:gap-x-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground md:col-start-1 md:row-start-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            出发
          </p>
          <span className="md:col-start-2 md:row-start-1" aria-hidden />
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground md:col-start-3 md:row-start-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            到达
          </p>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground md:col-start-4 md:row-start-1">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
            去程日期
          </p>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground md:col-start-5 md:row-start-1">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
            返程日期
          </p>

          <div className="min-w-0 rounded-lg border border-border/80 bg-background px-2.5 py-2 shadow-sm md:col-start-1 md:row-start-2">
            <LocationPickerCommand
              value={origin}
              onChange={onOriginChange}
              placeholder="请点击填写"
              triggerClassName="h-auto min-h-8 w-full rounded-md border-0 bg-transparent px-0 py-0.5 text-left text-sm font-medium leading-snug text-foreground shadow-none hover:bg-transparent"
            />
          </div>

          <div className="flex items-center justify-center md:col-start-2 md:row-start-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-border/80 bg-background shadow-sm"
              onClick={onSwap}
              aria-label="交换出发和到达"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>

          <div className="min-w-0 rounded-lg border border-border/80 bg-background px-2.5 py-2 shadow-sm md:col-start-3 md:row-start-2">
            <LocationPickerCommand
              value={destination}
              onChange={onDestinationChange}
              placeholder="请点击填写"
              triggerClassName="h-auto min-h-8 w-full rounded-md border-0 bg-transparent px-0 py-0.5 text-left text-sm font-medium leading-snug text-foreground shadow-none hover:bg-transparent"
            />
          </div>

          <div className="min-w-0 rounded-lg border border-border/80 bg-background px-2.5 py-2 shadow-sm md:col-start-4 md:row-start-2">
            <DepartureDatePicker id="departure-date-md" value={departureDate} onChange={onDepartureDateChange} />
          </div>

          <div className="min-w-0 rounded-lg border border-border/80 bg-background px-2.5 py-2 shadow-sm md:col-start-5 md:row-start-2">
            {isRoundTrip ? (
              <DepartureDatePicker id="return-date-md" value={returnDate} onChange={onReturnDateChange} />
            ) : (
              <div className="flex min-h-8 items-center text-sm text-muted-foreground">单程无需返程</div>
            )}
          </div>
        </div>

        <div className="mt-2 flex justify-start">
          <div className="relative inline-flex items-center">
            <select
              id="cabin-class"
              value={cabinClass}
              onChange={(e) => onCabinClassChange(e.target.value)}
              className="h-7 appearance-none bg-transparent pr-6 text-sm font-medium text-muted-foreground outline-none"
            >
              <option value="economy">经济舱</option>
              <option value="premium_economy">超级经济舱</option>
              <option value="business">公务舱</option>
              <option value="first">头等舱</option>
            </select>
            <ChevronsDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            className="h-10 min-w-[180px] rounded-lg px-8 text-base disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"
            disabled={loading || !canSubmit}
            onClick={onSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                搜索中…
              </>
            ) : (
              <>
                <Search className="h-4 w-4 opacity-90" aria-hidden />
                搜索
              </>
            )}
          </Button>
        </div>

        {error ? (
          <p className="mt-4 whitespace-pre-wrap rounded-lg border border-red-200/90 bg-red-50/80 px-3 py-2 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
