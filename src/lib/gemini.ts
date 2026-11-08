/**
 * Integração Google Gemini via variável de ambiente GEMINI_API_KEY
 * Modelo gratuito padrão: gemini-2.5-flash (fallback para gemini-2.0-flash)
 */

const DEFAULT_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

export function getGeminiApiKey(): string {
  return (process.env.GEMINI_API_KEY || "").trim();
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey().length > 10;
}

export function getGeminiModelName(): string {
  return (process.env.GEMINI_MODEL || DEFAULT_MODEL).trim();
}

async function callGeminiEndpoint(
  model: string,
  payload: Record<string, unknown>,
  timeoutMs = 25000
): Promise<Record<string, unknown> | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return null;
    }
    return (await res.json()) as Record<string, unknown>;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function generateGeminiText(
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.25,
    },
  };

  const primaryModel = getGeminiModelName();
  let data = await callGeminiEndpoint(primaryModel, payload);
  if (!data && primaryModel !== FALLBACK_MODEL) {
    data = await callGeminiEndpoint(FALLBACK_MODEL, payload);
  }
  if (!data) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}

export async function generateGeminiJson<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T | null> {
  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const primaryModel = getGeminiModelName();
  let data = await callGeminiEndpoint(primaryModel, payload, 30000);
  if (!data && primaryModel !== FALLBACK_MODEL) {
    data = await callGeminiEndpoint(FALLBACK_MODEL, payload, 30000);
  }
  if (!data) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawText = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof rawText !== "string" || !rawText.trim()) return null;
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

export async function transcribeAudioWithGemini(
  audioBuffer: ArrayBuffer,
  mimeType: string
): Promise<string | null> {
  const base64Audio = Buffer.from(audioBuffer).toString("base64");
  const normalizedMime =
    mimeType && mimeType.includes("/") ? mimeType.split(";")[0] : "audio/webm";

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: normalizedMime,
              data: base64Audio,
            },
          },
          {
            text: "Transcreva fielmente em português brasileiro (pt-BR) tudo o que é falado neste áudio de registro de sessão infantil. Retorne apenas o texto transcrito, sem comentários adicionais.",
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
    },
  };

  const primaryModel = getGeminiModelName();
  let data = await callGeminiEndpoint(primaryModel, payload, 25000);
  if (!data && primaryModel !== FALLBACK_MODEL) {
    data = await callGeminiEndpoint(FALLBACK_MODEL, payload, 25000);
  }
  if (!data) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}
