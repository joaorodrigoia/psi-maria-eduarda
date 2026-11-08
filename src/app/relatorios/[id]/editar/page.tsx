"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { PortfolioReportContent } from "@/lib/types";
import { GlassToolbar, GlassButton } from "@/components/liquid-glass";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  History,
  Printer,
  Save,
  Sparkles,
  BookOpenCheck,
  Eye,
  Edit3,
  FileText,
} from "lucide-react";

export default function ReportReviewEditorPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = String(params.id || "");
  const { db, currentUser, mutateState } = useApp();

  const report = db?.reports.find((r) => r.id === reportId);
  const child = db?.children.find((c) => c.id === report?.child_id);
  const versions = (db?.report_versions || []).filter(
    (v) => v.report_id === reportId
  );

  // Recuperar sessões de origem (report_sources)
  const sourceSessionIds = new Set(
    (db?.report_sources || [])
      .filter((rs) => rs.report_id === reportId)
      .map((rs) => rs.session_id)
  );
  const sourceSessions = (db?.sessions || []).filter(
    (s) => s.child_id === report?.child_id && (sourceSessionIds.size === 0 || sourceSessionIds.has(s.id))
  );

  const [viewMode, setViewMode] = useState<"editor" | "preview_a4">("editor");
  const [content, setContent] = useState<PortfolioReportContent | null>(
    report ? JSON.parse(JSON.stringify(report.content)) : null
  );
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (report && !content) {
      setContent(JSON.parse(JSON.stringify(report.content)));
    }
  }, [report, content]);

  if (!report || !content) {
    return (
      <div className="rounded-3xl apple-stable-surface p-10 text-center space-y-4">
        <p className="text-xl font-bold">Relatório não encontrado</p>
        <Link href="/relatorios/novo">
          <GlassButton variant="primary" size="md">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Gerador</span>
          </GlassButton>
        </Link>
      </div>
    );
  }

  const handleSave = async (approve: boolean) => {
    setSaving(true);
    setStatusMessage("");
    try {
      const res = await mutateState("update_report", {
        id: report.id,
        content,
        approve,
        approved_by: currentUser?.name || report.responsible_professional,
      });

      if (res.ok) {
        setStatusMessage(
          approve
            ? "Portfólio aprovado com sucesso! Uma nova versão imutável foi salva e o PDF A4 está liberado."
            : "Revisão salva com sucesso em uma nova versão do histórico!"
        );
        if (approve) {
          setTimeout(() => {
            router.push(`/relatorios/${report.id}/pdf`);
          }, 900);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReformulate = async (
    currentText: string,
    instruction: "mais_acolhedor" | "mais_conciso" | "destacar_mediacao",
    updater: (newText: string) => void
  ) => {
    const res = await mutateState("reformulate_text", {
      text: currentText,
      instruction,
    });
    if (res.ok && typeof res.text === "string") {
      updater(res.text);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* GlassToolbar Translúcida Flutuante do Editor de Relatórios */}
      <GlassToolbar sticky className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/relatorios/novo"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Gerador</span>
          </Link>
          <span className="text-[#8C5A68]/40">|</span>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-[#3B1425] dark:text-[#FFF4F0]">
              {content.header.child_name}
            </h1>
            <p className="text-[11px] text-[#8C5A68] dark:text-[#F0BCC8]">
              Miolo Psi. Maria Eduarda • {versions.length} versão(ões)
            </p>
          </div>
        </div>

        {/* Alternador entre Editor Minimalista e Pré-visualização de Documento A4 */}
        <div className="flex items-center gap-1 rounded-full bg-[#3B1425]/5 dark:bg-white/10 p-1">
          <button
            type="button"
            onClick={() => setViewMode("editor")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "editor"
                ? "sunset-gradient text-white shadow-sm"
                : "text-[#8C5A68] dark:text-[#F0BCC8]"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Editor Minimalista</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview_a4")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "preview_a4"
                ? "sunset-gradient text-white shadow-sm"
                : "text-[#8C5A68] dark:text-[#F0BCC8]"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Pré-visualização A4</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <GlassButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={saving}
            onClick={() => handleSave(false)}
          >
            <Save className="h-3.5 w-3.5" />
            <span>Salvar Rascunho</span>
          </GlassButton>

          <GlassButton
            type="button"
            variant="primary"
            size="sm"
            floating
            disabled={saving}
            onClick={() => handleSave(true)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Aprovar & Liberar PDF</span>
          </GlassButton>

          <Link href={`/relatorios/${report.id}/pdf`}>
            <GlassButton variant="glass" size="sm">
              <Printer className="h-3.5 w-3.5" />
              <span>Exportar A4</span>
            </GlassButton>
          </Link>
        </div>
      </GlassToolbar>

      {statusMessage && (
        <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Workspace em Painéis: Coluna Principal (Editor ou Folha A4 Estável) + Painel Lateral de Fontes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA PRINCIPAL (8 Colunas) */}
        <div className="lg:col-span-8 space-y-6">
          {viewMode === "preview_a4" ? (
            /* Pré-visualização de Documento A4 em Superfície de Leitura Estável */
            <article className="rounded-3xl bg-[#FFFFFF] text-[#3B1425] border border-[#3B1425]/15 p-8 sm:p-10 shadow-xl space-y-6">
              <div className="border-b border-[#3B1425]/15 pb-4 text-center space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8476A]">
                  PSI. MARIA EDUARDA — PRÉ-VISUALIZAÇÃO A4
                </p>
                <h2 className="font-serif text-2xl font-bold">
                  Portfólio das Vivências
                </h2>
                <p className="text-xs text-[#8C5A68]">
                  {content.header.child_name} • {content.header.period_label} •{" "}
                  {content.header.group_name}
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
                <div>
                  <h3 className="font-bold text-[#E8476A] uppercase text-xs mb-1">
                    1. QUEM É ESSA CRIA NA TOCA?
                  </h3>
                  <p>{content.sec1_quem_e_essa_cria.demonstra}</p>
                  <p className="mt-1">{content.sec1_quem_e_essa_cria.interessa_por}</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#E8476A] uppercase text-xs mb-1">
                    2. MEU JEITO DE BRINCAR
                  </h3>
                  <p>{content.sec2_meu_jeito_de_brincar.brincadeiras_materiais_interesse}</p>
                  <p className="mt-1">{content.sec2_meu_jeito_de_brincar.mediacoes_favorecem}</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#E8476A] uppercase text-xs mb-1">
                    3. EU E O OUTRO
                  </h3>
                  <p>{content.sec3_eu_e_o_outro.aproxima_criancas_adultos}</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#E8476A] uppercase text-xs mb-1">
                    4. MEU CORPO EM MOVIMENTO
                  </h3>
                  <p>{content.sec4_meu_corpo_em_movimento.relato_corporal}</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#E8476A] uppercase text-xs mb-1">
                    5. DESCOBERTAS, PENSAMENTOS E APRENDIZAGENS
                  </h3>
                  <p>{content.sec5_descobertas_aprendizagens.relato_descobertas}</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#E8476A] uppercase text-xs mb-1">
                    10. UM OLHAR SOBRE MEU PERCURSO
                  </h3>
                  <p>{content.sec10_olhar_sobre_percurso.observamos_que}</p>
                  <p className="mt-1">{content.sec10_olhar_sobre_percurso.conquistas_destaque}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#3B1425]/10 flex justify-end">
                <Link href={`/relatorios/${report.id}/pdf`}>
                  <GlassButton variant="primary" size="md">
                    <Printer className="h-4 w-4" />
                    <span>Abrir Folha A4 Completa (12 Seções) para Impressão</span>
                  </GlassButton>
                </Link>
              </div>
            </article>
          ) : (
            /* Editor Minimalista sobre Superfícies de Leitura Estáveis */
            <>
              <section className="rounded-3xl apple-stable-surface p-6 space-y-4">
                <div className="border-b border-[#3B1425]/10 dark:border-white/10 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8476A] dark:text-[#FF8A5B]">
                      PSI. MARIA EDUARDA — Portfólio das Vivências
                    </span>
                    <h2 className="text-lg font-bold">
                      Identificação e Capa do Portfólio
                    </h2>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      report.status === "approved"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {report.status === "approved" ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Aprovado por{" "}
                        {report.approved_by}
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5" /> Em Revisão Humana
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Nome da Criança
                    </label>
                    <input
                      type="text"
                      value={content.header.child_name}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          header: { ...content.header, child_name: e.target.value },
                        })
                      }
                      className="w-full apple-input px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Período</label>
                    <input
                      type="text"
                      value={content.header.period_label}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          header: {
                            ...content.header,
                            period_label: e.target.value,
                          },
                        })
                      }
                      className="w-full apple-input px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Grupo</label>
                    <input
                      type="text"
                      value={content.header.group_name}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          header: { ...content.header, group_name: e.target.value },
                        })
                      }
                      className="w-full apple-input px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Profissional Responsável
                    </label>
                    <input
                      type="text"
                      value={content.header.responsible_professional}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          header: {
                            ...content.header,
                            responsible_professional: e.target.value,
                          },
                        })
                      }
                      className="w-full apple-input px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </section>

              {/* SEÇÃO 1 */}
              <section className="rounded-3xl apple-stable-surface p-6 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold">
                    1. QUEM É ESSA CRIA NA TOCA?
                  </h2>
                  <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
                    Apresente a criança pelo que ela demonstra, escolhe, comunica e constrói nas vivências.
                  </p>
                </div>

                {[
                  {
                    key: "demonstra" as const,
                    label: `${content.header.child_name} é uma criança que, em suas vivências na Toca, demonstra:`,
                  },
                  {
                    key: "interessa_por" as const,
                    label: "Costuma se interessar especialmente por:",
                  },
                  {
                    key: "relacoes_observamos" as const,
                    label: "Nas relações com outras crianças e adultos, observamos:",
                  },
                  {
                    key: "formas_preferidas_brincar" as const,
                    label: "Entre suas formas preferidas de brincar estão:",
                  },
                  {
                    key: "pudemos_conhecer" as const,
                    label: "Ao longo deste período, pudemos conhecer uma cria que:",
                  },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold">{field.label}</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleReformulate(
                              content.sec1_quem_e_essa_cria[field.key],
                              "mais_acolhedor",
                              (val) =>
                                setContent({
                                  ...content,
                                  sec1_quem_e_essa_cria: {
                                    ...content.sec1_quem_e_essa_cria,
                                    [field.key]: val,
                                  },
                                })
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-full bg-[#E8476A]/12 px-2.5 py-1 text-[10px] font-semibold text-[#E8476A] dark:text-[#FF8A5B]"
                        >
                          <Sparkles className="h-3 w-3" /> + Acolhedor
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleReformulate(
                              content.sec1_quem_e_essa_cria[field.key],
                              "mais_conciso",
                              (val) =>
                                setContent({
                                  ...content,
                                  sec1_quem_e_essa_cria: {
                                    ...content.sec1_quem_e_essa_cria,
                                    [field.key]: val,
                                  },
                                })
                            )
                          }
                          className="rounded-full bg-[#3B1425]/5 dark:bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-[#8C5A68] dark:text-[#F0BCC8]"
                        >
                          Conciso
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={content.sec1_quem_e_essa_cria[field.key]}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          sec1_quem_e_essa_cria: {
                            ...content.sec1_quem_e_essa_cria,
                            [field.key]: e.target.value,
                          },
                        })
                      }
                      className="w-full apple-input p-3 text-xs leading-relaxed"
                    />
                  </div>
                ))}
              </section>

              {/* SEÇÕES 2 E 3 */}
              <section className="rounded-3xl apple-stable-surface p-6 space-y-4">
                <h2 className="text-lg font-bold">2. MEU JEITO DE BRINCAR</h2>
                {[
                  { key: "brincadeiras_materiais_interesse" as const, label: "Brincadeiras e materiais de maior interesse:" },
                  { key: "como_explora_espacos" as const, label: "Como explora os espaços da Toca:" },
                  { key: "como_inicia_sustenta" as const, label: "Como inicia e sustenta suas brincadeiras:" },
                  { key: "propostas_individuais_coletivas" as const, label: "Como participa de propostas individuais e coletivas:" },
                  { key: "mediacoes_favorecem" as const, label: "Mediações que favorecem sua participação:" },
                ].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-bold">{field.label}</label>
                    <textarea
                      rows={2}
                      value={content.sec2_meu_jeito_de_brincar[field.key]}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          sec2_meu_jeito_de_brincar: {
                            ...content.sec2_meu_jeito_de_brincar,
                            [field.key]: e.target.value,
                          },
                        })
                      }
                      className="w-full apple-input p-3 text-xs leading-relaxed"
                    />
                  </div>
                ))}
              </section>

              <section className="rounded-3xl apple-stable-surface p-6 space-y-4">
                <h2 className="text-lg font-bold">
                  3. EU E O OUTRO — Relações, comunicação e convivência
                </h2>
                {[
                  { key: "aproxima_criancas_adultos" as const, label: "Como se aproxima das outras crianças e adultos?" },
                  { key: "comunica_desejos_necessidades" as const, label: "Como comunica desejos, interesses e necessidades?" },
                  { key: "compartilhamento_espacos_materiais" as const, label: "Como vivencia compartilhamento de espaços e materiais?" },
                  { key: "espera_turnos_combinados" as const, label: "Como lida com espera, turnos e combinados?" },
                  { key: "reage_conflitos_estrategias" as const, label: "Como reage aos conflitos e quais estratégias ajudam?" },
                ].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-bold">{field.label}</label>
                    <textarea
                      rows={2}
                      value={content.sec3_eu_e_o_outro[field.key]}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          sec3_eu_e_o_outro: {
                            ...content.sec3_eu_e_o_outro,
                            [field.key]: e.target.value,
                          },
                        })
                      }
                      className="w-full apple-input p-3 text-xs leading-relaxed"
                    />
                  </div>
                ))}
              </section>

              {/* SEÇÕES 4, 5, 6, 7, 10, 11, 12 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="rounded-3xl apple-stable-surface p-6 space-y-3">
                  <h2 className="text-base font-bold">4. MEU CORPO EM MOVIMENTO</h2>
                  <textarea
                    rows={4}
                    value={content.sec4_meu_corpo_em_movimento.relato_corporal}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        sec4_meu_corpo_em_movimento: {
                          ...content.sec4_meu_corpo_em_movimento,
                          relato_corporal: e.target.value,
                        },
                      })
                    }
                    className="w-full apple-input p-3 text-xs leading-relaxed"
                  />
                </section>

                <section className="rounded-3xl apple-stable-surface p-6 space-y-3">
                  <h2 className="text-base font-bold">
                    5. DESCOBERTAS, PENSAMENTOS E APRENDIZAGENS
                  </h2>
                  <textarea
                    rows={4}
                    value={content.sec5_descobertas_aprendizagens.relato_descobertas}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        sec5_descobertas_aprendizagens: {
                          ...content.sec5_descobertas_aprendizagens,
                          relato_descobertas: e.target.value,
                        },
                      })
                    }
                    className="w-full apple-input p-3 text-xs leading-relaxed"
                  />
                </section>
              </div>

              <section className="rounded-3xl apple-stable-surface p-6 space-y-4">
                <h2 className="text-lg font-bold">10. UM OLHAR SOBRE MEU PERCURSO</h2>
                {[
                  { key: "observamos_que" as const, label: "Durante este período, observamos que:" },
                  { key: "conquistas_destaque" as const, label: "Entre as conquistas que ganharam destaque estão:" },
                  { key: "maior_seguranca_para" as const, label: "Atualmente, demonstra maior segurança para:" },
                  { key: "necessita_mediacao_em" as const, label: "Ainda necessita de mediação especialmente em situações que envolvem:" },
                  { key: "favorecido_por_meio_de" as const, label: "Temos favorecido esse processo por meio de:" },
                  { key: "proximo_periodo_experiencias" as const, label: "Para o próximo período, continuaremos proporcionando experiências que favoreçam:" },
                ].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-bold">{field.label}</label>
                    <textarea
                      rows={2}
                      value={content.sec10_olhar_sobre_percurso[field.key]}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          sec10_olhar_sobre_percurso: {
                            ...content.sec10_olhar_sobre_percurso,
                            [field.key]: e.target.value,
                          },
                        })
                      }
                      className="w-full apple-input p-3 text-xs"
                    />
                  </div>
                ))}
              </section>
            </>
          )}
        </div>

        {/* PAINEL LATERAL DE FONTES & VERSÕES (4 Colunas) */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-36">
          {/* Painel de Fontes Originais */}
          <div className="rounded-3xl apple-stable-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#E8476A] dark:text-[#FF8A5B]" />
                Painel de Fontes Originais ({sourceSessions.length})
              </h3>
            </div>
            <p className="text-[11px] text-[#8C5A68] dark:text-[#F0BCC8]">
              Registros que sustentam cada seção deste Portfólio, garantindo rastreabilidade e fidelidade aos fatos.
            </p>

            {sourceSessions.length === 0 ? (
              <p className="text-xs text-[#8C5A68] py-4">
                Nenhuma sessão de origem vinculada a este período.
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {sourceSessions.map((ses) => (
                  <Link
                    key={ses.id}
                    href={`/sessoes/${ses.id}`}
                    className="block rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-3 border border-[#3B1425]/8 dark:border-white/10 hover:border-[#E8476A]/50 transition space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                        Sessão de {new Date(ses.session_date).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="text-[#8C5A68] dark:text-[#F0BCC8]">
                        {ses.professional_name}
                      </span>
                    </div>
                    <p className="text-xs text-[#3B1425] dark:text-[#FFF4F0] line-clamp-3">
                      {ses.notes}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            {child && (
              <Link
                href={`/criancas/${child.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B] underline pt-1"
              >
                <BookOpenCheck className="h-3.5 w-3.5" />
                <span>Abrir Prontuário Completo de {child.name}</span>
              </Link>
            )}
          </div>

          {/* Painel de Histórico de Versões Imutáveis */}
          <div className="rounded-3xl apple-stable-surface p-5 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-[#E8476A] dark:text-[#FF8A5B]" />
              Versões Preservadas ({versions.length})
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  className="flex items-center justify-between rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-3 text-xs gap-2"
                >
                  <div className="min-w-0">
                    <strong className="block truncate">
                      v{ver.version_number}: {ver.version_label}
                    </strong>
                    <span className="text-[10px] text-[#8C5A68] dark:text-[#F0BCC8]">
                      {new Date(ver.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setContent(JSON.parse(JSON.stringify(ver.content)))
                    }
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold liquid-glass-pill shrink-0"
                  >
                    Restaurar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
