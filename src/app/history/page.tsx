
"use client";

import { useEffect, useState } from "react";
import type { StudySessionEntry } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Book, Sparkles, Volume2, Repeat, LoaderCircle, Trash2, BrainCircuit, Timer } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Logo } from "@/components/icons";
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


const modeIcons: { [key: string]: React.ReactElement } = {
  text: <Book className="h-5 w-5" />,
  visual: <Sparkles className="h-5 w-5" />,
  audio: <Volume2 className="h-5 w-5" />,
  map: <BrainCircuit className="h-5 w-5" />,
  pomodoro: <Timer className="h-5 w-5" />,
};

const modeLabels: { [key: string]: string } = {
    text: "Texto",
    visual: "Tarjetas",
    audio: "Audio",
    map: "Mapa",
    pomodoro: "Pomodoro",
}

function getStudyHistory(): StudySessionEntry[] {
    if (typeof window === "undefined") {
        return [];
    }
    try {
        const historyJson = localStorage.getItem("studyHistory");
        if (!historyJson) {
            return [];
        }
        // Parse and sort history so newest entries are first
        const history = JSON.parse(historyJson) as StudySessionEntry[];
        return history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Error reading history from localStorage:", error);
        return [];
    }
}


export default function HistoryPage() {
    const [history, setHistory] = useState<StudySessionEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHistory(getStudyHistory());
        setLoading(false);
    }, [])

    const handleDelete = (id: string) => {
        try {
            const currentHistory = getStudyHistory();
            const updatedHistory = currentHistory.filter(entry => entry.id !== id);
            localStorage.setItem("studyHistory", JSON.stringify(updatedHistory));
            setHistory(updatedHistory);
        } catch (error) {
            console.error("Error deleting from localStorage:", error);
        }
    };


  return (
    <div className="flex flex-col min-h-dvh items-center bg-background p-4 md:p-8">
      <div className="w-full max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary-foreground">
                <Logo className="h-8 w-8 text-accent" />
                <span className="font-headline">StudyBlossom</span>
            </div>
            <Button variant="outline" asChild>
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Panel
                </Link>
            </Button>
        </header>

        <h1 className="text-3xl font-bold font-headline text-center mb-6">
          Tu Historial de Estudio
        </h1>

        {loading ? (
            <div className="flex justify-center items-center h-64">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : history.length === 0 ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>¡Tu historial está vacío!</CardTitle>
              <CardDescription>
                Cuando completes una sesión de estudio, aparecerá aquí.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/create-goal">Crear una nueva meta</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => {
              const params = new URLSearchParams({
                goalName: entry.goalName,
                studyTime: entry.studyTime.toString(),
                topic: entry.topic,
                mode: entry.mode,
              });

              return (
                <Card key={`${entry.id}-${index}`}>
                    <div className="flex justify-between items-start p-6">
                        <div className="flex-1">
                            <CardTitle className="text-xl">{entry.goalName}</CardTitle>
                            <CardDescription className="mt-1">
                                Tema: <strong>{entry.topic}</strong>
                            </CardDescription>
                             <div className="flex flex-col gap-2 mt-4">
                                <Badge variant="secondary" className="w-fit">
                                    {format(new Date(entry.createdAt), "PPPp", { locale: es })}
                                </Badge>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {modeIcons[entry.mode]}
                                    <span>Modo: {modeLabels[entry.mode] || entry.mode}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button asChild variant="ghost" size="sm">
                                <Link href={`/re-study?${params.toString()}`}>
                                   <Repeat className="mr-2 h-4 w-4" />
                                   Volver a estudiar
                                </Link>
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente esta sesión de estudio de tu historial.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => handleDelete(entry.id)}
                                    >
                                        Eliminar
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
