import { ASSUMPTIONS } from "@/lib/assumptions";

/** Assumptions as a numbered spec grid: index + key on a ticket rule, short text below, status in mono. */
export function AssumptionsGrid({ intro }: { intro?: string }) {
  return (
    <div>
      <div className="grid12 items-end gap-y-4">
        <h2 className="display-l col-span-4 m-0 md:col-span-6" style={{ fontSize: "clamp(40px, 4.4vw, 72px)" }}>
          Assumptions.
        </h2>
        {intro && <p className="body-s col-span-4 m-0 text-mute md:col-span-4 md:col-start-9">{intro}</p>}
      </div>
      <ol className="m-0 mt-10 grid list-none grid-cols-1 gap-x-[var(--gutter)] gap-y-10 p-0 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
        {ASSUMPTIONS.map((a, i) => (
          <li key={a.key} className="ticket pt-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="label !text-[var(--fg)]">
                <span className="mr-3 opacity-60">{String(i + 1).padStart(2, "0")}</span>
                {a.key}
              </span>
              <span className="label whitespace-nowrap">{a.tag ? a.tag.toLowerCase() : "modelled"}</span>
            </div>
            <p className="body-s m-0 mt-3 max-w-[46ch]">{a.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
