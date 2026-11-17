"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useNarrow, useWebgl } from "@/lib/useClient";
import { BRAND } from "@/config/brand";

const CellScene = dynamic(() => import("./CellScene"), { ssr: false });

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const band = (p: number, a: number, b: number, edge = 0.04) =>
  clamp((p - a) / edge) * (1 - clamp((p - (b - edge)) / edge));

const STAGES = [
  {
    from: 0.1,
    to: 0.31,
    n: "01",
    title: "Open the cell",
    body: "Dismantled, dried cells arrive at 500 kg/h. The steel casing is stripped off and the electrode roll is exposed.",
  },
  {
    from: 0.31,
    to: 0.59,
    n: "02",
    title: "Unwind and liberate",
    body: "The shredder grid sets how much coating comes off the Al and Cu foil: 75 % freed at a 10 mm grid, 57 % at 40 mm.",
  },
  {
    from: 0.59,
    to: 0.92,
    n: "03",
    title: "Separate by size",
    body: "A 0.5 mm screen holds back the foil. The fine powder rides an air stream into a cyclone and a bag filter.",
  },
] as const;

export function HeroStory({
  recovery,
  totalRecovery,
}: {
  recovery: number;
  totalRecovery: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [p, setP] = useState(0);
  const narrow = useNarrow();
  const webgl = useWebgl();

  useEffect(() => {
    const onScroll = () => {
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const v = clamp(-r.top / (r.height - window.innerHeight));
      progress.current = v;
      setP((old) => (Math.abs(old - v) > 0.004 ? v : old));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const intro = 1 - clamp((p - 0.02) / 0.1);
  const done = clamp((p - 0.9) / 0.07);

  return (
    <section ref={wrap} className="relative h-[520vh]" aria-label="How a battery becomes black mass">
      <div className="sticky top-0 h-screen overflow-hidden">
        {webgl ? (
          <div className="absolute inset-0">
            <CellScene progress={progress} recovered={recovery} narrow={narrow} />
          </div>
        ) : (
          <div className="absolute right-[10%] top-1/2 h-[420px] w-[200px] -translate-y-1/2 rounded-[100px] border border-ink/30" />
        )}

        {/* intro */}
        <div
          className="pointer-events-none absolute inset-0 flex flex-col justify-end px-6 pb-14 pt-28 md:justify-center md:px-10 md:pb-0"
          style={{ opacity: intro, transform: `translateY(${(1 - intro) * -24}px)` }}
        >
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="label mb-6 flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-ink/40" /> Li-ion black-mass recovery · Aspen-validated
            </div>
            <h1 className="display max-w-[11ch] text-[clamp(64px,11.5vw,188px)]">{BRAND.short}</h1>
            <p className="mt-8 max-w-md text-[17px] leading-relaxed text-ink-2">{BRAND.description}</p>
            <div className="label mt-12 flex items-center gap-3">
              <span className="inline-block h-6 w-px animate-pulse bg-ink/50" /> Scroll to take a cell apart
            </div>
          </div>
        </div>

        {/* stage captions */}
        {STAGES.map((s) => {
          const o = band(p, s.from, s.to);
          return (
            <div
              key={s.n}
              className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-12 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:px-10 md:pb-0"
              style={{ opacity: o, transform: `translateY(${(1 - o) * 18}px)` }}
            >
              <div className="mx-auto w-full max-w-[1400px]">
                <div className="max-w-[360px]">
                  <div className="num text-[13px] text-green">{s.n} / 04</div>
                  <h2 className="display mt-3 text-[clamp(34px,4.4vw,60px)]">{s.title}</h2>
                  <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* result */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-12 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:px-10 md:pb-0"
          style={{ opacity: done, transform: `translateY(${(1 - done) * 18}px)` }}
        >
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="num text-[13px] text-green">04 / 04</div>
            <div className="display mt-3 text-[clamp(72px,11vw,168px)] text-green">
              {recovery.toFixed(1)}
              <span className="text-[0.4em]"> %</span>
            </div>
            <p className="mt-4 max-w-[340px] text-[15px] leading-relaxed text-ink-2">
              of the black mass reaches the main grade at a 20 mm grid and 15 m/s ({totalRecovery.toFixed(1)} % with
              the second grade). Dry process: no acid, no furnace.
            </p>
          </div>
        </div>

        {/* progress rail */}
        <div className="absolute right-5 top-1/2 hidden h-40 w-px -translate-y-1/2 bg-ink/15 md:block">
          <div className="absolute left-0 top-0 w-px bg-green" style={{ height: `${p * 100}%` }} />
        </div>
      </div>
    </section>
  );
}
