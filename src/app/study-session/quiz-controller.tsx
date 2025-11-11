
"use client";

import { useState, useEffect } from "react";
import { getQuiz } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderCircle, GraduationCap, Terminal } from "lucide-react";
import type { QuizQuestion, FlashcardData } from "@/lib/types";
import QuizView from "./quiz-view";

export default function QuizController({
  originalFlashcards,
  onReset,
}: {
  originalFlashcards: FlashcardData[];
  onReset: () => void;
}) {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  const handleStartQuiz = async () => {
    setLoading(true);
    setError(null);
    const result = await getQuiz(originalFlashcards);

    if ("error" in result) {
      setError(result.error);
    } else {
      setQuizQuestions(result.questions);
      setQuizStarted(true);
    }
    setLoading(false);
  };
  
  // Auto-start quiz when component is rendered
  useEffect(() => {
    if(originalFlashcards.length > 0){
        handleStartQuiz();
    }
  }, [originalFlashcards]);


  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-card h-[28rem]">
            <LoaderCircle className="h-16 w-16 text-accent animate-spin mb-4" />
            <h2 className="text-2xl font-bold font-headline">Generando tu evaluación...</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
                Esto tomará solo un momento.
            </p>
        </div>
    );
  }


  if (quizStarted && quizQuestions.length > 0) {
    return <QuizView questions={quizQuestions} onRetry={onReset} />;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-card h-[28rem]">
      <GraduationCap className="h-16 w-16 text-accent mb-4" />
      <h2 className="text-2xl font-bold font-headline">¡Hora de Evaluar!</h2>
      <p className="text-muted-foreground mt-2 max-w-sm">
        Vamos a comprobar cuánto has aprendido con una pequeña evaluación.
      </p>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error al crear la evaluación</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button onClick={handleStartQuiz} disabled={loading} size="lg">
          {loading ? (
            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
          ) : null}
          {loading ? "Generando..." : "Empezar Evaluación"}
        </Button>
      </div>
    </div>
  );
}
