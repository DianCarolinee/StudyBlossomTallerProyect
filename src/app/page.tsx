
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Brain, MoveRight, Target, Edit, Sparkles, GraduationCap, Lightbulb } from "lucide-react";
import { Logo } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";

const BenefitCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm transition-transform duration-300 hover:scale-105 hover:bg-card/95">
        <div className="mb-4 text-primary">{icon}</div>
        <h3 className="text-xl font-bold font-headline mb-2 text-card-foreground">{title}</h3>
        <p className="text-muted-foreground">{children}</p>
    </div>
);

const HowItWorksStep = ({
    icon,
    step,
    title,
    children,
} : {
    icon: React.ReactNode;
    step: string;
    title: string;
    children: React.ReactNode;
}) => (
    <div className="text-center flex flex-col items-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary border-2 border-primary/20 mb-4">
            {icon}
        </div>
        <span className="text-sm font-bold text-primary uppercase tracking-widest">{step}</span>
        <h3 className="text-2xl font-bold font-headline mt-4 mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-sm">{children}</p>
    </div>
)


export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <header className="p-4 sm:p-6 flex justify-between items-center z-10 container mx-auto">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-headline">StudyBlossom</span>
        </div>
        <div>
          {loading ? null : user ? (
            <Button asChild>
              <Link href="/dashboard">Ir a mi Jardín</Link>
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild className="shadow-lg shadow-primary/20">
                <Link href="/signup">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1">
        <section className="text-center py-20 md:py-32 relative overflow-hidden">
            <div className="container mx-auto relative">
                <div className="relative inline-block">
                    <BookOpen className="h-10 w-10 text-accent/50 absolute -top-8 -left-16 opacity-50 animate-float-1" />
                    <Brain className="h-12 w-12 text-primary/50 absolute top-16 -right-24 opacity-50 animate-float-2" />
                    <Lightbulb className="h-10 w-10 text-accent/50 absolute -bottom-12 -right-12 opacity-50 animate-float-3" />
                    <GraduationCap className="h-12 w-12 text-primary/50 absolute bottom-0 -left-24 opacity-50 animate-float-4" />
                    
                    <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight animate-gradient-text">
                        Siembra una meta, cosecha conocimiento.
                    </h1>
                </div>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                Convierte cualquier tema en una aventura de aprendizaje. Nuestra IA diseña un plan de estudios personalizado para ti, utilizando las técnicas más efectivas.
                </p>
                <div className="mt-10 flex gap-4 justify-center">
                <Button
                    asChild
                    size="lg"
                    className="rounded-full font-bold text-lg px-8 py-6 transition-transform hover:scale-105 shadow-lg shadow-primary/30"
                >
                    <Link href={user ? "/dashboard" : "/signup"}>
                    Empezar a Aprender <MoveRight className="ml-2" />
                    </Link>
                </Button>
                </div>
            </div>
        </section>

        <section className="py-20 bg-secondary/20">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">Estudia de Forma Más Inteligente</h2>
                    <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Nuestra plataforma está diseñada para que no solo memorices, sino que comprendas profundamente.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <BenefitCard
                        icon={<Brain className="h-10 w-10" />}
                        title="Aprendizaje Personalizado"
                    >
                        Transforma cualquier tema en un plan de estudio a tu medida. Nuestra IA identifica los conceptos clave y crea materiales fáciles de entender.
                    </BenefitCard>
                     <BenefitCard
                        icon={<BookOpen className="h-10 w-10" />}
                        title="Técnicas Efectivas"
                    >
                        Utilizamos métodos probados como la técnica Feynman y los mapas conceptuales para asegurar que no solo memorices, sino que comprendas.
                    </BenefitCard>
                     <BenefitCard
                        icon={<Target className="h-10 w-10" />}
                        title="Organización y Enfoque"
                    >
                        Define tus metas de estudio y accede a un historial de tus sesiones para mantener la motivación y seguir tu progreso. ¡Conquista tus objetivos!
                    </BenefitCard>
                </div>
            </div>
        </section>
        
        <section className="py-20 container mx-auto">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Un Camino Sencillo Hacia el Dominio</h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto">En solo tres pasos, transforma tu curiosidad en conocimiento sólido.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 border-t-2 border-dashed border-border -translate-y-1/2 -z-10 hidden md:block" />
                <HowItWorksStep icon={<Edit className="h-8 w-8" />} step="Paso 1" title="Define tu Meta">
                    Dinos qué quieres aprender y cuánto tiempo tienes. Nosotros nos encargamos del resto.
                </HowItWorksStep>
                <HowItWorksStep icon={<Sparkles className="h-8 w-8" />} step="Paso 2" title="Elige tu Método">
                    Selecciona una ruta de aprendizaje guiada o un método de estudio específico como Feynman o Pomodoro.
                </HowItWorksStep>
                <HowItWorksStep icon={<GraduationCap className="h-8 w-8" />} step="Paso 3" title="Aprende y Evalúa">
                    Sumérgete en los materiales generados por IA y pon a prueba tu conocimiento para asegurar un aprendizaje real.
                </HowItWorksStep>
            </div>
        </section>

        <section className="py-20 text-center container mx-auto">
            <h2 className="text-3xl font-bold font-headline">¿Listo para desbloquear tu potencial?</h2>
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground">Crea tu primera meta de estudio hoy mismo. Es gratis para empezar.</p>
            <div className="mt-8">
                 <Button
                    asChild
                    size="lg"
                    className="rounded-full font-bold text-lg px-8 py-6 transition-transform hover:scale-105 shadow-lg shadow-primary/30"
                >
                    <Link href={user ? "/dashboard" : "/signup"}>
                     Comenzar Ahora
                    </Link>
                </Button>
            </div>
        </section>

      </main>
       <footer className="border-t border-border mt-12 bg-card/50">
          <div className="container mx-auto py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div className="flex items-center gap-2">
              <Logo className="h-6 w-6 text-primary" />
              <span className="font-headline font-bold">StudyBlossom</span>
            </div>
            <p className="text-sm text-muted-foreground">Hecho con ♡ para aprendices de por vida.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Términos</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacidad</Link>
            </div>
          </div>
       </footer>
    </div>
  );
}
