/** Wordmark KAALA followed by the orange granule full stop (0.16em, on baseline, 0.06em gap). */
export function Logo({ size = 28, keyline = false }: { size?: number; keyline?: boolean }) {
  return (
    <span
      className="display-xl nowrap"
      style={{ fontSize: size, lineHeight: 1, letterSpacing: "0.01em", display: "inline-block" }}
      aria-label="Kaala"
    >
      <span aria-hidden>KAALA</span>
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: "0.16em",
          height: "0.16em",
          marginLeft: "0.06em",
          borderRadius: "50%",
          background: "var(--orange)",
          boxSizing: "border-box",
          border: keyline ? "1px solid var(--fg)" : undefined,
        }}
      />
    </span>
  );
}
