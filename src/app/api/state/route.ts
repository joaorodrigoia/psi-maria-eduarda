import { NextRequest, NextResponse } from "next/server";
import {
  generateId,
  logAudit,
  readDb,
  syncSessionObservations,
  writeDb,
} from "@/lib/db";
import {
  generatePortfolioReportWithAI,
  reformulateTextPreserveFacts,
} from "@/lib/ai-service";
import {
  Child,
  PortfolioPhotoSlot,
  PortfolioReportContent,
  Report,
  ReportTemplate,
  SessionAttachment,
  SessionRecord,
  Transcription,
} from "@/lib/types";

export async function GET() {
  const db = readDb();
  return NextResponse.json({
    ok: true,
    data: db,
    integrationStatus: {
      aiProvider: process.env.GEMINI_API_KEY
        ? "Google Gemini (Configurado)"
        : process.env.OPENAI_API_KEY
        ? "OpenAI (Configurado)"
        : "Motor Observacional Estruturado Local (Ativo — Sem envio externo de dados)",
      transcriptionProvider: process.env.VOICESTUDIO_API_URL || "http://127.0.0.1:3900/v1 (VoiceStudio Local + Web Speech)",
      databaseProvider: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "Supabase PostgreSQL"
        : "Persistência Local Segura (data/db.json + Schema PostgreSQL Pronto)",
      officialDocxLoaded: true,
      officialDocxName: "Miolo_Portfolio_Vivencias_Toca_da_Cria.docx",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const db = readDb();

    // 0. SINCRONIZAR SNAPSHOT DO CLIENTE (Resiliência Serverless Vercel)
    if (action === "restore_client_snapshot" && payload?.snapshot) {
      const snap = payload.snapshot;
      if (
        db.children.length === 0 &&
        db.sessions.length === 0 &&
        db.reports.length === 0 &&
        Array.isArray(snap.children)
      ) {
        db.children = snap.children || [];
        db.sessions = snap.sessions || [];
        db.session_attachments = snap.session_attachments || [];
        db.transcriptions = snap.transcriptions || [];
        db.observations = snap.observations || [];
        db.reports = snap.reports || [];
        db.report_sources = snap.report_sources || [];
        db.report_versions = snap.report_versions || [];
        db.audit_logs = snap.audit_logs || [];
        writeDb(db);
      }
      return NextResponse.json({ ok: true, data: db });
    }

    // 1. CRIAR CRIANÇA
    if (action === "create_child") {
      const codeNum = String(db.children.length + 1).padStart(3, "0");
      const newChild: Child = {
        id: generateId("cria"),
        unique_code: `TC-${new Date().getFullYear()}-${codeNum}`,
        name: String(payload.name || "").trim(),
        birth_date: String(payload.birth_date || ""),
        start_date: String(payload.start_date || new Date().toISOString().slice(0, 10)),
        group_name: String(payload.group_name || "").trim(),
        guardian_name: String(payload.guardian_name || "").trim(),
        guardian_contact: String(payload.guardian_contact || "").trim(),
        image_consent: payload.image_consent !== false,
        audio_consent: payload.audio_consent !== false,
        ai_processing_consent: payload.ai_processing_consent !== false,
        notes: String(payload.notes || "").trim(),
        avatar_color: payload.avatar_color || "rose",
        created_at: new Date().toISOString(),
        archived_at: null,
      };

      if (!newChild.name || !newChild.birth_date) {
        return NextResponse.json(
          { ok: false, error: "Nome completo e data de nascimento são obrigatórios." },
          { status: 400 }
        );
      }

      db.children.unshift(newChild);
      logAudit(db, {
        action: "CREATE_CHILD",
        resource_type: "children",
        resource_id: newChild.id,
        details: `Prontuário cadastrado (${newChild.unique_code})`,
      });
      writeDb(db);
      return NextResponse.json({ ok: true, child: newChild, data: db });
    }

    // 2. ATUALIZAR OU ARQUIVAR CRIANÇA
    if (action === "update_child") {
      const idx = db.children.findIndex((c) => c.id === payload.id);
      if (idx === -1) {
        return NextResponse.json({ ok: false, error: "Prontuário não encontrado." }, { status: 404 });
      }
      const updated: Child = {
        ...db.children[idx],
        ...payload,
      };
      db.children[idx] = updated;
      logAudit(db, {
        action: payload.archived_at ? "ARCHIVE_CHILD" : "UPDATE_CHILD",
        resource_type: "children",
        resource_id: updated.id,
        details: `Prontuário atualizado (${updated.unique_code})`,
      });
      writeDb(db);
      return NextResponse.json({ ok: true, child: updated, data: db });
    }

    // 3. EXCLUIR DADOS DA CRIANÇA (LGPD Direito de Exclusão)
    if (action === "delete_child_lgpd") {
      const childId = payload.child_id;
      const target = db.children.find((c) => c.id === childId);
      if (!target) {
        return NextResponse.json({ ok: false, error: "Criança não encontrada." }, { status: 404 });
      }
      db.children = db.children.filter((c) => c.id !== childId);
      db.sessions = db.sessions.filter((s) => s.child_id !== childId);
      db.session_attachments = db.session_attachments.filter((a) => a.child_id !== childId);
      db.transcriptions = db.transcriptions.filter((t) => t.child_id !== childId);
      db.observations = db.observations.filter((o) => o.child_id !== childId);
      const childReportIds = new Set(
        db.reports.filter((r) => r.child_id === childId).map((r) => r.id)
      );
      db.reports = db.reports.filter((r) => r.child_id !== childId);
      db.report_sources = db.report_sources.filter((rs) => !childReportIds.has(rs.report_id));
      db.report_versions = db.report_versions.filter((rv) => !childReportIds.has(rv.report_id));

      logAudit(db, {
        action: "LGPD_DELETE_CHILD_DATA",
        resource_type: "children",
        resource_id: childId,
        details: `Exclusão integral do prontuário ${target.unique_code} conforme solicitação LGPD.`,
      });
      writeDb(db);
      return NextResponse.json({ ok: true, data: db });
    }

    // 4. CRIAR SESSÃO (com anexos de foto, áudio, transcrição e extração IA)
    if (action === "create_session") {
      const child = db.children.find((c) => c.id === payload.child_id);
      if (!child) {
        return NextResponse.json(
          { ok: false, error: "Selecione uma criança válida para registrar a sessão." },
          { status: 400 }
        );
      }

      const sessionId = generateId("ses");
      const newSession: SessionRecord = {
        id: sessionId,
        child_id: child.id,
        user_id: "usr-educadora-amor",
        professional_name: String(payload.professional_name || "Educadora Responsável").trim(),
        session_date: payload.session_date || new Date().toISOString(),
        notes: String(payload.notes || "").trim(),
        complementary_notes: String(payload.complementary_notes || "").trim(),
        child_voice_quotes: payload.child_voice_quotes || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.sessions.unshift(newSession);

      // Processar fotos anexadas
      if (Array.isArray(payload.photos)) {
        for (const p of payload.photos) {
          if (p.storage_path) {
            const photoAtt: SessionAttachment = {
              id: generateId("att"),
              session_id: sessionId,
              child_id: child.id,
              type: "photo",
              storage_path: p.storage_path,
              activity_tag: String(p.activity_tag || "Vivência na Toca"),
              portfolio_slot: (p.portfolio_slot as PortfolioPhotoSlot) || "galeria_geral",
              caption: String(p.caption || ""),
              ai_visual_description: String(p.ai_visual_description || ""),
              created_at: new Date().toISOString(),
            };
            db.session_attachments.unshift(photoAtt);
          }
        }
      }

      // Processar áudios e transcrições vinculadas
      if (Array.isArray(payload.audios)) {
        for (const a of payload.audios) {
          const audioAtt: SessionAttachment = {
            id: generateId("att"),
            session_id: sessionId,
            child_id: child.id,
            type: "audio",
            storage_path: a.storage_path || "audio-recorded-in-browser",
            activity_tag: "Relato em Áudio da Sessão",
            caption: a.caption || "Gravação de voz da educadora",
            duration_seconds: Number(a.duration_seconds || 0),
            created_at: new Date().toISOString(),
          };
          db.session_attachments.unshift(audioAtt);

          if (a.transcription_text) {
            const tr: Transcription = {
              id: generateId("trc"),
              attachment_id: audioAtt.id,
              session_id: sessionId,
              child_id: child.id,
              text: String(a.transcription_text).trim(),
              status: a.reviewed ? "reviewed" : "pending_review",
              reviewed_at: a.reviewed ? new Date().toISOString() : null,
              created_at: new Date().toISOString(),
            };
            db.transcriptions.unshift(tr);
          }
        }
      }

      // Extrair observações estruturadas pela IA para esta sessão
      syncSessionObservations(db, sessionId);

      logAudit(db, {
        action: "CREATE_SESSION",
        resource_type: "sessions",
        resource_id: sessionId,
        details: `Sessão registrada para prontuário ${child.unique_code}`,
      });

      writeDb(db);
      return NextResponse.json({ ok: true, session: newSession, data: db });
    }

    // 5. ATUALIZAR SESSÃO
    if (action === "update_session") {
      const idx = db.sessions.findIndex((s) => s.id === payload.id);
      if (idx === -1) {
        return NextResponse.json({ ok: false, error: "Sessão não encontrada." }, { status: 404 });
      }
      db.sessions[idx] = {
        ...db.sessions[idx],
        notes: payload.notes ?? db.sessions[idx].notes,
        complementary_notes: payload.complementary_notes ?? db.sessions[idx].complementary_notes,
        session_date: payload.session_date ?? db.sessions[idx].session_date,
        professional_name: payload.professional_name ?? db.sessions[idx].professional_name,
        child_voice_quotes: payload.child_voice_quotes ?? db.sessions[idx].child_voice_quotes,
        updated_at: new Date().toISOString(),
      };

      syncSessionObservations(db, db.sessions[idx].id);
      logAudit(db, {
        action: "UPDATE_SESSION",
        resource_type: "sessions",
        resource_id: db.sessions[idx].id,
        details: "Sessão editada e observações IA sincronizadas.",
      });
      writeDb(db);
      return NextResponse.json({ ok: true, session: db.sessions[idx], data: db });
    }

    // 6. REVISAR TRANSCRIÇÃO DE ÁUDIO
    if (action === "review_transcription") {
      const idx = db.transcriptions.findIndex((t) => t.id === payload.id);
      if (idx === -1) {
        return NextResponse.json({ ok: false, error: "Transcrição não encontrada." }, { status: 404 });
      }
      db.transcriptions[idx].text = String(payload.text || "").trim();
      db.transcriptions[idx].status = "reviewed";
      db.transcriptions[idx].reviewed_at = new Date().toISOString();

      syncSessionObservations(db, db.transcriptions[idx].session_id);
      logAudit(db, {
        action: "REVIEW_TRANSCRIPTION",
        resource_type: "transcriptions",
        resource_id: db.transcriptions[idx].id,
        details: "Transcrição de áudio revisada e aprovada pelo profissional.",
      });
      writeDb(db);
      return NextResponse.json({ ok: true, transcription: db.transcriptions[idx], data: db });
    }

    // 7. ADICIONAR ANEXO A SESSÃO EXISTENTE
    if (action === "add_attachment") {
      const session = db.sessions.find((s) => s.id === payload.session_id);
      if (!session) {
        return NextResponse.json({ ok: false, error: "Sessão não encontrada." }, { status: 404 });
      }
      const newAtt: SessionAttachment = {
        id: generateId("att"),
        session_id: session.id,
        child_id: session.child_id,
        type: payload.type || "photo",
        storage_path: payload.storage_path,
        activity_tag: payload.activity_tag || "Vivência na Toca",
        portfolio_slot: payload.portfolio_slot || "galeria_geral",
        caption: payload.caption || "",
        created_at: new Date().toISOString(),
      };
      db.session_attachments.unshift(newAtt);
      syncSessionObservations(db, session.id);
      writeDb(db);
      return NextResponse.json({ ok: true, attachment: newAtt, data: db });
    }

    // 8. GERAR RELATÓRIO COM IA (Portfólio das Vivências — Psi. Maria Eduarda)
    if (action === "generate_report") {
      const child = db.children.find((c) => c.id === payload.child_id);
      if (!child) {
        return NextResponse.json({ ok: false, error: "Criança não encontrada." }, { status: 404 });
      }

      const startDate = payload.start_date || "2000-01-01";
      const endDate = payload.end_date || "2099-12-31";
      const specificSessionId = payload.session_id || null;

      // Filtrar estritamente sessões da criança no período
      const childSessions = db.sessions.filter((s) => {
        if (s.child_id !== child.id) return false;
        if (specificSessionId) return s.id === specificSessionId;
        const sDate = s.session_date.slice(0, 10);
        return sDate >= startDate && sDate <= endDate;
      });

      // Garantir que todas as sessões selecionadas tenham observações extraídas
      for (const s of childSessions) {
        const hasObs = db.observations.some((o) => o.session_id === s.id);
        if (!hasObs) {
          syncSessionObservations(db, s.id);
        }
      }

      const sessionIds = new Set(childSessions.map((s) => s.id));
      const childObservations = db.observations.filter(
        (o) => o.child_id === child.id && sessionIds.has(o.session_id)
      );
      const childAttachments = db.session_attachments.filter(
        (a) => a.child_id === child.id && sessionIds.has(a.session_id)
      );
      const childTranscriptions = db.transcriptions.filter(
        (t) => t.child_id === child.id && sessionIds.has(t.session_id)
      );

      const periodLabel =
        payload.period_label ||
        `${new Date(startDate + "T12:00:00").toLocaleDateString("pt-BR")} a ${new Date(
          endDate + "T12:00:00"
        ).toLocaleDateString("pt-BR")}`;

      const responsibleProfessional =
        payload.responsible_professional ||
        childSessions[0]?.professional_name ||
        "Educadora Responsável — Psi. Maria Eduarda";

      const generatedContent = await generatePortfolioReportWithAI({
        child,
        periodLabel,
        responsibleProfessional,
        sessions: childSessions,
        observations: childObservations,
        attachments: childAttachments,
        transcriptions: childTranscriptions,
      });

      const reportId = generateId("rep");
      const newReport: Report = {
        id: reportId,
        child_id: child.id,
        template_id: payload.template_id || db.report_templates[0].id,
        period_type: payload.period_type || "custom",
        start_date: startDate,
        end_date: endDate,
        responsible_professional: responsibleProfessional,
        content: generatedContent,
        status: "pending_review",
        approved_by: null,
        approved_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.reports.unshift(newReport);

      // Registrar fontes (report_sources)
      for (const s of childSessions) {
        db.report_sources.push({
          id: generateId("src"),
          report_id: reportId,
          session_id: s.id,
          section_key: "all",
        });
      }

      // Criar versão 1 no histórico de versões (report_versions)
      db.report_versions.unshift({
        id: generateId("ver"),
        report_id: reportId,
        version_number: 1,
        version_label: "Geração Inicial com IA (Aguardando Revisão Humana)",
        content: JSON.parse(JSON.stringify(generatedContent)),
        created_by: responsibleProfessional,
        created_at: new Date().toISOString(),
      });

      logAudit(db, {
        action: "GENERATE_REPORT_AI",
        resource_type: "reports",
        resource_id: reportId,
        details: `Portfólio gerado com IA para ${child.unique_code} (${childSessions.length} sessões consultadas).`,
      });

      writeDb(db);
      return NextResponse.json({ ok: true, report: newReport, data: db });
    }

    // 9. SALVAR EDIÇÃO HUMANA OU APROVAR RELATÓRIO (Sem sobrescrever versões anteriores)
    if (action === "update_report") {
      const idx = db.reports.findIndex((r) => r.id === payload.id);
      if (idx === -1) {
        return NextResponse.json({ ok: false, error: "Relatório não encontrado." }, { status: 404 });
      }

      const currentReport = db.reports[idx];
      const newContent: PortfolioReportContent = payload.content || currentReport.content;
      const isApproving = payload.approve === true;

      const existingVersions = db.report_versions.filter(
        (v) => v.report_id === currentReport.id
      );
      const nextVerNum = existingVersions.length + 1;

      db.reports[idx] = {
        ...currentReport,
        content: newContent,
        responsible_professional:
          payload.responsible_professional || currentReport.responsible_professional,
        status: isApproving ? "approved" : "pending_review",
        approved_by: isApproving
          ? payload.approved_by || currentReport.responsible_professional
          : currentReport.approved_by,
        approved_at: isApproving ? new Date().toISOString() : currentReport.approved_at,
        updated_at: new Date().toISOString(),
      };

      // Preservar nova versão imutável em report_versions
      db.report_versions.unshift({
        id: generateId("ver"),
        report_id: currentReport.id,
        version_number: nextVerNum,
        version_label: isApproving
          ? `Versão Aprovada para Emissão PDF (v${nextVerNum})`
          : `Revisão Humana Salva (v${nextVerNum})`,
        content: JSON.parse(JSON.stringify(newContent)),
        created_by:
          payload.approved_by || currentReport.responsible_professional,
        created_at: new Date().toISOString(),
      });

      logAudit(db, {
        action: isApproving ? "APPROVE_REPORT" : "EDIT_REPORT_HUMAN_REVIEW",
        resource_type: "reports",
        resource_id: currentReport.id,
        details: isApproving
          ? `Relatório revisado e aprovado por ${db.reports[idx].approved_by} (v${nextVerNum})`
          : `Relatório editado na revisão humana (v${nextVerNum})`,
      });

      writeDb(db);
      return NextResponse.json({ ok: true, report: db.reports[idx], data: db });
    }

    // 10. REFORMULAR TRECHO COM IA DURANTE REVISÃO
    if (action === "reformulate_text") {
      const reformulated = reformulateTextPreserveFacts(
        String(payload.text || ""),
        payload.instruction || "mais_acolhedor"
      );
      return NextResponse.json({ ok: true, text: reformulated });
    }

    // 11. CRIAR NOVO MODELO DE RELATÓRIO PERSONALIZADO
    if (action === "create_template") {
      const base = db.report_templates[0];
      const newTpl: ReportTemplate = {
        id: generateId("tpl"),
        name: String(payload.name || "Modelo Personalizado Psi. Maria Eduarda"),
        institution_name: String(payload.institution_name || "PSI. MARIA EDUARDA"),
        subtitle: String(
          payload.subtitle ||
            "Portfólio das Vivências — Desenvolvimento que acontece enquanto a infância acontece"
        ),
        footer_quote: String(
          payload.footer_quote ||
            "No acompanhamento da Psi. Maria Eduarda, o portfólio não é uma coleção de atividades. É memória de um percurso vivido."
        ),
        schema: payload.schema || base.schema,
        version: 1,
        is_official: false,
        created_at: new Date().toISOString(),
      };
      db.report_templates.push(newTpl);
      logAudit(db, {
        action: "CREATE_REPORT_TEMPLATE",
        resource_type: "report_templates",
        resource_id: newTpl.id,
        details: `Modelo criado: ${newTpl.name}`,
      });
      writeDb(db);
      return NextResponse.json({ ok: true, template: newTpl, data: db });
    }

    return NextResponse.json({ ok: false, error: "Ação desconhecida." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno ao processar requisição";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
