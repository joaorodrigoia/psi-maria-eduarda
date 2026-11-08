"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { GlassToolbar, GlassModal } from "@/components/liquid-glass";
import { SessionAttachment } from "@/lib/types";
import { Camera, Mic, ShieldCheck, Filter, Maximize2 } from "lucide-react";

export default function MediaGalleryPage() {
  const { db } = useApp();
  const [selectedChildId, setSelectedChildId] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "photo" | "audio">("all");
  const [enlargedPhoto, setEnlargedPhoto] = useState<SessionAttachment | null>(
    null
  );

  const filteredMedia = useMemo(() => {
    const list = db?.session_attachments || [];
    return list.filter((item) => {
      if (selectedChildId && item.child_id !== selectedChildId) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      return true;
    });
  }, [db?.session_attachments, selectedChildId, typeFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#E8476A] dark:text-[#FF8A5B]">
          Armazenamento Privado & Isolado por Prontuário
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Galeria de Fotografias e Áudios
        </h1>
        <p className="text-xs sm:text-sm text-[#8C5A68] dark:text-[#F0BCC8]">
          Miniaturas arredondadas com visualização ampliada e controles flutuantes.
        </p>
      </div>

      {/* GlassToolbar de Filtros */}
      <GlassToolbar className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#E8476A]" />
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="apple-input px-3 py-2 text-xs font-semibold"
          >
            <option value="">Todas as Crianças (Isolamento Identificado)</option>
            {(db?.children || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.unique_code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: "Todos os Arquivos" },
            { id: "photo", label: "Fotografias" },
            { id: "audio", label: "Gravações de Áudio" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setTypeFilter(btn.id as "all" | "photo" | "audio")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                typeFilter === btn.id
                  ? "sunset-gradient text-white shadow-sm"
                  : "text-[#8C5A68] dark:text-[#F0BCC8] hover:text-[#3B1425] dark:hover:text-white"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </GlassToolbar>

      {filteredMedia.length === 0 ? (
        <div className="rounded-3xl apple-stable-surface p-12 text-center space-y-3">
          <Camera className="h-10 w-10 text-[#E8476A] mx-auto" />
          <p className="text-sm font-semibold">
            Nenhum arquivo de mídia encontrado para este filtro
          </p>
          <p className="text-xs text-[#8C5A68]">
            Anexe fotografias ou grave áudios ao registrar uma Nova Sessão.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedia.map((att) => {
            const child = db?.children.find((c) => c.id === att.child_id);
            return (
              <div
                key={att.id}
                className="group overflow-hidden rounded-3xl apple-stable-surface flex flex-col justify-between"
              >
                {att.type === "photo" ? (
                  <div className="relative h-52 w-full overflow-hidden">
                    <img
                      src={att.storage_path}
                      alt={att.caption || "Fotografia"}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setEnlargedPhoto(att)}
                      className="absolute top-3 right-3 rounded-full p-2 liquid-glass-pill"
                      title="Visualização ampliada"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-36 w-full bg-[#FFF1EA] dark:bg-[#2A1424] flex flex-col items-center justify-center p-4 gap-2">
                    <Mic className="h-8 w-8 text-[#E8476A]" />
                    {att.storage_path.startsWith("data:audio") && (
                      <audio
                        controls
                        src={att.storage_path}
                        className="w-full h-9"
                      />
                    )}
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="rounded-full bg-[#E8476A]/15 px-2.5 py-0.5 font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                      {child?.name || "Criança"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" /> Privado
                    </span>
                  </div>
                  <p className="text-xs font-bold">{att.activity_tag}</p>
                  <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
                    {att.caption || "Sem legenda complementar"}
                  </p>
                  <div className="pt-2 border-t border-[#3B1425]/8 dark:border-white/10 flex justify-between items-center text-[11px]">
                    <span className="text-[#8C5A68]">
                      {new Date(att.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <Link
                      href={`/sessoes/${att.session_id}`}
                      className="font-semibold text-[#E8476A] dark:text-[#FF8A5B] underline"
                    >
                      Ver sessão →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GlassModal
        open={Boolean(enlargedPhoto)}
        onClose={() => setEnlargedPhoto(null)}
        title={enlargedPhoto?.activity_tag || "Fotografia"}
        subtitle="Visualização Ampliada"
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
