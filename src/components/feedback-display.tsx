"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, AlertCircle } from "lucide-react";

interface FeedbackDisplayProps {
  feedback: string;
  isLoading: boolean;
  error: string | null;
}

export function FeedbackDisplay({
  feedback,
  isLoading,
  error,
}: FeedbackDisplayProps) {
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Review Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && !feedback) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-sm">
            Submit your code to receive a security-focused AI review
          </p>
          <p className="text-muted-foreground/70 text-xs mt-1">
            Our Security Specialist will analyze your code for vulnerabilities
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security Review
          {isLoading && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Analyzing...
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !feedback ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
            {feedback}
            {isLoading && (
              <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
