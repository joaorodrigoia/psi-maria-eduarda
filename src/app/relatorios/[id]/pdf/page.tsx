"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { GlassToolbar, GlassButton } from "@/components/liquid-glass";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Flower2,
  Printer,
  ShieldAlert,
} from "lucide-react";

export default function ReportPdfViewPage() {
  const params = useParams();
  const reportId = String(params.id || "");
  const { db, currentUser, mutateState } = useApp();

  const report = db?.reports.find((r) => r.id === reportId);

  if (!report) {
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

  const c = report.content;
  const isApproved = report.status === "approved";

  const handleQuickApprove = async () => {
    await mutateState("update_report", {
      id: report.id,
      content: report.content,
      approve: true,
      approved_by: currentUser?.name || report.responsible_professional,
    });
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Barra de Ferramentas Translúcida Flutuante (Oculta na impressão) */}
      <GlassToolbar sticky className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/relatorios/${report.id}/editar`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Editor</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isApproved ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                <ShieldAlert className="h-4 w-4" />
                Aprovação humana necessária antes de exportar
              </span>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleQuickApprove}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Aprovar Agora</span>
              </GlassButton>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Aprovado por {report.approved_by}
            </span>
          )}

          <Link href={`/relatorios/${report.id}/editar`}>
            <GlassButton variant="secondary" size="sm">
              <Edit3 className="h-3.5 w-3.5" />
              <span>Editar</span>
            </GlassButton>
          </Link>

          <GlassButton
            variant="primary"
            size="sm"
            floating
            onClick={handlePrintPdf}
            disabled={!isApproved}
          >
            <Printer className="h-4 w-4" />
            <span>Baixar / Imprimir PDF (A4)</span>
          </GlassButton>
        </div>
      </GlassToolbar>

      {/* Folha A4 Oficial em Superfície de Leitura Estável (#FFFFFF) */}
      <article className="mx-auto max-w-[210mm] rounded-3xl print:rounded-none border border-[#3B1425]/15 print:border-0 bg-[#FFFFFF] text-[#3B1425] p-8 sm:p-12 print:p-0 shadow-2xl print:shadow-none space-y-8">
        <header className="border-b-2 border-[#E8476A] pb-6 text-center space-y-2 print-avoid-break">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl sunset-gradient text-white shadow-sm">
            <Flower2 className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8476A]">
            PSI. MARIA EDUARDA
          </p>
          <h1 className="font-serif text-3xl font-bold text-[#3B1425]">
            Portfólio das Vivências
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8C5A68]">
            DESENVOLVIMENTO QUE ACONTECE ENQUANTO A INFÂNCIA ACONTECE
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-[#3B1425]/12 bg-[#FFF1EA] p-4 text-left text-xs">
            <div>
              <strong className="text-[#E8476A]">Nome da criança:</strong>{" "}
              <span className="font-semibold text-[#3B1425]">
                {c.header.child_name}
              </span>
            </div>
            <div>
              <strong className="text-[#E8476A]">Período:</strong>{" "}
              <span>{c.header.period_label}</span>
            </div>
            <div>
              <strong className="text-[#E8476A]">Grupo:</strong>{" "}
              <span>{c.header.group_name}</span>
            </div>
            <div>
              <strong className="text-[#E8476A]">Profissional responsável:</strong>{" "}
              <span>{c.header.responsible_professional}</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border-2 border-dashed border-[#E8476A]/30 bg-[#FFF1EA]/60 p-4 text-center">
            {c.header.opening_photo_url ? (
              <div className="space-y-2">
                <img
                  src={c.header.opening_photo_url}
                  alt="Foto de Abertura"
                  className="mx-auto max-h-64 rounded-xl object-cover"
                />
                {c.header.opening_photo_caption && (
                  <p className="text-xs italic text-[#8C5A68]">
                    {c.header.opening_photo_caption}
                  </p>
                )}
              </div>
            ) : (
              <div className="py-6 text-xs font-semibold uppercase tracking-widest text-[#8C5A68]">
                FOTO DE ABERTURA DO PERCURSO
              </div>
            )}
          </div>
        </header>

        {/* 1 a 12 Seções Oficiais */}
        <section className="space-y-3 print-avoid-break">
          <h2 className="font-serif text-lg font-bold text-[#3B1425] border-b border-[#3B1425]/15 pb-1">
            1. QUEM É ESSA CRIA NA TOCA?
          </h2>
          <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
            <p>
              <strong>
                {c.header.child_name} é uma criança que, em suas vivências na Toca, demonstra:
              </strong>{" "}
              {c.sec1_quem_e_essa_cria.demonstra}
            </p>
            <p>
              <strong>Costuma se interessar especialmente por:</strong>{" "}
              {c.sec1_quem_e_essa_cria.interessa_por}
            </p>
            <p>
              <strong>Nas relações com outras crianças e adultos, observamos:</strong>{" "}
              {c.sec1_quem_e_essa_cria.relacoes_observamos}
            </p>
            <p>
              <strong>Entre suas formas preferidas de brincar estão:</strong>{" "}
              {c.sec1_quem_e_essa_cria.formas_preferidas_brincar}
            </p>
            <p>
              <strong>Ao longo deste período, pudemos conhecer uma cria que:</strong>{" "}
              {c.sec1_quem_e_essa_cria.pudemos_conhecer}
            </p>
          </div>
        </section>

        <section className="space-y-3 print-avoid-break">
          <h2 className="font-serif text-lg font-bold text-[#3B1425] border-b border-[#3B1425]/15 pb-1">
            2. MEU JEITO DE BRINCAR
          </h2>
          <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
            <p>
              <strong>Brincadeiras e materiais de maior interesse:</strong>{" "}
              {c.sec2_meu_jeito_de_brincar.brincadeiras_materiais_interesse}
            </p>
            <p>
              <strong>Como explora os espaços da Toca:</strong>{" "}
              {c.sec2_meu_jeito_de_brincar.como_explora_espacos}
            </p>
            <p>
              <strong>Como inicia e sustenta suas brincadeiras:</strong>{" "}
              {c.sec2_meu_jeito_de_brincar.como_inicia_sustenta}
            </p>
            <p>
              <strong>Como participa de propostas individuais e coletivas:</strong>{" "}
              {c.sec2_meu_jeito_de_brincar.propostas_individuais_coletivas}
            </p>
            <p>
              <strong>Mediações que favorecem sua participação:</strong>{" "}
              {c.sec2_meu_jeito_de_brincar.mediacoes_favorecem}
            </p>
          </div>
        </section>

        <section className="space-y-3 print-avoid-break">
          <h2 className="font-serif text-lg font-bold text-[#3B1425] border-b border-[#3B1425]/15 pb-1">
            3. EU E O OUTRO — Relações, comunicação e convivência
          </h2>
          <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
            <p>
              <strong>Como se aproxima das outras crianças e adultos?</strong>{" "}
              {c.sec3_eu_e_o_outro.aproxima_criancas_adultos}
            </p>
            <p>
              <strong>Como comunica desejos, interesses e necessidades?</strong>{" "}
              {c.sec3_eu_e_o_outro.comunica_desejos_necessidades}
            </p>
            <p>
              <strong>Como vivencia compartilhamento de espaços e materiais?</strong>{" "}
              {c.sec3_eu_e_o_outro.compartilhamento_espacos_materiais}
            </p>
            <p>
              <strong>Como lida com espera, turnos e combinados?</strong>{" "}
              {c.sec3_eu_e_o_outro.espera_turnos_combinados}
            </p>
            <p>
              <strong>Como reage aos conflitos e quais estratégias ajudam?</strong>{" "}
              {c.sec3_eu_e_o_outro.reage_conflitos_estrategias}
            </p>
          </div>
        </section>

        <section className="space-y-3 print-avoid-break">
          <h2 className="font-serif text-lg font-bold text-[#3B1425] border-b border-[#3B1425]/15 pb-1">
            4. MEU CORPO EM MOVIMENTO
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed">
            {c.sec4_meu_corpo_em_movimento.relato_corporal}
          </p>
        </section>

        <section className="space-y-3 print-avoid-break">
          <h2 className="font-serif text-lg font-bold text-[#3B1425] border-b border-[#3B1425]/15 pb-1">
            5. DESCOBERTAS, PENSAMENTOS E APRENDIZAGENS
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed">
            {c.sec5_descobertas_aprendizagens.relato_descobertas}
          </p>
        </section>

        <section className="space-y-3 print-avoid-break">
          <h2 className="font-serif text-lg font-bold text-[#3B1425] border-b border-[#3B1425]/15 pb-1">
            6. AUTONOMIA NO COTIDIANO DA TOCA
          </h2>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFF1EA] text-[#3B1425]">
                <th className="p-2.5 border border-[#3B1425]/20 font-bold">
                  SITUAÇÃO OBSERVADA
                </th>
                <th className="p-2.5 border border-[#3B1425]/20 font-bold">
                  COMO PARTICIPA HOJE
                </th>
                <th className="p-2.5 border border-[#3B1425]/20 font-bold">
                  APOIOS QUE FAVORECEM
                </th>
              </tr>
            </thead>
            <tbody>
              {c.sec6_autonomia_cotidiano.rows.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 border border-[#3B1425]/20 font-semibold">
                    {row.situacao_observada}
                  </td>
                  <td className="p-2.5 border border-[#3B1425]/20">
                    {row.como_participa_hoje}
                  </td>
                  <td className="p-2.5 border border-[#3B1425]/20">
                    {row.apoios_que_favorecem}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-3 print-avoid-break">
          <h2 className="font-serif text-lg font-bold text-[#3B1425] border-b border-[#3B1425]/15 pb-1">
            7. SENTIR, COMUNICAR E REGULAR
          </h2>
          <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
            <p>
              <strong>Como demonstra alegria, interesse, incômodo ou frustração?</strong>{" "}
              {c.sec7_sentir_comunicar_regular.demonstra_alegria_frustracao}
            </p>
            <p>
              <strong>O que costuma ajudá-la a se reorganizar?</strong>{" "}
              {c.sec7_sentir_comunicar_regular.ajuda_reorganizar}
            </p>
            <p>
              <strong>Como responde à mediação do adulto?</strong>{" "}
              {c.sec7_sentir_comunicar_regular.responde_mediacao_adulto}
            </p>
            <p>
              <strong>Quais recursos já busca ou aceita?</strong>{" "}
              {c.sec7_sentir_comunicar_regular.recursos_busca_aceita}
            </p>
            <p>
              <strong>Avanços percebidos neste período:</strong>{" "}
              {c.sec7_sentir_comunicar_regular.avancos_percebidos}
            </p>
          </div>
        </section>

        <section className="space-y-3 print-avoid-break">
          <h2 className="font-serif text-lg font-bold text-[#3B1425] border-b border-[#3B1425]/15 pb-1">
            8. EXPERIÊNCIAS QUE MARCARAM MEU PERCURSO & 9. MINHAS PRODUÇÕES
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-[#3B1425]/15 p-3 space-y-1">
              <strong className="text-[#E8476A] block">AQUI TEVE DESCOBERTA...</strong>
              <p>{c.sec8_experiencias_marcantes.descoberta.legenda_processo}</p>
            </div>
            <div className="rounded-xl border border-[#3B1425]/15 p-3 space-y-1">
              <strong className="text-[#E8476A] block">AQUI TEVE ENCONTRO...</strong>
              <p>{c.sec8_experiencias_marcantes.encontro.legenda_processo}</p>
            </div>
            <div className="rounded-xl border border-[#3B1425]/15 p-3 space-y-1">
              <strong className="text-[#E8476A] block">AQUI TEVE DESAFIO...</strong>
              <p>{c.sec8_experiencias_marcantes.desafio.legenda_processo}</p>
            </div>
            <div className="rounded-xl border border-[#3B1425]/15 p-3 space-y-1">
              <strong className="text-[#E8476A] block">E AQUI TEVE CONQUISTA!</strong>
              <p>{c.sec8_experiencias_marcantes.conquista.legenda_processo}</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 print-avoid-break">
          <h2 className="font-serif text-lg font-bold text-[#3B1425] border-b border-[#3B1425]/15 pb-1">
            10. UM OLHAR SOBRE MEU PERCURSO
          </h2>
          <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
            <p>
              <strong>Durante este período, observamos que:</strong>{" "}
              {c.sec10_olhar_sobre_percurso.observamos_que}
            </p>
            <p>
              <strong>Entre as conquistas que ganharam destaque estão:</strong>{" "}
              {c.sec10_olhar_sobre_percurso.conquistas_destaque}
            </p>
            <p>
              <strong>Atualmente, demonstra maior segurança para:</strong>{" "}
              {c.sec10_olhar_sobre_percurso.maior_seguranca_para}
            </p>
            <p>
              <strong>Ainda necessita de mediação especialmente em situações que envolvem:</strong>{" "}
              {c.sec10_olhar_sobre_percurso.necessita_mediacao_em}
            </p>
          </div>
        </section>

        <section className="space-y-3 print-avoid-break">
          <h2 className="font-serif text-lg font-bold text-[#3B1425] border-b border-[#3B1425]/15 pb-1">
            11. A VOZ DA CRIANÇA & 12. PARA GUARDAR NA MEMÓRIA
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="rounded-xl bg-[#FFF1EA] p-3">
              <strong>Na Toca eu gosto de...</strong>
              <p className="mt-0.5">{c.sec11_a_voz_da_crianca.na_toca_gosto_de}</p>
            </div>
            <div className="rounded-xl bg-[#FFF1EA] p-3">
              <strong>Minha brincadeira preferida é...</strong>
              <p className="mt-0.5">{c.sec11_a_voz_da_crianca.brincadeira_preferida}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-2">
            <div className="rounded-xl border border-[#3B1425]/15 p-3">
              <strong className="text-[#E8476A] block">BRINCAR</strong>
              <p className="mt-1">{c.sec12_para_guardar_memoria.dimensoes.brincar}</p>
            </div>
            <div className="rounded-xl border border-[#3B1425]/15 p-3">
              <strong className="text-[#E8476A] block">CONVIVER</strong>
              <p className="mt-1">{c.sec12_para_guardar_memoria.dimensoes.conviver}</p>
            </div>
            <div className="rounded-xl border border-[#3B1425]/15 p-3">
              <strong className="text-[#E8476A] block">COMUNICAR</strong>
              <p className="mt-1">{c.sec12_para_guardar_memoria.dimensoes.comunicar}</p>
            </div>
            <div className="rounded-xl border border-[#3B1425]/15 p-3">
              <strong className="text-[#E8476A] block">MOVIMENTAR-SE</strong>
              <p className="mt-1">{c.sec12_para_guardar_memoria.dimensoes.movimentar_se}</p>
            </div>
            <div className="rounded-xl border border-[#3B1425]/15 p-3">
              <strong className="text-[#E8476A] block">CONSTRUIR AUTONOMIA</strong>
              <p className="mt-1">
                {c.sec12_para_guardar_memoria.dimensoes.construir_autonomia}
              </p>
            </div>
            <div className="rounded-xl border border-[#3B1425]/15 p-3">
              <strong className="text-[#E8476A] block">DESCOBRIR</strong>
              <p className="mt-1">{c.sec12_para_guardar_memoria.dimensoes.descobrir}</p>
            </div>
          </div>
        </section>

        <footer className="pt-8 border-t-2 border-[#E8476A] space-y-6 print-avoid-break">
          <p className="text-center font-serif text-sm font-semibold text-[#3B1425]">
            “No acompanhamento da Psi. Maria Eduarda, o portfólio não é uma coleção de atividades. É memória de um percurso vivido.”
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 text-center text-xs text-[#8C5A68]">
            <div className="border-t border-[#3B1425]/30 pt-2">
              <strong className="text-[#3B1425] block">
                {c.header.responsible_professional}
              </strong>
              <span>Profissional Responsável — Psi. Maria Eduarda</span>
            </div>
            <div className="border-t border-[#3B1425]/30 pt-2">
              <strong className="text-[#3B1425] block">
                Coordenação Pedagógica / Família
              </strong>
              <span>Emitido em {new Date().toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
