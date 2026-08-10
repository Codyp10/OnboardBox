"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const CLIENT_NAV = [
  { href: "/home", label: "Home" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/reporting", label: "Reporting" },
  { href: "/approvals", label: "Approvals" },
  { href: "/files", label: "Files" },
  { href: "/billing", label: "Billing" },
  { href: "/account", label: "Account" },
];

const ADMIN_NAV = [
  { href: "/admin/companies", label: "Clients" },
];

export function PortalNav({
  mode,
  userLabel,
}: {
  mode: "client" | "admin";
  userLabel: string;
}) {
  const pathname = usePathname();
  const items = mode === "admin" ? ADMIN_NAV : CLIENT_NAV;

  return (
    <header className="border-b border-ob-stone-300/80 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href={mode === "admin" ? "/admin/companies" : "/home"} className="group">
            <div className="font-display text-2xl tracking-tight text-ob-teal-900 transition group-hover:text-ob-teal-700">
              OnboardBox
            </div>
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-ob-ink-muted">
              JMCG client portal
            </div>
          </Link>
          <div className="text-right text-sm text-ob-ink-muted">
            <div className="font-medium text-ob-ink">{userLabel}</div>
            <div>{mode === "admin" ? "Administrator" : "Client"}</div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-1">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-[10px] px-3 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-ob-teal-900 text-white"
                    : "text-ob-ink-muted hover:bg-ob-stone-100 hover:text-ob-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
