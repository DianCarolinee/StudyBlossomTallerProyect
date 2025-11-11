
"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getFlashcards } from "@/app/actions";
import { Flashcard } from "./flashcard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, PartyPopper, Sparkles } from "lucide-react";
import FlashcardFeedback from "./flashcard-feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { FlashcardData } from "@/lib/types";


const FlashcardSkeleton = () => (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
        <div className="flex justify-center items-center gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
        </div>
        <div className="relative">
            <Skeleton className="h-[28rem] w-full rounded-xl" />
        </div>
    </div>
);


export default function FlashcardGenerator({ 
    topic,
    onPracticeComplete,
}: { 
    topic: string,
    onPracticeComplete?: (flashcards: FlashcardData[]) => void,
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [initialFlashcards, setInitialFlashcards] = useState<FlashcardData[]>([]);
  const [allFlashcards, setAllFlashcards] = useState<FlashcardData[]>([]);
  const [notLearnedPile, setNotLearnedPile] = useState<FlashcardData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [practiceFinished, setPracticeFinished] = useState(false);

  const currentFlashcards = useMemo(() => {
    return isReviewing ? notLearnedPile : allFlashcards;
  }, [isReviewing, notLearnedPile, allFlashcards]);

  const loadInitialFlashcards = useCallback(async () => {
    setStarted(true);
    setPracticeFinished(false);
    setLoading(true);
    setError(null);
    if (!topic) {
      setError("No se ha proporcionado un tema para generar las tarjetas.");
      setLoading(false);
      return;
    }
    const result = await getFlashcards(topic);
    if ("error" in result) {
      setError(result.error);
    } else {
      const flashcards = result.flashcards as FlashcardData[];
      setInitialFlashcards(flashcards);
      setAllFlashcards(flashcards);
      setNotLearnedPile([]);
      setIsReviewing(false);
      api?.scrollTo(0);
    }
    setLoading(false);
  }, [topic, api]);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect(); // Set initial index

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleCardReview = (card: FlashcardData, learned: boolean) => {
    if (api?.scrollNext) {
        api.scrollNext();
    }

    if (!learned) {
      setNotLearnedPile((prev) => [...prev, card]);
    }

    // Remove the card from the current pile
    if (isReviewing) {
        setNotLearnedPile(prev => prev.filter(c => c.question !== card.question));
    } else {
        setAllFlashcards(prev => prev.filter(c => c.question !== card.question));
    }
  };
  
  useEffect(() => {
    // If main pile is empty, start review session if there are cards to review
    if (started && allFlashcards.length === 0 && notLearnedPile.length > 0 && !isReviewing) {
        setIsReviewing(true);
        api?.scrollTo(0);
    }
    
    // If both piles are empty, the practice is finished
    if (started && allFlashcards.length === 0 && notLearnedPile.length === 0 && !loading) {
        setPracticeFinished(true);
        if (onPracticeComplete) {
            onPracticeComplete(initialFlashcards);
        }
    }
  }, [allFlashcards, notLearnedPile, isReviewing, started, loading, api, onPracticeComplete, initialFlashcards]);

  if (!started) {
      return (
          <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-card h-[28rem]">
              <Sparkles className="h-16 w-16 text-accent mb-4" />
              <h2 className="text-2xl font-bold font-headline">Crea tus tarjetas de estudio</h2>
              <p className="text-muted-foreground mt-2 max-w-sm">
                  Pulsa el botón para que la IA genere tarjetas visuales sobre "{topic}".
              </p>
              <Button onClick={loadInitialFlashcards} size="lg" className="mt-6">
                  Generar Tarjetas
              </Button>
          </div>
      )
  }

  if (loading) {
    return <FlashcardSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error al Generar las Tarjetas</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
         <Button onClick={loadInitialFlashcards} variant="secondary" className="mt-4">
          Volver a intentar
        </Button>
      </Alert>
    );
  }

  if (practiceFinished) {
     return (
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-card h-[28rem]">
          <PartyPopper className="h-16 w-16 text-accent mb-4" />
          <h2 className="text-2xl font-bold font-headline">¡Práctica completada!</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Has repasado todas las tarjetas. ¡Preparando tu evaluación!
          </p>
        </div>
      );
  }


  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
      <FlashcardFeedback
        isReviewing={isReviewing}
        currentIndex={currentIndex}
        totalCount={currentFlashcards.length}
        notLearnedCount={notLearnedPile.length}
      />
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {currentFlashcards.map((card, index) => (
            <CarouselItem key={index}>
              <Flashcard
                question={card.question}
                answer={card.answer}
                onReview={(learned) => handleCardReview(card, learned)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

    