# LITHNOVA Recycling site (ChE 303)

Next.js (App Router) + TypeScript + Tailwind v4 + React Three Fiber.

## Run
    npm install
    npm run dev        # http://localhost:3000
    npm run build && npm start

## Where things are
- `src/config/brand.ts`  company name, contact email, nav (rename the company here)
- `src/data/kaala.json`  Aspen sweep + hand-calc results; regenerate with
  `python 04_python/export_site_data.py 07_site/src/data/kaala.json` (run from the repo root)
- `src/data/team.ts`     team members; photos go in `public/team/`
- `src/lib/model.ts`     live model: Bond shredder, Lapple cyclone, fan power (analytic) +
  interpolation of the 36 Aspen runs for recovery and purity
- `src/components/hero/` 3D battery hero (procedural, scroll-driven)
- `src/app/{simulator,analysis,competitors,team}` pages

Deploy: push to GitHub, import the repo in Vercel (root directory `07_site`).
