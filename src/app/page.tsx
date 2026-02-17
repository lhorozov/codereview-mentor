"use client";

import { useState, useCallback } from "react";
import { useCompletion } from "ai/react";
import { CodeForm } from "@/components/code-form";
import { FeedbackDisplay } from "@/components/feedback-display";
import { SubmissionHistory } from "@/components/submission-history";
import { trpc } from "@/trpc/client";
import { Shield } from "lucide-react";

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const {
    completion,
    isLoading,
    complete,
    setCompletion,
  } = useCompletion({
    api: "/api/ai/review",
    onError: (err) => {
      setError(
        err.message || "Failed to generate review. Please check your API key."
      );
    },
    onFinish: () => {
      // Refresh submission history after AI review completes
      utils.submissions.getAll.invalidate();
    },
  });

  const handleSubmit = useCallback(
    async (code: string, language: string) => {
      setError(null);
      setCompletion("");
      
      await complete(code, {
        body: { code, language },
      });
    },
    [complete, setCompletion]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">CodeReview Mentor</h1>
            <p className="text-xs text-muted-foreground">
              AI-powered Security Code Review
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Submission History */}
          <aside className="w-full lg:w-80 lg:shrink-0 order-2 lg:order-1">
            <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)]">
              <SubmissionHistory />
            </div>
          </aside>

          {/* Main Area */}
          <div className="flex-1 space-y-6 order-1 lg:order-2">
            <CodeForm onSubmit={handleSubmit} isLoading={isLoading} />
            <FeedbackDisplay
              feedback={completion}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
