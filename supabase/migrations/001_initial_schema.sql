-- ============================================================================
-- TOCA DA CRIA — PORTFÓLIO DAS VIVÊNCIAS
-- PostgreSQL / Supabase Schema Migration (001_initial_schema.sql)
-- Conformidade LGPD, Isolamento de Prontuários e Rastreabilidade de IA
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS (Profissionais e Administradores)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'educadora' CHECK (role IN ('admin', 'coordenacao', 'educadora', 'leitura')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CHILDREN (Prontuário Individual de cada Criança)
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  group_name TEXT,
  guardian_name TEXT,
  guardian_contact TEXT,
  image_consent BOOLEAN NOT NULL DEFAULT TRUE,
  audio_consent BOOLEAN NOT NULL DEFAULT TRUE,
  ai_processing_consent BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT DEFAULT '',
  avatar_color TEXT DEFAULT 'rose',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_children_name ON children(name);
CREATE INDEX IF NOT EXISTS idx_children_archived ON children(archived_at);

-- 3. SESSIONS (Registros de Vivências e Sessões)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  professional_name TEXT NOT NULL,
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT NOT NULL DEFAULT '',
  complementary_notes TEXT DEFAULT '',
  child_voice_quotes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_child_date ON sessions(child_id, session_date DESC);

-- 4. SESSION ATTACHMENTS (Fotos e Áudios Privados)
CREATE TABLE IF NOT EXISTS session_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'audio')),
  storage_path TEXT NOT NULL,
  activity_tag TEXT DEFAULT '',
  portfolio_slot TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  ai_visual_description TEXT DEFAULT '',
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_session ON session_attachments(session_id);
CREATE INDEX IF NOT EXISTS idx_attachments_child ON session_attachments(child_id);

-- 5. TRANSCRIPTIONS (Transcrições de Áudio Vinculadas)
CREATE TABLE IF NOT EXISTS transcriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attachment_id UUID NOT NULL REFERENCES session_attachments(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'reviewed')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transcriptions_session ON transcriptions(session_id);

-- 6. OBSERVATIONS (Observações Estruturadas pela IA a partir das Sessões)
CREATE TABLE IF NOT EXISTS observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  portfolio_section TEXT,
  content TEXT NOT NULL,
  fact_vs_interpretation TEXT NOT NULL DEFAULT 'fato_observado' CHECK (fact_vs_interpretation IN ('fato_observado', 'mediacao_profissional', 'interpretacao_pedagogica')),
  source_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_observations_session ON observations(session_id);
CREATE INDEX IF NOT EXISTS idx_observations_child_category ON observations(child_id, category);

-- 7. REPORT TEMPLATES (Modelos de Relatório Configuráveis, incl. Miolo Toca da Cria)
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  institution_name TEXT NOT NULL DEFAULT 'Toca da Cria',
  subtitle TEXT DEFAULT 'Portfólio das Vivências — Desenvolvimento que acontece enquanto a infância acontece',
  schema JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_official BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. REPORTS (Relatórios e Portfólios Gerados)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE RESTRICT,
  period_type TEXT NOT NULL DEFAULT 'custom',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  responsible_professional TEXT NOT NULL,
  content JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('draft', 'pending_review', 'approved')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_child ON reports(child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- 9. REPORT SOURCES (Rastreabilidade entre Relatório, Sessões e Observações)
CREATE TABLE IF NOT EXISTS report_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  observation_id UUID REFERENCES observations(id) ON DELETE SET NULL,
  section_key TEXT
);

CREATE INDEX IF NOT EXISTS idx_report_sources_report ON report_sources(report_id);

-- 10. REPORT VERSIONS (Histórico Imutável de Versões de Relatórios)
CREATE TABLE IF NOT EXISTS report_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  version_label TEXT NOT NULL DEFAULT 'Rascunho IA',
  content JSONB NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_versions_report ON report_versions(report_id, version_number DESC);

-- 11. AUDIT LOGS (Trilha de Auditoria e Segurança LGPD)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
