"use client";

import { useSyncExternalStore } from "react";
import { identity } from "@/lib/content";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: identity.timezone.iana,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
}

/** Live local time in Sylhet. Renders a stable placeholder on the server. */
export function LocalClock() {
  const time = useSyncExternalStore(
    subscribe,
    () => fmt.format(new Date()),
    () => "--:--",
  );
  return (
    <span className="tabular">
      <time aria-label={`Local time in ${identity.location}: ${time}`}>{time}</time> {identity.timezone.label}
    </span>
  );
}
