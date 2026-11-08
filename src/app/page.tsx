"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { calculateAgeLabel } from "@/lib/portfolio-template";
import { LOVE_AND_FAITH_MESSAGES } from "@/lib/love-words";
import { GlassToolbar, GlassButton } from "@/components/liquid-glass";
import {
  Users,
  Calendar,
  FileCheck2,
  Clock,
  PlusCircle,
  Search,
  Heart,
  Sparkles,
  BookOpen,
  ArrowRight,
  Mic,
  Camera,
  FileText,
  Flower2,
  UserPlus,
} from "lucide-react";

export default function DashboardPage() {
  const { db, loading, openLoveModal } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState<"7d" | "30d" | "90d" | "all">("all");
  const [quoteIdx, setQuoteIdx] = useState(0);

  const activeQuote = LOVE_AND_FAITH_MESSAGES[quoteIdx % LOVE_AND_FAITH_MESSAGES.length];

  const activeChildren = useMemo(
    () => (db?.children || []).filter((c) => !c.archived_at),
    [db?.children]
  );

  const filteredSessions = useMemo(() => {
    const all = db?.sessions || [];
    if (periodFilter === "all") return all;
    const days = periodFilter === "7d" ? 7 : periodFilter === "30d" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return all.filter((s) => new Date(s.session_date) >= cutoff);
  }, [db?.sessions, periodFilter]);

  const searchedChildren = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeChildren.slice(0, 6);
    return activeChildren.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.unique_code.toLowerCase().includes(q) ||
        (c.group_name && c.group_name.toLowerCase().includes(q))
    );
  }, [activeChildren, searchQuery]);

  const totalChildren = activeChildren.length;
  const totalSessionsInPeriod = filteredSessions.length;
  const totalApprovedReports =
    (db?.reports || []).filter((r) => r.status === "approved").length;
  const pendingReviewReports =
    (db?.reports || []).filter(
      (r) => r.status === "pending_review" || r.status === "draft"
    ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <Flower2 className="h-10 w-10 text-[#E8476A] animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#8C5A68] dark:text-[#F0BCC8]">
            Carregando Psi. Maria Eduarda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Banner de Boas-Vindas: Superfície de Leitura Estável com Borda Luminosa e Palavra de Deus */}
      <section className="relative overflow-hidden rounded-3xl apple-stable-surface p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#E8476A]/12 dark:bg-[#FF8A5B]/15 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 h-40 w-40 rounded-full bg-rose-400/12 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E8476A]/10 dark:bg-[#FF8A5B]/20 px-3.5 py-1 text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B]">
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              <span>Psi. Maria Eduarda • Palavra do Dia & Fé</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#3B1425] dark:text-[#FFF4F0] leading-snug">
              {activeQuote.title}
            </h2>

            <p className="text-sm sm:text-base text-[#8C5A68] dark:text-[#F0BCC8] leading-relaxed">
              {activeQuote.romanticText}{" "}
              <span className="font-medium text-[#3B1425] dark:text-[#FFF4F0]">
                {activeQuote.encouragementText}
              </span>
            </p>

            <div className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-3.5 border border-[#3B1425]/8 dark:border-white/10 flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-[#E8476A] dark:text-[#FF8A5B] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-serif text-[#3B1425] dark:text-[#FFF4F0]">
                  {activeQuote.bibleVerse}
                </p>
                <span className="font-semibold text-[#E8476A] dark:text-[#FF8A5B] block mt-1">
                  — {activeQuote.bibleReference}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link href="/sessoes/nova">
              <GlassButton variant="primary" size="lg" floating className="w-full">
                <PlusCircle className="h-5 w-5" />
                <span>+ Novo registro</span>
              </GlassButton>
            </Link>

            <GlassButton
              variant="glass"
              size="md"
              onClick={() => {
                setQuoteIdx((i) => i + 1);
                openLoveModal();
              }}
            >
              <Sparkles className="h-4 w-4 text-[#E8476A] dark:text-[#FF8A5B]" />
              <span>Palavra & Reflexão do Dia</span>
            </GlassButton>
          </div>
        </div>
      </section>

      {/* GlassToolbar: Pesquisa Rápida e Filtro de Período */}
      <GlassToolbar className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C5A68] dark:text-[#F0BCC8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome da criança, identificador (TC-...) ou turma..."
            className="w-full apple-input pl-10 pr-4 py-2 text-sm placeholder:text-[#8C5A68] dark:placeholder:text-[#F0BCC8]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-[#8C5A68] dark:text-[#F0BCC8] whitespace-nowrap px-1">
            Período:
          </span>
          {[
            { id: "7d", label: "7 dias" },
            { id: "30d", label: "30 dias" },
            { id: "90d", label: "Trimestre" },
            { id: "all", label: "Todo o período" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodFilter(p.id as "7d" | "30d" | "90d" | "all")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                periodFilter === p.id
                  ? "sunset-gradient text-white shadow-sm"
                  : "text-[#8C5A68] dark:text-[#F0BCC8] hover:text-[#3B1425] dark:hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </GlassToolbar>

      {/* 4 Indicadores Principais sobre Superfícies de Leitura Estáveis */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/criancas"
          className="group rounded-3xl apple-stable-surface p-5 hover:border-[#E8476A]/40 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8]">
              Crianças Cadastradas
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8476A]/12 dark:bg-[#FF8A5B]/20 text-[#E8476A] dark:text-[#FF8A5B] group-hover:scale-105 transition">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#3B1425] dark:text-[#FFF4F0]">
            {totalChildren}
          </p>
          <p className="mt-1 text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
            Prontuários individuais isolados
          </p>
        </Link>

        <Link
          href="/sessoes/nova"
          className="group rounded-3xl apple-stable-surface p-5 hover:border-[#E8476A]/40 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8]">
              Sessões no Período
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8476A]/12 dark:bg-[#FF8A5B]/20 text-[#E8476A] dark:text-[#FF8A5B] group-hover:scale-105 transition">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#3B1425] dark:text-[#FFF4F0]">
            {totalSessionsInPeriod}
          </p>
          <p className="mt-1 text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
            Vivências em texto, foto ou áudio
          </p>
        </Link>

        <Link
          href="/relatorios/novo"
          className="group rounded-3xl apple-stable-surface p-5 hover:border-[#E8476A]/40 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8]">
              Relatórios Aprovados
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8476A]/12 dark:bg-[#FF8A5B]/20 text-[#E8476A] dark:text-[#FF8A5B] group-hover:scale-105 transition">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#3B1425] dark:text-[#FFF4F0]">
            {totalApprovedReports}
          </p>
          <p className="mt-1 text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
            Portfólios Psi. Maria Eduarda prontos para PDF
          </p>
        </Link>

        <Link
          href="/relatorios/novo"
          className="group rounded-3xl apple-stable-surface p-5 hover:border-[#E8476A]/40 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8]">
              Pendentes de Revisão
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#3B1425] dark:text-[#FFF4F0]">
            {pendingReviewReports}
          </p>
          <p className="mt-1 text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
            Aguardando aprovação humana
          </p>
        </Link>
      </section>

      {/* Painéis Principais: Crianças Acompanhadas + Últimos Registros */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-3xl apple-stable-surface p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-[#3B1425] dark:text-[#FFF4F0]">
                Crianças Acompanhadas Recentemente
              </h3>
              <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
                Prontuários individuais com excelente contraste de leitura
              </p>
            </div>
            <Link href="/criancas/nova">
              <GlassButton variant="glass" size="sm">
                <UserPlus className="h-3.5 w-3.5 text-[#E8476A] dark:text-[#FF8A5B]" />
                <span>Cadastrar Criança</span>
              </GlassButton>
            </Link>
          </div>

          {searchedChildren.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#8C5A68]/30 bg-[#FFF1EA] dark:bg-[#2A1424] p-8 text-center space-y-3">
              <Users className="h-10 w-10 text-[#E8476A] mx-auto" />
              <div className="space-y-1">
                <h4 className="font-semibold text-[#3B1425] dark:text-[#FFF4F0]">
                  Nenhuma criança cadastrada ainda
                </h4>
                <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] max-w-md mx-auto">
                  O sistema está limpo e pronto para receber os registros reais das crianças da Psi. Maria Eduarda.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/criancas/nova">
                  <GlassButton variant="primary" size="md">
                    <UserPlus className="h-4 w-4" />
                    <span>Cadastrar Primeira Criança</span>
                  </GlassButton>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {searchedChildren.map((child) => {
                const childSessionsCount = (db?.sessions || []).filter(
                  (s) => s.child_id === child.id
                ).length;
                const initials = child.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={child.id}
                    className="rounded-2xl border border-[#3B1425]/8 dark:border-white/10 bg-[#FFF1EA] dark:bg-[#2A1424] p-4 hover:border-[#E8476A]/50 transition flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl sunset-gradient text-white font-bold text-sm shadow-sm">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                            {child.unique_code}
                          </span>
                          <span className="text-[11px] font-medium text-[#8C5A68] dark:text-[#F0BCC8]">
                            {childSessionsCount} {childSessionsCount === 1 ? "sessão" : "sessões"}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#3B1425] dark:text-[#FFF4F0] truncate mt-0.5">
                          {child.name}
                        </h4>
                        <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] truncate">
                          {calculateAgeLabel(child.birth_date)} • {child.group_name || "Psi. Maria Eduarda"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-[#3B1425]/8 dark:border-white/10 text-xs">
                      <Link
                        href={`/criancas/${child.id}`}
                        className="font-semibold text-[#E8476A] dark:text-[#FF8A5B] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Prontuário</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/sessoes/nova?childId=${child.id}`}
                        className="rounded-full bg-[#E8476A]/12 dark:bg-[#FF8A5B]/20 px-3 py-1 font-semibold text-[#E8476A] dark:text-[#FF8A5B] hover:bg-[#E8476A] hover:text-white transition"
                      >
                        + Sessão
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Últimos Registros Adicionados */}
        <section className="lg:col-span-5 rounded-3xl apple-stable-surface p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-[#3B1425] dark:text-[#FFF4F0]">
                Últimos Registros
              </h3>
              <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
                Linha do tempo recente de vivências
              </p>
            </div>
            <Link
              href="/sessoes/nova"
              className="text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B] hover:underline"
            >
              + Nova sessão
            </Link>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#8C5A68]/30 bg-[#FFF1EA] dark:bg-[#2A1424] p-8 text-center space-y-3">
              <FileText className="h-9 w-9 text-[#8C5A68] mx-auto" />
              <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
                Nenhuma sessão registrada no período selecionado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.slice(0, 5).map((s) => {
                const child = db?.children.find((c) => c.id === s.child_id);
                const photosCount =
                  db?.session_attachments.filter(
                    (a) => a.session_id === s.id && a.type === "photo"
                  ).length || 0;
                const audiosCount =
                  db?.session_attachments.filter(
                    (a) => a.session_id === s.id && a.type === "audio"
                  ).length || 0;

                return (
                  <Link
                    key={s.id}
                    href={`/sessoes/${s.id}`}
                    className="block rounded-2xl border border-[#3B1425]/8 dark:border-white/10 bg-[#FFF1EA] dark:bg-[#2A1424] p-4 hover:border-[#E8476A]/50 transition space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#3B1425] dark:text-[#FFF4F0]">
                        {child?.name || "Criança"}
                      </span>
                      <span className="text-[#8C5A68] dark:text-[#F0BCC8]">
                        {new Date(s.session_date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] line-clamp-2 leading-relaxed">
                      {s.notes || "Sessão registrada com anexos de mídia."}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[#E8476A] dark:text-[#FF8A5B] font-medium">
                      {photosCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Camera className="h-3.5 w-3.5" /> {photosCount} foto(s)
                        </span>
                      )}
                      {audiosCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Mic className="h-3.5 w-3.5" /> {audiosCount} áudio(s)
                        </span>
                      )}
                      <span className="ml-auto underline">Abrir →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
