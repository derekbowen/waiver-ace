import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  Shield, Users, Send, FileText, ArrowRight, CheckCircle, Clock,
  Smartphone, Droplets, Home, Wrench, PartyPopper, Zap,
  DollarSign, ChevronDown, Menu, Star, QrCode, Code
} from "lucide-react";
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
import { useState } from "react";

export default function Landing() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Rental Waivers" className="h-7 w-7" />
            <span className="font-heading text-base font-bold tracking-tight">Rental Waivers</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-sm">
                  Product <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem asChild><Link to="/waiver-software" className="cursor-pointer"><Shield className="h-4 w-4 mr-2" /> Waiver Software</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/waiver-templates" className="cursor-pointer"><FileText className="h-4 w-4 mr-2" /> Templates</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/industries" className="cursor-pointer"><Wrench className="h-4 w-4 mr-2" /> Industries</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/docs" className="cursor-pointer"><Code className="h-4 w-4 mr-2" /> API Docs</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="#pricing"><Button variant="ghost" size="sm" className="text-sm">Pricing</Button></a>
            <Link to="/blog"><Button variant="ghost" size="sm" className="text-sm">Blog</Button></Link>
            <Link to="/compare"><Button variant="ghost" size="sm" className="text-sm">Compare</Button></Link>
            <LanguageSwitcher />
            <Link to="/login"><Button variant="ghost" size="sm" className="text-sm">Sign in</Button></Link>
            <Link to="/login"><Button size="sm">Get Started Free</Button></Link>
          </nav>

          <div className="flex md:hidden items-center gap-2">
            <Link to="/login"><Button size="sm">Get Started</Button></Link>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
              <SheetContent side="right" className="w-72 pt-12">
                <nav className="flex flex-col gap-1">
                  <Link to="/waiver-software" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Waiver Software</Link>
                  <Link to="/waiver-templates" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Templates</Link>
                  <Link to="/industries" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Industries</Link>
                  <Link to="/blog" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Blog</Link>
                  <Link to="/compare" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Compare</Link>
                  <Link to="/docs" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">API Docs</Link>
                  <div className="my-2 border-t" />
                  <a href="#pricing" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Pricing</a>
                  <Link to="/my-waivers" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">My Waivers</Link>
                  <Link to="/waiver-laws" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent">Waiver Laws</Link>
                  <div className="my-2 border-t" />
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-accent font-medium">Sign In</Link>
                  <div className="my-2 border-t" />
                  <div className="px-3"><LanguageSwitcher variant="outline" /></div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          HERO — One clear message above the fold
      ═══════════════════════════════════════════════════════════ */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="container max-w-3xl text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            Digital waivers.
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">6¢ each. No monthly fee.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Send a link. Guest signs on their phone in 60 seconds.
            You get a legally-binding PDF with full audit trail.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link to="/login">
              <Button size="lg" className="gap-2 text-base px-8 py-6 shadow-lg shadow-primary/20 w-full sm:w-auto">
                Get 250 Free Credits <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">No credit card required · All features included · ESIGN Act compliant</p>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y bg-muted/30 py-6">
        <div className="container">
          <div className="grid grid-cols-3 gap-4 text-center max-w-lg mx-auto">
            <div>
              <p className="font-heading text-2xl md:text-3xl font-bold text-primary">60s</p>
              <p className="text-xs text-muted-foreground">signing time</p>
            </div>
            <div>
              <p className="font-heading text-2xl md:text-3xl font-bold text-primary">6¢</p>
              <p className="text-xs text-muted-foreground">per waiver</p>
            </div>
            <div>
              <p className="font-heading text-2xl md:text-3xl font-bold text-primary">$0</p>
              <p className="text-xs text-muted-foreground">monthly fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — 3 steps, ultra simple
      ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 md:py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-10">
            Three steps. That's it.
          </h2>

          <div className="grid gap-8 md:grid-cols-3 text-center">
            {[
              { num: "1", icon: FileText, title: "Create a template", desc: "Use a pre-built waiver or write your own. Takes 2 minutes." },
              { num: "2", icon: Send, title: "Send the link", desc: "Email, text, or QR code. Works with any booking platform." },
              { num: "3", icon: CheckCircle, title: "Guest signs", desc: "They sign on their phone. You get a PDF with audit trail." },
            ].map((s) => (
              <div key={s.num}>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold mb-2">{s.num}</div>
                <h3 className="font-heading font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link to="/login">
              <Button className="gap-2" size="lg">
                Try It Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHO IT'S FOR — Simple category cards
      ═══════════════════════════════════════════════════════════ */}
      <section className="border-t bg-muted/20 py-16 md:py-20">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-3">
            Built for rental & recreation businesses
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Pre-built templates. Customize and start sending in minutes.
          </p>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[
              { icon: Droplets, title: "Pools & Hot Tubs", link: "/waivers/pool-rental-waivers" },
              { icon: Home, title: "Vacation Rentals", link: "/waivers/vacation-rental-waivers" },
              { icon: Wrench, title: "Equipment", link: "/waivers/equipment-rental-waivers" },
              { icon: PartyPopper, title: "Events & Parties", link: "/waivers/party-equipment-rental-waivers" },
            ].map((cat) => (
              <Link to={cat.link} key={cat.title} className="rounded-xl border bg-card p-5 text-center hover:border-primary/30 transition-colors group">
                <cat.icon className="h-7 w-7 mx-auto mb-2 text-primary" />
                <h3 className="font-heading font-semibold text-sm group-hover:text-primary transition-colors">{cat.title}</h3>
              </Link>
            ))}
          </div>

          <p className="text-center mt-6">
            <Link to="/industries" className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1">
              View all industries <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHAT YOU GET — Scannable feature list
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="container max-w-3xl">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-3">
            Everything included. No upsells.
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Other platforms lock features behind premium tiers. We include everything.
          </p>

          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
            {[
              "Legally-binding e-signatures (ESIGN + UETA)",
              "Group waivers — one link, unlimited signers",
              "QR code kiosk mode for walk-ins",
              "Full REST API & real-time webhooks",
              "Automatic reminder emails",
              "Drawn signature with audit trail",
              "IP address, timestamp & device logging",
              "SHA-256 tamper-proof PDFs",
              "7-year encrypted storage",
              "Unlimited team members",
              "Auto-recharge credits",
              "Analytics dashboard",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GROUP WAIVERS — Key differentiator
      ═══════════════════════════════════════════════════════════ */}
      <section className="border-t bg-muted/20 py-16 md:py-20">
        <div className="container max-w-4xl">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground mb-4">
                <Users className="h-3.5 w-3.5" /> Group Waivers
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
                One link for the whole group
              </h2>
              <p className="text-muted-foreground mb-5">
                Family of 6 booked your pool? Send one link. Each person signs on their own phone. You see every signature in real time.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "No emails needed upfront",
                  "Each person signs individually",
                  "Live signature tracking",
                  "Share via text or QR code",
                ].map((text) => (
                  <li key={text} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mini demo */}
            <div className="rounded-xl border bg-card p-5">
              <div className="space-y-3">
                {[
                  { name: "Mike Johnson", time: "2 min ago" },
                  { name: "Sarah Johnson", time: "5 min ago" },
                  { name: "Tommy Johnson", time: "8 min ago" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Signed {s.time}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">Waiting for 3 more...</p>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-3">3 of 6 guests signed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TESTIMONIAL
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14">
        <div className="container max-w-2xl text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
          </div>
          <blockquote className="text-lg md:text-xl font-medium leading-relaxed mb-3">
            "We switched from a $49/month waiver platform and saved over $400 our first season. The group waiver link is a game-changer for pool parties."
          </blockquote>
          <p className="text-sm text-muted-foreground">— Pool rental host, Riverside CA</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRICING — Clean credit packs
      ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="border-t bg-muted/20 py-16 md:py-20">
        <div className="container max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-4">
            <DollarSign className="h-3.5 w-3.5" /> No subscription required
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            Pay per waiver. That's it.
          </h2>
          <p className="text-muted-foreground mb-10">
            Buy credits when you need them. No contracts, no expiration.
          </p>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
            {CREDIT_PACKAGES.map((pkg) => (
              <div key={pkg.id} className={`rounded-xl border p-5 text-center transition-shadow hover:shadow-md ${pkg.popular ? "border-primary border-2 relative" : "bg-card"}`}>
                {pkg.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full">BEST VALUE</div>}
                <p className="font-heading text-xl font-bold">{pkg.credits.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mb-2">credits</p>
                <p className="font-heading text-2xl font-bold mb-0.5">${pkg.price}</p>
                <p className="text-xs text-muted-foreground mb-3">{pkg.perWaiver}/waiver</p>
                <Link to="/login">
                  <Button variant={pkg.popular ? "default" : "outline"} size="sm" className="w-full text-xs">
                    Buy
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-primary" /> All features included</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-primary" /> Credits never expire</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-primary" /> Auto-recharge available</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHY SWITCH — Quick comparison
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="container max-w-2xl text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8">
            Why hosts are switching
          </h2>

          <div className="text-left space-y-3 mb-8">
            {[
              { them: "$29–$99/month subscription", us: "Pay per waiver — 6¢ each" },
              { them: "Group waivers cost extra", us: "Group waivers included free" },
              { them: "API locked behind premium", us: "Full API on every account" },
              { them: "Per-seat pricing for teams", us: "Unlimited team members" },
            ].map((row, i) => (
              <div key={i} className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground line-through decoration-destructive/40">
                  {row.them}
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  {row.us}
                </div>
              </div>
            ))}
          </div>

          <Link to="/compare" className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1">
            See full comparison <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container text-center max-w-2xl">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            Start sending waivers today
          </h2>
          <p className="text-primary-foreground/70 mb-6">
            Every new account gets <strong className="text-primary-foreground">250 free credits</strong>. No credit card required.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="gap-2 text-base px-10 py-6 shadow-lg">
              Get 250 Free Credits <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-primary-foreground/50">
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> No credit card</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> No monthly fees</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> All features included</span>
          </div>
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
