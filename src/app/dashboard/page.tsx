
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar, NavbarSkeleton } from "@/components/ui/navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Droplets, Star, History, LoaderCircle } from "lucide-react";
import type { StudySessionEntry } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Plant } from "@/components/ui/plant";

const XP_MAP: { [key: string]: number } = {
  text: 5,
  visual: 10,
  audio: 5,
  map: 15,
  pomodoro: 20,
  inspiration: 2,
  research: 8,
  explanation: 10,
  elaboration: 15,
  evaluation: 20,
  'voice-tutor': 25,  // NUEVO: Mayor XP por ser interactivo
  'video': 15,        // NUEVO: XP por generar contenido
};

const LEVELS = [
  { level: 1, xpThreshold: 0, name: "Semilla", stage: 1 },
  { level: 2, xpThreshold: 50, name: "Brote", stage: 2 },
  { level: 3, xpThreshold: 120, name: "Tallo Joven", stage: 3 },
  { level: 4, xpThreshold: 250, name: "Planta Fuerte", stage: 4 },
  { level: 5, xpThreshold: 500, name: "Floración", stage: 5 },
  { level: 6, xpThreshold: 1000, name: "Árbol Sabio", stage: 6 },
];

function getStudyHistory(): StudySessionEntry[] {
    if (typeof window === "undefined") return [];
    try {
        const historyJson = localStorage.getItem("studyHistory");
        if (!historyJson) return [];
        const history = JSON.parse(historyJson) as StudySessionEntry[];
        return history.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (error) {
        console.error("Error reading history from localStorage:", error);
        return [];
    }
}

function calculateStats(history: StudySessionEntry[]) {
    if (history.length === 0) {
        return { totalSessions: 0, streak: 0, xp: 0 };
    }

    // Calculate XP
    const xp = history.reduce((acc, entry) => acc + (XP_MAP[entry.mode] || 5), 0);

    // Calculate Streak
    const uniqueDays = [...new Set(history.map(entry => new Date(entry.createdAt).toDateString()))]
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    if (uniqueDays.length > 0) {
        const today = new Date();
        const todayStr = today.toDateString();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        let lastDate = new Date(uniqueDays[0]);

        // Check if the last session was today or yesterday
        if (lastDate.toDateString() === todayStr || lastDate.toDateString() === yesterday.toDateString()) {
            streak = 1;
            for (let i = 1; i < uniqueDays.length; i++) {
                const currentDate = new Date(uniqueDays[i-1]);
                const previousDate = new Date(uniqueDays[i]);
                const diffTime = currentDate.getTime() - previousDate.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    streak++;
                } else {
                    break;
                }
            }
        }
    }


    return {
        totalSessions: history.length,
        streak,
        xp
    };
}


function DashboardContent() {
  const [stats, setStats] = useState({ totalSessions: 0, streak: 0, xp: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const history = getStudyHistory();
    setStats(calculateStats(history));
    setLoading(false);
  }, []);

  const currentLevel = useMemo(() => {
    return [...LEVELS].reverse().find(l => stats.xp >= l.xpThreshold) || LEVELS[0];
  }, [stats.xp]);

  const nextLevel = useMemo(() => {
    return LEVELS.find(l => l.level === currentLevel.level + 1);
  }, [currentLevel]);
  
  const progressToNextLevel = useMemo(() => {
    if (!nextLevel) return 100;
    const levelXpRange = nextLevel.xpThreshold - currentLevel.xpThreshold;
    const currentXpInLevel = stats.xp - currentLevel.xpThreshold;
    return Math.round((currentXpInLevel / levelXpRange) * 100);
  }, [stats.xp, currentLevel, nextLevel]);

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-grid-pattern bg-cover bg-center">
      <Navbar />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Plant Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 h-full">
              <CardHeader>
                <CardTitle className="font-headline text-3xl text-primary">
                  Tu Jardín de Conocimiento
                </CardTitle>
                <CardDescription>
                  Cada sesión de estudio riega tu planta. ¡Mira cómo crece!
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row items-center justify-around gap-8">
                <div className="flex flex-col items-center">
                    <Plant stage={currentLevel.stage} className="w-48 h-48 md:w-64 md:h-64" />
                    <p className="font-bold text-xl mt-2 text-primary-foreground">{currentLevel.name}</p>
                    <p className="text-muted-foreground">Nivel {currentLevel.level}</p>
                </div>
                 <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-center mb-2">Progreso al siguiente nivel</p>
                    <Progress value={progressToNextLevel} className="h-4" />
                    {nextLevel ? (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                           {stats.xp} / {nextLevel.xpThreshold} XP para alcanzar "{nextLevel.name}"
                        </p>
                    ) : (
                         <p className="text-xs text-muted-foreground text-center mt-2">
                           ¡Has alcanzado el nivel máximo!
                        </p>
                    )}
                    <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform mt-8 self-center">
                        <Link href="/create-goal">
                            <Plus className="mr-2" />
                            Plantar Nueva Semilla
                        </Link>
                    </Button>
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Puntos de Experiencia</CardTitle>
                    <Star className="h-5 w-5 text-yellow-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.xp}</div>
                    <p className="text-xs text-muted-foreground">Ganas XP con cada sesión.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Racha de Estudio</CardTitle>
                    <Droplets className="h-5 w-5 text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.streak} días</div>
                    <p className="text-xs text-muted-foreground">¡Sigue así y no rompas la racha!</p>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Sesiones Totales</CardTitle>
                    <History className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.totalSessions}</div>
                    <p className="text-xs text-muted-foreground">
                        <Link href="/history" className="hover:underline">Ver tu historial de estudio</Link>
                    </p>
                </CardContent>
              </Card>
          </div>

        </div>
      </main>
    </div>
  );
}


export default function DashboardPage() {
    return (
        <DashboardContent />
    )
}

    