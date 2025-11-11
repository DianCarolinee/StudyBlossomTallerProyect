"use client";

import { Badge } from "@/components/ui/badge";

interface FlashcardFeedbackProps {
  isReviewing: boolean;
  currentIndex: number;
  totalCount: number;
  notLearnedCount: number;
}

export default function FlashcardFeedback({
  isReviewing,
  currentIndex,
  totalCount,
  notLearnedCount
}: FlashcardFeedbackProps) {
  return (
    <div className="flex justify-center items-center gap-4 text-center">
        {isReviewing ? (
            <Badge variant="secondary">Modo Repaso</Badge>
        ) : (
             <Badge variant="default">Ronda Principal</Badge>
        )}
      <p className="text-sm font-medium text-muted-foreground">
        Tarjeta {currentIndex + 1} de {totalCount}
      </p>
      {!isReviewing && notLearnedCount > 0 && (
         <p className="text-sm font-medium text-muted-foreground">
            ({notLearnedCount} para repasar)
        </p>
      )}
    </div>
  );
}
