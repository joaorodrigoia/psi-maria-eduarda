import { NextRequest, NextResponse } from "next/server";
import {
  getGeminiModelName,
  isGeminiConfigured,
  transcribeAudioWithGemini,
} from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("file") as Blob | null;

    if (!audioFile) {
      return NextResponse.json(
        { ok: false, error: "Nenhum arquivo de áudio enviado." },
        { status: 400 }
      );
    }

    // 1. Tentar VoiceStudio Local (http://127.0.0.1:3900/v1/audio/transcriptions)
    const voiceStudioBase = process.env.VOICESTUDIO_API_URL || "http://127.0.0.1:3900/v1";
    try {
      const vsForm = new FormData();
      vsForm.append("file", audioFile, "recording.wav");
      vsForm.append("model", "whisper-1");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${voiceStudioBase}/audio/transcriptions`, {
        method: "POST",
        body: vsForm,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data && data.text) {
          return NextResponse.json({
            ok: true,
            provider: "VoiceStudio Local Whisper",
            text: data.text,
          });
        }
      }
    } catch {
      // VoiceStudio local offline ou indisponível no momento — prosseguir para Gemini 2.5 Flash
    }

    // 2. Tentar Google Gemini Multimodal (gemini-2.5-flash)
    if (isGeminiConfigured()) {
      try {
        const arrayBuf = await audioFile.arrayBuffer();
        const geminiText = await transcribeAudioWithGemini(
          arrayBuf,
          audioFile.type || "audio/webm"
        );
        if (geminiText) {
          return NextResponse.json({
            ok: true,
            provider: `Google Gemini (${getGeminiModelName()})`,
            text: geminiText,
          });
        }
      } catch {
        // Prosseguir para próximo fallback
      }
    }

    // 2. Tentar OpenAI Whisper se OPENAI_API_KEY estiver configurada no servidor
    if (process.env.OPENAI_API_KEY) {
      try {
        const oaForm = new FormData();
        oaForm.append("file", audioFile, "recording.webm");
        oaForm.append("model", "whisper-1");
        oaForm.append("language", "pt");

        const oaRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: oaForm,
        });
        if (oaRes.ok) {
          const oaData = await oaRes.json();
          return NextResponse.json({
            ok: true,
            provider: "OpenAI Whisper",
            text: oaData.text || "",
          });
        }
      } catch {
        // Fallback
      }
    }

    return NextResponse.json({
      ok: true,
      provider: "Browser WebSpeech / Revisão Humana",
      text: "",
      notice:
        "Áudio gravado e preservado com sucesso! Para transcrição automática via servidor sem Web Speech, inicie o VoiceStudio em http://127.0.0.1:3900 ou configure OPENAI_API_KEY. Você pode revisar ou digitar a transcrição abaixo.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao transcrever áudio.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
