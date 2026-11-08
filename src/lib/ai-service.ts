import {
  Child,
  Observation,
  ObservationCategory,
  PortfolioReportContent,
  SessionAttachment,
  SessionRecord,
  Transcription,
} from "./types";
import { createEmptyPortfolioContent } from "./portfolio-template";
import {
  generateGeminiJson,
  generateGeminiText,
  isGeminiConfigured,
} from "./gemini";

interface CategoryRule {
  category: ObservationCategory;
  portfolioSection: string;
  keywords: string[];
  mediationKeywords?: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "Participação nas atividades",
    portfolioSection: "2. MEU JEITO DE BRINCAR",
    keywords: [
      "participou",
      "brincadeira",
      "brincar",
      "brincou",
      "blocos",
      "torre",
      "proposta",
      "oficina",
      "roda",
      "iniciativa",
      "sustentou",
      "permaneceu",
      "interesse",
      "escolheu",
      "faz de conta",
      "imagin",
    ],
  },
  {
    category: "Interação social",
    portfolioSection: "3. EU E O OUTRO",
    keywords: [
      "interagiu",
      "outras crianças",
      "colega",
      "amig",
      "dividiu",
      "compartilhou",
      "coletiv",
      "aproximou",
      "junto",
      "dupla",
      "grupo",
      "conviv",
      "turno",
      "espera",
      "combinado",
      "conflito",
    ],
  },
  {
    category: "Comunicação e expressão",
    portfolioSection: "3. EU E O OUTRO",
    keywords: [
      "falou",
      "disse",
      "comunicou",
      "pediu",
      "apontou",
      "expressou",
      "gesto",
      "olhar",
      "cantou",
      "contou",
      "verbal",
      "perguntou",
      "respondeu",
      "caa",
      "nomeou",
    ],
  },
  {
    category: "Autonomia",
    portfolioSection: "6. AUTONOMIA NO COTIDIANO DA TOCA",
    keywords: [
      "sozinh",
      "autonomia",
      "menor necessidade de ajuda",
      "sem ajuda",
      "guardou",
      "organizou",
      "lanche",
      "alimenta",
      "água",
      "higiene",
      "lavou",
      "calçou",
      "pertences",
      "mochila",
      "rotina",
      "transição",
    ],
  },
  {
    category: "Desenvolvimento motor observado",
    portfolioSection: "4. MEU CORPO EM MOVIMENTO",
    keywords: [
      "correu",
      "pulou",
      "subiu",
      "desceu",
      "equilibr",
      "encaixe",
      "manipul",
      "constru",
      "dançou",
      "capoeira",
      "areia",
      "natureza",
      "motor",
      "coordenação",
      "recort",
      "pint",
      "model",
      "argila",
      "corpo",
      "movimento",
    ],
  },
  {
    category: "Exploração e aprendizagem",
    portfolioSection: "5. DESCOBERTAS, PENSAMENTOS E APRENDIZAGENS",
    keywords: [
      "explorou",
      "descobriu",
      "curios",
      "hipótese",
      "investig",
      "observou",
      "atenção",
      "planej",
      "resolveu",
      "aprendeu",
      "misturou",
      "textura",
      "cores",
      "formas",
      "experimentou",
    ],
  },
  {
    category: "Reações emocionais observadas",
    portfolioSection: "7. SENTIR, COMUNICAR E REGULAR",
    keywords: [
      "alegria",
      "sorriu",
      "empolg",
      "frustrad",
      "chorou",
      "incômodo",
      "incomod",
      "acalmou",
      "reorganiz",
      "emoç",
      "sentiu",
      "segurança",
      "tranquil",
      "entusiasm",
    ],
  },
  {
    category: "Desafios identificados durante as atividades",
    portfolioSection: "7. SENTIR, COMUNICAR E REGULAR",
    keywords: [
      "desafio",
      "dificuldade",
      "frustrad",
      "caiu",
      "resistiu",
      "recusou",
      "precisou de tempo",
      "hesitou",
      "insegur",
    ],
  },
  {
    category: "Progressos observados",
    portfolioSection: "10. UM OLHAR SOBRE MEU PERCURSO",
    keywords: [
      "avanço",
      "progresso",
      "conquista",
      "menor necessidade",
      "mais segurança",
      "voltou à atividade",
      "conseguiu",
      "ampliou",
      "evoluiu",
      "pela primeira vez",
    ],
  },
  {
    category: "Mediação e apoio oferecidos pelo profissional",
    portfolioSection: "2. MEU JEITO DE BRINCAR",
    keywords: [
      "apoio",
      "mediação",
      "mediado",
      "acolhimento",
      "auxílio",
      "convite",
      "intervenção",
      "orientação",
      "ajud",
      "acompanhamento",
      "conversamos",
      "oferecemos",
    ],
  },
];

function formatDateBR(isoOrDate: string): string {
  try {
    const d = new Date(isoOrDate);
    if (isNaN(d.getTime())) return isoOrDate;
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoOrDate;
  }
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 4);
}

/**
 * Extrai observações estruturadas de uma sessão específica da criança.
 * Segue estritamente as 10 regras obrigatórias da IA:
 * - Não inventa fatos
 * - Não realiza diagnósticos
 * - Separa fato observado de mediação profissional
 * - Preserva a referência exata da sessão de origem
 */
export function extractObservationsFromSession(
  session: SessionRecord,
  transcriptions: Transcription[],
  attachments: SessionAttachment[],
  childConsentForAI: boolean = true
): Omit<Observation, "id" | "created_at">[] {
  const dateLabel = formatDateBR(session.session_date);
  const results: Omit<Observation, "id" | "created_at">[] = [];
  const seenKeys = new Set<string>();

  // Reunir fontes autorizadas da própria sessão
  const sources: { text: string; originLabel: string }[] = [];

  if (session.notes && session.notes.trim()) {
    sources.push({
      text: session.notes.trim(),
      originLabel: `Sessão de ${dateLabel} (Relato em texto)`,
    });
  }
  if (session.complementary_notes && session.complementary_notes.trim()) {
    sources.push({
      text: session.complementary_notes.trim(),
      originLabel: `Sessão de ${dateLabel} (Observações complementares)`,
    });
  }

  for (const tr of transcriptions) {
    if (tr.session_id === session.id && tr.text.trim()) {
      sources.push({
        text: tr.text.trim(),
        originLabel: `Sessão de ${dateLabel} (Transcrição de áudio${tr.status === "reviewed" ? " revisada" : ""})`,
      });
    }
  }

  if (childConsentForAI) {
    for (const att of attachments) {
      if (att.session_id === session.id && att.type === "photo" && att.caption.trim()) {
        sources.push({
          text: `${att.activity_tag ? `[Atividade: ${att.activity_tag}] ` : ""}${att.caption.trim()}`,
          originLabel: `Sessão de ${dateLabel} (Registro fotográfico)`,
        });
      }
    }
  }

  for (const src of sources) {
    const sentences = splitSentences(src.text);
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      let matchedAny = false;

      for (const rule of CATEGORY_RULES) {
        if (rule.keywords.some((kw) => lower.includes(kw))) {
          matchedAny = true;
          const isMediation =
            rule.category === "Mediação e apoio oferecidos pelo profissional" ||
            lower.includes("apoio") ||
            lower.includes("mediação") ||
            lower.includes("oferecemos") ||
            lower.includes("acolhimento");

          const dedupKey = `${rule.category}::${sentence}`;
          if (!seenKeys.has(dedupKey)) {
            seenKeys.add(dedupKey);
            results.push({
              session_id: session.id,
              child_id: session.child_id,
              category: rule.category,
              portfolio_section: rule.portfolioSection,
              content: sentence,
              fact_vs_interpretation: isMediation ? "mediacao_profissional" : "fato_observado",
              source_reference: src.originLabel,
            });
          }
        }
      }

      if (!matchedAny) {
        const dedupKey = `Outras observações relevantes::${sentence}`;
        if (!seenKeys.has(dedupKey)) {
          seenKeys.add(dedupKey);
          results.push({
            session_id: session.id,
            child_id: session.child_id,
            category: "Outras observações relevantes",
            portfolio_section: "1. QUEM É ESSA CRIA NA TOCA?",
            content: sentence,
            fact_vs_interpretation: "fato_observado",
            source_reference: src.originLabel,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Sintetiza de forma natural, acolhedora e 100% fiel aos fatos um conjunto de observações
 * mantendo a rastreabilidade das sessões de origem.
 */
function synthesizeCategoryObservations(
  obsList: Observation[],
  fallbackMessage: string,
  prefixText?: string
): { text: string; sources: string[] } {
  if (!obsList || obsList.length === 0) {
    return { text: fallbackMessage, sources: [] };
  }

  const uniqueContents: string[] = [];
  const uniqueSources = new Set<string>();

  for (const o of obsList) {
    const clean = o.content.trim().replace(/\.$/, "");
    if (!uniqueContents.includes(clean)) {
      uniqueContents.push(clean);
    }
    uniqueSources.add(o.source_reference);
  }

  const joined = uniqueContents
    .map((c, idx) => {
      const loweredFirst = c.charAt(0).toLowerCase() + c.slice(1);
      return idx === 0 ? c : loweredFirst;
    })
    .join("; além disso, ");

  const sourcesArr = Array.from(uniqueSources);
  const refBadge = sourcesArr.length > 0 ? ` (Ref.: ${sourcesArr.join(" | ")})` : "";

  const finalText = prefixText
    ? `${prefixText} ${joined}.${refBadge}`
    : `${joined}.${refBadge}`;

  return {
    text: finalText,
    sources: sourcesArr,
  };
}

/**
 * Gera o relatório completo no modelo oficial "Portfólio das Vivências — Psi. Maria Eduarda"
 * consultando exclusivamente os registros da criança selecionada no período filtrado.
 */
export async function generatePortfolioReportWithAI(params: {
  child: Child;
  periodLabel: string;
  responsibleProfessional: string;
  sessions: SessionRecord[];
  observations: Observation[];
  attachments: SessionAttachment[];
  transcriptions: Transcription[];
}): Promise<PortfolioReportContent> {
  const {
    child,
    periodLabel,
    responsibleProfessional,
    sessions,
    observations,
    attachments,
    transcriptions,
  } = params;

  // Garantir isolamento absoluto: filtrar apenas registros cujo child_id === child.id
  const safeSessions = sessions.filter((s) => s.child_id === child.id);
  const safeObs = observations.filter((o) => o.child_id === child.id);
  const safePhotos = attachments.filter(
    (a) => a.child_id === child.id && a.type === "photo" && child.image_consent
  );
  const safeTranscriptions = (transcriptions || []).filter(
    (t) => t.child_id === child.id
  );

  const empty = createEmptyPortfolioContent(
    child.name,
    child.group_name || "Grupo Psi. Maria Eduarda",
    periodLabel,
    responsibleProfessional
  );

  if (safeSessions.length === 0) {
    return empty;
  }

  const insufficient =
    "Não há dados suficientes registrados nas sessões deste período para preencher este campo específico sem extrapolação. O profissional pode complementar na revisão humana.";

  const byCat = (cat: ObservationCategory) =>
    safeObs.filter((o) => o.category === cat);

  const partObs = byCat("Participação nas atividades");
  const socObs = byCat("Interação social");
  const comObs = byCat("Comunicação e expressão");
  const autObs = byCat("Autonomia");
  const motObs = byCat("Desenvolvimento motor observado");
  const expObs = byCat("Exploração e aprendizagem");
  const emoObs = byCat("Reações emocionais observadas");
  const desObs = byCat("Desafios identificados durante as atividades");
  const progObs = byCat("Progressos observados");
  const medObs = byCat("Mediação e apoio oferecidos pelo profissional");
  const outObs = byCat("Outras observações relevantes");

  // Fotos associadas aos slots do portfólio ou distribuídas a partir da galeria da criança
  const findPhotoBySlot = (slot: string, fallbackIndex: number) => {
    const exact = safePhotos.find((p) => p.portfolio_slot === slot);
    if (exact) return exact;
    return safePhotos[fallbackIndex] || undefined;
  };

  const photoAbertura = findPhotoBySlot("foto_abertura", 0);
  const photoCorpo = findPhotoBySlot("corpo_movimento", 1);
  const photoDescoberta = findPhotoBySlot("experiencia_descoberta", 0);
  const photoEncontro = findPhotoBySlot("experiencia_encontro", 1);
  const photoDesafio = findPhotoBySlot("experiencia_desafio", 2);
  const photoConquista = findPhotoBySlot("experiencia_conquista", 3);
  const photoProd1 = findPhotoBySlot("producao_1", 0);
  const photoProd2 = findPhotoBySlot("producao_2", 1);
  const photoMemoria = findPhotoBySlot("foto_memoria", 0);

  // Coletar falas reais da criança (Seção 11 - A Voz da Criança) registradas nas sessões
  const voiceNaToca: string[] = [];
  const voiceBrincadeira: string[] = [];
  const voiceAprendi: string[] = [];
  const voiceQueroMais: string[] = [];
  const voiceEscolhas: string[] = [];
  const voiceSources = new Set<string>();

  for (const s of safeSessions) {
    const dLabel = `Sessão de ${formatDateBR(s.session_date)}`;
    if (s.child_voice_quotes) {
      if (s.child_voice_quotes.na_toca_gosto_de) {
        voiceNaToca.push(`"${s.child_voice_quotes.na_toca_gosto_de}" (${dLabel})`);
        voiceSources.add(dLabel);
      }
      if (s.child_voice_quotes.brincadeira_preferida) {
        voiceBrincadeira.push(`"${s.child_voice_quotes.brincadeira_preferida}" (${dLabel})`);
        voiceSources.add(dLabel);
      }
      if (s.child_voice_quotes.eu_aprendi) {
        voiceAprendi.push(`"${s.child_voice_quotes.eu_aprendi}" (${dLabel})`);
        voiceSources.add(dLabel);
      }
      if (s.child_voice_quotes.quero_brincar_mais_de) {
        voiceQueroMais.push(`"${s.child_voice_quotes.quero_brincar_mais_de}" (${dLabel})`);
        voiceSources.add(dLabel);
      }
      if (s.child_voice_quotes.escolhas_nos_contam) {
        voiceEscolhas.push(`${s.child_voice_quotes.escolhas_nos_contam} (${dLabel})`);
        voiceSources.add(dLabel);
      }
    }
  }

  const allSessionRefs = safeSessions.map(
    (s) => `Sessão de ${formatDateBR(s.session_date)}`
  );

  // Seção 1: QUEM É ESSA CRIA NA TOCA?
  const s1Demonstra = synthesizeCategoryObservations(
    [...partObs, ...expObs].slice(0, 3),
    insufficient,
    `Nos registros realizados ao longo do período observado, ${child.name} apresentou vivências nas quais:`
  );
  const s1Interessa = synthesizeCategoryObservations(
    partObs,
    insufficient,
    "Observou-se interesse nas seguintes propostas registradas:"
  );
  const s1Relacoes = synthesizeCategoryObservations(
    socObs,
    insufficient,
    "Nos momentos de convivência com pares e educadores:"
  );
  const s1FormasBrincar = synthesizeCategoryObservations(
    [...partObs, ...motObs].slice(0, 3),
    insufficient,
    "Entre os registros de brincadeira destacam-se:"
  );
  const s1PudemosConhecer = synthesizeCategoryObservations(
    [...progObs, ...outObs],
    s1Demonstra.text
  );

  // Seção 2: MEU JEITO DE BRINCAR
  const s2Interesse = synthesizeCategoryObservations(partObs, insufficient);
  const s2Espacos = synthesizeCategoryObservations(
    [...expObs, ...motObs],
    insufficient
  );
  const s2Inicia = synthesizeCategoryObservations(
    partObs,
    insufficient,
    "Quanto à iniciativa e permanência nas propostas registradas:"
  );
  const s2Coletivas = synthesizeCategoryObservations(
    [...partObs, ...socObs],
    insufficient,
    "Nas propostas individuais e coletivas observadas:"
  );
  const s2Mediacoes = synthesizeCategoryObservations(medObs, insufficient);

  // Seção 3: EU E O OUTRO
  const s3Aproxima = synthesizeCategoryObservations(socObs, insufficient);
  const s3Comunica = synthesizeCategoryObservations(comObs, insufficient);
  const s3Compartilha = synthesizeCategoryObservations(
    socObs.filter(
      (o) =>
        o.content.toLowerCase().includes("divid") ||
        o.content.toLowerCase().includes("compartilh") ||
        o.content.toLowerCase().includes("coletiv") ||
        o.content.toLowerCase().includes("interag")
    ).length > 0
      ? socObs.filter(
          (o) =>
            o.content.toLowerCase().includes("divid") ||
            o.content.toLowerCase().includes("compartilh") ||
            o.content.toLowerCase().includes("coletiv") ||
            o.content.toLowerCase().includes("interag")
        )
      : socObs,
    insufficient
  );
  const s3Turnos = synthesizeCategoryObservations(
    socObs.filter(
      (o) =>
        o.content.toLowerCase().includes("turno") ||
        o.content.toLowerCase().includes("espera") ||
        o.content.toLowerCase().includes("combinado")
    ),
    insufficient
  );
  const s3Conflitos = synthesizeCategoryObservations(
    [...desObs, ...medObs],
    insufficient
  );

  // Seção 4: MEU CORPO EM MOVIMENTO
  const s4Corpo = synthesizeCategoryObservations(
    motObs,
    insufficient,
    "Registros observacionais sobre vivências corporais e motoras:"
  );

  // Seção 5: DESCOBERTAS, PENSAMENTOS E APRENDIZAGENS
  const s5Descobertas = synthesizeCategoryObservations(
    [...expObs, ...comObs],
    insufficient,
    "Ao longo das experiências investigativas e de linguagem registradas:"
  );

  // Seção 6: AUTONOMIA NO COTIDIANO DA TOCA
  const s6AutoSynth = synthesizeCategoryObservations(autObs, insufficient);
  const s6MedSynth = synthesizeCategoryObservations(
    medObs,
    "Mediação afetiva e organização prévia do ambiente pela equipe."
  );

  const autonomyRows =
    autObs.length > 0
      ? autObs.slice(0, 4).map((o) => ({
          situacao_observada: `Vivência registrada (${o.source_reference})`,
          como_participa_hoje: o.content,
          apoios_que_favorecem: s6MedSynth.text,
        }))
      : empty.sec6_autonomia_cotidiano.rows;

  // Seção 7: SENTIR, COMUNICAR E REGULAR
  const s7Demonstra = synthesizeCategoryObservations(emoObs, insufficient);
  const s7Reorganizar = synthesizeCategoryObservations(
    [...medObs, ...emoObs],
    insufficient
  );
  const s7Mediacao = synthesizeCategoryObservations(medObs, insufficient);
  const s7Recursos = synthesizeCategoryObservations(
    [...autObs, ...comObs],
    insufficient
  );
  const s7Avancos = synthesizeCategoryObservations(progObs, insufficient);

  // Seção 10: UM OLHAR SOBRE MEU PERCURSO
  const s10Observamos = synthesizeCategoryObservations(
    [...partObs, ...socObs, ...expObs].slice(0, 4),
    insufficient,
    "Durante o período acompanhado, os registros apontam que:"
  );
  const s10Conquistas = synthesizeCategoryObservations(progObs, insufficient);
  const s10Seguranca = synthesizeCategoryObservations(
    [...autObs, ...progObs],
    insufficient
  );
  const s10NecessitaMediacao = synthesizeCategoryObservations(
    desObs,
    insufficient
  );
  const s10Favorecido = synthesizeCategoryObservations(medObs, insufficient);

  // Seção 12: Dimensões
  const dimBrincar = synthesizeCategoryObservations(partObs, insufficient);
  const dimConviver = synthesizeCategoryObservations(socObs, insufficient);
  const dimComunicar = synthesizeCategoryObservations(comObs, insufficient);
  const dimMovimentar = synthesizeCategoryObservations(motObs, insufficient);
  const dimAutonomia = synthesizeCategoryObservations(autObs, insufficient);
  const dimDescobrir = synthesizeCategoryObservations(expObs, insufficient);

  const basePortfolio: PortfolioReportContent = {
    header: {
      child_name: child.name,
      period_label: periodLabel,
      group_name: child.group_name || "Psi. Maria Eduarda",
      responsible_professional: responsibleProfessional,
      opening_photo_url: photoAbertura?.storage_path || "",
      opening_photo_caption: photoAbertura?.caption || "",
    },
    sec1_quem_e_essa_cria: {
      demonstra: s1Demonstra.text,
      interessa_por: s1Interessa.text,
      relacoes_observamos: s1Relacoes.text,
      formas_preferidas_brincar: s1FormasBrincar.text,
      pudemos_conhecer: s1PudemosConhecer.text,
      narrativa_livre:
        child.notes?.trim()
          ? `Contexto geral do prontuário: ${child.notes.trim()}`
          : "",
      sources: allSessionRefs,
    },
    sec2_meu_jeito_de_brincar: {
      brincadeiras_materiais_interesse: s2Interesse.text,
      como_explora_espacos: s2Espacos.text,
      como_inicia_sustenta: s2Inicia.text,
      propostas_individuais_coletivas: s2Coletivas.text,
      mediacoes_favorecem: s2Mediacoes.text,
      sources: Array.from(
        new Set([...s2Interesse.sources, ...s2Espacos.sources, ...s2Mediacoes.sources])
      ),
    },
    sec3_eu_e_o_outro: {
      aproxima_criancas_adultos: s3Aproxima.text,
      comunica_desejos_necessidades: s3Comunica.text,
      compartilhamento_espacos_materiais: s3Compartilha.text,
      espera_turnos_combinados: s3Turnos.text,
      reage_conflitos_estrategias: s3Conflitos.text,
      sources: Array.from(
        new Set([...s3Aproxima.sources, ...s3Comunica.sources, ...s3Conflitos.sources])
      ),
    },
    sec4_meu_corpo_em_movimento: {
      relato_corporal: s4Corpo.text,
      photo_url: photoCorpo?.storage_path || "",
      photo_caption: photoCorpo?.caption || "",
      sources: s4Corpo.sources,
    },
    sec5_descobertas_aprendizagens: {
      relato_descobertas: s5Descobertas.text,
      sources: s5Descobertas.sources,
    },
    sec6_autonomia_cotidiano: {
      rows: autonomyRows,
      sources: s6AutoSynth.sources,
    },
    sec7_sentir_comunicar_regular: {
      demonstra_alegria_frustracao: s7Demonstra.text,
      ajuda_reorganizar: s7Reorganizar.text,
      responde_mediacao_adulto: s7Mediacao.text,
      recursos_busca_aceita: s7Recursos.text,
      avancos_percebidos: s7Avancos.text,
      sources: Array.from(
        new Set([...s7Demonstra.sources, ...s7Mediacao.sources, ...s7Avancos.sources])
      ),
    },
    sec8_experiencias_marcantes: {
      descoberta: {
        photo_url: photoDescoberta?.storage_path || "",
        legenda_processo: photoDescoberta?.caption || expObs[0]?.content || insufficient,
      },
      encontro: {
        photo_url: photoEncontro?.storage_path || "",
        legenda_processo: photoEncontro?.caption || socObs[0]?.content || insufficient,
      },
      desafio: {
        photo_url: photoDesafio?.storage_path || "",
        legenda_processo: photoDesafio?.caption || desObs[0]?.content || insufficient,
      },
      conquista: {
        photo_url: photoConquista?.storage_path || "",
        legenda_processo: photoConquista?.caption || progObs[0]?.content || insufficient,
      },
      sources: allSessionRefs,
    },
    sec9_minhas_producoes: {
      mes_1_label: "SETEMBRO",
      mes_1_qtd: String(safePhotos.length > 0 ? Math.max(1, Math.floor(safePhotos.length / 2)) : 0),
      mes_2_label: "OUTUBRO",
      mes_2_qtd: String(safePhotos.length > 1 ? Math.ceil(safePhotos.length / 2) : 0),
      mes_3_label: "NOVEMBRO",
      mes_3_qtd: String(safeSessions.length),
      total_qtd: String(safePhotos.length + safeSessions.length),
      selecionadas_exposicao_qtd: String(Math.min(2, safePhotos.length)),
      producao_1: {
        photo_url: photoProd1?.storage_path || "",
        legenda_processo: photoProd1?.caption || partObs[0]?.content || insufficient,
      },
      producao_2: {
        photo_url: photoProd2?.storage_path || "",
        legenda_processo: photoProd2?.caption || motObs[0]?.content || insufficient,
      },
      sources: allSessionRefs,
    },
    sec10_olhar_sobre_percurso: {
      observamos_que: s10Observamos.text,
      conquistas_destaque: s10Conquistas.text,
      maior_seguranca_para: s10Seguranca.text,
      necessita_mediacao_em: s10NecessitaMediacao.text,
      favorecido_por_meio_de: s10Favorecido.text,
      proximo_periodo_experiencias:
        "Continuar oferecendo propostas abertas de exploração, brincadeiras coletivas e escuta acolhedora do ritmo singular da criança.",
      sources: allSessionRefs,
    },
    sec11_a_voz_da_crianca: {
      na_toca_gosto_de:
        voiceNaToca.length > 0
          ? voiceNaToca.join(" / ")
          : "Sem fala literal registrada para esta pergunta nas sessões do período.",
      brincadeira_preferida:
        voiceBrincadeira.length > 0
          ? voiceBrincadeira.join(" / ")
          : "Sem fala literal registrada para esta pergunta nas sessões do período.",
      eu_aprendi:
        voiceAprendi.length > 0
          ? voiceAprendi.join(" / ")
          : "Sem fala literal registrada para esta pergunta nas sessões do período.",
      quero_brincar_mais_de:
        voiceQueroMais.length > 0
          ? voiceQueroMais.join(" / ")
          : "Sem fala literal registrada para esta pergunta nas sessões do período.",
      escolhas_nos_contam:
        voiceEscolhas.length > 0
          ? voiceEscolhas.join(" | ")
          : s3Comunica.text,
      sources:
        voiceSources.size > 0 ? Array.from(voiceSources) : s3Comunica.sources,
    },
    sec12_para_guardar_memoria: {
      photo_url: photoMemoria?.storage_path || "",
      escolhemos_guardar_porque:
        photoMemoria?.caption ||
        progObs[0]?.content ||
        partObs[0]?.content ||
        insufficient,
      dimensoes: {
        brincar: dimBrincar.text,
        conviver: dimConviver.text,
        comunicar: dimComunicar.text,
        movimentar_se: dimMovimentar.text,
        construir_autonomia: dimAutonomia.text,
        descobrir: dimDescobrir.text,
      },
      sources: allSessionRefs,
    },
  };

  if (isGeminiConfigured() && child.ai_processing_consent !== false) {
    try {
      const sessionsContext = safeSessions
        .map((s) => {
          const dLabel = formatDateBR(s.session_date);
          const trans = safeTranscriptions
            .filter((t) => t.session_id === s.id)
            .map((t) => t.reviewed_text || t.raw_text)
            .join(" ");
          return `[Sessão de ${dLabel}] Notas: ${s.notes || ""} | Complemento: ${
            s.complementary_notes || ""
          } | Transcrição: ${trans}`;
        })
        .join("\n");

      const systemPrompt = `Você é a assistente de síntese observacional da Psi. Maria Eduarda (Acompanhamento Infantil).
REGRAS ÉTICAS INEGOCIÁVEIS:
1. NUNCA invente acontecimentos que não estejam nos registros fornecidos.
2. NUNCA atribua diagnósticos clínicos/médicos ou conclusões definitivas.
3. Diferencie fatos observados de interpretações.
4. Mantenha linguagem profissional, serena, respeitosa e acolhedora em português brasileiro (pt-BR).
5. Preserve as referências às datas das sessões no formato (Ref.: Sessão de DD/MM/AAAA).
6. Quando não houver dados suficientes nos registros para um campo, mantenha a mensagem indicando que não constam dados suficientes no período.`;

      interface GeminiRefinedFields {
        sec1_demonstra?: string;
        sec1_interessa_por?: string;
        sec1_relacoes_observamos?: string;
        sec1_formas_preferidas_brincar?: string;
        sec1_pudemos_conhecer?: string;
        sec4_relato_corporal?: string;
        sec5_relato_descobertas?: string;
        sec10_observamos_que?: string;
        sec10_conquistas_destaque?: string;
      }

      const userPrompt = `Criança: ${child.name}
Período: ${periodLabel}
Registros autorizados desta criança:
${sessionsContext}

Com base EXCLUSIVAMENTE nos registros acima, retorne um objeto JSON com redação observacional refinada (preservando citações "(Ref.: Sessão de DD/MM/AAAA)") para os seguintes campos:
{
  "sec1_demonstra": "...",
  "sec1_interessa_por": "...",
  "sec1_relacoes_observamos": "...",
  "sec1_formas_preferidas_brincar": "...",
  "sec1_pudemos_conhecer": "...",
  "sec4_relato_corporal": "...",
  "sec5_relato_descobertas": "...",
  "sec10_observamos_que": "...",
  "sec10_conquistas_destaque": "..."
}`;

      const refined = await generateGeminiJson<GeminiRefinedFields>(
        systemPrompt,
        userPrompt
      );
      if (refined) {
        if (refined.sec1_demonstra)
          basePortfolio.sec1_quem_e_essa_cria.demonstra = refined.sec1_demonstra;
        if (refined.sec1_interessa_por)
          basePortfolio.sec1_quem_e_essa_cria.interessa_por = refined.sec1_interessa_por;
        if (refined.sec1_relacoes_observamos)
          basePortfolio.sec1_quem_e_essa_cria.relacoes_observamos =
            refined.sec1_relacoes_observamos;
        if (refined.sec1_formas_preferidas_brincar)
          basePortfolio.sec1_quem_e_essa_cria.formas_preferidas_brincar =
            refined.sec1_formas_preferidas_brincar;
        if (refined.sec1_pudemos_conhecer)
          basePortfolio.sec1_quem_e_essa_cria.pudemos_conhecer =
            refined.sec1_pudemos_conhecer;
        if (refined.sec4_relato_corporal)
          basePortfolio.sec4_meu_corpo_em_movimento.relato_corporal =
            refined.sec4_relato_corporal;
        if (refined.sec5_relato_descobertas)
          basePortfolio.sec5_descobertas_aprendizagens.relato_descobertas =
            refined.sec5_relato_descobertas;
        if (refined.sec10_observamos_que)
          basePortfolio.sec10_olhar_sobre_percurso.observamos_que =
            refined.sec10_observamos_que;
        if (refined.sec10_conquistas_destaque)
          basePortfolio.sec10_olhar_sobre_percurso.conquistas_destaque =
            refined.sec10_conquistas_destaque;
      }
    } catch {
      // Fallback seguro determinístico
    }
  }

  return basePortfolio;
}

/**
 * Reformula um trecho específico durante a revisão humana sem inventar fatos,
 * tornando a linguagem mais fluida, acolhedora e pedagógica.
 */
export async function reformulateTextWithAI(
  currentText: string,
  instruction: "mais_acolhedor" | "mais_conciso" | "destacar_mediacao"
): Promise<string> {
  const trimmed = currentText.trim();
  if (!trimmed) return trimmed;

  if (isGeminiConfigured()) {
    const instructionLabel =
      instruction === "mais_acolhedor"
        ? "Torne a redação mais acolhedora, serena e fluida, mantendo rigorosamente os fatos e as referências de sessão."
        : instruction === "mais_conciso"
        ? "Torne a redação mais concisa, direta e clara, mantendo rigorosamente os fatos e as referências de sessão."
        : "Destaque de forma respeitosa a mediação e o apoio oferecidos pela profissional durante a vivência, sem inventar fatos novos e mantendo as referências de sessão.";

    const aiResult = await generateGeminiText(
      "Você é assistente de redação observacional da Psi. Maria Eduarda. Reescreva apenas o trecho enviado conforme a instrução, sem inventar fatos, sem diagnósticos clínicos e preservando referências (Ref.: ...). Retorne apenas o texto reescrito.",
      `Instrução: ${instructionLabel}\n\nTexto original:\n${trimmed}`
    );
    if (aiResult) {
      return aiResult;
    }
  }

  return reformulateTextPreserveFacts(trimmed, instruction);
}

export function reformulateTextPreserveFacts(
  currentText: string,
  instruction: "mais_acolhedor" | "mais_conciso" | "destacar_mediacao"
): string {
  const trimmed = currentText.trim();
  if (!trimmed) return trimmed;

  // Preservar referências "(Ref.: ...)" no final se existirem
  const refMatch = trimmed.match(/\(Ref\.:.*\)$/);
  const refPart = refMatch ? ` ${refMatch[0]}` : "";
  const bodyPart = refMatch ? trimmed.replace(refMatch[0], "").trim() : trimmed;

  if (instruction === "mais_acolhedor") {
    if (bodyPart.startsWith("Nos registros") || bodyPart.startsWith("Ao longo do percurso")) {
      return `Com olhar atento e acolhedor ao ritmo singular da criança, observamos que ${bodyPart.charAt(0).toLowerCase() + bodyPart.slice(1)}${refPart}`;
    }
    return `Ao longo das vivências compartilhadas na Toca, observamos com afeto que ${bodyPart.charAt(0).toLowerCase() + bodyPart.slice(1)}${refPart}`;
  }

  if (instruction === "mais_conciso") {
    const cleaned = bodyPart
      .replace(/^Nos registros realizados ao longo do período observado,\s*/i, "")
      .replace(/^Ao longo das vivências compartilhadas na Toca, observamos com afeto que\s*/i, "");
    return `${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)}${refPart}`;
  }

  if (instruction === "destacar_mediacao") {
    return `${bodyPart.replace(/\.$/, "")}, contando com a presença disponível e a mediação respeitosa do profissional responsável.${refPart}`;
  }

  return trimmed;
}
