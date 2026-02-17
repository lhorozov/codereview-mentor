import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

const ALLOWED_LANGUAGES = ["javascript", "typescript", "python"] as const;

const createSubmissionSchema = z.object({
  code: z
    .string()
    .min(30, "Code must be at least 30 characters")
    .max(500, "Code must be at most 500 characters"),
  language: z.enum(ALLOWED_LANGUAGES, {
    errorMap: () => ({ message: "Please select a valid language" }),
  }),
  feedback: z.string(),
});

const rateSubmissionSchema = z.object({
  id: z.string(),
  rating: z.enum(["up", "down"]),
});

export const submissionsRouter = router({
  create: publicProcedure
    .input(createSubmissionSchema)
    .mutation(async ({ input }) => {
      try {
        const submission = await prisma.submission.create({
          data: {
            code: input.code,
            language: input.language,
            feedback: input.feedback,
          },
        });
        return submission;
      } catch (error) {
        throw new Error("Failed to save submission to database");
      }
    }),

  getAll: publicProcedure.query(async () => {
    try {
      const submissions = await prisma.submission.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return submissions;
    } catch (error) {
      throw new Error("Failed to fetch submissions from database");
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const submission = await prisma.submission.findUnique({
          where: { id: input.id },
        });
        if (!submission) {
          throw new Error("Submission not found");
        }
        return submission;
      } catch (error) {
        if (error instanceof Error && error.message === "Submission not found") {
          throw error;
        }
        throw new Error("Failed to fetch submission");
      }
    }),

  rate: publicProcedure
    .input(rateSubmissionSchema)
    .mutation(async ({ input }) => {
      try {
        const submission = await prisma.submission.update({
          where: { id: input.id },
          data: { rating: input.rating },
        });
        return submission;
      } catch (error) {
        throw new Error("Failed to rate submission");
      }
    }),
});
