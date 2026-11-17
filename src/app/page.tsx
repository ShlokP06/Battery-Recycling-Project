import type { Metadata } from "next";
import Link from "next/link";
import { FrameHero } from "@/components/hero/FrameHero";
import { Process, type Stage } from "@/components/home/Process";
import { A, SPECS, passes, simulate } from "@/lib/model";
import { BM_FEED_KG_H, FEED_KG_H, RUN_WORDS, THIN, fmt } from "@/lib/derived";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  title: { absolute: `${BRAND.name}. Black mass from Li-ion batteries, no acid, no furnace` },
  description: `${BRAND.description} Aspen-modelled, student project.`,
};


export default function Home() {
  const base = simulate(20, 15);
  const spec = passes(base.alWt, base.cuWt);

  const stages: Stage[] = [
    {
      word: "Shred",
      spec: `${base.G}${THIN}mm grid · ${fmt(base.energy.shredderKwhPerT)}${THIN}kWh/t, fitted`,
      body: "Frees the coating from the foil. A finer grid frees more and costs more.",
    },
    {
      word: "Screen",
      spec: `${A.screen_cut_mm}${THIN}mm cut`,
      body: "Powder under, foil over. The main recovery and purity lever.",
    },
    {
      word: "Classify",
      spec: "Air classifier",
      body: "Density sorts casing and separator out of the oversize.",
    },
    {
      word: "Capture",
      spec: `Cyclone, then bag filter · ${(A.bag_filter_eff * 100).toFixed(1)}${THIN}% assumed`,
      body: "Fines ride the air. Inlet velocity trades pressure drop against dust to the filter.",
    },
    {
      word: "Ship",
      spec: `Main ${fmt(base.bmProductKgH)}${THIN}kg/h · second ${fmt(base.bm2KgH)}${THIN}kg/h`,
      body: `Al ${fmt(base.alWt, 2)}${THIN}wt${THIN}%, Cu ${fmt(base.cuWt, 2)}${THIN}wt${THIN}%.${
        spec.china ? "" : ` Cu is over the ${SPECS.china_draft.cu} China draft limit (unverified).`
      }`,
    },
  ];

  const kpis = [
    { v: fmt(FEED_KG_H), u: "kg/h", l: "Feed, dismantled cells" },
    { v: fmt(base.energy.kwhPerTFeed), u: "kWh/t", l: "Shredder and fan" },
    { v: fmt(base.recoveryMain), u: "%", l: "Main-grade recovery" },
  ];

  return (
    <>
      {/* HERO SLOT: replaced by frame-scrub hero */}
      <section data-theme="carbon" aria-label="Hero">
        <FrameHero
          main={base.recoveryMain}
          total={base.recoveryTotal}
          second={(100 * base.bm2KgH) / BM_FEED_KG_H}
          lost={(100 * Math.max(0, BM_FEED_KG_H - base.bmProductKgH - base.bm2KgH)) / BM_FEED_KG_H}
          energy={base.energy.kwhPerTFeed}
        />
      </section>

      {/* interlude */}
      <section data-theme="paper" className="flex min-h-svh flex-col justify-between">
        <div className="wrap grid12 w-full flex-1 content-center py-24 md:py-40">
          <div className="col-span-4 md:col-span-10">
            <h2 className="display-l m-0">
              No acid.
              <br />
              No furnace.
            </h2>
          </div>
        </div>
        <div className="wrap w-full pb-12 md:pb-16">
          <dl className="m-0 grid grid-cols-1 border-t border-[var(--rule)] md:grid-cols-3">
            {kpis.map((k, i) => (
              <div
                key={k.l}
                className={`py-6 md:py-8 ${i > 0 ? "border-t border-[var(--rule)] md:border-l md:border-t-0 md:pl-6" : ""}`}
              >
                <dd className="display-s m-0">
                  {k.v}
                  <span className="label ml-2" style={{ textTransform: "none" }}>{k.u}</span>
                </dd>
                <dt className="label mt-2">{k.l}</dt>
              </div>
            ))}
          </dl>
          <p className="label m-0 mt-2" style={{ textTransform: "none" }}>{`Base case, ${base.G}${THIN}mm grid, ${base.v}${THIN}m/s. Aspen-modelled.`}</p>
        </div>
      </section>

      <Process stages={stages} />

      {/* call to action */}
      <section data-theme="carbon" data-grain className="relative flex min-h-[80svh] items-center">
        <div className="wrap grid12 w-full py-24 md:py-40">
          <div className="col-span-4 md:col-span-10">
            <h2 className="display-l m-0">Run it yourself.</h2>
          </div>
          <div className="col-span-4 mt-10 md:col-span-4 md:mt-16">
            <p className="body m-0">
              Two dials, {RUN_WORDS} Aspen runs, one number.
            </p>
            <Link href="/simulator" className="btn mt-8 w-full justify-center md:w-auto">
              Open the simulator
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
