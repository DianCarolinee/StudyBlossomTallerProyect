

"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Volume2, LoaderCircle, ArrowLeft, RefreshCw, Search, Lightbulb } from "lucide-react";
import FlashcardGenerator from "./flashcard-generator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getAudio, getFeynmanExplanationAction, analyzeFeynmanExplanationAction } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Logo } from "@/components/icons";
import ConceptMapGenerator from "./concept-map-generator";
import PomodoroTimer from "./pomodoro-timer";
import PomodoroRecommendations from "./pomodoro-recommendations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { FeynmanAnalysisOutput } from "@/ai/flows/generate-feynman-explanation-flow";


const FeynmanMode = ({ topic }: { topic: string }) => {
  const [explanation, setExplanation] = useState<string>("");
  const [userExplanation, setUserExplanation] = useState<string>("");
  const [feedback, setFeedback] = useState<FeynmanAnalysisOutput | null>(null);
  const [stage, setStage] = useState<"loading" | "explaining" | "analyzing" | "feedback" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialExplanation() {
      if (!topic) {
        setError("No se ha proporcionado un tema.");
        setStage("error");
        return;
      }
      const result = await getFeynmanExplanationAction(topic);
      if (result && "error" in result) {
        setError(result.error);
        setStage("error");
      } else if (result) {
        setExplanation(result.explanation);
        setStage("explaining");
      }
    }
    loadInitialExplanation();
  }, [topic]);
  
  const handleAnalyze = async () => {
    setStage("analyzing");
    const result = await analyzeFeynmanExplanationAction(topic, userExplanation);
     if (result && "error" in result) {
        setError(result.error);
        setStage("error");
      } else if (result) {
        setFeedback(result);
        setStage("feedback");
      }
  }

  const handleTryAgain = () => {
    setStage("explaining");
    // We keep the user's explanation so they can edit it
  }

  if (stage === "loading") {
    return <FeynmanSkeleton />;
  }

  if (stage === "error") {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error al aplicar la técnica Feynman</AlertTitle>
        <AlertDescription>{error || "Ocurrió un error inesperado."}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex justify-center">
        <Card className="w-full max-w-3xl">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Brain className="h-6 w-6 text-accent"/>
                Técnica Feynman: {topic}
            </CardTitle>
            <CardDescription>Explica un concepto con tus propias palabras para dominarlo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
            <h3 className="font-semibold text-lg">Paso 1: Concepto Clave</h3>
            <p className="text-muted-foreground mt-1 bg-muted p-4 rounded-md">{explanation}</p>
            </div>
            
            <div>
                <h3 className="font-semibold text-lg">Paso 2: Explícalo con tus palabras</h3>
                <p className="text-muted-foreground mt-1 mb-2">Imagina que se lo estás enseñando a un principiante. Sé simple y claro.</p>
                <Textarea 
                    placeholder="Escribe aquí tu explicación..." 
                    value={userExplanation}
                    onChange={(e) => setUserExplanation(e.target.value)}
                    rows={6}
                    disabled={stage !== 'explaining'}
                />
                <Button onClick={handleAnalyze} disabled={stage !== 'explaining' || !userExplanation.trim()} className="mt-4">
                    Analizar mi explicación
                </Button>
            </div>
            
            {(stage === 'analyzing' || stage === 'feedback') && (
                <div className="animate-in fade-in-50 duration-500">
                    <h3 className="font-semibold text-lg">Paso 3: Identifica y Mejora</h3>
                    {stage === 'analyzing' ? (
                        <div className="flex items-center gap-2 text-muted-foreground mt-2">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Analizando tu explicación para encontrar áreas de mejora...
                        </div>
                    ) : feedback && (
                        <div className="mt-2 space-y-4">
                             <div className="bg-accent/10 border border-accent/20 p-4 rounded-md">
                                <h4 className="font-semibold flex items-center gap-2"><Search className="h-5 w-5 text-accent"/> Brechas de Conocimiento</h4>
                                <p className="text-muted-foreground whitespace-pre-line mt-1">{feedback.gaps}</p>
                            </div>
                            <div className="bg-primary/10 border border-primary/20 p-4 rounded-md">
                                <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary"/> Sugerencias de Simplificación</h4>
                                <p className="text-muted-foreground whitespace-pre-line mt-1">{feedback.simplifications}</p>
                            </div>
                            <Button onClick={handleTryAgain} variant="outline" className="mt-4">
                                <RefreshCw className="mr-2 h-4 w-4"/>
                                Intentar de nuevo
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </CardContent>
        </Card>
    </div>
  );
};

const FeynmanSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-12 w-full" />
            </div>
        ))}
      </CardContent>
    </Card>
);

const AudioMode = ({ topic }: { topic: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlay = async () => {
    if (audioSrc) {
      audioRef.current?.play();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    const explanationResult = await getFeynmanExplanationAction(topic);

    if (explanationResult && "error" in explanationResult) {
      setError(explanationResult.error);
      setIsLoading(false);
      return;
    }

    const fullText = `Aquí tienes una explicación sencilla sobre ${topic}, aplicando la técnica Feynman: ${explanationResult.explanation}`;

    const audioResult = await getAudio(fullText);
    setIsLoading(false);

    if ("error" in audioResult) {
      setError(audioResult.error);
    } else {
      setAudioSrc(audioResult.media);
    }
  };
  
  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };
  
  const handleStop = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.play();
      setIsPlaying(true);
      
      const onEnded = () => setIsPlaying(false);
      audioRef.current.addEventListener('ended', onEnded);
      
      return () => {
        audioRef.current?.removeEventListener('ended', onEnded);
      }
    }
  }, [audioSrc]);

  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center min-h-96">
      <CardHeader>
        <CardTitle className="font-headline">Guía de Audio para {topic}</CardTitle>
        <CardDescription>Escucha los pasos para aprender sobre tu tema.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        {isLoading ? (
          <LoaderCircle className="h-16 w-16 text-accent animate-spin" />
        ) : (
          <Volume2 className="h-16 w-16 text-accent" />
        )}
        {error && (
            <Alert variant="destructive" className="mt-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error al Generar el Audio</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <div className="flex items-center gap-4 mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={isLoading}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleStop} disabled={isLoading || !audioSrc}>
            <Square className="h-6 w-6" />
          </Button>
        </div>
        <audio ref={audioRef} />
      </CardContent>
    </Card>
  );
};


function StudySession() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const goalName = searchParams.get("goalName") || "";
  const topic = searchParams.get("topic") || "";
  const mode = searchParams.get("mode") || "";

  const handleFinish = () => {
    router.push("/dashboard");
  };
  
  const handleBack = () => {
    router.back();
  }

  const renderContent = () => {
    switch (mode) {
      case "text":
        return <FeynmanMode topic={topic} />;
      case "visual":
        return <FlashcardGenerator topic={topic} />;
      case "audio":
        return <AudioMode topic={topic} />;
      case "map":
        return <ConceptMapGenerator topic={topic} />;
      case "pomodoro":
        return (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <PomodoroTimer />
            <PomodoroRecommendations topic={topic} />
          </div>
        );
      default:
        return <p>Por favor, selecciona un modo de estudio en la página anterior.</p>;
    }
  };

  return (
    <div className="flex flex-col min-h-dvh items-center bg-background p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary-foreground">
                <Logo className="h-8 w-8 text-accent" />
                <span className="font-headline">StudyBlossom</span>
            </div>
            <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cambiar Modo
            </Button>
        </header>

        <h1 className="text-3xl font-bold text-center mb-2 font-headline">
          {goalName}
        </h1>
        <p className="text-center text-muted-foreground mb-6">
            Tema: <span className="font-semibold">{topic}</span>
        </p>

        {renderContent()}

        <div className="mt-8 text-center">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="rounded-full">Finalizar Sesión</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que quieres finalizar?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tu progreso en esta sesión se guardará en tu historial.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinish}>Confirmar y Salir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
    </div>
  );
}

export default function StudySessionPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando sesión de estudio...</div>}>
      <StudySession />
    </Suspense>
  );
}
