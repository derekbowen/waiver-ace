import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Loader2 } from "lucide-react";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-waiver-question`;

interface AiQuestionBoxProps {
  pageContext?: string;
  suggestedQuestions?: string[];
}

export function AiQuestionBox({ pageContext, suggestedQuestions }: AiQuestionBoxProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const askQuestion = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 5) return;

    setQuestion(trimmed);
    setAnswer("");
    setError("");
    setIsLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ question: trimmed, pageContext }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setError(data.error || "Unable to answer right now. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        setError("Unable to get a response.");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullAnswer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullAnswer += content;
              setAnswer(fullAnswer);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ") || raw.slice(6).trim() === "[DONE]") continue;
          try {
            const parsed = JSON.parse(raw.slice(6).trim());
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullAnswer += content;
              setAnswer(fullAnswer);
            }
          } catch { /* ignore */ }
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [pageContext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askQuestion(question);
  };

  const defaults = suggestedQuestions || [
    "Are digital waivers legally binding?",
    "How does pay-per-waiver pricing work?",
    "Can guests sign on their phone?",
  ];

  return (
    <section className="py-16 border-t bg-muted/30">
      <div className="container max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium mb-4 bg-primary/5 text-primary border-primary/20">
            <Sparkles className="h-3 w-3" /> AI-Powered Answers
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            Have a Question About Waivers?
          </h2>
          <p className="text-sm text-muted-foreground">
            Ask anything about digital waivers, liability protection, or how RentalWaivers works.
          </p>
        </div>

        {/* Suggested questions */}
        {!answer && !isLoading && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {defaults.map((q, i) => (
              <button
                key={i}
                onClick={() => { setQuestion(q); askQuestion(q); }}
                className="text-xs rounded-full border px-3 py-1.5 bg-background hover:bg-primary/5 hover:border-primary/30 transition-colors text-muted-foreground hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Do I need a waiver for my kayak rental business?"
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || question.trim().length < 5} size="icon">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        {/* Answer */}
        {(answer || error) && (
          <Card>
            <CardContent className="py-5">
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : (
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {answer}
                  {isLoading && <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-[10px] text-muted-foreground/60 text-center mt-3">
          AI-generated answers are for informational purposes only and do not constitute legal advice.
        </p>
      </div>
    </section>
  );
}
