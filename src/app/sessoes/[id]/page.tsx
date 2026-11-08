"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { GlassToolbar, GlassButton, GlassModal } from "@/components/liquid-glass";
import { SessionAttachment } from "@/lib/types";
import {
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle2,
  Edit3,
  Mic,
  Save,
  Sparkles,
  User,
  Maximize2,
} from "lucide-react";

export default function SessionDetailsPage() {
  const params = useParams();
  const sessionId = String(params.id || "");
  const { db, mutateState } = useApp();

  const session = db?.sessions.find((s) => s.id === sessionId);
  const child = db?.children.find((c) => c.id === session?.child_id);

  const [editing, setEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(session?.notes || "");
  const [editCompNotes, setEditCompNotes] = useState(
    session?.complementary_notes || ""
  );
  const [transcriptionEdits, setTranscriptionEdits] = useState<
    Record<string, string>
  >({});
  const [enlargedPhoto, setEnlargedPhoto] = useState<SessionAttachment | null>(
    null
  );

  if (!session || !child) {
    return (
      <div className="rounded-3xl apple-stable-surface p-10 text-center space-y-4">
        <p className="text-xl font-bold">Sessão não encontrada</p>
        <Link href="/">
          <GlassButton variant="primary" size="md">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Painel</span>
          </GlassButton>
        </Link>
      </div>
    );
  }

  const sessionPhotos = (db?.session_attachments || []).filter(
    (a) => a.session_id === session.id && a.type === "photo"
  );
  const sessionAudios = (db?.session_attachments || []).filter(
    (a) => a.session_id === session.id && a.type === "audio"
  );
  const sessionTranscriptions = (db?.transcriptions || []).filter(
    (t) => t.session_id === session.id
  );
  const sessionObservations = (db?.observations || []).filter(
    (o) => o.session_id === session.id
  );

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateState("update_session", {
      id: session.id,
      notes: editNotes,
      complementary_notes: editCompNotes,
    });
    setEditing(false);
  };

  const handleReviewTranscription = async (
    trId: string,
    currentText: string
  ) => {
    const updatedText = transcriptionEdits[trId] ?? currentText;
    await mutateState("review_transcription", {
      id: trId,
      text: updatedText,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <GlassToolbar className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/criancas/${child.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Prontuário de {child.name}</span>
        </Link>

        <div className="flex items-center gap-2">
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditNotes(session.notes);
              setEditCompNotes(session.complementary_notes);
              setEditing((v) => !v);
            }}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{editing ? "Cancelar Edição" : "Editar Registro"}</span>
          </GlassButton>

          <Link href={`/relatorios/novo?childId=${child.id}&sessionId=${session.id}`}>
            <GlassButton variant="primary" size="sm" floating>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Gerar Relatório desta Sessão</span>
            </GlassButton>
          </Link>
        </div>
      </GlassToolbar>

      {/* Cabeçalho e Relato em Superfície de Leitura Estável */}
      <div className="rounded-3xl apple-stable-surface p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3B1425]/10 dark:border-white/10 pb-4">
          <div>
            <span className="rounded-full sunset-gradient px-3 py-0.5 text-xs font-bold text-white">
              {child.unique_code} • {child.name}
            </span>
            <h1 className="text-2xl font-bold mt-1.5">
              Registro de Sessão Individual
            </h1>
          </div>

          <div className="text-right text-xs text-[#8C5A68] dark:text-[#F0BCC8] space-y-0.5">
            <p className="inline-flex items-center gap-1.5 font-semibold text-[#3B1425] dark:text-[#FFF4F0]">
              <Calendar className="h-3.5 w-3.5 text-[#E8476A]" />
              {new Date(session.session_date).toLocaleString("pt-BR", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
            <p className="flex items-center justify-end gap-1">
              <User className="h-3.5 w-3.5" />
              Responsável: {session.professional_name}
            </p>
          </div>
        </div>

        {!editing ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                Descrição Livre dos Acontecimentos
              </h3>
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line bg-[#FFF1EA] dark:bg-[#2A1424] rounded-2xl p-4">
                {session.notes || "Sem relato em texto."}
              </p>
            </div>

            {session.complementary_notes && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                  Observações Complementares e Mediações
                </h3>
                <p className="text-sm leading-relaxed bg-[#FFF1EA] dark:bg-[#2A1424] rounded-2xl p-4">
                  {session.complementary_notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSaveNotes} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Descrição Livre da Sessão
              </label>
              <textarea
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full apple-input p-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Observações Complementares
              </label>
              <textarea
                rows={2}
                value={editCompNotes}
                onChange={(e) => setEditCompNotes(e.target.value)}
                className="w-full apple-input p-3 text-sm"
              />
            </div>
            <GlassButton type="submit" variant="primary" size="md">
              <Save className="h-4 w-4" />
              <span>Salvar e Reprocessar Categorias IA</span>
            </GlassButton>
          </form>
        )}
      </div>

      {/* Áudios e Revisão de Transcrições */}
      {(sessionAudios.length > 0 || sessionTranscriptions.length > 0) && (
        <div className="rounded-3xl apple-stable-surface p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Mic className="h-5 w-5 text-[#E8476A]" />
            Áudios e Revisão de Transcrições
          </h2>

          <div className="space-y-4">
            {sessionTranscriptions.map((tr) => {
              const audioAtt = sessionAudios.find(
                (a) => a.id === tr.attachment_id
              );
              const val = transcriptionEdits[tr.id] ?? tr.text;

              return (
                <div
                  key={tr.id}
                  className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">
                      {audioAtt?.caption || "Gravação de Voz da Sessão"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        tr.status === "reviewed"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {tr.status === "reviewed"
                        ? "Transcrição Revisada"
                        : "Pendente de Revisão"}
                    </span>
                  </div>

                  {audioAtt && audioAtt.storage_path.startsWith("data:audio") && (
                    <audio
                      controls
                      src={audioAtt.storage_path}
                      className="w-full h-9"
                    />
                  )}

                  <textarea
                    rows={2}
                    value={val}
                    onChange={(e) =>
                      setTranscriptionEdits((prev) => ({
                        ...prev,
                        [tr.id]: e.target.value,
                      }))
                    }
                    className="w-full apple-input p-3 text-xs"
                  />

                  <div className="flex justify-end">
                    <GlassButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleReviewTranscription(tr.id, tr.text)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Salvar e Confirmar Revisão</span>
                    </GlassButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Galeria de Fotografias */}
      {sessionPhotos.length > 0 && (
        <div className="rounded-3xl apple-stable-surface p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#E8476A]" />
            Fotografias da Sessão ({sessionPhotos.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sessionPhotos.map((p) => (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-3xl bg-[#FFF1EA] dark:bg-[#2A1424]"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={p.storage_path}
                    alt={p.caption || "Foto da sessão"}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <button
                    type="button"
                    onClick={() => setEnlargedPhoto(p)}
                    className="absolute top-3 right-3 rounded-full p-2 liquid-glass-pill"
                    title="Ampliar"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-3.5 space-y-1">
                  <span className="inline-block rounded-full bg-[#E8476A]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                    {p.activity_tag}
                  </span>
                  <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
                    {p.caption || "Sem legenda complementar"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observações Estruturadas pela IA */}
      <div className="rounded-3xl apple-stable-surface p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#E8476A]" />
            Análise Estruturada pela IA (Fatos Observados vs. Mediações)
          </h2>
          <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
            Extraído fielmente a partir do relato desta sessão, sem acrescentar nem inventar acontecimentos.
          </p>
        </div>

        {sessionObservations.length === 0 ? (
          <p className="text-xs text-[#8C5A68] py-6 text-center">
            Nenhuma observação estruturada ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sessionObservations.map((obs) => (
              <div
                key={obs.id}
                className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-4 space-y-2 border border-[#3B1425]/8 dark:border-white/10"
              >
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="rounded-full sunset-gradient px-2.5 py-0.5 text-[10px] font-bold text-white">
                    {obs.category}
                  </span>
                  <span className="rounded-full bg-[#E8476A]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#E8476A] dark:text-[#FF8A5B]">
                    {obs.portfolio_section}
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {obs.content}
                </p>
                <div className="flex items-center justify-between text-[10px] text-[#8C5A68] dark:text-[#F0BCC8] pt-1 border-t border-[#3B1425]/8 dark:border-white/10">
                  <span>
                    Classificação:{" "}
                    <strong>
                      {obs.fact_vs_interpretation === "mediacao_profissional"
                        ? "Mediação e Apoio do Profissional"
                        : "Fato Observado na Vivência"}
                    </strong>
                  </span>
                  <span>{obs.source_reference}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <GlassModal
        open={Boolean(enlargedPhoto)}
        onClose={() => setEnlargedPhoto(null)}
        title={enlargedPhoto?.activity_tag || "Fotografia da Sessão"}
        subtitle={child.name}
        icon={<Camera className="h-5 w-5" />}
      >
        {enlargedPhoto && (
          <div className="space-y-3">
            <img
              src={enlargedPhoto.storage_path}
              alt="Foto ampliada"
              className="w-full max-h-[60vh] object-contain rounded-2xl"
            />
            <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
              {enlargedPhoto.caption || "Sem legenda complementar."}
            </p>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
