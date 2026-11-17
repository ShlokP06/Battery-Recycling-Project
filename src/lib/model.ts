// Live plant model for the simulator.
//  * Shredder (Bond), cyclone (Lapple), fan and energy: analytic, ported 1:1 from 04_python/kaala.
//  * Recovery, purity and product flows: interpolated from the 36 Aspen Plus V14 runs
//    (monotone cubic in G, linear in v). Aspen cannot run in the browser.
import raw from "@/data/kaala.json";

export type Case = (typeof raw.cases)[number];
export const DATA = raw;
export const GRID_G: number[] = raw.meta.grid_G_mm;
export const GRID_V: number[] = raw.meta.grid_v_m_s;
export const SPECS = raw.meta.specs;
export const A = raw.meta.assumptions;
export const CY = raw.meta.cyclone;

// ---------- shredder (liberation.py) ----------
const RR_N = 1.43;
const xprime = (G: number) => 10.1 * Math.pow(G / 20, 0.38);
const foilP80um = (G: number) => xprime(G) * Math.pow(-Math.log(0.2), 1 / RR_N) * 1000;
const WI = 5.5 / (10 / Math.sqrt(foilP80um(20)) - 10 / Math.sqrt(A.f80_um));
export const shredderKwhPerT = (G: number) => WI * (10 / Math.sqrt(foilP80um(G)) - 10 / Math.sqrt(A.f80_um));
export const shredderKw = (G: number) => (shredderKwhPerT(G) * raw.meta.feed_kg_h) / 1000;
export const liberationPct = (G: number) => 75 + (57 - 75) * (Math.log(G / 10) / Math.log(4));

// ---------- cyclone (Lapple, Stairmand HE D = 0.55 m) ----------
const NE = (CY.Lb + CY.Lc / 2) / CY.H; // 5.5
export const RHO = { NMC: A.rho_nmc, Graphite: A.rho_graphite } as const;
export type Material = keyof typeof RHO;

export function d50um(v: number, material: Material = "NMC", ne = NE): number {
  const rho = RHO[material];
  return 1e6 * Math.sqrt((9 * CY.mu * CY.W) / (2 * Math.PI * ne * v * (rho - CY.rho_g)));
}
export const gradeEff = (d: number, d50: number) => 1 / (1 + (d50 / d) ** 2);

const PSD = raw.feed_psd;
const PSD_MID = PSD.lo_um.map((lo, i) => Math.sqrt(lo * PSD.hi_um[i]));
export function overallEff(v: number, material: Material): number {
  const d50 = d50um(v, material);
  let num = 0;
  let den = 0;
  PSD_MID.forEach((d, i) => {
    num += PSD.mass_fraction[i] * gradeEff(d, d50);
    den += PSD.mass_fraction[i];
  });
  return (100 * num) / den;
}
export const cycloneDpPa = (v: number) => 0.5 * CY.rho_g * v * v * CY.NH;
export const airKgH = (v: number) => CY.air_per_ms * v;
export function fanKw(v: number): number {
  const q = airKgH(v) / (3600 * CY.rho_g);
  return (q * (cycloneDpPa(v) + A.bag_filter_dp_pa)) / A.fan_eff / 1000;
}

export function gradeCurve(v: number, material: Material, n = 90) {
  const d50 = d50um(v, material);
  return Array.from({ length: n }, (_, i) => {
    const d = Math.pow(10, -0.3 + (i / (n - 1)) * 3.3); // 0.5 .. 1000 um
    return { d, eff: 100 * gradeEff(d, d50) };
  });
}
export const psdBars = PSD.lo_um.map((lo, i) => ({
  lo,
  hi: PSD.hi_um[i],
  mid: PSD_MID[i],
  pct: 100 * PSD.mass_fraction[i],
}));

// ---------- interpolation of Aspen results ----------
function pchip(xs: number[], ys: number[], x: number): number {
  const n = xs.length;
  const h = xs.slice(1).map((v, i) => v - xs[i]);
  const d = ys.slice(1).map((v, i) => (v - ys[i]) / h[i]);
  const m = new Array<number>(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] > 0) {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  const end = (h0: number, h1: number, d0: number, d1: number) => {
    let s = ((2 * h0 + h1) * d0 - h0 * d1) / (h0 + h1);
    if (Math.sign(s) !== Math.sign(d0)) s = 0;
    else if (Math.sign(d0) !== Math.sign(d1) && Math.abs(s) > 3 * Math.abs(d0)) s = 3 * d0;
    return s;
  };
  m[0] = end(h[0], h[1], d[0], d[1]);
  m[n - 1] = end(h[n - 2], h[n - 3], d[n - 2], d[n - 3]);
  let i = 0;
  while (i < n - 2 && x > xs[i + 1]) i++;
  const t = (x - xs[i]) / h[i];
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * ys[i] +
    (t3 - 2 * t2 + t) * h[i] * m[i] +
    (-2 * t3 + 3 * t2) * ys[i + 1] +
    (t3 - t2) * h[i] * m[i + 1]
  );
}

const byKey = new Map(raw.cases.map((c) => [`${c.G}|${c.v}`, c]));
type NumKey = {
  [K in keyof Case]: Case[K] extends number ? K : never;
}[keyof Case];

function interp(key: NumKey, G: number, v: number): number {
  const rowAtG = GRID_G.map((g) => {
    const ys = GRID_V.map((vv) => byKey.get(`${g}|${vv}`)![key] as number);
    // linear in v
    let j = 0;
    while (j < GRID_V.length - 2 && v > GRID_V[j + 1]) j++;
    const t = (v - GRID_V[j]) / (GRID_V[j + 1] - GRID_V[j]);
    return ys[j] + t * (ys[j + 1] - ys[j]);
  });
  return pchip(GRID_G, rowAtG, G);
}

export type Sim = ReturnType<typeof simulate>;

export function simulate(G: number, v: number) {
  const g = Math.min(Math.max(G, GRID_G[0]), GRID_G[GRID_G.length - 1]);
  const vv = Math.min(Math.max(v, GRID_V[0]), GRID_V[GRID_V.length - 1]);
  const bm = interp("bm_product_kg_h", g, vv);
  const sh = shredderKw(g);
  const fan = fanKw(vv);
  const gridRun = byKey.get(`${g}|${vv}`);
  return {
    G: g,
    v: vv,
    onGrid: Boolean(gridRun),
    runId: gridRun ? `G${g}_V${vv}` : null,
    recoveryMain: interp("recovery_main", g, vv),
    recoveryTotal: interp("recovery_total", g, vv),
    alWt: interp("al_wt", g, vv),
    cuWt: interp("cu_wt", g, vv),
    productKgH: interp("product_kg_h", g, vv),
    bmProductKgH: bm,
    bm2KgH: interp("bm2_kg_h", g, vv),
    cycloneEffAspen: interp("cyclone_eff_aspen", g, vv),
    bagLoadKgH: interp("bagfilter_load_kg_h", g, vv),
    ventLossKgH: interp("vent_loss_kg_h", g, vv),
    liberationPct: liberationPct(g),
    cyclone: {
      d50Nmc: d50um(vv, "NMC"),
      d50Graphite: d50um(vv, "Graphite"),
      effNmc: overallEff(vv, "NMC"),
      effGraphite: overallEff(vv, "Graphite"),
      dpPa: cycloneDpPa(vv),
      airKgH: airKgH(vv),
    },
    energy: {
      shredderKw: sh,
      fanKw: fan,
      totalKw: sh + fan,
      kwhPerTFeed: (sh + fan) / (raw.meta.feed_kg_h / 1000),
      kwhPerKgBm: (sh + fan) / bm,
      shredderKwhPerT: shredderKwhPerT(g),
    },
  };
}

export const passes = (alWt: number, cuWt: number) => ({
  fastmarkets: alWt <= SPECS.fastmarkets.al && cuWt <= SPECS.fastmarkets.cu,
  china: alWt <= SPECS.china_draft.al && cuWt <= SPECS.china_draft.cu,
});
