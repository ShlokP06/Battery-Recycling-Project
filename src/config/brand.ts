// Single place to rename the company. Change `name` / `short` and everything follows.
export const BRAND = {
  name: "LITHNOVA Recycling",
  short: "LITHNOVA",
  tagline: "Black mass, recovered mechanically.",
  description:
    "Dry mechanical recovery of battery-grade black mass from end-of-life lithium-ion cells, with no acid and no furnace.",
  email: "contact@example.com", // placeholder: set a real address and the footer shows it
  location: "IIT Indore, Simrol, Indore 453552",
  course: "ChE 303 Fluid Particle Systems",
} as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/simulator", label: "Simulator" },
  { href: "/analysis", label: "Analysis" },
  { href: "/economics", label: "Economics" },
  { href: "/competitors", label: "Landscape" },
  { href: "/team", label: "Team" },
] as const;

/** True while BRAND.email is still the example placeholder. */
export const EMAIL_IS_PLACEHOLDER = /@example\.(com|org|net)$/i.test(BRAND.email);
