import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  ArrowRight, ArrowUpRight, CheckCircle, Menu,
  Droplets, Home, Wrench, PartyPopper,
  ScanSearch, BarChart3, FolderOpen, Plus, Minus,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { CREDIT_PACKAGES } from "@/lib/credit-packages";
import { JsonLd } from "@/components/JsonLd";
import { faqSchema, softwareApplicationSchema, organizationSchema } from "@/lib/structured-data";
import logo from "@/assets/logo.png";
import { useState } from "react";

const LANDING_FAQS = [
  {
    question: "How do online waivers work?",
    answer:
      "You create a digital liability waiver template once, then send a signing link by email, text, or QR code. Your guest opens the link on their phone, reads the waiver, draws their signature, and submits — usually in under 60 seconds. You instantly receive a tamper-proof PDF with a full audit trail (IP, timestamp, device).",
  },
  {
    question: "Are digital waivers legally binding?",
    answer:
      "Yes. Online waivers signed through Rental Waivers are legally binding under the U.S. ESIGN Act and UETA, and equivalent e-signature laws in most countries. Each signed waiver includes a SHA-256 hash, signer IP address, timestamp, device fingerprint, and consent logs that hold up in court.",
  },
  {
    question: "Can multiple people sign one waiver link?",
    answer:
      "Yes — that's our group waiver feature. Send one link to a family, party, or tour group, and each person signs individually on their own phone. You see every signature in real time and get one consolidated record per booking.",
  },
  {
    question: "Do I need to pay a monthly fee?",
    answer:
      "No. Rental Waivers is pay-per-waiver only. Credits start at 6¢ per signed waiver and never expire. There are no subscriptions, no per-seat fees, and no premium tiers — every feature is included on every account.",
  },
  {
    question: "What kinds of rentals is this for?",
    answer:
      "Pool rentals, bounce houses, kayak and paddleboard tours, ATV and equipment rentals, vacation rentals (Airbnb, VRBO), party rentals, escape rooms, and any business that needs a signed liability waiver before service.",
  },
  {
    question: "Can I use this with Airbnb, VRBO, or my booking platform?",
    answer:
      "Yes. Send waiver links straight from your booking confirmation email or SMS, embed the signing flow on your listing page, or trigger waivers automatically through our REST API and webhooks (including native Sharetribe support).",
  },
  {
    question: "How fast can I get started?",
    answer:
      "Most hosts send their first waiver in under 5 minutes. Pick a pre-built template, customize it, and share the link. Every new account starts with 250 free credits — no credit card required.",
  },
  {
    question: "What is a rental waiver?",
    answer:
      "A rental waiver is a liability waiver a customer signs before using rented property or equipment. It documents that the guest understands the risks, agrees to assume them, and releases the owner from claims arising from ordinary use. Rental Waivers turns that document into an online waiver your guests sign from a link.",
  },
  {
    question: "Do I need an Airbnb liability waiver for my short-term rental?",
    answer:
      "Airbnb's host protection does not replace a signed liability waiver, and it excludes many amenities entirely. If your listing has a pool, hot tub, dock, trampoline, ATV, or any activity, a signed Airbnb liability waiver is the record that shows the guest accepted the risk. Send it with your booking confirmation and require it before check-in.",
  },
  {
    question: "How do I create a pool waiver for a rental property?",
    answer:
      "Start from our pool and hot tub template, add your property address and house rules, and include the minors section so parents can sign for their children. Guests receive a link, sign on their phone, and the signed PDF is stored against the booking — the standard setup for a liability waiver for rental property.",
  },
  {
    question: "Are digital waivers better than paper waivers?",
    answer:
      "Digital waivers beat paper on every measure that matters in a dispute: they cannot be lost, they are timestamped and IP-stamped, they are searchable by guest name or date, and they are signed before arrival instead of on a clipboard at the gate. Paper waivers also cost staff time to file and scan.",
  },
];


function FaqItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-hairline">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-6 py-7 text-left group"
        aria-expanded={open}
      >
        <div className="flex items-start gap-6 md:gap-10">
          <span className="font-heading text-xs text-muted-foreground tabular-nums pt-1.5 shrink-0">
            {String(idx + 1).padStart(2, "0")}
          </span>
          <h3 className="font-heading text-lg md:text-xl font-medium tracking-tight text-ink group-hover:text-ochre transition-colors">
            {q}
          </h3>
        </div>
        <span className="shrink-0 mt-1.5 text-muted-foreground">
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      {open && (
        <div className="pb-8 pl-0 md:pl-16 pr-10 -mt-2">
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col text-ink antialiased">
      {/* ─────────────── NAV ─────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-hairline/60 bg-background/75 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Rental Waivers" className="h-6 w-6" />
            <span className="font-heading text-[15px] font-semibold tracking-tight">Rental Waivers</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[13px] text-muted-foreground">
            <Link to="/waiver-software" className="hover:text-ink transition-colors">Product</Link>
            <Link to="/industries" className="hover:text-ink transition-colors">Industries</Link>
            <Link to="/waiver-templates" className="hover:text-ink transition-colors">Templates</Link>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
            <Link to="/blog" className="hover:text-ink transition-colors">Journal</Link>
            <Link to="/docs" className="hover:text-ink transition-colors">Developers</Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Link to="/login" className="text-[13px] text-muted-foreground hover:text-ink transition-colors px-2">Sign in</Link>
            <Link to="/login">
              <Button size="sm" className="rounded-full px-4 h-8 text-[13px] font-medium">Get started</Button>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Link to="/login">
              <Button size="sm" className="rounded-full px-4 h-8 text-[13px]">Get started</Button>
            </Link>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
              <SheetContent side="right" className="w-72 pt-12 bg-background">
                <nav className="flex flex-col gap-1 font-heading">
                  <Link to="/waiver-software" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-base">Product</Link>
                  <Link to="/industries" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-base">Industries</Link>
                  <Link to="/waiver-templates" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-base">Templates</Link>
                  <a href="#pricing" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-base">Pricing</a>
                  <Link to="/blog" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-base">Journal</Link>
                  <Link to="/docs" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-base">Developers</Link>
                  <div className="my-3 border-t border-hairline" />
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-base">Sign in</Link>
                  <div className="px-3 mt-3"><LanguageSwitcher variant="outline" /></div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ─────────────── HERO ─────────────── */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 grain">
        <div className="container">
          {/* Eyebrow */}
          <div className="flex items-center justify-between mb-12 md:mb-20">
            <span className="eyebrow">Vol. 01 — Issue 26</span>
            <span className="eyebrow hidden sm:inline">Liability waivers, refined.</span>
            <span className="eyebrow tabular-nums">№ 0001</span>
          </div>

          {/* Display headline */}
          <h1 className="display-light text-[44px] sm:text-7xl md:text-[112px] lg:text-[140px] text-ink">
            Online waivers,
            <br />
            <span className="italic font-light text-ochre">effortless.</span>
          </h1>

          {/* Subhead row */}
          <div className="mt-12 md:mt-16 grid md:grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="md:col-span-7">
              <div className="h-px hairline mb-6" />
              <p className="text-lg md:text-xl text-ink/80 leading-snug max-w-xl font-light">
                Rental waiver software for guests to sign on their phone. Legally binding digital liability waivers for Airbnb and vacation rentals, pool rentals, bounce houses, kayak tours and equipment hire. Send a link, your guest signs in sixty seconds, you keep a tamper-proof record.
              </p>

            </div>
            <div className="md:col-span-5 md:text-right">
              <div className="flex flex-col sm:flex-row md:flex-col md:items-end gap-3 md:gap-4">
                <Link to="/login">
                  <Button size="lg" className="rounded-full h-12 px-7 text-[15px] font-medium gap-2 bg-ink hover:bg-ink/90">
                    Send your first waiver <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="#how" className="text-[13px] text-muted-foreground hover:text-ink underline underline-offset-4 decoration-hairline">
                  See how it works
                </Link>
              </div>
            </div>
          </div>

          {/* Hero spec strip */}
          <div className="mt-20 md:mt-28 grid grid-cols-3 border-y border-hairline">
            {[
              { k: "Sign time", v: "60s", note: "average" },
              { k: "Per waiver", v: "6¢", note: "no monthly fee" },
              { k: "Free credits", v: "250", note: "on signup" },
            ].map((s, i) => (
              <div key={s.k} className={`py-8 md:py-10 ${i > 0 ? "border-l border-hairline" : ""} px-3 md:px-6`}>
                <p className="eyebrow mb-3 md:mb-4">{s.k}</p>
                <p className="display-light text-4xl md:text-6xl text-ink tabular-nums">{s.v}</p>
                <p className="mt-2 text-xs md:text-sm text-muted-foreground">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── PRODUCT VISUAL ─────────────── */}
      <section className="pb-20 md:pb-32">
        <div className="container">
          <div className="relative rounded-2xl bg-paper border border-hairline overflow-hidden">
            <div className="grid md:grid-cols-12 gap-0">
              {/* Left: typographic plate */}
              <div className="md:col-span-5 p-10 md:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-hairline">
                <div>
                  <p className="eyebrow mb-6">Plate I — The signing surface</p>
                  <h2 className="display text-4xl md:text-5xl text-ink mb-6">
                    A document, a signature, a record.
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-md font-light">
                    No accounts for guests. No app to install. They open a link on the device already in their hand, draw their name, and the PDF lands in your inbox — sealed with a SHA-256 hash, IP, timestamp.
                  </p>
                </div>
                <div className="hidden md:flex items-end justify-between mt-12 pt-8 border-t border-hairline">
                  <div>
                    <p className="eyebrow mb-1">Format</p>
                    <p className="text-sm text-ink">PDF · Audit trail</p>
                  </div>
                  <div>
                    <p className="eyebrow mb-1">Compliance</p>
                    <p className="text-sm text-ink">ESIGN · UETA</p>
                  </div>
                  <div>
                    <p className="eyebrow mb-1">Devices</p>
                    <p className="text-sm text-ink">Any browser</p>
                  </div>
                </div>
              </div>

              {/* Right: device mock */}
              <div className="md:col-span-7 p-8 md:p-14 flex items-center justify-center bg-gradient-to-br from-paper via-background to-paper">
                <div className="w-full max-w-sm">
                  <div className="rounded-[2rem] bg-card shadow-[0_30px_80px_-20px_hsl(25_22%_8%/0.18)] border border-hairline overflow-hidden">
                    <div className="px-5 py-3 flex items-center justify-between border-b border-hairline">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-hairline" />
                        <span className="w-2 h-2 rounded-full bg-hairline" />
                        <span className="w-2 h-2 rounded-full bg-hairline" />
                      </div>
                      <p className="text-[10px] text-muted-foreground tracking-widest uppercase">rentalwaivers.com/sign</p>
                    </div>
                    <div className="p-6">
                      <p className="eyebrow mb-3">Liability Waiver</p>
                      <h3 className="font-heading text-xl font-medium text-ink mb-3 tracking-tight">Sun Valley Pool — Booking #4821</h3>
                      <div className="space-y-1.5 mb-5">
                        <div className="h-1.5 bg-muted rounded-full w-full" />
                        <div className="h-1.5 bg-muted rounded-full w-11/12" />
                        <div className="h-1.5 bg-muted rounded-full w-10/12" />
                        <div className="h-1.5 bg-muted rounded-full w-full" />
                        <div className="h-1.5 bg-muted rounded-full w-9/12" />
                      </div>
                      <div className="rounded-lg border border-hairline bg-bone p-4 mb-4">
                        <p className="eyebrow mb-3 text-[10px]">Signature</p>
                        <svg viewBox="0 0 200 50" className="w-full h-12 text-ink">
                          <path d="M5 35 Q 20 5, 40 30 T 80 25 Q 100 5, 120 30 T 160 28 Q 180 10, 195 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-muted-foreground">Verified · 192.0.2.14 · 14:02 PST</p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink">
                          <CheckCircle className="h-3 w-3" /> Sealed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marketplace credits */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[13px] text-muted-foreground">
            <span className="eyebrow mr-2">In use with</span>
            <span className="font-heading text-ink/70">Airbnb</span>
            <span className="hairline w-px h-3" />
            <span className="font-heading text-ink/70">VRBO</span>
            <span className="hairline w-px h-3" />
            <span className="font-heading text-ink/70">Swimply</span>
            <span className="hairline w-px h-3" />
            <a href="https://bookmypool.com" target="_blank" rel="noopener noreferrer" className="font-heading text-ink hover:text-ochre transition-colors">BookMyPool</a>
            <span className="hairline w-px h-3" />
            <span className="font-heading text-ink/70">PoolRentalNearMe</span>
            <span className="hairline w-px h-3" />
            <span className="font-heading text-ink/70">Sharetribe</span>
          </div>
        </div>
      </section>

      {/* ─────────────── HOW IT WORKS ─────────────── */}
      <section id="how" className="py-24 md:py-32 border-t border-hairline">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-10 mb-16 md:mb-24">
            <div className="md:col-span-4">
              <p className="eyebrow mb-6">§ 01 · Method</p>
              <h2 className="display text-4xl md:text-6xl text-ink">
                Three movements.
                <br />
                <span className="italic text-ochre font-light">Nothing more.</span>
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <p className="text-lg text-muted-foreground leading-relaxed font-light max-w-lg">
                Most software asks you to learn it. Ours asks you to use it once and forget it exists. Templates, links, signatures — that is the entire choreography.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 border-y border-hairline">
            {[
              { n: "01", t: "Compose", d: "Pick a pre-built template or draft your own. Two minutes, no legal degree required." },
              { n: "02", t: "Distribute", d: "Email, SMS, QR code, embed, or API call — every channel works without configuration." },
              { n: "03", t: "Witness", d: "Guest signs, you receive a tamper-proof PDF with the full forensic chain attached." },
            ].map((s, i) => (
              <div key={s.n} className={`py-12 md:py-16 px-6 md:px-10 ${i > 0 ? "md:border-l border-hairline" : ""} ${i > 0 ? "border-t md:border-t-0 border-hairline" : ""}`}>
                <p className="font-heading text-[11px] tracking-[0.16em] text-muted-foreground tabular-nums mb-8">{s.n}</p>
                <h3 className="font-heading text-2xl md:text-3xl font-medium tracking-tight text-ink mb-4">{s.t}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-light max-w-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── INDUSTRIES ─────────────── */}
      <section className="py-24 md:py-32 border-t border-hairline bg-paper">
        <div className="container">
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <div>
              <p className="eyebrow mb-6">§ 02 · Catalogue</p>
              <h2 className="display text-3xl md:text-5xl text-ink max-w-2xl">
                Built for the businesses that move people, water, and machinery.
              </h2>
            </div>
            <Link to="/industries" className="hidden md:inline-flex items-center gap-1.5 text-sm text-ink hover:text-ochre transition-colors group">
              Full index <ArrowUpRight className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline border border-hairline">
            {[
              { icon: Droplets, title: "Pools & Hot Tubs", n: "001", link: "/waivers/pool-rental-waivers" },
              { icon: Home, title: "Vacation Rentals", n: "002", link: "/waivers/vacation-rental-waivers" },
              { icon: Wrench, title: "Equipment Rentals", n: "003", link: "/waivers/equipment-rental-waivers" },
              { icon: PartyPopper, title: "Events & Parties", n: "004", link: "/waivers/party-equipment-rental-waivers" },
            ].map((cat) => (
              <Link
                to={cat.link}
                key={cat.title}
                className="group relative bg-background p-6 md:p-8 aspect-[4/5] flex flex-col justify-between hover:bg-bone transition-colors"
              >
                <div className="flex items-start justify-between">
                  <p className="font-heading text-[11px] tracking-[0.16em] text-muted-foreground tabular-nums">{cat.n}</p>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-ochre group-hover:rotate-12 transition-all" />
                </div>
                <div>
                  <cat.icon className="h-7 w-7 text-ink mb-5 stroke-[1.25]" />
                  <h3 className="font-heading text-lg md:text-xl font-medium tracking-tight text-ink leading-tight">
                    {cat.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          <Link to="/industries" className="md:hidden mt-8 inline-flex items-center gap-1.5 text-sm text-ink hover:text-ochre transition-colors">
            Full index <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ─────────────── EVERYTHING INCLUDED ─────────────── */}
      <section className="py-24 md:py-32 border-t border-hairline">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-10 mb-16">
            <div className="md:col-span-5">
              <p className="eyebrow mb-6">§ 03 · Inventory</p>
              <h2 className="display text-4xl md:text-6xl text-ink">
                One price.
                <br />
                <span className="italic font-light text-ochre">Every feature.</span>
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="text-lg text-muted-foreground leading-relaxed font-light">
                Other platforms unlock features tier by tier. We ship them all on day one — to the solo host and to the marketplace alike.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-x-10 gap-y-1 border-t border-hairline pt-8">
            {[
              "Legally-binding e-signatures — ESIGN + UETA",
              "Group waivers — one link, unlimited signers",
              "QR code kiosk mode for walk-ins",
              "Embeddable iframe widgets",
              "Guest dashboard, resume on any device",
              "Branded auth & notification emails",
              "Full REST API & real-time webhooks",
              "AI contract scanner & risk analysis",
              "Listing analyzer with SEO scoring",
              "Secure document storage",
              "Drawn signature with full audit trail",
              "IP, timestamp & device logging",
              "SHA-256 tamper-proof PDFs",
              "Unlimited team members",
              "Auto-photo capture, 11-language signing",
              "Sharetribe & marketplace webhooks",
              "Analytics dashboard, auto-recharge",
              "Rate-limited APIs, ownership audit logs",
            ].map((feature, i) => (
              <div key={feature} className="flex items-baseline gap-3 py-3 border-b border-hairline/60">
                <span className="font-heading text-[10px] text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[15px] text-ink font-light leading-snug">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── GROUP WAIVERS ─────────────── */}
      <section className="py-24 md:py-32 border-t border-hairline bg-paper">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6">
              <p className="eyebrow mb-6">§ 04 · The party of six</p>
              <h2 className="display text-4xl md:text-6xl text-ink mb-8">
                One link. Six phones.
                <br />
                <span className="italic font-light text-ochre">One record.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-light max-w-md mb-8">
                A family arrives. A bachelorette books a kayak tour. A school group walks into the trampoline park. You send a single link; everyone signs on their own device; you watch it happen in real time.
              </p>
              <ul className="space-y-3 text-[15px] text-ink">
                {["No upfront emails required", "Each signer authenticated individually", "Live tracking dashboard", "Share via SMS or QR code"].map((t) => (
                  <li key={t} className="flex items-center gap-3 border-b border-hairline pb-3">
                    <span className="font-heading text-[10px] text-muted-foreground tabular-nums">·</span>
                    <span className="font-light">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-5 md:col-start-8">
              <div className="rounded-xl bg-card border border-hairline p-6 shadow-[0_24px_60px_-30px_hsl(25_22%_8%/0.2)]">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-hairline">
                  <p className="eyebrow">Group · Booking 4821</p>
                  <p className="text-xs text-muted-foreground tabular-nums">3 / 6</p>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Mike Johnson", time: "2 min ago", done: true },
                    { name: "Sarah Johnson", time: "5 min ago", done: true },
                    { name: "Tommy Johnson", time: "8 min ago", done: true },
                    { name: "Awaiting signer", time: "—", done: false },
                    { name: "Awaiting signer", time: "—", done: false },
                    { name: "Awaiting signer", time: "—", done: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`h-1.5 w-1.5 rounded-full ${s.done ? "bg-ochre" : "bg-hairline"}`} />
                        <p className={`text-sm ${s.done ? "text-ink font-medium" : "text-muted-foreground font-light"}`}>{s.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground tabular-nums">{s.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── DEVELOPERS / EMBED ─────────────── */}
      <section className="py-24 md:py-32 border-t border-hairline">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 order-2 md:order-1">
              <div className="rounded-xl bg-ink text-bone p-7 font-mono text-[13px] leading-relaxed">
                <p className="text-bone/40 mb-3">{`// Drop into any page`}</p>
                <p><span className="text-ochre">&lt;iframe</span></p>
                <p className="pl-4">src=<span className="text-bone/70">"rentalwaivers.com</span></p>
                <p className="pl-8 text-bone/70">/embed/generator"</p>
                <p className="pl-4">width=<span className="text-bone/70">"100%"</span></p>
                <p className="pl-4">height=<span className="text-bone/70">"600"</span></p>
                <p><span className="text-ochre">/&gt;</span></p>
                <p className="text-bone/40 mt-3">{`// Auto-resizes via postMessage`}</p>
              </div>
            </div>
            <div className="md:col-span-6 md:col-start-7 order-1 md:order-2">
              <p className="eyebrow mb-6">§ 05 · For developers</p>
              <h2 className="display text-4xl md:text-5xl text-ink mb-6">
                A line of code,
                <br />
                <span className="italic font-light text-ochre">a signed contract.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-light max-w-md mb-6">
                REST API, signed webhooks, embeddable iframes, and a native Sharetribe integration. Everything documented, nothing rate-limited beyond reason.
              </p>
              <Link to="/docs" className="inline-flex items-center gap-1.5 text-sm text-ink hover:text-ochre transition-colors group border-b border-hairline pb-1">
                Read the documentation <ArrowUpRight className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── AI TOOLS ─────────────── */}
      <section className="py-24 md:py-32 border-t border-hairline bg-paper">
        <div className="container">
          <div className="mb-16 max-w-2xl">
            <p className="eyebrow mb-6">§ 06 · Adjacencies</p>
            <h2 className="display text-4xl md:text-6xl text-ink">
              Beyond the signature.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed font-light mt-6">
              Three quiet instruments your account inherits the moment you arrive.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-hairline border border-hairline">
            {[
              { icon: ScanSearch, n: "I", title: "Contract Scanner", desc: "Upload any rental contract. AI returns missing clauses, liability gaps and legal red flags within seconds.", credit: "10 credits", link: "/contract-scanner" },
              { icon: BarChart3, n: "II", title: "Listing Analyzer", desc: "Paste an Airbnb, VRBO or Swimply URL. Get a 0–100 health score with prioritized fixes for SEO, pricing and conversion.", credit: "40 credits", link: "/listing-analyzer" },
              { icon: FolderOpen, n: "III", title: "Document Vault", desc: "Store contracts, insurance and rental agreements in one secure repository. 100 MB included on every account.", credit: "2 credits / upload", link: "/documents" },
            ].map((tool) => (
              <div key={tool.title} className="bg-background p-8 md:p-10 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <p className="font-heading text-[11px] tracking-[0.2em] text-muted-foreground">{tool.n}</p>
                  <tool.icon className="h-5 w-5 text-ink stroke-[1.25]" />
                </div>
                <h3 className="font-heading text-2xl font-medium tracking-tight text-ink mb-3">{tool.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-light flex-1 mb-6">{tool.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-hairline">
                  <span className="text-xs text-muted-foreground">{tool.credit}</span>
                  <Link to={tool.link} className="text-xs text-ink hover:text-ochre inline-flex items-center gap-1 group">
                    Open <ArrowUpRight className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── TESTIMONIAL ─────────────── */}
      <section className="py-24 md:py-32 border-t border-hairline">
        <div className="container max-w-4xl">
          <p className="eyebrow text-center mb-10">§ 07 · From the field</p>
          <blockquote className="display-light text-3xl md:text-5xl text-ink text-center leading-tight">
            &ldquo;We switched from a forty-nine dollar a month platform and saved over four hundred our first season. The group link alone <span className="italic text-ochre">changed pool parties</span> for us.&rdquo;
          </blockquote>
          <div className="mt-12 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="hairline w-12 h-px" />
            <span>Pool rental host · Riverside, California</span>
            <span className="hairline w-12 h-px" />
          </div>
        </div>
      </section>

      {/* ─────────────── PRICING ─────────────── */}
      <section id="pricing" className="py-24 md:py-32 border-t border-hairline bg-paper">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-10 mb-16 md:mb-20">
            <div className="md:col-span-5">
              <p className="eyebrow mb-6">§ 08 · The arithmetic</p>
              <h2 className="display text-4xl md:text-6xl text-ink">
                Six cents.
                <br />
                <span className="italic font-light text-ochre">No subscription.</span>
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="text-lg text-muted-foreground leading-relaxed font-light">
                Buy a packet of credits. Spend them on signed waivers. They never expire and unlock no premium tier — there isn't one.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-hairline border border-hairline">
            {CREDIT_PACKAGES.map((pkg) => (
              <div key={pkg.id} className={`bg-background p-6 md:p-8 flex flex-col justify-between min-h-[240px] relative ${pkg.popular ? "ring-1 ring-inset ring-ink z-10" : ""}`}>
                {pkg.popular && (
                  <span className="absolute top-4 right-4 text-[10px] tracking-[0.16em] uppercase text-ochre font-medium">Recommended</span>
                )}
                <div>
                  <p className="font-heading text-[10px] tracking-[0.2em] text-muted-foreground mb-3">CREDITS</p>
                  <p className="display-light text-4xl md:text-5xl text-ink tabular-nums">{pkg.credits.toLocaleString()}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-hairline">
                  <p className="font-heading text-2xl font-medium text-ink tabular-nums">${pkg.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">{pkg.perWaiver} per waiver</p>
                  <Link to="/login" className="mt-4 inline-flex items-center gap-1 text-xs text-ink hover:text-ochre group">
                    Select <ArrowUpRight className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-ochre" /> Every feature included</span>
            <span className="hairline w-px h-3" />
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-ochre" /> Credits never expire</span>
            <span className="hairline w-px h-3" />
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-ochre" /> Auto-recharge available</span>
          </div>
        </div>
      </section>

      {/* ─────────────── COMPARISON ─────────────── */}
      <section className="py-24 md:py-32 border-t border-hairline">
        <div className="container max-w-4xl">
          <p className="eyebrow mb-6">§ 09 · A small accounting</p>
          <h2 className="display text-4xl md:text-6xl text-ink mb-16">
            Why hosts move.
          </h2>

          <div className="border-y border-hairline">
            {[
              { them: "$29–$99 monthly subscription", us: "Pay per waiver, six cents each" },
              { them: "Group waivers cost extra", us: "Group waivers included" },
              { them: "API and embeds locked behind premium", us: "Full API and embed widgets, all accounts" },
              { them: "Per-seat pricing for teams", us: "Unlimited team members" },
              { them: "Generic system emails", us: "Fully branded auth and notification emails" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 py-6 border-t border-hairline first:border-t-0 items-center">
                <p className="font-heading text-[10px] tracking-[0.16em] text-muted-foreground tabular-nums md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="md:col-span-5 text-sm text-muted-foreground line-through decoration-hairline font-light">
                  {row.them}
                </p>
                <p className="md:col-span-6 text-base text-ink font-light flex items-center gap-3">
                  <span className="hairline w-6 h-px" />
                  {row.us}
                </p>
              </div>
            ))}
          </div>

          <Link to="/compare" className="mt-10 inline-flex items-center gap-1.5 text-sm text-ink hover:text-ochre group border-b border-hairline pb-1">
            Full comparison <ArrowUpRight className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ─────────────── FAQ ─────────────── */}
      <section id="faq" className="py-24 md:py-32 border-t border-hairline bg-paper">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-12 gap-10 mb-12">
            <div className="md:col-span-5">
              <p className="eyebrow mb-6">§ 10 · Common questions</p>
              <h2 className="display text-4xl md:text-5xl text-ink">
                Everything else.
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="text-lg text-muted-foreground leading-relaxed font-light">
                What hosts ask before switching from paper, PDFs, or another platform.
              </p>
            </div>
          </div>
          <div className="border-b border-hairline">
            {LANDING_FAQS.map((item, i) => (
              <FaqItem key={item.question} q={item.question} a={item.answer} idx={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── FINAL CTA ─────────────── */}
      <section className="bg-ink text-bone py-28 md:py-40 grain">
        <div className="container">
          <div className="flex items-center justify-between mb-16 text-bone/50">
            <span className="eyebrow text-bone/50">Coda</span>
            <span className="eyebrow text-bone/50 tabular-nums">№ 0001</span>
          </div>
          <h2 className="display-light text-5xl md:text-8xl lg:text-9xl text-bone max-w-5xl">
            Begin with two
            <br />
            hundred and fifty
            <br />
            <span className="italic font-light text-ochre">free credits.</span>
          </h2>
          <div className="mt-20 grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7">
              <div className="hairline h-px mb-6 opacity-30" />
              <p className="text-lg text-bone/70 font-light max-w-md">
                No credit card. No subscription. No premium tier hiding the feature you need. Just send a waiver.
              </p>
            </div>
            <div className="md:col-span-5 md:text-right">
              <Link to="/login">
                <Button size="lg" className="rounded-full h-14 px-8 text-[15px] font-medium gap-2 bg-bone text-ink hover:bg-bone/90">
                  Open an account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="mt-4 text-xs text-bone/40">Setup in five minutes · Cancel anytime · Always-on support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Organization schema is emitted once in index.html <head> — do not duplicate it here */}
      <JsonLd
        data={[
          softwareApplicationSchema(),
          faqSchema(LANDING_FAQS),
        ]}
      />


      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
