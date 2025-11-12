'use server';
/**
 * @fileOverview Este archivo define un flow de Genkit para un tutor de voz conversacional.
 * Utiliza Gemini para generar respuestas y el TTS de Google para convertirlas en audio.
 *
 * - askVoiceTutor - Función principal para interactuar con el tutor de voz.
 * - VoiceTutorInput - El tipo de entrada para el tutor.
 * - VoiceTutorOutput - La estructura de la respuesta del tutor.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

const VoiceTutorInputSchema = z.object({
    topic: z.string().describe('El tema de estudio.'),
    userQuestion: z.string().describe('La pregunta del estudiante en texto.'),
    conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })).optional().describe('Historial de la conversación para contexto.'),
});

export type VoiceTutorInput = z.infer<typeof VoiceTutorInputSchema>;

const VoiceTutorOutputSchema = z.object({
    textResponse: z.string().describe('Respuesta en texto del tutor.'),
    audioResponse: z.string().describe('Respuesta en audio del tutor (data URI base64).'),
    followUpSuggestions: z.array(z.string()).describe('Preguntas de seguimiento sugeridas.'),
});

export type VoiceTutorOutput = z.infer<typeof VoiceTutorOutputSchema>;

export async function askVoiceTutor(input: VoiceTutorInput): Promise<VoiceTutorOutput> {
    return voiceTutorFlow(input);
}

async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
): Promise<string> {
    return new Promise((resolve, reject) => {
        const writer = new wav.Writer({
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
        });

        let bufs = [] as any[];
        writer.on('error', reject);
        writer.on('data', function (d) {
            bufs.push(d);
        });
        writer.on('end', function () {
            resolve(Buffer.concat(bufs).toString('base64'));
        });

        writer.write(pcmData);
        writer.end();
    });
}

const voiceTutorFlow = ai.defineFlow(
    {
        name: 'voiceTutorFlow',
        inputSchema: VoiceTutorInputSchema,
        outputSchema: VoiceTutorOutputSchema,
    },
    async (input) => {
        // 1. Construir el contexto de la conversación
        let conversationContext = '';
        if (input.conversationHistory && input.conversationHistory.length > 0) {
            conversationContext = input.conversationHistory.map(msg =>
                `${msg.role === 'user' ? 'Estudiante' : 'Tutor'}: ${msg.content}`
            ).join('\n');
        }

        // 2. Generar respuesta con Gemini
        const prompt = `Eres un tutor experto, paciente y motivador especializado en ${input.topic}.

${conversationContext ? `Contexto de la conversación anterior:\n${conversationContext}\n\n` : ''}

El estudiante pregunta: "${input.userQuestion}"

Instrucciones:
- Responde de forma clara, didáctica y motivadora
- Usa analogías o ejemplos concretos cuando sea apropiado
- Adapta el nivel de complejidad al estudiante
- Si detectas confusión, simplifica la explicación
- Máximo 150 palabras para que la respuesta en audio no sea muy larga
- Usa un tono conversacional y cercano

Responde SOLO con la explicación, sin mencionar que eres un tutor o una IA.`;

        const { text: textResponse } = await ai.generate({
            model: googleAI.model('gemini-2.5-flash'),
            prompt,
        });

        // 3. Generar el audio con TTS de Google
        const { media } = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Algenib' }, // Voz en español
                    },
                },
            },
            prompt: textResponse,
        });

        if (!media) {
            throw new Error('No se pudo generar el audio');
        }

        const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
        );

        const audioBase64 = await toWav(audioBuffer);

        // 4. Generar sugerencias de seguimiento
        const { text: suggestionsText } = await ai.generate({
            model: googleAI.model('gemini-2.5-flash'),
            prompt: `Basándote en esta pregunta sobre ${input.topic}: "${input.userQuestion}"
      Y esta respuesta: "${textResponse}"
      
      Genera exactamente 3 preguntas de seguimiento que un estudiante podría hacer para profundizar.
      Devuelve SOLO un array JSON de strings, sin explicaciones adicionales.
      
      Ejemplo: ["¿Pregunta 1?", "¿Pregunta 2?", "¿Pregunta 3?"]`,
        });

        let followUpSuggestions: string[] = [];
        try {
            followUpSuggestions = JSON.parse(suggestionsText);
        } catch {
            followUpSuggestions = [
                '¿Puedes darme un ejemplo práctico?',
                '¿Cómo se relaciona esto con otros conceptos?',
                '¿Cuáles son los errores comunes al aprender esto?',
            ];
        }

        return {
            textResponse,
            audioResponse: 'data:audio/wav;base64,' + audioBase64,
            followUpSuggestions,
        };
    }
);