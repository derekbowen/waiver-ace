import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import {
  Shield, Users, Send, FileText, ArrowRight, CheckCircle, Clock,
  Smartphone, Droplets, Home, Wrench, PartyPopper, Zap, Globe,
  Code, Webhook, DollarSign, X, BadgeCheck, TrendingDown, Lock,
  BarChart3, Bell, CreditCard, Info, ExternalLink, PenLine, ChevronDown, Menu,
  Star, QrCode, Play
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { CREDIT_PACKAGES } from "@/lib/credit-packages";
import logo from "@/assets/logo.png";
import heroImage from "@/assets/hero-lifestyle.jpg";
import { useState } from "react";

export default function Landing() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Rental Waivers" className="h-8 w-8" />
              <span className="font-heading text-lg font-bold tracking-tight">Rental Waivers</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  Product <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/waiver-software" className="cursor-pointer">
                    <Shield className="h-4 w-4 mr-2" /> Waiver Software
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/rental-waiver-software" className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" /> Rental Waivers
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/waiver-templates" className="cursor-pointer">
                    <PenLine className="h-4 w-4 mr-2" /> Waiver Templates
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/industries" className="cursor-pointer">
                    <Globe className="h-4 w-4 mr-2" /> Industries
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/docs" className="cursor-pointer">
                    <Code className="h-4 w-4 mr-2" /> API Docs
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  Compare <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/compare" className="cursor-pointer">Compare All</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/alternatives/smartwaiver-alternative" className="cursor-pointer">vs Smartwaiver</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/alternatives/waiverforever-alternative" className="cursor-pointer">vs WaiverForever</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/alternatives/docusign-waiver-alternative" className="cursor-pointer">vs DocuSign</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/alternatives/wherewolf-alternative" className="cursor-pointer">vs Wherewolf</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="#pricing">
              <Button variant="ghost" size="sm">Pricing</Button>
            </a>
            <Link to="/waiver-laws">
              <Button variant="ghost" size="sm">Waiver Laws</Button>
            </Link>
            <Link to="/my-waivers">
              <Button variant="ghost" size="sm">My Waivers</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </nav>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/login">
              <Button size="sm">Get Started</Button>
            </Link>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-12">
                <nav className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">Product</p>
                  <Link to="/waiver-software" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Waiver Software</Link>
                  <Link to="/rental-waiver-software" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Rental Waivers</Link>
                  <Link to="/waiver-templates" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Waiver Templates</Link>
                  <Link to="/industries" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Industries</Link>
                  <Link to="/docs" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">API Docs</Link>

                  <div className="my-2 border-t" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">Compare</p>
                  <Link to="/compare" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Compare All</Link>
                  <Link to="/alternatives/smartwaiver-alternative" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">vs Smartwaiver</Link>
                  <Link to="/alternatives/docusign-waiver-alternative" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">vs DocuSign</Link>

                  <div className="my-2 border-t" />
                  <a href="#pricing" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Pricing</a>
                  <Link to="/waiver-laws" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Waiver Laws</Link>
                  <Link to="/my-waivers" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">My Waivers</Link>

                  <div className="my-2 border-t" />
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Sign In</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO — Warm, lifestyle-focused                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-teal-50/30" />

        <div className="container relative pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            {/* Left: copy */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Shield className="h-4 w-4" />
                Legally-binding · ESIGN Act compliant
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-5">
                Get waivers signed
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">before guests arrive</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-3 max-w-lg leading-relaxed">
                Guests sign on their phone in 60 seconds. You get a legally-binding waiver with full audit trail — drawn signature, IP address, timestamp, and device info.
              </p>

              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                No monthly fees. Pay per waiver starting at 6¢. No contracts.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3 mb-4">
                <Link to="/login">
                  <Button size="lg" className="gap-2 text-base px-8 py-6 shadow-lg shadow-primary/20">
                    Start for Free <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg" className="text-base px-6 py-6 gap-2">
                    <Play className="h-4 w-4" /> See How It Works
                  </Button>
                </a>
              </div>
              <p className="text-xs text-muted-foreground">5 free credits included · No credit card required</p>
            </div>

            {/* Right: lifestyle image with phone mockup overlay */}
            <div className="relative animate-fade-in">
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border">
                <img
                  src={heroImage}
                  alt="Happy family enjoying a backyard pool rental"
                  className="w-full h-auto"
                  loading="eager"
                />
              </div>

              {/* Floating phone mockup showing signing experience */}
              <div className="absolute -bottom-6 -left-4 md:-left-8 w-44 md:w-52 rounded-2xl border-2 border-background bg-card shadow-xl p-3">
                <div className="text-[10px] font-medium text-muted-foreground mb-2">Waiver Signing</div>
                <div className="space-y-1.5">
                  <div className="h-2 w-3/4 bg-muted rounded" />
                  <div className="h-2 w-full bg-muted rounded" />
                  <div className="h-2 w-5/6 bg-muted rounded" />
                </div>
                <div className="mt-3 border rounded-lg p-2 bg-accent/50">
                  <div className="text-[9px] text-muted-foreground mb-1">Signature</div>
                  <svg viewBox="0 0 120 30" className="w-full h-6 text-foreground">
                    <path d="M5 25 C15 5, 25 5, 35 20 S50 10, 60 18 S75 5, 85 15 S100 10, 115 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="mt-2 bg-primary text-primary-foreground text-[9px] font-semibold py-1.5 rounded text-center">
                  ✓ Signed
                </div>
              </div>

              {/* Floating stat badge */}
              <div className="absolute -top-3 -right-2 md:-right-4 bg-card border shadow-lg rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Waiver Signed</p>
                    <p className="text-[10px] text-muted-foreground">Just now · iPhone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SOCIAL PROOF — Stats + Logos                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="border-y bg-muted/30 py-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="font-heading text-3xl md:text-4xl font-bold text-primary">10,000+</p>
              <p className="text-sm text-muted-foreground">waivers signed</p>
            </div>
            <div>
              <p className="font-heading text-3xl md:text-4xl font-bold text-primary">60s</p>
              <p className="text-sm text-muted-foreground">average signing time</p>
            </div>
            <div>
              <p className="font-heading text-3xl md:text-4xl font-bold text-primary">6¢</p>
              <p className="text-sm text-muted-foreground">per waiver at volume</p>
            </div>
            <div>
              <p className="font-heading text-3xl md:text-4xl font-bold text-primary">$0</p>
              <p className="text-sm text-muted-foreground">monthly fees, ever</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t">
            <span className="text-xs uppercase tracking-widest text-muted-foreground/50 font-medium">Integrated with</span>
            <div className="flex items-center gap-6 text-muted-foreground/60">
              <span className="text-sm font-medium">Swimply</span>
              <span className="text-sm font-medium">ShareTribe</span>
              <span className="text-sm font-medium">Airbnb</span>
              <span className="text-sm font-medium">VRBO</span>
              <a href="https://poolrentalnearme.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-medium hover:text-foreground transition-colors">
                <Droplets className="h-4 w-4 text-primary/60" /> poolrentalnearme.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS — Simple 3-step                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            How it works
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">
            Set up once, then it runs on autopilot.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "1", icon: FileText, title: "Create your template", desc: "Use a pre-built waiver template or customize your own. Add your business name, rules, and liability clauses." },
              { step: "2", icon: Send, title: "Send the link", desc: "Email it, text it, or put a QR code at your rental counter. Works with your booking platform too — fully automatic." },
              { step: "3", icon: CheckCircle, title: "Guest signs on their phone", desc: "They read the waiver, draw their signature with their finger, and you get a legally-binding PDF with full audit trail.", iconColor: "text-green-500" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <s.icon className={`h-7 w-7 ${s.iconColor || 'text-primary'}`} />
                </div>
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold mb-3">{s.step}</div>
                <h3 className="font-heading font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/login">
              <Button className="gap-2" size="lg">
                Try It Free — Create Your First Waiver <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* WHO IT'S FOR — Rental types (moved up)                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="border-t bg-secondary/30 py-20">
        <div className="container max-w-5xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Works for any type of rental
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">
            Pre-built templates ready to go. Customize and start sending in minutes.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Droplets, title: "Pool & Hot Tub", desc: "Swimply hosts, backyard pools, hot tub rentals", color: "text-blue-500", bg: "bg-blue-500/10", link: "/waivers/pool-rental-waivers" },
              { icon: Home, title: "Vacation Rentals", desc: "Airbnb, VRBO, short-term rental homes", color: "text-green-500", bg: "bg-green-500/10", link: "/waivers/vacation-rental-waivers" },
              { icon: Wrench, title: "Equipment", desc: "Bikes, kayaks, boats, jet skis, ATVs", color: "text-orange-500", bg: "bg-orange-500/10", link: "/waivers/equipment-rental-waivers" },
              { icon: PartyPopper, title: "Events & Parties", desc: "Bounce houses, event halls, party equipment", color: "text-purple-500", bg: "bg-purple-500/10", link: "/waivers/party-equipment-rental-waivers" },
            ].map((cat) => (
              <Link to={cat.link} key={cat.title} className="rounded-xl border bg-card p-6 text-center hover:border-primary/30 transition-colors group">
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${cat.bg}`}>
                  <cat.icon className={`h-6 w-6 ${cat.color}`} />
                </div>
                <h3 className="font-heading font-semibold mb-1 group-hover:text-primary transition-colors">{cat.title}</h3>
                <p className="text-sm text-muted-foreground">{cat.desc}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/industries" className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1">
              View all industries <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Testimonial */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="rounded-2xl border bg-card p-6 md:p-8 text-center">
              <div className="flex justify-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <blockquote className="text-base md:text-lg font-medium mb-3 leading-relaxed">
                "We switched from a $49/month waiver platform and saved over $400 our first season. The group waiver link is a game-changer for pool parties."
              </blockquote>
              <p className="text-sm text-muted-foreground">
                — Pool rental host, Riverside CA
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SIGNING EXPERIENCE — What guests see                   */}
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
              { icon: FileText, title: "Read the waiver", desc: "Clear, scrollable text" },
              { emoji: "✍️", title: "Sign their name", desc: "Draw with their finger" },
              { icon: CheckCircle, title: "Done!", desc: "Confirmation sent", iconColor: "text-green-500" },
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
      {/* GROUP WAIVERS — Strong differentiator                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="border-t bg-secondary/30 py-20">
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
      {/* PRICING — Credit packs                                 */}
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
      {/* COMPARISON — Softer tone                               */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container max-w-5xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-3">
            Why hosts are switching
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">
            Most waiver platforms charge monthly fees — even when you send zero waivers.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Them */}
            <div className="rounded-2xl border bg-card p-8">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Typical waiver platforms</p>
              <ul className="space-y-4">
                {[
                  "$29–$99/month — even in the off-season",
                  "Per-seat pricing for team members",
                  "API access locked behind premium tiers",
                  "Webhooks? That's an enterprise add-on",
                  "Group waivers cost extra",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground">
                    <X className="h-5 w-5 shrink-0 mt-0.5 text-destructive/60" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Us */}
            <div className="rounded-2xl border-2 border-primary bg-primary/5 p-8 relative">
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
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/compare" className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1">
              See full comparison <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TRUST & AUDIT TRAIL                                    */}
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
              Every signature generates a comprehensive, tamper-proof record.
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

            {/* Security features */}
            <div className="space-y-4">
              {[
                { icon: PenLine, title: "Drawn Signature", desc: "Guests sign with their finger or mouse — a unique, legally-recognized mark.", highlight: true },
                { icon: Globe, title: "IP Address Logging", desc: "We record the signer's IP address. Critical for dispute resolution." },
                { icon: Clock, title: "Precise UTC Timestamps", desc: "Every action recorded to the exact second. No ambiguity about when consent was given." },
                { icon: Smartphone, title: "Device Fingerprint", desc: "Device type, OS, and browser captured. Another layer of proof." },
                { icon: Lock, title: "SHA-256 Document Hash", desc: "Cryptographic hash proves the document hasn't been tampered with." },
                { icon: Shield, title: "7-Year Secure Storage", desc: "Encrypted, tamper-proof PDFs stored for 7+ years. Configurable up to 99 years." },
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
                { icon: Zap, title: "Marketplace integration", desc: "Auto-send waivers when bookings come in via webhook.", tooltip: "A marketplace integration connects your booking platform so waivers are sent automatically when someone books — zero manual work." },
                { icon: Users, title: "Unlimited group waivers", desc: "One link, unlimited signers. No per-signer charges.", tooltip: "Send a single link to a party or family. Each person signs individually on their own phone." },
                { icon: QrCode, title: "QR code kiosk mode", desc: "Print a QR code for walk-in guests at your rental counter.", tooltip: "Guests scan a QR code with their phone and sign the waiver instantly — no check-in staff needed." },
                { icon: Code, title: "Full REST API", desc: "Create envelopes, manage templates, check statuses.", tooltip: "An API lets your software create and manage waivers programmatically." },
                { icon: Webhook, title: "Real-time webhooks", desc: "Get notified on every event: viewed, signed, expired.", tooltip: "Automatic notifications when a guest views or signs a waiver." },
                { icon: Bell, title: "Auto-reminders", desc: "Unsigned waivers get automatic reminder emails.", tooltip: "If a guest hasn't signed, the system automatically sends reminder emails." },
                { icon: BarChart3, title: "Analytics dashboard", desc: "See signing rates, response times, and team activity.", tooltip: "Key metrics: waivers sent, viewed, signed, plus team member activity." },
                { icon: Lock, title: "Team roles & API keys", desc: "Add your whole team. Role-based access. Multiple API keys.", tooltip: "Invite team members with different permission levels." },
                { icon: CreditCard, title: "Auto-recharge", desc: "Credits refill automatically when you run low.", tooltip: "Never run out of credits mid-season. Set a threshold and your account auto-purchases more." },
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
      {/* DEVELOPER — Smaller API section                        */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-16 border-t">
        <div className="container max-w-4xl">
          <div className="rounded-2xl border bg-card p-8 md:p-10">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1 text-sm text-primary mb-4">
                  <Code className="h-4 w-4" /> For Developers
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
                  Full API & webhook access
                </h2>
                <p className="text-muted-foreground mb-4">
                  Every account gets REST API access and real-time webhooks. Build integrations with your booking platform, CRM, or custom app.
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "REST API — create envelopes, manage templates",
                    "Webhooks — sign, view, expiry events",
                    "Marketplace auto-integration",
                    "API keys with role-based access",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <Link to="/docs">
                    <Button variant="outline" size="sm" className="gap-2">
                      API Documentation <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="rounded-xl border bg-foreground text-background p-4 font-mono text-xs overflow-hidden">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
                <pre className="leading-relaxed whitespace-pre-wrap text-[11px]">
{`curl -X POST /v1/envelopes \\
  -H "Authorization: Bearer rw_..." \\
  -d '{
    "template_id": "tmpl_pool",
    "signer_email": "guest@email.com",
    "signer_name": "Jane Doe"
  }'

// => { "status": "sent" }`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-primary to-primary/80 py-20">
        <div className="container text-center max-w-2xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Protect your rental business today
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-4">
            Join hosts who switched from $50/month subscriptions to pay-per-waiver pricing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-primary-foreground/50 mb-8">
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> No credit card</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> 5 free credits</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> All features included</span>
          </div>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="gap-2 text-base px-10 py-6 shadow-lg">
              Create Your Free Account <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
