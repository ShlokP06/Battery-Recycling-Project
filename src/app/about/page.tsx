import type { Metadata } from "next";
import Link from "next/link";
import { ABOUT_LEAD, ABOUT_SECTIONS } from "@/data/about";
import { BRAND } from "@/config/brand";
import { simulate } from "@/lib/model";
import { FEED_KG_H, THIN, fmt } from "@/lib/derived";

export const metadata: Metadata = {
  title: "About",
  description: `What ${BRAND.short} does, who it serves and why.`,
};

export default function AboutPage() {
  const base = simulate(20, 15);
  const facts = [
    { v: fmt(FEED_KG_H), u: "kg/h", l: "Cells in" },
    { v: fmt(base.recoveryMain), u: "%", l: "Main-grade recovery" },
    { v: fmt(base.energy.kwhPerTFeed), u: "kWh/t", l: "Energy" },
    { v: "0", u: "", l: "Acid, furnace, wastewater" },
  ];

  return (
    <div data-theme="paper" className="bg-[var(--bg)] text-[var(--fg)]">
      <header className="wrap pt-24 pb-16 md:pt-40 md:pb-24">
        <h1 className="display-xl m-0">
          About {BRAND.short}
          <span className="sr-only">.</span>
        </h1>
        <div className="grid12 mt-12 md:mt-16">
          <p className="col-span-4 m-0 md:col-span-8" style={{ fontSize: "clamp(22px, 2.2vw, 32px)", lineHeight: 1.25 }}>
            {ABOUT_LEAD}
          </p>
        </div>
      </header>

      <section className="wrap pb-16 md:pb-24" aria-label="Key figures">
        <div className="grid grid-cols-2 border-t border-[var(--rule)] md:grid-cols-4">
          {facts.map((f, i) => (
            <div key={f.l} className={`py-6 ${i % 2 ? "border-l border-[var(--rule)] pl-4" : "pr-4"} ${i > 1 ? "border-t border-[var(--rule)] md:border-t-0" : ""} ${i === 2 ? "md:border-l md:pl-4" : ""}`}>
              <p className="display-s m-0">
                {f.v}
                {f.u && <span className="label ml-2" style={{ textTransform: "none" }}>{THIN}{f.u}</span>}
              </p>
              <p className="label m-0 mt-2">{f.l}</p>
            </div>
          ))}
        </div>
        <p className="data mt-3 text-mute">Base case, 20 mm grid, 15 m/s. Aspen-modelled.</p>
      </section>

      <section className="wrap pb-24 md:pb-40">
        {ABOUT_SECTIONS.map((s, i) => (
          <article key={s.title} className="grid12 gap-y-6 border-t border-[var(--rule)] py-14 md:py-24">
            <div className="col-span-4 md:col-span-5">
              <h2 className="m-0 flex items-start gap-4 md:gap-6">
                <span className="label mt-2 shrink-0 md:mt-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="display-l m-0 block" style={{ fontSize: "clamp(44px, 5vw, 84px)" }}>
                  {s.title}
                </span>
              </h2>
            </div>
            <div className="col-span-4 md:col-span-6 md:col-start-7">
              {s.paras.map((p, j) => (
                <p
                  key={j}
                  className={`m-0 ${j > 0 ? "mt-6 text-mute" : ""}`}
                  style={{
                    fontSize: j === 0 ? "clamp(20px, 1.75vw, 26px)" : "clamp(16px, 1.3vw, 19px)",
                    lineHeight: j === 0 ? 1.32 : 1.5,
                    letterSpacing: j === 0 ? "-0.01em" : undefined,
                    maxWidth: j === 0 ? "36ch" : "52ch",
                    textWrap: "pretty",
                  }}
                >
                  {p}
                </p>
              ))}
            </div>
          </article>
        ))}
        <div className="border-t border-[var(--rule)] pt-10">
          <Link
            href="/simulator"
            className="label inline-block border border-[var(--fg)] bg-[var(--fg)] px-5 py-4 text-[var(--bg)] transition-colors duration-[160ms] hover:bg-[var(--bg)] hover:text-[var(--fg)]"
          >
            Open the simulator
          </Link>
        </div>
      </section>
    </div>
  );
}
