"use client";

import { useState, useCallback } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
] as const;

type Language = (typeof LANGUAGES)[number]["value"];

interface CodeFormProps {
  onSubmit: (code: string, language: Language) => void;
  isLoading: boolean;
}

export function CodeForm({ onSubmit, isLoading }: CodeFormProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [validationError, setValidationError] = useState<string | null>(null);

  const highlightCode = useCallback(
    (code: string) => {
      const grammar =
        language === "python"
          ? Prism.languages.python
          : language === "typescript"
          ? Prism.languages.typescript
          : Prism.languages.javascript;
      return Prism.highlight(code, grammar, language);
    },
    [language]
  );

  const handleSubmit = () => {
    setValidationError(null);

    if (code.length < 30) {
      setValidationError("Code must be at least 30 characters");
      return;
    }
    if (code.length > 500) {
      setValidationError("Code must be at most 500 characters");
      return;
    }

    onSubmit(code, language);
  };

  const charCount = code.length;
  const isValidLength = charCount >= 30 && charCount <= 500;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Submit Code for Review</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Language:</span>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-[140px]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative rounded-md border border-input bg-[#1e1e2e] overflow-hidden">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={highlightCode}
            padding={16}
            className="code-editor min-h-[200px]"
            textareaClassName="outline-none"
            placeholder="Paste your code here (30-500 characters)..."
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs ${
                charCount === 0
                  ? "text-muted-foreground"
                  : isValidLength
                  ? "text-green-600"
                  : "text-destructive"
              }`}
            >
              {charCount}/500 characters
            </span>
            {charCount > 0 && charCount < 30 && (
              <span className="text-xs text-destructive">
                (min 30 required)
              </span>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !isValidLength}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit for Review
              </>
            )}
          </Button>
        </div>

        {validationError && (
          <p className="text-sm text-destructive">{validationError}</p>
        )}
      </CardContent>
    </Card>
  );
}
