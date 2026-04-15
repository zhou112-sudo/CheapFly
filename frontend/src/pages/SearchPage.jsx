import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { HeroSearch } from "@/components/home/HeroSearch";
import { InspirationDestinations } from "@/components/home/InspirationDestinations";
import { searchFlights } from "@/api/searchFlights";
import { CITIES, getLocationItemById } from "@/data/locations";
import { defaultDepartureDate, isDepartureDateBeforeToday } from "@/lib/dates";

const SEARCH_DRAFT_STORAGE_KEY = "ticketplatform.searchDraft";

function toQueryString(origin, destination, departureDate) {
  return new URLSearchParams({
    origin_airports: origin.codes.join(","),
    destination_airports: destination.codes.join(","),
    departure_date: departureDate,
  }).toString();
}

function readSearchDraftFromStorage() {
  try {
    const raw = sessionStorage.getItem(SEARCH_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      originId: parsed?.originId ?? null,
      destinationId: parsed?.destinationId ?? null,
      date: parsed?.date ?? null,
      tripType: parsed?.tripType ?? null,
      returnDate: parsed?.returnDate ?? null,
      cabinClass: parsed?.cabinClass ?? null,
    };
  } catch {
    return null;
  }
}

function parseSearchDraft(rawSearch, fallbackDraft) {
  const params = new URLSearchParams(rawSearch);
  const originId = params.get("originId")?.trim() || fallbackDraft?.originId || null;
  const destinationId = params.get("destinationId")?.trim() || fallbackDraft?.destinationId || null;
  const date = params.get("date")?.trim() || fallbackDraft?.date || null;
  const returnDate = params.get("returnDate")?.trim() || fallbackDraft?.returnDate || "";
  const cabinClass = params.get("cabinClass")?.trim() || fallbackDraft?.cabinClass || "economy";
  const tripTypeRaw = params.get("tripType")?.trim() || fallbackDraft?.tripType || "oneway";
  const tripType = tripTypeRaw === "roundtrip" ? "roundtrip" : "oneway";
  return {
    origin: originId ? getLocationItemById(originId) : null,
    destination: destinationId ? getLocationItemById(destinationId) : null,
    departureDate: date || defaultDepartureDate(),
    returnDate,
    tripType,
    cabinClass,
  };
}

function buildSearchDraftParams(origin, destination, departureDate, tripType, returnDate, cabinClass) {
  const params = new URLSearchParams();
  if (origin?.id) params.set("originId", origin.id);
  if (destination?.id) params.set("destinationId", destination.id);
  if (departureDate) params.set("date", departureDate);
  params.set("tripType", tripType);
  if (tripType === "roundtrip" && returnDate) params.set("returnDate", returnDate);
  if (cabinClass) params.set("cabinClass", cabinClass);
  return params;
}

function cityKeyOf(item) {
  if (!item) return null;
  if (item.kind === "city" && item.id?.startsWith("city:")) {
    return item.id.slice(5);
  }
  const code = item.codes?.[0];
  if (!code) return null;
  const city = CITIES.find((c) => c.airports.some((ap) => ap.code === code));
  return city?.id ?? null;
}

export function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDraft = parseSearchDraft(
    location.search,
    typeof window === "undefined" ? null : readSearchDraftFromStorage()
  );
  const [origin, setOrigin] = useState(initialDraft.origin);
  const [destination, setDestination] = useState(initialDraft.destination);
  const [departureDate, setDepartureDate] = useState(initialDraft.departureDate);
  const [tripType, setTripType] = useState(initialDraft.tripType);
  const [returnDate, setReturnDate] = useState(initialDraft.returnDate);
  const [cabinClass, setCabinClass] = useState(initialDraft.cabinClass);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOriginChange = (nextOrigin) => {
    setError(null);
    if (!nextOrigin) {
      setOrigin(nextOrigin);
      return;
    }
    const nextCity = cityKeyOf(nextOrigin);
    const currentDestCity = cityKeyOf(destination);
    if (nextCity && currentDestCity && nextCity === currentDestCity) {
      setError("出发和到达不能为同一城市，请重新选择。");
      return;
    }
    setOrigin(nextOrigin);
  };

  const handleDestinationChange = (nextDestination) => {
    setError(null);
    if (!nextDestination) {
      setDestination(nextDestination);
      return;
    }
    const nextCity = cityKeyOf(nextDestination);
    const currentOriginCity = cityKeyOf(origin);
    if (nextCity && currentOriginCity && nextCity === currentOriginCity) {
      setError("出发和到达不能为同一城市，请重新选择。");
      return;
    }
    setDestination(nextDestination);
  };

  useEffect(() => {
    const id = location.state?.prefillDestinationId;
    if (!id) return;
    const item = getLocationItemById(id);
    if (item) setDestination(item);
    navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
  }, [location.state?.prefillDestinationId, location.pathname, location.search, navigate]);

  useEffect(() => {
    const next = buildSearchDraftParams(origin, destination, departureDate, tripType, returnDate, cabinClass).toString();
    const current = searchParams.toString();
    if (next === current) return;
    setSearchParams(next, { replace: true });
  }, [origin, destination, departureDate, tripType, returnDate, cabinClass, searchParams, setSearchParams]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        SEARCH_DRAFT_STORAGE_KEY,
        JSON.stringify({
          originId: origin?.id ?? null,
          destinationId: destination?.id ?? null,
          date: departureDate ?? null,
          tripType,
          returnDate: tripType === "roundtrip" ? returnDate ?? null : null,
          cabinClass,
        })
      );
    } catch {
      /* ignore storage failure */
    }
  }, [origin, destination, departureDate, tripType, returnDate, cabinClass]);

  const handleSubmit = async () => {
    setError(null);
    if (!origin?.codes?.length || !destination?.codes?.length) {
      setError("请选择出发地和目的地。");
      return;
    }
    if (tripType === "roundtrip") {
      if (!returnDate) {
        setError("往返查询请填写返程日期。");
        return;
      }
      if (departureDate >= returnDate) {
        setError("去程日期必须早于返程日期。");
        return;
      }
    }
    if (isDepartureDateBeforeToday(departureDate)) {
      setError("不能查询过去日期的航班。");
      return;
    }
    if (tripType === "roundtrip" && returnDate && isDepartureDateBeforeToday(returnDate)) {
      setError("不能查询过去日期的航班。");
      return;
    }
    setLoading(true);
    try {
      const data = await searchFlights({
        originAirports: origin.codes.join(","),
        destinationAirports: destination.codes.join(","),
        departureDate,
        cabinClass,
      });
      const qsParams = new URLSearchParams(toQueryString(origin, destination, departureDate));
      qsParams.set("trip_type", tripType);
      if (tripType === "roundtrip" && returnDate) qsParams.set("return_date", returnDate);
      qsParams.set("cabin_class", cabinClass);
      const qs = qsParams.toString();
      navigate(`/results?${qs}`, {
        state: { data, query: { origin, destination, departureDate, tripType, returnDate, cabinClass } },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const onPickDestination = (destId) => {
    const item = getLocationItemById(destId);
    if (item) setDestination(item);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-5 py-12 md:space-y-16 md:px-10 md:py-16">
      <HeroSearch
        origin={origin}
        destination={destination}
        departureDate={departureDate}
        returnDate={returnDate}
        tripType={tripType}
        cabinClass={cabinClass}
        onOriginChange={handleOriginChange}
        onDestinationChange={handleDestinationChange}
        onDepartureDateChange={setDepartureDate}
        onReturnDateChange={setReturnDate}
        onTripTypeChange={(next) => {
          setError(null);
          setTripType(next);
        }}
        onCabinClassChange={setCabinClass}
        onSwap={() => {
          setError(null);
          if (!origin || !destination) return;
          setOrigin(destination);
          setDestination(origin);
        }}
        onSubmit={handleSubmit}
        loading={loading}
        canSubmit={Boolean(
          origin?.codes?.length &&
            destination?.codes?.length &&
            (tripType === "oneway" || (returnDate && departureDate < returnDate))
        )}
        error={error}
      />
      <InspirationDestinations variant="compact" onPickDestination={onPickDestination} />
    </div>
  );
}
