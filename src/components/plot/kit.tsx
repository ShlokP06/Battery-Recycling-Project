"use client";

import { useEffect, useRef, useState } from "react";

/** Width of an element in px, 0 until measured. */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.round(el.getBoundingClientRect().width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export const lin = (d0: number, d1: number, r0: number, r1: number) => (x: number) => r0 + ((x - d0) / (d1 - d0)) * (r1 - r0);
export const logs = (d0: number, d1: number, r0: number, r1: number) => {
  const a = Math.log10(d0);
  const b = Math.log10(d1);
  return (x: number) => r0 + ((Math.log10(x) - a) / (b - a)) * (r1 - r0);
};
export const path = (pts: [number, number][]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");

export const MONO = "var(--font-mono)";

/** Uppercase for labels, but keep unit case (µm, mm, kg/h, kW, m/s) so "µm" never reads as "MM". */
export function up(s: string): string {
  return s
    .split("µ")
    .map((x) => x.toUpperCase())
    .join("µ")
    .replace(/µM/g, "µm")
    .replace(/\b(KG\/H|KWH\/T|KW|M\/S|MM|PA|WT)\b/g, (m) => (m === "KW" ? "kW" : m === "KWH/T" ? "kWh/t" : m.toLowerCase()));
}

/** 11px mono label used inside SVG plots. */
export function T(props: React.SVGProps<SVGTextElement> & { mute?: boolean; fill?: string }) {
  const { mute = true, fill, children, ...rest } = props;
  const kids = typeof children === "string" ? up(children) : Array.isArray(children) ? children.map((c) => (typeof c === "string" ? up(c) : c)) : children;
  return (
    <text
      fontFamily={MONO}
      fontSize={11}
      letterSpacing="0.1em"
      fill={fill ?? (mute ? "var(--fg-mute)" : "var(--fg)")}
      {...rest}
    >
      {kids}
    </text>
  );
}

/** Frame for one plot: label, svg area, caption. Children get the pixel width. */
export function PlotCell({
  title,
  note,
  height = 300,
  className = "",
  children,
  table,
}: {
  title: string;
  note?: React.ReactNode;
  height?: number;
  className?: string;
  children: (w: number, h: number) => React.ReactNode;
  table?: React.ReactNode;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  return (
    <figure className={`m-0 flex flex-col gap-4 p-4 md:p-8 ${className}`}>
      <figcaption className="label !text-[var(--fg)]">{title}</figcaption>
      <div ref={ref} style={{ height }} className="w-full">
        {w > 0 && (
          <svg width={w} height={height} role="img" aria-label={title} style={{ display: "block", overflow: "visible" }}>
            {children(w, height)}
          </svg>
        )}
      </div>
      {note && <figcaption className="body-s mute">{note}</figcaption>}
      {table}
    </figure>
  );
}

/** Visually hidden data table for screen readers. */
export function SrTable({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="sr-only-live">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
