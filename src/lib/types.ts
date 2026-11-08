export type UserRole = "admin" | "coordenacao" | "educadora" | "leitura";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Child {
  id: string;
  unique_code: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  start_date: string; // YYYY-MM-DD
  group_name: string;
  guardian_name?: string;
  guardian_contact?: string;
  image_consent: boolean;
  audio_consent: boolean;
  ai_processing_consent: boolean;
  notes: string;
  avatar_color: string;
  created_at: string;
  archived_at: string | null;
}

export interface ChildVoiceQuotes {
  na_toca_gosto_de?: string;
  brincadeira_preferida?: string;
  eu_aprendi?: string;
  quero_brincar_mais_de?: string;
  escolhas_nos_contam?: string; // Para Babys ou comunicação não-verbal / CAA
}

export interface SessionRecord {
  id: string;
  child_id: string;
  user_id: string;
  professional_name: string;
  session_date: string; // ISO string
  notes: string;
  complementary_notes: string;
  child_voice_quotes?: ChildVoiceQuotes;
  created_at: string;
  updated_at: string;
}

export type AttachmentType = "photo" | "audio";

export type PortfolioPhotoSlot =
  | "foto_abertura"
  | "corpo_movimento"
  | "experiencia_descoberta"
  | "experiencia_encontro"
  | "experiencia_desafio"
  | "experiencia_conquista"
  | "producao_1"
  | "producao_2"
  | "foto_memoria"
  | "galeria_geral";

export interface SessionAttachment {
  id: string;
  session_id: string;
  child_id: string;
  type: AttachmentType;
  storage_path: string; // URL ou data URL privada servida via endpoint autenticado
  activity_tag: string;
  portfolio_slot?: PortfolioPhotoSlot;
  caption: string;
  ai_visual_description?: string;
  duration_seconds?: number;
  created_at: string;
}

export interface Transcription {
  id: string;
  attachment_id: string;
  session_id: string;
  child_id: string;
  text: string;
  status: "pending_review" | "reviewed";
  reviewed_at: string | null;
  created_at: string;
}

export type ObservationCategory =
  | "Participação nas atividades"
  | "Interação social"
  | "Comunicação e expressão"
  | "Autonomia"
  | "Desenvolvimento motor observado"
  | "Exploração e aprendizagem"
  | "Reações emocionais observadas"
  | "Desafios identificados durante as atividades"
  | "Progressos observados"
  | "Mediação e apoio oferecidos pelo profissional"
  | "Outras observações relevantes";

export const OBSERVATION_CATEGORIES: ObservationCategory[] = [
  "Participação nas atividades",
  "Interação social",
  "Comunicação e expressão",
  "Autonomia",
  "Desenvolvimento motor observado",
  "Exploração e aprendizagem",
  "Reações emocionais observadas",
  "Desafios identificados durante as atividades",
  "Progressos observados",
  "Mediação e apoio oferecidos pelo profissional",
  "Outras observações relevantes",
];

export interface Observation {
  id: string;
  session_id: string;
  child_id: string;
  category: ObservationCategory;
  portfolio_section: string; // Ex: "2. MEU JEITO DE BRINCAR"
  content: string;
  fact_vs_interpretation: "fato_observado" | "mediacao_profissional" | "interpretacao_pedagogica";
  source_reference: string; // Ex: "Sessão de 05/11/2026 ( Texto / Áudio )"
  created_at: string;
}

export interface AutonomyRow {
  situacao_observada: string;
  como_participa_hoje: string;
  apoios_que_favorecem: string;
}

export interface PortfolioReportContent {
  // Identificação & Capa
  header: {
    child_name: string;
    period_label: string;
    group_name: string;
    responsible_professional: string;
    opening_photo_url?: string;
    opening_photo_caption?: string;
  };
  // 1. QUEM É ESSA CRIA NA TOCA?
  sec1_quem_e_essa_cria: {
    demonstra: string;
    interessa_por: string;
    relacoes_observamos: string;
    formas_preferidas_brincar: string;
    pudemos_conhecer: string;
    narrativa_livre: string;
    sources: string[];
  };
  // 2. MEU JEITO DE BRINCAR
  sec2_meu_jeito_de_brincar: {
    brincadeiras_materiais_interesse: string;
    como_explora_espacos: string;
    como_inicia_sustenta: string;
    propostas_individuais_coletivas: string;
    mediacoes_favorecem: string;
    sources: string[];
  };
  // 3. EU E O OUTRO (Relações, comunicação e convivência)
  sec3_eu_e_o_outro: {
    aproxima_criancas_adultos: string;
    comunica_desejos_necessidades: string;
    compartilhamento_espacos_materiais: string;
    espera_turnos_combinados: string;
    reage_conflitos_estrategias: string;
    sources: string[];
  };
  // 4. MEU CORPO EM MOVIMENTO
  sec4_meu_corpo_em_movimento: {
    relato_corporal: string;
    photo_url?: string;
    photo_caption?: string;
    sources: string[];
  };
  // 5. DESCOBERTAS, PENSAMENTOS E APRENDIZAGENS
  sec5_descobertas_aprendizagens: {
    relato_descobertas: string;
    sources: string[];
  };
  // 6. AUTONOMIA NO COTIDIANO DA TOCA
  sec6_autonomia_cotidiano: {
    rows: AutonomyRow[];
    sources: string[];
  };
  // 7. SENTIR, COMUNICAR E REGULAR
  sec7_sentir_comunicar_regular: {
    demonstra_alegria_frustracao: string;
    ajuda_reorganizar: string;
    responde_mediacao_adulto: string;
    recursos_busca_aceita: string;
    avancos_percebidos: string;
    sources: string[];
  };
  // 8. EXPERIÊNCIAS QUE MARCARAM MEU PERCURSO
  sec8_experiencias_marcantes: {
    descoberta: { photo_url?: string; legenda_processo: string };
    encontro: { photo_url?: string; legenda_processo: string };
    desafio: { photo_url?: string; legenda_processo: string };
    conquista: { photo_url?: string; legenda_processo: string };
    sources: string[];
  };
  // 9. MINHAS PRODUÇÕES
  sec9_minhas_producoes: {
    mes_1_label: string;
    mes_1_qtd: string;
    mes_2_label: string;
    mes_2_qtd: string;
    mes_3_label: string;
    mes_3_qtd: string;
    total_qtd: string;
    selecionadas_exposicao_qtd: string;
    producao_1: { photo_url?: string; legenda_processo: string };
    producao_2: { photo_url?: string; legenda_processo: string };
    sources: string[];
  };
  // 10. UM OLHAR SOBRE MEU PERCURSO
  sec10_olhar_sobre_percurso: {
    observamos_que: string;
    conquistas_destaque: string;
    maior_seguranca_para: string;
    necessita_mediacao_em: string;
    favorecido_por_meio_de: string;
    proximo_periodo_experiencias: string;
    sources: string[];
  };
  // 11. A VOZ DA CRIANÇA
  sec11_a_voz_da_crianca: {
    na_toca_gosto_de: string;
    brincadeira_preferida: string;
    eu_aprendi: string;
    quero_brincar_mais_de: string;
    escolhas_nos_contam: string;
    sources: string[];
  };
  // 12. PARA GUARDAR NA MEMÓRIA
  sec12_para_guardar_memoria: {
    photo_url?: string;
    escolhemos_guardar_porque: string;
    dimensoes: {
      brincar: string;
      conviver: string;
      comunicar: string;
      movimentar_se: string;
      construir_autonomia: string;
      descobrir: string;
    };
    sources: string[];
  };
}

export interface TemplateSectionSchema {
  key: string;
  number: number;
  title: string;
  subtitle?: string;
  team_guidance: string;
  fields: {
    key: string;
    label: string;
    type: "text" | "textarea" | "table" | "photo_slot" | "grid_2x2" | "dimensions_6";
  }[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  institution_name: string;
  subtitle: string;
  footer_quote: string;
  schema: TemplateSectionSchema[];
  version: number;
  is_official: boolean;
  source_docx_filename?: string;
  created_at: string;
}

export interface Report {
  id: string;
  child_id: string;
  template_id: string;
  period_type: "session" | "month" | "semester" | "all" | "custom";
  start_date: string;
  end_date: string;
  responsible_professional: string;
  content: PortfolioReportContent;
  status: "draft" | "pending_review" | "approved";
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportSource {
  id: string;
  report_id: string;
  session_id: string;
  observation_id?: string;
  section_key: string;
}

export interface ReportVersion {
  id: string;
  report_id: string;
  version_number: number;
  version_label: string;
  content: PortfolioReportContent;
  created_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  created_at: string;
}

export interface DatabaseState {
  users: User[];
  children: Child[];
  sessions: SessionRecord[];
  session_attachments: SessionAttachment[];
  transcriptions: Transcription[];
  observations: Observation[];
  report_templates: ReportTemplate[];
  reports: Report[];
  report_sources: ReportSource[];
  report_versions: ReportVersion[];
  audit_logs: AuditLog[];
}
