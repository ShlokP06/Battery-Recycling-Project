"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** True after hydration, false during SSR. Avoids setState-in-effect. */
export function useMounted(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

let webglCache: boolean | null = null;
function detectWebgl(): boolean {
  if (webglCache === null) {
    try {
      const c = document.createElement("canvas");
      webglCache = Boolean(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}
export function useWebgl(): boolean {
  return useSyncExternalStore(noop, detectWebgl, () => true);
}

function subscribeResize(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}
export function useNarrow(breakpoint = 900): boolean {
  return useSyncExternalStore(subscribeResize, () => window.innerWidth < breakpoint, () => false);
}
