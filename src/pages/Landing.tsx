import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import {
  Shield, Users, Send, FileText, ArrowRight, CheckCircle, Clock,
  Smartphone, Droplets, Home, Wrench, PartyPopper, Zap, Globe,
  Code, Webhook, DollarSign, X, BadgeCheck, TrendingDown, Lock,
  BarChart3, Bell, CreditCard, Info, ExternalLink, PenLine
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { CREDIT_PACKAGES } from "@/lib/credit-packages";
import logo from "@/assets/logo.png";

export default function Landing() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Rental Waivers" className="h-8 w-8" />
            <span className="font-heading text-lg font-bold tracking-tight">Rental Waivers</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="#pricing" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">Pricing</Button>
            </a>
            <Link to="/docs" className="hidden md:inline-flex">
              <Button variant="ghost" size="sm">API Docs</Button>
            </Link>
            <Link to="/my-waivers" className="hidden md:inline-flex">
              <Button variant="ghost" size="sm">My Waivers</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/login" className="hidden sm:inline-flex">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO — Peace of mind, trust-first                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Radial glow behind hero */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="container relative pt-32 pb-20">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <Shield className="h-4 w-4" />
              Legally-binding e-signatures with full audit trails
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              Every signature.
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Every detail. Protected.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
              Digital waivers that capture drawn signatures, IP addresses, timestamps, and device info — 
              <strong className="text-foreground"> evidence that holds up when it matters.</strong>
            </p>

            <p className="text-base text-muted-foreground mb-10 max-w-xl mx-auto">
              No monthly fees. No per-seat pricing. Just pay per waiver starting at 6¢.
              Full API access, webhooks, and group waivers included.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link to="/login">
                <Button size="lg" className="gap-2 text-base px-10 py-6 shadow-lg shadow-primary/20">
                  Start for Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#trust">
                <Button variant="outline" size="lg" className="text-base px-8 py-6 gap-2">
                  <Shield className="h-4 w-4" /> See What We Capture
                </Button>
              </a>
            </div>
            <p className="text-sm text-muted-foreground">5 free credits included · No credit card required</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TRUSTED BY                                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="border-y bg-muted/30 py-6">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <span className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium">Trusted by</span>
            <div className="flex items-center gap-8">
              <a href="https://poolrentalnearme.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                <Droplets className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                <span className="font-heading font-semibold text-sm tracking-tight">poolrentalnearme.com</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TRUST & SECURITY — What we capture on every signature   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="trust" className="py-20">
        <div className="container max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
              <Lock className="h-4 w-4" /> Built for legal defensibility
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              More evidence than a paper waiver could ever provide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every signature on Rental Waivers generates a comprehensive, tamper-proof record. Here's exactly what we capture — automatically.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Live audit trail mockup */}
            <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 md:p-8">
              <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-primary mb-6 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Sample Audit Trail
              </h3>
              <div className="space-y-4">
                {[
                  { time: "Mar 10, 2026 · 2:14:03 PM UTC", event: "Waiver sent", detail: "guest@email.com", icon: Send },
                  { time: "Mar 10, 2026 · 2:15:41 PM UTC", event: "Waiver viewed", detail: "IP: 172.58.xxx.xxx · iPhone 15 · Safari", icon: Smartphone },
                  { time: "Mar 10, 2026 · 2:16:28 PM UTC", event: "Waiver signed", detail: "Jane Doe · Drawn signature captured", icon: CheckCircle },
                  { time: "Mar 10, 2026 · 2:16:29 PM UTC", event: "PDF generated", detail: "SHA-256: a3f8c2...d94e1b", icon: Shield },
                ].map((entry, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${i === 3 ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}>
                        <entry.icon className={`h-4 w-4 ${i === 3 ? '' : 'text-muted-foreground'}`} />
                      </div>
                      {i < 3 && <div className="w-px h-full bg-border mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-muted-foreground font-mono">{entry.time}</p>
                      <p className="text-sm font-medium">{entry.event}</p>
                      <p className="text-xs text-muted-foreground">{entry.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security features grid */}
            <div className="space-y-4">
              {[
                { icon: PenLine, title: "Drawn Signature", desc: "Guests sign with their finger or mouse — a unique, legally-recognized mark that's more personal than a typed name.", highlight: true },
                { icon: Globe, title: "IP Address Logging", desc: "We record the signer's IP address, proving where they were when they signed. Critical for dispute resolution." },
                { icon: Clock, title: "Precise UTC Timestamps", desc: "Every action — sent, viewed, signed — is recorded to the exact second in UTC. No ambiguity about when consent was given." },
                { icon: Smartphone, title: "Device & Browser Fingerprint", desc: "We capture the device type, operating system, and browser. Another layer of proof that a real person signed." },
                { icon: Lock, title: "SHA-256 Document Hash", desc: "Every signed PDF gets a cryptographic hash. If even one pixel changes, the hash breaks — proving the document hasn't been tampered with." },
                { icon: Shield, title: "7-Year Secure Storage", desc: "Signed waivers are stored as encrypted, tamper-proof PDFs for 7+ years. Configurable up to 99 years." },
              ].map((item) => (
                <div key={item.title} className={`flex items-start gap-4 rounded-xl p-4 ${item.highlight ? 'bg-primary/5 border border-primary/15' : 'border bg-card'}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.highlight ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}>
                    <item.icon className={`h-4 w-4 ${item.highlight ? '' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sm mb-0.5">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              All signatures comply with the <strong className="text-foreground">ESIGN Act</strong> and <strong className="text-foreground">UETA</strong> — legally binding in all 50 US states.
            </p>
            <Link to="/login">
              <Button className="gap-2">
                Start Protecting Your Business <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* COMPARISON STRIP — Us vs. Them                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="border-y bg-foreground text-background py-16">
        <div className="container max-w-5xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-3">
            The smarter solution
          </h2>
          <p className="text-center text-background/60 mb-12 text-lg">
            Compare us to any waiver platform. We win on price, flexibility, and features.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Them */}
            <div className="rounded-2xl border border-background/10 bg-background/5 p-8">
              <p className="text-sm font-medium text-background/40 uppercase tracking-wider mb-6">Other Platforms</p>
              <ul className="space-y-4">
                {[
                  "$29–$99/month — even if you send zero waivers",
                  "Per-seat pricing for team members",
                  "API access locked behind premium tiers",
                  "Webhooks? That's an enterprise add-on",
                  "Group waivers cost extra",
                  "Locked into annual contracts",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-background/60">
                    <X className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Us */}
            <div className="rounded-2xl border-2 border-primary bg-primary/10 p-8 relative">
              <div className="absolute -top-3 left-6">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">RENTAL WAIVERS</span>
              </div>
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-6">A better way</p>
              <ul className="space-y-4">
                {[
                  "Pay per waiver — starting at 6¢ each",
                  "Unlimited team members, always",
                  "Full REST API included with every account",
                  "Webhooks on every plan — no upsell",
                  "Group waivers included — one link, unlimited signers",
                  "No contracts. Credits never expire.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-background">
                    <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-green-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* VALUE PROP STATS                                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-16 border-b">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "6¢", label: "per waiver", sub: "at volume" },
              { value: "$0", label: "monthly fee", sub: "ever" },
              { value: "60s", label: "to sign", sub: "on any device" },
              { value: "∞", label: "team members", sub: "always free" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-4xl md:text-5xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm font-medium mt-1">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20">
        <div className="container max-w-5xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Two ways to send waivers
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">Pick the one that fits. Or use both.</p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Automatic */}
            <div className="rounded-2xl border-2 border-primary bg-card p-8 relative">
              <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Zap className="h-3 w-3" /> AUTOMATIC
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3 mt-2">Marketplace Integration</h3>
              <p className="text-muted-foreground mb-5">
                Connect your marketplace via webhook. When a booking comes in, we auto-generate a waiver with the customer's info and email them a signing link. Zero manual work.
              </p>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Connect your marketplace in Settings" },
                  { step: "2", text: "Customer books — waiver sent automatically" },
                  { step: "3", text: "They sign on their phone. You're covered." },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3 text-sm">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{s.step}</div>
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual */}
            <div className="rounded-2xl border bg-card p-8">
              <h3 className="font-heading text-xl font-semibold mb-3 mt-2">Manual Send</h3>
              <p className="text-muted-foreground mb-5">
                Pick a template, enter the customer's email, and send. Or share a group link for parties. Great for one-off bookings or walk-ins.
              </p>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Pick a waiver template" },
                  { step: "2", text: "Send via email or share the link" },
                  { step: "3", text: "They sign. You get notified." },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3 text-sm">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">{s.step}</div>
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* DEVELOPER-FIRST — API & Webhooks callout               */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="border-t bg-secondary/30 py-20">
        <div className="container max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1 text-sm text-primary mb-4">
                <Code className="h-4 w-4" /> Developer-First
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Full API access.
                <br />No premium tier required.
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Every account gets REST API access and real-time webhooks. Build integrations with your booking platform, CRM, or custom app. No "enterprise plan" gatekeeping.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Code, text: "REST API — create envelopes, check status, manage templates" },
                  { icon: Webhook, text: "Webhooks — get notified on sign, view, expiry events" },
                  { icon: Globe, text: "Marketplace webhooks — auto-generate waivers from bookings" },
                  { icon: Lock, text: "API keys with role-based access control" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link to="/docs">
                  <Button variant="outline" className="gap-2">
                    Read the API Docs <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Code snippet mock */}
            <div className="rounded-2xl border bg-foreground text-background p-6 font-mono text-sm overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-background/40">api-example.sh</span>
              </div>
              <pre className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
{`curl -X POST \\
  https://api.rentalwaivers.com/v1/envelopes \\
  -H "Authorization: Bearer rw_live_..." \\
  -d '{
    "template_id": "tmpl_pool_waiver",
    "signer_email": "guest@email.com",
    "signer_name": "Jane Doe",
    "variables": {
      "property": "Sunset Pool",
      "date": "2026-03-15"
    }
  }'`}
              </pre>
              <div className="mt-4 pt-4 border-t border-background/10">
                <p className="text-xs text-background/40">// Response</p>
                <pre className="text-xs text-green-400 mt-1">{`{ "id": "env_7x8k...", "status": "sent" }`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* GROUP WAIVERS                                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="container max-w-5xl">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground mb-4">
                <Users className="h-4 w-4" /> Group Waivers
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">
                One link for the whole group
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                A family of 6 booked your pool? Don't ask for 6 email addresses. Send one link.
                Each person signs on their phone. You see every signature in real time.
              </p>
              <ul className="space-y-3">
                {[
                  "No emails needed upfront — don't slow down checkout",
                  "Each person signs individually with their own name",
                  "Live updates — watch signatures come in",
                  "Share via text, QR code, or booking email",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card p-8">
              <div className="space-y-4">
                {[
                  { name: "Mike Johnson", time: "2 min ago" },
                  { name: "Sarah Johnson", time: "5 min ago" },
                  { name: "Tommy Johnson", time: "8 min ago" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-green-500" /></div>
                    <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">Signed {s.time}</p></div>
                  </div>
                ))}
                <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"><Clock className="h-4 w-4 text-muted-foreground" /></div>
                  <div><p className="text-sm text-muted-foreground">Waiting for 3 more...</p></div>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">3 of 6 guests signed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FEATURES — Everything included                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="border-t bg-secondary/30 py-20">
        <div className="container max-w-5xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-3">
            Everything included. No upsells.
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">
            Other platforms lock features behind premium tiers. We don't.
          </p>

          <TooltipProvider delayDuration={200}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Zap, title: "Marketplace integration", desc: "Auto-send waivers when bookings come in. ShareTribe, custom platforms, anything with a webhook.", tooltip: "A marketplace integration connects your booking platform (like Swimply, ShareTribe, or your own website) so waivers are sent automatically when someone books — zero manual work." },
                { icon: Users, title: "Unlimited group waivers", desc: "One link, unlimited signers. No per-signer charges.", tooltip: "Group waivers let you send a single link to a party or family. Each person signs individually on their own phone. Great for pool parties, tours, and events." },
                { icon: Shield, title: "Legally defensible signatures", desc: "Drawn signatures, timestamps, IP addresses, device info. Full audit trail.", tooltip: "Every signature captures the signer's full name, drawn signature, IP address, device type, and exact timestamp — creating evidence that holds up in legal disputes." },
                { icon: Code, title: "Full REST API", desc: "Create envelopes, manage templates, check statuses. No premium tier needed.", tooltip: "An API (Application Programming Interface) lets your own software or website create and manage waivers programmatically — no manual clicking needed. Think of it as a way for your systems to talk to ours." },
                { icon: Webhook, title: "Real-time webhooks", desc: "Get notified on every event: viewed, signed, expired. Build automations.", tooltip: "A webhook is an automatic notification. When a guest views or signs a waiver, we instantly notify your system — so you can trigger next steps like sending check-in instructions or updating your calendar." },
                { icon: Bell, title: "Auto-reminders", desc: "Unsigned waivers get automatic reminder emails. Set your own cadence.", tooltip: "If a guest hasn't signed their waiver, the system automatically sends them a friendly reminder email. You set how often — so you never have to manually follow up." },
                { icon: BarChart3, title: "Analytics dashboard", desc: "See signing rates, response times, and team activity at a glance.", tooltip: "Your dashboard shows you key metrics: how many waivers were sent, viewed, and signed, plus average signing times and team member activity." },
                { icon: Lock, title: "Team roles & API keys", desc: "Add your whole team. Role-based access. Multiple API keys.", tooltip: "Invite team members with different permission levels. Admins manage everything; hosts can view and send waivers. API keys let different integrations connect securely." },
                { icon: CreditCard, title: "Auto-recharge", desc: "Set a threshold and package. Credits refill automatically when you run low.", tooltip: "Never run out of credits mid-season. Set a minimum balance (like 50 credits), and when you drop below it, your account automatically purchases more using your saved payment method." },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-4 rounded-xl border bg-card p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="font-heading font-semibold">{f.title}</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[280px] text-xs leading-relaxed">
                          {f.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SIGNING EXPERIENCE                                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Your guests sign in 60 seconds
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">
            No app to download. No account to create. Tap the link, sign with their finger, done.
          </p>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              { icon: Smartphone, title: "Open the link", desc: "Works on any device" },
              { icon: FileText, title: "Read the waiver", desc: "Waiver text displayed clearly" },
              { emoji: "✍️", title: "Sign their name", desc: "Draw with their finger" },
              { icon: CheckCircle, title: "Done", desc: "Confirmation email sent", iconColor: "text-green-500" },
            ].map((step) => (
              <div key={step.title} className="rounded-xl border bg-card p-5 text-center">
                {'icon' in step && step.icon ? (
                  <step.icon className={`h-8 w-8 mx-auto mb-3 ${step.iconColor || 'text-primary'}`} />
                ) : (
                  <span className="text-3xl block mb-1">{step.emoji}</span>
                )}
                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* WHO IT'S FOR                                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="border-t bg-secondary/30 py-20">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Works for any type of rental
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">
            Pre-built templates ready to go. Customize and start sending.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Droplets, title: "Pool & Hot Tub", desc: "Swimply hosts, backyard pools, hot tub rentals", color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: Home, title: "Vacation Rentals", desc: "Airbnb, VRBO, short-term rental homes", color: "text-green-500", bg: "bg-green-500/10" },
              { icon: Wrench, title: "Equipment", desc: "Bikes, kayaks, tools, cameras, sports gear", color: "text-orange-500", bg: "bg-orange-500/10" },
              { icon: PartyPopper, title: "Events & Venues", desc: "Party spaces, event halls, outdoor venues", color: "text-purple-500", bg: "bg-purple-500/10" },
            ].map((cat) => (
              <div key={cat.title} className="rounded-xl border bg-card p-6 text-center">
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${cat.bg}`}>
                  <cat.icon className={`h-6 w-6 ${cat.color}`} />
                </div>
                <h3 className="font-heading font-semibold mb-1">{cat.title}</h3>
                <p className="text-sm text-muted-foreground">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* PRICING — Credit packs, no subscription                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-20">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <DollarSign className="h-4 w-4" /> No monthly subscription
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
              Pay per waiver. That's it.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Buy credits when you need them. Use them whenever. No contracts, no expiration, no hidden fees.
              Every feature included with every purchase.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {CREDIT_PACKAGES.map((pkg) => (
              <div key={pkg.id} className={`rounded-xl border p-6 text-center transition-shadow hover:shadow-lg ${pkg.popular ? "border-primary border-2 bg-card relative ring-2 ring-primary/10" : "bg-card"}`}>
                {pkg.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</div>}
                <p className="font-heading text-2xl font-bold mb-1">{pkg.credits.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mb-3">credits</p>
                <p className="font-heading text-3xl font-bold mb-1">${pkg.price}</p>
                <p className="text-xs text-muted-foreground mb-4">{pkg.perWaiver}/waiver</p>
                <Link to="/login">
                  <Button variant={pkg.popular ? "default" : "outline"} size="sm" className="w-full">
                    Buy Credits
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3 text-center">
            {[
              { icon: BadgeCheck, text: "All features included" },
              { icon: Clock, text: "Credits never expire" },
              { icon: CreditCard, text: "Auto-recharge available" },
            ].map((item) => (
              <div key={item.text} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <item.icon className="h-4 w-4 text-primary" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-foreground py-20">
        <div className="container text-center max-w-2xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-background mb-4">
            Ready to stop overpaying?
          </h2>
          <p className="text-background/60 text-lg mb-4">
            Join hosts who switched from $50/month subscriptions to pay-per-waiver pricing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-background/40 mb-8">
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> No credit card</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> 5 free credits</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Full API access</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> All features included</span>
          </div>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="gap-2 text-base px-10 py-6 shadow-lg">
              Create Your Free Account <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
