"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { calculateAgeLabel } from "@/lib/portfolio-template";
import { GlassToolbar, GlassButton } from "@/components/liquid-glass";
import { ArrowLeft, ShieldCheck, UserPlus } from "lucide-react";

export default function NewChildPage() {
  const router = useRouter();
  const { mutateState } = useApp();

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [groupName, setGroupName] = useState("Psi. Maria Eduarda — Manhã");
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [notes, setNotes] = useState("");
  const [imageConsent, setImageConsent] = useState(true);
  const [audioConsent, setAudioConsent] = useState(true);
  const [aiConsent, setAiConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const computedAge = birthDate
    ? calculateAgeLabel(birthDate)
    : "Preencha a data de nascimento";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !birthDate) {
      setError(
        "Por favor, informe o nome completo e a data de nascimento da criança."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await mutateState("create_child", {
        name,
        birth_date: birthDate,
        start_date: startDate,
        group_name: groupName,
        guardian_name: guardianName,
        guardian_contact: guardianContact,
        notes,
        image_consent: imageConsent,
        audio_consent: audioConsent,
        ai_processing_consent: aiConsent,
      });

      if (res.ok && res.child) {
        const created = res.child as { id: string };
        router.push(`/criancas/${created.id}`);
      } else {
        setError(
          String(res.error || "Não foi possível cadastrar o prontuário.")
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <GlassToolbar className="flex items-center justify-between">
        <Link
          href="/criancas"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Lista de Crianças</span>
        </Link>
      </GlassToolbar>

      <div className="rounded-3xl apple-stable-surface p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#3B1425]/10 dark:border-white/10 pb-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8476A] dark:text-[#FF8A5B]">
            Prontuário Individual • Psi. Maria Eduarda
          </span>
          <h1 className="text-2xl font-bold mt-0.5">
            Cadastro de Nova Criança
          </h1>
          <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
            Um identificador único será atribuído automaticamente para isolar todos os registros.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                Nome Completo da Criança *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Helena Primavera de Oliveira"
                className="w-full apple-input px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                Data de Nascimento *
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full apple-input px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                Idade Calculada Automaticamente
              </label>
              <div className="w-full rounded-2xl bg-[#E8476A]/12 dark:bg-[#FF8A5B]/20 px-4 py-2.5 text-sm font-semibold text-[#E8476A] dark:text-[#FF8A5B]">
                {computedAge}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                Data de Início do Acompanhamento
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full apple-input px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                Turma ou Grupo na Toca (Opcional)
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex.: Grupo Sementes / Manhã"
                className="w-full apple-input px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                Responsável Legal (Opcional)
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full apple-input px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                Contato do Responsável (Opcional)
              </label>
              <input
                type="text"
                value={guardianContact}
                onChange={(e) => setGuardianContact(e.target.value)}
                className="w-full apple-input px-4 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                Observações Gerais e Contexto Inicial
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full apple-input px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-4 space-y-3 border border-[#3B1425]/8 dark:border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E8476A] dark:text-[#FF8A5B]">
              <ShieldCheck className="h-4 w-4" />
              <span>Autorizações de Privacidade e LGPD</span>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-[#8C5A68] dark:text-[#F0BCC8] cursor-pointer">
              <input
                type="checkbox"
                checked={imageConsent}
                onChange={(e) => setImageConsent(e.target.checked)}
                className="mt-0.5 rounded"
              />
              <span>
                <strong className="text-[#3B1425] dark:text-[#FFF4F0]">
                  Autorização para Fotografias Pedagógicas:
                </strong>{" "}
                Permite anexar registros fotográficos das atividades no prontuário e no Portfólio das Vivências.
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-[#8C5A68] dark:text-[#F0BCC8] cursor-pointer">
              <input
                type="checkbox"
                checked={audioConsent}
                onChange={(e) => setAudioConsent(e.target.checked)}
                className="mt-0.5 rounded"
              />
              <span>
                <strong className="text-[#3B1425] dark:text-[#FFF4F0]">
                  Autorização para Gravação e Transcrição de Áudio:
                </strong>{" "}
                Permite que o profissional grave relatos de voz sobre a sessão.
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-[#8C5A68] dark:text-[#F0BCC8] cursor-pointer">
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={(e) => setAiConsent(e.target.checked)}
                className="mt-0.5 rounded"
              />
              <span>
                <strong className="text-[#3B1425] dark:text-[#FFF4F0]">
                  Organização Pedagógica com IA:
                </strong>{" "}
                Autoriza a estruturação observacional das anotações para elaboração assistida do portfólio.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/criancas">
              <GlassButton type="button" variant="secondary" size="md">
                Cancelar
              </GlassButton>
            </Link>
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              floating
              disabled={submitting}
            >
              <UserPlus className="h-4 w-4" />
              <span>
                {submitting ? "Salvando..." : "Criar Prontuário Individual"}
              </span>
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
