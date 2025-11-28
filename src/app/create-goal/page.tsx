"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
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

// Schema de validación mejorado
const StudyGoalSchema = z.object({
  goalName: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres." })
    .max(30, { message: "El nombre no puede exceder 30 caracteres." })
    .refine(
      (value) => {
        // Debe contener al menos una letra
        return /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(value);
      },
      { message: "El nombre debe contener al menos una letra." }
    )
    .refine(
      (value) => {
        // No puede ser solo números
        return !/^\d+$/.test(value);
      },
      { message: "El nombre no puede ser solo números." }
    )
    .refine(
      (value) => {
        // No puede tener más de 3 caracteres especiales consecutivos
        return !/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]{4,}/.test(value);
      },
      { message: "Demasiados caracteres especiales." }
    )
    .refine(
      (value) => {
        // Debe tener al menos 40% de letras del total
        const letters = value.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g)?.length || 0;
        return letters >= value.length * 0.4;
      },
      { message: "El nombre debe ser principalmente texto." }
    ),
  topic: z
    .string()
    .min(5, { message: "El tema debe tener al menos 5 caracteres." })
    .max(100, { message: "El tema no puede exceder 100 caracteres." })
    .refine(
      (value) => {
        // Debe contener al menos una letra
        return /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(value);
      },
      { message: "El tema debe contener al menos una letra." }
    )
    .refine(
      (value) => {
        // No puede ser solo números
        return !/^\d+$/.test(value);
      },
      { message: "El tema no puede ser solo números." }
    )
    .refine(
      (value) => {
        // No puede ser solo caracteres especiales o símbolos
        return !/^[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/.test(value);
      },
      { message: "El tema debe contener texto válido." }
    )
    .refine(
      (value) => {
        // Debe tener al menos 30% de letras del total
        const letters = value.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g)?.length || 0;
        return letters >= value.length * 0.3;
      },
      { message: "El tema debe contener suficiente texto descriptivo." }
    )
    .refine(
      (value) => {
        // No puede empezar o terminar con espacios
        return value.trim() === value;
      },
      { message: "El tema no puede empezar o terminar con espacios." }
    ),
});

type StudyGoalFormValues = z.infer<typeof StudyGoalSchema>;

function CreateGoalContent() {
  const router = useRouter();
  const { user } = useAuth();
  
  const form = useForm<StudyGoalFormValues>({
    resolver: zodResolver(StudyGoalSchema),
    defaultValues: {
      goalName: "",
      topic: "",
    },
  });

  function onSubmit(values: StudyGoalFormValues) {
    if (!user) {
        return;
    }

    const params = new URLSearchParams({
        goalName: values.goalName.trim(),
        topic: values.topic.trim(),
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
                  <FormField
                    control={form.control}
                    name="goalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Meta</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Examen de Cálculo" 
                            maxLength={30}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Máximo 30 caracteres. {field.value.length}/30
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tema de Estudio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe el tema que quieres estudiar. Ej: Fotosíntesis en plantas, Hooks de React y su uso en componentes funcionales, Ecuaciones diferenciales de primer orden"
                            className="min-h-[100px] resize-none"
                            maxLength={100}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Sé específico para obtener mejores resultados. {field.value.length}/100
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