"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { calculateAgeLabel } from "@/lib/portfolio-template";
import { GlassToolbar, GlassButton } from "@/components/liquid-glass";
import {
  Users,
  UserPlus,
  Search,
  Archive,
  ArrowRight,
  PlusCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";

export default function ChildrenListPage() {
  const { db } = useApp();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const filtered = useMemo(() => {
    const list = db?.children || [];
    return list.filter((c) => {
      if (!showArchived && c.archived_at) return false;
      if (showArchived && !c.archived_at) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.unique_code.toLowerCase().includes(q) ||
        (c.group_name && c.group_name.toLowerCase().includes(q))
      );
    });
  }, [db?.children, search, showArchived]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#E8476A] dark:text-[#FF8A5B]">
            Prontuários Isolados por Criança
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Crianças Acompanhadas na Toca
          </h1>
          <p className="text-xs sm:text-sm text-[#8C5A68] dark:text-[#F0BCC8]">
            Cada criança possui histórico, galeria, transcrições e relatórios estritamente individuais.
          </p>
        </div>

        <Link href="/criancas/nova">
          <GlassButton variant="primary" size="md" floating>
            <UserPlus className="h-4 w-4" />
            <span>+ Cadastrar Criança</span>
          </GlassButton>
        </Link>
      </div>

      {/* GlassToolbar de Busca e Filtro */}
      <GlassToolbar className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C5A68] dark:text-[#F0BCC8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, identificador único (TC-...) ou turma/grupo..."
            className="w-full apple-input pl-10 pr-4 py-2 text-sm"
          />
        </div>

        <GlassButton
          type="button"
          variant={showArchived ? "primary" : "glass"}
          size="sm"
          onClick={() => setShowArchived((v) => !v)}
        >
          <Archive className="h-4 w-4" />
          <span>{showArchived ? "Exibindo Arquivados" : "Ver Arquivados"}</span>
        </GlassButton>
      </GlassToolbar>

      {/* Lista de Crianças sobre Superfícies de Leitura Estáveis */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl apple-stable-surface p-12 text-center space-y-4">
          <Users className="h-12 w-12 text-[#E8476A] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold">
              {showArchived
                ? "Nenhum prontuário arquivado"
                : "Nenhuma criança encontrada"}
            </h3>
            <p className="text-xs sm:text-sm text-[#8C5A68] dark:text-[#F0BCC8] max-w-md mx-auto">
              Cadastre o perfil individual da criança para começar a registrar sessões com texto, fotos e gravação de áudio.
            </p>
          </div>
          {!showArchived && (
            <Link href="/criancas/nova">
              <GlassButton variant="primary" size="md">
                <UserPlus className="h-4 w-4" />
                <span>Cadastrar Criança Agora</span>
              </GlassButton>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((child) => {
            const sessionsCount =
              db?.sessions.filter((s) => s.child_id === child.id).length || 0;
            const reportsCount =
              db?.reports.filter((r) => r.child_id === child.id).length || 0;
            const initials = child.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={child.id}
                className="rounded-3xl apple-stable-surface p-5 hover:border-[#E8476A]/50 transition flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sunset-gradient text-white font-bold text-sm shadow-sm">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                          {child.unique_code}
                        </span>
                        <span className="text-[11px] text-[#8C5A68] dark:text-[#F0BCC8]">
                          {new Date(child.start_date + "T12:00:00").toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold truncate mt-0.5">
                        {child.name}
                      </h2>
                      <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
                        {calculateAgeLabel(child.birth_date)} • {child.group_name || "Psi. Maria Eduarda"}
                      </p>
                    </div>
                  </div>

                  {child.notes && (
                    <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] line-clamp-2 bg-[#FFF1EA] dark:bg-[#2A1424] rounded-2xl p-3">
                      {child.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E8476A]/12 dark:bg-[#FF8A5B]/20 px-2.5 py-1 font-semibold text-[#E8476A] dark:text-[#FF8A5B]">
                      <CheckCircle2 className="h-3 w-3" />
                      {sessionsCount} {sessionsCount === 1 ? "sessão" : "sessões"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#3B1425]/5 dark:bg-white/10 px-2.5 py-1 font-semibold text-[#8C5A68] dark:text-[#F0BCC8]">
                      <FileText className="h-3 w-3" />
                      {reportsCount} {reportsCount === 1 ? "relatório" : "relatórios"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#3B1425]/8 dark:border-white/10 gap-2">
                  <Link href={`/criancas/${child.id}`} className="flex-1">
                    <GlassButton variant="secondary" size="sm" className="w-full">
                      <span>Abrir Prontuário</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </GlassButton>
                  </Link>
                  <Link href={`/sessoes/nova?childId=${child.id}`}>
                    <GlassButton variant="primary" size="sm">
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Sessão</span>
                    </GlassButton>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
