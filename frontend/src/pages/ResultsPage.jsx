import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { searchFlights } from "@/api/searchFlights";
import { Button } from "@/components/ui/button";
import { FlightListTable, FlightSummaryRow } from "@/components/results/FlightResults";
import { NearbyDatesPriceBar } from "@/components/results/NearbyDatesPriceBar";
import { PriceInsightCard } from "@/components/results/PriceInsightCard";
import { RecommendedFlightCard } from "@/components/results/RecommendedFlightCard";
import {
  RoundTripListTable,
  RoundTripRecommendedCard,
  RoundTripSummaryRow,
  buildRoundTripCombos,
} from "@/components/results/RoundTripResults";
import { locationPillLabel, summarizeAirportGroup } from "@/data/locations";
import { buildNearbyDepartureDates, formatDepartureLabel, formatDepartureShortZh, localCalendarYmd } from "@/lib/dates";
import { applyDepartureWindowToSearchPayload, lowestFilteredPriceCny } from "@/lib/flightTimeRules";

/**
 * 结果页标题用：严格按用户选择的地点项展示（`kind: "city"` → 城市（所有机场）；
 * `kind: "airport"` → 机场全称+三字码），不因 codes 数量或航班数据反推为单机场。
 * 无完整 state 时退回仅用机场代码推断（直链/刷新场景）。
 */
function routeEndpointHeadline(item, fallbackCodes) {
  if (item && (item.kind === "city" || item.kind === "airport")) {
    return locationPillLabel(item);
  }
  return summarizeAirportGroup(fallbackCodes);
}

function syncQueryToUrl(origin, destination, departureDate, cabinClass = "economy") {
  return new URLSearchParams({
    origin_airports: origin.codes.join(","),
    destination_airports: destination.codes.join(","),
    departure_date: departureDate,
    cabin_class: cabinClass,
  }).toString();
}

/** @param {import("react-router-dom").URLSearchParams} params */
function buildResultsSearchString(params, departureYmd) {
  const qs = new URLSearchParams(params.toString());
  qs.set("departure_date", departureYmd);
  return qs.toString();
}

export function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const paramStr = params.toString();
  const routeState = location.state;
  const [remote, setRemote] = useState(null);
  const [remoteReturn, setRemoteReturn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nearbyPrices, setNearbyPrices] = useState(/** @type {Record<string, number | null>} */ ({}));
  const [nearbyGoPrices, setNearbyGoPrices] = useState(/** @type {Record<string, number | null>} */ ({}));
  const [nearbyBackPrices, setNearbyBackPrices] = useState(/** @type {Record<string, number | null>} */ ({}));
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [switchingDate, setSwitchingDate] = useState(false);
  const prevUrlDepartureRef = useRef("");
  const nearbyFetchIdRef = useRef(0);

  const originParam = (params.get("origin_airports") ?? routeState?.data?.query?.origin_airports ?? "").trim();
  const destParam = (params.get("destination_airports") ?? routeState?.data?.query?.destination_airports ?? "").trim();
  const dayParam = (params.get("departure_date") ?? routeState?.data?.query?.departure_date ?? "").trim();
  const returnParam = (params.get("return_date") ?? routeState?.query?.returnDate ?? "").trim();
  const tripTypeParam = (params.get("trip_type") ?? routeState?.query?.tripType ?? "oneway").trim();
  const cabinParam = (params.get("cabin_class") ?? routeState?.data?.query?.cabin_class ?? "economy").trim() || "economy";
  const isRoundTrip = tripTypeParam === "roundtrip" && Boolean(returnParam);

  const routeDataMatchesParams = Boolean(routeState?.data) && Boolean(originParam && destParam && dayParam) && (() => {
    const q = routeState.data.query ?? {};
    return (
      String(q.origin_airports ?? "").trim() === originParam &&
      String(q.destination_airports ?? "").trim() === destParam &&
      String(q.departure_date ?? "").trim() === dayParam &&
      String(q.cabin_class ?? "economy").trim() === cabinParam
    );
  })();

  const payloadRaw = routeDataMatchesParams ? routeState?.data : remote;
  const queryObj = routeState?.query ?? null;

  const departureYmd =
    params.get("departure_date")?.trim() ||
    queryObj?.departureDate ||
    (payloadRaw?.query?.departure_date ? String(payloadRaw.query.departure_date).trim() : "") ||
    "";
  const returnYmd = returnParam;

  const payload = useMemo(() => {
    if (!payloadRaw || !departureYmd) return payloadRaw;
    return applyDepartureWindowToSearchPayload(payloadRaw, departureYmd);
  }, [payloadRaw, departureYmd]);
  const returnPayload = useMemo(() => {
    if (!remoteReturn || !returnYmd) return null;
    return applyDepartureWindowToSearchPayload(remoteReturn, returnYmd);
  }, [remoteReturn, returnYmd]);

  const qm = payloadRaw?.query;
  const originCsv = originParam;
  const destCsv = destParam;
  const cabinClass = cabinParam;

  const nearbyStrip = useMemo(
    () => (departureYmd ? buildNearbyDepartureDates(departureYmd, localCalendarYmd()) : []),
    [departureYmd],
  );
  const nearbyReturnStrip = useMemo(
    () => (returnYmd ? buildNearbyDepartureDates(returnYmd, localCalendarYmd()) : []),
    [returnYmd],
  );

  useEffect(() => {
    if (!(routeState?.data && routeState?.query)) return;
    const { origin, destination, departureDate, cabinClass } = routeState.query;
    if (!origin?.codes?.length || !destination?.codes?.length) return;
    const next = syncQueryToUrl(origin, destination, departureDate, cabinClass || "economy");
    if (paramStr !== next) {
      navigate(`${location.pathname}?${next}`, { replace: true, state: routeState });
    }
  }, [routeState, location.pathname, navigate, paramStr]);

  useEffect(() => {
    if (routeDataMatchesParams) return;
    const o = originParam;
    const d = destParam;
    const day = dayParam;
    if (!o || !d || !day) {
      setRemote(null);
      setError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      if (prevUrlDepartureRef.current && prevUrlDepartureRef.current !== day) {
        setRemote(null);
      }
      prevUrlDepartureRef.current = day;
      setLoading(true);
      setError(null);
      try {
        const data = await searchFlights({
          originAirports: o,
          destinationAirports: d,
          departureDate: day,
          cabinClass,
        });
        if (!cancelled) setRemote(data);
      } catch (e) {
        if (!cancelled) {
          setRemote(null);
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [routeDataMatchesParams, originParam, destParam, dayParam, paramStr, cabinClass]);

  useEffect(() => {
    if (!isRoundTrip || !originParam || !destParam || !returnYmd) {
      setRemoteReturn(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await searchFlights({
          originAirports: destParam,
          destinationAirports: originParam,
          departureDate: returnYmd,
          cabinClass,
        });
        if (!cancelled) setRemoteReturn(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isRoundTrip, originParam, destParam, returnYmd, cabinClass]);

  useEffect(() => {
    if (isRoundTrip) return;
    if (!payloadRaw || !originCsv || !destCsv || !departureYmd || nearbyStrip.length === 0) {
      return;
    }
    const runId = ++nearbyFetchIdRef.current;
    let cancelled = false;
    const qDep = String(payloadRaw.query?.departure_date ?? "").trim();

    (async () => {
      setNearbyLoading(true);
      const next = /** @type {Record<string, number | null>} */ ({});
      await Promise.all(
        nearbyStrip.map(async (ymd) => {
          if (ymd === departureYmd && qDep === ymd) {
            next[ymd] = lowestFilteredPriceCny(payloadRaw, ymd);
            return;
          }
          try {
            const raw = await searchFlights({
              originAirports: originCsv,
              destinationAirports: destCsv,
              departureDate: ymd,
              cabinClass,
            });
            if (!cancelled) next[ymd] = lowestFilteredPriceCny(raw, ymd);
          } catch {
            if (!cancelled) next[ymd] = null;
          }
        }),
      );
      if (cancelled || runId !== nearbyFetchIdRef.current) return;
      setNearbyPrices(next);
      setNearbyLoading(false);

      // 开发态调试：核对相邻日期是否按当前舱位全部重算
      if (import.meta.env.DEV) {
        const rows = nearbyStrip.map((d) => ({ date: d, cabin: cabinClass, price: next[d] ?? null }));
        // eslint-disable-next-line no-console
        console.table(rows);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [originCsv, destCsv, cabinClass, departureYmd, nearbyStrip.join(","), payloadRaw]);

  useEffect(() => {
    if (!isRoundTrip || !payloadRaw || !returnPayload || !originCsv || !destCsv || !departureYmd || !returnYmd) {
      return;
    }
    let cancelled = false;
    const runId = ++nearbyFetchIdRef.current;
    (async () => {
      setNearbyLoading(true);
      const goMap = /** @type {Record<string, number | null>} */ ({});
      const backMap = /** @type {Record<string, number | null>} */ ({});
      await Promise.all(
        nearbyStrip.map(async (d) => {
          try {
            const outRaw =
              d === departureYmd
                ? payloadRaw
                : await searchFlights({
                    originAirports: originCsv,
                    destinationAirports: destCsv,
                    departureDate: d,
                    cabinClass,
                  });
            const outPayload = applyDepartureWindowToSearchPayload(outRaw, d);
            const combos = buildRoundTripCombos(outPayload?.flights ?? [], returnPayload?.flights ?? []);
            goMap[d] = combos[0]?.total_price_cny ?? null;
          } catch {
            goMap[d] = null;
          }
        }),
      );
      await Promise.all(
        nearbyReturnStrip.map(async (d) => {
          try {
            const inRaw =
              d === returnYmd
                ? remoteReturn
                : await searchFlights({
                    originAirports: destCsv,
                    destinationAirports: originCsv,
                    departureDate: d,
                    cabinClass,
                  });
            const inPayload = applyDepartureWindowToSearchPayload(inRaw, d);
            const combos = buildRoundTripCombos(payload?.flights ?? [], inPayload?.flights ?? []);
            backMap[d] = combos[0]?.total_price_cny ?? null;
          } catch {
            backMap[d] = null;
          }
        }),
      );
      if (cancelled || runId !== nearbyFetchIdRef.current) return;
      setNearbyGoPrices(goMap);
      setNearbyBackPrices(backMap);
      setNearbyLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    isRoundTrip,
    payloadRaw,
    returnPayload,
    originCsv,
    destCsv,
    departureYmd,
    returnYmd,
    cabinClass,
    nearbyStrip.join(","),
    nearbyReturnStrip.join(","),
    payload,
    remoteReturn,
  ]);

  const handleDateStripSelect = useCallback(
    async (ymd) => {
      if (!ymd || ymd === departureYmd || switchingDate) return;
      if (!originCsv || !destCsv) return;
      setSwitchingDate(true);
      setError(null);
      try {
        const data = await searchFlights({
          originAirports: originCsv,
          destinationAirports: destCsv,
          departureDate: ymd,
          cabinClass,
        });
        const nextQs = buildResultsSearchString(params, ymd);
        if (routeState?.query) {
          navigate(`/results?${nextQs}`, {
            replace: true,
            state: {
              ...routeState,
              data,
              query: { ...routeState.query, departureDate: ymd },
            },
          });
        } else {
          navigate(`/results?${nextQs}`, { replace: true, state: { data } });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setSwitchingDate(false);
      }
    },
    [
      departureYmd,
      switchingDate,
      originCsv,
      destCsv,
      cabinClass,
      navigate,
      params,
      routeState,
    ],
  );

  const handleReturnDateStripSelect = useCallback(
    async (ymd) => {
      if (!ymd || ymd === returnYmd || switchingDate) return;
      const qs = new URLSearchParams(params.toString());
      qs.set("return_date", ymd);
      navigate(`/results?${qs.toString()}`, { replace: true, state: routeState ?? {} });
    },
    [returnYmd, switchingDate, params, navigate, routeState],
  );

  if (loading && !payload) {
    return (
      <div className="min-h-screen bg-background px-5 py-20 text-center text-muted-foreground md:px-10">
        <p>正在加载…</p>
      </div>
    );
  }

  if (error && !payload) {
    return (
      <div className="min-h-screen bg-background px-5 py-16 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="whitespace-pre-wrap text-sm text-red-800 dark:text-red-200">{error}</p>
          <Button asChild className="mt-6">
            <Link to="/">返回</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen bg-background px-5 py-16 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground">暂无结果。请返回机票搜索重试，或确认链接是否有效。</p>
          <Button asChild className="mt-6">
            <Link to="/">返回</Link>
          </Button>
        </div>
      </div>
    );
  }

  const {
    query: qmPayload,
    flights,
    lowest_overall: lowestOverall,
    lowest_direct: lowestDirect,
    lowest_connecting: lowestConnecting,
    price_insight: priceInsight,
    recommended,
  } = payload;

  const originCodesFallback = (qmPayload?.origin_airports ?? "").split(",").filter(Boolean);
  const destCodesFallback = (qmPayload?.destination_airports ?? "").split(",").filter(Boolean);
  const originLine = routeEndpointHeadline(queryObj?.origin ?? null, originCodesFallback);
  const destLine = routeEndpointHeadline(queryObj?.destination ?? null, destCodesFallback);
  const dateLine = formatDepartureLabel(queryObj?.departureDate ?? qmPayload?.departure_date ?? departureYmd);
  const returnDateLine = formatDepartureLabel(returnYmd);

  const roundTripCombos = useMemo(() => {
    if (!isRoundTrip || !payload || !returnPayload) return [];
    return buildRoundTripCombos(payload.flights ?? [], returnPayload.flights ?? []);
  }, [isRoundTrip, payload, returnPayload]);
  const roundBest = roundTripCombos[0] ?? null;

  const selectedLow = lowestOverall?.price_cny != null ? Number(lowestOverall.price_cny) : null;

  const nearbyBarItems = nearbyStrip.map((ymd) => ({
    ymd,
    label: formatDepartureShortZh(ymd),
    price: ymd === departureYmd ? selectedLow ?? nearbyPrices[ymd] ?? null : nearbyPrices[ymd] ?? null,
    loading: nearbyLoading && ymd !== departureYmd && !(ymd in nearbyPrices),
  }));
  const nearbyGoItems = nearbyStrip.map((ymd) => ({
    ymd,
    label: formatDepartureShortZh(ymd),
    price: nearbyGoPrices[ymd] ?? null,
    loading: nearbyLoading && !(ymd in nearbyGoPrices),
  }));
  const nearbyReturnItems = nearbyReturnStrip.map((ymd) => ({
    ymd,
    label: formatDepartureShortZh(ymd),
    price: nearbyBackPrices[ymd] ?? null,
    loading: nearbyLoading && !(ymd in nearbyBackPrices),
  }));

  const nearbyHint = (() => {
    if (!nearbyStrip.length || selectedLow == null) return null;
    const others = nearbyStrip
      .filter((d) => d !== departureYmd)
      .map((d) => ({ d, p: nearbyPrices[d] }))
      .filter((x) => x.p != null);
    if (!others.length) return null;
    const minOther = Math.min(...others.map((x) => x.p));
    if (minOther < selectedLow) {
      const best = others.find((x) => x.p === minOther);
      return best ? `${formatDepartureShortZh(best.d)} 起价更低，可考虑改期。` : null;
    }
    if (minOther > selectedLow) return null;
    return "当前日期为所选范围内可见的最低价。";
  })();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-5 md:px-10">
          <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Link>
          </Button>
          <span className="text-sm font-semibold tracking-tight">搜索结果</span>
          <Link to="/" className="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground">
            首页
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
        <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {originLine}
              <span className="mx-2 font-normal text-muted-foreground">→</span>
              {destLine}
            </h1>
            {!isRoundTrip ? (
              <p className="mt-3 text-sm text-muted-foreground md:text-base">出发日期：{dateLine}</p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                去程日期：{dateLine} · 返回日期：{returnDateLine}
              </p>
            )}
            <p className="mt-1.5 text-xs text-muted-foreground md:text-sm">
              {(flights?.length ?? 0) === 0
                ? "当前时间范围内暂无可预订航班，可尝试更晚日期或稍后再查。"
                : `共 ${flights.length} 条行程`}
            </p>
            {switchingDate ? <p className="mt-2 text-xs text-muted-foreground">正在切换日期…</p> : null}
            {error && payload ? (
              <p className="mt-2 whitespace-pre-wrap text-xs text-red-800 dark:text-red-200">{error}</p>
            ) : null}
          </div>
        </div>

        {!isRoundTrip && departureYmd && nearbyStrip.length ? (
          <NearbyDatesPriceBar
            items={nearbyBarItems}
            selectedYmd={departureYmd}
            onSelect={handleDateStripSelect}
            hint={nearbyHint}
            disabled={switchingDate}
          />
        ) : null}
        {isRoundTrip ? (
          <div className="space-y-4">
            <NearbyDatesPriceBar
              title="去程日期最低价"
              items={nearbyGoItems}
              selectedYmd={departureYmd}
              onSelect={handleDateStripSelect}
              hint={null}
              disabled={switchingDate}
            />
            <NearbyDatesPriceBar
              title="返程日期最低价"
              items={nearbyReturnItems}
              selectedYmd={returnYmd}
              onSelect={handleReturnDateStripSelect}
              hint={null}
              disabled={switchingDate}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-10 md:gap-12">
          {!isRoundTrip ? (
            <>
              <RecommendedFlightCard recommended={recommended} flights={flights} />
              <FlightSummaryRow
                flights={flights}
                lowestDirect={lowestDirect}
                lowestConnecting={lowestConnecting}
              />
              <PriceInsightCard insight={priceInsight} />
              <FlightListTable flights={flights} lowestDirect={lowestDirect} />
            </>
          ) : (
            <>
              <div className="rounded-lg border border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
                去程日期：{dateLine} · 返回日期：{returnDateLine} · 去程 {payload?.flights?.length ?? 0} 条 · 返程 {returnPayload?.flights?.length ?? 0} 条
              </div>
              <RoundTripRecommendedCard combo={roundBest} />
              <RoundTripSummaryRow combos={roundTripCombos} />
              <RoundTripListTable outboundFlights={payload?.flights ?? []} inboundFlights={returnPayload?.flights ?? []} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
