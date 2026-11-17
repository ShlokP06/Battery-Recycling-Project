/**
 * Unit economics per tonne of dry cell feed (the team's model from 13 Nov 2026,
 * ported cell by cell). Core = the Aspen v09b flowsheet. Extended = adds an
 * oversize line that recovers clean Cu/Al foil and steel casing (estimate).
 * Prices are the weakest inputs: trade reports and price aggregators, Q3-Q4 2026.
 */

export type Route = "core" | "extended";

export type Prices = {
  cell: number; // ₹/kg wet cells bought
  blackMass: number; // ₹/kg black mass sold
};

export const DEFAULT_PRICES: Prices = { cell: 200, blackMass: 400 };

const WET_PER_DRY = 1 / (1 - 0.122); // electrolyte 12.2 wt% evaporated (Nogueira 2025)
const FEED_KG_H = 500;
const HOURS = 6000;
const ANNUAL_T = (FEED_KG_H * HOURS) / 1000; // 3000 t/yr
const TARIFF = 6.79; // ₹/kWh, MP industrial energy charge FY 2026-27
const BM_IN_FEED = 555; // kg black mass per t dry feed

type RouteInputs = {
  recovery: number; // fraction of black mass recovered to product
  alCu: number; // fraction Al+Cu in product
  cuFoil: number; // kg/t
  alFoil: number;
  steel: number;
  mixedOversize: number;
  kwh: number; // kWh/t
  labour: number; // ₹/t
  consumables: number;
  admin: number;
  capexCr: number; // ₹ crore
};

export const PRODUCT_PRICES = { cuFoil: 400, alFoil: 100, steel: 25, mixedOversize: 100 };

export const ROUTES: Record<Route, RouteInputs> = {
  core: {
    recovery: 0.64,
    alCu: 0.011,
    cuFoil: 0,
    alFoil: 0,
    steel: 0,
    mixedOversize: 620,
    kwh: 40,
    labour: 2000,
    consumables: 1000,
    admin: 2000,
    capexCr: 7,
  },
  extended: {
    recovery: 0.76,
    alCu: 0.015,
    cuFoil: 150,
    alFoil: 105,
    steel: 100,
    mixedOversize: 0,
    kwh: 60,
    labour: 2300,
    consumables: 1300,
    admin: 2000,
    capexCr: 9,
  },
};

const MAINT = 0.04;
const RATE = 0.12;
const LIFE = 10;
const CRF = (RATE * (1 + RATE) ** LIFE) / ((1 + RATE) ** LIFE - 1);

export type Result = {
  bmKgPerT: number;
  bmRevenue: number;
  coRevenue: number;
  revenue: number;
  feedCost: number;
  opex: number;
  capital: number;
  margin: number;
  annualMarginCr: number;
  breakEvenCell: number;
  breakEvenBlackMass: number;
  feedShare: number;
};

export function economics(route: Route, p: Prices, overrides?: { recovery?: number; alCu?: number }): Result {
  const r = { ...ROUTES[route], ...(overrides ?? {}) };
  const bmKgPerT = (BM_IN_FEED * r.recovery) / (1 - r.alCu);
  const bmRevenue = bmKgPerT * p.blackMass;
  const coRevenue =
    r.cuFoil * PRODUCT_PRICES.cuFoil +
    r.alFoil * PRODUCT_PRICES.alFoil +
    r.steel * PRODUCT_PRICES.steel +
    r.mixedOversize * PRODUCT_PRICES.mixedOversize;
  const revenue = bmRevenue + coRevenue;
  const feedCost = p.cell * 1000 * WET_PER_DRY;
  const logistics = 13500 * WET_PER_DRY;
  const opex =
    r.kwh * TARIFF + r.labour + logistics + r.consumables + r.admin + (MAINT * r.capexCr * 1e7) / ANNUAL_T;
  const capital = (r.capexCr * 1e7 * CRF) / ANNUAL_T;
  const margin = revenue - feedCost - opex - capital;
  return {
    bmKgPerT,
    bmRevenue,
    coRevenue,
    revenue,
    feedCost,
    opex,
    capital,
    margin,
    annualMarginCr: (margin * ANNUAL_T) / 1e7,
    breakEvenCell: (revenue - opex - capital) / (1000 * WET_PER_DRY),
    breakEvenBlackMass: (feedCost + opex + capital - coRevenue) / bmKgPerT,
    feedShare: feedCost / (feedCost + opex + capital),
  };
}

export const ECON_META = { annualT: ANNUAL_T, feedKgH: FEED_KG_H, hours: HOURS, tariff: TARIFF };

/** ₹ in lakh with one decimal, e.g. 2.06 */
export const lakh = (x: number) => (x / 1e5).toFixed(2);
export const inr = (x: number) => Math.round(x).toLocaleString("en-IN");
