// Line drawing of the Aspen Plus V14 flowsheet (v09b). Layout is ours; units and connections follow the model.
// 1px outlines, no fills. By-product streams dashed. Main line on one axis, branches on separate lanes so no line
// crosses a box or a label. Desktop is horizontal; below md a vertical version is shown instead.
import { A, CY, GRID_G, GRID_V, simulate } from "@/lib/model";
import { FEED_KG_H, THIN } from "@/lib/derived";

const MONO = "var(--font-mono)";
type Kind = "in" | "unit" | "out" | "waste";

function useSubs() {
  const vent = simulate(20, 15).ventLossKgH;
  const last = (a: number[]) => a[a.length - 1];
  return {
    feed: `${FEED_KG_H.toFixed(1)}${THIN}kg/h`,
    shred: `grid ${GRID_G[0]} to ${last(GRID_G)}${THIN}mm`,
    screen: `${A.screen_cut_mm}${THIN}mm, ${A.screen_model.replace(" (inferred)", "")}`,
    air: `${GRID_V[0]} to ${last(GRID_V)}${THIN}m/s`,
    cyc: `Stairmand, ${CY.D}${THIN}m`,
    bag: `${A.bag_filter_dp_pa}${THIN}Pa, assumed`,
    vent: `${vent.toFixed(2)}${THIN}kg/h at base`,
    screen2: `${A.screen_cut_mm}${THIN}mm`,
  };
}
type Sub = ReturnType<typeof useSubs>;

const W = 150;
const H = 58;

function Box({ x, y, t, s, kind = "unit", w = W, h = H }: { x: number; y: number; t: string; s?: string; kind?: Kind; w?: number; h?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} fill="var(--bg)" stroke="var(--fg)" strokeWidth={1} strokeDasharray={kind === "waste" ? "4 3" : undefined} />
      <text x={10} y={22} fontFamily={MONO} fontSize={12} letterSpacing="0.12em" fill="var(--fg)" style={{ textTransform: "uppercase" }}>
        {t}
      </text>
      {s && (
        <text x={10} y={h - 12} fontFamily={MONO} fontSize={11} fill="var(--fg-mute)">
          {s}
        </text>
      )}
    </g>
  );
}

function Line({ d, dashed = false, arrow = "arr" }: { d: string; dashed?: boolean; arrow?: string }) {
  return <path d={d} fill="none" stroke="var(--fg)" strokeWidth={1} strokeDasharray={dashed ? "4 3" : undefined} markerEnd={`url(#${arrow})`} />;
}

function Lbl({ x, y, children, anchor = "middle" }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontFamily={MONO} fontSize={11} letterSpacing="0.08em" fill="var(--fg-mute)">
      {children}
    </text>
  );
}

// recovered-material end marker: small orange square keylined in carbon
function Sq({ x, y }: { x: number; y: number }) {
  return <rect x={x} y={y} width={10} height={10} fill="var(--orange, #FF5A1F)" stroke="#0D0E0C" strokeWidth={1} />;
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 8 8" refX="7.5" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0.5 0.5L7.5 4L0.5 7.5" fill="none" stroke="var(--fg)" strokeWidth="1" />
      </marker>
    </defs>
  );
}

export function Flowsheet() {
  const sub = useSubs();
  return (
    <>
      <Horizontal sub={sub} />
      <Vertical sub={sub} />
    </>
  );
}

function Horizontal({ sub }: { sub: Sub }) {
  const P = 245;
  const c = (i: number) => i * P;
  const ax = 250; // main axis box top
  const am = ax + H / 2; // main axis centre line
  const up = 110; // oversize lane box top
  const upm = up + H / 2;
  const top = 0; // by-product lane box top
  const low = 400; // lower lane box top
  const lowm = low + H / 2;
  const mid = (i: number) => c(i) + W / 2;
  const gapMid = (i: number) => c(i) + W + (P - W) / 2; // centre of gap right of column i
  return (
    <div className="hidden md:block">
      <svg viewBox="-4 -6 1430 480" className="block w-full" role="img" aria-label="Process flowsheet: feed, shredder, screen, air conveying, cyclone and product, with oversize and dust branches">
        <Defs id="arrH" />

        {/* main line */}
        <Line arrow="arrH" d={`M${c(0) + W} ${am}H${c(1)}`} />
        <Line arrow="arrH" d={`M${c(1) + W} ${am}H${c(2)}`} />
        <Line arrow="arrH" d={`M${c(2) + W} ${am}H${c(3)}`} />
        <Line arrow="arrH" d={`M${c(3) + W} ${am}H${c(4)}`} />
        <Line arrow="arrH" d={`M${c(4) + W} ${am}H${c(5)}`} />
        <Line arrow="arrH" d={`M${c(5) + W} ${am}H${c(5) + W + 26}`} />
        <Sq x={c(5) + W + 26} y={am - 5} />
        <Lbl x={gapMid(1)} y={am - 8}>DISCHARGE</Lbl>
        <Lbl x={gapMid(2)} y={am - 8}>UNDERSIZE</Lbl>
        <Lbl x={gapMid(3)} y={am - 8}>FINES</Lbl>
        <Lbl x={gapMid(4)} y={am - 8}>CAPTURE</Lbl>

        {/* oversize lane (above): screen oversize to air classifier, liberation, screen 2, second grade */}
        <Line arrow="arrH" d={`M${mid(2)} ${ax}V${up + H}`} />
        <Lbl x={mid(2) + 10} y={(ax + up + H) / 2 + 4} anchor="start">OVERSIZE</Lbl>
        <Line arrow="arrH" d={`M${c(2) + W} ${upm}H${c(3)}`} />
        <Line arrow="arrH" d={`M${c(3) + W} ${upm}H${c(4)}`} />
        <Lbl x={gapMid(3)} y={upm - 8}>DETACHED</Lbl>
        <Line arrow="arrH" d={`M${c(4) + W} ${upm}H${c(5)}`} />
        <Line arrow="arrH" d={`M${c(5) + W} ${upm}H${c(5) + W + 26}`} />
        <Sq x={c(5) + W + 26} y={upm - 5} />

        {/* by-products (top lane, dashed) */}
        <Line dashed arrow="arrH" d={`M${c(2) + 30} ${up}V${top + H}`} />
        <Line dashed arrow="arrH" d={`M${c(2) + 120} ${up}V${top + H}`} />
        <Line dashed arrow="arrH" d={`M${mid(4)} ${up}V${top + H}`} />

        {/* dust path (lower lane) */}
        <Line arrow="arrH" d={`M${mid(4)} ${ax + H}V${low}`} />
        <Lbl x={mid(4) + 10} y={(ax + H + low) / 2 + 4} anchor="start">DUST</Lbl>
        <Line arrow="arrH" d={`M${c(4) + W} ${lowm}H${mid(5)}V${ax + H}`} />
        <Lbl x={c(4) + W + 12} y={lowm - 8} anchor="start">FILTERED</Lbl>
        <Line dashed arrow="arrH" d={`M${c(4)} ${lowm}H${c(3) + W}`} />
        <Lbl x={(c(4) + c(3) + W) / 2} y={lowm - 8}>LOSS</Lbl>

        {/* boxes */}
        <Box x={c(0)} y={ax} t="Feed" s={sub.feed} kind="in" />
        <Box x={c(1)} y={ax} t="Shredder" s={sub.shred} />
        <Box x={c(2)} y={ax} t="Screen" s={sub.screen} />
        <Box x={c(3)} y={ax} t="Air conveying" s={sub.air} />
        <Box x={c(4)} y={ax} t="Cyclone" s={sub.cyc} />
        <Box x={c(5)} y={ax} t="Main grade" s="PRODUCT" kind="out" />
        <Box x={c(2)} y={up} t="Air classifier" s="oversize" />
        <Box x={c(3)} y={up} t="Liberation" s="LIB2, detach" />
        <Box x={c(4)} y={up} t="Screen 2" s={sub.screen2} />
        <Box x={c(5)} y={up} t="Second grade" s="BM2" kind="out" />
        <Box x={c(2) - 90} y={top} t="Separator" s="to PP out" kind="waste" />
        <Box x={c(2) + 80} y={top} t="Steel casing" s="heavy out" kind="waste" />
        <Box x={c(4)} y={top} t="Foil" s="FOIL-2" kind="waste" />
        <Box x={c(4)} y={low} t="Bag filter" s={sub.bag} />
        <Box x={c(3)} y={low} t="Vent" s={sub.vent} kind="waste" />
      </svg>
    </div>
  );
}

function Vertical({ sub }: { sub: Sub }) {
  const P = 96;
  const y0 = 28;
  const row = (i: number) => y0 + i * P;
  const mid = W / 2;
  const px = 220; // right-hand column x
  const pw = 140;
  const bB = row(5) + 96; // bag filter top (below cyclone row)
  const secB = bB + H + 110; // section B header baseline offset base
  const b0 = secB + 18; // first box of section B
  const bp = 100;
  const brow = (i: number) => b0 + i * bp;
  return (
    <div className="md:hidden">
      <svg viewBox="-4 -4 368 1200" className="block w-full" role="img" aria-label="Process flowsheet, vertical">
        <Defs id="arrV" />
        <Lbl x={0} y={12} anchor="start">MAIN LINE</Lbl>

        <Line arrow="arrV" d={`M${mid} ${row(0) + H}V${row(1)}`} />
        <Line arrow="arrV" d={`M${mid} ${row(1) + H}V${row(2)}`} />
        <Line arrow="arrV" d={`M${mid} ${row(2) + H}V${row(3)}`} />
        <Line arrow="arrV" d={`M${mid} ${row(3) + H}V${row(4)}`} />
        <Lbl x={mid + 10} y={row(0) + H + 24} anchor="start">FEED</Lbl>
        <Lbl x={mid + 10} y={row(1) + H + 24} anchor="start">DISCHARGE</Lbl>
        <Lbl x={mid + 10} y={row(2) + H + 24} anchor="start">UNDERSIZE</Lbl>
        <Lbl x={mid + 10} y={row(3) + H + 24} anchor="start">AIR + FINES</Lbl>

        {/* oversize leaves the screen to the right; continues in the section below */}
        <Line dashed arrow="arrV" d={`M${W} ${row(2) + H / 2}H${W + 40}`} />
        <Lbl x={W + 48} y={row(2) + H / 2 + 4} anchor="start">OVERSIZE, BELOW</Lbl>

        {/* cyclone to product, dust to bag filter */}
        <Line arrow="arrV" d={`M${W} ${row(4) + H / 2}H${px}`} />
        <Lbl x={(W + px) / 2} y={row(4) + H / 2 - 8}>CAPTURE</Lbl>
        <Line arrow="arrV" d={`M${mid} ${row(4) + H}V${bB}`} />
        <Lbl x={mid + 10} y={(row(4) + H + bB) / 2 + 4} anchor="start">DUST</Lbl>
        <Line arrow="arrV" d={`M${W} ${bB + H / 2}H${px + pw / 2}V${row(4) + H}`} />
        <Lbl x={W + 12} y={bB + H / 2 - 8} anchor="start">FILTERED</Lbl>
        <Line dashed arrow="arrV" d={`M${mid} ${bB + H}V${bB + H + 36}`} />
        <Line arrow="arrV" d={`M${px + pw / 2} ${row(4)}V${row(4) - 24}`} />
        <Sq x={px + pw / 2 - 5} y={row(4) - 34} />

        <Box x={0} y={row(0)} t="Feed" s={sub.feed} kind="in" />
        <Box x={0} y={row(1)} t="Shredder" s={sub.shred} />
        <Box x={0} y={row(2)} t="Screen" s={sub.screen} />
        <Box x={0} y={row(3)} t="Air conveying" s={sub.air} />
        <Box x={0} y={row(4)} t="Cyclone" s={sub.cyc} />
        <Box x={px} y={row(4)} t="Main grade" s="PRODUCT" kind="out" w={pw} />
        <Box x={0} y={bB} t="Bag filter" s={sub.bag} />
        <Box x={0} y={bB + H + 36} t="Vent" s={sub.vent} kind="waste" />

        {/* section B: oversize branch */}
        <Lbl x={0} y={secB} anchor="start">OVERSIZE FROM SCREEN</Lbl>
        <Line arrow="arrV" d={`M${mid} ${brow(0) + H}V${brow(1)}`} />
        <Line arrow="arrV" d={`M${mid} ${brow(1) + H}V${brow(2)}`} />
        <Line arrow="arrV" d={`M${mid} ${brow(2) + H}V${brow(3)}`} />
        <Line arrow="arrV" d={`M${mid} ${brow(3) + H}V${brow(3) + H + 24}`} />
        <Sq x={mid - 5} y={brow(3) + H + 24} />
        <Lbl x={mid + 10} y={brow(1) - 12} anchor="start">LIBERATED</Lbl>
        <Line dashed arrow="arrV" d={`M${W} ${brow(0) + 14}H${px}`} />
        <Line dashed arrow="arrV" d={`M${W} ${brow(0) + H - 14}H${px}`} />
        <Line dashed arrow="arrV" d={`M${W} ${brow(2) + H / 2}H${px}`} />

        <Box x={0} y={brow(0)} t="Air classifier" s="oversize" />
        <Box x={0} y={brow(1)} t="Liberation" s="LIB2, detach" />
        <Box x={0} y={brow(2)} t="Screen 2" s={sub.screen2} />
        <Box x={0} y={brow(3)} t="Second grade" s="BM2" kind="out" />
        <Box x={px} y={brow(0) - 20} t="Separator" s="to PP out" kind="waste" w={pw} h={44} />
        <Box x={px} y={brow(0) + 34} t="Steel casing" s="heavy out" kind="waste" w={pw} h={44} />
        <Box x={px} y={brow(2)} t="Foil" s="FOIL-2" kind="waste" w={pw} h={H} />
      </svg>
    </div>
  );
}
