import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Rocket, Shield, Zap, FileText, Camera, Users, QrCode, Send,
  Globe, BarChart3, Webhook, Key, ShoppingBag, CreditCard, Monitor,
  ScanText, FolderOpen, MessageSquare, ReceiptText, Megaphone,
  CheckCircle, Image, Palette, BookOpen, Scale, ArrowLeft
} from "lucide-react";
import logo from "@/assets/logo.png";

interface Update {
  date: string;
  title: string;
  description: string;
  tags: { label: string; variant: "default" | "secondary" | "outline" | "destructive" }[];
  icon: React.ElementType;
  highlights?: string[];
}

const updates: Update[] = [
  {
    date: "March 30, 2026",
    title: "Credit Dispute & Auto-Reimbursement",
    description:
      "Customers can now submit credit disputes directly from the dashboard. Automatic reimbursement of up to 50 credits, with a lifetime max of 2 automatic approvals per organization.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: ReceiptText,
    highlights: [
      "Self-service dispute form with reason selection",
      "Automatic approval for qualifying requests",
      "Dispute history with status tracking",
    ],
  },
  {
    date: "March 30, 2026",
    title: "Click-to-Text Customer Support",
    description:
      "Added a 'Text Us' button on the dashboard so customers can reach support instantly via SMS with a pre-filled message.",
    tags: [{ label: "Improvement", variant: "secondary" }],
    icon: MessageSquare,
  },
  {
    date: "March 28, 2026",
    title: "Document Storage & Management",
    description:
      "Upload, organize, and manage business documents alongside your waivers. Supports PDF, Word, Excel, images, and more with secure cloud storage.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: FolderOpen,
    highlights: [
      "Upload files up to 10 MB each",
      "Secure download links",
      "Storage usage tracking in your wallet",
    ],
  },
  {
    date: "March 25, 2026",
    title: "AI Contract Scanner",
    description:
      "Paste or upload any rental contract and get an instant AI-powered risk analysis. Identifies hidden fees, liability gaps, unfair clauses, and missing protections.",
    tags: [
      { label: "New Feature", variant: "default" },
      { label: "AI-Powered", variant: "outline" },
    ],
    icon: ScanText,
    highlights: [
      "Risk scoring with severity levels",
      "Plain-English clause explanations",
      "Actionable recommendations",
    ],
  },
  {
    date: "March 22, 2026",
    title: "5 New Marketing & SEO Pages",
    description:
      "Launched dedicated landing pages for Contract Overview, Document Checker, Group Waivers, Kiosk Mode, and Photo ID Verification to improve search visibility.",
    tags: [{ label: "SEO", variant: "secondary" }],
    icon: Megaphone,
  },
  {
    date: "March 18, 2026",
    title: "Mobile Design Overhaul",
    description:
      "Completely revamped the landing page for mobile screens — fixed pricing grid layout, improved comparison section readability, and added language switcher to the mobile nav menu.",
    tags: [{ label: "Improvement", variant: "secondary" }],
    icon: Monitor,
  },
  {
    date: "March 15, 2026",
    title: "Security Hardening",
    description:
      "Major security audit and fixes: tightened storage upload policies, added team invite acceptance rules, and removed legacy permissive policies.",
    tags: [{ label: "Security", variant: "destructive" }],
    icon: Shield,
    highlights: [
      "Scoped signer photo uploads to active envelopes",
      "Team invite acceptance restricted to invited email",
      "Removed legacy open upload policies",
    ],
  },
  {
    date: "March 10, 2026",
    title: "SEO Blog Platform — 10 Articles",
    description:
      "Launched a full blog with 10 long-form, SEO-optimized articles targeting top-of-funnel search queries. E-E-A-T compliant with JSON-LD structured data.",
    tags: [{ label: "New Feature", variant: "default" }, { label: "SEO", variant: "secondary" }],
    icon: BookOpen,
    highlights: [
      "Table of contents & cross-linking",
      "FAQ rich snippets via structured data",
      "Hub page at /blog",
    ],
  },
  {
    date: "March 5, 2026",
    title: "Waiver Laws by State",
    description:
      "Added comprehensive waiver law guides for all 50 US states plus DC. Each page covers enforceability, key statutes, age requirements, and best practices.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: Scale,
  },
  {
    date: "February 28, 2026",
    title: "Competitor Comparison Pages",
    description:
      "Published head-to-head comparison pages against 8 major competitors including Smartwaiver, WaiverForever, DocuSign, and PandaDoc.",
    tags: [{ label: "SEO", variant: "secondary" }],
    icon: BarChart3,
  },
  {
    date: "February 22, 2026",
    title: "Multi-Language Support — 12 Languages",
    description:
      "The platform is now available in English, Spanish, French, German, Italian, Portuguese, Arabic, Hindi, Chinese, Japanese, Korean, and more.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: Globe,
  },
  {
    date: "February 15, 2026",
    title: "Kiosk Mode for On-Site Signing",
    description:
      "Deploy any waiver template as a self-service kiosk. Perfect for check-in desks, rental counters, and event entries. Auto-resets after each signature.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: Monitor,
  },
  {
    date: "February 10, 2026",
    title: "Auto-Recharge Credits",
    description:
      "Never run out of credits again. Set a threshold and package — when your balance drops below the threshold, we automatically top up via your saved payment method.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: CreditCard,
  },
  {
    date: "February 5, 2026",
    title: "Marketplace Integration (Hospitable)",
    description:
      "Connect your Hospitable account to automatically send waivers to guests upon booking. Includes webhook-based event sync.",
    tags: [{ label: "Integration", variant: "outline" }],
    icon: ShoppingBag,
  },
  {
    date: "January 28, 2026",
    title: "Webhooks & API Keys",
    description:
      "Full developer toolkit: create API keys, configure webhook endpoints, and receive real-time event notifications for envelope status changes.",
    tags: [{ label: "New Feature", variant: "default" }, { label: "Developer", variant: "outline" }],
    icon: Webhook,
  },
  {
    date: "January 20, 2026",
    title: "Group Signing & QR Codes",
    description:
      "Send a single waiver link to a group — each person signs individually. Generate QR codes for any waiver link to display on signage or print materials.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: Users,
    highlights: [
      "Unique signing session per participant",
      "QR code generation for any waiver",
      "Group signature tracking in envelope detail",
    ],
  },
  {
    date: "January 12, 2026",
    title: "Photo ID Capture",
    description:
      "Require signers to take a selfie or upload a photo ID as part of the signing process. Photos are securely stored alongside the signed waiver.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: Camera,
  },
  {
    date: "January 5, 2026",
    title: "Bulk Send",
    description:
      "Send waivers to up to 100 recipients at once. Upload a CSV or paste emails — each recipient gets a unique signing link.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: Send,
  },
  {
    date: "December 20, 2025",
    title: "Analytics Dashboard",
    description:
      "Visual charts showing waiver volume, completion rates, and trends over time. Filter by date range to spot patterns.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: BarChart3,
  },
  {
    date: "December 10, 2025",
    title: "Team Members & Roles",
    description:
      "Invite team members to your organization with role-based access control. Admins get full access; hosts can view waivers but can't modify templates.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: Users,
  },
  {
    date: "December 1, 2025",
    title: "Completion Certificates & PDF Generation",
    description:
      "Every signed waiver automatically generates a tamper-evident PDF with digital signatures, timestamps, and IP addresses. Download completion certificates for your records.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: FileText,
  },
  {
    date: "November 15, 2025",
    title: "Brand Customization",
    description:
      "Customize your waivers with your logo, brand colors, and fonts. Your signers see your brand, not ours.",
    tags: [{ label: "New Feature", variant: "default" }],
    icon: Palette,
  },
  {
    date: "November 1, 2025",
    title: "🚀 Rental Waivers Launch",
    description:
      "The lowest-cost digital waiver platform goes live. Pay-per-waiver pricing starting at 6¢ — no monthly fees, no contracts. Create templates, send waivers, collect signatures.",
    tags: [{ label: "Launch", variant: "default" }],
    icon: Rocket,
    highlights: [
      "Template builder with drag-and-drop fields",
      "Email delivery with signing links",
      "Real-time status tracking",
      "250 free credits on signup",
    ],
  },
];

export default function Updates() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Rental Waivers" className="h-7 w-7" />
            <span className="font-heading text-lg font-bold tracking-tight">Rental Waivers</span>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-3xl py-12 md:py-20">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">Changelog</Badge>
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Product Updates
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Everything we've shipped to make Rental Waivers better for you.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-6">
            {updates.map((update, i) => (
              <Card key={i} className="relative md:ml-14 overflow-hidden">
                {/* Timeline dot */}
                <div className="hidden md:flex absolute -left-14 top-6 h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background z-10">
                  <update.icon className="h-4 w-4 text-primary" />
                </div>

                <CardContent className="p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <update.icon className="h-4 w-4 text-primary md:hidden" />
                      {update.tags.map((tag, j) => (
                        <Badge key={j} variant={tag.variant} className="text-[10px]">
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {update.date}
                    </time>
                  </div>

                  <h2 className="font-heading text-lg font-semibold mb-1">
                    {update.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {update.description}
                  </p>

                  {update.highlights && (
                    <ul className="mt-3 space-y-1">
                      {update.highlights.map((h, k) => (
                        <li key={k} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            Have a feature request? We'd love to hear from you.
          </p>
          <Button asChild variant="outline">
            <a href="sms:+19092728096?body=Hi%2C%20I%20have%20a%20feature%20request%20for%20Rental%20Waivers%3A%20">
              <MessageSquare className="h-4 w-4 mr-2" />
              Text Us Your Ideas
            </a>
          </Button>
        </div>
      </main>

      <Footer />
    </>
  );
}
