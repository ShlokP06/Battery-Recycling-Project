"use client";

import { A, DATA, GRID_G, shredderKwhPerT } from "@/lib/model";
import { PlotCell, T, lin, path } from "@/components/plot/kit";

const M = { l: 52, r: 20, t: 40, b: 40 };
const VS = [8, 10, 12, 13, 15, 18, 22].filter((v) => DATA.cyclone_per_material.some((p) => p.v === v));

function EffPlot({ w, h }: { w: number; h: number }) {
  const pick = (mat: string, k: "aspen" | "hand") =>
    VS.map((v) => {
      const p = DATA.cyclone_per_material.find((q) => q.v === v && q.material === mat);
      return [v, p ? p[k].eff_pct : NaN] as [number, number];
    }).filter((p) => !Number.isNaN(p[1]));
  const series = [
    { k: "NMC Aspen", pts: pick("NMC", "aspen"), dash: undefined, sw: 2.5, c: "var(--fg)" },
    { k: "NMC Lapple", pts: pick("NMC", "hand"), dash: "5 4", sw: 1.5, c: "var(--fg)" },
    { k: "Graphite Aspen", pts: pick("graphite", "aspen"), dash: undefined, sw: 2.5, c: "var(--fg-mute)" },
    { k: "Graphite Lapple", pts: pick("graphite", "hand"), dash: "5 4", sw: 1.5, c: "var(--fg-mute)" },
  ];
  const ys = series.flatMap((s) => s.pts.map((p) => p[1]));
  const lo = Math.floor(Math.min(...ys) / 5) * 5;
  const hi = Math.ceil(Math.max(...ys) / 5) * 5;
  const x = lin(8, 22, M.l, w - M.r - 110);
  const y = lin(lo, hi, h - M.b, M.t);
  const yt: number[] = [];
  for (let t = lo; t <= hi; t += 5) yt.push(t);
  return (
    <>
      <line x1={M.l} x2={M.l} y1={y(lo)} y2={y(hi)} stroke="var(--rule)" />
      {yt.map((t) => (
        <g key={t}>
          <line x1={M.l - 4} x2={M.l} y1={y(t)} y2={y(t)} stroke="var(--rule)" />
          <T x={M.l - 8} y={y(t) + 4} textAnchor="end">{t}</T>
        </g>
      ))}
      <T x={M.l} y={M.t - 24}>overall capture, %</T>
      <line x1={M.l} x2={w - M.r - 110} y1={h - M.b} y2={h - M.b} stroke="var(--rule)" />
      {[8, 12, 16, 20, 22].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={h - M.b} y2={h - M.b + 4} stroke="var(--rule)" />
          <T x={x(t)} y={h - M.b + 17} textAnchor="middle">{t}</T>
        </g>
      ))}
      <T x={w - M.r - 110} y={h - 4} textAnchor="end">inlet velocity, m/s</T>
      {series.map((s) => {
        const last = s.pts[s.pts.length - 1];
        return (
          <g key={s.k}>
            <path d={path(s.pts.map((p) => [x(p[0]), y(p[1])]))} fill="none" stroke={s.c} strokeWidth={s.sw} strokeDasharray={s.dash} />
            <T x={x(last[0]) + 8} y={y(last[1]) + 4} fill={s.c === "var(--fg)" ? "var(--fg)" : "var(--fg-mute)"}>{s.k}</T>
          </g>
        );
      })}
    </>
  );
}

function ShredPlot({ w, h }: { w: number; h: number }) {
  const pts = Array.from({ length: 31 }, (_, i) => ({ G: 10 + i, e: shredderKwhPerT(10 + i) }));
  const lo = Math.floor(Math.min(...pts.map((p) => p.e)));
  const hi = Math.ceil(Math.max(...pts.map((p) => p.e)));
  const x = lin(10, 40, M.l, w - M.r);
  const y = lin(lo, hi, h - M.b, M.t);
  const yt: number[] = [];
  for (let t = lo; t <= hi; t += 1) yt.push(t);
  return (
    <>
      <line x1={M.l} x2={M.l} y1={y(lo)} y2={y(hi)} stroke="var(--rule)" />
      {yt.map((t) => (
        <g key={t}>
          <line x1={M.l - 4} x2={M.l} y1={y(t)} y2={y(t)} stroke="var(--rule)" />
          <T x={M.l - 8} y={y(t) + 4} textAnchor="end">{t}</T>
        </g>
      ))}
      <T x={M.l} y={M.t - 24}>shredder energy, kWh/t</T>
      <line x1={M.l} x2={w - M.r} y1={h - M.b} y2={h - M.b} stroke="var(--rule)" />
      {GRID_G.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={h - M.b} y2={h - M.b + 4} stroke="var(--rule)" />
          <T x={x(t)} y={h - M.b + 17} textAnchor="middle">{t}</T>
        </g>
      ))}
      <T x={w - M.r} y={h - 4} textAnchor="end">shredder grid G, mm</T>
      <path d={path(pts.map((p) => [x(p.G), y(p.e)]))} fill="none" stroke="var(--fg)" strokeWidth={2.5} />
      <T x={x(30)} y={y(pts[20].e) - 12} mute={false}>Bond, fitted</T>
    </>
  );
}

export function AnalysisCharts() {
  const cell = "hair-r hair-b";
  return (
    <div className="hair-t hair-l grid md:grid-cols-2" style={{ background: "var(--bg)" }}>
      <PlotCell
        className={cell}
        height={300}
        title="Cyclone capture: Aspen against Lapple"
        note={`Solid lines are Aspen runs (${A.ne_aspen.toFixed(0)} turns, titanium density proxy). Dashed lines are the Lapple hand model (${A.ne_hand.toFixed(1)} turns). Overall capture by velocity.`}
      >
        {(w, h) => <EffPlot w={w} h={h} />}
      </PlotCell>
      <PlotCell
        className={cell}
        height={300}
        title="Shredder energy against grid"
        note="Bond's law with a fitted constant, anchored at one grid size. A rough fit for ductile foil, so the ends of the curve are extrapolations."
      >
        {(w, h) => <ShredPlot w={w} h={h} />}
      </PlotCell>
    </div>
  );
}
