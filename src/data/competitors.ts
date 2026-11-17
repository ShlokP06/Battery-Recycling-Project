export type Relation = "Direct competitor" | "Competitor and possible customer" | "Customer / partner";

export type Company = {
  name: string;
  where: string;
  site: string;
  does: string[];
  relation: Relation;
  why: string;
};

// From the team's competitor survey; company details from their public websites.
export const COMPANIES: Company[] = [
  {
    name: "LOHUM",
    where: "Greater Noida, Uttar Pradesh",
    site: "lohum.com",
    does: [
      "Repurposes, recycles and refines Li-ion batteries",
      "Leaches black mass with its patented low-carbon hydro process",
    ],
    relation: "Competitor and possible customer",
    why: "Processes black mass, so it could buy ours, but it also recycles end to end.",
  },
  {
    name: "Rubamin",
    where: "Vadodara, Gujarat",
    site: "rubamin.com",
    does: [
      "Buys black mass from Indian shredding units",
      "Chemical leaching, 90–97 % recovery, NMC and LFP",
    ],
    relation: "Customer / partner",
    why: "A buyer for our black mass.",
  },
  {
    name: "BatX Energies",
    where: "Gurugram, Haryana",
    site: "batxenergies.com",
    does: [
      "Wet and dry mechanical pre-processing into high-purity black mass",
      "Low-temperature, low-pressure leaching to battery-grade salts",
    ],
    relation: "Direct competitor",
    why: "Makes black mass the way we do, and refines it too.",
  },
];
