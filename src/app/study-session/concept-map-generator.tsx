
"use client";

import { useState, useEffect } from "react";
import { getConceptMap } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, LoaderCircle } from "lucide-react";
import mermaid from 'mermaid';

// Initialize Mermaid with a theme that will be applied
mermaid.initialize({ 
  startOnLoad: false,
  theme: 'neutral', 
  themeVariables: {
    'primaryColor': '#F5EEFE',
    'primaryTextColor': '#2D233D',
    'primaryBorderColor': '#D8B4FE',
    'lineColor': '#D8B4FE',
    'secondaryColor': '#F9A8D4',
    'tertiaryColor': '#F5EEFE'
  }
});

export default function ConceptMapGenerator({ topic }: { topic: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMap() {
      if (!topic) {
        setError("No se ha proporcionado un tema para generar el mapa conceptual.");
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await getConceptMap(topic);

      if ("error" in result) {
        setError(result.error);
        setLoading(false);
      } else {
        try {
            // Ensure the graph is rendered with a unique ID to prevent conflicts
            const { svg } = await mermaid.render(`mermaid-graph-${Date.now()}`, result.mermaidGraph);
            setSvg(svg);
        } catch (e: any) {
            console.error(e);
            setError(`La sintaxis de Mermaid generada no es válida: ${e.message}`);
        } finally {
            setLoading(false);
        }
      }
    }
    loadMap();
  }, [topic]);

  if (loading) {
    return <ConceptMapSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error al Generar el Mapa Conceptual</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4 rounded-lg border bg-card">
      {svg && <div dangerouslySetInnerHTML={{ __html: svg }} />}
    </div>
  );
}

const ConceptMapSkeleton = () => (
    <div className="w-full min-h-[400px] flex items-center justify-center rounded-lg border bg-card p-4">
        <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-12 w-12 text-accent animate-spin" />
            <p className="text-muted-foreground">Generando mapa conceptual...</p>
        </div>
    </div>
)
