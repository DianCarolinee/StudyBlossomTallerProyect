'use server';
/**
 * @fileOverview Este archivo define un flow de Genkit para generar videos educativos con D-ID.
 * Genera el guión con Gemini y crea un video con avatar usando D-ID API.
 *
 * - generateEducationalVideo - Función principal para generar videos educativos.
 * - GenerateEducationalVideoInput - El tipo de entrada.
 * - GenerateEducationalVideoOutput - La estructura de la respuesta.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateEducationalVideoInputSchema = z.object({
    topic: z.string().describe('El tema para generar el video educativo.'),
    duration: z.enum(['short', 'medium', 'long']).describe('Duración del video: corto (1-2 min), medio (3-5 min), largo (5-10 min).'),
});

export type GenerateEducationalVideoInput = z.infer<typeof GenerateEducationalVideoInputSchema>;

const GenerateEducationalVideoOutputSchema = z.object({
    videoUrl: z.string().url().describe('URL del video generado por D-ID.'),
    videoId: z.string().describe('ID del video en D-ID.'),
    script: z.string().describe('Guión completo del video.'),
    title: z.string().describe('Título del video.'),
    keyPoints: z.array(z.string()).describe('Puntos clave cubiertos en el video.'),
    estimatedDuration: z.string().describe('Duración estimada del video.'),
    thumbnailUrl: z.string().url().optional().describe('URL de la miniatura del video.'),
    status: z.enum(['created', 'processing', 'done', 'error']).describe('Estado del video.'),
});

export type GenerateEducationalVideoOutput = z.infer<typeof GenerateEducationalVideoOutputSchema>;

export async function generateEducationalVideo(input: GenerateEducationalVideoInput): Promise<GenerateEducationalVideoOutput> {
    return generateEducationalVideoFlow(input);
}

// Función de prueba para verificar la API key de D-ID
export async function testDIdConnection(): Promise<{ success: boolean; message: string; credits?: number }> {
    const D_ID_API_KEY = process.env.D_ID_API_KEY;

    if (!D_ID_API_KEY) {
        return { success: false, message: 'API key no configurada' };
    }

    try {
        const authHeader = Buffer.from(`${D_ID_API_KEY}:`).toString('base64');

        // Probar con el endpoint de créditos
        const response = await fetch('https://api.d-id.com/credits', {
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                message: `Error ${response.status}: ${errorText}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            message: 'Conexión exitosa con D-ID',
            credits: data.remaining
        };
    } catch (error: any) {
        return {
            success: false,
            message: `Error de conexión: ${error.message}`
        };
    }
}

// Función auxiliar para esperar a que el video esté listo
async function waitForVideoCompletion(videoId: string, maxAttempts = 60): Promise<any> {
    const D_ID_API_KEY = process.env.D_ID_API_KEY;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const authHeader = Buffer.from(`${D_ID_API_KEY}:`).toString('base64');

        const response = await fetch(`https://api.d-id.com/talks/${videoId}`, {
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error al verificar el estado del video: ${response.statusText}`);
        }

        const data = await response.json();

        console.log(`[D-ID] Intento ${attempt + 1}/${maxAttempts} - Estado: ${data.status}`);

        if (data.status === 'done') {
            return data;
        } else if (data.status === 'error') {
            throw new Error(`Error al generar el video: ${data.error || 'Error desconocido'}`);
        }

        // Esperar 3 segundos antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    throw new Error('El video tardó demasiado en generarse. Por favor, intenta de nuevo.');
}

const generateEducationalVideoFlow = ai.defineFlow(
    {
        name: 'generateEducationalVideoFlow',
        inputSchema: GenerateEducationalVideoInputSchema,
        outputSchema: GenerateEducationalVideoOutputSchema,
    },
    async (input): Promise<GenerateEducationalVideoOutput> => {
        // Determinar la longitud del guión según la duración
        const wordLimits = {
            short: { words: 200, duration: '1-2 minutos', maxChars: 1000 },
            medium: { words: 400, duration: '3-5 minutos', maxChars: 2000 },
            long: { words: 700, duration: '5-10 minutos', maxChars: 3500 },
        };

        const limit = wordLimits[input.duration];

        console.log(`[Video Flow] Generando guión para: ${input.topic}`);

        // 1. Generar el guión con Gemini
        const scriptPrompt = `Eres un guionista experto en contenido educativo. Crea un guión CONCISO y DIRECTO para un video educativo sobre "${input.topic}".

IMPORTANTE: El guión debe ser CORTO y CLARO para narración de voz.

Características:
- Duración objetivo: ${limit.duration}
- Palabras aproximadas: ${limit.words}
- Máximo de caracteres: ${limit.maxChars}

Estructura:
1. Introducción (15-20 segundos): Hook atractivo
2. Desarrollo (60-70% del tiempo): Explicación clara con 2-3 puntos principales
3. Conclusión (10-15 segundos): Resumen breve

Estilo de narración:
- Tono conversacional y cercano
- Frases cortas y directas
- Sin jerga innecesaria
- Ritmo ágil y dinámico
- Usar "tú" para conectar con el espectador

Devuelve SOLO un JSON con esta estructura:
{
  "title": "Título conciso y atractivo (máximo 60 caracteres)",
  "script": "Guión completo en un solo párrafo fluido, sin secciones marcadas",
  "keyPoints": ["Punto 1", "Punto 2", "Punto 3"]
}

CRÍTICO: El "script" debe ser un texto continuo, natural para lectura en voz alta, SIN marcadores de sección, SIN títulos internos, SOLO el texto que se narrará.`;

        const { text: scriptText } = await ai.generate({
            model: googleAI.model('gemini-2.5-flash'),
            prompt: scriptPrompt,
        });

        // 2. Parsear el guión
        let scriptData;
        try {
            const cleanedText = scriptText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            scriptData = JSON.parse(cleanedText);
        } catch (error) {
            console.error('[Video Flow] Error al parsear el guión:', error);
            throw new Error('No se pudo generar el guión correctamente. Por favor, intenta de nuevo.');
        }

        const finalScript = scriptData.script || scriptText;

        // Limitar el script al máximo de caracteres permitido
        const truncatedScript = finalScript.length > limit.maxChars
            ? finalScript.substring(0, limit.maxChars) + '...'
            : finalScript;

        console.log(`[Video Flow] Guión generado: ${truncatedScript.length} caracteres`);

        // 3. Llamar a D-ID para crear el video
        const D_ID_API_KEY = process.env.D_ID_API_KEY;

        if (!D_ID_API_KEY) {
            throw new Error('La API key de D-ID no está configurada. Agrega D_ID_API_KEY en tu archivo .env');
        }

        // Codificar la API key en base64 para autenticación Basic
        const authHeader = Buffer.from(`${D_ID_API_KEY}:`).toString('base64');

        console.log('[Video Flow] Creando video con D-ID...');
        console.log('[Video Flow] Longitud del script:', truncatedScript.length, 'caracteres');

        // Simplificar el request body - usar configuración mínima
        const requestBody = {
            script: {
                type: 'text',
                input: truncatedScript,
                provider: {
                    type: 'microsoft',
                    voice_id: 'es-ES-ElviraNeural', // Cambiar a español de España que es más estable
                },
            },
            // Remover config por ahora para probar
            source_url: 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg', // Usar un avatar público conocido
        };

        console.log('[Video Flow] Intentando crear video con configuración simplificada...');

        const dIdResponse = await fetch('https://api.d-id.com/talks', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!dIdResponse.ok) {
            const errorText = await dIdResponse.text();
            console.error('[Video Flow] Error de D-ID:', errorText);
            console.error('[Video Flow] Status code:', dIdResponse.status);
            console.error('[Video Flow] Status text:', dIdResponse.statusText);

            // Intentar parsear el error como JSON para más detalles
            try {
                const errorJson = JSON.parse(errorText);
                console.error('[Video Flow] Error details:', JSON.stringify(errorJson, null, 2));
            } catch (e) {
                console.error('[Video Flow] No se pudo parsear el error como JSON');
            }

            throw new Error(`Error al crear el video con D-ID (${dIdResponse.status}): ${errorText}`);
        }

        const dIdData = await dIdResponse.json();
        const videoId = dIdData.id;

        console.log(`[Video Flow] Video creado con ID: ${videoId}. Esperando procesamiento...`);

        // 4. Esperar a que el video esté listo
        const completedVideo = await waitForVideoCompletion(videoId);

        console.log(`[Video Flow] Video completado exitosamente!`);

        // 5. Retornar los datos completos con el tipo correcto
        return {
            videoUrl: completedVideo.result_url,
            videoId: videoId,
            script: truncatedScript,
            title: scriptData.title || `Video Educativo: ${input.topic}`,
            keyPoints: scriptData.keyPoints || [],
            estimatedDuration: limit.duration,
            thumbnailUrl: completedVideo.thumbnail_url || 'https://create-images-results.d-id.com/default-presenter.jpg',
            status: 'done' as const, // ← ESTE ES EL CAMBIO CLAVE
        };
    }
);