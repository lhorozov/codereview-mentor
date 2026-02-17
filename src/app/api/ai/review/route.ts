import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
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
