"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, BarChart2, Map, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/historial", icon: Clock, label: "Historial" },
  { href: "/estadisticas", icon: BarChart2, label: "Stats" },
  { href: "/mapa", icon: Map, label: "Mapa" },
  { href: "/configuracion", icon: Settings, label: "Config" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around pb-safe">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors",
                active ? "text-coca-red" : "text-muted-foreground"
              )}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className="transition-all"
              />
              <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
