# Battery Recycling Project

Website for a dry, acid-free recovery route for spent Li-ion black mass (ChE 303, Fluid Particle Systems).

- Live simulator of the Aspen-modelled flowsheet (`src/lib/model.ts`, sweep data in `src/data/kaala.json`).
- Pages: Home, About, Simulator, Analysis, Economics, Landscape, Team.
- Hero scroll animation: frames in `public/hero/f` (WebP), listed in `public/hero/manifest.json`.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production check
```

Stack: Next.js (App Router), React, TypeScript, Tailwind CSS, Recharts.

Company name, contact email and team details are placeholders in `src/config/brand.ts` and `src/data/team.ts`.
