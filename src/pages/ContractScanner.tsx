import { useState, useCallback } from "react";
import { generateContractPdf } from "@/lib/contract-pdf";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  FileSearch, Upload, Shield, AlertTriangle, CheckCircle, XCircle, FileText,
  Loader2, ArrowRight, Scale, Target, MessageSquare, Clock, Users,
  ChevronDown, ChevronUp, BadgeCheck, Pencil, Briefcase, ShieldCheck, BookOpen,
  Coins, Zap, Download, Microscope, Gavel, Library, TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// ── Types ──
interface Party { name: string; role: string }
interface KeyDate { label: string; value: string }
interface Clause {
  clause_type: string; summary: string;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_reason: string; location?: string;
}
interface MissingClause {
  clause_type: string;
  importance: "recommended" | "important" | "critical";
  explanation: string;
}
interface RedFlag { title: string; description: string; severity: "warning" | "danger" | "critical" }
interface NegotiationPoint { point: string; suggestion: string; priority: "low" | "medium" | "high" }
interface Verification {
  confidence_score: number; verification_summary: string;
  corrections: { original_finding: string; correction: string; severity_change?: string }[];
  missed_risks: { risk: string; severity: string; explanation: string }[];
}
interface Redline {
  original_text: string; suggested_text: string;
  reason: string; priority: "must_change" | "should_change" | "nice_to_have";
}
interface ExecBrief {
  one_liner: string; recommendation: string;
  top_3_concerns: string[]; financial_exposure: string;
  timeline_pressure: string; action_items: string[];
}
interface ComplianceResult {
  applicable_regulations: { regulation: string; status: string; findings: string }[];
  compliance_score: number; critical_gaps: string[];
}
interface PlaybookResult {
  clause_ratings: { clause_type: string; language_quality: string; recommendation: string; standard_language?: string }[];
  overall_grade: string;
}
interface ExitStrategyResult {
  overall_difficulty: "easy" | "moderate" | "difficult" | "very_difficult" | "near_impossible";
  estimated_cost_range: string;
  fastest_exit_timeline: string;
  exit_routes: {
    route_name: string;
    description: string;
    feasibility: "high" | "moderate" | "low" | "very_low";
    estimated_cost: string;
    timeline: string;
    legal_basis: string;
    steps: string[];
    risks: string[];
  }[];
  breach_analysis: {
    party: string;
    potential_breaches: string[];
    evidence_needed: string;
    leverage_level: "strong" | "moderate" | "weak";
  }[];
  force_majeure_applicability: {
    applicable: boolean;
    qualifying_events: string[];
    notice_requirements: string;
    analysis: string;
  };
  negotiation_leverage: {
    leverage_point: string;
    strength: "strong" | "moderate" | "weak";
    how_to_use: string;
    counterparty_motivation: string;
  }[];
  mutual_termination_template: string;
  warning_risks: {
    risk: string;
    severity: "low" | "medium" | "high" | "critical";
    mitigation: string;
  }[];
  exit_summary: string;
}
interface DeepResearchResult {
  legal_framework: {
    governing_jurisdictions: string[];
    applicable_statutes: { statute: string; section?: string; relevance: string }[];
    regulatory_bodies?: string[];
  };
  case_law_analysis: {
    clause_type: string; case_name: string; citation?: string;
    holding: string; relevance_to_contract: string;
    risk_implication: "favorable" | "neutral" | "unfavorable" | "highly_unfavorable";
  }[];
  enforceability_assessment: {
    clause_type: string;
    enforceability: "highly_enforceable" | "likely_enforceable" | "uncertain" | "likely_unenforceable" | "void";
    legal_basis: string; key_factors: string[];
  }[];
  liability_exposure: {
    risk_area: string;
    exposure_level: "minimal" | "moderate" | "significant" | "severe" | "catastrophic";
    estimated_range: string;
    mitigating_factors?: string[];
    aggravating_factors?: string[];
  }[];
  jurisdiction_risks?: {
    jurisdiction: string; specific_risk: string;
    mandatory_provision?: string; consequence_if_missing?: string;
  }[];
  regulatory_landscape?: {
    current_regulations: { regulation: string; impact: string; compliance_status?: string }[];
    pending_legislation?: { legislation: string; potential_impact: string; expected_timeline?: string }[];
  };
  strategic_recommendations: {
    area: string; recommendation: string; legal_basis?: string;
    priority: "critical" | "high" | "medium" | "low";
    suggested_language?: string;
  }[];
  research_summary: string;
  overall_legal_risk_rating: "low" | "moderate" | "elevated" | "high" | "critical";
}
interface ContractAnalysis {
  contract_type: string; parties: Party[]; key_dates: KeyDate[];
  clauses: Clause[]; missing_clauses: MissingClause[];
  red_flags: RedFlag[]; negotiation_points: NegotiationPoint[];
  executive_summary: string; risk_score: number;
  addons?: {
    verification?: Verification;
    redlines?: { redlines: Redline[] };
    exec_brief?: ExecBrief;
    compliance?: ComplianceResult;
    playbook?: PlaybookResult;
    deep_research?: DeepResearchResult;
    exit_strategy?: ExitStrategyResult;
  };
}

// ── Add-on definitions ──
const ADDONS = [
  { key: "exitStrategy", label: "🚪 Exit Strategy", desc: "How to legally get out of this contract — exit routes, costs, timelines, leverage points & template letters", credits: 1000, icon: Scale },
  { key: "deepResearch", label: "🔬 Deep Legal Research", desc: "Exhaustive legal analysis with case law, statutes, enforceability, and liability exposure", credits: 500, icon: Microscope },
  { key: "aiVerification", label: "AI Verification", desc: "Second AI reviews the first analysis for accuracy", credits: 10, icon: BadgeCheck },
  { key: "redlineSuggestions", label: "Redline Suggestions", desc: "Specific text changes to protect your position", credits: 10, icon: Pencil },
  { key: "execBrief", label: "Executive Brief", desc: "C-level summary with recommendation & action items", credits: 5, icon: Briefcase },
  { key: "complianceCheck", label: "Compliance Check", desc: "GDPR, CCPA, SOC2, HIPAA regulatory gap analysis", credits: 10, icon: ShieldCheck },
  { key: "playbookComparison", label: "Playbook Comparison", desc: "Grade clauses against industry best practices", credits: 10, icon: BookOpen },
] as const;

type AddonKey = typeof ADDONS[number]["key"];

const STEPS = [
  { label: "Uploading contract", icon: Upload },
  { label: "Extracting clauses", icon: FileText },
  { label: "Analyzing risks", icon: Shield },
  { label: "Running add-ons", icon: Zap },
  { label: "Generating report", icon: Target },
];

// ── Helper components ──
function RiskScoreGauge({ score }: { score: number }) {
  const color = score <= 25 ? "text-green-500" : score <= 50 ? "text-yellow-500" : score <= 75 ? "text-orange-500" : "text-red-500";
  const label = score <= 25 ? "Low Risk" : score <= 50 ? "Moderate Risk" : score <= 75 ? "High Risk" : "Critical Risk";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`text-5xl font-bold ${color}`}>{score}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <Progress value={score} className="w-32 h-2" />
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const v = level === "low" ? "outline" : level === "medium" ? "secondary" : level === "high" ? "default" : "destructive";
  return <Badge variant={v} className="text-xs capitalize">{level}</Badge>;
}
function SeverityBadge({ severity }: { severity: string }) {
  const v = severity === "warning" ? "secondary" : severity === "danger" ? "default" : "destructive";
  return <Badge variant={v} className="text-xs capitalize">{severity}</Badge>;
}
function PriorityBadge({ priority }: { priority: string }) {
  const v = priority === "low" ? "outline" : priority === "medium" ? "secondary" : "default";
  return <Badge variant={v} className="text-xs capitalize">{priority}</Badge>;
}

// ── Main component ──
export default function ContractScanner() {
  const { profile, user } = useAuth();
  const [contractText, setContractText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [expandedClauses, setExpandedClauses] = useState<Set<number>>(new Set());
  const [enabledAddons, setEnabledAddons] = useState<Record<AddonKey, boolean>>({
    exitStrategy: false,
    deepResearch: false,
    aiVerification: false,
    redlineSuggestions: false,
    execBrief: false,
    complianceCheck: false,
    playbookComparison: false,
  });

  const { data: pastScans, refetch: refetchScans } = useQuery({
    queryKey: ["contract-scans"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("contract_scans" as any).select("*")
        .order("created_at", { ascending: false }).limit(10) as any);
      if (error) throw error;
      return data;
    },
  });

  const toggleAddon = (key: AddonKey) =>
    setEnabledAddons(prev => ({ ...prev, [key]: !prev[key] }));

  const estimatedPages = Math.max(1, Math.ceil(contractText.length / 3000));
  const baseCredits = estimatedPages * 10;
  const addonCredits = ADDONS.reduce((sum, a) => sum + (enabledAddons[a.key] ? a.credits : 0), 0);
  const totalEstimate = baseCredits + addonCredits;
  const activeAddonCount = Object.values(enabledAddons).filter(Boolean).length;

  const handleFileExtract = useCallback(async (file: File) => {
    setIsExtracting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) { toast.error("Not authenticated"); return; }

      const formData = new FormData();
      formData.append("file", file);

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-contract-text`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.session.access_token}` },
          body: formData,
        }
      );

      const json = await resp.json();
      if (!resp.ok) {
        toast.error(json.error || "Failed to extract text");
        setUploadedFile(null);
        return;
      }

      setContractText(json.text);
      toast.success(`Extracted ${json.text.length.toLocaleString()} characters from ${file.name}`);
    } catch {
      toast.error("Failed to extract text from file");
      setUploadedFile(null);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const analyzeContract = useCallback(async () => {
    if (!contractText.trim() || contractText.trim().length < 100) {
      toast.error("Please paste at least 100 characters of contract text");
      return;
    }
    setIsAnalyzing(true);
    setCurrentStep(0);
    setAnalysis(null);

    try {
      const orgId = profile?.org_id;
      if (!orgId) { toast.error("No organization found"); setIsAnalyzing(false); return; }

      const { data: scan, error: scanError } = await (supabase
        .from("contract_scans" as any)
        .insert({ org_id: orgId, user_id: user?.id || "", filename: "pasted-text", status: "pending" })
        .select("id").single() as any);
      if (scanError || !scan) { toast.error("Failed to create scan record"); setIsAnalyzing(false); return; }

      await new Promise(r => setTimeout(r, 500));
      setCurrentStep(1);
      await new Promise(r => setTimeout(r, 400));
      setCurrentStep(2);

      const { data: session } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-contract`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
          body: JSON.stringify({
            scanId: (scan as Record<string, string>).id,
            contractText: contractText.trim(),
            addons: enabledAddons,
          }),
        }
      );

      if (activeAddonCount > 0) {
        setCurrentStep(3);
        await new Promise(r => setTimeout(r, 600));
      }
      setCurrentStep(activeAddonCount > 0 ? 4 : 3);

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        if (err.credits_required) {
          throw new Error(`Insufficient credits. This scan requires ${err.credits_required} credits.`);
        }
        throw new Error(err.error || "Analysis failed");
      }

      await new Promise(r => setTimeout(r, 300));
      const result = await resp.json();
      setAnalysis(result.analysis);
      setCreditsUsed(result.credits_used);
      refetchScans();
      toast.success(`Contract analysis complete! ${result.credits_used} credits used.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  }, [contractText, profile, user, refetchScans, enabledAddons, activeAddonCount]);

  const toggleClause = (idx: number) => {
    setExpandedClauses(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
              <FileSearch className="h-7 w-7 text-primary" />
              Contract Risk Scanner
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered risk analysis, clause extraction, and negotiation suggestions.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            {creditsUsed > 0 && !isAnalyzing && (
              <Badge variant="outline" className="gap-1">
                <Coins className="h-3 w-3" />
                Last scan: {creditsUsed} credits
              </Badge>
            )}
            {analysis && !isAnalyzing && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => generateContractPdf(analysis, creditsUsed)}
              >
                <Download className="h-4 w-4" />
                Download PDF Report
              </Button>
            )}
          </div>
        </div>

        {/* Input + Addons */}
        {!analysis && !isAnalyzing && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload or Paste Your Contract</CardTitle>
                <CardDescription>
                  Upload a PDF/DOCX file or paste the text directly. 10 credits per page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File upload zone */}
                <label
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
                    uploadedFile ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file && (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
                      setUploadedFile(file);
                      setContractText("");
                      handleFileExtract(file);
                    } else {
                      toast.error("Please upload a PDF or DOCX file");
                    }
                  }}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedFile(file);
                        setContractText("");
                        handleFileExtract(file);
                      }
                      e.target.value = "";
                    }}
                  />
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      <span className="text-sm text-muted-foreground">Extracting text from {uploadedFile?.name}…</span>
                    </>
                  ) : uploadedFile ? (
                    <>
                      <FileText className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(0)} KB • Text extracted ✓
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setUploadedFile(null);
                          setContractText("");
                        }}
                      >
                        Remove & start over
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Drop a PDF or DOCX here, or click to browse</span>
                      <span className="text-xs text-muted-foreground">Max 25MB • We extract the text automatically</span>
                    </>
                  )}
                </label>

                {!uploadedFile && (
                  <>
                    <div className="flex items-center gap-3">
                      <Separator className="flex-1" />
                      <span className="text-xs text-muted-foreground">OR</span>
                      <Separator className="flex-1" />
                    </div>
                    <Textarea
                      value={contractText}
                      onChange={(e) => setContractText(e.target.value)}
                      placeholder="Paste your contract text here..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </>
                )}

                {contractText.length > 0 && (
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
                    <span>{contractText.length.toLocaleString()} chars</span>
                    <span>~{estimatedPages} {estimatedPages === 1 ? "page" : "pages"}</span>
                    <span>Base: <strong>{baseCredits} credits</strong></span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add-ons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Premium Add-ons
                </CardTitle>
                <CardDescription>
                  Stack additional AI passes for deeper analysis. Each add-on charges extra credits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {ADDONS.map((addon, idx) => {
                  const isPremium = addon.key === "deepResearch" || addon.key === "exitStrategy";
                  const isExit = addon.key === "exitStrategy";
                  return (
                  <div key={addon.key}>
                    {idx > 0 && <Separator className="my-2" />}
                    <div className={`flex items-center justify-between py-2 ${isPremium ? `p-3 -mx-3 rounded-lg bg-gradient-to-r ${isExit ? "from-orange-500/5 to-orange-500/10 border border-orange-500/20" : "from-primary/5 to-primary/10 border border-primary/20"}` : ""}`}>
                      <div className="flex items-start gap-3 min-w-0">
                        <addon.icon className={`h-5 w-5 shrink-0 mt-0.5 ${isExit ? "text-orange-500" : isPremium ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-medium ${isPremium ? "font-semibold" : ""}`}>{addon.label}</span>
                            <Badge variant={isPremium ? "default" : "outline"} className={`text-[10px] gap-0.5 ${isExit ? "bg-orange-500" : isPremium ? "bg-primary" : ""}`}>
                              <Coins className="h-2.5 w-2.5" />
                              +{addon.credits}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{addon.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={enabledAddons[addon.key]}
                        onCheckedChange={() => toggleAddon(addon.key)}
                      />
                    </div>
                  </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Cost Summary + Scan Button */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Total Estimated Cost</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">{totalEstimate}</span>
                      <span className="text-sm text-muted-foreground">credits</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {baseCredits} base ({estimatedPages} pages × 10)
                      {addonCredits > 0 && ` + ${addonCredits} add-ons (${activeAddonCount})`}
                    </div>
                  </div>
                  <Button
                    onClick={analyzeContract}
                    disabled={contractText.trim().length < 100}
                    size="lg"
                    className="gap-2 w-full sm:w-auto"
                  >
                    <FileSearch className="h-4 w-4" />
                    Scan Contract — {totalEstimate} credits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Progress */}
        {isAnalyzing && (
          <Card>
            <CardContent className="py-8">
              <div className="space-y-5">
                {STEPS.map((step, idx) => {
                  // Skip "Running add-ons" step if no addons selected
                  if (idx === 3 && activeAddonCount === 0) return null;
                  const isActive = idx === currentStep;
                  const isDone = idx < currentStep;
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isDone ? "bg-primary/10 text-primary" : isActive ? "bg-primary/10 text-primary animate-pulse" : "bg-muted text-muted-foreground"
                      }`}>
                        {isDone ? <CheckCircle className="h-5 w-5" /> : isActive ? <Loader2 className="h-5 w-5 animate-spin" /> : <step.icon className="h-5 w-5" />}
                      </div>
                      <span className={`text-sm font-medium ${isDone ? "text-foreground" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                      {isActive && <div className="flex-1 max-w-32"><Progress value={65} className="h-1.5 animate-pulse" /></div>}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-6">
                This may take 30-90 seconds depending on contract length and add-ons.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {analysis && (
          <>
            {/* Executive Summary + Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Executive Summary</CardTitle>
                  </div>
                  <Badge variant="outline" className="w-fit capitalize">{analysis.contract_type}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{analysis.executive_summary}</p>
                  {analysis.parties.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {analysis.parties.map((p, i) => (
                        <Badge key={i} variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />{p.name} ({p.role})
                        </Badge>
                      ))}
                    </div>
                  )}
                  {analysis.key_dates.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {analysis.key_dates.map((d, i) => (
                        <Badge key={i} variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />{d.label}: {d.value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="flex items-center justify-center">
                <CardContent className="py-8">
                  <RiskScoreGauge score={analysis.risk_score} />
                  {analysis.addons?.verification && (
                    <div className="mt-3 text-center">
                      <Badge variant="outline" className="gap-1">
                        <BadgeCheck className="h-3 w-3" />
                        Verified: {analysis.addons.verification.confidence_score}% confidence
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tabbed Details */}
            <Tabs defaultValue="clauses" className="space-y-4">
              <TabsList className="flex flex-wrap h-auto gap-1">
                <TabsTrigger value="clauses" className="gap-1 text-xs">
                  <FileText className="h-3.5 w-3.5 hidden sm:inline" />Clauses ({analysis.clauses.length})
                </TabsTrigger>
                <TabsTrigger value="red-flags" className="gap-1 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 hidden sm:inline" />Red Flags ({analysis.red_flags.length})
                </TabsTrigger>
                <TabsTrigger value="missing" className="gap-1 text-xs">
                  <XCircle className="h-3.5 w-3.5 hidden sm:inline" />Missing ({analysis.missing_clauses.length})
                </TabsTrigger>
                <TabsTrigger value="negotiate" className="gap-1 text-xs">
                  <MessageSquare className="h-3.5 w-3.5 hidden sm:inline" />Negotiate
                </TabsTrigger>
                {analysis.addons?.redlines && (
                  <TabsTrigger value="redlines" className="gap-1 text-xs">
                    <Pencil className="h-3.5 w-3.5 hidden sm:inline" />Redlines
                  </TabsTrigger>
                )}
                {analysis.addons?.exec_brief && (
                  <TabsTrigger value="exec-brief" className="gap-1 text-xs">
                    <Briefcase className="h-3.5 w-3.5 hidden sm:inline" />Brief
                  </TabsTrigger>
                )}
                {analysis.addons?.compliance && (
                  <TabsTrigger value="compliance" className="gap-1 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5 hidden sm:inline" />Compliance
                  </TabsTrigger>
                )}
                {analysis.addons?.playbook && (
                  <TabsTrigger value="playbook" className="gap-1 text-xs">
                    <BookOpen className="h-3.5 w-3.5 hidden sm:inline" />Playbook
                  </TabsTrigger>
                )}
                {analysis.addons?.verification && (
                  <TabsTrigger value="verification" className="gap-1 text-xs">
                    <BadgeCheck className="h-3.5 w-3.5 hidden sm:inline" />Verified
                  </TabsTrigger>
                )}
                {analysis.addons?.deep_research && (
                  <TabsTrigger value="deep-research" className="gap-1 text-xs">
                    <Microscope className="h-3.5 w-3.5 hidden sm:inline" />Deep Research
                  </TabsTrigger>
                )}
                {analysis.addons?.exit_strategy && (
                  <TabsTrigger value="exit-strategy" className="gap-1 text-xs">
                    <Scale className="h-3.5 w-3.5 hidden sm:inline" />Exit Strategy
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Clauses */}
              <TabsContent value="clauses" className="space-y-2">
                {analysis.clauses.map((clause, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <button onClick={() => toggleClause(idx)} className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <RiskBadge level={clause.risk_level} />
                        <span className="text-sm font-medium capitalize truncate">{clause.clause_type.replace(/_/g, " ")}</span>
                      </div>
                      {expandedClauses.has(idx) ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </button>
                    {expandedClauses.has(idx) && (
                      <div className="px-4 pb-4 space-y-2 border-t pt-3">
                        <p className="text-sm text-muted-foreground">{clause.summary}</p>
                        <p className="text-sm"><span className="font-medium">Risk:</span> <span className="text-muted-foreground">{clause.risk_reason}</span></p>
                        {clause.location && <p className="text-xs text-muted-foreground">📍 {clause.location}</p>}
                      </div>
                    )}
                  </Card>
                ))}
              </TabsContent>

              {/* Red Flags */}
              <TabsContent value="red-flags" className="space-y-3">
                {analysis.red_flags.length === 0 ? (
                  <Card><CardContent className="py-8 text-center text-sm text-muted-foreground"><CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />No red flags detected</CardContent></Card>
                ) : analysis.red_flags.map((flag, idx) => (
                  <Card key={idx}><CardContent className="py-4"><div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${flag.severity === "critical" ? "text-destructive" : flag.severity === "danger" ? "text-orange-500" : "text-yellow-500"}`} />
                    <div><div className="flex items-center gap-2 mb-1"><span className="text-sm font-medium">{flag.title}</span><SeverityBadge severity={flag.severity} /></div>
                    <p className="text-sm text-muted-foreground">{flag.description}</p></div>
                  </div></CardContent></Card>
                ))}
              </TabsContent>

              {/* Missing */}
              <TabsContent value="missing" className="space-y-3">
                {analysis.missing_clauses.length === 0 ? (
                  <Card><CardContent className="py-8 text-center text-sm text-muted-foreground"><CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />All standard clauses found</CardContent></Card>
                ) : analysis.missing_clauses.map((mc, idx) => (
                  <Card key={idx}><CardContent className="py-4"><div className="flex items-start gap-3">
                    <XCircle className={`h-5 w-5 shrink-0 mt-0.5 ${mc.importance === "critical" ? "text-destructive" : mc.importance === "important" ? "text-orange-500" : "text-yellow-500"}`} />
                    <div><div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium capitalize">{mc.clause_type.replace(/_/g, " ")}</span>
                      <Badge variant={mc.importance === "critical" ? "destructive" : mc.importance === "important" ? "default" : "secondary"} className="text-xs capitalize">{mc.importance}</Badge>
                    </div><p className="text-sm text-muted-foreground">{mc.explanation}</p></div>
                  </div></CardContent></Card>
                ))}
              </TabsContent>

              {/* Negotiate */}
              <TabsContent value="negotiate" className="space-y-3">
                {analysis.negotiation_points.map((np, idx) => (
                  <Card key={idx}><CardContent className="py-4"><div className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                    <div><div className="flex items-center gap-2 mb-1"><span className="text-sm font-medium">{np.point}</span><PriorityBadge priority={np.priority} /></div>
                    <p className="text-sm text-muted-foreground">{np.suggestion}</p></div>
                  </div></CardContent></Card>
                ))}
              </TabsContent>

              {/* ── ADD-ON TABS ── */}

              {/* Redlines */}
              {analysis.addons?.redlines && (
                <TabsContent value="redlines" className="space-y-3">
                  {analysis.addons.redlines.redlines.map((rl, idx) => (
                    <Card key={idx}>
                      <CardContent className="py-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={rl.priority === "must_change" ? "destructive" : rl.priority === "should_change" ? "default" : "secondary"} className="text-xs capitalize">
                            {rl.priority.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                            <p className="text-[10px] uppercase font-medium text-destructive mb-1">Remove</p>
                            <p className="text-sm line-through text-muted-foreground">{rl.original_text}</p>
                          </div>
                          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                            <p className="text-[10px] uppercase font-medium text-primary mb-1">Replace with</p>
                            <p className="text-sm">{rl.suggested_text}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{rl.reason}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              )}

              {/* Executive Brief */}
              {analysis.addons?.exec_brief && (
                <TabsContent value="exec-brief">
                  <Card>
                    <CardContent className="py-6 space-y-5">
                      <div>
                        <p className="text-lg font-medium">{analysis.addons.exec_brief.one_liner}</p>
                        <Badge className="mt-2 capitalize" variant={
                          analysis.addons.exec_brief.recommendation === "proceed" ? "outline" :
                          analysis.addons.exec_brief.recommendation === "reject" ? "destructive" : "default"
                        }>
                          {analysis.addons.exec_brief.recommendation.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">Top 3 Concerns</h4>
                        <ol className="list-decimal list-inside space-y-1">
                          {analysis.addons.exec_brief.top_3_concerns.map((c, i) => (
                            <li key={i} className="text-sm text-muted-foreground">{c}</li>
                          ))}
                        </ol>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Financial Exposure</h4>
                          <p className="text-sm text-muted-foreground">{analysis.addons.exec_brief.financial_exposure}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Timeline Pressure</h4>
                          <p className="text-sm text-muted-foreground">{analysis.addons.exec_brief.timeline_pressure}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Action Items</h4>
                        <ul className="space-y-1">
                          {analysis.addons.exec_brief.action_items.map((a, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />{a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Compliance */}
              {analysis.addons?.compliance && (
                <TabsContent value="compliance" className="space-y-3">
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Compliance Score</span>
                        <span className="text-2xl font-bold text-primary">{analysis.addons.compliance.compliance_score}%</span>
                      </div>
                      {analysis.addons.compliance.critical_gaps.length > 0 && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/5 border border-destructive/20">
                          <p className="text-xs font-medium text-destructive mb-1">Critical Gaps</p>
                          <ul className="space-y-1">
                            {analysis.addons.compliance.critical_gaps.map((g, i) => (
                              <li key={i} className="text-sm text-muted-foreground">• {g}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {analysis.addons.compliance.applicable_regulations.map((reg, idx) => (
                    <Card key={idx}>
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{reg.regulation}</span>
                          <Badge variant={
                            reg.status === "compliant" ? "outline" :
                            reg.status === "non_compliant" ? "destructive" :
                            reg.status === "not_applicable" ? "secondary" : "default"
                          } className="text-xs capitalize">{reg.status.replace(/_/g, " ")}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{reg.findings}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              )}

              {/* Playbook */}
              {analysis.addons?.playbook && (
                <TabsContent value="playbook" className="space-y-3">
                  <Card>
                    <CardContent className="py-4 flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Contract Grade</span>
                      <span className={`text-3xl font-bold ${
                        analysis.addons.playbook.overall_grade === "A" ? "text-primary" :
                        analysis.addons.playbook.overall_grade === "B" ? "text-primary" :
                        analysis.addons.playbook.overall_grade === "C" ? "text-yellow-500" :
                        "text-destructive"
                      }`}>{analysis.addons.playbook.overall_grade}</span>
                    </CardContent>
                  </Card>
                  {analysis.addons.playbook.clause_ratings.map((cr, idx) => (
                    <Card key={idx}>
                      <CardContent className="py-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{cr.clause_type.replace(/_/g, " ")}</span>
                          <Badge variant={
                            cr.language_quality === "preferred" ? "outline" :
                            cr.language_quality === "acceptable" ? "secondary" :
                            cr.language_quality === "fallback" ? "default" : "destructive"
                          } className="text-xs capitalize">{cr.language_quality}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{cr.recommendation}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              )}

              {/* Verification */}
              {analysis.addons?.verification && (
                <TabsContent value="verification" className="space-y-3">
                  <Card>
                    <CardContent className="py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Analysis Confidence</span>
                        <span className="text-2xl font-bold text-primary">{analysis.addons.verification.confidence_score}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{analysis.addons.verification.verification_summary}</p>
                    </CardContent>
                  </Card>
                  {analysis.addons.verification.corrections.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Corrections</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {analysis.addons.verification.corrections.map((c, i) => (
                          <div key={i} className="p-3 rounded-md bg-accent/50 space-y-1">
                            <p className="text-sm"><span className="font-medium">Original:</span> {c.original_finding}</p>
                            <p className="text-sm text-primary"><span className="font-medium">Correction:</span> {c.correction}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {analysis.addons.verification.missed_risks.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Missed Risks Found</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {analysis.addons.verification.missed_risks.map((r, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-destructive/5">
                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2"><span className="text-sm font-medium">{r.risk}</span><Badge variant="destructive" className="text-xs">{r.severity}</Badge></div>
                              <p className="text-xs text-muted-foreground mt-1">{r.explanation}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              )}

              {/* Deep Research */}
              {analysis.addons?.deep_research && (
                <TabsContent value="deep-research" className="space-y-6">
                  {/* Research Summary Hero */}
                  <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardContent className="py-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Microscope className="h-5 w-5 text-primary" />
                          <h3 className="font-heading text-lg font-semibold">Deep Legal Research Report</h3>
                        </div>
                        <Badge variant={
                          analysis.addons.deep_research.overall_legal_risk_rating === "low" ? "outline" :
                          analysis.addons.deep_research.overall_legal_risk_rating === "moderate" ? "secondary" :
                          analysis.addons.deep_research.overall_legal_risk_rating === "elevated" ? "default" :
                          "destructive"
                        } className="capitalize text-xs gap-1">
                          <Shield className="h-3 w-3" />
                          {analysis.addons.deep_research.overall_legal_risk_rating} Legal Risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{analysis.addons.deep_research.research_summary}</p>
                    </CardContent>
                  </Card>

                  {/* Legal Framework */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><Gavel className="h-4 w-4 text-primary" />Legal Framework</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Governing Jurisdictions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.addons.deep_research.legal_framework.governing_jurisdictions.map((j, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{j}</Badge>
                          ))}
                        </div>
                      </div>
                      {analysis.addons.deep_research.legal_framework.regulatory_bodies && analysis.addons.deep_research.legal_framework.regulatory_bodies.length > 0 && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Regulatory Bodies</p>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.addons.deep_research.legal_framework.regulatory_bodies.map((b, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{b}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <Separator />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Applicable Statutes</p>
                        <div className="space-y-2">
                          {analysis.addons.deep_research.legal_framework.applicable_statutes.map((s, i) => (
                            <div key={i} className="p-3 rounded-lg border bg-card">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-sm font-medium">{s.statute}{s.section ? ` §${s.section}` : ""}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{s.relevance}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Case Law */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><Library className="h-4 w-4 text-primary" />Case Law & Precedent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysis.addons.deep_research.case_law_analysis.map((c, i) => (
                        <div key={i} className={`p-4 rounded-lg border-l-4 ${
                          c.risk_implication === "favorable" ? "border-l-green-500 bg-green-50/50 dark:bg-green-950/20" :
                          c.risk_implication === "neutral" ? "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20" :
                          c.risk_implication === "unfavorable" ? "border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20" :
                          "border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
                        }`}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-sm font-semibold italic">{c.case_name}</p>
                              {c.citation && <p className="text-[10px] text-muted-foreground font-mono">{c.citation}</p>}
                            </div>
                            <Badge variant={
                              c.risk_implication === "favorable" ? "outline" :
                              c.risk_implication === "neutral" ? "secondary" :
                              c.risk_implication === "unfavorable" ? "default" : "destructive"
                            } className="text-[10px] capitalize shrink-0">{c.risk_implication.replace(/_/g, " ")}</Badge>
                          </div>
                          <Badge variant="outline" className="text-[10px] capitalize mb-2">{c.clause_type.replace(/_/g, " ")}</Badge>
                          <p className="text-xs text-muted-foreground mb-1"><span className="font-medium text-foreground">Holding:</span> {c.holding}</p>
                          <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Relevance:</span> {c.relevance_to_contract}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Enforceability */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4 text-primary" />Enforceability Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.addons.deep_research.enforceability_assessment.map((e, i) => (
                          <div key={i} className="p-3 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium capitalize">{e.clause_type.replace(/_/g, " ")}</span>
                              <Badge variant={
                                e.enforceability === "highly_enforceable" ? "outline" :
                                e.enforceability === "likely_enforceable" ? "secondary" :
                                e.enforceability === "uncertain" ? "default" :
                                "destructive"
                              } className="text-[10px] capitalize">{e.enforceability.replace(/_/g, " ")}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{e.legal_basis}</p>
                            <div className="flex flex-wrap gap-1">
                              {e.key_factors.map((f, j) => (
                                <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{f}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Liability Exposure */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Liability Exposure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.addons.deep_research.liability_exposure.map((l, i) => (
                          <div key={i} className={`p-4 rounded-lg border ${
                            l.exposure_level === "catastrophic" || l.exposure_level === "severe" ? "border-destructive/30 bg-destructive/5" :
                            l.exposure_level === "significant" ? "border-orange-300/30 bg-orange-50/30 dark:bg-orange-950/10" :
                            "bg-card"
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{l.risk_area}</span>
                              <Badge variant={
                                l.exposure_level === "minimal" ? "outline" :
                                l.exposure_level === "moderate" ? "secondary" :
                                l.exposure_level === "significant" ? "default" :
                                "destructive"
                              } className="text-[10px] capitalize">{l.exposure_level}</Badge>
                            </div>
                            <p className="text-sm font-mono text-primary mb-2">{l.estimated_range}</p>
                            {l.mitigating_factors && l.mitigating_factors.length > 0 && (
                              <div className="mt-2">
                                <p className="text-[10px] uppercase font-medium text-green-600 mb-1">Mitigating</p>
                                <ul className="space-y-0.5">
                                  {l.mitigating_factors.map((f, j) => (
                                    <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                      <CheckCircle className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />{f}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {l.aggravating_factors && l.aggravating_factors.length > 0 && (
                              <div className="mt-2">
                                <p className="text-[10px] uppercase font-medium text-destructive mb-1">Aggravating</p>
                                <ul className="space-y-0.5">
                                  {l.aggravating_factors.map((f, j) => (
                                    <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                      <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />{f}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strategic Recommendations */}
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Strategic Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.addons.deep_research.strategic_recommendations.map((r, i) => (
                          <div key={i} className={`p-4 rounded-lg border-l-4 ${
                            r.priority === "critical" ? "border-l-red-500 bg-red-50/30 dark:bg-red-950/10" :
                            r.priority === "high" ? "border-l-orange-500 bg-orange-50/30 dark:bg-orange-950/10" :
                            r.priority === "medium" ? "border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10" :
                            "border-l-gray-300 bg-card"
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold">{r.area}</span>
                              <Badge variant={r.priority === "critical" ? "destructive" : r.priority === "high" ? "default" : "secondary"} className="text-[10px] capitalize">{r.priority}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{r.recommendation}</p>
                            {r.legal_basis && <p className="text-xs text-muted-foreground italic">Legal basis: {r.legal_basis}</p>}
                            {r.suggested_language && (
                              <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10">
                                <p className="text-[10px] uppercase font-medium text-primary mb-1">Suggested Language</p>
                                <p className="text-xs font-mono">{r.suggested_language}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Jurisdiction Risks */}
                  {analysis.addons.deep_research.jurisdiction_risks && analysis.addons.deep_research.jurisdiction_risks.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><Gavel className="h-4 w-4 text-primary" />Jurisdiction-Specific Risks</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {analysis.addons.deep_research.jurisdiction_risks.map((jr, i) => (
                          <div key={i} className="p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-[10px]">{jr.jurisdiction}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{jr.specific_risk}</p>
                            {jr.mandatory_provision && <p className="text-xs mt-1"><span className="font-medium">Required:</span> <span className="text-muted-foreground">{jr.mandatory_provision}</span></p>}
                            {jr.consequence_if_missing && <p className="text-xs text-destructive mt-0.5">⚠ {jr.consequence_if_missing}</p>}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Regulatory Landscape */}
                  {analysis.addons.deep_research.regulatory_landscape && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Regulatory Landscape</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {analysis.addons.deep_research.regulatory_landscape.current_regulations.map((r, i) => (
                          <div key={i} className="p-3 rounded-lg border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{r.regulation}</span>
                              {r.compliance_status && <Badge variant="outline" className="text-[10px] capitalize">{r.compliance_status}</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{r.impact}</p>
                          </div>
                        ))}
                        {analysis.addons.deep_research.regulatory_landscape.pending_legislation && analysis.addons.deep_research.regulatory_landscape.pending_legislation.length > 0 && (
                          <>
                            <Separator />
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending Legislation</p>
                            {analysis.addons.deep_research.regulatory_landscape.pending_legislation.map((p, i) => (
                              <div key={i} className="p-3 rounded-lg border border-dashed">
                                <span className="text-sm font-medium">{p.legislation}</span>
                                {p.expected_timeline && <Badge variant="secondary" className="text-[10px] ml-2">{p.expected_timeline}</Badge>}
                                <p className="text-xs text-muted-foreground mt-1">{p.potential_impact}</p>
                              </div>
                            ))}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              )}

              {/* Exit Strategy */}
              {analysis.addons?.exit_strategy && (
                <TabsContent value="exit-strategy" className="space-y-6">
                  {/* Exit Summary Hero */}
                  <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent">
                    <CardContent className="py-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale className="h-5 w-5 text-orange-500" />
                          <h3 className="font-heading text-lg font-semibold">Contract Exit Strategy</h3>
                        </div>
                        <Badge variant={
                          analysis.addons.exit_strategy.overall_difficulty === "easy" ? "outline" :
                          analysis.addons.exit_strategy.overall_difficulty === "moderate" ? "secondary" :
                          analysis.addons.exit_strategy.overall_difficulty === "difficult" ? "default" :
                          "destructive"
                        } className="capitalize text-xs gap-1">
                          {analysis.addons.exit_strategy.overall_difficulty.replace(/_/g, " ")} to Exit
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{analysis.addons.exit_strategy.exit_summary}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <div className="p-3 rounded-lg bg-card border">
                          <p className="text-[10px] uppercase font-medium text-muted-foreground mb-1">Estimated Cost</p>
                          <p className="text-sm font-semibold text-primary">{analysis.addons.exit_strategy.estimated_cost_range}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-card border">
                          <p className="text-[10px] uppercase font-medium text-muted-foreground mb-1">Fastest Exit</p>
                          <p className="text-sm font-semibold text-primary">{analysis.addons.exit_strategy.fastest_exit_timeline}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Exit Routes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><ArrowRight className="h-4 w-4 text-primary" />Exit Routes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysis.addons.exit_strategy.exit_routes.map((route, i) => (
                        <div key={i} className={`p-4 rounded-lg border-l-4 ${
                          route.feasibility === "high" ? "border-l-green-500 bg-green-50/30 dark:bg-green-950/10" :
                          route.feasibility === "moderate" ? "border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10" :
                          route.feasibility === "low" ? "border-l-orange-500 bg-orange-50/30 dark:bg-orange-950/10" :
                          "border-l-red-500 bg-red-50/30 dark:bg-red-950/10"
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">{route.route_name}</span>
                            <Badge variant={
                              route.feasibility === "high" ? "outline" :
                              route.feasibility === "moderate" ? "secondary" :
                              route.feasibility === "low" ? "default" : "destructive"
                            } className="text-[10px] capitalize">{route.feasibility} feasibility</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{route.description}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                            <div className="text-xs"><span className="font-medium">Cost:</span> <span className="text-muted-foreground">{route.estimated_cost}</span></div>
                            <div className="text-xs"><span className="font-medium">Timeline:</span> <span className="text-muted-foreground">{route.timeline}</span></div>
                            <div className="text-xs"><span className="font-medium">Legal Basis:</span> <span className="text-muted-foreground">{route.legal_basis}</span></div>
                          </div>
                          {route.steps.length > 0 && (
                            <div className="mb-2">
                              <p className="text-[10px] uppercase font-medium text-primary mb-1">Steps</p>
                              <ol className="list-decimal list-inside space-y-0.5">
                                {route.steps.map((s, j) => (
                                  <li key={j} className="text-xs text-muted-foreground">{s}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {route.risks.length > 0 && (
                            <div>
                              <p className="text-[10px] uppercase font-medium text-destructive mb-1">Risks</p>
                              <ul className="space-y-0.5">
                                {route.risks.map((r, j) => (
                                  <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />{r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Negotiation Leverage */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Negotiation Leverage Points</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysis.addons.exit_strategy.negotiation_leverage.map((lev, i) => (
                        <div key={i} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{lev.leverage_point}</span>
                            <Badge variant={lev.strength === "strong" ? "outline" : lev.strength === "moderate" ? "secondary" : "default"} className="text-[10px] capitalize">{lev.strength}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{lev.how_to_use}</p>
                          <p className="text-xs italic text-muted-foreground">Counterparty motivation: {lev.counterparty_motivation}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Breach Analysis */}
                  {analysis.addons.exit_strategy.breach_analysis.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" />Breach Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysis.addons.exit_strategy.breach_analysis.map((b, i) => (
                          <div key={i} className="p-3 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{b.party}</span>
                              <Badge variant={b.leverage_level === "strong" ? "outline" : b.leverage_level === "moderate" ? "secondary" : "default"} className="text-[10px] capitalize">{b.leverage_level} leverage</Badge>
                            </div>
                            <ul className="space-y-0.5 mb-2">
                              {b.potential_breaches.map((pb, j) => (
                                <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <XCircle className="h-3 w-3 text-orange-500 shrink-0 mt-0.5" />{pb}
                                </li>
                              ))}
                            </ul>
                            <p className="text-xs"><span className="font-medium">Evidence Needed:</span> <span className="text-muted-foreground">{b.evidence_needed}</span></p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Force Majeure */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Force Majeure Applicability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={analysis.addons.exit_strategy.force_majeure_applicability.applicable ? "outline" : "destructive"} className="text-xs">
                          {analysis.addons.exit_strategy.force_majeure_applicability.applicable ? "Applicable" : "Not Applicable / Missing"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{analysis.addons.exit_strategy.force_majeure_applicability.analysis}</p>
                      {analysis.addons.exit_strategy.force_majeure_applicability.qualifying_events.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase font-medium text-muted-foreground mb-1">Qualifying Events</p>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.addons.exit_strategy.force_majeure_applicability.qualifying_events.map((e, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{e}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis.addons.exit_strategy.force_majeure_applicability.notice_requirements && (
                        <p className="text-xs"><span className="font-medium">Notice Requirements:</span> <span className="text-muted-foreground">{analysis.addons.exit_strategy.force_majeure_applicability.notice_requirements}</span></p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Warning Risks */}
                  {analysis.addons.exit_strategy.warning_risks.length > 0 && (
                    <Card className="border-destructive/20">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" />Exit Risks & Warnings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {analysis.addons.exit_strategy.warning_risks.map((w, i) => (
                          <div key={i} className={`p-3 rounded-lg border ${
                            w.severity === "critical" ? "border-destructive/30 bg-destructive/5" :
                            w.severity === "high" ? "border-orange-300/30 bg-orange-50/30 dark:bg-orange-950/10" :
                            "bg-card"
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{w.risk}</span>
                              <Badge variant={w.severity === "critical" || w.severity === "high" ? "destructive" : w.severity === "medium" ? "default" : "secondary"} className="text-[10px] capitalize">{w.severity}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{w.mitigation}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Mutual Termination Template */}
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Mutual Termination Letter Template</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 rounded-lg bg-accent/30 border font-mono text-xs whitespace-pre-wrap leading-relaxed">
                        {analysis.addons.exit_strategy.mutual_termination_template}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setAnalysis(null); setContractText(""); setCreditsUsed(0); }}>
                Scan Another Contract
              </Button>
            </div>
          </>
        )}

        {/* Past Scans */}
        {!isAnalyzing && !analysis && pastScans && pastScans.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Recent Scans</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pastScans.map((scan: Record<string, unknown>) => (
                  <div key={scan.id as string}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (scan.analysis_json && scan.status === "completed") {
                        setAnalysis(scan.analysis_json as unknown as ContractAnalysis);
                        setCreditsUsed((scan.credits_used as number) || 0);
                      }
                    }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{(scan.contract_type as string) || (scan.filename as string) || "Contract scan"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(scan.created_at as string).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {scan.risk_score != null && (
                        <Badge variant={(scan.risk_score as number) <= 25 ? "outline" : (scan.risk_score as number) <= 50 ? "secondary" : "destructive"}>
                          Risk: {scan.risk_score as number}
                        </Badge>
                      )}
                      <Badge variant={scan.status === "completed" ? "outline" : scan.status === "failed" ? "destructive" : "secondary"} className="capitalize">
                        {scan.status as string}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-[10px] text-muted-foreground/60 text-center">
          AI-generated analysis is for informational purposes only and does not constitute legal advice.
        </p>
      </div>
    </DashboardLayout>
  );
}
