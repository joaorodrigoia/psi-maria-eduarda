import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { ObservationCategory } from "@/lib/types";

const MONTH_MAP: Record<string, number> = {
  janeiro: 0,
  fevereiro: 1,
  março: 2,
  marco: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

const INTENT_CATEGORY_MAP: { terms: string[]; category: ObservationCategory }[] = [
  {
    terms: ["coordenação motora", "motor", "corpo", "movimento", "correr", "pular", "encaixe"],
    category: "Desenvolvimento motor observado",
  },
  {
    terms: ["interação social", "interagiu", "convivência", "social", "colegas", "outras crianças", "dividiu"],
    category: "Interação social",
  },
  {
    terms: ["mediação", "apoio", "ajuda do profissional", "intervenção", "acolhimento"],
    category: "Mediação e apoio oferecidos pelo profissional",
  },
  {
    terms: ["autonomia", "sozinho", "sozinha", "higiene", "alimentação", "rotina"],
    category: "Autonomia",
  },
  {
    terms: ["comunicação", "fala", "expressão", "gesto", "linguagem"],
    category: "Comunicação e expressão",
  },
  {
    terms: ["emoção", "emocional", "frustração", "frustrada", "alegria", "choro", "reorganizar"],
    category: "Reações emocionais observadas",
  },
  {
    terms: ["desafio", "dificuldade", "conflito"],
    category: "Desafios identificados durante as atividades",
  },
  {
    terms: ["progresso", "avanço", "conquista", "evolução"],
    category: "Progressos observados",
  },
  {
    terms: ["exploração", "aprendizagem", "descoberta", "curiosidade"],
    category: "Exploração e aprendizagem",
  },
  {
    terms: ["participação", "brincadeira", "blocos", "torre"],
    category: "Participação nas atividades",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body.query || "").trim();
    const childId = body.child_id || "";
    const categoryFilter = body.category || "";
    const startDate = body.start_date || "";
    const endDate = body.end_date || "";

    const db = readDb();
    const lowerQ = query.toLowerCase();

    // Detectar categorias implícitas na pergunta em linguagem natural
    const detectedCategories = new Set<string>();
    if (categoryFilter) detectedCategories.add(categoryFilter);

    for (const item of INTENT_CATEGORY_MAP) {
      if (item.terms.some((t) => lowerQ.includes(t))) {
        detectedCategories.add(item.category);
      }
    }

    // Detectar mês mencionado na pergunta (ex: "durante outubro")
    let detectedMonth: number | null = null;
    for (const [mName, mIdx] of Object.entries(MONTH_MAP)) {
      if (lowerQ.includes(mName)) {
        detectedMonth = mIdx;
        break;
      }
    }

    // Extrair palavras-chave significativas (ignorando stop-words comuns de perguntas)
    const stopWords = new Set([
      "quais",
      "atividades",
      "foram",
      "registradas",
      "para",
      "esta",
      "criança",
      "crianca",
      "mostre",
      "os",
      "as",
      "de",
      "da",
      "do",
      "durante",
      "situações",
      "situacoes",
      "exigiram",
      "registros",
      "que",
      "com",
      "em",
      "na",
      "no",
    ]);

    const keywords = lowerQ
      .replace(/[?!.,]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w) && !(w in MONTH_MAP));

    const results = db.observations
      .filter((obs) => {
        if (childId && obs.child_id !== childId) return false;

        const session = db.sessions.find((s) => s.id === obs.session_id);
        if (!session) return false;

        const sDate = session.session_date.slice(0, 10);
        if (startDate && sDate < startDate) return false;
        if (endDate && sDate > endDate) return false;

        if (detectedMonth !== null) {
          const d = new Date(session.session_date);
          if (d.getMonth() !== detectedMonth) return false;
        }

        if (detectedCategories.size > 0 && detectedCategories.has(obs.category)) {
          return true;
        }

        if (categoryFilter && obs.category !== categoryFilter) {
          return false;
        }

        if (!query) return true;

        const hay = `${obs.content} ${obs.category} ${obs.portfolio_section} ${session.notes}`.toLowerCase();
        return keywords.length === 0 || keywords.some((kw) => hay.includes(kw));
      })
      .map((obs) => {
        const session = db.sessions.find((s) => s.id === obs.session_id);
        const child = db.children.find((c) => c.id === obs.child_id);
        return {
          observation: obs,
          session,
          child,
        };
      });

    // Gerar síntese inteligente da resposta
    let aiSummary = "";
    if (results.length === 0) {
      aiSummary =
        "Não foram encontrados acontecimentos registrados para os critérios informados. Nenhum dado foi inferido ou inventado.";
    } else {
      const uniqueSessions = new Set(results.map((r) => r.session?.id).filter(Boolean));
      aiSummary = `Foram localizadas ${results.length} evidências observacionais distribuídas em ${uniqueSessions.size} ${
        uniqueSessions.size === 1 ? "sessão registrada" : "sessões registradas"
      }. Todas as informações abaixo preservam o vínculo direto com a sessão de origem.`;
    }

    return NextResponse.json({
      ok: true,
      summary: aiSummary,
      detectedCategories: Array.from(detectedCategories),
      results,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro na busca inteligente";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
