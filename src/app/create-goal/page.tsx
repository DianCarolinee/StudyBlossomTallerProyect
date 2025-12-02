// src/app/create-goal/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Navbar, NavbarSkeleton } from "@/components/ui/navbar";
import { useAuth } from "@/hooks/use-auth";
import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import {
    StudyGoalSchema,
    type StudyGoalFormValues,
    VALID_TOPIC_EXAMPLES
} from "@/lib/validations/goal-validations";

/**
 * Reglas adicionales de protección en cliente
 */

// caracteres especiales peligrosos que NO queremos
const FORBIDDEN_SPECIAL_CHARS = /[@/\\*<>[\]{}$%^&|`~]/;

// patrones típicos de prompt injection / robo de datos
const PROMPT_INJECTION_PATTERNS: RegExp[] = [
    /ignora todas las instrucciones/i,
    /ignora las instrucciones anteriores/i,
    /act[úu]a como/i,
    /quiero que act[úu]es como/i,
    /como modelo de lenguaje/i,
    /como chatgpt/i,
    /prompt/i,
    /sistema de instrucciones/i,
    /role ?play/i,
    /olvida todo lo anterior/i,
];

// patrones sensibles (credenciales, contraseñas, tokens, etc.)
const SENSITIVE_DATA_PATTERNS: RegExp[] = [
    /credenciales/i,
    /contrase[ñn]a/i,
    /password/i,
    /usuario y contrase[ñn]a/i,
    /user ?name/i,
    /api key/i,
    /token de acceso/i,
    /claves?/i,
];

// temas demasiado vagos / de “no sé”
const AMBIGUOUS_PATTERNS: RegExp[] = [
    /cosas de/i,
    /algo de/i,
    /no se que poner/i,
    /no s[eé] qu[eé] poner/i,
    /no se/i,
    /no s[eé]/i,
    /no tengo idea/i,
    /no s[eé] qu[eé] estudiar/i,
];

type TopicCheckResult =
    | { ok: true }
    | { ok: false; message: string; showHelp?: boolean };

function analyzeStudyTopic(raw: string): TopicCheckResult {
    const topic = raw.trim();

    if (!topic) {
        return {
            ok: false,
            message: "Ingresa un tema claro para generar tu ruta de estudio.",
            showHelp: true,
        };
    }

    const lower = topic.toLowerCase();

    // Solo ruido/repetición, ej: "aaaaaa"
    if (/^(.)\1{2,}$/.test(lower)) {
        return {
            ok: false,
            message: "Ingresa un tema claro para generar tu ruta de estudio.",
            showHelp: true,
        };
    }

    const words = topic.split(/\s+/).filter(Boolean);

    // Palabras solo con letras
    const letterWords = words.filter((w) => /^[a-záéíóúüñ]+$/i.test(w));
    const letterWordsWithVowel = letterWords.filter((w) =>
        /[aeiouáéíóúü]/i.test(w)
    );

    // Mucho ruido: grupos largos de consonantes (fsrvbhnyrhf, btynf, etc.)
    const hasLongConsonantCluster = /[bcdfghjklmnñpqrstvwxyz]{8,}/i.test(topic);

    // Contar dígitos
    const digitMatches = topic.match(/\d/g) ?? [];
    const digitCount = digitMatches.length;
    const digitRatio = digitCount / topic.length;

    const looksLikeNoise =
        hasLongConsonantCluster ||
        (digitCount >= 6 && digitRatio > 0.2) ||
        letterWordsWithVowel.length < 2;

    // Muy corto / pocas palabras / patrones vagos / ruido
    if (
        topic.length < 25 ||
        words.length < 4 ||
        AMBIGUOUS_PATTERNS.some((r) => r.test(lower)) ||
        looksLikeNoise
    ) {
        return {
            ok: false,
            message: "Ingresa un tema claro para generar tu ruta de estudio.",
            showHelp: true,
        };
    }

    // Caracteres especiales peligrosos
    if (FORBIDDEN_SPECIAL_CHARS.test(topic)) {
        return {
            ok: false,
            message:
                "Evita usar caracteres especiales como @, /, * o <>. Describe tu tema con palabras claras.",
        };
    }

    // Intentos de prompt injection / hablarle directamente a la IA
    if (PROMPT_INJECTION_PATTERNS.some((r) => r.test(lower))) {
        return {
            ok: false,
            message:
                "Usa este campo solo para describir qué quieres aprender, no para darle instrucciones a la IA.",
        };
    }

    // Peticiones de credenciales / datos sensibles
    if (SENSITIVE_DATA_PATTERNS.some((r) => r.test(lower))) {
        return {
            ok: false,
            message:
                "Este espacio es solo para temas de estudio. No se permiten solicitudes de credenciales ni datos sensibles.",
        };
    }

    return { ok: true };
}


function analyzeGoalName(raw: string): TopicCheckResult {
    const name = raw.trim();

    if (!name) {
        return {
            ok: false,
            message: "Ponle un nombre corto y descriptivo a tu meta.",
        };
    }

    if (FORBIDDEN_SPECIAL_CHARS.test(name)) {
        return {
            ok: false,
            message:
                "El nombre de la meta no puede incluir caracteres especiales como @, /, * o <>.",
        };
    }

    if (/^(.)\1{2,}$/.test(name.toLowerCase())) {
        return {
            ok: false,
            message: "El nombre de la meta debe ser algo que puedas reconocer fácilmente.",
        };
    }

    return { ok: true };
}

function CreateGoalContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [showHelp, setShowHelp] = useState(false);

    const form = useForm<StudyGoalFormValues>({
        resolver: zodResolver(StudyGoalSchema),
        defaultValues: {
            goalName: "",
            topic: "",
        },
        mode: "onChange", // Validar mientras se escribe
    });

    const goalNameValue = form.watch("goalName");
    const topicValue = form.watch("topic");
    const goalNameError = form.formState.errors.goalName;
    const topicError = form.formState.errors.topic;

    function onSubmit(values: StudyGoalFormValues) {
        if (!user) {
            return;
        }

        // --- capa extra de protección en cliente ---

        const goalNameCheck = analyzeGoalName(values.goalName);
        if (!goalNameCheck.ok) {
            form.setError("goalName", {
                type: "manual",
                message: goalNameCheck.message,
            });
            return;
        }

        const topicCheck = analyzeStudyTopic(values.topic);
        if (!topicCheck.ok) {
            form.setError("topic", {
                type: "manual",
                message: topicCheck.message,
            });
            if (topicCheck.showHelp) {
                setShowHelp(true); // abre el diálogo con la guía
            }
            return;
        }

        // -------------------------------------------

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
                                Define tu meta de estudio con claridad para obtener los mejores resultados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Alert informativo */}
                            <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
                                <Lightbulb className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                                    <strong>Consejo:</strong> Sé específico y claro. Mientras mejor describas tu tema,
                                    más personalizada será tu ruta de aprendizaje.
                                </AlertDescription>
                            </Alert>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    {/* Campo: Nombre de la Meta */}
                                    <FormField
                                        control={form.control}
                                        name="goalName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    Nombre de la Meta
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-5 w-5"
                                                            >
                                                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>¿Cómo nombrar mi meta?</DialogTitle>
                                                                <DialogDescription className="space-y-3 pt-4">
                                                                    <p>
                                                                        Usa un nombre corto y memorable que identifique tu objetivo:
                                                                    </p>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div className="flex items-start gap-2">
                                                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                                            <span>"Examen de Cálculo 2"</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                                            <span>"Certificación AWS"</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                                            <span>"Tesis Maestría"</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                                            <span>"@@estudiar***"</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                                            <span>"123456"</span>
                                                                        </div>
                                                                    </div>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                        </DialogContent>
                                                    </Dialog>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ej: Examen de Física Cuántica"
                                                        maxLength={30}
                                                        {...field}
                                                        className={goalNameError ? "border-destructive" : ""}
                                                    />
                                                </FormControl>
                                                <FormDescription className="flex justify-between items-center">
                                                    <span>Dale un nombre descriptivo a tu meta</span>
                                                    <span className={goalNameValue.length > 25 ? "text-amber-600 font-medium" : ""}>
                                                        {goalNameValue.length}/30
                                                    </span>
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Campo: Tema de Estudio */}
                                    <FormField
                                        control={form.control}
                                        name="topic"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    Tema de Estudio
                                                    <Dialog open={showHelp} onOpenChange={setShowHelp}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-5 w-5"
                                                            >
                                                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-lg">
                                                            <DialogHeader>
                                                                <DialogTitle>¿Cómo describir mi tema?</DialogTitle>
                                                                <DialogDescription className="space-y-4 pt-4">
                                                                    <p className="font-medium">
                                                                        Ejemplos de temas bien formulados:
                                                                    </p>
                                                                    <div className="space-y-2 text-sm">
                                                                        {VALID_TOPIC_EXAMPLES.slice(0, 5).map((example, i) => (
                                                                            <div key={i} className="flex items-start gap-2">
                                                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                                                <span>{example}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <p className="font-medium text-destructive">
                                                                        Evita temas vagos o ambiguos:
                                                                    </p>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div className="flex items-start gap-2">
                                                                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                                            <span>"cosas de matemáticas"</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                                            <span>"estudiar algo"</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                                            <span>"@@@***"</span>
                                                                        </div>
                                                                    </div>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                        </DialogContent>
                                                    </Dialog>
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe específicamente qué quieres aprender. Ej: Mecánica cuántica enfocada en el principio de incertidumbre de Heisenberg y sus aplicaciones en física moderna"
                                                        className={`min-h-[120px] resize-none ${topicError ? "border-destructive" : ""}`}
                                                        maxLength={200}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="flex justify-between items-center">
                                                    <span>Sé específico para mejores resultados</span>
                                                    <span className={topicValue.length > 180 ? "text-amber-600 font-medium" : ""}>
                                                        {topicValue.length}/200
                                                    </span>
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Indicador de validez del formulario */}
                                    {(goalNameValue || topicValue) && (
                                        <Alert
                                            className={
                                                form.formState.isValid
                                                    ? "border-green-200 bg-green-50 dark:bg-green-950"
                                                    : "border-amber-200 bg-amber-50 dark:bg-amber-950"
                                            }
                                        >
                                            {form.formState.isValid ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    <AlertDescription className="text-sm text-green-900 dark:text-green-100">
                                                        ¡Perfecto! Tu meta está lista para ser creada.
                                                    </AlertDescription>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-4 w-4 text-amber-600" />
                                                    <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
                                                        Completa los campos correctamente para continuar.
                                                    </AlertDescription>
                                                </>
                                            )}
                                        </Alert>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={!form.formState.isValid || form.formState.isSubmitting}
                                    >
                                        {form.formState.isSubmitting ? "Procesando..." : "Continuar"}
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
    );
}
