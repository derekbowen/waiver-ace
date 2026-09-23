import { useEffect, useRef, useState } from "react";
import { Lock, X, Send, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const SUPPORT_PHONE_DISPLAY = "909-272-8096";
const SUPPORT_PHONE_LINK = "sms:+19092728096";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content: `Hey — have a problem? Ask me anything about waivers, or text us at ${SUPPORT_PHONE_DISPLAY} to reach a real person.`,
};

export default function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("support-chat", {
        body: { messages: next.filter((m) => m !== GREETING) },
      });
      const reply =
        !error && data?.reply
          ? String(data.reply)
          : `Text us at ${SUPPORT_PHONE_DISPLAY} and a real person will help you out.`;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Text us at ${SUPPORT_PHONE_DISPLAY} and a real person will help you out.` },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-[60] flex h-[26rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Need help?</p>
                <a href={SUPPORT_PHONE_LINK} className="text-xs text-muted-foreground underline">
                  Text us: {SUPPORT_PHONE_DISPLAY}
                </a>
              </div>
            </div>
            <button aria-label="Close chat" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[90%] text-sm text-foreground"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <p className="animate-pulse text-sm text-muted-foreground">Thinking…</p>}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              maxLength={800}
              className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="icon" className="h-9 w-9 rounded-full" disabled={loading || !input.trim()} aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <a
            href={SUPPORT_PHONE_LINK}
            className="flex items-center justify-center gap-2 border-t border-border bg-muted/40 py-2 text-xs font-medium text-foreground"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Speak with a real person — text {SUPPORT_PHONE_DISPLAY}
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Need help? Text us"
        className="fixed bottom-5 right-4 z-[60] flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-xl transition hover:opacity-90"
      >
        <Lock className="h-5 w-5" />
        <span className="text-sm font-semibold">Need help? Text us</span>
      </button>
    </>
  );
}
