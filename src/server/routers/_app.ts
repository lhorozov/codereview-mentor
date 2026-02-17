import { router } from "../trpc";
import { submissionsRouter } from "./submissions";

export const appRouter = router({
  submissions: submissionsRouter,
});

export type AppRouter = typeof appRouter;
