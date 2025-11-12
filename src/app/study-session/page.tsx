"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Volume2, LoaderCircle, ArrowLeft, RefreshCw, Search, Lightbulb, Mic, Video, Download } from "lucide-react";
import FlashcardGenerator from "./flashcard-generator";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { getAudio, getFeynmanExplanationAction, analyzeFeynmanExplanationAction, getVoiceTutorResponse, getEducationalVideo } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Logo } from "@/components/icons";
import ConceptMapGenerator from "./concept-map-generator";
import PomodoroTimer from "./pomodoro-timer";
import PomodoroRecommendations from "./pomodoro-recommendations";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { FeynmanAnalysisOutput } from "@/ai/flows/generate-feynman-explanation-flow";
import type { VoiceTutorOutput } from "@/ai/flows/voice-tutor-flow";
import type { GenerateEducationalVideoOutput } from "@/ai/flows/generate-educational-video-flow";
import { Badge } from "@/components/ui/badge";

// Componente para el Tutor de Voz
const VoiceTutorMode = ({ topic }: { topic: string }) => {
    const [userQuestion, setUserQuestion] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [conversation, setConversation] = useState<Array<{
        role: 'user' | 'assistant';
        content: string;
        audioUrl?: string;
    }>>([]);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleAskQuestion = async () => {
        if (!userQuestion.trim()) return;

        setIsProcessing(true);
        setError(null);

        // Agregar pregunta del usuario a la conversación
        const newUserMessage = { role: 'user' as const, content: userQuestion };
        setConversation(prev => [...prev, newUserMessage]);

        try {
            const result = await getVoiceTutorResponse({
                topic,
                userQuestion,
                conversationHistory: conversation.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
            });

            if ('error' in result) {
                setError(result.error);
            } else {
                // Agregar respuesta del tutor
                setConversation(prev => [...prev, {
                    role: 'assistant',
                    content: result.textResponse,
                    audioUrl: result.audioResponse,
                }]);

                // Reproducir automáticamente el audio
                if (audioRef.current && result.audioResponse) {
                    audioRef.current.src = result.audioResponse;
                    audioRef.current.play();
                }
            }
        } catch (e: any) {
            setError(e.message || 'Error al procesar la pregunta');
        } finally {
            setIsProcessing(false);
            setUserQuestion('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAskQuestion();
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Mic className="h-6 w-6 text-accent"/>
                    Tutor de Voz: {topic}
                </CardTitle>
                <CardDescription>
                    Haz preguntas y obtén respuestas explicadas en audio. Es como tener un tutor personal.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Área de conversación */}
                <div className="bg-muted rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto space-y-4">
                    {conversation.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <Mic className="h-12 w-12 mb-4 opacity-50" />
                            <p className="font-semibold">¿Tienes alguna pregunta sobre {topic}?</p>
                            <p className="text-sm mt-2">Escribe tu pregunta abajo y obtén una explicación clara en texto y audio.</p>
                        </div>
                    ) : (
                        conversation.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-card border border-border'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                                    {message.audioUrl && (
                                        <div className="mt-2">
                                            <audio controls src={message.audioUrl} className="w-full mt-2" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {isProcessing && (
                        <div className="flex justify-start">
                            <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-2">
                                <LoaderCircle className="h-4 w-4 animate-spin text-accent" />
                                <span className="text-sm text-muted-foreground">El tutor está pensando...</span>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Input para nueva pregunta */}
                <div className="flex gap-2">
                    <Textarea
                        placeholder="Escribe tu pregunta aquí... (Enter para enviar, Shift+Enter para nueva línea)"
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isProcessing}
                        className="flex-1 min-h-[80px]"
                    />
                    <Button
                        onClick={handleAskQuestion}
                        disabled={isProcessing || !userQuestion.trim()}
                        size="lg"
                        className="px-8"
                    >
                        {isProcessing ? (
                            <LoaderCircle className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Mic className="mr-2 h-5 w-5" />
                                Preguntar
                            </>
                        )}
                    </Button>
                </div>

                {/* Sugerencias rápidas */}
                {conversation.length === 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Sugerencias:</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                '¿Qué es lo más importante que debo saber?',
                                '¿Puedes explicármelo con un ejemplo?',
                                '¿Cuáles son las aplicaciones prácticas?',
                            ].map((suggestion, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setUserQuestion(suggestion)}
                                    disabled={isProcessing}
                                >
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Audio player oculto para reproducción automática */}
                <audio ref={audioRef} className="hidden" />
            </CardContent>
        </Card>
    );
};

// Componente para Video Educativo
const EducationalVideoMode = ({ topic }: { topic: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [videoData, setVideoData] = useState<GenerateEducationalVideoOutput | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [duration, setDuration] = useState<'short' | 'medium' | 'long'>('medium');
    const [progress, setProgress] = useState(0);

    const handleGenerateVideo = async () => {
        setIsLoading(true);
        setError(null);
        setProgress(0);

        // Simular progreso mientras se genera
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 5;
            });
        }, 2000);

        try {
            const result = await getEducationalVideo({ topic, duration });

            clearInterval(progressInterval);
            setProgress(100);

            if ('error' in result) {
                setError(result.error);
            } else {
                setVideoData(result);
            }
        } catch (e: any) {
            clearInterval(progressInterval);
            setError(e.message || 'Error al generar el video');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadScript = () => {
        if (!videoData) return;

        const blob = new Blob([videoData.script], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `guion-${topic.toLowerCase().replace(/\s+/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadVideo = () => {
        if (!videoData?.videoUrl) return;
        window.open(videoData.videoUrl, '_blank');
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Video className="h-6 w-6 text-accent"/>
                    Video Educativo: {topic}
                </CardTitle>
                <CardDescription>
                    Genera un video profesional con avatar IA explicando el tema
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!videoData && !isLoading && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 p-3 rounded-lg">
                                    <Video className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-2">¿Qué obtendrás?</h3>
                                    <ul className="text-sm text-muted-foreground space-y-2">
                                        <li className="flex items-center gap-2">
                                            <span className="text-accent">✓</span>
                                            Video profesional con avatar IA realista
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-accent">✓</span>
                                            Voz en español con pronunciación natural
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-accent">✓</span>
                                            Guión educativo generado con IA
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-accent">✓</span>
                                            Descargable y listo para compartir
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-3 block">Selecciona la duración del video:</label>
                            <div className="grid grid-cols-3 gap-3">
                                <Button
                                    variant={duration === 'short' ? 'default' : 'outline'}
                                    onClick={() => setDuration('short')}
                                    className="h-auto flex-col py-4"
                                >
                                    <span className="font-bold text-lg">⚡ Corto</span>
                                    <span className="text-xs mt-1">1-2 minutos</span>
                                    <span className="text-xs text-muted-foreground mt-1">~200 palabras</span>
                                </Button>
                                <Button
                                    variant={duration === 'medium' ? 'default' : 'outline'}
                                    onClick={() => setDuration('medium')}
                                    className="h-auto flex-col py-4"
                                >
                                    <span className="font-bold text-lg">🎯 Medio</span>
                                    <span className="text-xs mt-1">3-5 minutos</span>
                                    <span className="text-xs text-muted-foreground mt-1">~400 palabras</span>
                                </Button>
                                <Button
                                    variant={duration === 'long' ? 'default' : 'outline'}
                                    onClick={() => setDuration('long')}
                                    className="h-auto flex-col py-4"
                                >
                                    <span className="font-bold text-lg">📚 Largo</span>
                                    <span className="text-xs mt-1">5-10 minutos</span>
                                    <span className="text-xs text-muted-foreground mt-1">~700 palabras</span>
                                </Button>
                            </div>
                        </div>

                        <Button onClick={handleGenerateVideo} size="lg" className="w-full shadow-lg">
                            <Video className="mr-2 h-5 w-5" />
                            Generar Video con IA
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            La generación puede tomar entre 1-3 minutos ⏱️
                        </p>
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 space-y-6">
                        <div className="relative">
                            <LoaderCircle className="h-20 w-20 text-accent animate-spin" />
                            <Video className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-lg font-semibold">Creando tu video educativo...</p>
                            <p className="text-sm text-muted-foreground">
                                {progress < 30 && '🎬 Generando guión con IA...'}
                                {progress >= 30 && progress < 60 && '🎭 Creando avatar y voz...'}
                                {progress >= 60 && progress < 90 && '🎥 Renderizando video...'}
                                {progress >= 90 && '✨ Finalizando detalles...'}
                            </p>
                        </div>

                        <div className="w-full max-w-md">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-center text-xs text-muted-foreground mt-2">{progress}%</p>
                        </div>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error al generar el video</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                        <div className="mt-4 flex gap-2">
                            <Button onClick={() => setError(null)} variant="outline" size="sm">
                                Cerrar
                            </Button>
                            <Button onClick={handleGenerateVideo} size="sm">
                                Reintentar
                            </Button>
                        </div>
                    </Alert>
                )}

                {videoData && (
                    <div className="space-y-6 animate-in fade-in-50 duration-500">
                        {/* Video player */}
                        <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-accent/20">
                            <video
                                controls
                                className="w-full aspect-video bg-black"
                                poster={videoData.thumbnailUrl}
                            >
                                <source src={videoData.videoUrl} type="video/mp4" />
                                Tu navegador no soporta la reproducción de video.
                            </video>
                            <div className="absolute top-3 right-3 flex gap-2">
                                <Badge className="bg-black/70 text-white">
                                    <Video className="h-3 w-3 mr-1" />
                                    {videoData.estimatedDuration}
                                </Badge>
                            </div>
                        </div>

                        {/* Título */}
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">{videoData.title}</h2>
                            <Badge variant="secondary">Video ID: {videoData.videoId}</Badge>
                        </div>

                        {/* Puntos clave */}
                        {videoData.keyPoints && videoData.keyPoints.length > 0 && (
                            <div className="bg-card border rounded-lg p-5">
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-accent" />
                                    Puntos Clave del Video
                                </h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {videoData.keyPoints.map((point, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                            <span className="text-accent font-bold mt-0.5">•</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Guión */}
                        <div className="bg-muted rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Terminal className="h-5 w-5" />
                                    Guión del Video
                                </h3>
                                <Button onClick={handleDownloadScript} variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar
                                </Button>
                            </div>
                            <div className="bg-background rounded-md p-4 max-h-[300px] overflow-y-auto">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {videoData.script}
                                </p>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={() => setVideoData(null)} variant="outline" className="w-full">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Generar otro video
                            </Button>
                            <Button onClick={handleDownloadVideo} className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Descargar video
                            </Button>
                        </div>

                        {/* Info adicional */}
                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
                            <p className="font-semibold mb-2">💡 Tip profesional:</p>
                            <p className="text-muted-foreground">
                                Puedes usar este video en tus presentaciones, clases online o compartirlo en redes sociales.
                                El video está alojado en D-ID y estará disponible por tiempo limitado.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Componente FeynmanMode (ya existente)
const FeynmanMode = ({ topic }: { topic: string }) => {
    const [explanation, setExplanation] = useState<string>("");
    const [userExplanation, setUserExplanation] = useState<string>("");
    const [feedback, setFeedback] = useState<FeynmanAnalysisOutput | null>(null);
    const [stage, setStage] = useState<"loading" | "explaining" | "analyzing" | "feedback" | "error">("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadInitialExplanation() {
            if (!topic) {
                setError("No se ha proporcionado un tema.");
                setStage("error");
                return;
            }
            const result = await getFeynmanExplanationAction(topic);
            if (result && "error" in result) {
                setError(result.error);
                setStage("error");
            } else if (result) {
                setExplanation(result.explanation);
                setStage("explaining");
            }
        }
        loadInitialExplanation();
    }, [topic]);

    const handleAnalyze = async () => {
        setStage("analyzing");
        const result = await analyzeFeynmanExplanationAction(topic, userExplanation);
        if (result && "error" in result) {
            setError(result.error);
            setStage("error");
        } else if (result) {
            setFeedback(result);
            setStage("feedback");
        }
    }

    const handleTryAgain = () => {
        setStage("explaining");
    }

    if (stage === "loading") {
        return <FeynmanSkeleton />;
    }

    if (stage === "error") {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error al aplicar la técnica Feynman</AlertTitle>
                <AlertDescription>{error || "Ocurrió un error inesperado."}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Brain className="h-6 w-6 text-accent"/>
                        Técnica Feynman: {topic}
                    </CardTitle>
                    <CardDescription>Explica un concepto con tus propias palabras para dominarlo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg">Paso 1: Concepto Clave</h3>
                        <p className="text-muted-foreground mt-1 bg-muted p-4 rounded-md">{explanation}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">Paso 2: Explícalo con tus palabras</h3>
                        <p className="text-muted-foreground mt-1 mb-2">Imagina que se lo estás enseñando a un principiante. Sé simple y claro.</p>
                        <Textarea
                            placeholder="Escribe aquí tu explicación..."
                            value={userExplanation}
                            onChange={(e) => setUserExplanation(e.target.value)}
                            rows={6}
                            disabled={stage !== 'explaining'}
                        />
                        <Button onClick={handleAnalyze} disabled={stage !== 'explaining' || !userExplanation.trim()} className="mt-4">
                            Analizar mi explicación
                        </Button>
                    </div>

                    {(stage === 'analyzing' || stage === 'feedback') && (
                        <div className="animate-in fade-in-50 duration-500">
                            <h3 className="font-semibold text-lg">Paso 3: Identifica y Mejora</h3>
                            {stage === 'analyzing' ? (
                                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    Analizando tu explicación para encontrar áreas de mejora...
                                </div>
                            ) : feedback && (
                                <div className="mt-2 space-y-4">
                                    <div className="bg-accent/10 border border-accent/20 p-4 rounded-md">
                                        <h4 className="font-semibold flex items-center gap-2"><Search className="h-5 w-5 text-accent"/> Brechas de Conocimiento</h4>
                                        <p className="text-muted-foreground whitespace-pre-line mt-1">{feedback.gaps}</p>
                                    </div>
                                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-md">
                                        <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary"/> Sugerencias de Simplificación</h4>
                                        <p className="text-muted-foreground whitespace-pre-line mt-1">{feedback.simplifications}</p>
                                    </div>
                                    <Button onClick={handleTryAgain} variant="outline" className="mt-4">
                                        <RefreshCw className="mr-2 h-4 w-4"/>
                                        Intentar de nuevo
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const FeynmanSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ))}
        </CardContent>
    </Card>
);

// Componente AudioMode (ya existente)
const AudioMode = ({ topic }: { topic: string }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handlePlay = async () => {
        if (audioSrc) {
            audioRef.current?.play();
            setIsPlaying(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        const explanationResult = await getFeynmanExplanationAction(topic);

        if (explanationResult && "error" in explanationResult) {
            setError(explanationResult.error);
            setIsLoading(false);
            return;
        }

        const fullText = `Aquí tienes una explicación sencilla sobre ${topic}, aplicando la técnica Feynman: ${explanationResult.explanation}`;

        const audioResult = await getAudio(fullText);
        setIsLoading(false);

        if ("error" in audioResult) {
            setError(audioResult.error);
        } else {
            setAudioSrc(audioResult.media);
        }
    };

    const handlePause = () => {
        audioRef.current?.pause();
        setIsPlaying(false);
    };

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        if (audioSrc && audioRef.current) {
            audioRef.current.src = audioSrc;
            audioRef.current.play();
            setIsPlaying(true);

            const onEnded = () => setIsPlaying(false);
            audioRef.current.addEventListener('ended', onEnded);

            return () => {
                audioRef.current?.removeEventListener('ended', onEnded);
            }
        }
    }, [audioSrc]);

    return (
        <Card className="flex flex-col items-center justify-center p-8 text-center min-h-96">
            <CardHeader>
                <CardTitle className="font-headline">Guía de Audio para {topic}</CardTitle>
                <CardDescription>Escucha los pasos para aprender sobre tu tema.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
                {isLoading ? (
                    <LoaderCircle className="h-16 w-16 text-accent animate-spin" />
                ) : (
                    <Volume2 className="h-16 w-16 text-accent" />
                )}
                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error al Generar el Audio</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="flex items-center gap-4 mt-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={isPlaying ? handlePause : handlePlay}
                        disabled={isLoading}
                    >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleStop} disabled={isLoading || !audioSrc}>
                        <Square className="h-6 w-6" />
                    </Button>
                </div>
                <audio ref={audioRef} />
            </CardContent>
        </Card>
    );
};

// Componente principal StudySession
function StudySession() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const goalName = searchParams.get("goalName") || "";
    const topic = searchParams.get("topic") || "";
    const mode = searchParams.get("mode") || "";

    const handleFinish = () => {
        router.push("/dashboard");
    };

    const handleBack = () => {
        router.back();
    }

    const renderContent = () => {
        switch (mode) {
            case "text":
                return <FeynmanMode topic={topic} />;
            case "visual":
                return <FlashcardGenerator topic={topic} />;
            case "audio":
                return <AudioMode topic={topic} />;
            case "map":
                return <ConceptMapGenerator topic={topic} />;
            case "pomodoro":
                return (
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <PomodoroTimer />
                        <PomodoroRecommendations topic={topic} />
                    </div>
                );
            case "voice-tutor":
                return <VoiceTutorMode topic={topic} />;
            case "video":
                return <EducationalVideoMode topic={topic} />;
            default:
                return <p>Por favor, selecciona un modo de estudio en la página anterior.</p>;
        }
    };

    return (
        <div className="flex flex-col min-h-dvh items-center bg-background p-4 md:p-8">
            <div className="w-full max-w-6xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-2xl font-bold text-primary-foreground">
                        <Logo className="h-8 w-8 text-accent" />
                        <span className="font-headline">StudyBlossom</span>
                    </div>
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Cambiar Modo
                    </Button>
                </header>

                <h1 className="text-3xl font-bold text-center mb-2 font-headline">
                    {goalName}
                </h1>
                <p className="text-center text-muted-foreground mb-6">
                    Tema: <span className="font-semibold">{topic}</span>
                </p>

                {renderContent()}

                <div className="mt-8 text-center">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="rounded-full">Finalizar Sesión</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro de que quieres finalizar?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tu progreso en esta sesión se guardará en tu historial.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleFinish}>Confirmar y Salir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}

export default function StudySessionPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando sesión de estudio...</div>}>
            <StudySession />
        </Suspense>
    );
}