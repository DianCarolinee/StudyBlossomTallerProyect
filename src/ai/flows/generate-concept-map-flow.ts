
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a concept map in Mermaid syntax.
 *
 * The flow takes a study topic as input and returns a Mermaid graph string.
 * - generateConceptMap - A function that generates the concept map data.
 * - GenerateConceptMapInput - The input type for the generateConceptMap function.
 * - GenerateConceptMapOutput - The return type for the generateConceptMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConceptMapInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a concept map.'),
});
export type GenerateConceptMapInput = z.infer<typeof GenerateConceptMapInputSchema>;

const GenerateConceptMapOutputSchema = z.object({
  mermaidGraph: z.string().describe('A string representing a Mermaid graph definition (e.g., "graph TD; A-->B;").'),
});
export type GenerateConceptMapOutput = z.infer<typeof GenerateConceptMapOutputSchema>;


export async function generateConceptMap(input: GenerateConceptMapInput): Promise<GenerateConceptMapOutput> {
  return generateConceptMapFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateConceptMapPrompt',
  input: {schema: GenerateConceptMapInputSchema},
  output: {schema: GenerateConceptMapOutputSchema},
  prompt: `Eres un experto en crear mapas conceptuales usando la sintaxis de Mermaid para el tema "{{{topic}}}".

REGLA MÁS IMPORTANTE: El texto dentro de los nodos (entre '[ corchetes ]') NO DEBE contener NUNCA los siguientes caracteres: () / #.

- Genera un diagrama de Mermaid 'graph TD'.
- El mapa debe conectar entre 5 y 10 conceptos clave.
- Conecta los conceptos de forma lógica usando 'A --> B'. NO añadas texto a las conexiones.
- Si necesitas separar palabras dentro de un nodo, usa espacios o guiones. Por ejemplo, en lugar de 'A[Nodo/Concepto(1)]', escribe 'A[Nodo - Concepto 1]'.
- El resultado debe ser una única cadena de texto válida para Mermaid.

Ejemplo de formato de salida:
{
  "mermaidGraph": "graph TD; A[Tema Principal]; B[Concepto Clave 1]; C[Concepto Clave 2]; D[Detalle A]; A --> B; A --> C; B --> D;"
}`,
});

/**
 * Sanitizes the Mermaid graph string to prevent parsing errors.
 * It removes invalid characters like (), /, # from within node labels.
 */
function sanitizeMermaidGraph(graph: string): string {
    // This regex finds content within square brackets and removes problematic characters
    return graph.replace(/\[([^\]]+)\]/g, (match, content) => {
        const sanitizedContent = content.replace(/[()\/#]/g, '');
        return `[${sanitizedContent}]`;
    });
}


const generateConceptMapFlow = ai.defineFlow(
  {
    name: 'generateConceptMapFlow',
    inputSchema: GenerateConceptMapInputSchema,
    outputSchema: GenerateConceptMapOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    
    if (output?.mermaidGraph) {
      // Sanitize the graph to ensure it's valid before returning
      output.mermaidGraph = sanitizeMermaidGraph(output.mermaidGraph);
    }
    
    return output!;
  }
);
