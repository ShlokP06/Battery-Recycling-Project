"use client";

export function Slider(props: {
  id: string;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  ticks: number[];
  valueText: string;
  describedBy: string;
  gridValues: number[];
}) {
  const { id, label, unit, value, min, max, step, onChange, ticks, valueText, describedBy, gridValues } = props;
  const frac = (t: number) => (t - min) / (max - min);
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Page keys jump to the next / previous Aspen grid value.
    if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const next =
        e.key === "PageUp" ? gridValues.find((g) => g > value) ?? max : [...gridValues].reverse().find((g) => g < value) ?? min;
      onChange(next);
    }
  };
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label className="label !text-[var(--fg)]" htmlFor={id}>
          {label}
        </label>
        <div className="display-s nowrap" aria-hidden>
          {value}
          <span className="label ml-2" style={{ textTransform: "none" }}>{unit}</span>
        </div>
      </div>
      <input
        id={id}
        className="k-range mt-1"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        aria-describedby={describedBy}
        onChange={(e) => onChange(Number(e.target.value))}
        onKeyDown={onKeyDown}
      />
      <div className="relative h-4" aria-hidden>
        {ticks.map((t) => (
          <span
            key={t}
            className="tick mute absolute top-0 -translate-x-1/2"
            style={{ left: `calc(10px + (100% - 20px) * ${frac(t)})` }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
