import { Link } from "react-router-dom";
import { SeoPageLayout, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, BarChart3, FileText, List, Search, Send, ArrowRight, CheckCircle, KeyRound } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/structured-data";

const actions = [
  { icon: BarChart3, title: "Account summary", text: "Organization name, remaining credits, and waiver counts by status." },
  { icon: FileText, title: "List templates", text: "Active templates by default; optionally include inactive templates." },
  { icon: List, title: "List waivers", text: "Filter by status or signer email; return up to 100 results, newest first." },
  { icon: Search, title: "Get waiver details", text: "Use a waiver ID to see status, signer details, and recent activity." },
  { icon: Send, title: "Send a waiver", text: "Requires a template ID and signer email. Optional: signer name, booking reference, rental date, and expiration days." },
];

const faqItems = [
  {
    question: "Can an AI assistant send waivers for my rental business?",
    answer:
      "Yes. RentalWaivers supports AI agents through the Model Context Protocol (MCP). Connect an assistant such as Claude, ChatGPT, or Cursor and ask it to send a waiver, check who has signed, or report your remaining credits.",
  },
  {
    question: "How do I connect an AI agent?",
    answer:
      "Sign in, open Settings → Agent access, and create an agent key. Paste the key into your AI tool's MCP settings. You can choose read-only access or full access that can also send waivers, and you can turn a key off at any time.",
  },
  {
    question: "Does it cost extra to use AI agents?",
    answer:
      "No. Agent access is free. Waivers sent by an agent use the same pay-per-waiver credits as waivers sent from the app — no monthly fee.",
  },
  {
    question: "Can an agent only see my own account?",
    answer:
      "Yes. Every agent key is tied to one business account and can only see that account's templates and waivers.",
  },
];

export default function AiAgentsPage() {
  const url = "https://www.rentalwaivers.com/ai-agents";
  return (
    <SeoPageLayout
      metaTitle="AI Agent Waiver Integration (MCP) | RentalWaivers"
      metaDescription="Connect Claude, ChatGPT or any MCP-compatible AI agent to RentalWaivers. Send waivers, check signing status, list templates and see credits — by just asking."
      canonicalPath="/ai-agents"
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "AI Agents", url },
          ]),
          faqSchema(faqItems),
        ]}
      />

      <section className="relative overflow-hidden border-b bg-muted/40">
        <div className="container max-w-6xl py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            <Bot className="h-3.5 w-3.5" /> New · AI agent access
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Let your AI assistant handle your waivers.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect Claude, ChatGPT, Cursor or any MCP-compatible agent to your
            RentalWaivers account. Ask it to send a waiver, check who has signed, or
            see your remaining credits.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/login?mode=signup">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/settings/agents">Create an Agent Key</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Free to connect</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Read-only or full access</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Turn keys off anytime</span>
          </div>
        </div>
      </section>

      <SeoSection title="What your agent can do">
        <div className="grid md:grid-cols-2 gap-6">
          {actions.map((a) => (
            <Card key={a.title}>
              <CardContent className="pt-6 flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <a.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">{a.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Set up in three steps" muted>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            "Sign in and open Settings → Agent access.",
            "Create a key and choose read-only or full access.",
            "Paste the key into your AI tool's MCP settings and start asking.",
          ].map((s, i) => (
            <Card key={s}>
              <CardContent className="pt-6">
                <KeyRound className="h-5 w-5 text-primary mb-3" />
                <div className="font-heading font-bold mb-1">Step {i + 1}</div>
                <p className="text-sm text-muted-foreground">{s}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      <SeoFaq items={faqItems} />

      <SeoCta
        headline="Put your waivers on autopilot"
        subtext="Create your free account, add a waiver template, and connect your AI assistant in minutes. Pay only when guests sign — no monthly fee."
      />
    </SeoPageLayout>
  );
}
