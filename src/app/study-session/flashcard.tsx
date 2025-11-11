
"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Flashcard({
  question,
  answer,
  onReview,
}: {
  question: string;
  answer: string;
  onReview: (learned: boolean) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const handleReviewClick = (e: React.MouseEvent, learned: boolean) => {
    e.stopPropagation();
    onReview(learned);
    setTimeout(() => {
        setIsFlipped(false);
    }, 400); // Delay flipping back to show the animation
  }

  return (
    <div
      className="perspective-1000 w-full h-[28rem] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          "relative w-full h-full transform-style-3d transition-transform duration-700",
          { "rotate-y-180": isFlipped }
        )}
      >
        {/* Front of the card */}
        <Card className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-6 text-center bg-card shadow-xl border-primary/20">
          <CardContent className="flex flex-col items-center justify-center gap-6">
            <div className="flex items-center gap-3 text-primary-foreground/80">
              <HelpCircle className="h-6 w-6" />
              <p className="font-semibold tracking-widest uppercase">Pregunta</p>
            </div>
            <p className="text-3xl font-bold font-headline">{question}</p>
          </CardContent>
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-6 text-muted-foreground"
            onClick={handleFlip}
          >
            Toca para ver la respuesta
          </Button>
        </Card>

        {/* Back of the card */}
        <Card className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col items-center justify-between p-6 text-center bg-card shadow-xl border-accent/20">
            <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 text-muted-foreground"
                onClick={handleFlip}
            >
                <RefreshCw className="mr-2 h-4 w-4" />
                Volver a la pregunta
            </Button>
          <CardContent className="flex flex-col items-center justify-center gap-6 mt-12">
             <div className="flex items-center gap-3 text-accent-foreground/80">
              <p className="font-semibold tracking-widest uppercase">Respuesta</p>
            </div>
            <p className="text-2xl font-bold font-headline">{answer}</p>
          </CardContent>
          <div className="flex flex-col items-center gap-4 w-full">
            <p className="font-semibold text-muted-foreground">¿Lo has aprendido?</p>
            <div className="flex justify-center gap-4 w-full">
                <Button variant="outline" size="lg" className="flex-1 bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 hover:text-red-700" onClick={(e) => handleReviewClick(e, false)}>
                    <XCircle className="h-6 w-6 mr-2"/>
                    No
                </Button>
                <Button variant="outline" size="lg" className="flex-1 bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 hover:text-green-700" onClick={(e) => handleReviewClick(e, true)}>
                    <CheckCircle className="h-6 w-6 mr-2"/>
                    Sí
                </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
