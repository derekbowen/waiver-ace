import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Shield, Users, Send, FileText, ArrowRight, CheckCircle, Clock, Smartphone, Droplets, Home, Wrench, PartyPopper } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

export default function Landing() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Rental Waivers" className="h-8 w-8" />
            <span className="font-heading text-lg font-bold tracking-tight">Rental Waivers</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/docs">
              <Button variant="ghost" size="sm">API Docs</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — big, clear, no jargon */}
      <section className="container pt-32 pb-20">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Get every guest to sign
            <br />
            <span className="text-primary">before they show up</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
            Send a liability waiver. They sign it on their phone. You're covered.
          </p>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Built for pool hosts, vacation rentals, equipment rentals, and anyone who needs a signed waiver before a booking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="gap-2 text-base px-8 py-6">
                Start for Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="text-base px-8 py-6">See How It Works</Button>
            </a>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Free plan includes 5 waivers/month. No credit card required.</p>
        </div>
      </section>

      {/* The Problem — speak to the pain */}
      <section className="border-t bg-secondary/30 py-20">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            You know the problem
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            A family of six books your pool. You need all of them to sign a waiver.
            But you can't stop the money from flowing in just to chase down six email addresses.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 text-center">
              <div className="text-4xl mb-4">😰</div>
              <h3 className="font-heading text-lg font-semibold mb-2">Without Rental Waivers</h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>Printing waivers and hoping guests sign them</li>
                <li>Chasing emails for every person in a group</li>
                <li>Storing paper in a drawer and hoping you never need it</li>
                <li>No proof of what was actually signed</li>
              </ul>
            </div>
            <div className="rounded-xl border-2 border-primary bg-card p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">THE FIX</div>
              <div className="text-4xl mb-4">😎</div>
              <h3 className="font-heading text-lg font-semibold mb-2">With Rental Waivers</h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> One link — everyone signs on their phone</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> No emails needed upfront</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> Money keeps flowing at checkout</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> Every signature saved with full audit trail</li>
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-6 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="font-heading text-lg font-semibold mb-2">What you get</h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>Drawn signature (not just a typed name)</li>
                <li>Timestamp, IP address, and device info</li>
                <li>PDF download of every signed waiver</li>
                <li>Email notification when someone signs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — 3 simple steps */}
      <section id="how-it-works" className="py-20">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Three steps. That's it.
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">No tech skills needed. If you can send a text message, you can use this.</p>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">1</div>
              <h3 className="font-heading text-xl font-semibold mb-2">Pick a template</h3>
              <p className="text-muted-foreground">
                Choose from pre-built waivers for pools, vacation rentals, equipment, or events. Or write your own.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Send className="h-8 w-8 text-primary" />
              </div>
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">2</div>
              <h3 className="font-heading text-xl font-semibold mb-2">Send the link</h3>
              <p className="text-muted-foreground">
                Text it, email it, put it in your booking confirmation. For groups, one link works for everyone.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">3</div>
              <h3 className="font-heading text-xl font-semibold mb-2">They sign. You're covered.</h3>
              <p className="text-muted-foreground">
                Guests sign on their phone with their finger. You get notified instantly. Everything is saved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Group waivers callout */}
      <section className="border-t bg-secondary/30 py-20">
        <div className="container max-w-4xl">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground mb-4">
                <Users className="h-4 w-4" /> Group Waivers
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">
                One link for the whole group
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                A family of 6 booked your pool? Don't ask for 6 email addresses. Just send one link.
                Each person opens it on their phone, signs their own waiver, and you see every signature in your dashboard — in real time.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>No emails needed upfront — don't slow down checkout</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Each person signs individually with their own name</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Live updates — watch signatures come in on your dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Share the link via text, QR code, or booking email</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-green-500" /></div>
                  <div><p className="text-sm font-medium">Mike Johnson</p><p className="text-xs text-muted-foreground">Signed 2 min ago</p></div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-green-500" /></div>
                  <div><p className="text-sm font-medium">Sarah Johnson</p><p className="text-xs text-muted-foreground">Signed 5 min ago</p></div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-green-500" /></div>
                  <div><p className="text-sm font-medium">Tommy Johnson</p><p className="text-xs text-muted-foreground">Signed 8 min ago</p></div>
                </div>
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

      {/* What it looks like on the signer's end */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Your guests sign on their phone
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">
            No app to download. No account to create. They just tap the link and sign with their finger.
          </p>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-xl border bg-card p-5 text-center">
              <Smartphone className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-sm mb-1">Open the link</h3>
              <p className="text-xs text-muted-foreground">Works on any phone, tablet, or computer</p>
            </div>
            <div className="rounded-xl border bg-card p-5 text-center">
              <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-sm mb-1">Read the waiver</h3>
              <p className="text-xs text-muted-foreground">Must scroll to the bottom to continue</p>
            </div>
            <div className="rounded-xl border bg-card p-5 text-center">
              <span className="text-3xl block mb-1">✍️</span>
              <h3 className="font-semibold text-sm mb-1">Draw signature</h3>
              <p className="text-xs text-muted-foreground">Real signature with their finger — not just a typed name</p>
            </div>
            <div className="rounded-xl border bg-card p-5 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-sm mb-1">Done</h3>
              <p className="text-xs text-muted-foreground">They get a confirmation. You get notified.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-t bg-secondary/30 py-20">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Works for any type of rental
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">
            Pre-built templates ready to go. Just pick one, customize it, and start sending.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Droplets className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-heading font-semibold mb-1">Pool & Hot Tub</h3>
              <p className="text-sm text-muted-foreground">Swimply hosts, backyard pools, hot tub rentals</p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <Home className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-heading font-semibold mb-1">Vacation Rentals</h3>
              <p className="text-sm text-muted-foreground">Airbnb, VRBO, short-term rental homes</p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                <Wrench className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-heading font-semibold mb-1">Equipment</h3>
              <p className="text-sm text-muted-foreground">Bikes, kayaks, tools, cameras, sports gear</p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <PartyPopper className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-heading font-semibold mb-1">Events & Venues</h3>
              <p className="text-sm text-muted-foreground">Party spaces, event halls, outdoor venues</p>
            </div>
          </div>
        </div>
      </section>

      {/* What you're really getting */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">
            Everything you need. Nothing you don't.
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: FileText, title: "Pre-built waiver templates", desc: "Pool, vacation rental, equipment, and event templates ready to customize. Or write your own from scratch." },
              { icon: Users, title: "Group waivers", desc: "One link for the whole party. Everyone signs individually on their phone. No emails needed upfront." },
              { icon: Shield, title: "Legally defensible signatures", desc: "Drawn signatures, timestamps, IP addresses, and device info. PDF download with full audit trail." },
              { icon: Send, title: "Automatic notifications", desc: "Signer gets a confirmation email. You get notified the moment someone signs." },
              { icon: CheckCircle, title: "Real-time dashboard", desc: "See who signed, who hasn't, and get live updates. No refreshing needed." },
              { icon: Clock, title: "Auto-expiration and reminders", desc: "Waivers expire after the time you set. Unsigned waivers get automatic reminders." },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 rounded-xl border p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border bg-accent/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>For developers:</strong> Full REST API and webhooks to integrate with your booking platform.
              Plug into Sharetribe, custom apps, Zapier, and more.{" "}
              <Link to="/docs" className="text-primary underline">Read the API docs</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Pricing quick glance */}
      <section className="border-t bg-secondary/30 py-20">
        <div className="container max-w-3xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Simple pricing
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">
            Start free. Upgrade when you need more waivers.
          </p>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              { name: "Free", price: "$0", waivers: "5/month", highlight: false },
              { name: "Starter", price: "$19", waivers: "15/month", highlight: false },
              { name: "Growth", price: "$49", waivers: "50/month", highlight: true },
              { name: "Business", price: "$99", waivers: "150/month", highlight: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-xl border p-6 text-center ${p.highlight ? "border-primary border-2 bg-card relative" : "bg-card"}`}>
                {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>}
                <p className="text-sm text-muted-foreground mb-1">{p.name}</p>
                <p className="font-heading text-3xl font-bold mb-1">{p.price}</p>
                <p className="text-sm text-muted-foreground">{p.waivers}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            All plans include group waivers, templates, notifications, and PDF downloads.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-20">
        <div className="container text-center max-w-2xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Protect yourself in 5 minutes
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Pick a template. Send a link. Get signed waivers. It's really that simple.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="gap-2 text-base px-8 py-6">
              Create Your Free Account <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-primary-foreground/60 text-sm mt-4">No credit card required</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
