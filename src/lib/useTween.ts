"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const MQ = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const m = window.matchMedia(MQ);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(MQ).matches, () => false);
}

/** Tweens a list of numbers toward `target` over `ms` (default 320). Instant under reduced motion. */
export function useTween(target: number[], ms = 320): number[] {
  const reduce = useReducedMotion();
  const [val, setVal] = useState(target);
  const cur = useRef(target);
  const key = target.join("|");
  useEffect(() => {
    if (reduce) return;
    const from = cur.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = ease(t);
      const next = target.map((x, i) => (from[i] ?? x) + (x - (from[i] ?? x)) * e);
      cur.current = next;
      setVal(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ms, reduce]);
  return reduce ? target : val;
}
