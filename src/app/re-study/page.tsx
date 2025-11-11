
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/icons";
import { LoaderCircle } from "lucide-react";

function ReStudyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      router.push(`/study-session?${params.toString()}`);
    }, 2000); // 2-second delay for the animation

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="flex flex-col min-h-dvh items-center justify-center bg-background p-4 text-center overflow-hidden text-primary-foreground">
        <div className="flex items-center gap-2 text-2xl font-bold mb-4">
            <Logo className="h-8 w-8 text-accent" />
            <span className="font-headline">StudyBlossom</span>
        </div>
        
        <LoaderCircle className="h-12 w-12 text-accent animate-spin my-4" />

        <h1 className="text-2xl font-bold font-headline mt-4">
            Llevándote a tu espacio de estudio...
        </h1>
        <p className="text-muted-foreground max-w-sm">
            ¡Prepárate para aprender!
        </p>
    </div>
  );
}

export default function ReStudyPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ReStudyContent />
        </Suspense>
    )
}
