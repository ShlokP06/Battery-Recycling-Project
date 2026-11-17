import type { Metadata } from "next";
import Image from "next/image";
import { TEAM, known } from "@/data/team";
import { BRAND } from "@/config/brand";
import { words } from "@/lib/derived";

export const metadata: Metadata = {
  title: "Team",
  description: `The operators behind ${BRAND.short}: ${BRAND.course}, IIT Indore.`,
};

export default function TeamPage() {
  return (
    <div data-theme="carbon" data-grain>
      <header className="wrap space-giant">
        <h1 className="display-xl m-0">Crew</h1>
        <div className="grid12 mt-12 md:mt-16">
          <p className="body col-span-4 md:col-span-4">
            {words(TEAM.length)[0].toUpperCase() + words(TEAM.length).slice(1)} operators. {BRAND.course}, IIT Indore.
          </p>
        </div>
      </header>

      <section className="wrap pb-24 md:pb-40" aria-label="Team members">
        <ul className="m-0 grid list-none grid-cols-2 border-t border-[var(--rule)] p-0 md:flex md:w-fit md:grid-cols-none">
          {TEAM.map((m, i) => {
            const roll = known(m.roll);
            return (
              <li
                key={m.name}
                className={`px-0 py-6 md:w-[200px] md:px-5 md:py-6 ${i % 2 === 1 ? "border-l border-[var(--rule)] pl-3 md:pl-5" : "pr-3 md:pr-5"} ${i > 0 ? "md:border-l md:border-[var(--rule)]" : "md:pl-0"} ${i > 1 ? "border-t border-[var(--rule)] md:border-t-0" : ""}`}
              >
                <div className="relative mx-auto aspect-[4/5] w-full max-w-[160px] overflow-hidden md:mx-0" style={{ background: "var(--bg)" }}>
                  {m.photo ? (
                    <Image src={m.photo} alt={m.name} fill sizes="160px" className="object-cover" style={{ filter: "grayscale(1) contrast(1.15)" }} />
                  ) : (
                    <>
                      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 160 200" aria-hidden>
                        <rect x="0.5" y="0.5" width="159" height="199" fill="none" stroke="var(--rule)" />
                        <path d="M0 0L160 200M160 0L0 200" stroke="var(--rule)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                      </svg>
                      <span className="label absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1" style={{ background: "var(--bg)" }}>
                        Photo pending
                      </span>
                    </>
                  )}
                </div>
                <h2 className="display-s mb-0 mt-5">{m.name}</h2>
                {roll && <p className="data m-0 mt-2">{roll}</p>}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
