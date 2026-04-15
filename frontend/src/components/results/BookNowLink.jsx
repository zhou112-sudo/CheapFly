import * as React from "react";

const BOOK_BASE = "https://example.com/book".replace(/\/$/, "");
const normalizedBookBase = /^https?:\/\//i.test(BOOK_BASE) ? BOOK_BASE : `https://${BOOK_BASE}`;

export function bookNowUrl(flight) {
  const u = new URL(normalizedBookBase);
  u.searchParams.set("flight_id", flight.id);
  if (flight.price_cny != null) u.searchParams.set("price_cny", String(flight.price_cny));
  return u.toString();
}

export const BookNowLink = React.forwardRef(function BookNowLink(
  { flight, className, children = "立即预订", ...props },
  ref
) {
  return (
    <a
      ref={ref}
      href={bookNowUrl(flight)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {children}
    </a>
  );
});
BookNowLink.displayName = "BookNowLink";
