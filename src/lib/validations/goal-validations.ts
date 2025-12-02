// src/lib/validations/goal-validations.ts
import { z } from "zod";

/**
 * Lista de palabras y patrones sospechosos que podrían indicar intentos de prompt injection
 * o solicitudes inapropiadas
 */
const SUSPICIOUS_PATTERNS = [
    // Intentos de prompt injection
    /ignore\s+(previous|all|above|prior)\s+(instructions|prompts|rules)/gi,
    /forget\s+(everything|all|previous)/gi,
    /you\s+are\s+now/gi,
    /new\s+(instructions|prompt|role)/gi,
    /system\s+(prompt|message|role)/gi,
    /act\s+as\s+(if|a)/gi,
    /pretend\s+(to\s+be|you\s+are)/gi,

    // Solicitudes de información sensible
    /dame\s+(tu\s+)?(api|key|token|password|credential|secret)/gi,
    /muestra\s+(tu\s+)?(api|key|token|password|credential|secret)/gi,
    /cu[aá]l\s+es\s+(tu\s+)?(api|key|token|password|credential)/gi,
    /pass\s?word/gi,
    /api\s?key/gi,
    /access\s?token/gi,

    // Intentos de obtener información del sistema
    /lista\s+(todos\s+)?los\s+usuarios/gi,
    /nombre(s)?\s+de\s+usuario/gi,
    /base\s+de\s+datos/gi,
    /sql\s+(query|injection)/gi,
    /show\s+(me\s+)?tables/gi,
    /select\s+\*/gi,

    // Comandos de sistema
    /rm\s+-rf/gi,
    /sudo\s+/gi,
    /chmod\s+/gi,
    /exec\s*\(/gi,
    /eval\s*\(/gi,
    /system\s*\(/gi,
];

/**
 * Palabras prohibidas que no tienen relación con temas de estudio
 */
const PROHIBITED_WORDS = [
    "hack", "hacking", "exploit", "malware", "virus",
    "credential", "password", "token", "apikey",
    "inject", "injection", "xss", "csrf",
    "admin", "root", "sudo", "chmod",
];

/**
 * Lista de caracteres especiales prohibidos
 */
const FORBIDDEN_CHARS = ['@', '/', '\\', '*', '<', '>', '|', '{', '}', '[', ']', '`', '~', '^'];

/**
 * Valida que el texto no contenga patrones sospechosos
 */
function checkSuspiciousPatterns(text: string): { isValid: boolean; reason?: string } {
    const lowerText = text.toLowerCase();

    // Verificar patrones sospechosos
    for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(text)) {
            return {
                isValid: false,
                reason: "El texto contiene patrones no permitidos. Por favor, describe solo tu tema de estudio."
            };
        }
    }

    // Verificar palabras prohibidas
    for (const word of PROHIBITED_WORDS) {
        if (lowerText.includes(word)) {
            return {
                isValid: false,
                reason: "El texto contiene términos no apropiados para un tema de estudio."
            };
        }
    }

    return { isValid: true };
}

/**
 * Valida que el texto no contenga caracteres especiales prohibidos
 */
function checkForbiddenChars(text: string): { isValid: boolean; reason?: string } {
    for (const char of FORBIDDEN_CHARS) {
        if (text.includes(char)) {
            return {
                isValid: false,
                reason: `El carácter "${char}" no está permitido. Usa solo letras, números, espacios y puntuación básica.`
            };
        }
    }
    return { isValid: true };
}

/**
 * Valida que el texto tenga contenido educativo real
 */
function checkEducationalContent(text: string): { isValid: boolean; reason?: string } {
    const trimmedText = text.trim();

    // Muy corto o vacío
    if (trimmedText.length < 5) {
        return {
            isValid: false,
            reason: "El tema es demasiado corto. Describe con más detalle qué quieres aprender."
        };
    }

    // Solo números o caracteres sin sentido
    if (/^[\d\s\-_.,;:!?]+$/.test(trimmedText)) {
        return {
            isValid: false,
            reason: "Por favor, describe tu tema de estudio con palabras."
        };
    }

    // Texto repetitivo (ej: "aaaaaaa", "123123123")
    if (/(.)\1{5,}/.test(trimmedText) || /(\d+)\1{3,}/.test(trimmedText)) {
        return {
            isValid: false,
            reason: "El texto parece no ser un tema de estudio válido."
        };
    }

    // Temas demasiado vagos o genéricos
    const vaguePhrases = [
        /^(cosas?|tema|aprender|estudiar|saber)(\s+(de|sobre))?\s*$/gi,
        /^(hola|hi|hey|test|prueba)$/gi,
        /^(nada|algo|cualquier\s+cosa)$/gi,
    ];

    for (const phrase of vaguePhrases) {
        if (phrase.test(trimmedText)) {
            return {
                isValid: false,
                reason: "Por favor, especifica qué tema deseas estudiar. Ejemplo: 'Funciones trigonométricas' o 'Historia de la Segunda Guerra Mundial'."
            };
        }
    }

    return { isValid: true };
}

/**
 * Schema de validación completo para el nombre de la meta
 */
export const GoalNameSchema = z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres." })
    .max(30, { message: "El nombre no puede exceder 30 caracteres." })
    .trim()
    .refine(
        (value) => /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(value),
        { message: "El nombre debe contener al menos una letra." }
    )
    .refine(
        (value) => !/^\d+$/.test(value),
        { message: "El nombre no puede ser solo números." }
    )
    .refine(
        (value) => {
            const forbiddenCheck = checkForbiddenChars(value);
            return forbiddenCheck.isValid;
        },
        { message: "El nombre contiene caracteres no permitidos." }
    )
    .refine(
        (value) => !/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]{4,}/.test(value),
        { message: "Demasiados caracteres especiales consecutivos." }
    )
    .refine(
        (value) => {
            const letters = value.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g)?.length || 0;
            return letters >= value.length * 0.4;
        },
        { message: "El nombre debe ser principalmente texto." }
    )
    .refine(
        (value) => {
            const suspiciousCheck = checkSuspiciousPatterns(value);
            return suspiciousCheck.isValid;
        },
        { message: "El texto contiene patrones no permitidos." }
    )
    .refine(
        (value) => !/(.)\1{4,}/.test(value),
        { message: "El nombre contiene demasiados caracteres repetidos." }
    );

/**
 * Schema de validación completo para el tema de estudio
 */
export const TopicSchema = z
    .string()
    .min(5, { message: "El tema debe tener al menos 5 caracteres." })
    .max(200, { message: "El tema no puede exceder 200 caracteres." })
    .trim()
    .refine(
        (value) => {
            const forbiddenCheck = checkForbiddenChars(value);
            if (!forbiddenCheck.isValid) {
                throw new z.ZodError([{
                    code: "custom",
                    message: forbiddenCheck.reason!,
                    path: []
                }]);
            }
            return true;
        }
    )
    .refine(
        (value) => {
            const suspiciousCheck = checkSuspiciousPatterns(value);
            if (!suspiciousCheck.isValid) {
                throw new z.ZodError([{
                    code: "custom",
                    message: suspiciousCheck.reason!,
                    path: []
                }]);
            }
            return true;
        }
    )
    .refine(
        (value) => {
            const educationalCheck = checkEducationalContent(value);
            if (!educationalCheck.isValid) {
                throw new z.ZodError([{
                    code: "custom",
                    message: educationalCheck.reason!,
                    path: []
                }]);
            }
            return true;
        }
    )
    .refine(
        (value) => /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(value),
        { message: "El tema debe contener al menos una letra." }
    )
    .refine(
        (value) => !/^\d+$/.test(value),
        { message: "El tema no puede ser solo números." }
    )
    .refine(
        (value) => !/^[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]+$/.test(value),
        { message: "El tema debe contener texto válido." }
    )
    .refine(
        (value) => {
            const letters = value.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g)?.length || 0;
            return letters >= value.length * 0.3;
        },
        { message: "El tema debe contener suficiente texto descriptivo." }
    )
    .refine(
        (value) => value.trim() === value,
        { message: "El tema no puede empezar o terminar con espacios." }
    )
    .refine(
        (value) => !/\s{3,}/.test(value),
        { message: "El tema contiene demasiados espacios consecutivos." }
    );

/**
 * Schema completo para la creación de meta
 */
export const StudyGoalSchema = z.object({
    goalName: GoalNameSchema,
    topic: TopicSchema,
});

export type StudyGoalFormValues = z.infer<typeof StudyGoalSchema>;

/**
 * Función auxiliar para sanitizar texto antes de enviarlo a la IA
 * Esto es una capa adicional de seguridad en el servidor
 */
export function sanitizeForAI(text: string): string {
    return text
        .trim()
        .replace(/\s+/g, ' ') // Normalizar espacios
        .substring(0, 500); // Limitar longitud máxima
}

/**
 * Validación del lado del servidor para datos de meta
 * Úsala en tus API routes antes de llamar a la IA
 */
export function validateGoalDataServer(data: unknown): {
    isValid: boolean;
    errors?: string[];
    sanitized?: StudyGoalFormValues;
} {
    try {
        const validated = StudyGoalSchema.parse(data);

        // Sanitizar los datos validados
        const sanitized: StudyGoalFormValues = {
            goalName: sanitizeForAI(validated.goalName),
            topic: sanitizeForAI(validated.topic),
        };

        return {
            isValid: true,
            sanitized,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                isValid: false,
                errors: error.errors.map(e => e.message),
            };
        }
        return {
            isValid: false,
            errors: ["Error de validación desconocido"],
        };
    }
}

/**
 * Ejemplos de temas válidos para mostrar al usuario
 */
export const VALID_TOPIC_EXAMPLES = [
    "Funciones trigonométricas y sus aplicaciones",
    "Historia de la Segunda Guerra Mundial",
    "Programación orientada a objetos en Python",
    "Fotosíntesis y respiración celular",
    "Literatura del Siglo de Oro español",
    "Ecuaciones diferenciales de primer orden",
    "Marketing digital y redes sociales",
    "Anatomía del sistema nervioso humano",
];

/**
 * Mensajes de ayuda para el usuario
 */
export const HELP_MESSAGES = {
    goalName: "Ejemplo: 'Examen de Física', 'Certificación AWS', 'Tesis de Grado'",
    topic: "Describe específicamente qué quieres aprender. Ejemplos:\n" +
        "✓ 'Funciones exponenciales y logarítmicas'\n" +
        "✓ 'Revolución Francesa: causas y consecuencias'\n" +
        "✗ 'cosas de matemáticas'\n" +
        "✗ 'estudiar'",
};