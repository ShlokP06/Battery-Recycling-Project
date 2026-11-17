"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GRID_G, GRID_V, SPECS, simulate } from "@/lib/model";
import { RUN_COUNT, THIN, alTag, cuTag, flows, minEnergyPoint, provenance, velocitySpanPt } from "@/lib/derived";
import { AssumptionsGrid } from "@/components/AssumptionsGrid";
import { useTween } from "@/lib/useTween";
import { Slider } from "./Slider";
import { Sankey } from "./Sankey";
import { Evidence } from "./Evidence";

const BASE = { G: 20, v: 15 };
const f = (x: number, d = 1) => x.toFixed(d);

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function Simulator() {
  const [G, setG] = useState<number>(BASE.G);
  const [v, setV] = useState<number>(BASE.v);
  const [barOn, setBarOn] = useState(false);
  const numRef = useRef<HTMLDivElement>(null);

  const s = useMemo(() => simulate(G, v), [G, v]);
  const base = useMemo(() => simulate(BASE.G, BASE.v), []);
  const flow = useMemo(() => flows(G, v), [G, v]);
  const prov = provenance(G, v);
  const span = velocitySpanPt(G);
  const vLo = GRID_V[0];
  const vHi = GRID_V[GRID_V.length - 1];
  const fanLo = simulate(G, vLo).energy.fanKw;
  const fanHi = simulate(G, vHi).energy.fanKw;
  const minE = useMemo(() => minEnergyPoint(), []);

  const PRESETS = [
    { name: "Base case", G: BASE.G, v: BASE.v },
    { name: "Max recovery", G: GRID_G[0], v: 13 },
    { name: "Min energy", G: minE.G, v: minE.v },
    { name: "Balanced", G: 15, v: 13 },
  ];

  const [rec] = useTween([s.recoveryMain]);
  const delta = s.recoveryMain - base.recoveryMain;

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarOn(!e.isIntersecting && e.boundingClientRect.bottom < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const summary = `${f(s.recoveryMain)}${THIN}% main · ${f(s.recoveryTotal)}${THIN}% total · ${f(s.energy.kwhPerTFeed)}${THIN}kWh/t · G ${G}${THIN}mm · v ${v}${THIN}m/s`;
  const spoken = useDebounced(summary, 400);

  const gridValueText = `${G} millimetres, ${prov.exact ? "Aspen run available" : "interpolated"}`;
  const velValueText = `${v} metres per second, ${GRID_V.includes(v) ? "Aspen run available" : "interpolated"}`;
  const alT = alTag(s.alWt, SPECS.china_draft.al);
  const cuT = cuTag(s.cuWt, SPECS.china_draft.cu);
  const cuFm = s.cuWt > SPECS.fastmarkets.cu;
  const alFm = s.alWt > SPECS.fastmarkets.al;

  return (
    <div data-theme="carbon" data-grain>
      {/* sticky result bar, shown when the giant number has scrolled out */}
      {barOn && (
        <div
          data-theme="carbon"
          aria-hidden
          className="data fixed inset-x-0 top-0 z-30 flex min-h-12 items-center border-b border-[var(--rule)] py-2"
          style={{ background: "rgba(13,14,12,0.92)" }}
        >
          <div className="wrap w-full">{summary}</div>
        </div>
      )}
      <span className="sr-only-live" role="status" aria-live="polite">
        {spoken}
      </span>

      {/* top label bar */}
      <div className="pt-14 md:pt-16">
        <div className="hair-b">
          <div className="wrap flex h-10 items-center">
            <span className="label"><span className="hidden md:inline">Simulator · </span>Aspen-modelled · {RUN_COUNT}-run sweep</span>
          </div>
        </div>
      </div>

      <div className="wrap grid grid-cols-1 gap-x-4 pb-24 pt-6 md:grid-cols-12 md:pb-40 md:pt-8">
        {/* giant number */}
        <div className="md:col-span-8 md:col-start-5 md:row-start-1">
          <div ref={numRef}>
            <div className="label mb-3">Main-grade recovery, black mass</div>
            <h1 className="display-num recovered m-0" aria-label={`Main-grade recovery ${f(s.recoveryMain)} percent`}>
              <span aria-hidden>
                {f(rec)}
                <span className="ml-[0.04em] text-[0.5em]">%</span>
              </span>
            </h1>
          </div>
          <dl className="m-0 mt-6 grid grid-cols-2 gap-y-4 md:mt-8 md:grid-cols-5 md:gap-y-0">
            <Cell k="vs base" v={`${delta >= 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)}${THIN}pt`} />
            <Cell k="Total" v={`${f(s.recoveryTotal)}${THIN}%`} sub="with second grade" />
            <Cell k="Energy" v={`${f(s.energy.kwhPerTFeed)}${THIN}kWh/t`} />
            <Cell k="Al" v={`${f(s.alWt, 2)}${THIN}wt${THIN}%`} tag={alT ?? (alFm ? `over ${SPECS.fastmarkets.al} Fastmarkets` : null)} />
            <Cell k="Cu" v={`${f(s.cuWt, 2)}${THIN}wt${THIN}%`} tag={cuT ?? (cuFm ? `over ${SPECS.fastmarkets.cu} Fastmarkets` : null)} />
          </dl>
        </div>

        {/* controls */}
        <aside
          aria-label="Plant controls"
          className="mt-12 md:sticky md:top-4 md:col-span-4 md:col-start-1 md:row-span-2 md:row-start-1 md:mt-0 md:self-start"
        >
          <div className="ticket space-y-10 pt-4">
            <div className="space-y-2 border-b border-rule pb-6">
              <div className="label !text-[var(--fg)]">Valid range</div>
              <p className="body-s m-0 mute">
                Shredder grid <span className="data fg">{GRID_G[0]}–{GRID_G[GRID_G.length - 1]} mm</span>, six Aspen runs.
                Cyclone velocity <span className="data fg">{vLo}–{vHi} m/s</span>, six Aspen runs.
                Values between runs are interpolated. Outside these limits the model is not valid.
              </p>
            </div>
            <div className="space-y-4">
              <Slider
                id="grid-g"
                label="Shredder grid"
                unit="mm"
                value={G}
                min={GRID_G[0]}
                max={GRID_G[GRID_G.length - 1]}
                step={1}
                onChange={setG}
                ticks={[...GRID_G]}
                valueText={gridValueText}
                describedBy="grid-note"
                gridValues={GRID_G}
              />
              <p id="grid-note" className="body-s m-0 mute">
                Finer grid frees more coating: recovery up, more Al and Cu in the product, more kWh.
              </p>
            </div>
            <div className="space-y-4">
              <Slider
                id="vel-v"
                label="Cyclone inlet velocity"
                unit="m/s"
                value={v}
                min={vLo}
                max={vHi}
                step={0.5}
                onChange={setV}
                ticks={[...GRID_V]}
                valueText={velValueText}
                describedBy="vel-note"
                gridValues={GRID_V}
              />
              <div id="vel-note" className="space-y-2">
                <span className="tag tag-solid">Affects energy and dust, not grade</span>
                <p className="body-s m-0 mute">
                  <span className="data fg">{span.toFixed(3)}{THIN}pt</span> across the range. Fan: {fanLo.toFixed(2)}{THIN}kW at {vLo}{THIN}m/s,{" "}
                  {fanHi.toFixed(2)}{THIN}kW at {vHi}{THIN}m/s.
                </p>
              </div>
            </div>
            <div className="hair-t pt-4">
              <div className="label mb-1">Presets</div>
              <ul className="m-0 list-none p-0">
                {PRESETS.map((p) => {
                  const on = p.G === G && p.v === v;
                  return (
                    <li key={p.name}>
                      <button
                        type="button"
                        onClick={() => {
                          setG(p.G);
                          setV(p.v);
                        }}
                        aria-pressed={on}
                        className={`link tap w-full justify-between gap-4 bg-transparent p-0 text-left ${on ? "is-on" : ""}`}
                        style={{ display: "flex", color: "var(--fg)", border: 0, font: "inherit" }}
                      >
                        <span className="body">{p.name}</span>
                        <span className="data mute">{`G${p.G} · v${p.v}`}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="label m-0 !text-[var(--fg)]">
              {prov.text}
            </p>
          </div>
        </aside>

        {/* sankey */}
        <div className="mt-12 md:col-span-8 md:col-start-5 md:row-start-2 md:mt-6">
          <Sankey flow={flow} />
        </div>
      </div>

      {/* evidence */}
      <section aria-labelledby="evidence" className="pb-24 md:pb-40">
        <div className="wrap">
          <div className="hair-t pt-6 pb-8">
            <h2 id="evidence" className="label m-0 !text-[var(--fg)]">
              Evidence
            </h2>
          </div>
          <Evidence G={G} v={v} />
          <div className="mt-24 md:mt-32">
            <AssumptionsGrid intro="Recovery, purity and flows are an interpolation between Aspen runs. Energy and the cyclone curves are calculated live." />
          </div>
        </div>
      </section>
    </div>
  );
}

function Cell({ k, v, sub, tag }: { k: string; v: string; sub?: string; tag?: string | null }) {
  return (
    <div className="md:border-l md:border-[var(--rule)] md:pl-4 md:first:border-l-0 md:first:pl-0">
      <dt className="label">{k}</dt>
      <dd className="m-0 mt-1">
        <span className="data nowrap fg" style={{ fontWeight: 500 }}>
          {v}
        </span>
        {sub && <span className="body-s mute block">{sub}</span>}
        {tag && <span className="tag mt-1 block" style={{ borderStyle: "dashed" }}>{tag}</span>}
      </dd>
    </div>
  );
}
