
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface QuizResultsProps {
  score: number;
  questions: QuizQuestion[];
  userAnswers: (string | null)[];
  onRetry: () => void;
  onStartNewQuiz: () => void;
}

export default function QuizResults({
  score,
  questions,
  userAnswers,
  onRetry,
  onStartNewQuiz,
}: QuizResultsProps) {
  return (
    <Card className="w-full">
      <CardHeader className="items-center text-center">
        <CardTitle className="font-headline text-3xl">Resultados de la Evaluación</CardTitle>
        <CardDescription>
          ¡Has completado el quiz! Aquí está tu desempeño.
        </CardDescription>
        <div className="pt-4">
          <p className="text-4xl font-bold text-primary">
            {score} / {questions.length}
          </p>
          <p className="text-muted-foreground">Respuestas Correctas</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {questions.map((q, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div
                key={index}
                className="p-4 rounded-lg border bg-background"
              >
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-lg flex-1">
                    {index + 1}. {q.question}
                  </p>
                  {isCorrect ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Correcto
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                      <XCircle className="mr-1 h-4 w-4" /> Incorrecto
                    </Badge>
                  )}
                </div>
                <div className="mt-4 text-sm space-y-2">
                  <p>
                    Tu respuesta:{" "}
                    <span
                      className={
                        isCorrect
                          ? "font-semibold text-green-700"
                          : "font-semibold text-red-700"
                      }
                    >
                      {userAnswer || "No respondida"}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p>
                      Respuesta correcta:{" "}
                      <span className="font-semibold text-green-700">
                        {q.correctAnswer}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="justify-center gap-4 pt-6">
        <Button variant="outline" onClick={onRetry}>
          Volver a Intentar
        </Button>
        <Button onClick={onStartNewQuiz}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Nuevo Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}
