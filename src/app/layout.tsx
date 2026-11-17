import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/martian-mono/wght.css";
import "./globals.css";
import { BRAND } from "@/config/brand";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: `${BRAND.name}. ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
  description: BRAND.description,
};
export const viewport: Viewport = { themeColor: "#0d0e0c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="label fixed left-4 top-2 z-[100] -translate-y-20 bg-[#ece6da] px-3 py-3 !text-[#0d0e0c] focus:translate-y-0"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
