import { GoogleGenAI } from "@google/genai";
import { ScriptOption } from "../types";

// Helper Singleton
const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
      console.warn("⚠️ VITE_GEMINI_API_KEY is missing. AI features will fail.");
  }
  return new GoogleGenAI({ apiKey });
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const refineMessageWithElf = async (originalText: string): Promise<ScriptOption[]> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash"; 
  
  const systemInstruction = `
  PERFIL: Você é Jingle, o Roteirista Sênior e Chefe da Oficina do Papai Noel.
  TAREFA: Escrever roteiros curtos para o Papai Noel gravar em vídeo.

  REGRA DE OURO (O "DESTINATÁRIO"):
  1. O Papai Noel deve falar DIRETAMENTE com quem vai assistir ao vídeo.
  2. USE SEMPRE A SEGUNDA PESSOA ("Você", "Vocês").
  
  DIRETRIZES DE CONTEÚDO:
  1. Mencione que um PRESENTE/SURPRESA está a caminho.
  2. Crie expectativa e calor humano.

  REGRAS DE ESTRUTURA (INVIOLÁVEIS):
  1. O vídeo parte 1 tem 8 segundos. O texto DEVE SER CURTO.
  2. PARTE 1: 10 a 13 palavras. Começar com "Ho ho ho!". Terminar a frase de forma COMPLETA mas deixando abertura para continuação.
  3. PARTE 2 (se houver): 10 a 13 palavras. Complementar a ideia. Terminar com "Feliz Natal!".
  4. CRUCIAL: A PARTE 1 deve terminar com o Papai Noel AINDA FALANDO (não pode terminar em silêncio).
  
  FORMATO DE SAÍDA: JSON Array válido com 2 opções criativas.
  `;

  const prompt = `
  Mensagem do usuário: "${originalText}"
  
  IMPORTANTE: Crie roteiros onde a PARTE 1 termina com Papai Noel falando (não em silêncio).
  
  Retorne JSON exato:
  [
    { "id": "opt1", "title": "Opção [Estilo]", "parts": ["Texto 1...", "Texto 2..."] },
    { "id": "opt2", "title": "Opção [Estilo]", "parts": ["Texto 1...", "Texto 2..."] }
  ]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7, 
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Elf");
    return JSON.parse(text) as ScriptOption[];

  } catch (error) {
    console.error("Elf refinement failed:", error);
    return [
      {
        id: "fallback",
        title: "Opção Clássica",
        parts: [
          "Ho ho ho! O Natal chegou trazendo muita alegria e",
          "um presente especial está guardado aqui para você. Feliz Natal!"
        ]
      }
    ];
  }
};

async function pollForVideo(ai: GoogleGenAI, operation: any): Promise<any> {
  let currentOp = operation;
  let attempts = 0;
  const maxAttempts = 60; // 5 minutos máximo
  
  while (!currentOp.done && attempts < maxAttempts) {
    await wait(5000); 
    currentOp = await ai.operations.getVideosOperation({ operation: currentOp });
    attempts++;
  }
  
  if (!currentOp.done) {
    throw new Error("Video generation timeout after 5 minutes");
  }
  
  return currentOp;
}

async function fetchVideoBlob(uri: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isPlaceholder = !apiKey || apiKey.includes('UNUSED_PLACEHOLDER') || apiKey.includes('PLACEHOLDER');
  
  const url = isPlaceholder ? uri : `${uri}&key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Video fetch failed: ${response.status} ${response.statusText} for URL: ${url}`);
    throw new Error(`Failed to fetch video: ${response.statusText}`);
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export const generateSantaVideo = async (
  scriptParts: string[], 
  onStepChange?: (step: string) => void
): Promise<string[]> => {
  
  // Verificação de chave API (AI Studio)
  if (window.aistudio) {
    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    } catch(e) {
      console.warn("AI Studio key check failed, proceeding anyway", e);
    }
  }

  const ai = getAiClient();
  const part1Text = scriptParts[0] || "Ho ho ho! Feliz Natal!";
  const part2Text = scriptParts[1] || "";
  
  const modelName = 'veo-3.1-fast-generate-preview';

  // ============================================
  // CORREÇÃO PRINCIPAL: PROMPTS DE ÁUDIO CONSISTENTES
  // ============================================
  
  // Definição ultra-específica de voz para MÁXIMA consistência
  const SANTA_VOICE_PROFILE = `
  VOICE CHARACTER PROFILE (MAINTAIN EXACTLY):
  - Voice Type: Deep baritone, warm and jovial
  - Age Sound: Elderly man, 65-70 years old
  - Pitch Range: Low to medium-low (100-150 Hz base)
  - Speaking Rate: Slow and deliberate, 110-120 words per minute
  - Vocal Quality: Rich, slightly raspy, comforting
  - Accent: Neutral with slight vintage warmth
  - Emotional Tone: Gentle, cheerful, grandfatherly
  - Breathing: Natural pauses, warm chuckles (ho ho ho)
  `;

  const AUDIO_ENVIRONMENT = `
  AUDIO ENVIRONMENT (CONSISTENT ACROSS ALL PARTS):
  - Background: Soft crackling fireplace (low volume, -20dB)
  - Room Acoustics: Warm wooden cabin, slight natural reverb
  - Ambient: Very subtle winter wind outside (barely audible)
  - NO music, NO jingles, NO bells during speech
  - Clean dialogue mix, voice priority at 0dB
  `;

  const AUDIO_TECHNICAL = `
  TECHNICAL AUDIO SPECS:
  - Sample Rate: 48kHz
  - Bit Depth: 24-bit
  - Dynamic Range: -12dB to -3dB (speaking)
  - EQ: Warm low-end boost, clear mid-range
  - Compression: Light, natural dynamics preserved
  - De-esser: Gentle on sibilants
  `;

  try {
    let videoUrls: string[] = [];

    // ============================================
    // PASSO 1: PRIMEIRA PARTE (8 segundos)
    // ============================================
    onStepChange?.('🎬 Gravando Parte 1 (8 segundos)...');

    const part1Prompt = `
SCENE: Cinematic 4K shot of Santa Claus in cozy log cabin.
Camera: Medium close-up, eye-level, looking directly at camera.
Lighting: Warm firelight, soft golden glow, cinematic color grading.
Santa's Action: Sitting comfortably, gentle smile, animated gestures while speaking.

DIALOGUE (EXACT WORDS): "${part1Text}"

${SANTA_VOICE_PROFILE}
${AUDIO_ENVIRONMENT}
${AUDIO_TECHNICAL}

CRITICAL: Santa MUST BE SPEAKING at the 7.5-8 second mark (final moment of video).
The sentence should flow naturally but NOT finish completely - leave slight continuation energy.
Voice energy should remain CONSISTENT and PRESENT in the final second.

NEGATIVE PROMPTS: No sudden voice changes, no music overlay, no echo effects, no multiple voices.
    `.trim();

    let operation = await ai.models.generateVideos({
      model: modelName,
      prompt: part1Prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    const opResult1 = await pollForVideo(ai, operation);
    const video1Uri = opResult1.response?.generatedVideos?.[0]?.video?.uri;
    const video1Asset = opResult1.response?.generatedVideos?.[0]?.video;

    if (!video1Uri) throw new Error("No video URI returned for part 1.");
    
    const video1Blob = await fetchVideoBlob(video1Uri);
    videoUrls.push(video1Blob);

    // ============================================
    // PASSO 2: EXTENSÃO (7 segundos adicionais)
    // ============================================
    if (part2Text && video1Asset) {
      await wait(3000); // Pausa técnica entre requisições

      onStepChange?.('🎬 Estendendo vídeo com Parte 2 (7 segundos)...');
      
      // PROMPT DE EXTENSÃO - Continuidade perfeita
      const extendPrompt = `
CONTINUE THE PREVIOUS SCENE SEAMLESSLY.

Santa continues speaking WITHOUT INTERRUPTION.
EXACT CONTINUATION DIALOGUE: "${part2Text}"

${SANTA_VOICE_PROFILE}
${AUDIO_ENVIRONMENT}
${AUDIO_TECHNICAL}

CRITICAL CONSISTENCY REQUIREMENTS:
- SAME EXACT VOICE as previous segment (timbre, pitch, pace)
- SAME lighting and camera angle
- SAME facial expressions style
- NATURAL transition as if one continuous take
- Voice should blend perfectly from previous segment
- Speaking rate MUST match: 110-120 words per minute
- NO change in voice character or audio mix

The extension should feel like the same recording session.
Santa's voice continues with identical warmth and energy.

NEGATIVE PROMPTS: No voice actor change, no speed variation, no tone shift, no audio artifacts.
      `.trim();

      let extendOp = await ai.models.generateVideos({
        model: modelName,
        prompt: extendPrompt,
        video: video1Asset, // CRUCIAL: Usar o asset do vídeo anterior
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      const opResult2 = await pollForVideo(ai, extendOp);
      const video2Uri = opResult2.response?.generatedVideos?.[0]?.video?.uri;
      
      if (video2Uri) {
        const video2Blob = await fetchVideoBlob(video2Uri);
        // O vídeo estendido JÁ CONTÉM os primeiros 8 segundos + 7 novos
        // Portanto, substituímos para retornar apenas o vídeo completo
        videoUrls = [video2Blob];
      }
    }

    return videoUrls;

  } catch (error: any) {
    console.error("Veo generation failed:", error);
    
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    
    if (error.message?.includes("timeout")) {
      throw new Error("VIDEO_GENERATION_TIMEOUT");
    }
    
    throw error;
  }
};