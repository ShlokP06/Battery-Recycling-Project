import { BRAND, EMAIL_IS_PLACEHOLDER } from "@/config/brand";

export function Footer() {
  return (
    <footer data-theme="carbon" data-grain>
      <div className="wrap">
        <div className="hair-t grid gap-6 py-12 md:grid-cols-3 md:gap-4">
          <div className="space-y-2">
            <div className="label">Contact</div>
            {EMAIL_IS_PLACEHOLDER ? (
              <p className="data m-0">Contact via IIT Indore</p>
            ) : (
              <a className="link data" href={`mailto:${BRAND.email}`}>
                {BRAND.email}
              </a>
            )}
          </div>
          <div className="space-y-2">
            <div className="label">Location</div>
            <p className="data m-0">{BRAND.location}</p>
          </div>
          <div className="space-y-2">
            <div className="label">Status</div>
            <p className="data m-0">Student project. Aspen-modelled, not plant-tested.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
