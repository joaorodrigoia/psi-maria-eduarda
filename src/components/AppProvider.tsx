"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { DatabaseState, User } from "@/lib/types";
import { LOVE_AND_FAITH_MESSAGES, LoveAndFaithMessage } from "@/lib/love-words";
import { GlassModal, GlassButton } from "@/components/liquid-glass";
import {
  Sparkles,
  Heart,
  BookOpen,
  Flower2,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface IntegrationStatus {
  aiProvider: string;
  transcriptionProvider: string;
  databaseProvider: string;
  officialDocxLoaded: boolean;
  officialDocxName: string;
}

interface AppContextValue {
  db: DatabaseState | null;
  loading: boolean;
  currentUser: User | null;
  integrationStatus: IntegrationStatus | null;
  theme: "light" | "dark";
  toggleTheme: () => void;
  refreshState: () => Promise<void>;
  mutateState: (
    action: string,
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; [key: string]: unknown }>;
  openLoveModal: () => void;
  loginAs: (name: string, email: string, role: User["role"]) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [integrationStatus, setIntegrationStatus] =
    useState<IntegrationStatus | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "usr-educadora-amor",
    name: "Psi. Maria Eduarda",
    email: "contato@psimariaeduarda.com.br",
    role: "coordenacao",
    created_at: new Date().toISOString(),
  });

  // Modal Romântico, de Encorajamento e Palavra de Deus — Sempre abre ao entrar
  const [showLoveModal, setShowLoveModal] = useState<boolean>(true);
  const [msgIndex, setMsgIndex] = useState<number>(0);

  const applyThemeClass = (nextTheme: "light" | "dark") => {
    if (typeof document !== "undefined") {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      applyThemeClass(next);
      try {
        localStorage.setItem("toca_apple_theme", next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const refreshState = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      const json = await res.json();
      if (json.ok && json.data) {
        let serverDb: DatabaseState = json.data;
        try {
          const cachedRaw = localStorage.getItem("psi_maria_eduarda_db_snapshot");
          if (cachedRaw) {
            const cachedDb = JSON.parse(cachedRaw) as DatabaseState;
            const serverEmpty =
              serverDb.children.length === 0 &&
              serverDb.sessions.length === 0 &&
              serverDb.reports.length === 0;
            const clientHasData =
              (cachedDb.children?.length || 0) > 0 ||
              (cachedDb.sessions?.length || 0) > 0 ||
              (cachedDb.reports?.length || 0) > 0;

            if (serverEmpty && clientHasData) {
              const syncRes = await fetch("/api/state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "restore_client_snapshot",
                  payload: { snapshot: cachedDb },
                }),
              });
              const syncJson = await syncRes.json();
              if (syncJson.ok && syncJson.data) {
                serverDb = syncJson.data;
              }
            } else if (!serverEmpty) {
              localStorage.setItem(
                "psi_maria_eduarda_db_snapshot",
                JSON.stringify(serverDb)
              );
            }
          }
        } catch {
          // ignore storage quota errors
        }
        setDb(serverDb);
        setIntegrationStatus(json.integrationStatus);
      }
    } catch (e) {
      console.error("Erro ao carregar estado:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * LOVE_AND_FAITH_MESSAGES.length);
    setMsgIndex(randomIdx);
    setShowLoveModal(true);

    try {
      const savedTheme = localStorage.getItem("toca_apple_theme") as
        | "light"
        | "dark"
        | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
        applyThemeClass(savedTheme);
      }
      const savedUser = localStorage.getItem("toca_current_user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as User;
        if (
          parsedUser.name.includes("Toca") ||
          parsedUser.name.includes("Educadora")
        ) {
          parsedUser.name = "Psi. Maria Eduarda";
          localStorage.setItem("toca_current_user", JSON.stringify(parsedUser));
        }
        setCurrentUser(parsedUser);
      }
    } catch {
      // ignore
    }

    refreshState();
  }, [refreshState]);

  const mutateState = async (
    action: string,
    payload: Record<string, unknown>
  ) => {
    const res = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });
    const json = await res.json();
    if (json.ok && json.data) {
      setDb(json.data);
      try {
        localStorage.setItem(
          "psi_maria_eduarda_db_snapshot",
          JSON.stringify(json.data)
        );
      } catch {
        // ignore storage quota errors
      }
    }
    return json;
  };

  const loginAs = (name: string, email: string, role: User["role"]) => {
    const u: User = {
      id: "usr-" + Date.now(),
      name,
      email,
      role,
      created_at: new Date().toISOString(),
    };
    setCurrentUser(u);
    try {
      localStorage.setItem("toca_current_user", JSON.stringify(u));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("toca_current_user");
    } catch {
      // ignore
    }
  };

  const currentMessage: LoveAndFaithMessage =
    LOVE_AND_FAITH_MESSAGES[msgIndex] || LOVE_AND_FAITH_MESSAGES[0];

  const nextMessage = () => {
    setMsgIndex((prev) => (prev + 1) % LOVE_AND_FAITH_MESSAGES.length);
  };

  const prevMessage = () => {
    setMsgIndex(
      (prev) =>
        (prev - 1 + LOVE_AND_FAITH_MESSAGES.length) %
        LOVE_AND_FAITH_MESSAGES.length
    );
  };

  return (
    <AppContext.Provider
      value={{
        db,
        loading,
        currentUser,
        integrationStatus,
        theme,
        toggleTheme,
        refreshState,
        mutateState,
        openLoveModal: () => setShowLoveModal(true),
        loginAs,
        logout,
      }}
    >
      {children}

      {/* GlassModal: Sempre ao Abrir — Palavra Romântica, de Encorajamento e Palavra de Deus */}
      <GlassModal
        open={showLoveModal}
        onClose={() => setShowLoveModal(false)}
        title="Psi. Maria Eduarda — Palavra do Dia"
        subtitle="Dedicação, Encorajamento & Palavra de Deus"
        icon={<Flower2 className="h-5 w-5 text-rose-500" />}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8476A]/10 dark:bg-[#FF8A5B]/20 px-3 py-1 text-xs font-semibold text-[#E8476A] dark:text-[#FF8A5B]">
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
              Mensagem {msgIndex + 1} de {LOVE_AND_FAITH_MESSAGES.length}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMessage}
                className="rounded-full p-1.5 liquid-glass-pill text-[#8C5A68] dark:text-[#F0BCC8] hover:text-[#3B1425] dark:hover:text-white transition"
                title="Mensagem anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextMessage}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium liquid-glass-pill text-[#3B1425] dark:text-[#FFF4F0] hover:brightness-105 transition"
              >
                <RefreshCw className="h-3 w-3" />
                Outra Palavra
              </button>
              <button
                onClick={nextMessage}
                className="rounded-full p-1.5 liquid-glass-pill text-[#8C5A68] dark:text-[#F0BCC8] hover:text-[#3B1425] dark:hover:text-white transition"
                title="Próxima mensagem"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#3B1425] dark:text-[#FFF4F0] leading-snug">
            {currentMessage.title}
          </h3>

          {/* Superfície de leitura estável 1: Romântico */}
          <div className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-4 border border-[#3B1425]/8 dark:border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-500">
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
              Para Você
            </div>
            <p className="text-sm sm:text-base text-[#3B1425] dark:text-[#FFF4F0] leading-relaxed">
              {currentMessage.romanticText}
            </p>
          </div>

          {/* Superfície de leitura estável 2: Encorajamento */}
          <div className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-4 border border-[#3B1425]/8 dark:border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E8476A] dark:text-[#FF8A5B]">
              <Sparkles className="h-4 w-4 text-orange-400" />
              Encorajamento & Vocação
            </div>
            <p className="text-sm sm:text-base text-[#3B1425] dark:text-[#FFF4F0] leading-relaxed">
              {currentMessage.encouragementText}
            </p>
          </div>

          {/* Superfície de leitura estável 3: Palavra de Deus */}
          <div className="rounded-2xl bg-gradient-to-br from-[#E8476A]/12 via-rose-500/8 to-orange-400/12 p-5 border border-[#E8476A]/25 dark:border-[#FF8A5B]/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E8476A] dark:text-[#FF8A5B]">
              <BookOpen className="h-4 w-4" />
              Palavra de Deus
            </div>
            <blockquote className="font-serif text-base sm:text-lg text-[#3B1425] dark:text-[#FFF4F0] leading-relaxed">
              {currentMessage.bibleVerse}
            </blockquote>
            <p className="text-right text-xs font-semibold uppercase tracking-widest text-[#8C5A68] dark:text-[#F0BCC8]">
              — {currentMessage.bibleReference}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8] flex items-center gap-1.5">
              <Flower2 className="h-4 w-4 text-rose-400 shrink-0" />
              {currentMessage.springCourtNote}
            </p>

            <GlassButton
              variant="primary"
              size="lg"
              floating
              onClick={() => setShowLoveModal(false)}
            >
              <Heart className="h-4 w-4 fill-white" />
              <span>Iniciar Jornada</span>
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp deve ser usado dentro de AppProvider");
  }
  return ctx;
}
