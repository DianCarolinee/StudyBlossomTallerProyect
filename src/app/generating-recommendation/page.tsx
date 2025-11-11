
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Lightbulb } from "lucide-react";

function GeneratingRecommendationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      router.push(`/recommendation?${params.toString()}`);
    }, 5000); // Increased delay to read the story

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="flex flex-col min-h-dvh items-center justify-center bg-background p-4 text-center overflow-hidden">
        <div className="relative w-full max-w-2xl animate-in fade-in-0 zoom-in-95 duration-1000">
            <div className="absolute -top-16 -right-16 h-48 w-48 bg-accent/10 rounded-full blur-3xl animate-float-down" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 bg-primary/10 rounded-full blur-3xl animate-float-up" />

            <div className="z-10 flex flex-col items-center gap-4 relative">
                <Lightbulb className="h-12 w-12 text-accent" />
                <h1 className="text-3xl font-bold font-headline text-primary-foreground">
                    "No he fracasado. Simplemente he encontrado 1.000 maneras de cómo no hacer una bombilla."
                </h1>
                <p className="text-lg text-muted-foreground font-medium">
                    - Thomas A. Edison
                </p>
                <div className="mt-6 flex flex-col items-center gap-2">
                    <LoaderCircle className="h-6 w-6 text-primary animate-spin" />
                    <p className="text-muted-foreground">
                        Buscando las mejores maneras para que tú lo logres...
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}

export default function GeneratingRecommendationPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <GeneratingRecommendationContent />
        </Suspense>
    )
}
