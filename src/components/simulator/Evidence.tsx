"use client";

import {
  A,
  DATA,
  GRID_G,
  SPECS,
  gradeCurve,
  psdBars,
  simulate,
} from "@/lib/model";
import { THIN, maxVelocitySpanPt } from "@/lib/derived";
import { PlotCell, SrTable, T, lin, logs, path } from "@/components/plot/kit";

const M = { l: 52, r: 20, t: 40, b: 40 };

function niceTicks(max: number, n = 4): number[] {
  const raw = max / n;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let x = 0; x <= max + 1e-9; x += step) out.push(+x.toFixed(6));
  return out;
}

function XTicks({ ticks, sx, y, fmtT = (t: number) => String(t), title, w }: { ticks: number[]; sx: (x: number) => number; y: number; fmtT?: (t: number) => string; title: string; w: number }) {
  return (
    <g>
      <line x1={M.l} x2={w - M.r} y1={y} y2={y} stroke="var(--rule)" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={y} y2={y + 4} stroke="var(--rule)" />
          <T x={sx(t)} y={y + 17} textAnchor="middle">{fmtT(t)}</T>
        </g>
      ))}
      <T x={w - M.r} y={y + 33} textAnchor="end">{title}</T>
    </g>
  );
}
function YTicks({ ticks, sy, x, fmtT = (t: number) => String(t), fill, side = "left", title }: { ticks: number[]; sy: (y: number) => number; x: number; fmtT?: (t: number) => string; fill?: string; side?: "left" | "right"; title?: string }) {
  const dir = side === "left" ? -1 : 1;
  return (
    <g>
      <line x1={x} x2={x} y1={sy(ticks[0])} y2={sy(ticks[ticks.length - 1])} stroke="var(--rule)" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x} x2={x + dir * 4} y1={sy(t)} y2={sy(t)} stroke="var(--rule)" />
          <T x={x + dir * 8} y={sy(t) + 4} textAnchor={side === "left" ? "end" : "start"} fill={fill}>{fmtT(t)}</T>
        </g>
      ))}
      {title && (
        <T x={x} y={M.t - 24} textAnchor={side === "left" ? "start" : "end"} fill={fill}>{title}</T>
      )}
    </g>
  );
}

function GradePlot({ G, v, w, h }: { G: number; v: number; w: number; h: number }) {
  const s = simulate(G, v);
  const x = logs(1, 1000, M.l, w - M.r);
  const y = lin(0, 100, h - M.b, M.t);
  const nmc = gradeCurve(v, "NMC", 120).filter((p) => p.d >= 1 && p.d <= 1000);
  const gr = gradeCurve(v, "Graphite", 120).filter((p) => p.d >= 1 && p.d <= 1000);
  const bars = psdBars.filter((b) => b.hi <= 1000 && b.lo >= 1);
  const dens = bars.map((b) => b.pct / Math.log10(b.hi / b.lo));
  const dmax = Math.max(...dens);
  const base = h - M.b;
  const ph = (h - M.b - M.t) * 0.4;
  let psd = `M${x(bars[0].lo)} ${base}`;
  bars.forEach((b, i) => {
    const yy = base - (dens[i] / dmax) * ph;
    psd += `L${x(b.lo).toFixed(1)} ${yy.toFixed(1)}L${x(b.hi).toFixed(1)} ${yy.toFixed(1)}`;
  });
  psd += `L${x(bars[bars.length - 1].hi)} ${base}`;
  const peak = dens.indexOf(dmax);
  const dN = s.cyclone.d50Nmc;
  const xTicks = [1, 10, 100, 1000];
  return (
    <>
      <YTicks ticks={[0, 25, 50, 75, 100]} sy={y} x={M.l} fmtT={(t) => `${t}`} title="grade efficiency, %" />
      <XTicks ticks={xTicks} sx={x} y={h - M.b} title="particle size, µm" w={w} />
      <path d={psd} fill="none" stroke="var(--fg-mute)" strokeWidth={1} />
      <T x={x(bars[peak].hi) + 6} y={base - ph - 8}>feed size distribution</T>
      <path d={path(nmc.map((p) => [x(p.d), y(p.eff)]))} fill="none" stroke="var(--fg)" strokeWidth={2} />
      <path d={path(gr.map((p) => [x(p.d), y(p.eff)]))} fill="none" stroke="var(--fg-mute)" strokeWidth={2} strokeDasharray="5 4" />
      <T x={w - M.r} y={y(100) - 8} textAnchor="end" mute={false}>NMC, solid</T>
      <T x={w - M.r} y={y(100) + 20} textAnchor="end">graphite, dashed</T>
      <line x1={x(dN)} x2={x(dN)} y1={y(0)} y2={y(100)} stroke="var(--rule)" strokeDasharray="4 3" />
      <T x={x(dN) + 6} y={M.t - 8}>{`d50 ${dN.toFixed(1)}${THIN}µm`}</T>
    </>
  );
}

function RecGPlot({ G, v, w, h }: { G: number; v: number; w: number; h: number }) {
  const s = simulate(G, v);
  const pts = Array.from({ length: 31 }, (_, i) => {
    const g = 10 + i;
    const r = simulate(g, v);
    return { g, main: r.recoveryMain, total: r.recoveryTotal };
  });
  const lo = Math.floor(Math.min(...pts.map((p) => p.main)) / 10) * 10;
  const hi = Math.ceil(Math.max(...pts.map((p) => p.total)) / 10) * 10;
  const x = lin(10, 40, M.l, w - M.r);
  const y = lin(lo, hi, h - M.b, M.t);
  const yt: number[] = [];
  for (let t = lo; t <= hi; t += 10) yt.push(t);
  const last = pts[pts.length - 1];
  return (
    <>
      <YTicks ticks={yt} sy={y} x={M.l} title="recovery, %" />
      <XTicks ticks={[10, 15, 20, 25, 30, 40]} sx={x} y={h - M.b} title="shredder grid G, mm" w={w} />
      <path d={path(pts.map((p) => [x(p.g), y(p.total)]))} fill="none" stroke="var(--fg-mute)" strokeWidth={1.5} />
      <path d={path(pts.map((p) => [x(p.g), y(p.main)]))} fill="none" stroke="var(--orange)" strokeWidth={3} />
      {GRID_G.map((g) => (
        <circle key={g} cx={x(g)} cy={y(simulate(g, v).recoveryMain)} r={2.5} fill="var(--bg)" stroke="var(--orange)" strokeWidth={1.5} />
      ))}
      <T x={x(last.g)} y={y(last.total) + 18} textAnchor="end">total</T>
      <T x={x(last.g)} y={y(last.main) + 18} textAnchor="end" fill="var(--orange)">main grade</T>
      <circle cx={x(G)} cy={y(s.recoveryMain)} r={8} fill="none" stroke="var(--fg)" strokeWidth={2} />
      <circle cx={x(G)} cy={y(s.recoveryMain)} r={4} fill="var(--orange)" />
    </>
  );
}

function CuPlot({ G, v, w, h }: { G: number; v: number; w: number; h: number }) {
  const s = simulate(G, v);
  const pts = GRID_G.map((g) => ({ g, ...pickCu(g, v) }));
  const sweep = Array.from({ length: 31 }, (_, i) => pickCu(10 + i, v));
  const cut = DATA.screen_cut_study.map((c) => ({ cu: c.cu_wt, rec: c.recovery_main }));
  const all = [...pts.map((p) => p.cu), ...cut.map((c) => c.cu), SPECS.china_draft.cu];
  const xlo = Math.floor(Math.min(...all) * 10) / 10;
  const xhi = Math.ceil(Math.max(...all) * 10) / 10;
  const recs = [...pts.map((p) => p.rec), ...cut.map((c) => c.rec)];
  const ylo = Math.floor(Math.min(...recs) / 10) * 10;
  const yhi = Math.ceil(Math.max(...recs) / 10) * 10;
  const x = lin(xlo, xhi, M.l, w - M.r);
  const y = lin(ylo, yhi, h - M.b, M.t);
  const xt: number[] = [];
  for (let t = xlo; t <= xhi + 1e-9; t += 0.1) xt.push(+t.toFixed(1));
  const yt: number[] = [];
  for (let t = ylo; t <= yhi; t += 10) yt.push(t);
  const lim = SPECS.china_draft.cu;
  const cutMm = DATA.screen_cut_study[0].screen_mm;
  const cutMean = { cu: cut.reduce((a, c) => a + c.cu, 0) / cut.length, rec: cut.reduce((a, c) => a + c.rec, 0) / cut.length };
  return (
    <>
      <YTicks ticks={yt} sy={y} x={M.l} title="main recovery, %" />
      <XTicks ticks={xt} sx={x} y={h - M.b} fmtT={(t) => t.toFixed(1)} title="Cu in product, wt %" w={w} />
      <line x1={x(lim)} x2={x(lim)} y1={y(ylo)} y2={y(yhi)} stroke="var(--rule)" strokeDasharray="4 3" />
      {(() => {
        const txt = `China draft ${lim}, unverified`;
        const over = x(lim) + 6 + txt.length * 7.8 > w;
        return <T x={over ? w - M.r : x(lim) + 6} y={M.t - 8} textAnchor={over ? "end" : "start"}>{txt}</T>;
      })()}
      <path d={path(sweep.map((p) => [x(p.cu), y(p.rec)]))} fill="none" stroke="var(--fg-mute)" strokeWidth={1} />
      {pts.map((p) => (
        <g key={p.g}>
          <circle cx={x(p.cu)} cy={y(p.rec)} r={4} fill="var(--orange)" />
          <T x={x(p.cu) + 9} y={y(p.rec) + 4}>{`${p.g}`}</T>
        </g>
      ))}
      {cut.map((c, i) => (
        <rect key={i} x={x(c.cu) - 4} y={y(c.rec) - 4} width={8} height={8} fill="none" stroke="var(--fg)" strokeWidth={1.5} />
      ))}
      <T x={x(cutMean.cu) - 4} y={y(cutMean.rec) - 14} mute={false}>{`${cutMm} mm cut`}</T>
      <circle cx={x(s.cuWt)} cy={y(s.recoveryMain)} r={8} fill="none" stroke="var(--fg)" strokeWidth={2} />
    </>
  );
}
function pickCu(g: number, v: number) {
  const r = simulate(g, v);
  return { cu: r.cuWt, rec: r.recoveryMain };
}

function VelPlot({ G, v, w, h }: { G: number; v: number; w: number; h: number }) {
  const pts = Array.from({ length: 29 }, (_, i) => {
    const vv = 8 + i * 0.5;
    const r = simulate(G, vv);
    return { v: vv, fan: r.energy.fanKw, bag: r.bagLoadKgH };
  });
  const fanMax = Math.max(...pts.map((p) => p.fan));
  const bagMax = Math.max(...pts.map((p) => p.bag));
  const ft = niceTicks(fanMax, 4);
  const bt = niceTicks(bagMax, 4);
  const x = lin(8, 22, M.l, w - M.r - 24);
  const yf = lin(0, ft[ft.length - 1], h - M.b, M.t);
  const yb = lin(0, bt[bt.length - 1], h - M.b, M.t);
  const xe = w - M.r - 24;
  return (
    <>
      <YTicks ticks={ft} sy={yf} x={M.l} fill="var(--fg)" title="fan, kW" fmtT={(t) => String(t)} />
      <YTicks ticks={bt} sy={yb} x={xe} fill="var(--fg-mute)" side="right" title="bag filter, kg/h" fmtT={(t) => String(t)} />
      <XTicks ticks={[8, 12, 16, 20, 22]} sx={x} y={h - M.b} title="cyclone inlet velocity, m/s" w={w - 24} />
      <path d={path(pts.map((p) => [x(p.v), yf(p.fan)]))} fill="none" stroke="var(--fg)" strokeWidth={2.5} />
      <path d={path(pts.map((p) => [x(p.v), yb(p.bag)]))} fill="none" stroke="var(--fg-mute)" strokeWidth={2} strokeDasharray="5 4" />
      <T x={x(8.5)} y={yf(pts.find((p) => p.v === 9)!.fan) - 12} mute={false}>fan power</T>
      <T x={x(10)} y={yb(pts.find((p) => p.v === 10)!.bag) - 14}>bag filter, dashed</T>
      <line x1={x(v)} x2={x(v)} y1={yf(0)} y2={M.t} stroke="var(--rule)" strokeDasharray="4 3" />
      <T x={x(v) + 6} y={h - M.b - 8}>{`v ${v}`}</T>
    </>
  );
}

export function Evidence({ G, v }: { G: number; v: number }) {
  const s = simulate(G, v);
  const span = Math.ceil(maxVelocitySpanPt() * 100) / 100;
  const hPlot = 300;
  const cell = "hair-r hair-b";
  return (
    <div className="hair-t hair-l grid md:grid-cols-2">
      <PlotCell
        className={cell}
        height={hPlot}
        title="Cyclone grade efficiency, Lapple"
        note={
          <>
            Overall capture at {v}{THIN}m/s: Lapple NMC {s.cyclone.effNmc.toFixed(1)}{THIN}%, Lapple graphite {s.cyclone.effGraphite.toFixed(1)}{THIN}%.
            Aspen, {A.ne_aspen.toFixed(0)} turns and a titanium density proxy: {s.cycloneEffAspen.toFixed(1)}{THIN}%. The curves are the Lapple hand model, not Aspen.
          </>
        }
      >
        {(w, h) => <GradePlot G={G} v={v} w={w} h={h} />}
      </PlotCell>
      <PlotCell
        className={cell}
        height={hPlot}
        title="Recovery against grid"
        note={<>At {v}{THIN}m/s. Dots mark Aspen runs; the line between them is an interpolation between Aspen runs. Grey line: total with second grade. Ring is the current setting.</>}
      >
        {(w, h) => <RecGPlot G={G} v={v} w={w} h={h} />}
      </PlotCell>
      <PlotCell
        className={cell}
        height={hPlot}
        title="Recovery against copper"
        note={
          <>
            One dot per grid G at {v}{THIN}m/s, labelled in mm. Velocity changes this by &lt;{THIN}{span.toFixed(2)}{THIN}pt. The {DATA.screen_cut_study.length} runs with a {DATA.screen_cut_study[0].screen_mm}{THIN}mm screen are squares: they meet the Cu limit at lower recovery. No run in the 36-run sweep meets it. The limit is unverified.
          </>
        }
      >
        {(w, h) => <CuPlot G={G} v={v} w={w} h={h} />}
      </PlotCell>
      <PlotCell
        className={cell}
        height={hPlot}
        title="What velocity trades"
        note={<>At G {G}{THIN}mm. Faster air costs fan power and sends less dust to the bag filter. The bag filter capture of {(DATA.meta.assumptions.bag_filter_eff * 100).toFixed(1)}{THIN}% is assumed.</>}
        table={
          <SrTable
            caption="Fan power and bag-filter load by velocity"
            head={["v m/s", "fan kW", "bag kg/h"]}
            rows={[8, 12, 15, 18, 22].map((vv) => {
              const r = simulate(G, vv);
              return [vv, r.energy.fanKw.toFixed(2), r.bagLoadKgH.toFixed(2)];
            })}
          />
        }
      >
        {(w, h) => <VelPlot G={G} v={v} w={w} h={h} />}
      </PlotCell>
    </div>
  );
}
