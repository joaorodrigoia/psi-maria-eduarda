"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { OBSERVATION_CATEGORIES, Observation } from "@/lib/types";
import { GlassToolbar, GlassButton } from "@/components/liquid-glass";
import { Search, Sparkles, Calendar, ArrowRight } from "lucide-react";

interface SearchResultItem {
  observation: Observation;
  session?: {
    id: string;
    session_date: string;
    notes: string;
    professional_name: string;
  };
  child?: { id: string; name: string; unique_code: string };
}

const EXAMPLE_QUERIES = [
  "Quais atividades de coordenação motora foram registradas para esta criança?",
  "Mostre os registros de interação social durante outubro.",
  "Quais situações exigiram mediação do profissional?",
  "Quais avanços de autonomia foram observados?",
];

export default function IntelligentSearchPage() {
  const { db } = useApp();
  const [query, setQuery] = useState("");
  const [childId, setChildId] = useState("");
  const [category, setCategory] = useState("");
  const [searching, setSearching] = useState(false);
  const [summary, setSummary] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = async (customQuery?: string) => {
    const qToUse = customQuery !== undefined ? customQuery : query;
    if (customQuery !== undefined) setQuery(customQuery);

    setSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: qToUse,
          child_id: childId,
          category,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setSummary(json.summary);
        setResults(json.results || []);
        setHasSearched(true);
      }
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#E8476A] dark:text-[#FF8A5B]">
          Recuperação Contextual com Rastreabilidade
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Histórico Inteligente e Busca por Evidências
        </h1>
        <p className="text-xs sm:text-sm text-[#8C5A68] dark:text-[#F0BCC8]">
          Pergunte em linguagem natural ou filtre por criança, período e categoria. O sistema aponta os acontecimentos identificados e as respectivas sessões de origem.
        </p>
      </div>

      {/* GlassToolbar de Busca */}
      <GlassToolbar className="space-y-4 p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C5A68]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Ex.: Quais atividades de coordenação motora foram registradas para esta criança?"
              className="w-full apple-input pl-11 pr-4 py-3 text-sm"
            />
          </div>
          <GlassButton
            variant="primary"
            size="lg"
            floating
            onClick={() => runSearch()}
            disabled={searching}
          >
            <Sparkles className="h-4 w-4" />
            <span>{searching ? "Consultando..." : "Buscar no Histórico"}</span>
          </GlassButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            className="apple-input px-3.5 py-2 text-xs font-medium"
          >
            <option value="">Todas as Crianças</option>
            {(db?.children || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.unique_code})
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="apple-input px-3.5 py-2 text-xs font-medium"
          >
            <option value="">Todas as 11 Categorias Pedagógicas</option>
            {OBSERVATION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-1 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] block">
            Perguntas Rápidas de Exemplo:
          </span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => runSearch(eq)}
                className="rounded-full liquid-glass-pill px-3 py-1 text-xs hover:brightness-105 transition"
              >
                “{eq}”
              </button>
            ))}
          </div>
        </div>
      </GlassToolbar>

      {/* Resultados sobre Superfícies de Leitura Estáveis */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#E8476A]/12 dark:bg-[#FF8A5B]/20 p-4 text-xs sm:text-sm font-medium text-[#E8476A] dark:text-[#FF8A5B] flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 shrink-0" />
            <span>{summary}</span>
          </div>

          <div className="space-y-3">
            {results.map((item) => (
              <div
                key={item.observation.id}
                className="rounded-2xl apple-stable-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.child && (
                      <span className="rounded-full sunset-gradient px-2.5 py-0.5 text-[10px] font-bold text-white">
                        {item.child.name} ({item.child.unique_code})
                      </span>
                    )}
                    <span className="rounded-full bg-[#E8476A]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#E8476A] dark:text-[#FF8A5B]">
                      {item.observation.category}
                    </span>
                    <span className="rounded-full bg-[#3B1425]/5 dark:bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#8C5A68] dark:text-[#F0BCC8]">
                      {item.observation.portfolio_section}
                    </span>
                  </div>
                  <p className="text-sm">{item.observation.content}</p>
                  <p className="text-[11px] text-[#8C5A68] inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Origem: {item.observation.source_reference}
                  </p>
                </div>

                {item.session && (
                  <Link href={`/sessoes/${item.session.id}`}>
                    <GlassButton variant="secondary" size="sm">
                      <span>Ver Sessão</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </GlassButton>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
