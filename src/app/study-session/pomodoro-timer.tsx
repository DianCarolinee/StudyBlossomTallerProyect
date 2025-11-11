
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

const motivationalQuotes = [
    "La disciplina es el puente entre las metas y los logros.",
    "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    "Cree en ti mismo y todo lo que eres. Eres más fuerte de lo que crees.",
    "El secreto para salir adelante es empezar.",
    "No te detengas hasta que estés orgulloso.",
    "Cada logro comienza con la decisión de intentarlo.",
    "Convierte tus 'no puedo' en 'sí puedo'.",
];

export default function PomodoroTimer() {
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentQuote = useMemo(() => {
    // Show a new quote at the start of each work session (even the first one)
    return motivationalQuotes[cycles % motivationalQuotes.length];
  }, [cycles]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((seconds) => seconds - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      // Play sound
      if (typeof window !== "undefined") {
        const audio = new Audio("/notification.mp3");
        audio.play();
      }

      if (isWorkSession) {
        // Switch to break
        setIsWorkSession(false);
        setSecondsLeft(BREAK_MINUTES * 60);
        setCycles(cycles + 1);
      } else {
        // Switch to work
        setIsWorkSession(true);
        setSecondsLeft(WORK_MINUTES * 60);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, isWorkSession, cycles]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsWorkSession(true);
    setSecondsLeft(WORK_MINUTES * 60);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const totalDuration = (isWorkSession ? WORK_MINUTES : BREAK_MINUTES) * 60;
  const progress = ((totalDuration - secondsLeft) / totalDuration) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="w-full text-center">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Temporizador Pomodoro
        </CardTitle>
        <CardDescription>
          {isWorkSession
            ? "¡A concentrarse! Es hora de estudiar."
            : "¡Buen trabajo! Tómate un breve descanso."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8 p-8">
        <div className="relative h-64 w-64">
          <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="hsl(var(--accent))"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-1000 ease-linear",
                isActive && "animate-pulse-slow"
              )}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              className={cn(
                "text-6xl font-bold font-mono",
                isWorkSession ? "text-primary-foreground" : "text-accent-foreground"
              )}
            >
              {formatTime(secondsLeft)}
            </p>
            <p className="text-lg text-muted-foreground mt-2">
              {isWorkSession ? "Trabajo" : "Descanso"}
            </p>
          </div>
        </div>

        <div className="min-h-[4rem] flex items-center justify-center">
             {isWorkSession && (
                <p className="text-muted-foreground italic text-center animate-in fade-in duration-500">
                    "{currentQuote}"
                </p>
            )}
        </div>

        <div className="flex items-center gap-4">
          <Button size="lg" onClick={toggleTimer} className="w-32">
            {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isActive ? "Pausar" : "Comenzar"}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={resetTimer}
            aria-label="Reset Timer"
          >
            <RotateCcw />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Ciclos completados: {cycles}</p>
      </CardContent>
    </Card>
  );
}
