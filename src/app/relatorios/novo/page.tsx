"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { GlassButton } from "@/components/liquid-glass";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Printer,
  Edit3,
  ShieldAlert,
  Calendar,
  Layers,
} from "lucide-react";

function ReportGeneratorWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preChildId = searchParams.get("childId") || "";
  const preSessionId = searchParams.get("sessionId") || "";

  const { db, currentUser, mutateState } = useApp();
  const activeChildren = useMemo(
    () => (db?.children || []).filter((c) => !c.archived_at),
    [db?.children]
  );

  const [selectedChildId, setSelectedChildId] = useState(preChildId);
  const [periodType, setPeriodType] = useState<
    "session" | "month" | "semester" | "all" | "custom"
  >(preSessionId ? "session" : "all");
  const [selectedSessionId, setSelectedSessionId] = useState(preSessionId);
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [periodLabel, setPeriodLabel] = useState(
    "2º Semestre — Setembro a Novembro de 2026"
  );
  const [templateId, setTemplateId] = useState(
    db?.report_templates[0]?.id || "tpl-toca-da-cria-oficial-v1"
  );
  const [responsibleProf, setResponsibleProf] = useState(
    currentUser?.name || "Educadora Responsável — Psi. Maria Eduarda"
  );

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (preChildId) {
      setSelectedChildId(preChildId);
    } else if (!selectedChildId && activeChildren.length > 0) {
      setSelectedChildId(activeChildren[0].id);
    }
  }, [preChildId, activeChildren, selectedChildId]);

  const handlePeriodTypeChange = (
    nextType: "session" | "month" | "semester" | "all" | "custom"
  ) => {
    setPeriodType(nextType);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (nextType === "month") {
      const mStart = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      setStartDate(mStart);
      setEndDate(todayStr);
      setPeriodLabel(
        `Mês de ${today.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })}`
      );
    } else if (nextType === "semester") {
      const semStart = new Date(today.getFullYear(), today.getMonth() - 5, 1)
        .toISOString()
        .slice(0, 10);
      setStartDate(semStart);
      setEndDate(todayStr);
      setPeriodLabel("Período Semestral de Vivências");
    } else if (nextType === "all") {
      setStartDate("2020-01-01");
      setEndDate("2099-12-31");
      setPeriodLabel("Todo o Período de Acompanhamento na Toca");
    }
  };

  const childSessionsInPeriod = useMemo(() => {
    if (!selectedChildId || !db) return [];
    return db.sessions.filter((s) => {
      if (s.child_id !== selectedChildId) return false;
      if (periodType === "session" && selectedSessionId) {
        return s.id === selectedSessionId;
      }
      const d = s.session_date.slice(0, 10);
      return d >= startDate && d <= endDate;
    });
  }, [db, selectedChildId, periodType, selectedSessionId, startDate, endDate]);

  const childObservationsInPeriod = useMemo(() => {
    if (!db) return [];
    const sIds = new Set(childSessionsInPeriod.map((s) => s.id));
    return db.observations.filter(
      (o) => o.child_id === selectedChildId && sIds.has(o.session_id)
    );
  }, [db, selectedChildId, childSessionsInPeriod]);

  const handleGenerate = async () => {
    setError("");
    if (!selectedChildId) {
      setError("Selecione uma criança no Passo 1.");
      return;
    }

    setGenerating(true);
    try {
      const res = await mutateState("generate_report", {
        child_id: selectedChildId,
        template_id: templateId,
        period_type: periodType,
        session_id: periodType === "session" ? selectedSessionId : null,
        start_date: startDate,
        end_date: endDate,
        period_label: periodLabel,
        responsible_professional: responsibleProf,
      });

      if (res.ok && res.report) {
        const rep = res.report as { id: string };
        router.push(`/relatorios/${rep.id}/editar`);
      } else {
        setError(String(res.error || "Não foi possível gerar o relatório."));
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#E8476A] dark:text-[#FF8A5B]">
          Portfólio das Vivências — Psi. Maria Eduarda
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Gerador de Relatórios com IA
        </h1>
        <p className="text-xs sm:text-sm text-[#8C5A68] dark:text-[#F0BCC8]">
          A IA consulta exclusivamente os registros autorizados da criança selecionada, preenche as 12 seções do Miolo Oficial da Psi. Maria Eduarda e encaminha para a sua revisão humana obrigatória.
        </p>
      </div>

      {/* Assistente de 5 Passos sobre Superfície de Leitura Estável */}
      <div className="rounded-3xl apple-stable-surface p-6 sm:p-8 space-y-6">
        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PASSO 1 */}
          <div className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-5 space-y-3 border border-[#3B1425]/8 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8476A] text-xs font-bold text-white">
                1
              </span>
              <h2 className="text-base font-bold">
                Passo 1 — Selecionar a Criança
              </h2>
            </div>

            {activeChildren.length === 0 ? (
              <div className="text-xs text-[#8C5A68] space-y-2">
                <p>Nenhuma criança cadastrada ainda.</p>
                <Link href="/criancas/nova">
                  <GlassButton variant="primary" size="sm">
                    + Cadastrar Criança
                  </GlassButton>
                </Link>
              </div>
            ) : (
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full apple-input px-3.5 py-2.5 text-sm font-medium"
              >
                {activeChildren.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.unique_code} • {c.group_name || "Psi. Maria Eduarda"})
                  </option>
                ))}
              </select>
            )}

            <div>
              <label className="block text-xs font-bold mb-1">
                Profissional Responsável pelo Portfólio
              </label>
              <input
                type="text"
                value={responsibleProf}
                onChange={(e) => setResponsibleProf(e.target.value)}
                className="w-full apple-input px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                Modelo Oficial de Relatório
              </label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full apple-input px-3 py-2 text-xs font-semibold"
              >
                {(db?.report_templates || []).map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} (v{tpl.version})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PASSO 2 */}
          <div className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-5 space-y-3 border border-[#3B1425]/8 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8476A] text-xs font-bold text-white">
                2
              </span>
              <h2 className="text-base font-bold">
                Passo 2 — Selecionar o Período
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "Todo o acompanhamento" },
                { id: "month", label: "Um mês" },
                { id: "semester", label: "Um semestre" },
                { id: "custom", label: "Intervalo personalizado" },
                { id: "session", label: "Sessão específica" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    handlePeriodTypeChange(
                      opt.id as "session" | "month" | "semester" | "all" | "custom"
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    periodType === opt.id
                      ? "sunset-gradient text-white shadow-sm"
                      : "bg-[#FFFFFF] dark:bg-[#33192A] text-[#8C5A68] dark:text-[#F0BCC8]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {periodType === "session" ? (
              <div>
                <label className="block text-xs font-bold mb-1">
                  Escolher Sessão Específica
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full apple-input px-3 py-2 text-xs"
                >
                  <option value="">Selecione uma sessão...</option>
                  {(db?.sessions || [])
                    .filter((s) => s.child_id === selectedChildId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {new Date(s.session_date).toLocaleDateString("pt-BR")} —{" "}
                        {s.notes.slice(0, 50)}...
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full apple-input px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full apple-input px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1">
                Rótulo do Período no Cabeçalho do Portfólio
              </label>
              <input
                type="text"
                value={periodLabel}
                onChange={(e) => setPeriodLabel(e.target.value)}
                className="w-full apple-input px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* PASSO 3 */}
        <div className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-5 space-y-3 border border-[#3B1425]/8 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8476A] text-xs font-bold text-white">
                3
              </span>
              <h2 className="text-base font-bold">
                Passo 3 — Evidências Recuperadas do Prontuário
              </h2>
            </div>
            <span className="rounded-full bg-[#E8476A]/15 px-3 py-1 text-xs font-bold text-[#E8476A] dark:text-[#FF8A5B]">
              {childSessionsInPeriod.length}{" "}
              {childSessionsInPeriod.length === 1
                ? "sessão encontrada"
                : "sessões encontradas"}{" "}
              • {childObservationsInPeriod.length} observações estruturadas
            </span>
          </div>

          {childSessionsInPeriod.length === 0 ? (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-4 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong>Regra Anti-Alucinação #9:</strong> Não há sessões registradas para esta criança no período selecionado. Caso você gere o relatório agora, o sistema sinalizará nos campos que não existem dados registrados, sem inventar acontecimentos.
              </div>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {childSessionsInPeriod.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl bg-[#FFFFFF] dark:bg-[#33192A] p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <strong className="text-[#E8476A] dark:text-[#FF8A5B] inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(s.session_date).toLocaleDateString("pt-BR")}:
                    </strong>{" "}
                    <span>{s.notes}</span>
                  </div>
                  <span className="text-[10px] text-[#8C5A68] whitespace-nowrap">
                    {s.professional_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PASSOS 4 E 5 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#3B1425]/10 dark:border-white/10">
          <div className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
            <strong className="text-[#3B1425] dark:text-[#FFF4F0] block">
              Passos 4 e 5 — Geração Estruturada + Revisão Humana Obrigatória
            </strong>
            Nenhum relatório é finalizado automaticamente sem a revisão e aprovação do profissional responsável.
          </div>

          <GlassButton
            type="button"
            variant="primary"
            size="lg"
            floating
            disabled={generating || !selectedChildId}
            onClick={handleGenerate}
          >
            <Sparkles className="h-5 w-5" />
            <span>
              {generating
                ? "Elaborando Portfólio das Vivências..."
                : "Gerar Portfólio com IA e Revisar"}
            </span>
          </GlassButton>
        </div>
      </div>

      {/* Lista de Relatórios Gerados */}
      <section className="rounded-3xl apple-stable-surface p-6 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Layers className="h-5 w-5 text-[#E8476A]" />
          Relatórios e Portfólios Gerados ({db?.reports.length || 0})
        </h2>

        {!db?.reports || db.reports.length === 0 ? (
          <p className="text-xs text-[#8C5A68] py-6 text-center">
            Nenhum relatório gerado ainda. Utilize o assistente acima para elaborar o primeiro Portfólio das Vivências.
          </p>
        ) : (
          <div className="space-y-3">
            {db.reports.map((rep) => {
              const child = db.children.find((c) => c.id === rep.child_id);
              const versionsCount = db.report_versions.filter(
                (v) => v.report_id === rep.id
              ).length;

              return (
                <div
                  key={rep.id}
                  className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#3B1425]/8 dark:border-white/10"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          rep.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {rep.status === "approved" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Aprovado por{" "}
                            {rep.approved_by}
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> Pendente de Revisão
                          </>
                        )}
                      </span>
                      <span className="text-xs font-bold">
                        {child?.name || rep.content.header.child_name}
                      </span>
                      <span className="text-[11px] text-[#8C5A68]">
                        • {rep.content.header.period_label} • {versionsCount}{" "}
                        {versionsCount === 1 ? "versão" : "versões"}
                      </span>
                    </div>
                    <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] line-clamp-1">
                      {rep.content.sec1_quem_e_essa_cria.demonstra}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/relatorios/${rep.id}/editar`}>
                      <GlassButton variant="secondary" size="sm">
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Revisar</span>
                      </GlassButton>
                    </Link>
                    <Link href={`/relatorios/${rep.id}/pdf`}>
                      <GlassButton variant="primary" size="sm">
                        <Printer className="h-3.5 w-3.5" />
                        <span>PDF A4</span>
                      </GlassButton>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ReportGeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-[#8C5A68]">
          Carregando gerador de relatórios...
        </div>
      }
    >
      <ReportGeneratorWizard />
    </Suspense>
  );
}
