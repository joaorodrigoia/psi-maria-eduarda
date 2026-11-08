"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "./AppProvider";
import {
  GlassNavigation,
  GlassTabBar,
  GlassButton,
} from "@/components/liquid-glass";
import {
  PlusCircle,
  Heart,
  Flower2,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { openLoveModal, currentUser, db, theme, toggleTheme } = useApp();

  const pendingReportsCount =
    db?.reports.filter((r) => r.status === "pending_review").length || 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-[#3B1425] dark:text-[#FFF4F0] transition-colors">
      {/* Glow ambiental sutil estilo macOS/iPadOS para valorizar o backdrop-filter */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 print:hidden">
        <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-orange-400/30 dark:bg-orange-500/15 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-pink-400/30 dark:bg-pink-600/15 blur-3xl" />
      </div>

      {/* Sidebar Flutuante Apple Liquid Glass (Desktop & Tablet) */}
      <GlassNavigation
        onOpenLoveModal={openLoveModal}
        theme={theme}
        onToggleTheme={toggleTheme}
        userName={currentUser?.name || "Psi. Maria Eduarda"}
        userRoleLabel={
          currentUser?.role === "coordenacao"
            ? "Psicologia & Desenvolvimento Infantil"
            : "Acompanhamento Infantil"
        }
        pendingReportsCount={pendingReportsCount}
      />

      {/* Área Principal de Conteúdo */}
      <div className="relative z-10 flex-1 md:pl-80 flex flex-col min-h-screen pb-24 md:pb-8">
        {/* Barra Superior Flutuante Translúcida (Glass Header) */}
        <header className="sticky top-4 z-20 mx-4 sm:mx-8 mt-4 rounded-2xl liquid-glass px-4 sm:px-6 py-3 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5 md:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8476A] text-white shadow">
                <Flower2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#3B1425] dark:text-[#FFF4F0] block leading-none">
                  Psi. Maria Eduarda
                </span>
                <span className="text-[10px] text-[#8C5A68] dark:text-[#F0BCC8]">
                  Portfólio das Vivências
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-[#8C5A68] dark:text-[#F0BCC8]">
            <Sparkles className="h-3.5 w-3.5 text-[#E8476A] dark:text-[#FF8A5B]" />
            <span>
              “Desenvolvimento que acontece enquanto a infância acontece”
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={toggleTheme}
              className="md:hidden rounded-full p-2 liquid-glass-pill text-[#3B1425] dark:text-[#FFF4F0]"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-300" />
              ) : (
                <Moon className="h-4 w-4 text-[#E8476A]" />
              )}
            </button>

            <GlassButton
              variant="glass"
              size="sm"
              onClick={openLoveModal}
              title="Abrir Palavra do Dia e Encorajamento"
            >
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
              <span className="hidden sm:inline">Palavra do Dia</span>
              <span className="sm:hidden">Palavra</span>
            </GlassButton>

            <Link href="/sessoes/nova">
              <GlassButton variant="primary" size="sm" floating>
                <PlusCircle className="h-4 w-4" />
                <span>+ Novo registro</span>
              </GlassButton>
            </Link>
          </div>
        </header>

        {/* Conteúdo das Páginas */}
        <main className="flex-1 px-4 sm:px-8 pt-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Barra Inferior Flutuante Mobile (GlassTabBar) */}
      <GlassTabBar />
    </div>
  );
}
