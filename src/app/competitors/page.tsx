import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { simulate } from "@/lib/model";
import { COMPANIES } from "@/data/competitors";
import { THIN, flows, fmt } from "@/lib/derived";

export const metadata: Metadata = {
  title: "Landscape",
  description:
    "Pyrometallurgy burns black mass, hydrometallurgy dissolves it, Kaala sieves it. Where dry mechanical recovery fits next to smelters and leach plants.",
};

type Route = { name: string; ex: string; us?: boolean; cells: [string, string][] };

export default function Competitors() {
  const base = simulate(20, 15);
  const fl = flows(20, 15);

  const routes: Route[] = [
    {
      name: "Pyro",
      ex: "Smelting",
      cells: [
        ["Condition", "Furnace, above 1000 °C"],
        ["Recovers", "Co, Ni, Cu as alloy"],
        ["Loses", "Li, Al, graphite to slag"],
      ],
    },
    {
      name: "Hydro",
      ex: "Leaching",
      cells: [
        ["Condition", "Acid leach, below 100 °C"],
        ["Recovers", "Li, Ni, Co, Mn salts"],
        ["Loses", "Graphite; Al unless recovered"],
      ],
    },
    {
      name: BRAND.short.toUpperCase(),
      ex: "This project",
      us: true,
      cells: [
        ["Condition", `Ambient, dry, ${fmt(base.energy.kwhPerTFeed)}${THIN}kWh/t`],
        ["Recovers", `Black mass: ${fmt(fl.mainPct)}${THIN}% main grade, ${fmt(fl.mainPct + fl.secondPct)}${THIN}% with second`],
        ["Loses", `${fmt(fl.lostPct)}${THIN}% of black mass; recovers no metals itself`],
      ],
    },
  ];
  const rowLabels = routes[0].cells.map((c) => c[0]);

  return (
    <div data-theme="paper">
      <header className="wrap space-giant">
        <h1 className="display-xl m-0" style={{ fontSize: undefined }}>
          <span className="statement block">Pyro burns it.</span>
          <span className="statement block">Hydro dissolves it.</span>
          <span className="statement block">
            We{" "}
            <span style={{ display: "inline-block", borderBottom: "3px solid var(--fg)", paddingBottom: "0.02em", lineHeight: 0.8 }}>sieve</span> it
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: "0.16em",
                height: "0.16em",
                marginLeft: "0.06em",
                borderRadius: "50%",
                background: "var(--orange)",
                border: "1px solid var(--fg)",
                boxSizing: "border-box",
              }}
            />
          </span>
        </h1>
      </header>

      <section className="wrap pb-24 md:pb-40" aria-labelledby="cmp-h">
        <h2 id="cmp-h" className="label m-0 border-t border-[var(--rule)] pb-8 pt-4 !text-[var(--fg)]">
          Three ways to recycle a battery
        </h2>

        {/* desktop table */}
        <div className="hidden md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="w-[14%] pb-4" />
                {routes.map((r) => (
                  <th
                    key={r.name}
                    scope="col"
                    className="align-bottom"
                    style={r.us ? { background: "var(--fg)", color: "var(--bg)", padding: "16px" } : { padding: "0 16px 16px 16px" }}
                  >
                    <div className="heading flex items-center gap-3">
                      {r.us && <span aria-hidden style={{ width: 8, height: 8, background: "var(--orange)", display: "inline-block" }} />}
                      <span className="label" style={{ color: r.us ? "var(--bg)" : "var(--fg)", fontSize: 13 }}>
                        {r.name}
                      </span>
                    </div>
                    <div className="label mt-2" style={{ color: r.us ? "var(--bg)" : undefined }}>
                      {r.ex}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowLabels.map((label, ri) => (
                <tr key={label} className="border-t border-[var(--rule)]">
                  <th scope="row" className="label py-4 pr-4 text-left align-top !text-[var(--fg)]">
                    {label}
                  </th>
                  {routes.map((r) => (
                    <td key={r.name} className="data px-4 py-4 align-top" style={r.us ? { borderLeft: "1px solid var(--fg)", borderRight: "1px solid var(--fg)", borderBottom: ri === rowLabels.length - 1 ? "1px solid var(--fg)" : undefined } : undefined}>
                      {r.cells[ri][1]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* mobile blocks */}
        <div className="md:hidden">
          {routes.map((r) => (
            <section key={r.name} className="border-t border-[var(--rule)] py-6" aria-label={r.name}>
              <div
                className="mb-4 flex items-center gap-3"
                style={r.us ? { background: "var(--fg)", color: "var(--bg)", padding: "10px 12px" } : undefined}
              >
                {r.us && <span aria-hidden style={{ width: 8, height: 8, background: "var(--orange)", display: "inline-block" }} />}
                <h3 className="heading m-0">{r.name}</h3>
                <span className="label ml-auto" style={r.us ? { color: "var(--bg)" } : undefined}>
                  {r.ex}
                </span>
              </div>
              <dl className="m-0">
                {r.cells.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[88px_1fr] gap-3 py-2">
                    <dt className="label">{k}</dt>
                    <dd className="data m-0">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

      </section>

      <section className="wrap pb-24 md:pb-40" aria-labelledby="in-h">
        <h2 id="in-h" className="label m-0 border-t border-[var(--rule)] pb-8 pt-4 !text-[var(--fg)]">
          Who else is in India
        </h2>

        {/* desktop table */}
        <div className="hidden md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                {["Company", "What they do", "How they relate to us"].map((h) => (
                  <th key={h} scope="col" className="label pb-4 pr-6 text-left align-bottom">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPANIES.map((c) => (
                <tr key={c.name} className="border-t border-[var(--rule)]">
                  <th scope="row" className="w-[22%] py-6 pr-6 text-left align-top">
                    <div className="heading">{c.name}</div>
                    <div className="label mt-2">{c.where.split(",")[0]} · <a href={`https://${c.site}`} target="_blank" rel="noopener noreferrer" className="link underline decoration-1 underline-offset-4 hover:decoration-2">{c.site} ↗</a></div>
                  </th>
                  <td className="data w-[42%] py-6 pr-6 align-top">
                    <ul className="m-0 list-none space-y-2 p-0">
                      {c.does.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-6 align-top">
                    <span className="label inline-block border border-[var(--fg)] px-2 py-1 !text-[var(--fg)]">{c.relation}</span>
                    <p className="data m-0 mt-3">{c.why}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* mobile blocks */}
        <div className="md:hidden">
          {COMPANIES.map((c) => (
            <section key={c.name} className="border-t border-[var(--rule)] py-6" aria-label={c.name}>
              <h3 className="heading m-0">{c.name}</h3>
              <div className="label mt-2">
                {c.where} · <a href={`https://${c.site}`} target="_blank" rel="noopener noreferrer" className="link underline decoration-1 underline-offset-4 hover:decoration-2">{c.site} ↗</a>
              </div>
              <ul className="data m-0 mt-4 list-none space-y-2 p-0">
                {c.does.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <span className="label mt-4 inline-block border border-[var(--fg)] px-2 py-1 !text-[var(--fg)]">{c.relation}</span>
              <p className="data m-0 mt-3">{c.why}</p>
            </section>
          ))}
        </div>

      </section>
    </div>
  );
}
