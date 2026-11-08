"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { PortfolioPhotoSlot } from "@/lib/types";
import {
  GlassButton,
  GlassToolbar,
  GlassModal,
} from "@/components/liquid-glass";
import {
  Mic,
  Square,
  Upload,
  Camera,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Save,
  Volume2,
  MessageCircleHeart,
  Maximize2,
} from "lucide-react";

interface DraftPhoto {
  id: string;
  storage_path: string;
  activity_tag: string;
  portfolio_slot: PortfolioPhotoSlot;
  caption: string;
}

interface DraftAudio {
  id: string;
  storage_path: string;
  caption: string;
  duration_seconds: number;
  transcription_text: string;
  reviewed: boolean;
  provider?: string;
}

function NewSessionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedChildId = searchParams.get("childId") || "";

  const { db, currentUser, mutateState } = useApp();
  const activeChildren = (db?.children || []).filter((c) => !c.archived_at);

  const [childId, setChildId] = useState(preselectedChildId);
  const [sessionDate, setSessionDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [professionalName, setProfessionalName] = useState(
    currentUser?.name || "Educadora Responsável — Psi. Maria Eduarda"
  );
  const [notes, setNotes] = useState("");
  const [complementaryNotes, setComplementaryNotes] = useState("");

  // Seção 11 do Miolo: A Voz da Criança
  const [showChildVoice, setShowChildVoice] = useState(false);
  const [naTocaGostoDe, setNaTocaGostoDe] = useState("");
  const [brincadeiraPreferida, setBrincadeiraPreferida] = useState("");
  const [euAprendi, setEuAprendi] = useState("");
  const [queroBrincarMaisDe, setQueroBrincarMaisDe] = useState("");
  const [escolhasNosContam, setEscolhasNosContam] = useState("");

  // Fotos e Áudios
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [audios, setAudios] = useState<DraftAudio[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<DraftPhoto | null>(null);

  // Estado de gravação de áudio pelo navegador
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [transcribingStatus, setTranscribingStatus] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecRef = useRef<{ stop: () => void } | null>(null);

  const [autoSaveNotice, setAutoSaveNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (preselectedChildId) {
      setChildId(preselectedChildId);
    } else if (!childId && activeChildren.length > 0) {
      setChildId(activeChildren[0].id);
    }
  }, [preselectedChildId, activeChildren, childId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("toca_draft_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notes && !notes) setNotes(parsed.notes);
        if (parsed.complementaryNotes && !complementaryNotes) {
          setComplementaryNotes(parsed.complementaryNotes);
        }
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      try {
        if (notes || complementaryNotes) {
          localStorage.setItem(
            "toca_draft_session",
            JSON.stringify({
              notes,
              complementaryNotes,
              updatedAt: new Date().toISOString(),
            })
          );
          setAutoSaveNotice(
            `Rascunho salvo às ${new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          );
        }
      } catch {
        // ignore
      }
    }, 1200);
    return () => clearTimeout(handle);
  }, [notes, complementaryNotes]);

  const startRecording = async () => {
    setError("");
    setLiveTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      let accumulatedSpeech = "";
      if (typeof window !== "undefined") {
        const SpeechRecognition =
          (window as unknown as Record<string, unknown>).SpeechRecognition ||
          (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
        if (typeof SpeechRecognition === "function") {
          const recognition = new (SpeechRecognition as new () => {
            lang: string;
            continuous: boolean;
            interimResults: boolean;
            onresult: (event: {
              results: ArrayLike<ArrayLike<{ transcript: string }>>;
            }) => void;
            start: () => void;
            stop: () => void;
          })();
          recognition.lang = "pt-BR";
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (event) => {
            let text = "";
            for (let i = 0; i < event.results.length; i++) {
              text += event.results[i][0].transcript + " ";
            }
            accumulatedSpeech = text.trim();
            setLiveTranscript(accumulatedSpeech);
          };
          try {
            recognition.start();
            speechRecRef.current = recognition;
          } catch {
            // ignore
          }
        }
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (speechRecRef.current) {
          try {
            speechRecRef.current.stop();
          } catch {
            // ignore
          }
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = String(reader.result || "");
          setTranscribingStatus("Transcrevendo áudio automaticamente...");

          let finalTranscript = accumulatedSpeech;
          let providerLabel = "Web Speech PT-BR";

          try {
            const fd = new FormData();
            fd.append("file", audioBlob, "relato_sessao.webm");
            const res = await fetch("/api/transcribe", {
              method: "POST",
              body: fd,
            });
            const json = await res.json();
            if (json.ok && json.text && json.text.trim()) {
              finalTranscript = json.text.trim();
              providerLabel = json.provider || "VoiceStudio Whisper";
            }
          } catch {
            // fallback
          }

          if (!finalTranscript) {
            finalTranscript =
              notes.trim() ||
              "Áudio gravado. Revise ou digite aqui os pontos principais narrados no áudio.";
          }

          const newAudioItem: DraftAudio = {
            id: "aud-" + Date.now(),
            storage_path: base64Audio,
            caption: `Gravação de voz (${recordingSeconds}s)`,
            duration_seconds: recordingSeconds,
            transcription_text: finalTranscript,
            reviewed: false,
            provider: providerLabel,
          };

          setAudios((prev) => [newAudioItem, ...prev]);
          setTranscribingStatus("");
          setLiveTranscript("");
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setError(
        "Não foi possível acessar o microfone do navegador. Verifique a permissão de áudio ou envie um arquivo gravado no celular."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleAudioFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = String(reader.result || "");
      setTranscribingStatus("Processando e transcrevendo áudio enviado...");

      let text = "";
      let provider = "Transcrição Assistida";
      try {
        const fd = new FormData();
        fd.append("file", file, file.name);
        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: fd,
        });
        const json = await res.json();
        if (json.ok && json.text) {
          text = json.text;
          provider = json.provider;
        }
      } catch {
        // ignore
      }

      setAudios((prev) => [
        {
          id: "aud-" + Date.now(),
          storage_path: base64,
          caption: file.name,
          duration_seconds: 0,
          transcription_text:
            text ||
            "Arquivo de áudio anexado. Revise ou transcreva as observações relevantes deste áudio.",
          reviewed: false,
          provider,
        },
        ...prev,
      ]);
      setTranscribingStatus("");
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = String(reader.result || "");
        setPhotos((prev) => [
          ...prev,
          {
            id: "pho-" + Date.now() + Math.random().toString(36).slice(2, 6),
            storage_path: dataUrl,
            activity_tag: "Vivência com materiais e exploração",
            portfolio_slot: "galeria_geral",
            caption: "",
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!childId) {
      setError("Selecione uma criança cadastrada antes de salvar a sessão.");
      return;
    }

    if (!notes.trim() && audios.length === 0 && photos.length === 0) {
      setError(
        "Adicione uma anotação em texto, gravação de áudio ou fotografia da vivência."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await mutateState("create_session", {
        child_id: childId,
        session_date: new Date(sessionDate).toISOString(),
        professional_name: professionalName,
        notes,
        complementary_notes: complementaryNotes,
        child_voice_quotes: {
          na_toca_gosto_de: naTocaGostoDe,
          brincadeira_preferida: brincadeiraPreferida,
          eu_aprendi: euAprendi,
          quero_brincar_mais_de: queroBrincarMaisDe,
          escolhas_nos_contam: escolhasNosContam,
        },
        photos,
        audios,
      });

      if (res.ok && res.session) {
        try {
          localStorage.removeItem("toca_draft_session");
        } catch {
          // ignore
        }
        const created = res.session as { id: string };
        router.push(`/sessoes/${created.id}`);
      } else {
        setError(String(res.error || "Erro ao salvar a sessão."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Barra Superior Translúcida */}
      <GlassToolbar className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Painel Inicial</span>
        </Link>
        {autoSaveNotice && (
          <span className="text-[11px] font-medium text-[#E8476A] dark:text-[#FF8A5B]">
            {autoSaveNotice}
          </span>
        )}
      </GlassToolbar>

      {/* Superfície de Leitura Estável para Registro da Sessão */}
      <div className="rounded-3xl apple-stable-surface p-6 sm:p-8 space-y-7">
        <div className="border-b border-[#3B1425]/10 dark:border-white/10 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8476A] dark:text-[#FF8A5B]">
            Registro Diário • Psi. Maria Eduarda
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
            Nova Sessão de Acompanhamento
          </h1>
          <p className="text-xs sm:text-sm text-[#8C5A68] dark:text-[#F0BCC8] mt-1">
            Escreva livremente, use o botão circular flutuante para gravar áudio com transcrição automática ou anexe fotografias.
          </p>
        </div>

        {activeChildren.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <p className="text-lg font-bold">
              Cadastre uma criança primeiro para vincular a sessão
            </p>
            <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] max-w-md mx-auto">
              Para garantir o isolamento de prontuários, toda sessão precisa estar vinculada a uma criança cadastrada.
            </p>
            <Link href="/criancas/nova">
              <GlassButton variant="primary" size="md">
                Cadastrar Criança Agora
              </GlassButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-7">
            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Identificação da Sessão */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                  Criança Selecionada *
                </label>
                <select
                  required
                  value={childId}
                  onChange={(e) => setChildId(e.target.value)}
                  className="w-full apple-input px-3.5 py-2.5 text-sm font-medium"
                >
                  {activeChildren.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.unique_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                  Data e Horário *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full apple-input px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                  Profissional Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={professionalName}
                  onChange={(e) => setProfessionalName(e.target.value)}
                  className="w-full apple-input px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* 1. Anotações em Texto Livre sobre Superfície Estável */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8]">
                  Descrição Livre da Sessão (Anotações em Texto)
                </label>
                <GlassButton
                  type="button"
                  variant="glass"
                  size="sm"
                  onClick={() =>
                    setNotes(
                      "Hoje a criança participou da brincadeira com blocos, demonstrou interesse em construir uma torre e interagiu com outras duas crianças. Em determinado momento ficou frustrada quando a torre caiu, mas voltou à atividade após receber apoio. Também realizou uma atividade de encaixe com menor necessidade de ajuda e guardou os materiais ao final."
                    )
                  }
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#E8476A] dark:text-[#FF8A5B]" />
                  <span>Inserir Exemplo Pedagógico</span>
                </GlassButton>
              </div>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escreva livremente sobre a participação, interações, conquistas e mediações oferecidas..."
                className="w-full apple-input p-4 text-sm leading-relaxed"
              />
            </div>

            {/* 2. Botão Circular Flutuante de Gravação com Ondas Sonoras Discretas */}
            <div className="rounded-3xl liquid-glass p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Mic className="h-4 w-4 text-[#E8476A] dark:text-[#FF8A5B]" />
                    Gravação de Voz & Transcrição Automática
                  </h3>
                  <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
                    Toque no botão circular flutuante para gravar pelo navegador ou envie um arquivo de áudio.
                  </p>
                </div>

                {/* Controles Flutuantes de Áudio: Botão Circular + Ondas Sonoras */}
                <div className="flex items-center gap-3">
                  {isRecording && (
                    <div className="flex items-center gap-2 rounded-full liquid-glass-pill px-4 py-2">
                      <div className="flex items-center gap-1 h-4">
                        {[0, 0.15, 0.3, 0.45, 0.2].map((delay, i) => (
                          <span
                            key={i}
                            style={{ animationDelay: `${delay}s` }}
                            className="w-1 h-4 rounded-full bg-red-500 animate-sound-wave"
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-red-500 tabular-nums">
                        {recordingSeconds}s
                      </span>
                    </div>
                  )}

                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8476A] text-white shadow-[0_10px_25px_-4px_rgba(232,71,106,0.6),inset_0_1px_0_0_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition"
                      title="Gravar áudio pelo microfone"
                      aria-label="Iniciar gravação de áudio"
                    >
                      <Mic className="h-6 w-6" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_10px_25px_-4px_rgba(239,68,68,0.6),inset_0_1px_0_0_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition"
                      title="Parar gravação"
                      aria-label="Parar gravação de áudio"
                    >
                      <Square className="h-5 w-5 fill-white" />
                    </button>
                  )}

                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-full liquid-glass-pill px-4 py-2.5 text-xs font-semibold hover:brightness-105 transition">
                    <Upload className="h-4 w-4 text-[#E8476A] dark:text-[#FF8A5B]" />
                    <span>Enviar Áudio</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {isRecording && liveTranscript && (
                <div className="rounded-2xl apple-stable-surface p-3.5 text-xs">
                  <strong className="text-[#E8476A] dark:text-[#FF8A5B] block mb-0.5">
                    Transcrição ao vivo:
                  </strong>
                  {liveTranscript}
                </div>
              )}

              {transcribingStatus && (
                <p className="text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B] animate-pulse">
                  {transcribingStatus}
                </p>
              )}

              {audios.length > 0 && (
                <div className="space-y-3 pt-2">
                  {audios.map((aud, idx) => (
                    <div
                      key={aud.id}
                      className="rounded-2xl apple-stable-surface p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <Volume2 className="h-4 w-4 text-[#E8476A] dark:text-[#FF8A5B]" />
                          <span>{aud.caption}</span>
                          {aud.provider && (
                            <span className="rounded-full bg-[#E8476A]/15 px-2.5 py-0.5 text-[10px] text-[#E8476A] dark:text-[#FF8A5B]">
                              {aud.provider}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setAudios((prev) =>
                              prev.filter((item) => item.id !== aud.id)
                            )
                          }
                          className="text-xs text-red-500 hover:underline inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remover
                        </button>
                      </div>

                      {aud.storage_path.startsWith("data:audio") && (
                        <audio
                          controls
                          src={aud.storage_path}
                          className="w-full h-9"
                        />
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold uppercase text-[#8C5A68] dark:text-[#F0BCC8]">
                            Transcrição Automática (Revisar e Corrigir):
                          </label>
                          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={aud.reviewed}
                              onChange={(e) => {
                                const copy = [...audios];
                                copy[idx].reviewed = e.target.checked;
                                setAudios(copy);
                              }}
                              className="rounded"
                            />
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Revisada</span>
                          </label>
                        </div>
                        <textarea
                          rows={2}
                          value={aud.transcription_text}
                          onChange={(e) => {
                            const copy = [...audios];
                            copy[idx].transcription_text = e.target.value;
                            setAudios(copy);
                          }}
                          className="w-full apple-input p-2.5 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Upload de Fotos: Miniaturas Arredondadas, Visualização Ampliada e Controles Flutuantes */}
            <div className="rounded-3xl border border-[#3B1425]/10 dark:border-white/10 bg-[#FFF1EA] dark:bg-[#2A1424] p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Camera className="h-4 w-4 text-[#E8476A] dark:text-[#FF8A5B]" />
                    Galeria de Fotografias da Sessão
                  </h3>
                  <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
                    Miniaturas arredondadas com visualização ampliada e associação às seções do Portfólio.
                  </p>
                </div>

                <label className="cursor-pointer inline-flex items-center gap-2 rounded-full liquid-glass-pill px-4 py-2.5 text-xs font-semibold hover:brightness-105 transition">
                  <Camera className="h-4 w-4 text-[#E8476A] dark:text-[#FF8A5B]" />
                  <span>+ Adicionar / Capturar Fotos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {photos.map((pho, idx) => (
                    <div
                      key={pho.id}
                      className="rounded-3xl apple-stable-surface overflow-hidden flex flex-col"
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-black/5">
                        <img
                          src={pho.storage_path}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        {/* Controles Flutuantes sobre a Miniatura */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewPhoto(pho)}
                            className="rounded-full p-2 liquid-glass-pill text-[#3B1425] dark:text-[#FFF4F0]"
                            title="Visualização ampliada"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPhotos((prev) =>
                                prev.filter((item) => item.id !== pho.id)
                              )
                            }
                            className="rounded-full p-2 liquid-glass-pill text-red-500"
                            title="Remover foto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 space-y-2.5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#8C5A68] dark:text-[#F0BCC8] mb-0.5">
                            Atividade Associada
                          </label>
                          <input
                            type="text"
                            value={pho.activity_tag}
                            onChange={(e) => {
                              const copy = [...photos];
                              copy[idx].activity_tag = e.target.value;
                              setPhotos(copy);
                            }}
                            className="w-full apple-input px-3 py-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#8C5A68] dark:text-[#F0BCC8] mb-0.5">
                            Seção no Portfólio Psi. Maria Eduarda
                          </label>
                          <select
                            value={pho.portfolio_slot}
                            onChange={(e) => {
                              const copy = [...photos];
                              copy[idx].portfolio_slot = e.target
                                .value as PortfolioPhotoSlot;
                              setPhotos(copy);
                            }}
                            className="w-full apple-input px-3 py-1.5 text-xs"
                          >
                            <option value="galeria_geral">Galeria Geral da Sessão</option>
                            <option value="foto_abertura">Capa: FOTO DE ABERTURA</option>
                            <option value="corpo_movimento">
                              Seção 4: FOTO CORPO, MOVIMENTO OU BRINCADEIRA
                            </option>
                            <option value="experiencia_descoberta">
                              Seção 8: AQUI TEVE DESCOBERTA...
                            </option>
                            <option value="experiencia_encontro">
                              Seção 8: AQUI TEVE ENCONTRO...
                            </option>
                            <option value="experiencia_desafio">
                              Seção 8: AQUI TEVE DESAFIO...
                            </option>
                            <option value="experiencia_conquista">
                              Seção 8: E AQUI TEVE CONQUISTA!
                            </option>
                            <option value="producao_1">Seção 9: PRODUÇÃO / FOTO 1</option>
                            <option value="producao_2">Seção 9: PRODUÇÃO / FOTO 2</option>
                            <option value="foto_memoria">
                              Seção 12: UMA FOTO SIGNIFICATIVA DESTE PERCURSO
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#8C5A68] dark:text-[#F0BCC8] mb-0.5">
                            Legenda do Processo Observado
                          </label>
                          <textarea
                            rows={2}
                            value={pho.caption}
                            onChange={(e) => {
                              const copy = [...photos];
                              copy[idx].caption = e.target.value;
                              setPhotos(copy);
                            }}
                            placeholder="Elementos visíveis da atividade..."
                            className="w-full apple-input px-3 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. A Voz da Criança */}
            <div className="rounded-3xl border border-[#3B1425]/10 dark:border-white/10 p-5 space-y-4">
              <button
                type="button"
                onClick={() => setShowChildVoice((v) => !v)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircleHeart className="h-5 w-5 text-[#E8476A] dark:text-[#FF8A5B]" />
                  <div>
                    <h3 className="text-base font-bold">
                      A Voz da Criança / O Que Suas Escolhas Nos Contam (Opcional)
                    </h3>
                    <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
                      Registre falas literais ou escolhas/gestos/CAA para a Seção 11 do Portfólio
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B]">
                  {showChildVoice ? "Ocultar ▲" : "Expandir ▼"}
                </span>
              </button>

              {showChildVoice && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#3B1425]/10 dark:border-white/10">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      “Na Toca eu gosto de...”
                    </label>
                    <input
                      type="text"
                      value={naTocaGostoDe}
                      onChange={(e) => setNaTocaGostoDe(e.target.value)}
                      className="w-full apple-input px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      “Minha brincadeira preferida é...”
                    </label>
                    <input
                      type="text"
                      value={brincadeiraPreferida}
                      onChange={(e) => setBrincadeiraPreferida(e.target.value)}
                      className="w-full apple-input px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      “Eu aprendi...”
                    </label>
                    <input
                      type="text"
                      value={euAprendi}
                      onChange={(e) => setEuAprendi(e.target.value)}
                      className="w-full apple-input px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      “Eu quero brincar mais de...”
                    </label>
                    <input
                      type="text"
                      value={queroBrincarMaisDe}
                      onChange={(e) => setQueroBrincarMaisDe(e.target.value)}
                      className="w-full apple-input px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold mb-1">
                      Quando a fala não for a principal forma de resposta: O QUE SUAS ESCOLHAS NOS CONTAM?
                    </label>
                    <textarea
                      rows={2}
                      value={escolhasNosContam}
                      onChange={(e) => setEscolhasNosContam(e.target.value)}
                      className="w-full apple-input px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Observações Complementares */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
                Observações Complementares e Mediações Oferecidas (Opcional)
              </label>
              <textarea
                rows={2}
                value={complementaryNotes}
                onChange={(e) => setComplementaryNotes(e.target.value)}
                placeholder="Apoios oferecidos pela equipe, estratégias de reorganização emocional..."
                className="w-full apple-input p-3.5 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/">
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
                <Save className="h-4 w-4" />
                <span>
                  {submitting
                    ? "Salvando e Estruturando..."
                    : "Salvar Sessão e Extrair Observações"}
                </span>
              </GlassButton>
            </div>
          </form>
        )}
      </div>

      {/* Modal de Visualização Ampliada da Foto */}
      <GlassModal
        open={Boolean(previewPhoto)}
        onClose={() => setPreviewPhoto(null)}
        title={previewPhoto?.activity_tag || "Fotografia da Vivência"}
        subtitle="Visualização Ampliada"
        icon={<Camera className="h-5 w-5" />}
      >
        {previewPhoto && (
          <div className="space-y-3">
            <img
              src={previewPhoto.storage_path}
              alt="Visualização ampliada"
              className="w-full max-h-[60vh] object-contain rounded-2xl"
            />
            <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
              {previewPhoto.caption || "Sem legenda complementar."}
            </p>
          </div>
        )}
      </GlassModal>
    </div>
  );
}

export default function NewSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-[#8C5A68]">
          Carregando formulário de sessão...
        </div>
      }
    >
      <NewSessionForm />
    </Suspense>
  );
}
