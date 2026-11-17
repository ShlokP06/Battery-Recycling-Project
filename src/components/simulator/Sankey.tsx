"use client";

import type { Flow } from "@/lib/derived";
import { THIN } from "@/lib/derived";
import { useTween } from "@/lib/useTween";
import { SrTable, T, useWidth } from "@/components/plot/kit";

const n1 = (x: number) => x.toFixed(1);

type Pt = (a: number, b: number) => [number, number];

/** Ribbon between two bands. Along-axis a0->a1, across-axis [b0,b1] -> [c0,c1]. */
function ribbon(pt: Pt, a0: number, b0: number, b1: number, a1: number, c0: number, c1: number) {
  const m = (a0 + a1) / 2;
  const p = (a: number, b: number) => pt(a, b).map((n) => n.toFixed(1)).join(" ");
  return `M${p(a0, b0)}C${p(m, b0)} ${p(m, c0)} ${p(a1, c0)}L${p(a1, c1)}C${p(m, c1)} ${p(m, b1)} ${p(a0, b1)}Z`;
}
function rectP(pt: Pt, a: number, th: number, b0: number, b1: number) {
  const p = (x: number, y: number) => pt(x, y).map((n) => n.toFixed(1)).join(" ");
  return `M${p(a, b0)}L${p(a + th, b0)}L${p(a + th, b1)}L${p(a, b1)}Z`;
}

export function Sankey({ flow }: { flow: Flow }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [main, second, lost] = useTween([flow.main, flow.second, flow.lost]);
  const horizontal = w >= 640;
  const foil = flow.foilCasing;
  const bm = flow.blackMass;

  let svg: React.ReactNode = null;
  let height = 0;

  if (w > 0) {
    const TH = 8;
    const labelLines = (x: number, yc: number, name: string, val: string, extra?: string, anchorTop = false, extra2?: string) => {
      const n = extra2 ? 4 : extra ? 3 : 2;
      const y0 = anchorTop ? yc : yc - ((n - 1) * 15) / 2;
      return (
        <g>
          <T x={x} y={y0 + 4} mute={false}>{name}</T>
          <text x={x} y={y0 + 19} fontFamily="var(--font-mono)" fontSize={w < 400 ? 12 : 13} fill="var(--fg)">{val}</text>
          {extra && <text x={x} y={y0 + 34} fontFamily="var(--font-mono)" fontSize={11} fill="var(--fg-mute)">{extra}</text>}
          {extra2 && <text x={x} y={y0 + 49} fontFamily="var(--font-mono)" fontSize={11} fill="var(--fg-mute)">{extra2}</text>}
        </g>
      );
    };

    if (horizontal) {
      const top = 28;
      const H = 252;
      const k = (H - 24 - 30 - 24) / flow.feed;
      const foilH = foil * k;
      const bmH = bm * k;
      const y1 = top + foilH + 30;
      const a0 = 0;
      const a1 = w * 0.34;
      const a2 = w * 0.66;
      const feedH = flow.feed * k;
      // col2 stack, top aligned with BM
      const mY = y1;
      const sY = mY + main * k + 12;
      const lY = sY + second * k + 12;
      // BM source segments
      const bY0 = y1;
      const bY1 = bY0 + main * k;
      const bY2 = bY1 + second * k;
      const bY3 = bY2 + lost * k;
      height = lY + lost * k + 8;
      const pt: Pt = (a, b) => [a, b];
      // collision-free label centres
      const cs = [mY + (main * k) / 2, sY + (second * k) / 2, lY + (lost * k) / 2];
      for (let i = 1; i < 3; i++) if (cs[i] < cs[i - 1] + 50) cs[i] = cs[i - 1] + 50;
      svg = (
        <>
          <T x={0} y={14} mute={false}>Feed</T>
          <text x={52} y={14} fontFamily="var(--font-mono)" fontSize={13} fill="var(--fg)">{n1(flow.feed)}{THIN}kg/h</text>
          {/* feed -> foil (hollow) */}
          <path d={ribbon(pt, a0 + TH, top, top + foilH, a1, top, top + foilH)} fill="none" stroke="var(--rule)" strokeWidth={1} />
          {/* feed -> black mass */}
          <path d={ribbon(pt, a0 + TH, top + foilH, top + feedH, a1, y1, y1 + bmH)} fill="var(--fg)" fillOpacity={0.16} />
          {/* black mass -> outputs */}
          <path d={ribbon(pt, a1 + TH, bY0, bY1, a2, mY, mY + main * k)} fill="var(--orange)" />
          <path d={ribbon(pt, a1 + TH, bY1, bY2, a2, sY, sY + second * k)} fill="var(--orange)" fillOpacity={0.3} stroke="var(--orange)" strokeWidth={1} />
          <path d={ribbon(pt, a1 + TH, bY2, bY3, a2, lY, lY + lost * k)} fill="url(#sk-hatch)" stroke="var(--lost)" strokeWidth={1} />
          {/* nodes */}
          <path d={rectP(pt, a0, TH, top, top + feedH)} fill="var(--fg)" />
          <path d={rectP(pt, a1, TH, top, top + foilH)} fill="none" stroke="var(--rule)" />
          <path d={rectP(pt, a1, TH, y1, y1 + bmH)} fill="var(--fg)" />
          <path d={rectP(pt, a2, TH, mY, mY + main * k)} fill="var(--orange)" />
          <path d={rectP(pt, a2, TH, sY, sY + second * k)} fill="var(--orange)" fillOpacity={0.3} stroke="var(--orange)" />
          <path d={rectP(pt, a2, TH, lY, lY + lost * k)} fill="url(#sk-hatch)" stroke="var(--lost)" />
          {/* labels */}
          {labelLines(a1 + 22, top + foilH / 2, "Foil and casing", `${n1(foil)}${THIN}kg/h`, "feed minus black mass")}
          <T x={a1 + 22} y={y1 - 11} mute={false}>Black mass</T>
          <text x={a1 + 22 + 100} y={y1 - 11} fontFamily="var(--font-mono)" fontSize={13} fill="var(--fg)">{n1(bm)}{THIN}kg/h</text>
          {labelLines(a2 + 24, cs[0], "Main grade, black mass only", `${n1(main)}${THIN}kg/h`, `${n1((100 * main) / bm)}${THIN}% of black mass`)}
          {labelLines(a2 + 24, cs[1], "Second grade", `${n1(second)}${THIN}kg/h`, `${n1((100 * second) / bm)}${THIN}% of black mass`)}
          {labelLines(a2 + 24, cs[2], "Lost", `${n1(lost)}${THIN}kg/h`, `${n1((100 * lost) / bm)}${THIN}% of black mass`)}
        </>
      );
    } else {
      // vertical: along = y, across = x
      const E = Math.min(190, w * 0.52);
      const k = (E - 16) / flow.feed;
      const feedW = flow.feed * k;
      const bmW = bm * k;
      const foilW = foil * k;
      const yf = 30;
      const y1 = 108;
      const y2 = 196;
      const pt: Pt = (a, b) => [b, a];
      const mX = 0;
      const sX = main * k + 8;
      const lX = sX + second * k + 8;
      const bX0 = 0;
      const bX1 = main * k;
      const bX2 = bX1 + second * k;
      const bX3 = bX2 + lost * k;
      const XL = E + 18;
      const rowY = (j: number) => y2 + TH + 26 + j * 56;
      height = rowY(2) + 44;
      const bands = [
        { key: "lost", x: lX + (lost * k) / 2, row: 0 },
        { key: "second", x: sX + (second * k) / 2, row: 1 },
        { key: "main", x: mX + (main * k) / 2, row: 2 },
      ];
      svg = (
        <>
          <T x={0} y={14} mute={false}>Feed</T>
          <text x={52} y={14} fontFamily="var(--font-mono)" fontSize={12} fill="var(--fg)">{n1(flow.feed)}{THIN}kg/h</text>
          <path d={ribbon(pt, yf + TH, 0, bmW, y1, 0, bmW)} fill="var(--fg)" fillOpacity={0.16} />
          <path d={ribbon(pt, yf + TH, bmW, feedW, y1, bmW + 16, bmW + 16 + foilW)} fill="none" stroke="var(--rule)" />
          <path d={ribbon(pt, y1 + TH, bX0, bX1, y2, mX, mX + main * k)} fill="var(--orange)" />
          <path d={ribbon(pt, y1 + TH, bX1, bX2, y2, sX, sX + second * k)} fill="var(--orange)" fillOpacity={0.3} stroke="var(--orange)" />
          <path d={ribbon(pt, y1 + TH, bX2, bX3, y2, lX, lX + lost * k)} fill="url(#sk-hatch)" stroke="var(--lost)" />
          <path d={rectP(pt, yf, TH, 0, feedW)} fill="var(--fg)" />
          <path d={rectP(pt, y1, TH, 0, bmW)} fill="var(--fg)" />
          <path d={rectP(pt, y1, TH, bmW + 16, bmW + 16 + foilW)} fill="none" stroke="var(--rule)" />
          <path d={rectP(pt, y2, TH, mX, mX + main * k)} fill="var(--orange)" />
          <path d={rectP(pt, y2, TH, sX, sX + second * k)} fill="var(--orange)" fillOpacity={0.3} stroke="var(--orange)" />
          <path d={rectP(pt, y2, TH, lX, lX + lost * k)} fill="url(#sk-hatch)" stroke="var(--lost)" />
          {labelLines(XL, y1 + 20, "Foil and casing", `${n1(foil)}${THIN}kg/h`)}
          {labelLines(XL, y1 + 62, "Black mass", `${n1(bm)}${THIN}kg/h`)}
          {bands.map((b) => {
            const y = rowY(b.row);
            return <path key={b.key} d={`M${b.x.toFixed(1)} ${y2 + TH}V${y}H${XL - 6}`} fill="none" stroke="var(--rule)" strokeWidth={1} />;
          })}
          {labelLines(XL, rowY(0), "Lost", `${n1(lost)}${THIN}kg/h`, `${n1((100 * lost) / bm)}${THIN}%`)}
          {labelLines(XL, rowY(1), "Second grade", `${n1(second)}${THIN}kg/h`, `${n1((100 * second) / bm)}${THIN}%`)}
          {labelLines(XL, rowY(2), "Main grade", `${n1(main)}${THIN}kg/h`, `${n1((100 * main) / bm)}${THIN}%`, false, "black mass only")}
        </>
      );
    }
  }

  return (
    <div>
      <p className="body-s m-0 mb-4 mute">
        {n1(flow.feed)}{THIN}kg/h in. Here is where it goes. Main grade is black mass only; the product stream is {n1(flow.productKgH)}{THIN}kg/h
        because it also carries Al and Cu.
      </p>
      <div ref={ref} className="w-full" style={{ minHeight: height || 250 }}>
        {w > 0 && (
          <svg width={w} height={height} role="img" aria-label={`Sankey of ${n1(flow.feed)} kilograms per hour feed`} style={{ display: "block", overflow: "visible" }}>
            <defs>
              <pattern id="sk-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="5" stroke="var(--lost)" strokeWidth="1" />
              </pattern>
            </defs>
            {svg}
          </svg>
        )}
      </div>
      <SrTable
        caption="Mass flow in kilograms per hour"
        head={["Stream", "kg/h"]}
        rows={[
          ["Feed", n1(flow.feed)],
          ["Foil and casing", n1(foil)],
          ["Black mass", n1(bm)],
          ["Main grade, black mass only", n1(flow.main)],
          ["Second grade", n1(flow.second)],
          ["Lost", n1(flow.lost)],
        ]}
      />
    </div>
  );
}
