import { PortfolioReportContent, ReportTemplate } from "./types";

export const OFFICIAL_TOCA_DA_CRIA_TEMPLATE: ReportTemplate = {
  id: "tpl-toca-da-cria-oficial-v1",
  name: "Portfólio das Vivências — Psi. Maria Eduarda (Oficial)",
  institution_name: "PSI. MARIA EDUARDA",
  subtitle: "Portfólio das Vivências — DESENVOLVIMENTO QUE ACONTECE ENQUANTO A INFÂNCIA ACONTECE",
  footer_quote:
    "No acompanhamento da Psi. Maria Eduarda, o portfólio não é uma coleção de atividades. É memória de um percurso vivido.",
  version: 1,
  is_official: true,
  source_docx_filename: "Miolo_Portfolio_Vivencias_Toca_da_Cria.docx",
  created_at: "2026-11-07T20:51:00.000Z",
  schema: [
    {
      key: "sec1_quem_e_essa_cria",
      number: 1,
      title: "1. QUEM É ESSA CRIA NA TOCA?",
      team_guidance:
        "ORIENTAÇÃO PARA A EQUIPE: Escreva de forma afetiva, observacional e singular. Apresente a criança pelo que ela demonstra, escolhe, comunica e constrói nas vivências. Evite rótulos e comparações.",
      fields: [
        { key: "demonstra", label: "É uma criança que, em suas vivências na Toca, demonstra:", type: "textarea" },
        { key: "interessa_por", label: "Costuma se interessar especialmente por:", type: "textarea" },
        { key: "relacoes_observamos", label: "Nas relações com outras crianças e adultos, observamos:", type: "textarea" },
        { key: "formas_preferidas_brincar", label: "Entre suas formas preferidas de brincar estão:", type: "textarea" },
        { key: "pudemos_conhecer", label: "Ao longo deste período, pudemos conhecer uma cria que:", type: "textarea" },
        { key: "narrativa_livre", label: "Síntese observacional complementar:", type: "textarea" },
      ],
    },
    {
      key: "sec2_meu_jeito_de_brincar",
      number: 2,
      title: "2. MEU JEITO DE BRINCAR",
      team_guidance:
        "ORIENTAÇÃO PARA A EQUIPE: Observe iniciativa, interesses, exploração dos espaços e materiais, imaginação, permanência nas propostas, brincar individual/compartilhado e necessidade de mediação. Não classifique o brincar como certo ou errado.",
      fields: [
        { key: "brincadeiras_materiais_interesse", label: "Brincadeiras e materiais de maior interesse:", type: "textarea" },
        { key: "como_explora_espacos", label: "Como explora os espaços da Toca:", type: "textarea" },
        { key: "como_inicia_sustenta", label: "Como inicia e sustenta suas brincadeiras:", type: "textarea" },
        { key: "propostas_individuais_coletivas", label: "Como participa de propostas individuais e coletivas:", type: "textarea" },
        { key: "mediacoes_favorecem", label: "Mediações que favorecem sua participação:", type: "textarea" },
      ],
    },
    {
      key: "sec3_eu_e_o_outro",
      number: 3,
      title: "3. EU E O OUTRO",
      subtitle: "Relações, comunicação e convivência",
      team_guidance:
        "ORIENTAÇÃO PARA A EQUIPE: Descreva situações concretas. Priorize o percurso da criança: o que já realiza espontaneamente, o que realiza com apoio e quais mediações favorecem sua participação.",
      fields: [
        { key: "aproxima_criancas_adultos", label: "Como se aproxima das outras crianças e adultos?", type: "textarea" },
        { key: "comunica_desejos_necessidades", label: "Como comunica desejos, interesses e necessidades?", type: "textarea" },
        { key: "compartilhamento_espacos_materiais", label: "Como vivencia compartilhamento de espaços e materiais?", type: "textarea" },
        { key: "espera_turnos_combinados", label: "Como lida com espera, turnos e combinados?", type: "textarea" },
        { key: "reage_conflitos_estrategias", label: "Como reage aos conflitos e quais estratégias ajudam?", type: "textarea" },
      ],
    },
    {
      key: "sec4_meu_corpo_em_movimento",
      number: 4,
      title: "4. MEU CORPO EM MOVIMENTO",
      team_guidance:
        "ORIENTAÇÃO PARA A EQUIPE: Registre o corpo dentro das experiências: correr, pular, subir, descer, equilibrar-se, manipular, construir, dançar, capoeira, areia, água, natureza e outras possibilidades.",
      fields: [
        { key: "relato_corporal", label: "Vivências corporais e motoras observadas:", type: "textarea" },
        { key: "photo_url", label: "FOTO: CORPO, MOVIMENTO OU BRINCADEIRA", type: "photo_slot" },
      ],
    },
    {
      key: "sec5_descobertas_aprendizagens",
      number: 5,
      title: "5. DESCOBERTAS, PENSAMENTOS E APRENDIZAGENS",
      team_guidance:
        "ORIENTAÇÃO PARA A EQUIPE: Considere curiosidade, resolução de problemas, planejamento, atenção, memória, criatividade, linguagem, compreensão das propostas e hipóteses construídas durante as experiências.",
      fields: [
        { key: "relato_descobertas", label: "Descobertas, hipóteses e aprendizagens observadas:", type: "textarea" },
      ],
    },
    {
      key: "sec6_autonomia_cotidiano",
      number: 6,
      title: "6. AUTONOMIA NO COTIDIANO DA TOCA",
      team_guidance:
        "ORIENTAÇÃO PARA A EQUIPE: Observe alimentação, higiene, pertences, organização de materiais, escolhas, solicitação de ajuda, reconhecimento da rotina, transições pelos espaços e pequenas responsabilidades.",
      fields: [
        { key: "rows", label: "SITUAÇÃO OBSERVADA | COMO PARTICIPA HOJE | APOIOS QUE FAVORECEM", type: "table" },
      ],
    },
    {
      key: "sec7_sentir_comunicar_regular",
      number: 7,
      title: "7. SENTIR, COMUNICAR E REGULAR",
      team_guidance:
        "ORIENTAÇÃO PARA A EQUIPE: Não descreva apenas o comportamento. Registre como a criança comunica estados emocionais, quais situações são mais desafiadoras, o que ajuda na reorganização e quais recursos começam a ser utilizados com maior autonomia.",
      fields: [
        { key: "demonstra_alegria_frustracao", label: "Como demonstra alegria, interesse, incômodo ou frustração?", type: "textarea" },
        { key: "ajuda_reorganizar", label: "O que costuma ajudá-la a se reorganizar?", type: "textarea" },
        { key: "responde_mediacao_adulto", label: "Como responde à mediação do adulto?", type: "textarea" },
        { key: "recursos_busca_aceita", label: "Quais recursos já busca ou aceita?", type: "textarea" },
        { key: "avancos_percebidos", label: "Avanços percebidos neste período:", type: "textarea" },
      ],
    },
    {
      key: "sec8_experiencias_marcantes",
      number: 8,
      title: "8. EXPERIÊNCIAS QUE MARCARAM MEU PERCURSO",
      team_guidance:
        "ORIENTAÇÃO PARA A EQUIPE: Escolha registros que contem uma história sobre o percurso, e não apenas fotos bonitas.",
      fields: [
        {
          key: "grid",
          label: "AQUI TEVE DESCOBERTA... | AQUI TEVE ENCONTRO... | AQUI TEVE DESAFIO... | E AQUI TEVE CONQUISTA!",
          type: "grid_2x2",
        },
      ],
    },
    {
      key: "sec9_minhas_producoes",
      number: 9,
      title: "9. MINHAS PRODUÇÕES",
      team_guidance:
        "ORIENTAÇÃO PARA A EQUIPE: Registre a quantidade para organização interna e selecione produções significativas pelo processo vivido. O número de produções não é meta de desempenho para a criança.",
      fields: [
        { key: "tabela_quantidades", label: "SETEMBRO | OUTUBRO | NOVEMBRO | TOTAL | SELECIONADAS PARA EXPOSIÇÃO", type: "table" },
        { key: "producao_1", label: "PRODUÇÃO / FOTO 1 + Legenda do processo", type: "photo_slot" },
        { key: "producao_2", label: "PRODUÇÃO / FOTO 2 + Legenda do processo", type: "photo_slot" },
      ],
    },
    {
      key: "sec10_olhar_sobre_percurso",
      number: 10,
      title: "10. UM OLHAR SOBRE MEU PERCURSO",
      team_guidance:
        "ORIENTAÇÃO PARA A EQUIPE: Faça uma síntese do período. Evite repetir todos os campos anteriores. Mostre conquistas, necessidades atuais de mediação e caminhos que continuarão sendo favorecidos.",
      fields: [
        { key: "observamos_que", label: "Durante este período, observamos que:", type: "textarea" },
        { key: "conquistas_destaque", label: "Entre as conquistas que ganharam destaque estão:", type: "textarea" },
        { key: "maior_seguranca_para", label: "Atualmente, demonstra maior segurança para:", type: "textarea" },
        { key: "necessita_mediacao_em", label: "Ainda necessita de mediação especialmente em situações que envolvem:", type: "textarea" },
        { key: "favorecido_por_meio_de", label: "Temos favorecido esse processo por meio de:", type: "textarea" },
        { key: "proximo_periodo_experiencias", label: "Para o próximo período, continuaremos proporcionando experiências que favoreçam:", type: "textarea" },
      ],
    },
    {
      key: "sec11_a_voz_da_crianca",
      number: 11,
      title: "11. A VOZ DA CRIANÇA",
      team_guidance:
        "ORIENTAÇÃO PARA A EQUIPE: Quando a criança puder responder, registre suas palavras reais, sem reescrevê-las para parecerem mais elaboradas. Para Babys ou crianças que não respondem verbalmente, descreva escolhas, aproximações, recusas, interesses, gestos, expressões, apontar ou recursos de CAA. Não atribua falas que a criança não produziu.",
      fields: [
        { key: "na_toca_gosto_de", label: "Na Toca eu gosto de...", type: "textarea" },
        { key: "brincadeira_preferida", label: "Minha brincadeira preferida é...", type: "textarea" },
        { key: "eu_aprendi", label: "Eu aprendi...", type: "textarea" },
        { key: "quero_brincar_mais_de", label: "Eu quero brincar mais de...", type: "textarea" },
        { key: "escolhas_nos_contam", label: "Quando a fala não for a principal forma de resposta: O QUE SUAS ESCOLHAS NOS CONTAM?", type: "textarea" },
      ],
    },
    {
      key: "sec12_para_guardar_memoria",
      number: 12,
      title: "12. PARA GUARDAR NA MEMÓRIA",
      team_guidance:
        "UMA FOTO SIGNIFICATIVA DESTE PERCURSO + Evidências observadas nas 6 dimensões do desenvolvimento na Psi. Maria Eduarda.",
      fields: [
        { key: "photo_url", label: "UMA FOTO SIGNIFICATIVA DESTE PERCURSO", type: "photo_slot" },
        { key: "escolhemos_guardar_porque", label: "Entre tantas experiências vividas, escolhemos guardar esta porque...", type: "textarea" },
        {
          key: "dimensoes",
          label: "BRINCAR | CONVIVER | COMUNICAR | MOVIMENTAR-SE | CONSTRUIR AUTONOMIA | DESCOBRIR",
          type: "dimensions_6",
        },
      ],
    },
  ],
};

export function calculateAgeLabel(birthDateStr: string): string {
  if (!birthDateStr) return "Idade não informada";
  const birth = new Date(birthDateStr + "T12:00:00");
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) return "Recém-nascido(a)";
  if (years === 0) {
    return `${months} ${months === 1 ? "mês" : "meses"}`;
  }
  if (months === 0) {
    return `${years} ${years === 1 ? "ano" : "anos"}`;
  }
  return `${years} ${years === 1 ? "ano" : "anos"} e ${months} ${months === 1 ? "mês" : "meses"}`;
}

export function createEmptyPortfolioContent(
  childName: string,
  groupName: string,
  periodLabel: string,
  responsibleProfessional: string
): PortfolioReportContent {
  const insufficientMsg =
    "Não constam registros suficientes nas sessões selecionadas para preencher este campo. Recomenda-se complementar na revisão humana.";
  return {
    header: {
      child_name: childName,
      period_label: periodLabel,
      group_name: groupName,
      responsible_professional: responsibleProfessional,
      opening_photo_url: "",
      opening_photo_caption: "",
    },
    sec1_quem_e_essa_cria: {
      demonstra: insufficientMsg,
      interessa_por: insufficientMsg,
      relacoes_observamos: insufficientMsg,
      formas_preferidas_brincar: insufficientMsg,
      pudemos_conhecer: insufficientMsg,
      narrativa_livre: "",
      sources: [],
    },
    sec2_meu_jeito_de_brincar: {
      brincadeiras_materiais_interesse: insufficientMsg,
      como_explora_espacos: insufficientMsg,
      como_inicia_sustenta: insufficientMsg,
      propostas_individuais_coletivas: insufficientMsg,
      mediacoes_favorecem: insufficientMsg,
      sources: [],
    },
    sec3_eu_e_o_outro: {
      aproxima_criancas_adultos: insufficientMsg,
      comunica_desejos_necessidades: insufficientMsg,
      compartilhamento_espacos_materiais: insufficientMsg,
      espera_turnos_combinados: insufficientMsg,
      reage_conflitos_estrategias: insufficientMsg,
      sources: [],
    },
    sec4_meu_corpo_em_movimento: {
      relato_corporal: insufficientMsg,
      photo_url: "",
      photo_caption: "",
      sources: [],
    },
    sec5_descobertas_aprendizagens: {
      relato_descobertas: insufficientMsg,
      sources: [],
    },
    sec6_autonomia_cotidiano: {
      rows: [
        {
          situacao_observada: "Alimentação e momentos de lanche",
          como_participa_hoje: insufficientMsg,
          apoios_que_favorecem: "Acompanhamento afetivo e disponibilidade dos utensílios ao alcance.",
        },
        {
          situacao_observada: "Organização de brinquedos, materiais e pertences",
          como_participa_hoje: insufficientMsg,
          apoios_que_favorecem: "Convite coletivo e referência visual dos espaços da Toca.",
        },
        {
          situacao_observada: "Reconhecimento da rotina e transições pelos espaços",
          como_participa_hoje: insufficientMsg,
          apoios_que_favorecem: "Antecipação verbal acolhedora dos combinados.",
        },
      ],
      sources: [],
    },
    sec7_sentir_comunicar_regular: {
      demonstra_alegria_frustracao: insufficientMsg,
      ajuda_reorganizar: insufficientMsg,
      responde_mediacao_adulto: insufficientMsg,
      recursos_busca_aceita: insufficientMsg,
      avancos_percebidos: insufficientMsg,
      sources: [],
    },
    sec8_experiencias_marcantes: {
      descoberta: { photo_url: "", legenda_processo: insufficientMsg },
      encontro: { photo_url: "", legenda_processo: insufficientMsg },
      desafio: { photo_url: "", legenda_processo: insufficientMsg },
      conquista: { photo_url: "", legenda_processo: insufficientMsg },
      sources: [],
    },
    sec9_minhas_producoes: {
      mes_1_label: "SETEMBRO",
      mes_1_qtd: "0",
      mes_2_label: "OUTUBRO",
      mes_2_qtd: "0",
      mes_3_label: "NOVEMBRO",
      mes_3_qtd: "0",
      total_qtd: "0",
      selecionadas_exposicao_qtd: "0",
      producao_1: { photo_url: "", legenda_processo: insufficientMsg },
      producao_2: { photo_url: "", legenda_processo: insufficientMsg },
      sources: [],
    },
    sec10_olhar_sobre_percurso: {
      observamos_que: insufficientMsg,
      conquistas_destaque: insufficientMsg,
      maior_seguranca_para: insufficientMsg,
      necessita_mediacao_em: insufficientMsg,
      favorecido_por_meio_de: insufficientMsg,
      proximo_periodo_experiencias: insufficientMsg,
      sources: [],
    },
    sec11_a_voz_da_crianca: {
      na_toca_gosto_de: "Sem registro verbal direto no período selecionado.",
      brincadeira_preferida: "Sem registro verbal direto no período selecionado.",
      eu_aprendi: "Sem registro verbal direto no período selecionado.",
      quero_brincar_mais_de: "Sem registro verbal direto no período selecionado.",
      escolhas_nos_contam: insufficientMsg,
      sources: [],
    },
    sec12_para_guardar_memoria: {
      photo_url: "",
      escolhemos_guardar_porque: insufficientMsg,
      dimensoes: {
        brincar: insufficientMsg,
        conviver: insufficientMsg,
        comunicar: insufficientMsg,
        movimentar_se: insufficientMsg,
        construir_autonomia: insufficientMsg,
        descobrir: insufficientMsg,
      },
      sources: [],
    },
  };
}
