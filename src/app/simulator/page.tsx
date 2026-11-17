import type { Metadata } from "next";
import { Simulator } from "@/components/simulator/Simulator";

export const metadata: Metadata = {
  title: "Simulator",
  description:
    "Two dials, one number. Move the shredder grid and cyclone velocity and read recovery, energy and product grade from the Aspen-modelled sweep.",
};

export default function SimulatorPage() {
  return <Simulator />;
}
