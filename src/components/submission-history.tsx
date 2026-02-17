"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import {
  History,
  Code2,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react";

interface Submission {
  id: string;
  code: string;
  language: string;
  feedback: string;
  rating: string | null;
  createdAt: Date;
}

export function SubmissionHistory() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data: submissions,
    isLoading,
    error,
  } = trpc.submissions.getAll.useQuery();

  const utils = trpc.useUtils();

  const rateMutation = trpc.submissions.rate.useMutation({
    onSuccess: () => {
      utils.submissions.getAll.invalidate();
    },
  });

  const selectedSubmission = selectedId
    ? submissions?.find((s: any) => s.id === selectedId)
    : null;

  const handleRate = (id: string, rating: "up" | "down") => {
    rateMutation.mutate({ id, rating });
  };

  const truncate = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const languageBadgeColor = (lang: string) => {
    switch (lang) {
      case "javascript":
        return "bg-yellow-100 text-yellow-800";
      case "typescript":
        return "bg-blue-100 text-blue-800";
      case "python":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (selectedSubmission) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Submission Detail</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedId(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${languageBadgeColor(
                selectedSubmission.language
              )}`}
            >
              {selectedSubmission.language}
            </span>
            <span>{formatDate(selectedSubmission.createdAt)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto space-y-4">
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Code
            </h4>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono whitespace-pre-wrap">
              {selectedSubmission.code}
            </pre>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Feedback
            </h4>
            <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
              {selectedSubmission.feedback}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              Was this helpful?
            </span>
            <Button
              variant={
                selectedSubmission.rating === "up" ? "default" : "outline"
              }
              size="sm"
              onClick={() => handleRate(selectedSubmission.id, "up")}
              disabled={rateMutation.isPending}
              className="h-7 px-2"
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              <span className="text-xs">Yes</span>
            </Button>
            <Button
              variant={
                selectedSubmission.rating === "down" ? "destructive" : "outline"
              }
              size="sm"
              onClick={() => handleRate(selectedSubmission.id, "down")}
              disabled={rateMutation.isPending}
              className="h-7 px-2"
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              <span className="text-xs">No</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          History
        </CardTitle>
        <CardDescription>Past code reviews</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load history</p>
        ) : !submissions || submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Code2 className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No submissions yet</p>
            <p className="text-xs text-muted-foreground/70">
              Submit code to see your review history
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {submissions.map((submission: any) => (
              <button
                key={submission.id}
                className="w-full text-left p-3 rounded-md border hover:bg-accent transition-colors group"
                onClick={() => setSelectedId(submission.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${languageBadgeColor(
                      submission.language
                    )}`}
                  >
                    {submission.language}
                  </span>
                  <div className="flex items-center gap-1">
                    {submission.rating === "up" && (
                      <ThumbsUp className="h-3 w-3 text-green-600" />
                    )}
                    {submission.rating === "down" && (
                      <ThumbsDown className="h-3 w-3 text-red-500" />
                    )}
                    <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {truncate(submission.code, 60)}
                </p>
                <p className="text-[11px] text-muted-foreground/70 mt-1 truncate">
                  {truncate(submission.feedback, 80)}
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">
                  {formatDate(submission.createdAt)}
                </p>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
