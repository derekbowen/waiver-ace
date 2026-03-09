import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Shield, Users, Send, FileText, ArrowRight, CheckCircle, Clock, Smartphone, Droplets, Home, Wrench, PartyPopper, Zap, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TIERS } from "@/lib/stripe-tiers";
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
            <Link to="/my-waivers">
              <Button variant="ghost" size="sm">My Waivers</Button>
            </Link>
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

      {/* Hero */}
      <section className="container pt-32 pb-20">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium mb-6">
            <Zap className="h-4 w-4" /> Now with automatic marketplace integration
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Waivers that send themselves
            <br />
            <span className="text-primary">when customers book</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
            Connect your marketplace. When a customer books, they automatically get a waiver to sign. One tap, done. You're covered.
          </p>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Built for pool hosts, vacation rentals, equipment rentals, and any marketplace that needs signed waivers.
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

      {/* Marketplace integration hero */}
      <section className="border-t bg-primary/5 py-20">
        <div className="container max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1 text-sm text-primary mb-4">
                <Globe className="h-4 w-4" /> Marketplace Integration
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Zero work for your customers
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Your marketplace sends us the booking. We pull the customer's info, generate the waiver, and email them a signing link. They sign on their phone in under 60 seconds. That's it.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span><strong>ShareTribe, custom marketplaces, any platform</strong> — one webhook is all it takes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span><strong>Auto-generated waivers</strong> — we create the liability waiver with the customer's info pre-filled</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span><strong>Customer portal</strong> — customers can check their waiver status anytime at <code className="bg-accent px-1.5 rounded text-sm">/my-waivers</code></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span><strong>Status API</strong> — your marketplace can check if a waiver is signed before confirming a booking</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <p className="text-xs font-mono text-muted-foreground mb-2">The entire flow:</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-600">1</div>
                  <div>
                    <p className="text-sm font-medium">Customer books on your marketplace</p>
                    <p className="text-xs text-muted-foreground">ShareTribe sends webhook to Rental Waivers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-600">2</div>
                  <div>
                    <p className="text-sm font-medium">Customer gets email: "Sign your waiver"</p>
                    <p className="text-xs text-muted-foreground">Pre-filled with their name, booking, and listing</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-sm font-bold text-green-600">3</div>
                  <div>
                    <p className="text-sm font-medium">They tap the link, sign their name, done</p>
                    <p className="text-xs text-muted-foreground">Under 60 seconds on their phone</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-400">Your dashboard shows green</p>
                    <p className="text-xs text-green-600 dark:text-green-500">PDF saved, audit trail complete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20">
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
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> Booking triggers waiver automatically</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> Customer signs on their phone in 60 seconds</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> No emails to chase — it's all automatic</li>
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

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-secondary/30 py-20">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Two ways to send waivers
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">Pick the one that fits your workflow. Or use both.</p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Automatic */}
            <div className="rounded-2xl border-2 border-primary bg-card p-8 relative">
              <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Zap className="h-3 w-3" /> AUTOMATIC
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3 mt-2">Marketplace Integration</h3>
              <p className="text-muted-foreground mb-4">
                Connect ShareTribe or your marketplace. When a booking comes in, we auto-generate a waiver with the customer's info and email them a signing link. Zero manual work.
              </p>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>
                  <span>Connect your marketplace in Settings</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</div>
                  <span>Customer books — waiver sent automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</div>
                  <span>They sign on their phone. You're covered.</span>
                </li>
              </ol>
            </div>

            {/* Manual */}
            <div className="rounded-2xl border bg-card p-8">
              <h3 className="font-heading text-xl font-semibold mb-3 mt-2">Manual Send</h3>
              <p className="text-muted-foreground mb-4">
                Pick a template, enter the customer's email, and send. Or share a group link for parties. Great for one-off bookings or walk-ins.
              </p>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">1</div>
                  <span>Pick a waiver template</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">2</div>
                  <span>Send via email or share the link</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">3</div>
                  <span>They sign. You get notified.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Group waivers callout */}
      <section className="py-20">
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

      {/* Customer portal callout */}
      <section className="border-t bg-secondary/30 py-20">
        <div className="container max-w-4xl">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div className="order-2 md:order-1 rounded-2xl border bg-card p-6">
              <div className="space-y-3">
                <div className="rounded-lg border bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 p-5 text-center">
                  <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-2" />
                  <p className="font-bold text-green-800 dark:text-green-400">You're All Set</p>
                  <p className="text-sm text-green-600 dark:text-green-500">All your waivers are signed and up to date.</p>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-green-500" /></div>
                  <div className="flex-1"><p className="text-sm font-medium">Heated Pool with Slide</p><p className="text-xs text-muted-foreground">Signed Mar 5</p></div>
                  <span className="text-xs font-medium text-green-600">Signed</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-green-500" /></div>
                  <div className="flex-1"><p className="text-sm font-medium">Beach House Rental</p><p className="text-xs text-muted-foreground">Signed Feb 28</p></div>
                  <span className="text-xs font-medium text-green-600">Signed</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground mb-4">
                <Shield className="h-4 w-4" /> Customer Portal
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">
                Customers can check their own status
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Your customers visit <code className="bg-accent px-1.5 rounded text-sm">/my-waivers</code>, enter their email, and instantly see all their waivers. Green means they're good. Yellow means something needs signing.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>No login or account required — just their email</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Sign outstanding waivers right from the portal</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>All on your domain — no separate software needed</span>
                </li>
              </ul>
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
              <p className="text-xs text-muted-foreground">Waiver text is there — legally required</p>
            </div>
            <div className="rounded-xl border bg-card p-5 text-center">
              <span className="text-3xl block mb-1">✍️</span>
              <h3 className="font-semibold text-sm mb-1">Sign your name</h3>
              <p className="text-xs text-muted-foreground">Draw with their finger — takes seconds</p>
            </div>
            <div className="rounded-xl border bg-card p-5 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-sm mb-1">Done</h3>
              <p className="text-xs text-muted-foreground">They get a copy. You get notified.</p>
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

      {/* Features grid */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">
            Everything you need. Nothing you don't.
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: Zap, title: "Automatic marketplace integration", desc: "Connect ShareTribe or any marketplace. Waivers are generated and sent automatically when a booking comes in." },
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
              Plug into ShareTribe, custom apps, Zapier, and more.{" "}
              <Link to="/docs" className="text-primary underline">Read the API docs</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
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
              { name: TIERS.free.name, price: `$${TIERS.free.price}`, waivers: `${TIERS.free.waiver_limit}/month`, highlight: false },
              { name: TIERS.starter.name, price: `$${TIERS.starter.price}`, waivers: `${TIERS.starter.waiver_limit}/month`, highlight: false },
              { name: TIERS.growth.name, price: `$${TIERS.growth.price}`, waivers: `${TIERS.growth.waiver_limit}/month`, highlight: true },
              { name: TIERS.business.name, price: `$${TIERS.business.price}`, waivers: `${TIERS.business.waiver_limit}/month`, highlight: false },
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
            All plans include marketplace integration, group waivers, templates, notifications, and PDF downloads.
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
            Connect your marketplace. Waivers send themselves. Customers sign in 60 seconds. Done.
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
