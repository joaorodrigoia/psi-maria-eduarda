"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Mic, FileText } from "lucide-react";

/**
 * GlassTabBar — Barra inferior flutuante com efeito Apple Liquid Glass para Mobile.
 * Navegação entre Início, Crianças, Registros e Relatórios.
 */
export function GlassTabBar() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Início", icon: LayoutDashboard, match: (p: string) => p === "/" },
    {
      href: "/criancas",
      label: "Crianças",
      icon: Users,
      match: (p: string) => p.startsWith("/criancas"),
    },
    {
      href: "/sessoes/nova",
      label: "Registros",
      icon: Mic,
      match: (p: string) => p.startsWith("/sessoes"),
      isAction: true,
    },
    {
      href: "/relatorios/novo",
      label: "Relatórios",
      icon: FileText,
      match: (p: string) => p.startsWith("/relatorios"),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 inset-x-4 z-30 rounded-full liquid-glass px-3 py-2 flex items-center justify-around print:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.match(pathname);

        if (item.isAction) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 rounded-full sunset-gradient text-white px-4 py-2 text-xs font-semibold shadow-[0_6px_18px_-2px_rgba(232,71,106,0.5),inset_0_1px_0_0_rgba(255,255,255,0.35)]"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full text-[11px] font-medium transition ${
              active
                ? "text-[#E8476A] dark:text-[#FF8A5B] font-bold"
                : "text-[#8C5A68] dark:text-[#F0BCC8]"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
