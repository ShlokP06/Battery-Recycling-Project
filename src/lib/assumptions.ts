import { A, SPECS, liberationPct, shredderKwhPerT } from "@/lib/model";

export type Assumption = { key: string; text: string; tag?: "ASSUMED" | "UNVERIFIED" | "FITTED" };

export const ASSUMPTIONS: Assumption[] = [
  { key: "Flowsheet", text: `Aspen Plus V14, v09b. Solids only, no thermal model. Screen selection function inferred as ${A.screen_model.replace(" (inferred)", "")}.` },
  { key: "NMC density", text: `Aspen uses titanium as a proxy (${A.rho_nmc_aspen} kg/m³, below the brief's ${A.rho_nmc}). Hand calculations use ${A.rho_nmc}.` },
  { key: "Cyclone turns", text: `Aspen uses ${A.ne_aspen.toFixed(0)} turns; the Lapple formula gives ${A.ne_hand.toFixed(1)}. The Lapple d50 is therefore larger.` },
  { key: "Bond Wi", text: `Wi = ${A.bond_wi_kwh_t.toFixed(1)} kWh/t is a fitted constant, back-calculated so a 20 mm grid gives ${shredderKwhPerT(20).toFixed(1)} kWh/t. A rough fit for ductile foil; the ends of the grid range are extrapolations.`, tag: "FITTED" },
  { key: "Fan", text: `Total pressure drop times volumetric flow, divided by ${A.fan_eff} fan efficiency.`, tag: "ASSUMED" },
  { key: "Bag filter", text: `Capture ${(A.bag_filter_eff * 100).toFixed(1)} % and a fixed ${A.bag_filter_dp_pa} Pa drop. Not modelled in Python.`, tag: "ASSUMED" },
  { key: "Liberation", text: `Imposed from measured data (${liberationPct(10).toFixed(0)} % at 10 mm, ${liberationPct(40).toFixed(0)} % at 40 mm), not predicted.` },
  { key: "Cyclone feed PSD", text: "Tabulated at G = 20 mm only and applied at all grids in the Lapple calculation." },
  { key: "Spec limits", text: `Fastmarkets Al, Cu at most ${SPECS.fastmarkets.al} wt %. China draft Al at most ${SPECS.china_draft.al}, Cu at most ${SPECS.china_draft.cu} wt %, from the project brief.`, tag: "UNVERIFIED" },
];
