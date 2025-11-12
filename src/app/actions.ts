
"use server";

import { generateFeynmanFlashcards } from "@/ai/flows/generate-feynman-flashcards";
import { generateAudio } from "@/ai/flows/generate-audio-flow";
import { getFeynmanExplanation, analyzeFeynmanExplanation } from "@/ai/flows/generate-feynman-explanation-flow";
import { generateConceptMap } from "@/ai/flows/generate-concept-map-flow";
import { generateQuiz } from "@/ai/flows/generate-quiz-flow";
import { generatePomodoroRecommendations } from "@/ai/flows/generate-pomodoro-recommendations-flow";
import { generateAidaEngagement } from "@/ai/flows/generate-aida-engagement-flow";
import type { QuizQuestion } from "@/lib/types";
import type { FeynmanExplanationOutput, FeynmanAnalysisOutput } from "@/ai/flows/generate-feynman-explanation-flow";
import type { VoiceTutorOutput, VoiceTutorInput } from "@/ai/flows/voice-tutor-flow";
import type { GenerateEducationalVideoOutput, GenerateEducationalVideoInput } from "@/ai/flows/generate-educational-video-flow";
import { askVoiceTutor } from "@/ai/flows/voice-tutor-flow";
import { generateEducationalVideo } from "@/ai/flows/generate-educational-video-flow";

export async function getFlashcards(
  topic: string
): Promise<{ flashcards: {question: string, answer: string}[] } | { error: string }> {
  if (!topic) {
    return { error: "Topic is required to generate flashcards." };
  }

  try {
    const result = await generateFeynmanFlashcards({ topic });
    if (!result || !result.flashcards || result.flashcards.length === 0) {
      return {
        error:
          "Could not generate flashcards. The topic might be too broad or unsupported.",
      };
    }
    return result;
  } catch (e) {
    console.error(e);
    return {
      error: "An unexpected error occurred while generating flashcards.",
    };
  }
}

export async function getAudio(
  text: string
): Promise<{ media: string } | { error: string }> {
  if (!text) {
    return { error: "Text is required to generate audio." };
  }

  try {
    const result = await generateAudio(text);
    if (!result || !result.media) {
      return {
        error: "Could not generate audio.",
      };
    }
    return result;
  } catch (e) {
    console.error(e);
    return {
      error: "An unexpected error occurred while generating audio.",
    };
  }
}

export async function getFeynmanExplanationAction(topic: string): Promise<FeynmanExplanationOutput | { error: string }> {
  return await getFeynmanExplanation(topic);
}

export async function analyzeFeynmanExplanationAction(topic: string, userExplanation: string): Promise<FeynmanAnalysisOutput | { error: string }> {
    return await analyzeFeynmanExplanation(topic, userExplanation);
}

export async function getConceptMap(
  topic: string
): Promise<{ mermaidGraph: string } | { error: string }> {
  if (!topic) {
    return { error: "Topic is required to generate a concept map." };
  }
  try {
    const result = await generateConceptMap({ topic });
    if (!result || !result.mermaidGraph) {
      return {
        error:
          "Could not generate concept map. The topic might be too broad or unsupported.",
      };
    }
    return result;
  } catch (e) {
    console.error(e);
    return {
      error: "An unexpected error occurred while generating the concept map.",
    };
  }
}

export async function getQuiz(
  flashcards: { question: string; answer: string }[]
): Promise<{ questions: QuizQuestion[] } | { error: string }> {
  if (!flashcards || flashcards.length === 0) {
    return { error: "Flashcards are required to generate a quiz." };
  }
  try {
    const result = await generateQuiz({ flashcards });
    if (!result || !result.questions || result.questions.length === 0) {
      return {
        error:
          "Could not generate quiz. The content might be too complex or unsupported.",
      };
    }
    return result;
  } catch (e) {
    console.error(e);
    return {
      error: "An unexpected error occurred while generating the quiz.",
    };
  }
}

export async function getPomodoroRecommendations(
  topic: string
): Promise<any | { error: string }> {
    if (!topic) {
        return { error: "Topic is required to generate recommendations." };
    }
    try {
        const result = await generatePomodoroRecommendations({ topic });
        if (!result || !result.recommendations || result.recommendations.length === 0) {
            return {
                error:
                "Could not generate recommendations. The topic might be too broad or unsupported.",
            };
        }
        return result;
    } catch (e) {
        console.error(e);
        return {
            error: "An unexpected error occurred while generating recommendations.",
        };
    }
}

export async function getAidaEngagement(
  topic: string
): Promise<any | { error: string }> {
  if (!topic) {
    return { error: "Topic is required to generate the engagement content." };
  }
  try {
    const result = await generateAidaEngagement({ topic });
    if (!result) {
      return {
        error:
          "Could not generate engagement content. The topic might be too broad.",
      };
    }
    return result;
  } catch (e) {
    console.error(e);
    return {
      error: "An unexpected error occurred while generating engagement content.",
    };
  }
}

export async function getVoiceTutorResponse(
    input: VoiceTutorInput
): Promise<VoiceTutorOutput | { error: string }> {
  if (!input.topic || !input.userQuestion) {
    return { error: "Se requiere un tema y una pregunta." };
  }

  try {
    const result = await askVoiceTutor(input);
    if (!result || !result.textResponse) {
      return {
        error: "No se pudo generar una respuesta. Por favor, intenta de nuevo.",
      };
    }
    return result;
  } catch (e: any) {
    console.error('Error en getVoiceTutorResponse:', e);
    return {
      error: e.message || "Ocurrió un error inesperado al procesar tu pregunta.",
    };
  }
}

export async function getEducationalVideo(
    input: GenerateEducationalVideoInput
): Promise<GenerateEducationalVideoOutput | { error: string }> {
  if (!input.topic) {
    return { error: "Se requiere un tema para generar el video." };
  }

  try {
    const result = await generateEducationalVideo(input);
    if (!result || !result.script) {
      return {
        error: "No se pudo generar el video. El tema podría ser muy complejo o ambiguo.",
      };
    }
    return result;
  } catch (e: any) {
    console.error('Error en getEducationalVideo:', e);
    return {
      error: e.message || "Ocurrió un error inesperado al generar el video.",
    };
  }
}