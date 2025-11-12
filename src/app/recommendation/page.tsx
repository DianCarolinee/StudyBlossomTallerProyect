
"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Sparkles, Volume2, ArrowLeft, BrainCircuit, Timer, Footprints, Info, Mic, Video } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import type { StudySessionEntry } from "@/lib/types";
import { Separator } from "@/components/ui/separator";



function saveStudySession(session: Omit<StudySessionEntry, "id" | "userId">) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const historyJson = localStorage.getItem("studyHistory");
    const history = historyJson ? JSON.parse(historyJson) : [];
    
    // Check for recent duplicates to avoid double-saving on dev mode
    const now = new Date();
    const recentDuplicate = history.find((entry: StudySessionEntry) => {
        const entryDate = new Date(entry.createdAt);
        return (
            entry.goalName === session.goalName &&
            entry.topic === session.topic &&
            entry.mode === session.mode &&
            (now.getTime() - entryDate.getTime()) < 2000 // 2 seconds threshold
        );
    });

    if (recentDuplicate) {
        console.log("Duplicate session detected, skipping save.");
        return;
    }

    const newEntry: StudySessionEntry = {
      ...session,
      id: new Date().toISOString() + '-' + Math.random(),
      userId: "local", 
    };
    history.push(newEntry);
    localStorage.setItem("studyHistory", JSON.stringify(history));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}


function RecommendationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const goalName = searchParams.get("goalName") || "";
  const studyTime = parseInt(searchParams.get("studyTime") || "1", 10);
  const topic = searchParams.get("topic") || "";

  const handleModeSelection = (mode: string) => {
    saveStudySession({
      goalName,
      topic,
      studyTime,
      mode,
      createdAt: new Date(),
    });

    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", mode);
    router.push(`/study-session?${params.toString()}`);
  };

  const handlePathSelection = () => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/learning-path?${params.toString()}`);
  }

  return (
    <div className="flex flex-col min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary-foreground">
            <Logo className="h-8 w-8 text-accent" />
            <span className="font-headline">StudyBlossom</span>
          </Link>
        </div>
        <Card className="animate-in fade-in-50 zoom-in-95 duration-700 shadow-2xl shadow-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">
              ¡Elige tu Aventura de Aprendizaje!
            </CardTitle>
            <CardDescription>
              Para tu meta "{goalName || "aprender cosas nuevas"}", te sugerimos una ruta guiada o puedes elegir un método específico.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-8">
            
            {/* 5E Learning Path */}
            <div className="w-full p-6 rounded-lg bg-primary/10 border border-primary/20 text-center flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-primary">
                <Footprints className="h-6 w-6" />
                <h3 className="text-xl font-semibold font-headline text-primary-foreground">
                  Ruta de Aprendizaje Guiada (Recomendado)
                </h3>
              </div>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Un camino que te lleva desde la curiosidad inicial hasta el dominio del tema, usando un modelo pedagógico probado para un aprendizaje profundo.
              </p>
              <Button onClick={handlePathSelection} size="lg">Comenzar Ruta Guiada</Button>
            </div>

            <div className="w-full flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-muted-foreground text-sm">O</span>
                <Separator className="flex-1" />
            </div>

            {/* Specific Methods */}
              <div className="w-full text-center">
                  <div className="flex items-center gap-2 text-primary-foreground justify-center">
                      <Info className="h-6 w-6"/>
                      <h3 className="text-xl font-semibold font-headline">
                          Elige un Método Específico
                      </h3>
                  </div>
                  <p className="mt-2 text-muted-foreground">
                      Perfecto si ya sabes lo que necesitas o tienes poco tiempo.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4 w-full mt-6">
                      <Button
                          variant="outline"
                          size="lg"
                          className="h-auto p-4 flex flex-col gap-2 transition-transform hover:scale-105"
                          onClick={() => handleModeSelection("text")}
                      >
                          <Book className="h-8 w-8 text-accent"/>
                          <span className="font-bold">Texto</span>
                          <span className="text-muted-foreground text-xs">Feynman</span>
                      </Button>
                      <Button
                          variant="outline"
                          size="lg"
                          className="h-auto p-4 flex flex-col gap-2 transition-transform hover:scale-105"
                          onClick={() => handleModeSelection("visual")}
                      >
                          <Sparkles className="h-8 w-8 text-accent"/>
                          <span className="font-bold">Visual</span>
                          <span className="text-muted-foreground text-xs">Tarjetas</span>
                      </Button>
                      <Button
                          variant="outline"
                          size="lg"
                          className="h-auto p-4 flex flex-col gap-2 transition-transform hover:scale-105"
                          onClick={() => handleModeSelection("audio")}
                      >
                          <Volume2 className="h-8 w-8 text-accent"/>
                          <span className="font-bold">Audio</span>
                          <span className="text-muted-foreground text-xs">Narración</span>
                      </Button>
                      <Button
                          variant="outline"
                          size="lg"
                          className="h-auto p-4 flex flex-col gap-2 transition-transform hover:scale-105"
                          onClick={() => handleModeSelection("map")}
                      >
                          <BrainCircuit className="h-8 w-8 text-accent"/>
                          <span className="font-bold">Mapa</span>
                          <span className="text-muted-foreground text-xs">Conceptual</span>
                      </Button>
                      <Button
                          variant="outline"
                          size="lg"
                          className="h-auto p-4 flex flex-col gap-2 transition-transform hover:scale-105"
                          onClick={() => handleModeSelection("pomodoro")}
                      >
                          <Timer className="h-8 w-8 text-accent"/>
                          <span className="font-bold">Pomodoro</span>
                          <span className="text-muted-foreground text-xs">Recursos</span>
                      </Button>
                      <Button
                          variant="outline"
                          size="lg"
                          className="h-auto p-4 flex flex-col gap-2 transition-transform hover:scale-105 border-2 border-accent/50"
                          onClick={() => handleModeSelection("voice-tutor")}
                      >
                          <Mic className="h-8 w-8 text-accent"/>
                          <span className="font-bold">Tutor Voz</span>
                          <span className="text-muted-foreground text-xs">Conversacional</span>
                      </Button>
                      <Button
                          variant="outline"
                          size="lg"
                          className="h-auto p-4 flex flex-col gap-2 transition-transform hover:scale-105 border-2 border-accent/50"
                          onClick={() => handleModeSelection("video")}
                      >
                          <Video className="h-8 w-8 text-accent"/>
                          <span className="font-bold">Video</span>
                          <span className="text-muted-foreground text-xs">Educativo</span>
                      </Button>
                  </div>
              </div>

          </CardContent>
            <CardFooter className="flex justify-center pt-4">
                <Button variant="ghost" asChild>
                    <Link href="/create-goal">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Volver y editar meta
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function RecommendationPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando Recomendación...</div>}>
            <RecommendationContent/>
        </Suspense>
    );
}
