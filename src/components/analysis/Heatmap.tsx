"use client";

import { DATA, GRID_G, GRID_V } from "@/lib/model";
import { SrTable, T, useWidth } from "@/components/plot/kit";

export type Field = "recovery_main" | "cyclone_eff_aspen" | "cu_wt" | "kwh";
const PICK: Record<Field, (c: (typeof DATA.cases)[number]) => number> = {
  recovery_main: (c) => c.recovery_main,
  cyclone_eff_aspen: (c) => c.cyclone_eff_aspen,
  cu_wt: (c) => c.cu_wt,
  kwh: (c) => c.energy.kwh_per_t_feed,
};
const CREAM = [236, 230, 218];
const ORANGE = [255, 90, 31];
const CARBON = [13, 14, 12];

const mix = (a: number[], b: number[], t: number) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
const lum = (c: number[]) => {
  const l = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
};

export function Heatmap({
  title,
  unit,
  field,
  digits = 1,
  palette = "carbon",
  note,
  limit,
  limitLabel,
}: {
  title: string;
  unit: string;
  field: Field;
  digits?: number;
  palette?: "orange" | "carbon";
  note?: string;
  limit?: number;
  limitLabel?: string;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const pick = PICK[field];
  const val = (gi: number, vi: number) => pick(DATA.cases.find((x) => x.G === GRID_G[gi] && x.v === GRID_V[vi])!);
  const all = GRID_G.flatMap((_, gi) => GRID_V.map((_, vi) => val(gi, vi)));
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const L = 44;
  const T0 = 26;
  const cell = Math.max(36, Math.min(76, Math.floor((w - L - 4) / GRID_V.length)));
  const mapW = cell * GRID_V.length;
  const mapH = cell * GRID_G.length;
  const H = T0 + mapH + 30;
  const target = palette === "orange" ? ORANGE : CARBON;
  const over = (gi: number, vi: number) => limit !== undefined && val(gi, vi) > limit;
  const anyPass = limit !== undefined && all.some((x) => x <= limit);

  // dashed contour: edges between cells on opposite sides of the limit
  const segs: string[] = [];
  if (limit !== undefined) {
    for (let gi = 0; gi < GRID_G.length; gi++)
      for (let vi = 0; vi < GRID_V.length; vi++) {
        const x = L + vi * cell;
        const y = T0 + gi * cell;
        if (vi + 1 < GRID_V.length && over(gi, vi) !== over(gi, vi + 1)) segs.push(`M${x + cell} ${y}V${y + cell}`);
        if (gi + 1 < GRID_G.length && over(gi, vi) !== over(gi + 1, vi)) segs.push(`M${x} ${y + cell}H${x + cell}`);
      }
  }
  return (
    <figure className="m-0 flex flex-col gap-4 p-4 md:p-8" style={{ background: "var(--bg)" }}>
      <figcaption className="label !text-[var(--fg)]">
        {title}, {unit}
      </figcaption>
      <div ref={ref} className="w-full" style={{ height: w ? H : 300 }}>
        {w > 0 && (
          <svg width={w} height={H} role="img" aria-label={`${title}, ${unit}, by grid and velocity`} style={{ display: "block", overflow: "visible" }}>
            <T x={0} y={14}>G \ v</T>
            {GRID_V.map((v, vi) => (
              <T key={v} x={L + vi * cell + cell / 2} y={14} textAnchor="middle">{v}</T>
            ))}
            {GRID_G.map((g, gi) => (
              <T key={g} x={L - 8} y={T0 + gi * cell + cell / 2 + 4} textAnchor="end">{g}</T>
            ))}
            {GRID_G.map((_, gi) =>
              GRID_V.map((_, vi) => {
                const x = val(gi, vi);
                const t = hi === lo ? 0 : (x - lo) / (hi - lo);
                const fill = mix(CREAM, target, 0.06 + 0.94 * t);
                const dark = lum(fill) < 0.25;
                return (
                  <g key={`${gi}-${vi}`}>
                    <rect
                      x={L + vi * cell + 0.5}
                      y={T0 + gi * cell + 0.5}
                      width={cell - 1}
                      height={cell - 1}
                      fill={`rgb(${fill.join(" ")})`}
                      stroke={palette === "orange" ? "var(--fg)" : "var(--bg)"}
                      strokeWidth={1}
                    />
                    <text
                      x={L + vi * cell + cell / 2}
                      y={T0 + gi * cell + cell / 2 + 4}
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                      fontSize={cell < 50 ? 10 : 12}
                      fill={dark ? "#ece6da" : "#0d0e0c"}
                    >
                      {x.toFixed(digits)}
                    </text>
                  </g>
                );
              }),
            )}
            {limit !== undefined && (
              <>
                {segs.length > 0 && <path d={segs.join("")} fill="none" stroke="var(--fg)" strokeWidth={2} strokeDasharray="5 4" />}
                {!anyPass && (
                  <rect x={L - 3} y={T0 - 3} width={mapW + 6} height={mapH + 6} fill="none" stroke="var(--fg)" strokeWidth={1.5} strokeDasharray="5 4" />
                )}
                <T x={L} y={T0 + mapH + 22} mute={false}>{limitLabel}</T>
              </>
            )}
          </svg>
        )}
      </div>
      {note && <p className="body-s mute m-0">{note}</p>}
      <SrTable
        caption={`${title}, ${unit}`}
        head={["G mm \\ v m/s", ...GRID_V.map(String)]}
        rows={GRID_G.map((g, gi) => [g, ...GRID_V.map((_, vi) => val(gi, vi).toFixed(digits))])}
      />
    </figure>
  );
}
