import type { Metadata } from "next";
import { Economics } from "@/components/economics/Economics";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  title: "Economics",
  description: `Unit economics of ${BRAND.short}: revenue, cost and break-even prices per tonne of dry cell feed.`,
};

const POINTS = [
  {
    k: "Cells are the cost",
    v: "Buying spent cells is about 90 % of every rupee we spend. Power, labour and equipment barely move the result. Whoever buys cells cheapest wins.",
  },
  {
    k: "The extra line pays",
    v: "Recovering clean copper foil is worth about ₹60,000 a tonne on its own. It is what pushes break-even from ₹158 to ₹190 per kg of cells.",
  },
  {
    k: "Purity is money",
    v: "Refiners discount black mass above about 2 % Al + Cu. Our main grade carries about 1.1 %, so the model sells it at full price.",
  },
  {
    k: "EPR could flip it",
    v: "Battery makers buy recycling credits (EPR certificates) from recyclers. TERI values them at ₹112–125 per kg of battery. They are switched off here because it is unclear whether a black-mass-only plant qualifies.",
  },
];

const SOURCES = [
  ["Cell price", "TERI procurement ₹130–151/kg of pack ÷ 0.56 cell share, less housing scrap. Our derivation."],
  ["Black mass", "≈ US$4.5k/t; NMC black mass US$4.0–5.1k/t in 2026 trade reports; payables fell in Q3 2026 (Benchmark)."],
  ["Scrap", "Cu ₹500–620/kg, Al ₹140–160/kg, iron ₹21–25/kg, discounted for residual coating."],
  ["Power", "₹6.79/kWh, MP industrial energy charge FY 2026–27."],
  ["Capex", "Gravita ₹23,300 per annual tonne × 3,000 t ≈ ₹7 cr; +₹2 cr for the oversize line (our estimate)."],
  ["Finance", "12 % cost of capital, 10-year life, 4 % maintenance. Assumed."],
];

export default function EconomicsPage() {
  return (
    <div data-theme="carbon" data-grain>
      <header className="wrap pt-24 pb-16 md:pt-40 md:pb-24">
        <h1 className="display-xl m-0">Unit economics.</h1>
        <div className="grid12 mt-12 md:mt-16">
          <p className="body col-span-4 md:col-span-5">
            Per tonne of dry cell feed. Move the two prices and watch the margin. Prices are the weakest inputs here;
            the break-even prices hold up wherever the market lands next month.
          </p>
        </div>
      </header>

      <Economics />

      <section data-theme="paper" className="bg-[var(--bg)] text-[var(--fg)]">
        <div className="wrap space-giant">
          <h2 className="display-l m-0">What it means.</h2>
          <ul className="m-0 mt-16 grid list-none grid-cols-1 gap-x-[var(--gutter)] p-0 md:grid-cols-4">
            {POINTS.map((pt) => (
              <li key={pt.k} className="ticket pt-4 pb-10">
                <h3 className="heading m-0">{pt.k}</h3>
                <p className="body mt-4">{pt.v}</p>
              </li>
            ))}
          </ul>

          <div className="mt-16 md:mt-24">
            <p className="label mb-4">Sources and assumptions</p>
            <dl className="m-0">
              {SOURCES.map(([k, v]) => (
                <div key={k} className="hair-t grid12 py-3">
                  <dt className="label col-span-4 md:col-span-3">{k}</dt>
                  <dd className="body-s col-span-4 m-0 md:col-span-9">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
