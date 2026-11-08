import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import {
  AuditLog,
  Child,
  DatabaseState,
  Observation,
  Report,
  ReportSource,
  ReportTemplate,
  ReportVersion,
  SessionAttachment,
  SessionRecord,
  Transcription,
  User,
} from "./types";
import { OFFICIAL_TOCA_DA_CRIA_TEMPLATE } from "./portfolio-template";
import { extractObservationsFromSession } from "./ai-service";

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "psi_maria_eduarda_data")
  : path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

declare global {
  // eslint-disable-next-line no-var
  var __psiDbState: DatabaseState | undefined;
}

function createInitialDb(): DatabaseState {
  const defaultUsers: User[] = [
    {
      id: "usr-educadora-amor",
      name: "Psi. Maria Eduarda",
      email: "contato@psimariaeduarda.com.br",
      role: "coordenacao",
      created_at: new Date().toISOString(),
    },
  ];

  return {
    users: defaultUsers,
    children: [],
    sessions: [],
    session_attachments: [],
    transcriptions: [],
    observations: [],
    report_templates: [OFFICIAL_TOCA_DA_CRIA_TEMPLATE],
    reports: [],
    report_sources: [],
    report_versions: [],
    audit_logs: [],
  };
}

function normalizeDb(parsed: DatabaseState): DatabaseState {
  parsed.report_templates = [
    OFFICIAL_TOCA_DA_CRIA_TEMPLATE,
    ...(parsed.report_templates || []).filter(
      (t) => t.id !== OFFICIAL_TOCA_DA_CRIA_TEMPLATE.id
    ),
  ];
  if (parsed.users && parsed.users.length > 0) {
    parsed.users = parsed.users.map((u) =>
      u.id === "usr-educadora-amor"
        ? {
            ...u,
            name: "Psi. Maria Eduarda",
            email: "contato@psimariaeduarda.com.br",
          }
        : u
    );
  }
  return parsed;
}

export function readDb(): DatabaseState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      if (globalThis.__psiDbState) {
        return normalizeDb(globalThis.__psiDbState);
      }
      const initial = createInitialDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      globalThis.__psiDbState = initial;
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = normalizeDb(JSON.parse(raw) as DatabaseState);
    globalThis.__psiDbState = parsed;
    return parsed;
  } catch {
    if (globalThis.__psiDbState) {
      return normalizeDb(globalThis.__psiDbState);
    }
    const fallback = createInitialDb();
    globalThis.__psiDbState = fallback;
    return fallback;
  }
}

export function writeDb(state: DatabaseState): void {
  globalThis.__psiDbState = state;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    // Em ambientes serverless com filesystem restrito, mantém o estado em memória
  }
}

export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

export function logAudit(
  db: DatabaseState,
  params: {
    user_id?: string;
    user_name?: string;
    action: string;
    resource_type: string;
    resource_id: string;
    details?: string;
  }
): AuditLog {
  const entry: AuditLog = {
    id: generateId("aud"),
    user_id: params.user_id || "usr-educadora-amor",
    user_name: params.user_name || "Psi. Maria Eduarda",
    action: params.action,
    resource_type: params.resource_type,
    resource_id: params.resource_id,
    details: params.details || "",
    created_at: new Date().toISOString(),
  };
  db.audit_logs.unshift(entry);
  if (db.audit_logs.length > 1000) {
    db.audit_logs = db.audit_logs.slice(0, 1000);
  }
  return entry;
}

/**
 * Recalcula as observações estruturadas pela IA para uma sessão específica
 * garantindo isolamento por child_id.
 */
export function syncSessionObservations(db: DatabaseState, sessionId: string): Observation[] {
  const session = db.sessions.find((s) => s.id === sessionId);
  if (!session) return [];

  const child = db.children.find((c) => c.id === session.child_id);
  const childConsent = child ? child.ai_processing_consent : true;

  db.observations = db.observations.filter((o) => o.session_id !== sessionId);

  const sessionTranscriptions = db.transcriptions.filter(
    (t) => t.session_id === sessionId && t.child_id === session.child_id
  );
  const sessionAttachments = db.session_attachments.filter(
    (a) => a.session_id === sessionId && a.child_id === session.child_id
  );

  const extracted = extractObservationsFromSession(
    session,
    sessionTranscriptions,
    sessionAttachments,
    childConsent
  );

  const created: Observation[] = extracted.map((item) => ({
    ...item,
    id: generateId("obs"),
    created_at: new Date().toISOString(),
  }));

  db.observations.push(...created);
  return created;
}

export type {
  Child,
  SessionRecord,
  SessionAttachment,
  Transcription,
  Observation,
  Report,
  ReportTemplate,
  ReportSource,
  ReportVersion,
  AuditLog,
  User,
};
