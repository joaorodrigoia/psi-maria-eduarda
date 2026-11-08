# 🌸 Psi. Maria Eduarda — Portfólio das Vivências (Acompanhamento Infantil com IA)

> *“Desenvolvimento que acontece enquanto a infância acontece.”*  
> *Com estética inspirada na Corte Primaveril e nas cores acolhedoras de Fim de Tarde, trazendo sempre uma palavra romântica, de encorajamento e a Palavra de Deus ao abrir.*

---

## 1. Visão Geral

Aplicação web completa, responsiva (mobile-first) e estruturada para o registro diário de vivências infantis na **Psi. Maria Eduarda**, transcrição de áudios, organização de observações por Inteligência Artificial e geração do **Portfólio das Vivências** no formato oficial (`Miolo_Portfolio_Vivencias_Toca_da_Cria.docx`).

### Principais Características
- **Mensagem ao Abrir (Amor, Encorajamento & Palavra de Deus):** Sempre que a aplicação é aberta, apresenta uma carta especial com palavras românticas, encorajamento profissional e versículos bíblicos sob a paleta da Corte Primaveril e Fim de Tarde.
- **Prontuários Estritamente Isolados:** Cada criança possui identificador único (`TC-AAAA-NNN`), idade calculada automaticamente, histórico cronológico de sessões, galeria privada de fotos, áudios/transcrições, observações categorizadas e relatórios anteriores.
- **Registro Rápido de Sessões:** Anotações em texto livre, gravação de áudio diretamente pelo navegador (`MediaRecorder` + transcrição assistida via Web Speech / VoiceStudio Whisper local `http://127.0.0.1:3900/v1`), upload de fotos com associação às seções do Portfólio e registro literal de *A Voz da Criança*.
- **Módulo de IA Observacional (10 Regras Obrigatórias):** Classifica registros nas 11 categorias pedagógicas e preenche as 12 seções do **Miolo Oficial da Psi. Maria Eduarda** sem jamais inventar acontecimentos, diferenciando fatos observados de mediações do profissional e preservando a referência exata da sessão de origem.
- **Revisão Humana Obrigatória e Versionamento Imutável (`report_versions`):** Nenhum relatório pode ser exportado em PDF sem revisão e aprovação humana. Cada edição ou aprovação preserva uma nova versão no histórico.
- **Exportação Fiel em PDF A4:** Layout preparado para impressão/exportação A4 com todas as 12 seções do documento `Miolo_Portfolio_Vivencias_Toca_da_Cria.docx`.

---

## 2. Instruções de Instalação e Execução

### Pré-requisitos
- Node.js 18+ instalado

### Passo a Passo
1. Instale as dependências:
   ```bash
   npm install
   ```
2. (Opcional) Copie o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse no navegador:
   ```
   http://localhost:3000
   ```

---

## 3. Variáveis de Ambiente (`.env.example`)

- `APP_SECRET`: Chave secreta da aplicação no servidor.
- `AI_PROVIDER`: `"gemini"`, `"openai"` ou `"local_observational"`. As chaves permanecem exclusivamente no servidor.
- `GEMINI_API_KEY` / `OPENAI_API_KEY`: Chaves opcionais de LLM no servidor.
- `VOICESTUDIO_API_URL`: Endpoint local para transcrição Whisper (`http://127.0.0.1:3900/v1`).
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`: Credenciais para conexão PostgreSQL/Supabase.

---

## 4. Banco de Dados e Migrações

O esquema completo PostgreSQL / Supabase (com as 11 tabelas: `users`, `children`, `sessions`, `session_attachments`, `transcriptions`, `observations`, `report_templates`, `reports`, `report_sources`, `report_versions`, `audit_logs`, índices e Row Level Security) encontra-se em:
- `supabase/migrations/001_initial_schema.sql`

Para uso local imediato sem necessidade de configuração prévia de nuvem, o sistema persiste automaticamente os dados em `data/db.json` (iniciando limpo, sem registros fictícios, conforme as diretrizes).
