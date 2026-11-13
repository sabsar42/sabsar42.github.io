import { prefersReducedMotion } from "./hooks";

export const NAVIGATE_EVENT = "site:navigate";

export type NavigateDetail = { id: string };

/**
 * Smooth-scroll to an element id, move focus there, and flash it briefly.
 * Dispatches NAVIGATE_EVENT first so sections can prepare (e.g. clear a filter).
 */
export function navigateTo(id: string, { flash = true }: { flash?: boolean } = {}) {
  window.dispatchEvent(new CustomEvent<NavigateDetail>(NAVIGATE_EVENT, { detail: { id } }));

  // Two frames: let any state change from the event (and panel close) commit first.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const isSection = el.tagName === "SECTION";
      el.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: isSection ? "start" : "center",
      });
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
      if (flash) {
        el.classList.add("flash-target");
        el.setAttribute("data-flash", "");
        window.setTimeout(() => el.removeAttribute("data-flash"), 600);
      }
      history.replaceState(null, "", `#${id}`);
    }),
  );
}
