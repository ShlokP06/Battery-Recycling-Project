// Pure helpers derived from simulate() output. No model numbers are defined here.
import { DATA, GRID_G, GRID_V, liberationPct, simulate } from "@/lib/model";

export const RUN_COUNT = DATA.cases.length;
export const SCREEN_CUT_COUNT = DATA.screen_cut_study.length;
export const FEED_KG_H = DATA.meta.feed_kg_h;
export const BM_FEED_KG_H = DATA.meta.bm_feed_kg_h;

export const fmt = (x: number, d = 1) => x.toFixed(d);
/** Thin space before units: 63.1 %, 8.1 kWh/t */
export const THIN = " ";
export const withUnit = (x: number, unit: string, d = 1) => `${x.toFixed(d)}${THIN}${unit}`;

/** Aspen grid values that bracket x (equal values collapse to one). */
function bracket(grid: number[], x: number): [number, number] {
  let lo = grid[0];
  let hi = grid[grid.length - 1];
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] <= x) lo = grid[i];
    if (grid[grid.length - 1 - i] >= x) hi = grid[grid.length - 1 - i];
  }
  return [lo, hi];
}

/** Run IDs of the Aspen runs bracketing (G, v), e.g. ["G15_V13", ...]. */
export function bracketingRuns(G: number, v: number): string[] {
  const [g0, g1] = bracket(GRID_G, G);
  const [v0, v1] = bracket(GRID_V, v);
  const gs = g0 === g1 ? [g0] : [g0, g1];
  const vs = v0 === v1 ? [v0] : [v0, v1];
  const ids: string[] = [];
  for (const v of vs) for (const g of gs) ids.push(`G${g}_V${v}`);
  return ids;
}

export function provenance(G: number, v: number): { exact: boolean; text: string } {
  const s = simulate(G, v);
  if (s.onGrid && s.runId) return { exact: true, text: `Exact Aspen run ${s.runId}` };
  const ids = bracketingRuns(G, v);
  return { exact: false, text: `Interpolated between Aspen runs ${ids.join(", ")}` };
}

/** How far main recovery moves across the velocity range at a given grid, in points. */
export function velocitySpanPt(G: number): number {
  const lo = simulate(G, GRID_V[0]).recoveryMain;
  const hi = simulate(G, GRID_V[GRID_V.length - 1]).recoveryMain;
  return Math.abs(hi - lo);
}
/** Largest velocity span over the Aspen grid values of G. */
export function maxVelocitySpanPt(): number {
  return Math.max(...GRID_G.map(velocitySpanPt));
}

export type Flow = {
  feed: number;
  foilCasing: number;
  blackMass: number;
  main: number;
  second: number;
  lost: number;
  mainPct: number;
  secondPct: number;
  lostPct: number;
  productKgH: number;
};

/** Mass balance for the Sankey. lost = black mass - main - second (never 100 - main). */
export function flows(G: number, v: number): Flow {
  const s = simulate(G, v);
  const main = s.bmProductKgH;
  const second = s.bm2KgH;
  const lost = Math.max(0, BM_FEED_KG_H - main - second);
  return {
    feed: FEED_KG_H,
    foilCasing: FEED_KG_H - BM_FEED_KG_H,
    blackMass: BM_FEED_KG_H,
    main,
    second,
    lost,
    mainPct: (100 * main) / BM_FEED_KG_H,
    secondPct: (100 * second) / BM_FEED_KG_H,
    lostPct: (100 * lost) / BM_FEED_KG_H,
    productKgH: s.productKgH,
  };
}

/** Grid point (G, v) with the lowest total kWh/t over the Aspen grid values. */
export function minEnergyPoint(): { G: number; v: number } {
  let best = { G: GRID_G[0], v: GRID_V[0], e: Infinity };
  for (const G of GRID_G)
    for (const v of GRID_V) {
      const e = simulate(G, v).energy.kwhPerTFeed;
      if (e < best.e) best = { G, v, e };
    }
  return { G: best.G, v: best.v };
}

/** Limit tag text for a value that fails a limit, or null. */
export function cuTag(cu: number, limit: number): string | null {
  return cu > limit ? `over ${limit} China draft, unverified` : null;
}
export function alTag(al: number, limit: number): string | null {
  return al > limit ? `over ${limit} China draft, unverified` : null;
}

export { liberationPct };

const ONES = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
/** 0..99 in words, for copy that reads a count aloud. */
export function words(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  return n % 10 ? `${TENS[t]}-${ONES[n % 10]}` : TENS[t];
}
export const RUN_WORDS = words(RUN_COUNT);
