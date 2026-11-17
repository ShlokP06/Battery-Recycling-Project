"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV } from "@/config/brand";
import { Logo } from "@/components/Logo";

const PAPER = ["/about", "/analysis", "/competitors"];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const theme = PAPER.some((p) => path.startsWith(p)) ? "paper" : "carbon";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <header data-theme={theme} className="absolute inset-x-0 top-0 z-40 !bg-transparent">
      <div className="wrap flex h-14 items-center justify-between md:h-16">
        <Link href="/" className="tap" aria-label="Kaala, home">
          <Logo size={28} keyline={theme === "paper"} />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className="link label nowrap tap !text-[var(--fg)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          ref={menuRef}
          type="button"
          className="label tap nowrap !text-[var(--fg)] md:hidden"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen(true)}
        >
          Menu
        </button>
      </div>
      {open && (
        <div id="menu" data-theme="carbon" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[90] flex flex-col overflow-y-auto">
          <div className="wrap flex h-14 w-full items-center justify-between">
            <Logo size={28} />
            <button ref={closeRef} type="button" className="label tap nowrap !text-[var(--fg)]" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <ul className="wrap m-0 flex w-full flex-1 list-none flex-col justify-center gap-5 pb-16">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`display-l link ${isActive(n.href) ? "is-on" : ""}`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
