"use client";

import React, { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { GlassButton } from "@/components/liquid-glass";
import { CheckCircle2, FileText, Layers, PlusCircle } from "lucide-react";

export default function ReportTemplatesPage() {
  const { db, mutateState } = useApp();
  const [newTplName, setNewTplName] = useState("");
  const [newTplSubtitle, setNewTplSubtitle] = useState(
    "Portfólio das Vivências — Desenvolvimento que acontece enquanto a infância acontece"
  );
  const [creating, setCreating] = useState(false);

  const templates = db?.report_templates || [];
  const officialTemplate = templates[0];

  const handleCreateCustomTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplName.trim()) return;
    setCreating(true);
    try {
      await mutateState("create_template", {
        name: newTplName,
        subtitle: newTplSubtitle,
      });
      setNewTplName("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#E8476A] dark:text-[#FF8A5B]">
          Estrutura Oficial Integrada • Miolo_Portfolio_Vivencias_Toca_da_Cria.docx
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Modelos Personalizados de Relatório
        </h1>
        <p className="text-xs sm:text-sm text-[#8C5A68] dark:text-[#F0BCC8]">
          O documento oficial enviado (`Miolo_Portfolio_Vivencias_Toca_da_Cria.docx`) já está ativo e mapeado com todas as 12 seções, tabelas e espaços fotográficos.
        </p>
      </div>

      {officialTemplate && (
        <div className="rounded-3xl apple-stable-surface p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3B1425]/10 dark:border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Miolo Oficial Ativo ({officialTemplate.source_docx_filename})
                </span>
                <span className="text-xs text-[#8C5A68]">
                  Versão {officialTemplate.version}
                </span>
              </div>
              <h2 className="text-2xl font-bold">{officialTemplate.name}</h2>
              <p className="text-xs text-[#E8476A] dark:text-[#FF8A5B] font-medium">
                {officialTemplate.subtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {officialTemplate.schema.map((sec) => (
              <div
                key={sec.key}
                className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-4 space-y-2 border border-[#3B1425]/8 dark:border-white/10"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{sec.title}</h3>
                  <span className="rounded-full bg-[#E8476A]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                    {sec.fields.length} campo(s)
                  </span>
                </div>
                <p className="text-[11px] text-[#8C5A68] dark:text-[#F0BCC8]">
                  {sec.team_guidance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl apple-stable-surface p-6 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Layers className="h-5 w-5 text-[#E8476A]" />
          Criar Variante de Modelo Institucional ({templates.length} cadastrados)
        </h3>

        <form
          onSubmit={handleCreateCustomTemplate}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <input
            type="text"
            value={newTplName}
            onChange={(e) => setNewTplName(e.target.value)}
            placeholder="Nome do novo modelo (Ex.: Síntese Bimestral Toca)"
            className="apple-input px-3.5 py-2.5 text-xs"
          />
          <input
            type="text"
            value={newTplSubtitle}
            onChange={(e) => setNewTplSubtitle(e.target.value)}
            placeholder="Subtítulo / Cabeçalho"
            className="apple-input px-3.5 py-2.5 text-xs"
          />
          <GlassButton type="submit" variant="primary" size="md" disabled={creating}>
            <PlusCircle className="h-4 w-4" />
            <span>Salvar Modelo</span>
          </GlassButton>
        </form>

        <div className="space-y-2 pt-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] px-4 py-2.5 text-xs"
            >
              <span className="font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#E8476A]" />
                {t.name}
              </span>
              <span className="text-[#8C5A68]">
                {t.is_official ? "Modelo Oficial Psi. Maria Eduarda" : "Modelo Personalizado"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
