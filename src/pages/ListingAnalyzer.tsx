import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Download, AlertTriangle, CheckCircle, Info, XCircle,
  Type, FileText, DollarSign, Camera, ListChecks, ShieldCheck,
  Calendar, MessageCircle, Star, Globe, Target, Loader2, Zap,
  Clock, TrendingUp, ArrowRight, History
} from "lucide-react";
import jsPDF from "jspdf";

const PLATFORMS = [
  { value: "airbnb", label: "Airbnb" },
  { value: "vrbo", label: "VRBO" },
  { value: "swimply", label: "Swimply" },
  { value: "poolrentalnearme", label: "PoolRentalNearMe" },
  { value: "other", label: "Other" },
];

const CATEGORY_ICONS: Record<string, typeof Type> = {
  title_optimization: Type,
  description_analysis: FileText,
  pricing_strategy: DollarSign,
  photos: Camera,
  amenities_features: ListChecks,
  house_rules: ShieldCheck,
  availability_calendar: Calendar,
  response_rate: MessageCircle,
  reviews_strategy: Star,
  google_seo: Globe,
  competitive_positioning: Target,
};

const PRIORITY_CONFIG = {
  critical: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Critical", sort: 0 },
  high: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", label: "High", sort: 1 },
  medium: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Medium", sort: 2 },
  low: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Low", sort: 3 },
};

const SCORE_CONFIG = {
  critical: { color: "text-red-400", bg: "bg-red-500/20" },
  warning: { color: "text-orange-400", bg: "bg-orange-500/20" },
  good: { color: "text-emerald-400", bg: "bg-emerald-500/20" },
  info: { color: "text-blue-400", bg: "bg-blue-500/20" },
};

const ANALYSIS_STEPS = [
  "Fetching listing data…",
  "Analyzing title & description…",
  "Evaluating pricing strategy…",
  "Reviewing photos & media…",
  "Checking amenities & features…",
  "Analyzing house rules…",
  "Reviewing availability settings…",
  "Checking response metrics…",
  "Evaluating reviews strategy…",
  "Running SEO audit…",
  "Analyzing competitive position…",
  "Generating recommendations…",
];

interface CategoryResult {
  id: string;
  name: string;
  icon: string;
  score: string;
  priority: string;
  current_status: string;
  what_to_change: string;
  why_it_matters: string;
  pricing_recommendation: string;
  seo_impact: string;
  booking_impact: string;
}

interface AnalysisResult {
  overall_score: number;
  potential_score: number;
  estimated_revenue_increase: string;
  summary: string;
  top_priorities: { title: string; description: string; impact: string }[];
  categories: CategoryResult[];
}

interface PastAnalysis {
  id: string;
  listing_url: string;
  platform: string;
  overall_score: number | null;
  status: string;
  created_at: string;
  categories: any;
  top_priorities: any;
  summary: string | null;
  potential_score: number | null;
  estimated_revenue_increase: string | null;
}

const CREDIT_COST = 40;

export default function ListingAnalyzer() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("analyze");
  const [pastAnalyses, setPastAnalyses] = useState<PastAnalysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { profile, user } = useAuth();
  const { credits, loading: walletLoading } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, profile?.org_id]);

  const loadHistory = async () => {
    if (!profile?.org_id) return;
    setLoadingHistory(true);
    const { data } = await supabase
      .from("listing_analyses")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .limit(20);
    setPastAnalyses((data as PastAnalysis[]) || []);
    setLoadingHistory(false);
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({ title: "Enter a listing URL", variant: "destructive" });
      return;
    }
    if (!platform) {
      toast({ title: "Select a platform", variant: "destructive" });
      return;
    }
    if (credits < CREDIT_COST) {
      toast({ title: "Not enough credits", description: `This analysis costs ${CREDIT_COST} credits. You have ${credits}.`, variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((s) => (s < ANALYSIS_STEPS.length - 1 ? s + 1 : s));
    }, 3000);

    try {
      // Create record first
      const { data: record, error: insertError } = await supabase
        .from("listing_analyses")
        .insert({
          org_id: profile!.org_id!,
          user_id: user!.id,
          listing_url: url.trim(),
          platform,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      const { data, error } = await supabase.functions.invoke("analyze-listing", {
        body: { listing_url: url.trim(), platform, analysis_id: record.id },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Analysis failed", description: data.error, variant: "destructive" });
        return;
      }

      const analysis = data.analysis as AnalysisResult;
      // Sort categories by priority
      analysis.categories.sort((a, b) => {
        const pa = PRIORITY_CONFIG[a.priority as keyof typeof PRIORITY_CONFIG]?.sort ?? 4;
        const pb = PRIORITY_CONFIG[b.priority as keyof typeof PRIORITY_CONFIG]?.sort ?? 4;
        return pa - pb;
      });
      setResult(analysis);
      toast({ title: "Analysis complete!", description: `Score: ${analysis.overall_score}/100` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to analyze listing", variant: "destructive" });
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const viewPastAnalysis = (analysis: PastAnalysis) => {
    if (analysis.status !== "completed" || !analysis.categories) return;
    const r: AnalysisResult = {
      overall_score: analysis.overall_score || 0,
      potential_score: analysis.potential_score || 0,
      estimated_revenue_increase: analysis.estimated_revenue_increase || "",
      summary: analysis.summary || "",
      top_priorities: (analysis.top_priorities as any[]) || [],
      categories: ((analysis.categories as any[]) || []).sort((a, b) => {
        const pa = PRIORITY_CONFIG[a.priority as keyof typeof PRIORITY_CONFIG]?.sort ?? 4;
        const pb = PRIORITY_CONFIG[b.priority as keyof typeof PRIORITY_CONFIG]?.sort ?? 4;
        return pa - pb;
      }),
    };
    setResult(r);
    setUrl(analysis.listing_url);
    setPlatform(analysis.platform);
    setActiveTab("analyze");
  };

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    let y = 20;

    const addPage = () => { doc.addPage(); y = 20; };
    const checkPage = (needed: number) => { if (y + needed > 270) addPage(); };

    // Cover page
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pw, 297, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text("Listing Analysis Report", pw / 2, 60, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(148, 163, 184);
    doc.text(url, pw / 2, 80, { align: "center", maxWidth: pw - 40 });
    doc.text(`Platform: ${PLATFORMS.find(p => p.value === platform)?.label || platform}`, pw / 2, 92, { align: "center" });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pw / 2, 104, { align: "center" });

    doc.setFontSize(48);
    doc.setTextColor(result.overall_score >= 70 ? 34 : result.overall_score >= 40 ? 251 : 239, result.overall_score >= 70 ? 197 : result.overall_score >= 40 ? 146 : 68, result.overall_score >= 70 ? 94 : result.overall_score >= 40 ? 56 : 68);
    doc.text(`${result.overall_score}`, pw / 2, 140, { align: "center" });
    doc.setFontSize(14);
    doc.setTextColor(148, 163, 184);
    doc.text("Overall Score", pw / 2, 150, { align: "center" });
    doc.text(`Potential: ${result.potential_score}/100`, pw / 2, 162, { align: "center" });

    // Executive summary page
    addPage();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pw, 297, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Executive Summary", 20, y);
    y += 12;

    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    const summaryLines = doc.splitTextToSize(result.summary || "", pw - 40);
    doc.text(summaryLines, 20, y);
    y += summaryLines.length * 5 + 10;

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("Top 3 Priorities", 20, y);
    y += 10;

    result.top_priorities.slice(0, 3).forEach((p, i) => {
      checkPage(25);
      doc.setFontSize(11);
      doc.setTextColor(251, 191, 36);
      doc.text(`${i + 1}. ${p.title}`, 20, y);
      y += 6;
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      const descLines = doc.splitTextToSize(p.description, pw - 44);
      doc.text(descLines, 24, y);
      y += descLines.length * 4.5 + 4;
      doc.setTextColor(74, 222, 128);
      doc.text(`Impact: ${p.impact}`, 24, y);
      y += 8;
    });

    if (result.estimated_revenue_increase) {
      checkPage(15);
      doc.setFontSize(12);
      doc.setTextColor(74, 222, 128);
      doc.text(`Estimated Revenue Increase: ${result.estimated_revenue_increase}`, 20, y);
      y += 12;
    }

    // Categories
    result.categories.forEach((cat) => {
      addPage();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pw, 297, "F");

      const prio = PRIORITY_CONFIG[cat.priority as keyof typeof PRIORITY_CONFIG];
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(cat.name, 20, y);
      doc.setFontSize(9);
      doc.setTextColor(prio ? 148 : 148, 163, 184);
      doc.text(`Priority: ${prio?.label || cat.priority} | Status: ${cat.score}`, 20, y + 7);
      y += 18;

      const sections = [
        { label: "Current Status", text: cat.current_status },
        { label: "What to Change", text: cat.what_to_change },
        { label: "Why It Matters", text: cat.why_it_matters },
        { label: "Pricing Recommendation", text: cat.pricing_recommendation },
        { label: "SEO Impact", text: cat.seo_impact },
        { label: "Booking Impact", text: cat.booking_impact },
      ];

      sections.forEach((s) => {
        checkPage(20);
        doc.setFontSize(11);
        doc.setTextColor(251, 191, 36);
        doc.text(s.label, 20, y);
        y += 6;
        doc.setFontSize(9);
        doc.setTextColor(203, 213, 225);
        const lines = doc.splitTextToSize(s.text || "N/A", pw - 40);
        doc.text(lines, 20, y);
        y += lines.length * 4.5 + 6;
      });
    });

    // SEO Checklist
    addPage();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pw, 297, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("SEO Checklist", 20, y);
    y += 12;

    const checklist = [
      "Title includes primary keyword + location",
      "Description is 300+ words with natural keyword usage",
      "Meta description is under 160 characters",
      "All photos have descriptive alt text",
      "Schema markup is present (LocalBusiness / LodgingBusiness)",
      "Page loads in under 3 seconds",
      "Mobile-responsive layout",
      "Local keywords in first paragraph",
      "Internal links to related listings",
      "Google Business Profile is claimed and optimized",
      "Reviews are being actively responded to",
      "Pricing is competitive with market rates",
    ];

    checklist.forEach((item) => {
      checkPage(8);
      doc.setFontSize(10);
      doc.setTextColor(203, 213, 225);
      doc.rect(20, y - 3, 4, 4);
      doc.text(item, 28, y);
      y += 8;
    });

    doc.save(`listing-analysis-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const ScoreGauge = ({ score, size = 140 }: { score: number; size?: number }) => {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

    return (
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth="8" fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-[10px] text-muted-foreground">/ 100</span>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Listing Analyzer</h1>
            <p className="text-sm text-muted-foreground">Get an AI-powered audit of your rental listing</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-muted-foreground">{walletLoading ? "…" : credits} credits</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="analyze"><Search className="h-4 w-4 mr-1.5" />Analyze</TabsTrigger>
            <TabsTrigger value="history"><History className="h-4 w-4 mr-1.5" />History</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6 mt-4">
            {/* Input section */}
            <Card className="border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                  <Input
                    placeholder="Paste your listing URL…"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                    className="h-11"
                  />
                  <Select value={platform} onValueChange={setPlatform} disabled={loading}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-400" />
                    This analysis costs <span className="font-semibold text-foreground">{CREDIT_COST} credits</span>
                  </p>
                  <Button onClick={handleAnalyze} disabled={loading || credits < CREDIT_COST} size="lg">
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Analyzing…</>
                    ) : credits < CREDIT_COST ? (
                      "Not enough credits"
                    ) : (
                      <><Search className="h-4 w-4" />Analyze My Listing</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Loading state */}
            {loading && (
              <Card className="border-primary/20">
                <CardContent className="py-10 flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm font-medium">{ANALYSIS_STEPS[loadingStep]}</p>
                  <Progress value={((loadingStep + 1) / ANALYSIS_STEPS.length) * 100} className="w-64" />
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {result && !loading && (
              <div className="space-y-6">
                {/* Top bar */}
                <div className="flex flex-wrap gap-3 items-center justify-end">
                  <Button onClick={downloadPDF} variant="outline">
                    <Download className="h-4 w-4 mr-1.5" />Download Full Report PDF
                  </Button>
                </div>

                {/* Score + Summary */}
                <div className="grid gap-4 md:grid-cols-[auto_1fr]">
                  <Card className="flex flex-col items-center justify-center p-6 border-primary/20">
                    <ScoreGauge score={result.overall_score} />
                    <p className="text-xs text-muted-foreground mt-2">Listing Health Score</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      Potential: {result.potential_score}/100
                    </div>
                  </Card>
                  <Card className="border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{result.summary}</p>
                      {result.estimated_revenue_increase && (
                        <div className="flex items-center gap-2 text-sm text-emerald-400">
                          <DollarSign className="h-4 w-4" />
                          <span>Estimated improvement: {result.estimated_revenue_increase}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Top priorities */}
                <Card className="border-yellow-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      Top Priorities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {result.top_priorities.slice(0, 3).map((p, i) => (
                        <div key={i} className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-400">{i + 1}</span>
                            <span className="text-sm font-medium">{p.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                          <p className="text-xs text-emerald-400 flex items-center gap-1"><ArrowRight className="h-3 w-3" />{p.impact}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Category cards */}
                <div className="grid gap-4 md:grid-cols-2">
                  {result.categories.map((cat) => {
                    const IconComp = CATEGORY_ICONS[cat.id] || Globe;
                    const prio = PRIORITY_CONFIG[cat.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.low;
                    const sc = SCORE_CONFIG[cat.score as keyof typeof SCORE_CONFIG] || SCORE_CONFIG.info;

                    return (
                      <Card key={cat.id} className="border-border/50 overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded ${sc.bg}`}>
                                <IconComp className={`h-4 w-4 ${sc.color}`} />
                              </div>
                              <CardTitle className="text-sm">{cat.name}</CardTitle>
                            </div>
                            <Badge variant="outline" className={`text-[10px] ${prio.color}`}>{prio.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{cat.current_status}</p>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                          <Section icon={<CheckCircle className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />} title="What to Change" text={cat.what_to_change} />
                          <Section icon={<Info className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />} title="Why It Matters" text={cat.why_it_matters} />
                          <Section icon={<DollarSign className="h-3 w-3 text-yellow-400 shrink-0 mt-0.5" />} title="Pricing" text={cat.pricing_recommendation} />
                          <Section icon={<Globe className="h-3 w-3 text-purple-400 shrink-0 mt-0.5" />} title="SEO Impact" text={cat.seo_impact} />
                          <Section icon={<TrendingUp className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" />} title="Booking Impact" text={cat.booking_impact} />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {loadingHistory ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : pastAnalyses.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No analyses yet. Run your first one!</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {pastAnalyses.map((a) => (
                  <Card key={a.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => viewPastAnalysis(a)}>
                    <CardContent className="py-4 flex items-center justify-between gap-3 flex-wrap">
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.listing_url}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">{PLATFORMS.find(p => p.value === a.platform)?.label || a.platform}</Badge>
                          <Clock className="h-3 w-3" />
                          {new Date(a.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {a.status === "completed" && a.overall_score != null ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`text-lg font-bold ${a.overall_score >= 70 ? "text-emerald-400" : a.overall_score >= 40 ? "text-yellow-400" : "text-red-400"}`}>{a.overall_score}</span>
                            <span className="text-xs text-muted-foreground">/100</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">{a.status}</Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function Section({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-2">
      {icon}
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
