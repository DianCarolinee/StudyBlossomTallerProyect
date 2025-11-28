"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { Logo } from "@/components/icons";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El email es requerido." })
    .max(40, { message: "El email no puede tener más de 40 caracteres." })
    .email({ message: "Por favor, introduce un email válido." })
    .refine(
      (email) => {
        const localPart = email.split("@")[0];
        return localPart.length >= 5;
      },
      { message: "El email debe tener al menos 5 caracteres antes del @." }
    )
    .refine(
      (email) => {
        // Validar que contenga al menos una letra (no solo números)
        const localPart = email.split("@")[0];
        return /[a-zA-Z]/.test(localPart);
      },
      { message: "El email debe contener al menos una letra." }
    )
    .refine(
      (email) => {
        // No puede tener más de 4 caracteres iguales consecutivos
        const localPart = email.split("@")[0];
        return !/(.)\1{4,}/.test(localPart);
      },
      { message: "El email no puede tener más de 4 caracteres iguales consecutivos." }
    )
    .refine(
      (email) => {
        // Debe tener al menos 30% de caracteres únicos (diversidad)
        const localPart = email.split("@")[0];
        const uniqueChars = new Set(localPart).size;
        return uniqueChars >= localPart.length * 0.3;
      },
      { message: "El email debe tener mayor variedad de caracteres." }
    )
    .refine(
      (email) => {
        // No puede tener más del 60% de números
        const localPart = email.split("@")[0];
        const numbers = (localPart.match(/\d/g) || []).length;
        return numbers <= localPart.length * 0.6;
      },
      { message: "El email tiene demasiados números." }
    )
    .refine(
      (email) => {
        // Validar que no sean todos números antes del @
        const localPart = email.split("@")[0];
        return !/^\d+$/.test(localPart);
      },
      { message: "El email no puede ser solo números." }
    )
    .refine(
      (email) => {
        // Validar formato general: letras, números, puntos, guiones
        const localPart = email.split("@")[0];
        return /^[a-zA-Z0-9._-]+$/.test(localPart);
      },
      { message: "El email contiene caracteres no válidos." }
    )
    .refine(
      (email) => {
        // No puede empezar ni terminar con punto o guion
        const localPart = email.split("@")[0];
        return !/^[.\-]|[.\-]$/.test(localPart);
      },
      { message: "El email no puede empezar o terminar con punto o guion." }
    )
    .refine(
      (email) => {
        // No puede tener puntos o guiones consecutivos
        const localPart = email.split("@")[0];
        return !/[.\-]{2,}/.test(localPart);
      },
      { message: "El email no puede tener puntos o guiones consecutivos." }
    )
    .refine(
      (email) => {
        // Validar que el dominio sea reconocido o educativo
        const domain = email.split("@")[1]?.toLowerCase();
        const validDomains = [
          "gmail.com", "hotmail.com", "outlook.com", "yahoo.com",
          "icloud.com", "live.com", "msn.com", "aol.com",
          "protonmail.com", "zoho.com"
        ];
        // Permitir dominios educativos que terminen en .edu, .edu.pe, .edu.mx, etc.
        const isEducational = /\.edu(\.[a-z]{2})?$/i.test(domain);
        return validDomains.includes(domain) || isEducational;
      },
      { message: "Por favor, usa un email de un proveedor reconocido o una cuenta educativa (.edu)." }
    )
    .refine(
      (email) => {
        // Validar que el dominio tenga al menos un punto
        const domain = email.split("@")[1];
        return domain && domain.includes(".");
      },
      { message: "El dominio del email debe ser válido." }
    ),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." })
    .max(15, { message: "La contraseña no puede tener más de 15 caracteres." })
    .regex(/[A-Z]/, {
      message: "La contraseña debe contener al menos una letra mayúscula.",
    })
    .regex(/[a-z]/, {
      message: "La contraseña debe contener al menos una letra minúscula.",
    })
    .regex(/[0-9]/, {
      message: "La contraseña debe contener al menos un número.",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "La contraseña debe contener al menos un carácter especial.",
    }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Has iniciado sesión correctamente.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      let description = "Las credenciales no son correctas. Por favor, inténtalo de nuevo.";
      if (error.code === 'auth/user-not-found') {
        description = "No existe una cuenta con este email.";
      } else if (error.code === 'auth/wrong-password') {
        description = "Contraseña incorrecta.";
      } else if (error.code === 'auth/invalid-credential') {
        description = "Email o contraseña incorrectos.";
      } else if (error.code === 'auth/too-many-requests') {
        description = "Demasiados intentos fallidos. Intenta más tarde.";
      }
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: description,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary-foreground">
            <Logo className="h-8 w-8 text-accent" />
            <span className="font-headline">StudyBlossom</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Introduce tus credenciales para acceder a tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          maxLength={40}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          maxLength={15}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Iniciar Sesión
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:underline"
              >
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}