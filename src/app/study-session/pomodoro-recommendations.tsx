
"use client";

import { useState, useEffect } from "react";
import { getPomodoroRecommendations } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, LoaderCircle, Terminal } from "lucide-react";


interface Source {
    title: string;
    url: string;
    type: 'video' | 'article' | 'book' | 'documentation';
}

interface Recommendation {
    subTopic: string;
    sources: Source[];
}

const typeLabels: Record<Source['type'], string> = {
    video: 'Video',
    article: 'Artículo',
    book: 'Libro',
    documentation: 'Documentación'
}


export default function PomodoroRecommendations({ topic }: { topic: string }) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadRecommendations() {
            if (!topic) {
                setError("No topic provided to generate recommendations.");
                setLoading(false);
                return;
            }
            setLoading(true);
            const result = await getPomodoroRecommendations(topic);
            
            if (result && "error" in result) {
                setError(result.error);
            } else if (result) {
                setRecommendations(result.recommendations);
            }
            setLoading(false);
        }
        loadRecommendations();
    }, [topic]);

    if (loading) {
        return <RecommendationsSkeleton />;
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recomendaciones de Estudio</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error al generar recomendaciones</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recomendaciones de Estudio</CardTitle>
                <CardDescription>
                    Aquí tienes algunos temas y recursos para profundizar durante tus sesiones de estudio.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {recommendations.map((rec, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="font-semibold">{rec.subTopic}</AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-3">
                                    {rec.sources.map((source, sIndex) => (
                                        <li key={sIndex} className="flex items-center gap-3">
                                            <Link className="h-5 w-5 text-accent" />
                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex-1">
                                                {source.title}
                                            </a>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{typeLabels[source.type]}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}


const RecommendationsSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="h-8 w-full" />
                </div>
            ))}
        </CardContent>
    </Card>
)
