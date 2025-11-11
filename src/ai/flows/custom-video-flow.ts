'use server';
/**
 * @fileOverview Este archivo define un "flow" de Genkit que actúa como un puente para llamar a tu propio modelo de IA externo.
 *
 * El propósito de usar `ai.defineFlow` aquí no es para usar un modelo de IA de Google, sino para:
 * 1.  **Organizar el código**: Mantiene todas las operaciones de IA consistentes.
 * 2.  **Obtener Observabilidad**: Permite que Genkit monitoree las llamadas a tu API (tiempos, errores, etc.).
 * 3.  **Validar Datos**: Usa Zod para asegurar que los datos enviados y recibidos tienen el formato correcto.
 *
 * El flow llama a la URL de tu modelo desplegado para procesar un video.
 * - callCustomVideoModel - La función principal que tu app llamará.
 * - CustomVideoModelInput - El tipo de entrada para tu modelo.
 * - CustomVideoModelOutput - La estructura de la respuesta que se espera de tu modelo.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. Define la entrada que tu modelo necesita.
// Por ejemplo, la URL del video que ya ha sido subido a un servicio de almacenamiento.
const CustomVideoModelInputSchema = z.object({
  videoUrl: z.string().url().describe('La URL pública del video a analizar.'),
});
export type CustomVideoModelInput = z.infer<typeof CustomVideoModelInputSchema>;


// 2. Define la estructura de la respuesta JSON que esperas de tu modelo.
const CustomVideoModelOutputSchema = z.object({
    transcription: z.string().describe('La transcripción completa del video.'),
    timestamps: z.array(z.object({
        text: z.string().describe('El fragmento de texto.'),
        startTime: z.number().describe('El tiempo de inicio en segundos.'),
        endTime: z.number().describe('El tiempo de fin en segundos.'),
    })).describe('Una lista de fragmentos de texto con sus marcas de tiempo.'),
});
export type CustomVideoModelOutput = z.infer<typeof CustomVideoModelOutputSchema>;


// Esta es la función que el resto de tu app llamará.
// Actúa como una simple puerta de entrada al flow.
export async function callCustomVideoModel(input: CustomVideoModelInput): Promise<CustomVideoModelOutput> {
  return customVideoModelFlow(input);
}

// Aquí definimos el flow. Es un contenedor para la lógica de nuestro backend.
const customVideoModelFlow = ai.defineFlow(
  {
    name: 'customVideoModelFlow', // Un nombre para identificarlo en los logs de Genkit.
    inputSchema: CustomVideoModelInputSchema, // Valida la entrada.
    outputSchema: CustomVideoModelOutputSchema, // Valida la salida.
  },
  async (input) => {
    // 3. ¡Aquí está la integración! Esta es la URL donde desplegaste tu modelo.
    const YOUR_CUSTOM_MODEL_URL = 'https://your-custom-model-url.com/analyze';

    console.log(`Llamando a tu modelo externo en: ${YOUR_CUSTOM_MODEL_URL}`);

    // Usamos 'fetch' para hacer una petición HTTP a tu API.
    // Esto NO usa ningún modelo de IA de Genkit/Google. Es una simple llamada de red.
    const response = await fetch(YOUR_CUSTOM_MODEL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Podrías añadir cabeceras de autenticación si tu modelo lo requiere.
            // 'Authorization': `Bearer ${process.env.YOUR_MODEL_API_KEY}`,
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        // Manejo de errores si tu API devuelve un problema.
        const errorBody = await response.text();
        throw new Error(`La llamada al modelo personalizado falló: ${response.statusText} - ${errorBody}`);
    }

    // 4. Parseamos la respuesta JSON de tu modelo.
    // Zod validará automáticamente que la respuesta coincida con CustomVideoModelOutputSchema.
    const result = await response.json();
    return result;
  }
);
