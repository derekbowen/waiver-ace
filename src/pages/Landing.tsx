import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Zap, Globe, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Template Builder",
    description: "Create reusable waiver templates with dynamic variables. WYSIWYG editor with versioning.",
  },
  {
    icon: Shield,
    title: "Legally Valid E-Signatures",
    description: "Full audit trail with timestamps, IP addresses, and user agents. Tamper-proof PDF generation.",
  },
  {
    icon: Zap,
    title: "REST API & Webhooks",
    description: "Create envelopes programmatically. HMAC-signed webhooks for real-time status updates.",
  },
  {
    icon: Globe,
    title: "Multi-Tenant & Secure",
    description: "Organization-level isolation. JWT auth, rate limiting, and encrypted secrets.",
  },
];

const steps = [
  "Admin creates a waiver template with variables",
  "Toggle required signing on or off per template",
  "System creates an envelope via API with booking data",
  "Customer receives signing link via email",
  "Signer reviews waiver and completes e-signature",
  "Webhook fires with booking_id and envelope_id",
  "Admin views signed documents in dashboard",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight">Rental Waivers</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container pt-32 pb-20">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <div className="mb-4 inline-flex items-center rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
            E-Signatures for Marketplace Bookings
          </div>
          <h1 className="font-heading text-5xl font-bold tracking-tight leading-[1.1] mb-6">
            Effortless liability waivers
            <br />
            <span className="text-primary">for every booking</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate waivers from templates, collect legally-valid e-signatures with full audit trails,
            and optionally require signing before booking confirmation — all via webhooks and API.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Start Building <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg">See How It Works</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-secondary/30 py-20">
        <div className="container">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">Built for Marketplace Operations</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="container max-w-2xl">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {i + 1}
                </div>
                <p className="text-sm pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16">
        <div className="container text-center">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground mb-4">
            Ready to streamline your waivers?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Set up in minutes. Toggle required signing on or off — no code changes needed.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Your Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <FileText className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-foreground">Rental Waivers</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Rental Waivers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
