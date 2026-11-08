import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Miolo oficial Miolo_Portfolio_Vivencias_Toca_da_Cria.docx existe na raiz do projeto", () => {
  const docxPath = path.join(process.cwd(), "Miolo_Portfolio_Vivencias_Toca_da_Cria.docx");
  assert.equal(fs.existsSync(docxPath), true, "O arquivo oficial .docx deve estar presente");
});

test("Migração SQL do PostgreSQL/Supabase contém todas as 11 tabelas exigidas", () => {
  const sqlPath = path.join(process.cwd(), "supabase", "migrations", "001_initial_schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  const requiredTables = [
    "users",
    "children",
    "sessions",
    "session_attachments",
    "transcriptions",
    "observations",
    "report_templates",
    "reports",
    "report_sources",
    "report_versions",
    "audit_logs",
  ];

  for (const tbl of requiredTables) {
    assert.ok(
      sql.includes(`CREATE TABLE IF NOT EXISTS ${tbl}`),
      `Tabela obrigatória ausente na migração: ${tbl}`
    );
  }
});

test("Coleção de mensagens românticas, de encorajamento e Palavra de Deus está configurada", () => {
  const lovePath = path.join(process.cwd(), "src", "lib", "love-words.ts");
  const content = fs.readFileSync(lovePath, "utf-8");
  assert.ok(content.includes("LOVE_AND_FAITH_MESSAGES"));
  assert.ok(content.includes("Cantares de Salomão"));
  assert.ok(content.includes("Provérbios 31:25-26"));
});

test("Apple Liquid Glass Design System: Tokens Light/Dark e 5 componentes reutilizáveis estão presentes", () => {
  const tokensPath = path.join(process.cwd(), "src", "lib", "design-tokens.ts");
  const tokensContent = fs.readFileSync(tokensPath, "utf-8");

  // Light Mode Palette
  assert.ok(tokensContent.includes("#FFF1EA"));
  assert.ok(tokensContent.includes("#FFFFFF"));
  assert.ok(tokensContent.includes("#E8476A"));
  assert.ok(tokensContent.includes("#3B1425"));
  assert.ok(tokensContent.includes("#8C5A68"));

  // Dark Mode Palette
  assert.ok(tokensContent.includes("#1F0E1B"));
  assert.ok(tokensContent.includes("#33192A"));
  assert.ok(tokensContent.includes("#FFF4F0"));
  assert.ok(tokensContent.includes("#F0BCC8"));

  // 5 Componentes Reutilizáveis
  const requiredComponents = [
    "GlassNavigation.tsx",
    "GlassButton.tsx",
    "GlassToolbar.tsx",
    "GlassModal.tsx",
    "GlassTabBar.tsx",
  ];

  for (const comp of requiredComponents) {
    const compPath = path.join(process.cwd(), "src", "components", "liquid-glass", comp);
    assert.equal(fs.existsSync(compPath), true, `Componente ${comp} deve existir`);
  }
});
