/* Thin analytics shim.

   No provider is installed in this repo yet, so this dispatches to whichever
   of PostHog / Segment / GA is present on window and no-ops otherwise. The
   event names and the distinct_id contract are what matter: swap the bodies
   for a real SDK without touching call sites. */

type Props = Record<string, unknown>;

interface AnalyticsWindow extends Window {
  posthog?: { identify: (id: string) => void; capture: (e: string, p?: Props) => void };
  analytics?: { identify: (id: string) => void; track: (e: string, p?: Props) => void };
  gtag?: (command: string, ...args: unknown[]) => void;
}

let distinctId: string | null = null;

export function initAnalytics(anonId: string) {
  distinctId = anonId;
  if (typeof window === "undefined") return;
  const w = window as AnalyticsWindow;
  try {
    w.posthog?.identify(anonId);
    w.analytics?.identify(anonId);
    w.gtag?.("set", { user_id: anonId });
  } catch {
    /* analytics must never break the flow */
  }
}

export function track(event: string, props: Props = {}) {
  const payload = { ...props, distinct_id: distinctId, anonId: distinctId };
  if (typeof window === "undefined") return;
  const w = window as AnalyticsWindow;
  try {
    w.posthog?.capture(event, payload);
    w.analytics?.track(event, payload);
    w.gtag?.("event", event, payload);
    if (!w.posthog && !w.analytics && !w.gtag && process.env.NODE_ENV !== "production") {
      console.debug("[analytics]", event, payload);
    }
  } catch {
    /* analytics must never break the flow */
  }
}
