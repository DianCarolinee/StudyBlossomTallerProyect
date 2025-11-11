
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { StudyGoal } from "@/lib/types";
import { StudyGoalSchema } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Navbar, NavbarSkeleton } from "@/components/ui/navbar";
import { useAuth } from "@/hooks/use-auth";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


function CreateGoalContent() {
  const router = useRouter();
  const { user } = useAuth();
  
  const form = useForm<StudyGoal>({
    resolver: zodResolver(StudyGoalSchema),
    defaultValues: {
      goalName: "",
      studyTime: 1,
      topic: "",
    },
  });

  function onSubmit(values: StudyGoal) {
    if (!user) {
        return;
    }

    const params = new URLSearchParams({
        goalName: values.goalName,
        studyTime: values.studyTime.toString(),
        topic: values.topic,
    });
    router.push(`/recommendation?${params.toString()}`);
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
       <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
         <div className="w-full max-w-2xl">
          <Card className="shadow-2xl shadow-primary/10 relative">
            <CardHeader>
              <Button variant="ghost" size="sm" asChild className="absolute top-4 left-4">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Jardín
                </Link>
              </Button>
              <CardTitle className="font-headline text-3xl text-center pt-12">
                Siembra una Nueva Meta
              </CardTitle>
              <CardDescription className="text-center">
                Vamos a prepararte para el éxito. ¿Qué vamos a aprender hoy?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="goalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Meta</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Examen de Cálculo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="studyTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tiempo de Estudio (horas)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tema de Estudio</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Fotosíntesis, Hooks de React" {...field} />
                        </FormControl>
                        <FormDescription>
                          Esto se usará para generar tus materiales de estudio.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg">
                    Continuar
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function CreateGoalPage() {
    return (
        <Suspense fallback={<NavbarSkeleton />}>
            <CreateGoalContent />
        </Suspense>
    )
}
