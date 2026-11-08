"use client";

import React, { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { GlassButton } from "@/components/liquid-glass";
import {
  ShieldCheck,
  Download,
  Trash2,
  Database,
  Cpu,
  Mic,
  FileCheck2,
  ClipboardList,
  Sun,
  Moon,
} from "lucide-react";

export default function SettingsAndPrivacyPage() {
  const { db, integrationStatus, mutateState, theme, toggleTheme } = useApp();
  const [selectedChildForLgpd, setSelectedChildForLgpd] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleExportChildData = () => {
    if (!selectedChildForLgpd || !db) return;
    const child = db.children.find((c) => c.id === selectedChildForLgpd);
    if (!child) return;

    const exportBundle = {
      exported_at: new Date().toISOString(),
      lgpd_notice:
        "Exportação integral de dados do prontuário conforme direito de acesso LGPD",
      child,
      sessions: db.sessions.filter((s) => s.child_id === child.id),
      attachments: db.session_attachments.filter((a) => a.child_id === child.id),
      transcriptions: db.transcriptions.filter((t) => t.child_id === child.id),
      observations: db.observations.filter((o) => o.child_id === child.id),
      reports: db.reports.filter((r) => r.child_id === child.id),
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prontuario_lgpd_${child.unique_code}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback(`Dados do prontuário ${child.unique_code} exportados com sucesso.`);
  };

  const handleDeleteChildLgpd = async () => {
    if (!selectedChildForLgpd || !db) return;
    const child = db.children.find((c) => c.id === selectedChildForLgpd);
    if (!child) return;

    await mutateState("delete_child_lgpd", { child_id: child.id });
    setSelectedChildForLgpd("");
    setFeedback(
      `Prontuário ${child.unique_code} e todos os seus registros foram excluídos permanentemente conforme solicitação LGPD.`
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#E8476A] dark:text-[#FF8A5B]">
            Acompanhamento Infantil • Segurança, Privacidade & LGPD
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Configurações, Aparência e Proteção de Dados
          </h1>
          <p className="text-xs sm:text-sm text-[#8C5A68] dark:text-[#F0BCC8]">
            Alternância entre Light Mode e Dark Mode, trilha de auditoria e direitos dos responsáveis legais.
          </p>
        </div>

        <GlassButton variant="glass" size="md" onClick={toggleTheme}>
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4 text-amber-300" />
              <span>Ativar Light Mode (#FFF1EA)</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-[#E8476A]" />
              <span>Ativar Dark Mode (#1F0E1B)</span>
            </>
          )}
        </GlassButton>
      </div>

      {feedback && (
        <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          {feedback}
        </div>
      )}

      {/* Status das Integrações */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl apple-stable-surface p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E8476A] dark:text-[#FF8A5B]">
            <Cpu className="h-4 w-4" />
            <span>Serviço de IA</span>
          </div>
          <p className="text-xs font-semibold">
            {integrationStatus?.aiProvider || "Motor Observacional Local Ativo"}
          </p>
          <p className="text-[11px] text-[#8C5A68]">
            Configurável via `GEMINI_API_KEY` ou `OPENAI_API_KEY`
          </p>
        </div>

        <div className="rounded-3xl apple-stable-surface p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E8476A] dark:text-[#FF8A5B]">
            <Mic className="h-4 w-4" />
            <span>Transcrição de Áudio</span>
          </div>
          <p className="text-xs font-semibold">
            VoiceStudio Local (`127.0.0.1:3900`) + Web Speech
          </p>
          <p className="text-[11px] text-[#8C5A68]">
            Sem custo de nuvem quando ativo localmente
          </p>
        </div>

        <div className="rounded-3xl apple-stable-surface p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E8476A] dark:text-[#FF8A5B]">
            <Database className="h-4 w-4" />
            <span>Banco de Dados</span>
          </div>
          <p className="text-xs font-semibold">
            {integrationStatus?.databaseProvider ||
              "Persistência Local + Schema Supabase"}
          </p>
          <p className="text-[11px] text-[#8C5A68]">
            Migração em `supabase/migrations/001_initial_schema.sql`
          </p>
        </div>

        <div className="rounded-3xl apple-stable-surface p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E8476A] dark:text-[#FF8A5B]">
            <FileCheck2 className="h-4 w-4" />
            <span>Modelo Oficial PDF</span>
          </div>
          <p className="text-xs font-semibold">
            Miolo_Portfolio_Vivencias_Toca_da_Cria.docx
          </p>
          <p className="text-[11px] text-[#8C5A68]">
            12 seções oficiais mapeadas para A4
          </p>
        </div>
      </section>

      {/* Direitos LGPD */}
      <section className="rounded-3xl apple-stable-surface p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#E8476A]" />
          <h2 className="text-lg font-bold">
            Portabilidade e Exclusão de Dados (LGPD — Melhor Interesse da Criança)
          </h2>
        </div>
        <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
          Permite exportar integralmente os registros de uma criança em formato estruturado ou realizar a exclusão definitiva mediante solicitação formal.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={selectedChildForLgpd}
            onChange={(e) => setSelectedChildForLgpd(e.target.value)}
            className="flex-1 apple-input px-3.5 py-2.5 text-xs font-semibold"
          >
            <option value="">Selecione um prontuário...</option>
            {(db?.children || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.unique_code})
              </option>
            ))}
          </select>

          <GlassButton
            type="button"
            variant="primary"
            size="md"
            disabled={!selectedChildForLgpd}
            onClick={handleExportChildData}
          >
            <Download className="h-4 w-4" />
            <span>Exportar Prontuário (JSON)</span>
          </GlassButton>

          <GlassButton
            type="button"
            variant="danger"
            size="md"
            disabled={!selectedChildForLgpd}
            onClick={handleDeleteChildLgpd}
          >
            <Trash2 className="h-4 w-4" />
            <span>Excluir Dados (LGPD)</span>
          </GlassButton>
        </div>
      </section>

      {/* Trilha de Auditoria */}
      <section className="rounded-3xl apple-stable-surface p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[#E8476A]" />
          <h2 className="text-lg font-bold">
            Trilha de Auditoria (`audit_logs`)
          </h2>
        </div>

        {!db?.audit_logs || db.audit_logs.length === 0 ? (
          <p className="text-xs text-[#8C5A68] py-4">
            Nenhuma operação registrada ainda na trilha de auditoria.
          </p>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-2">
            {db.audit_logs.slice(0, 30).map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] px-4 py-2.5 text-xs gap-1"
              >
                <div>
                  <span className="font-bold text-[#E8476A] dark:text-[#FF8A5B] mr-2">
                    [{log.action}]
                  </span>
                  <span>{log.details}</span>
                </div>
                <div className="text-[11px] text-[#8C5A68] whitespace-nowrap">
                  {log.user_name} •{" "}
                  {new Date(log.created_at).toLocaleString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
