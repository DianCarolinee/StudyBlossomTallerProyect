// src/lib/validations/server-validation-middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { validateGoalDataServer } from "./goal-validations";

/**
 * Middleware para validar datos de meta en API routes
 * Úsalo en tus API endpoints antes de procesar cualquier llamada a la IA
 */
export async function validateGoalRequest(request: NextRequest) {
    try {
        const body = await request.json();

        // Validar la estructura de los datos
        const validation = validateGoalDataServer(body);

        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: "Datos inválidos",
                    details: validation.errors,
                },
                { status: 400 }
            );
        }

        return { isValid: true, data: validation.sanitized };
    } catch (error) {
        return NextResponse.json(
            {
                error: "Error al procesar la solicitud",
                details: ["Los datos enviados no tienen el formato correcto"],
            },
            { status: 400 }
        );
    }
}

/**
 * HOC (Higher Order Function) para envolver tus API handlers
 * Ejemplo de uso:
 *
 * export const POST = withGoalValidation(async (request, validatedData) => {
 *   // validatedData ya está validado y sanitizado
 *   const result = await callAIWithGoal(validatedData);
 *   return NextResponse.json(result);
 * });
 */
export function withGoalValidation(
    handler: (
        request: NextRequest,
        validatedData: { goalName: string; topic: string }
    ) => Promise<NextResponse>
) {
    return async (request: NextRequest) => {
        const validation = await validateGoalRequest(request);

        // Si la validación retorna un NextResponse, significa que hay un error
        if (validation instanceof NextResponse) {
            return validation;
        }

        // Si llegamos aquí, los datos son válidos
        return handler(request, validation.data!);
    };
}

/**
 * Rate limiting simple basado en IP
 * Previene abuso de la API
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
    request: NextRequest,
    maxRequests: number = 10,
    windowMs: number = 60000 // 1 minuto
): { allowed: boolean; remaining: number } {
    // Obtener IP desde cabeceras (NextRequest no tiene propiedad `ip`)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip =
        forwardedFor?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";

    const now = Date.now();

    const record = requestCounts.get(ip);

    // Si no existe registro o el tiempo expiró, crear nuevo
    if (!record || now > record.resetTime) {
        requestCounts.set(ip, {
            count: 1,
            resetTime: now + windowMs,
        });
        return { allowed: true, remaining: maxRequests - 1 };
    }

    // Si existe y no ha expirado, incrementar contador
    record.count++;

    if (record.count > maxRequests) {
        return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Middleware para rate limiting
 */
export function withRateLimit(
    handler: (request: NextRequest) => Promise<NextResponse>,
    maxRequests: number = 10,
    windowMs: number = 60000
) {
    return async (request: NextRequest) => {
        const { allowed, remaining } = checkRateLimit(request, maxRequests, windowMs);

        if (!allowed) {
            return NextResponse.json(
                {
                    error: "Demasiadas solicitudes",
                    message: "Por favor, espera un momento antes de intentar de nuevo.",
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": "0",
                        "Retry-After": "60",
                    }
                }
            );
        }

        const response = await handler(request);

        // Agregar headers de rate limit a la respuesta
        response.headers.set("X-RateLimit-Remaining", remaining.toString());

        return response;
    };
}

/**
 * Combina ambos middlewares (validación + rate limiting)
 */
export function withGoalValidationAndRateLimit(
    handler: (
        request: NextRequest,
        validatedData: { goalName: string; topic: string }
    ) => Promise<NextResponse>,
    maxRequests: number = 10,
    windowMs: number = 60000
) {
    return withRateLimit(
        withGoalValidation(handler),
        maxRequests,
        windowMs
    );
}
