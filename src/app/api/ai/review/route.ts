import { streamText, LanguageModelV1 } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";

const ALLOWED_LANGUAGES = ["javascript", "typescript", "python"] as const;

const requestSchema = z.object({
    code: z
        .string()
        .min(30, "Code must be at least 30 characters")
        .max(500, "Code must be at most 500 characters"),
    language: z.enum(ALLOWED_LANGUAGES, {
        errorMap: () => ({ message: "Please select a valid language" }),
    }),
});

const SPECIALTY = "Security";

function buildSystemPrompt(language: string): string {
    return `Act as a senior ${SPECIALTY} engineer. Analyze this ${language} code for ${SPECIALTY.toLowerCase()} issues.
Format response as:

1. Brief summary (1 sentence)
2. Key findings (bulleted list)
3. Most critical recommendation

Avoid markdown. Be technical but concise.`;
}

function getMockFeedback(language: string): string {
    const feedbackMap: Record<string, string> = {
        javascript: `Code analysis for JavaScript:

1. Summary: Lacks input validation which exposes the application to injection attacks.

2. Key findings:
- No CORS headers configured
- Missing rate limiting protection
- No content validation on user inputs
- Potential XSS vulnerabilities

3. Most critical recommendation: 
Implement input sanitization using joi or zod libraries. Add proper CORS policy and rate limiting middleware.`,
        typescript: `Code analysis for TypeScript:

1. Summary: Utility function is functional but lacks proper type safety guards for edge cases.

2. Key findings:
- Missing null/undefined input validation
- No error handling for class processing
- Return type could be more specific
- No input bounds checking

3. Most critical recommendation:
Enable strict TypeScript mode. Add explicit input validation and error boundaries. Consider using type guards for safer class manipulation.`,
        python: `Code analysis for Python:

1. Summary: Module has potential security issues with data handling and missing exception management.

2. Key findings:
- No input validation on user data
- Missing exception handling for file operations
- Potential for uncontrolled resource consumption
- No logging for security events

3. Most critical recommendation:
Add comprehensive input validation. Implement try-catch blocks for all I/O operations. Add security logging and rate limiting to prevent abuse.`,
    };

    return (
        feedbackMap[language] ||
        "Security review completed. Code analysis reveals several areas for security improvement. Implement input validation and proper error handling."
    );
}

// Create a mock AI provider that works with streamText
function createMockModel(feedbackText: string): LanguageModelV1 {
    return {
        specificationVersion: "v1",
        provider: "mock",
        modelId: "mock-security-reviewer",
        defaultObjectGenerationMode: "json",

        async doGenerate() {
            throw new Error("doGenerate not implemented for mock");
        },

        async doStream() {
            return {
                stream: new ReadableStream({
                    async start(controller) {
                        const chunkSize = 20;
                        for (let i = 0; i < feedbackText.length; i += chunkSize) {
                            const textChunk = feedbackText.slice(i, i + chunkSize);

                            controller.enqueue({
                                type: "text-delta" as const,
                                textDelta: textChunk,
                            });

                            await new Promise((resolve) => setTimeout(resolve, 30));
                        }

                        controller.enqueue({
                            type: "finish" as const,
                            finishReason: "stop" as const,
                            usage: { promptTokens: 10, completionTokens: 50 },
                        });

                        controller.close();
                    },
                }),
                rawCall: { rawPrompt: null, rawSettings: {} },
                warnings: [],
            };
        },
    } as LanguageModelV1;
}

async function streamMockResponse(
    text: string,
    code: string,
    language: string
): Promise<Response> {
    const mockModel = createMockModel(text);

    const result = await streamText({
        model: mockModel,
        prompt: code,
        onFinish: async ({ text: generatedText }) => {
            try {
                await prisma.submission.create({
                    data: {
                        code,
                        language,
                        feedback: generatedText,
                    },
                });
            } catch (dbError) {
                console.error("Failed to save submission:", dbError);
            }
        },
    });

    return result.toDataStreamResponse();
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            return new Response(
                JSON.stringify({
                    error: parsed.error.errors.map((e) => e.message).join(", "),
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { code, language } = parsed.data;

        // Check for mock mode
        console.log(process.env.USE_MOCK_AI, process.env.USE_MOCK_AI === "true");
        if (process.env.USE_MOCK_AI === "true") {
            console.log("Using mock AI mode for language:", language);
            return streamMockResponse(getMockFeedback(language), code, language);
        }

        // Real OpenAI mode
        const result = await streamText({
            model: openai("gpt-4o-mini"),
            system: buildSystemPrompt(language),
            prompt: code,
            maxTokens: 450,
            onFinish: async ({ text }) => {
                try {
                    await prisma.submission.create({
                        data: {
                            code,
                            language,
                            feedback: text,
                        },
                    });
                } catch (dbError) {
                    console.error("Failed to save submission:", dbError);
                }
            },
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error("AI review error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to generate AI review. Please check your API key and try again." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
