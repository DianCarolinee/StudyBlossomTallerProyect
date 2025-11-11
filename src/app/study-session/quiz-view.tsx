"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import QuizResults from "./quiz-results";
import type { QuizQuestion } from "@/lib/types";

export default function QuizView({
  questions,
  onRetry,
}: {
  questions: QuizQuestion[];
  onRetry: () => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    // Save answer and check if correct
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    const newUserAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newUserAnswers);

    // Reset selection
    setSelectedAnswer(null);

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleStartNewQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setIsFinished(false);
    setScore(0);
  }

  if (isFinished) {
    return <QuizResults score={score} questions={questions} userAnswers={userAnswers} onRetry={onRetry} onStartNewQuiz={handleStartNewQuiz}/>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-center">
          Evaluación Rápida
        </CardTitle>
        <div className="pt-4">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center mt-2">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold text-center mb-6">
          {currentQuestion.question}
        </p>
        <RadioGroup
          value={selectedAnswer ?? ""}
          onValueChange={setSelectedAnswer}
          className="space-y-4"
        >
          {currentQuestion.options.map((option, index) => (
            <Label
              key={index}
              htmlFor={`option-${index}`}
              className="flex items-center gap-4 p-4 rounded-lg border border-input cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:bg-primary/10 has-[[data-state=checked]]:border-primary"
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              {option}
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleNext} disabled={!selectedAnswer}>
          {currentQuestionIndex < questions.length - 1
            ? "Siguiente"
            : "Finalizar"}
        </Button>
      </CardFooter>
    </Card>
  );
}
