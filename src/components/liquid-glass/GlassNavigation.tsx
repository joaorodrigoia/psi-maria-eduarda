"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Mic,
  FileText,
  Search,
  Image as ImageIcon,
  Layers,
  Settings,
  Heart,
  Sun,
  Moon,
  Flower2,
  LogIn,
} from "lucide-react";

export interface GlassNavigationProps {
  onOpenLoveModal: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  userName: string;
  userRoleLabel: string;
  pendingReportsCount: number;
}

const PRIMARY_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/criancas", label: "Crianças", icon: Users },
  { href: "/sessoes/nova", label: "Sessões & Registros", icon: Mic },
  { href: "/relatorios/novo", label: "Relatórios (Portfólio)", icon: FileText },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const SECONDARY_ITEMS = [
  { href: "/busca", label: "Busca Inteligente IA", icon: Search },
  { href: "/galeria", label: "Galeria de Fotos & Áudios", icon: ImageIcon },
  { href: "/modelos", label: "Miolo Psi. Maria Eduarda", icon: Layers },
];

/**
 * GlassNavigation — Sidebar lateral flutuante com material translúcido Apple Liquid Glass.
 */
export function GlassNavigation({
  onOpenLoveModal,
  theme,
  onToggleTheme,
  userName,
  userRoleLabel,
  pendingReportsCount,
}: GlassNavigationProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-4 md:left-4 z-30 rounded-[28px] liquid-glass overflow-hidden print:hidden">
      {/* Identidade Visual Apple Liquid Glass + Psi. Maria Eduarda */}
      <div className="p-5 border-b border-[#3B1425]/10 dark:border-white/10">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl sunset-gradient text-white shadow-md group-hover:scale-105 transition-transform">
              <Flower2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8476A] dark:text-[#FF8A5B] block">
                Psi. Maria Eduarda
              </span>
              <h1 className="text-base font-bold tracking-tight text-[#3B1425] dark:text-[#FFF4F0] leading-tight">
                Portfólio Vivências
              </h1>
              <p className="text-[11px] text-[#8C5A68] dark:text-[#F0BCC8]">
                Acompanhamento Infantil
              </p>
            </div>
          </Link>

          <button
            onClick={onToggleTheme}
            className="rounded-full p-2 liquid-glass-pill text-[#3B1425] dark:text-[#FFF4F0] hover:scale-105 transition"
            title={theme === "dark" ? "Mudar para Light Mode" : "Mudar para Dark Mode"}
            aria-label="Alternar tema Claro/Escuro"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-300" />
            ) : (
              <Moon className="h-4 w-4 text-[#E8476A]" />
            )}
          </button>
        </div>

        {/* Botão Flutuante da Palavra do Dia & Encorajamento */}
        <button
          onClick={onOpenLoveModal}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E8476A]/15 via-rose-500/15 to-orange-400/20 dark:from-[#FF8A5B]/20 dark:via-rose-500/20 dark:to-orange-400/20 px-3.5 py-2.5 text-xs font-semibold text-[#3B1425] dark:text-[#FFF4F0] border border-white/60 dark:border-white/15 shadow-sm hover:brightness-105 transition"
        >
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          <span>Palavra & Encorajamento</span>
        </button>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 px-3.5 py-4 space-y-5 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
            Navegação Principal
          </p>
          {PRIMARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                  active
                    ? "text-white font-semibold"
                    : "text-[#8C5A68] dark:text-[#F0BCC8] hover:text-[#3B1425] dark:hover:text-[#FFF4F0] hover:bg-white/40 dark:hover:bg-white/5"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-2xl sunset-gradient shadow-[0_6px_18px_-3px_rgba(255,107,107,0.55),inset_0_1px_0_0_rgba(255,255,255,0.35)]"
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.href === "/relatorios/novo" && pendingReportsCount > 0 && (
                  <span className="relative z-10 rounded-full bg-white/90 text-[#E8476A] px-2 py-0.5 text-[10px] font-bold">
                    {pendingReportsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
            Recursos & Acervo
          </p>
          {SECONDARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-2 text-xs font-medium transition ${
                  active
                    ? "bg-[#E8476A]/15 dark:bg-[#FF8A5B]/20 text-[#E8476A] dark:text-[#FF8A5B] font-semibold"
                    : "text-[#8C5A68] dark:text-[#F0BCC8] hover:text-[#3B1425] dark:hover:text-[#FFF4F0] hover:bg-white/40 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-[#3B1425]/10 dark:border-white/10 space-y-2.5">
        <div className="rounded-2xl bg-white/60 dark:bg-[#2A1424]/70 p-3 border border-[#3B1425]/5 dark:border-white/10 text-[11px] text-[#8C5A68] dark:text-[#F0BCC8] leading-relaxed">
          <strong className="text-[#3B1425] dark:text-[#FFF4F0] block mb-0.5">
            Registro Pedagógico e Observacional
          </strong>
          Não substitui nem realiza diagnósticos clínicos.
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="truncate">
            <p className="text-xs font-semibold text-[#3B1425] dark:text-[#FFF4F0] truncate">
              {userName}
            </p>
            <p className="text-[11px] text-[#8C5A68] dark:text-[#F0BCC8] truncate">
              {userRoleLabel}
            </p>
          </div>
          <Link
            href="/login"
            className="rounded-full p-2 liquid-glass-pill text-[#E8476A] dark:text-[#FF8A5B] hover:scale-105 transition"
            title="Perfil / Login"
          >
            <LogIn className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
