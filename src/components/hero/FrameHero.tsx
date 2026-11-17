"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Scroll-scrubbed hero. Frames are Blender renders listed in
 * /hero/manifest.json ({ frames: string[] }). The BLACK MASS headline is
 * baked into the renders, so the DOM only carries captions, the sieve
 * ladder and the result number. Frames crossfade, so a short backup set
 * still scrubs smoothly.
 */

type Props = {
  main: number;
  total: number;
  second: number;
  lost: number;
  energy: number;
};

const THIN = " ";
const f1 = (x: number) => x.toFixed(1);

const CAPTIONS = [
  { from: 0.1, to: 0.3, tag: "01 · Open", text: "Cap off. Casing off. The steel goes first.", mark: -1 },
  { from: 0.3, to: 0.62, tag: `02 · Shred · 20${THIN}mm`, text: "The shredder grid sets how much coating lets go of the foil.", mark: 0 },
  { from: 0.62, to: 0.77, tag: `03 · Sieve · 0.5${THIN}mm`, text: "Powder falls through. Foil does not.", mark: 1 },
  { from: 0.77, to: 0.88, tag: `04 · Cyclone · 2.7${THIN}µm`, text: "Air carries the fines to a cyclone, then a bag filter.", mark: 2 },
];
const LADDER = [`20${THIN}mm`, `0.5${THIN}mm`, `2.7${THIN}µm`];

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function FrameHero({ main, total, second, lost, energy }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [frames, setFrames] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState({ cap: -2, result: false, intro: true });
  const reduced = useReducedMotion();

  // manifest
  useEffect(() => {
    let live = true;
    fetch("/hero/manifest.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((m: { frames: string[] }) => live && setFrames(m.frames))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  // load + scrub
  useEffect(() => {
    if (!frames || !canvas.current || !wrap.current) return;
    const cv = canvas.current;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const imgs: (HTMLImageElement | null)[] = frames.map(() => null);
    let raf = 0;
    let shown = 0;
    let target = 0;
    let lastPhase = "";

    const load = (i: number) =>
      new Promise<void>((res) => {
        const im = new Image();
        im.decoding = "async";
        im.onload = () => {
          imgs[i] = im;
          res();
        };
        im.onerror = () => res();
        im.src = frames[i];
      });
    // first frame, then every 4th, then the rest
    const order = [0, ...frames.map((_, i) => i).filter((i) => i % 4 === 0 && i), ...frames.map((_, i) => i).filter((i) => i % 4)];
    (async () => {
      await load(0);
      kick();
      // frames are small (~25 KB): fetch the rest 6 at a time
      const rest = order.slice(1);
      for (let k = 0; k < rest.length; k += 6) {
        await Promise.all(rest.slice(k, k + 6).map(load));
        kick();
      }
    })();

    const nearest = (i: number) => {
      for (let d = 0; d < frames.length; d++) {
        if (imgs[i - d]) return imgs[i - d];
        if (imgs[i + d]) return imgs[i + d];
      }
      return null;
    };

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
    };

    const drawImg = (im: HTMLImageElement, alpha: number) => {
      const W = cv.width;
      const H = cv.height;
      const iw = im.naturalWidth;
      const ih = im.naturalHeight;
      // landscape: cover. portrait: fit width, sit a little above centre
      let s: number, dx: number, dy: number;
      if (W / H >= 1) {
        s = Math.max(W / iw, H / ih);
        dx = (W - iw * s) / 2;
        dy = (H - ih * s) / 2;
      } else {
        s = (W / iw) * 1.35;
        dx = (W - iw * s) / 2;
        dy = H * 0.42 - (ih * s) / 2;
      }
      ctx.imageSmoothingQuality = "high";
      ctx.globalAlpha = alpha;
      ctx.drawImage(im, dx, dy, iw * s, ih * s);
    };

    const progress = () => {
      const r = wrap.current!.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      return Math.min(1, Math.max(0, -r.top / Math.max(1, run)));
    };

    const tick = () => {
      raf = 0;
      const p = progress();
      target = p * (frames.length - 1);
      // no trailing ease: the frame follows the scroll position directly
      shown = target;
      const i = Math.floor(shown);
      // narrow blend zone: smooth between frames without ghosting the fast unroll
      const t = Math.min(1, Math.max(0, (shown - i - 0.3) / 0.4));
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0d0e0c";
      ctx.fillRect(0, 0, cv.width, cv.height);
      const a = nearest(i);
      const b = t > 0.001 ? nearest(Math.min(frames.length - 1, i + 1)) : null;
      if (a) drawImg(a, 1);
      if (b && b !== a) drawImg(b, t);
      ctx.globalAlpha = 1;

      const cap = CAPTIONS.findIndex((c) => p >= c.from && p < c.to);
      const ph = `${cap}|${p >= 0.88}|${p < 0.08}`;
      if (ph !== lastPhase) {
        lastPhase = ph;
        setPhase({ cap, result: p >= 0.88, intro: p < 0.08 });
      }
      if (shown !== target) kick();
    };
    function kick() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    // only run while the hero is on screen
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(wrap.current);
    const onScroll = () => visible && kick();
    const onResize = () => {
      size();
      kick();
    };
    size();
    kick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [frames, reduced]);

  const ladderActive = phase.cap >= 0 ? CAPTIONS[phase.cap].mark : -1;
  const fade = (on: boolean) =>
    `transition-[opacity,transform] duration-[480ms] ease-[var(--ease-out)] ${
      on ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
    }`;

  // fallback: no frames yet / failed
  if (failed) {
    return (
      <div className="relative flex h-svh flex-col justify-end bg-bg px-[var(--margin)] pb-16 text-fg">
        <h1 className="display-xl" style={{ fontSize: "clamp(96px,18vw,300px)" }}>
          Black mass<span className="text-orange">.</span>
        </h1>
        <p className="body mt-8 max-w-[34ch] text-mute">
          Batteries in. Black mass out. {f1(main)}{THIN}% first grade, {f1(energy)}{THIN}kWh a tonne, no acid.
        </p>
      </div>
    );
  }

  return (
    <div ref={wrap} className="relative h-[420svh] bg-bg text-fg md:h-[480svh]">
      <h1 className="sr-only">LITHNOVA Recycling. Black mass recovered from Li-ion batteries, dry and mechanical.</h1>
      <div className="sticky top-0 h-svh overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* sieve ladder */}
        <div className={`pointer-events-none absolute left-[var(--margin)] top-1/2 hidden -translate-y-1/2 transition-opacity duration-[480ms] md:block ${phase.intro ? "opacity-0" : "opacity-100"}`} aria-hidden>
          <div className="relative h-[46vh] w-px bg-[var(--rule-soft)]">
            {LADDER.map((l, i) => (
              <div key={l} className="absolute left-0 flex items-center gap-3" style={{ top: `${15 + i * 35}%` }}>
                <span
                  className={`block size-[9px] -translate-x-1/2 border border-fg transition-colors duration-[320ms] ${
                    ladderActive === i ? "bg-fg" : "bg-bg"
                  }`}
                />
                <span className={`tick whitespace-nowrap transition-opacity duration-[320ms] ${ladderActive === i ? "opacity-100" : "opacity-50"}`}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* intro */}
        <div className={`absolute bottom-[8svh] left-[var(--margin)] right-[var(--margin)] flex items-end justify-between gap-8 ${fade(phase.intro)}`}>
          <p className="body max-w-[30ch] md:ml-24">
            Batteries in. Black mass out. {f1(main)}{THIN}% first grade, {f1(energy)}{THIN}kWh a tonne, no acid.
          </p>
          <Link
            href="/simulator"
            className="label shrink-0 border border-fg bg-fg px-5 py-4 text-bg transition-colors duration-[160ms] hover:bg-bg hover:text-fg"
          >
            Open the simulator
          </Link>
        </div>
        <div className={`label absolute bottom-[3svh] left-1/2 -translate-x-1/2 text-mute ${fade(phase.intro)}`}>Scroll</div>

        {/* stage captions */}
        {CAPTIONS.map((c, i) => (
          <div
            key={c.tag}
            className={`absolute bottom-[10svh] left-[var(--margin)] max-w-[34ch] border-t-[3px] border-fg pt-4 md:bottom-auto md:left-auto md:right-[var(--margin)] md:top-1/2 md:-translate-y-1/2 ${fade(phase.cap === i)}`}
          >
            <p className="label mb-3">{c.tag}</p>
            <p className="body">{c.text}</p>
          </div>
        ))}

        {/* result */}
        <div className={`absolute bottom-[5svh] left-[var(--margin)] md:left-[calc(var(--margin)+96px)] ${fade(phase.result)}`}>
          <p className="label mb-2">Main grade, base case · Aspen-modelled</p>
          <p
            className="font-display font-black uppercase leading-[0.8] text-orange [font-stretch:62%] tabular-nums"
            style={{ fontSize: "clamp(104px, 16vw, 260px)" }}
          >
            {f1(main)}
            <span style={{ fontSize: "0.4em" }}>{THIN}%</span>
          </p>
          <p className="data mt-4 text-mute">
            {f1(total)}{THIN}% with second grade ({f1(second)}{THIN}%) · {f1(lost)}{THIN}% lost
          </p>
        </div>
      </div>
    </div>
  );
}
