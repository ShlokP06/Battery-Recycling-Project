"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Stage = { word: string; spec: string; body: string };

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export function Process({ stages }: { stages: Stage[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = stages.length;

  useEffect(() => {
    const onScroll = () => {
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      setActive(Math.min(n - 1, Math.floor(p * n * 0.999)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [n]);

  const jump = (i: number) => {
    const el = wrap.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / n) * span, behavior: "auto" });
  };

  return (
    <section data-theme="carbon" data-grain aria-labelledby="process-h" className="relative">
      <h2 id="process-h" className="sr-only-live">
        Process: {stages.map((s) => s.word).join(", ")}
      </h2>

      {/* pinned version */}
      <div ref={wrap} className="process-pinned relative" style={{ height: "250svh" }}>
        <div className="sticky top-0 flex h-svh flex-col justify-between overflow-hidden">
          <div className="wrap w-full pt-20">
            <span className="label">
              Process · {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
          </div>
          <div className="wrap grid12 w-full items-end pb-10 md:pb-16">
            <div className="col-span-4 md:col-span-8">
              <div className="relative" style={{ height: "0.85em", fontSize: "var(--stage-size)" }} aria-hidden>
                {stages.map((s, i) => (
                  <div
                    key={s.word}
                    className="wipe display-xl absolute inset-0 m-0 whitespace-nowrap"
                    data-state={i < active ? "before" : i > active ? "after" : "on"}
                    style={{ fontSize: "inherit" }}
                  >
                    {s.word}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-4 mt-10 md:col-span-3 md:col-start-10 md:mt-0">
              {stages.map((s, i) => (
                <div key={s.word} hidden={i !== active} aria-live="off">
                  <p className="data m-0 mb-3">{s.spec}</p>
                  <p className="body m-0 mute">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="wrap w-full pb-8">
            <div className="relative h-11 border-t border-[var(--rule)]">
              {stages.map((s, i) => (
                <button
                  key={s.word}
                  type="button"
                  onClick={() => jump(i)}
                  aria-label={`Stage ${i + 1}: ${s.word}`}
                  aria-current={i === active}
                  className="absolute top-0 h-11 w-11 -translate-x-1/2 bg-transparent p-0"
                  style={{ left: `${(i / (n - 1)) * 100}%`, border: 0 }}
                >
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-0 block -translate-x-1/2"
                    style={{
                      width: i === active ? 10 : 1,
                      height: i === active ? 10 : 8,
                      marginTop: i === active ? -5 : 0,
                      background: i === active ? "var(--fg)" : "var(--rule)",
                    }}
                  />
                </button>
              ))}
            </div>
            <div className="mt-2 hidden justify-between md:flex">
              {stages.map((s, i) => (
                <span key={s.word} className={`label ${i === active ? "!text-[var(--fg)]" : ""}`}>
                  {s.word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* reduced motion: plain list, no pin, no wipe */}
      <div className="process-list wrap space-y-16 py-24">
        {stages.map((s) => (
          <div key={s.word} className="hair-t grid12 gap-y-4 pt-8">
            <h3 className="display-xl col-span-4 md:col-span-8">{s.word}</h3>
            <div className="col-span-4 md:col-span-3 md:col-start-10">
              <p className="data m-0 mb-3">{s.spec}</p>
              <p className="body m-0 mute">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="wrap pb-0">
        <Link href="/simulator" className="sr-only-live">
          Open the simulator
        </Link>
      </div>
    </section>
  );
}
