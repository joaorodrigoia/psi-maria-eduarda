"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { calculateAgeLabel } from "@/lib/portfolio-template";
import { GlassToolbar, GlassButton, GlassModal } from "@/components/liquid-glass";
import { SessionAttachment } from "@/lib/types";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Mic,
  PlusCircle,
  Sparkles,
  Archive,
  Edit3,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Maximize2,
} from "lucide-react";

type TabType =
  | "visao_geral"
  | "sessoes"
  | "fotos"
  | "audios"
  | "anotacoes_ia"
  | "relatorios";

export default function ChildProfilePage() {
  const params = useParams();
  const router = useRouter();
  const childId = String(params.id || "");
  const { db, mutateState } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>("visao_geral");
  const [editing, setEditing] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<SessionAttachment | null>(null);

  const child = db?.children.find((c) => c.id === childId);

  const [editName, setEditName] = useState(child?.name || "");
  const [editBirthDate, setEditBirthDate] = useState(child?.birth_date || "");
  const [editGroup, setEditGroup] = useState(child?.group_name || "");
  const [editNotes, setEditNotes] = useState(child?.notes || "");

  if (!child) {
    return (
      <div className="rounded-3xl apple-stable-surface p-10 text-center space-y-4">
        <p className="text-xl font-bold">Prontuário não encontrado</p>
        <Link href="/criancas">
          <GlassButton variant="primary" size="md">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Crianças</span>
          </GlassButton>
        </Link>
      </div>
    );
  }

  const initials = child.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  // Isolamento estrito por child.id
  const childSessions = (db?.sessions || []).filter((s) => s.child_id === child.id);
  const childPhotos = (db?.session_attachments || []).filter(
    (a) => a.child_id === child.id && a.type === "photo"
  );
  const childAudios = (db?.session_attachments || []).filter(
    (a) => a.child_id === child.id && a.type === "audio"
  );
  const childTranscriptions = (db?.transcriptions || []).filter(
    (t) => t.child_id === child.id
  );
  const childObservations = (db?.observations || []).filter(
    (o) => o.child_id === child.id
  );
  const childReports = (db?.reports || []).filter((r) => r.child_id === child.id);

  const startEditing = () => {
    setEditName(child.name);
    setEditBirthDate(child.birth_date);
    setEditGroup(child.group_name);
    setEditNotes(child.notes);
    setEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateState("update_child", {
      id: child.id,
      name: editName,
      birth_date: editBirthDate,
      group_name: editGroup,
      notes: editNotes,
    });
    setEditing(false);
  };

  const handleToggleArchive = async () => {
    await mutateState("update_child", {
      id: child.id,
      archived_at: child.archived_at ? null : new Date().toISOString(),
    });
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Barra Superior de Navegação e Ações Rápidas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/criancas"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Todas as Crianças</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link href={`/sessoes/nova?childId=${child.id}`}>
            <GlassButton variant="primary" size="md" floating>
              <PlusCircle className="h-4 w-4" />
              <span>+ Nova Sessão</span>
            </GlassButton>
          </Link>

          <Link href={`/relatorios/novo?childId=${child.id}`}>
            <GlassButton variant="glass" size="md">
              <Sparkles className="h-4 w-4 text-[#E8476A] dark:text-[#FF8A5B]" />
              <span>Gerar Portfólio IA</span>
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Cabeçalho do Prontuário com Avatar, Nome, Idade e Controles */}
      <div className="rounded-3xl apple-stable-surface p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            {/* Avatar Apple HIG */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#E8476A] to-[#C92F55] text-white font-bold text-xl shadow-md">
              {initials}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full sunset-gradient px-3 py-0.5 text-xs font-bold text-white">
                  {child.unique_code}
                </span>
                {child.archived_at && (
                  <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    Prontuário Arquivado
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#E8476A] dark:text-[#FF8A5B] bg-[#E8476A]/10 dark:bg-[#FF8A5B]/15 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" /> Prontuário Isolado
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#3B1425] dark:text-[#FFF4F0]">
                {child.name}
              </h1>

              <p className="text-xs sm:text-sm text-[#8C5A68] dark:text-[#F0BCC8]">
                <strong className="text-[#3B1425] dark:text-[#FFF4F0]">Idade:</strong>{" "}
                {calculateAgeLabel(child.birth_date)} (Nasc.:{" "}
                {new Date(child.birth_date + "T12:00:00").toLocaleDateString("pt-BR")}) •{" "}
                <strong className="text-[#3B1425] dark:text-[#FFF4F0]">Grupo:</strong>{" "}
                {child.group_name || "Psi. Maria Eduarda"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GlassButton variant="secondary" size="sm" onClick={startEditing}>
              <Edit3 className="h-3.5 w-3.5" />
              <span>Editar</span>
            </GlassButton>

            <GlassButton variant="ghost" size="sm" onClick={handleToggleArchive}>
              <Archive className="h-3.5 w-3.5" />
              <span>{child.archived_at ? "Reativar" : "Arquivar"}</span>
            </GlassButton>
          </div>
        </div>

        {editing && (
          <form
            onSubmit={handleSaveEdit}
            className="mt-5 pt-5 border-t border-[#3B1425]/10 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-xs font-bold mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full apple-input px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Data de Nascimento</label>
              <input
                type="date"
                required
                value={editBirthDate}
                onChange={(e) => setEditBirthDate(e.target.value)}
                className="w-full apple-input px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Turma / Grupo</label>
              <input
                type="text"
                value={editGroup}
                onChange={(e) => setEditGroup(e.target.value)}
                className="w-full apple-input px-3 py-2 text-xs"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold mb-1">
                Observações Gerais do Prontuário
              </label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full apple-input px-3 py-2 text-xs"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2">
              <GlassButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Cancelar
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="sm">
                Salvar Alterações
              </GlassButton>
            </div>
          </form>
        )}
      </div>

      {/* GlassToolbar de Abas do Prontuário */}
      <GlassToolbar className="flex items-center gap-2 overflow-x-auto">
        {[
          { id: "visao_geral", label: "Visão Geral & Linha do Tempo" },
          { id: "sessoes", label: `Sessões (${childSessions.length})` },
          { id: "fotos", label: `Fotografias (${childPhotos.length})` },
          { id: "audios", label: `Áudios & Transcrições (${childAudios.length})` },
          { id: "anotacoes_ia", label: `Observações IA (${childObservations.length})` },
          { id: "relatorios", label: `Relatórios (${childReports.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as TabType)}
            className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
              activeTab === t.id
                ? "sunset-gradient text-white shadow-sm"
                : "text-[#8C5A68] dark:text-[#F0BCC8] hover:text-[#3B1425] dark:hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </GlassToolbar>

      {/* ABA 1: Visão Geral e Linha do Tempo */}
      {activeTab === "visao_geral" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl apple-stable-surface p-6 space-y-4">
              <h3 className="text-lg font-bold tracking-tight">
                Contexto e Observações Gerais
              </h3>
              <p className="text-sm text-[#8C5A68] dark:text-[#F0BCC8] leading-relaxed whitespace-pre-line">
                {child.notes ||
                  "Nenhuma observação geral adicionada no cadastro inicial. Clique em 'Editar' para registrar particularidades, interesses ou combinados com a família."}
              </p>

              <div className="pt-4 border-t border-[#3B1425]/10 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-3">
                  <p className="text-2xl font-bold text-[#3B1425] dark:text-[#FFF4F0]">
                    {childSessions.length}
                  </p>
                  <p className="text-[11px] text-[#8C5A68] dark:text-[#F0BCC8] font-medium">
                    Sessões
                  </p>
                </div>
                <div className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-3">
                  <p className="text-2xl font-bold text-[#3B1425] dark:text-[#FFF4F0]">
                    {childPhotos.length}
                  </p>
                  <p className="text-[11px] text-[#8C5A68] dark:text-[#F0BCC8] font-medium">
                    Fotografias
                  </p>
                </div>
                <div className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-3">
                  <p className="text-2xl font-bold text-[#3B1425] dark:text-[#FFF4F0]">
                    {childObservations.length}
                  </p>
                  <p className="text-[11px] text-[#8C5A68] dark:text-[#F0BCC8] font-medium">
                    Evidências IA
                  </p>
                </div>
                <div className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-3">
                  <p className="text-2xl font-bold text-[#3B1425] dark:text-[#FFF4F0]">
                    {childReports.length}
                  </p>
                  <p className="text-[11px] text-[#8C5A68] dark:text-[#F0BCC8] font-medium">
                    Portfólios
                  </p>
                </div>
              </div>
            </div>

            {/* Linha do Tempo de Sessões em Cartões de Alto Contraste */}
            <div className="rounded-3xl apple-stable-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight">
                  Linha do Tempo de Vivências
                </h3>
                <Link href={`/sessoes/nova?childId=${child.id}`}>
                  <GlassButton variant="primary" size="sm">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Registrar</span>
                  </GlassButton>
                </Link>
              </div>

              {childSessions.length === 0 ? (
                <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] py-6 text-center">
                  Nenhuma sessão registrada ainda na linha do tempo de {child.name}.
                </p>
              ) : (
                <div className="relative pl-5 border-l-2 border-[#E8476A]/30 space-y-4">
                  {childSessions.map((s) => (
                    <div key={s.id} className="relative">
                      <span className="absolute -left-[25px] top-1.5 h-3 w-3 rounded-full bg-[#E8476A] ring-4 ring-[#FFFFFF] dark:ring-[#33192A]" />
                      <Link
                        href={`/sessoes/${s.id}`}
                        className="block rounded-2xl border border-[#3B1425]/8 dark:border-white/10 bg-[#FFF1EA] dark:bg-[#2A1424] p-4 hover:border-[#E8476A]/50 transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                            {new Date(s.session_date).toLocaleString("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                          <span className="text-[#8C5A68] dark:text-[#F0BCC8]">
                            {s.professional_name}
                          </span>
                        </div>
                        <p className="text-sm text-[#3B1425] dark:text-[#FFF4F0] leading-relaxed">
                          {s.notes}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl apple-stable-surface p-6 space-y-4 h-fit">
            <h3 className="text-lg font-bold tracking-tight">
              Consentimentos LGPD
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424]">
                <span className="text-[#8C5A68] dark:text-[#F0BCC8]">
                  Fotografias Pedagógicas
                </span>
                <span className="font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                  {child.image_consent ? "Autorizado" : "Restrito"}
                </span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424]">
                <span className="text-[#8C5A68] dark:text-[#F0BCC8]">
                  Áudio & Transcrição
                </span>
                <span className="font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                  {child.audio_consent ? "Autorizado" : "Restrito"}
                </span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424]">
                <span className="text-[#8C5A68] dark:text-[#F0BCC8]">
                  Estruturação IA
                </span>
                <span className="font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                  {child.ai_processing_consent ? "Autorizado" : "Restrito"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ABA 2: Sessões */}
      {activeTab === "sessoes" && (
        <div className="rounded-3xl apple-stable-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Histórico Cronológico de Sessões</h3>
            <Link href={`/sessoes/nova?childId=${child.id}`}>
              <GlassButton variant="primary" size="sm">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Nova Sessão</span>
              </GlassButton>
            </Link>
          </div>

          {childSessions.length === 0 ? (
            <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] py-8 text-center">
              Nenhuma sessão registrada para {child.name} até o momento.
            </p>
          ) : (
            <div className="space-y-3">
              {childSessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/sessoes/${s.id}`}
                  className="block rounded-2xl border border-[#3B1425]/8 dark:border-white/10 bg-[#FFF1EA] dark:bg-[#2A1424] p-4 hover:border-[#E8476A]/50 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#E8476A] dark:text-[#FF8A5B] inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(s.session_date).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                    <span className="text-[#8C5A68] dark:text-[#F0BCC8]">
                      Profissional: {s.professional_name}
                    </span>
                  </div>
                  <p className="text-sm text-[#3B1425] dark:text-[#FFF4F0] leading-relaxed">
                    {s.notes}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: Fotografias com Miniaturas Arredondadas, Controles Flutuantes e Lightbox */}
      {activeTab === "fotos" && (
        <div className="rounded-3xl apple-stable-surface p-6 space-y-4">
          <h3 className="text-lg font-bold">
            Galeria de Fotografias de {child.name}
          </h3>
          {childPhotos.length === 0 ? (
            <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] py-8 text-center">
              Nenhuma fotografia anexada nas sessões desta criança.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {childPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-3xl border border-[#3B1425]/10 dark:border-white/10 bg-[#FFF1EA] dark:bg-[#2A1424] flex flex-col"
                >
                  <div className="relative h-52 w-full overflow-hidden">
                    <img
                      src={photo.storage_path}
                      alt={photo.caption || "Registro fotográfico"}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setEnlargedPhoto(photo)}
                      className="absolute top-3 right-3 rounded-full p-2 liquid-glass-pill text-[#3B1425] dark:text-[#FFF4F0]"
                      title="Ampliar fotografia"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="inline-block rounded-full bg-[#E8476A]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                      {photo.activity_tag || "Vivência"}
                    </span>
                    <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
                      {photo.caption || "Sem legenda complementar"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 4: Áudios & Transcrições */}
      {activeTab === "audios" && (
        <div className="rounded-3xl apple-stable-surface p-6 space-y-4">
          <h3 className="text-lg font-bold">Áudios e Transcrições Vinculadas</h3>
          {childTranscriptions.length === 0 && childAudios.length === 0 ? (
            <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] py-8 text-center">
              Nenhum áudio ou transcrição registrado para esta criança.
            </p>
          ) : (
            <div className="space-y-3">
              {childTranscriptions.map((tr) => (
                <div
                  key={tr.id}
                  className="rounded-2xl border border-[#3B1425]/8 dark:border-white/10 bg-[#FFF1EA] dark:bg-[#2A1424] p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                      <Mic className="h-3.5 w-3.5" />
                      Transcrição Vinculada
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        tr.status === "reviewed"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {tr.status === "reviewed"
                        ? "Revisada pela Educadora"
                        : "Pendente de Revisão"}
                    </span>
                  </div>
                  <p className="text-sm text-[#3B1425] dark:text-[#FFF4F0]">
                    {tr.text}
                  </p>
                  <Link
                    href={`/sessoes/${tr.session_id}`}
                    className="inline-block text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B] underline"
                  >
                    Abrir sessão de origem →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 5: Observações IA */}
      {activeTab === "anotacoes_ia" && (
        <div className="rounded-3xl apple-stable-surface p-6 space-y-4">
          <h3 className="text-lg font-bold">
            Observações Estruturadas pela IA (11 Categorias Pedagógicas)
          </h3>
          {childObservations.length === 0 ? (
            <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] py-8 text-center">
              Registre uma sessão para que a IA estruture os fatos observados e as mediações oferecidas.
            </p>
          ) : (
            <div className="space-y-2.5">
              {childObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="rounded-2xl border border-[#3B1425]/8 dark:border-white/10 bg-[#FFF1EA] dark:bg-[#2A1424] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full sunset-gradient px-2.5 py-0.5 text-[10px] font-bold text-white">
                        {obs.category}
                      </span>
                      <span className="rounded-full bg-[#E8476A]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#E8476A] dark:text-[#FF8A5B]">
                        {obs.portfolio_section}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#3B1425] dark:text-[#FFF4F0]">
                      {obs.content}
                    </p>
                  </div>
                  <Link
                    href={`/sessoes/${obs.session_id}`}
                    className="text-[11px] font-semibold text-[#E8476A] dark:text-[#FF8A5B] whitespace-nowrap underline"
                  >
                    {obs.source_reference}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 6: Relatórios */}
      {activeTab === "relatorios" && (
        <div className="rounded-3xl apple-stable-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">
              Portfólios das Vivências de {child.name}
            </h3>
            <Link href={`/relatorios/novo?childId=${child.id}`}>
              <GlassButton variant="primary" size="sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Novo Relatório IA</span>
              </GlassButton>
            </Link>
          </div>

          {childReports.length === 0 ? (
            <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] py-8 text-center">
              Nenhum relatório gerado ainda para esta criança.
            </p>
          ) : (
            <div className="space-y-3">
              {childReports.map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-2xl border border-[#3B1425]/8 dark:border-white/10 bg-[#FFF1EA] dark:bg-[#2A1424] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          rep.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {rep.status === "approved" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Aprovado para PDF
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> Aguardando Revisão Humana
                          </>
                        )}
                      </span>
                      <span className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
                        Período: {rep.content.header.period_label}
                      </span>
                    </div>
                    <h4 className="text-base font-bold mt-1">
                      Portfólio das Vivências — Psi. Maria Eduarda
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/relatorios/${rep.id}/editar`}>
                      <GlassButton variant="secondary" size="sm">
                        Revisar / Editar
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* GlassModal de Visualização Ampliada de Foto */}
      <GlassModal
        open={Boolean(enlargedPhoto)}
        onClose={() => setEnlargedPhoto(null)}
        title={enlargedPhoto?.activity_tag || "Registro Fotográfico"}
        subtitle={child.name}
        icon={<Camera className="h-5 w-5" />}
      >
        {enlargedPhoto && (
          <div className="space-y-4">
            <img
              src={enlargedPhoto.storage_path}
              alt={enlargedPhoto.caption || "Foto ampliada"}
              className="w-full max-h-[60vh] object-contain rounded-2xl bg-black/5"
            />
            <p className="text-sm text-[#3B1425] dark:text-[#FFF4F0]">
              {enlargedPhoto.caption || "Sem legenda complementar registrada."}
            </p>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
