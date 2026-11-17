import type { Metadata } from "next";
import { Flowsheet } from "@/components/analysis/Flowsheet";
import { Heatmap } from "@/components/analysis/Heatmap";
import { AnalysisCharts } from "@/components/analysis/AnalysisCharts";
import { DATA, GRID_G, GRID_V, SPECS } from "@/lib/model";
import { BM_FEED_KG_H, FEED_KG_H, RUN_COUNT, SCREEN_CUT_COUNT, THIN } from "@/lib/derived";
import { AssumptionsGrid } from "@/components/AssumptionsGrid";

export const metadata: Metadata = {
  title: "Analysis",
  description: `The Aspen-modelled ${RUN_COUNT}-run sweep behind every number on this site: flowsheet, heatmaps and assumptions.`,
};

const gr = (a: number[]) => `${a[0]} to ${a[a.length - 1]}`;

export default function AnalysisPage() {
  const cut = DATA.screen_cut_study[0].screen_mm;
  return (
    <div data-theme="paper" className="graph-paper">
      <div className="relative">
        {/* header */}
        <header className="wrap space-giant">
          <p className="label m-0 mb-6 !text-[var(--fg)]">Aspen-modelled</p>
          <h1 className="display-xl m-0">
            {RUN_COUNT}-run
            <br className="md:hidden" /> sweep.
          </h1>
          <div className="grid12 mt-12 md:mt-16">
            <p className="body col-span-4 md:col-span-4">
              Shredder grid {gr(GRID_G)}{THIN}mm by cyclone inlet velocity {gr(GRID_V)}{THIN}m/s, run in Aspen Plus V14. Every number on this site is one of
              these runs, an interpolation between them, or a hand calculation. Assumptions are listed below and assumed values are marked.
            </p>
            <p className="body col-span-4 mt-4 md:col-span-4 md:col-start-6 md:mt-0">
              {SCREEN_CUT_COUNT} extra runs with a {cut}{THIN}mm screen are a separate study and are not part of the sweep.
            </p>
          </div>
        </header>

        {/* flowsheet */}
        <section className="wrap pb-24 md:pb-40" aria-labelledby="flow-h">
          <h2 id="flow-h" className="label m-0 border-t border-[var(--rule)] pb-8 pt-4 !text-[var(--fg)]">
            Flowsheet
          </h2>
          <div style={{ background: "var(--bg)" }} className="p-4 md:p-8">
            <Flowsheet />
          </div>
          <p className="body-s mute mt-6">
            Dashed boxes leave the plant as by-products. {FEED_KG_H.toFixed(1)}{THIN}kg/h of dried cells in, of which{" "}
            {BM_FEED_KG_H.toFixed(1)}{THIN}kg/h is black mass (NMC and graphite with binder). Orange marks the two black-mass products.
          </p>
        </section>

        {/* heatmaps */}
        <section className="wrap pb-24 md:pb-40" aria-labelledby="maps-h">
          <h2 id="maps-h" className="label m-0 border-t border-[var(--rule)] pb-8 pt-4 !text-[var(--fg)]">
            Sweep results
          </h2>
          <div className="hair-t hair-l grid md:grid-cols-2">
            <div className="hair-r hair-b">
              <Heatmap
                title="Main-grade recovery"
                unit="%"
                palette="orange"
                field="recovery_main"
                note="How much of the black mass ends up in the main product. A finer shredder grid frees more coating from the foil, so recovery climbs from 55 % to 72 %. Air speed barely changes it."
              />
            </div>
            <div className="hair-r hair-b">
              <Heatmap
                title="Cyclone capture, Aspen"
                unit="%"
                digits={2}
                field="cyclone_eff_aspen"
                note="Share of the powder the cyclone catches, from Aspen's cyclone model. Faster inlet air spins particles harder, so capture rises from 91 % to 96 %. The shredder grid hardly matters here."
              />
            </div>
            <div className="hair-r hair-b">
              <Heatmap
                title="Cu in product"
                unit="wt %"
                digits={2}
                limit={SPECS.china_draft.cu}
                limitLabel={`China draft Cu ${SPECS.china_draft.cu}: no run meets it, unverified`}
                field="cu_wt"
                note={`Copper foil that sneaks into the product. A finer grid chops foil small enough to pass the screen, so copper rises. No run meets the ${SPECS.china_draft.cu} wt % China draft limit (unverified); a ${cut} mm screen does, at lower recovery.`}
              />
            </div>
            <div className="hair-r hair-b">
              <Heatmap
                title="Total energy"
                unit="kWh/t feed"
                digits={2}
                field="kwh"
                note="Power per tonne of feed, shredder plus fan. Faster air needs a much bigger fan; a finer grid needs a little more shredding."
              />
            </div>
          </div>
          <div className="mt-16 md:mt-24">
            <AnalysisCharts />
          </div>
        </section>

        {/* assumptions */}
        <section className="wrap pb-24 md:pb-40" aria-label="Assumptions">
          <AssumptionsGrid intro="What the model takes as given. Fitted, assumed and unverified items are marked." />
        </section>
      </div>
    </div>
  );
}
