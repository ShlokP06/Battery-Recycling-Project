"use client";

import { useState } from "react";
import { DEFAULT_PRICES, ECON_META, PRODUCT_PRICES, economics, inr, type Prices } from "@/lib/economics";

const THIN = " ";
const cr = (x: number) => `${x < 0 ? "\u2212" : ""}₹${THIN}${Math.abs(x).toFixed(2)} cr`;

function PriceSlider(props: {
  id: string;
  label: string;
  note: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const { id, label, note, value, min, max, step, onChange } = props;
  return (
    <div className="hair-t pt-5">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="label !text-[var(--fg)]">
          {label}
        </label>
        <div className="display-s whitespace-nowrap">
          ₹{value}
          <span className="label ml-2" style={{ textTransform: "none" }}>/kg</span>
        </div>
      </div>
      <input
        id={id}
        className="k-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`₹${value} per kg`}
        aria-describedby={`${id}-note`}
      />
      <div className="tick flex justify-between text-mute" aria-hidden>
        <span>₹{min}</span>
        <span>₹{max}</span>
      </div>
      <p id={`${id}-note`} className="body-s mt-3 text-mute">
        {note}
      </p>
    </div>
  );
}

export function Economics() {
  const [p, setP] = useState<Prices>(DEFAULT_PRICES);
  const ext = economics("extended", p);

  const rows: { k: string; e: string; strong?: boolean }[] = [
    { k: "Black mass sold", e: `${inr(ext.bmKgPerT)} kg` },
    { k: "Black mass revenue", e: inr(ext.bmRevenue) },
    { k: "Copper, aluminium foil and casing", e: inr(ext.coRevenue) },
    { k: "Total revenue", e: inr(ext.revenue), strong: true },
    { k: "Buying the cells", e: `−${inr(ext.feedCost)}` },
    { k: "Running costs", e: `−${inr(ext.opex)}` },
    { k: "Capital charge", e: `−${inr(ext.capital)}` },
    { k: "Margin", e: inr(ext.margin), strong: true },
    { k: "Per year", e: cr(ext.annualMarginCr) },
  ];

  const mkt = { core: economics("core", DEFAULT_PRICES), ext: economics("extended", DEFAULT_PRICES) };

  return (
    <>
      {/* giant: break-even vs market */}
      <section className="wrap pb-16 md:pb-24">
        <div className="grid12 items-end gap-y-10">
          <div className="col-span-4 md:col-span-5">
            <p className="label mb-4">Break-even cell price</p>
            <p className="display-num m-0 whitespace-nowrap" style={{ fontSize: "clamp(96px, 12vw, 200px)" }}>
              ₹{Math.round(mkt.ext.breakEvenCell)}
              <span style={{ fontSize: "0.3em" }}>{THIN}/kg</span>
            </p>
          </div>
          <div className="col-span-4 md:col-span-3">
            <p className="label mb-4">Market today</p>
            <p className="m-0 whitespace-nowrap font-display font-black uppercase leading-[0.8] text-mute [font-stretch:62%]" style={{ fontSize: "clamp(64px, 7vw, 120px)" }}>
              ≈₹{DEFAULT_PRICES.cell}
              <span style={{ fontSize: "0.35em" }}>{THIN}/kg</span>
            </p>
          </div>
          <div className="col-span-4 md:col-span-4">
            <p className="label mb-3 !text-[var(--fg)]">Feasible? Not yet, but close.</p>
            <p className="ticket body m-0 pt-4">
              We buy cells at about ₹{DEFAULT_PRICES.cell}/kg today and lose ₹{inr(Math.abs(mkt.ext.margin))} per tonne of feed.
              At ₹{Math.round(mkt.ext.breakEvenCell)}/kg or less we break even. It turns profitable if any one of these holds: cells bought ₹
              {Math.round(DEFAULT_PRICES.cell - mkt.ext.breakEvenCell)}/kg cheaper, black mass sold at ₹
              {Math.round(mkt.ext.breakEvenBlackMass)}/kg instead of ₹{DEFAULT_PRICES.blackMass}, or EPR credits counted.
            </p>
          </div>
        </div>
      </section>

      {/* controls + table */}
      <section className="wrap pb-24 md:pb-40">
        <div className="grid12 gap-y-12">
          <div className="col-span-4 flex flex-col gap-8 md:col-span-4">
            <PriceSlider
              id="cell-price"
              label="Spent cell price"
              note="What we pay for dismantled cells. About 90 % of all cost, so this decides everything."
              value={p.cell}
              min={120}
              max={260}
              step={5}
              onChange={(cell) => setP((q) => ({ ...q, cell }))}
            />
            <PriceSlider
              id="bm-price"
              label="Black mass price"
              note="What refiners pay us. NMC black mass traded near US$4.0–5.1k/t in 2026; payables fell in Q3."
              value={p.blackMass}
              min={250}
              max={600}
              step={10}
              onChange={(blackMass) => setP((q) => ({ ...q, blackMass }))}
            />
            <button
              type="button"
              onClick={() => setP(DEFAULT_PRICES)}
              className="label self-start border border-[var(--fg)] px-4 py-3 transition-colors duration-[160ms] hover:bg-[var(--fg)] hover:text-[var(--bg)]"
            >
              Reset to today&apos;s prices
            </button>
          </div>

          <div className="col-span-4 md:col-span-7 md:col-start-6">
            <p className="label mb-4">
              ₹ per tonne of dry cell feed · at your prices we {ext.margin >= 0 ? "makes" : "loses"} ₹
              {inr(Math.abs(ext.margin))}/t
            </p>
            <table className="data w-full border-collapse tabular-nums">
              <thead>
                <tr className="hair-b">
                  <th className="label py-3 text-left font-normal" scope="col">
                    Item
                  </th>
                  <th className="label py-3 text-right font-normal" scope="col">
                    ₹ per tonne
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.k} className={r.strong ? "border-y border-[var(--fg)]" : "hair-b"}>
                    <th scope="row" className={`py-3 pr-4 text-left font-normal ${r.strong ? "!text-[var(--fg)]" : "text-mute"}`}>
                      {r.k}
                    </th>
                    <td className={`py-3 text-right ${r.strong ? "font-bold" : ""}`}>{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="body-s mt-5 text-mute">
              Includes an oversize line that recovers clean copper and aluminium foil (₹{PRODUCT_PRICES.cuFoil} and ₹
              {PRODUCT_PRICES.alFoil}/kg) and steel casing; its 76 % recovery is an estimate, not an Aspen run. Without that line
              (the Aspen flowsheet alone) break-even drops to ₹{Math.round(mkt.core.breakEvenCell)}/kg. {ECON_META.feedKgH}
              {THIN}kg/h, {inr(ECON_META.hours)}{THIN}h a year, {inr(ECON_META.annualT)}{THIN}t a year.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
