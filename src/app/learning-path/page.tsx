
"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Textarea,
} from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  LoaderCircle,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import FlashcardGenerator from "../study-session/flashcard-generator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  getAidaEngagement,
  getFeynmanExplanationAction,
  analyzeFeynmanExplanationAction,
} from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Brain, Lightbulb, Search, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Logo } from "@/components/icons";
import ConceptMapGenerator from "../study-session/concept-map-generator";
import PomodoroTimer from "../study-session/pomodoro-timer";
import PomodoroRecommendations from "../study-session/pomodoro-recommendations";
import { cn } from "@/lib/utils";
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
import type { FlashcardData } from "@/lib/types";
import QuizController from "../study-session/quiz-controller";


const STEPS = [
  { id: "inspiration", name: "Inspiración", icon: Lightbulb },
  { id: "research", name: "Investigación", icon: Search },
  { id: "explanation", name: "Explicación", icon: BookOpen },
  { id: "elaboration", name: "Práctica", icon: Brain },
  { id: "evaluation", name: "Evaluación", icon: GraduationCap },
];

const EngageStep = ({ topic, onComplete }: { topic: string, onComplete: () => void }) => {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadEngagement() {
            if (!topic) {
                setError("No se ha proporcionado un tema.");
                setLoading(false);
                return;
            }
            const result = await getAidaEngagement(topic);
            if (result && "error" in result) {
                setError(result.error);
            } else {
                setContent(result);
            }
            setLoading(false);
        }
        loadEngagement();
    }, [topic]);

    if(loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-1/3" />
                </CardContent>
            </Card>
        )
    }

    if(error) {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error al generar contenido</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }


    return (
        <Card className="w-full max-w-2xl mx-auto animate-in fade-in-50 duration-700">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl text-accent">"{content?.attention}"</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-8 text-center">
                <p className="text-lg text-muted-foreground">{content?.interest}</p>
                <div className="space-y-3 self-start w-full bg-primary/10 p-6 rounded-lg">
                    <h3 className="font-bold text-center text-primary-foreground mb-4">¿Qué ganarás al aprender esto?</h3>
                    {content?.desire.map((d: string, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-accent" />
                            <span className="text-left">{d}</span>
                        </div>
                    ))}
                </div>
                <Button onClick={onComplete} size="lg">Comenzar a Investigar</Button>
            </CardContent>
        </Card>
    )
}

function LearningPath() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentStepId, setCurrentStepId] = useState("inspiration");
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);

  const goalName = searchParams.get("goalName") || "";
  const topic = searchParams.get("topic") || "";
  
  if (!topic || !goalName) {
      router.push("/create-goal");
      return null;
  }

  const handleNextStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStepId);
    if (currentIndex < STEPS.length - 1) {
        setCurrentStepId(STEPS[currentIndex + 1].id);
    } else {
        handleFinish();
    }
  }

  const handlePracticeComplete = (generatedFlashcards: FlashcardData[]) => {
      setFlashcards(generatedFlashcards);
      handleNextStep();
  }
  
  const handleFinish = () => {
      router.push('/dashboard');
  }

  const renderContent = () => {
    switch (currentStepId) {
      case "inspiration":
        return <EngageStep topic={topic} onComplete={handleNextStep} />;
      case "research":
        return (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <PomodoroTimer />
            <PomodoroRecommendations topic={topic} />
          </div>
        );
      case "explanation":
        return <FeynmanMode topic={topic} onComplete={handleNextStep} />;
      case "elaboration":
        return <FlashcardGenerator topic={topic} onPracticeComplete={handlePracticeComplete} />;
      case "evaluation":
        if (flashcards.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-card h-[28rem]">
                    <Brain className="h-16 w-16 text-accent mb-4" />
                    <h2 className="text-2xl font-bold font-headline">Primero, la práctica</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        Completa el paso de "Práctica" para generar tarjetas antes de la evaluación.
                    </p>
                    <Button onClick={() => setCurrentStepId('elaboration')} size="lg" className="mt-6">
                        Ir a Práctica
                    </Button>
                </div>
            )
        }
        return <QuizController originalFlashcards={flashcards} onReset={handleFinish} />;
      default:
        return <p>Paso desconocido.</p>;
    }
  };

  const renderStepButton = () => {
      // These steps have their own internal completion buttons
      if (['inspiration', 'explanation', 'elaboration', 'evaluation'].includes(currentStepId)) return null;

      const currentIndex = STEPS.findIndex(s => s.id === currentStepId);
      const isLastStep = currentIndex === STEPS.length - 1;
      const nextStep = STEPS[currentIndex + 1];
      
      return (
           <Button onClick={handleNextStep} className="rounded-full">
                {isLastStep ? "Finalizar Ruta" : `Siguiente: ${nextStep.name}`}
                <ArrowRight className="ml-2"/>
            </Button>
      )
  }

  return (
    <div className="flex flex-col min-h-dvh items-center bg-background p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-2xl font-bold text-primary-foreground">
              <Logo className="h-8 w-8 text-accent" />
              <span className="font-headline">StudyBlossom</span>
          </Link>
           <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Salir de la Ruta
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que quieres salir?</AlertDialogTitle>
                    <AlertDialogDescription>
                       Perderás tu progreso en esta ruta de aprendizaje y volverás a tu panel de control.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinish}>Confirmar y Salir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </header>

        <h1 className="text-3xl font-bold text-center mb-2 font-headline">{goalName}</h1>
        <p className="text-center text-muted-foreground mb-8">
            Tema: <span className="font-semibold">{topic}</span>
        </p>

        <div className="mb-8">
            <div className="flex justify-between items-center">
                {STEPS.map((step, index) => {
                    const currentIndex = STEPS.findIndex(s => s.id === currentStepId);
                    const isActive = index === currentIndex;
                    const isCompleted = index < currentIndex;
                    const Icon = step.icon;
                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 w-20 text-center">
                             <div className={cn(
                                 "h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                 isCompleted ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border",
                                 isActive && "border-accent scale-110"
                             )}>
                                <Icon className={cn("h-6 w-6", isActive && "text-accent")} />
                             </div>
                             <span className={cn("text-xs text-muted-foreground", (isActive || isCompleted) && "font-semibold text-primary-foreground")}>{step.name}</span>
                        </div>
                    )
                })}
            </div>
        </div>

        <div className="min-h-[400px]">
            {renderContent()}
        </div>

        <div className="mt-8 text-center">
            {renderStepButton()}
        </div>
      </div>
    </div>
  );
}

const FeynmanMode = ({ topic, onComplete }: { topic: string, onComplete: () => void }) => {
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
                    <BookOpen className="h-6 w-6 text-accent"/>
                    Paso 3: Explicación (Técnica Feynman)
                </CardTitle>
                <CardDescription>Explica el concepto con tus propias palabras para dominarlo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg">Concepto Clave</h3>
                    <p className="text-muted-foreground mt-1 bg-muted p-4 rounded-md">{explanation}</p>
                </div>
                
                <div>
                    <h3 className="font-semibold text-lg">Escríbelo con tus palabras</h3>
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
                        <h3 className="font-semibold text-lg">Identifica y Mejora</h3>
                        {stage === 'analyzing' ? (
                            <div className="flex items-center gap-2 text-muted-foreground mt-2">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Analizando tu explicación...
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

                              <div className="flex gap-4 mt-4">
                                  <Button onClick={handleTryAgain} variant="outline">
                                      <RefreshCw className="mr-2 h-4 w-4"/>
                                      Intentar de nuevo
                                  </Button>
                                  <Button onClick={onComplete}>
                                      ¡Entendido! Continuar
                                  </Button>
                              </div>
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-10 w-1/4 mt-2" />
            </div>
        ))}
      </CardContent>
    </Card>
);

export default function LearningPathPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando camino de aprendizaje...</div>}>
      <LearningPath />
    </Suspense>
  );
}

    